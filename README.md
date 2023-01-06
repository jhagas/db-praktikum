## Setup The Database (Supabase)

```sql
create table profiles (
    id uuid references auth.users on delete cascade not null primary key,
    nrp text unique,
    full_name text,
    contact text,
    avatar_url text,
    isChanged boolean default false not null
);

alter table profiles enable row level security;
create policy "Profiles only viewable by logged in users" on profiles
  for select to authenticated using (true);
create policy "Users can update own profile." on profiles
  for update using (auth.uid () = id);

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, nrp, contact)
  values ( new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'nrp', new.raw_user_meta_data->>'contact' );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

CREATE TYPE krole AS ENUM('aslab', 'praktikan');

create table matkul (
  id text unique primary key,
  modul_link text
);
create table praktikum (
    id text unique primary key,
    matkul text references matkul,
    judul text
);
create table user_praktikum_linker (
    id uuid references profiles not null,
    kelompok text,
    kode_praktikum text references praktikum,
    praktikum_role krole,
    jadwal timestamp,
    minggu int2,
    nilai jsonb,
    PRIMARY KEY (id, kelompok, kode_praktikum)
);

alter table matkul enable row level security;
create policy "matkul only can be viewed by logged in users" on matkul
  for select to authenticated using (true);

alter table praktikum enable row level security;
create policy "praktikum only can be viewed by logged in users" on praktikum
  for select to authenticated using (true);

alter table user_praktikum_linker enable row level security;

create or replace function linker_update()
returns setof text
language sql
security definer
set search_path = public
stable
as $$
    select kelompok
    from user_praktikum_linker
    where id = auth.uid() and praktikum_role = 'aslab'
$$;

create policy "Aslab can update the kelompok he's on"
  on user_praktikum_linker
  for all using (
    kelompok in (
      select linker_update()
    )
  );

create policy "Praktikan only select themself and aslab"
  on user_praktikum_linker
  for select using (
    auth.uid() = id or 'aslab' = praktikum_role
  );

create or replace function dup_jadwal()
returns setof timestamp
language sql
as $$
    select jadwal
    from user_praktikum_linker
    where praktikum_role = 'aslab'
    GROUP BY jadwal
    HAVING COUNT(*) >= 3;
$$;

-- Set up Storage!
insert into storage.buckets (id, name)
  values ('avatars', 'avatars');

-- Set up access controls for storage.
-- See https://supabase.com/docs/guides/storage#policy-examples for more details.
create policy "Avatar images are accessible to logged in users." on storage.objects
  for all to authenticated using (bucket_id = 'avatars');
```

## Destroy/reset database

```sql
drop table if exists matkul, praktikum, kelompok, user_praktikum_linker;

drop function if exists handle_new_user, linker_update, dup_jadwal;
drop table if exists profiles;

drop type krole;
```

## Quick How-to

1. Make all the csv file required like in `./data` folder in Google Sheet or anywhere else, then download it and rename exactly like this example.
   - One praktikum group only have ONE aslab in one Judul Praktikum
   - Aslab must have contact number
2. Run `npm install`, make sure Node.js is installed on your system.
3. Create `.env` file that contains
   ```
   SUPABASE_URL = your_supabase_url
   SERVICE_ROLE = your_service_role_key
   ```
4. Run `node first.js`
5. Run `node linker.js`
6. Want to delete all data you already registered? Run `node resetAll.js`