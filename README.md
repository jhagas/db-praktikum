## Setup The Database (Supabase)

```sql
create table
  profiles (
    id uuid references auth.users on delete cascade not null primary key,
    nrp text unique,
    full_name text,
    isChanged boolean default false not null
  );

alter table
  profiles enable row level security;

create policy
  "Public profiles are viewable by everyone." on profiles for
select
  using (
    auth.uid () IN (
      SELECT
        id
      FROM
        profiles
    )
  );

create policy
  "Users can insert their own profile." on profiles for insert
with
  check (auth.uid () = id);

create policy
  "Users can update own profile." on profiles for
update
  using (auth.uid () = id);

create function
  public.handle_new_user () returns trigger as $$
begin
  insert into public.profiles (id, full_name, nrp)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'nrp');
  return new;
end;
$$ language plpgsql security definer;

create trigger
  on_auth_user_created
after
  insert on auth.users for each row
execute
  procedure public.handle_new_user ();

create table
  matkul (id text unique primary key, modul_link text);

create table
  praktikum (
    id text unique primary key,
    matkul text references matkul,
    judul text
  );

CREATE TYPE
  krole AS ENUM('aslab', 'praktikan');

create table
  user_praktikum_linker (
    id uuid references profiles not null primary key,
    nrp text references profiles (nrp),
    kelompok text,
    praktikum_role krole,
    kode_praktikum text references praktikum,
    jadwal timestamp,
    minggu int4,
    nilai jsonb
  );

alter table
  matkul enable row level security;
create policy
  "matkul only can be viewed by logged in users" on matkul for
select
  using (
    auth.uid () in (
      select
        id
      from
        profiles
    )
  );

alter table
  praktikum enable row level security;
create policy
  "praktikum only can be viewed by logged in users" on praktikum for
select
  using (
    auth.uid () in (
      select
        id
      from
        profiles
    )
  );

alter table
  user_praktikum_linker enable row level security;
create policy
  "User Information viewable by themself and aslab role." on user_praktikum_linker for
select
  using (
    auth.uid () in (
      select
        id
      from
        profiles
    )
  );

create policy
  "Only aslab can update information." on user_praktikum_linker for
update
  using (
    praktikum_role = 'aslab'
  );
```

## Reset The Database (Run one-by-one and comment everything else)

```sql
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user;
drop table if exists profiles;

drop table if exists matkul, praktikum, kelompok, user_praktikum_linker;
drop type krole;
```

## Quick How-to

1. Make all the csv file required like in `./data` folder in Google Sheet or anywhere else, then download it and rename exactly like this example.
2. Run `npm install`, make sure Node.js is installed on your system.
3. Create `.env` file that contains
   ```
   SUPABASE_URL = your_supabase_url
   SERVICE_ROLE = your_service_role_key
   ```
4. Run `node first.js`
5. Run `node linker.js`