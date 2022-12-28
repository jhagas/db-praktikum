const { createClient } = require("@supabase/supabase-js");
const csv = require("csvtojson");
require('dotenv').config();
const url = process.env.SUPABASE_URL;
const skey = process.env.SERVICE_ROLE;

const supabase = createClient(url, skey);

async function first() {
  const user = await csv().fromFile("./data/profiles.csv");
  const matkul = await csv().fromFile("./data/matkul.csv");
  const judul = await csv().fromFile("./data/judul.csv");

  for (const data of user) {
    const { error } = await supabase.auth.admin.createUser({
      email: data.nrp + "@praktikum.its.ac.id",
      password: data.nrp,
      user_metadata: { full_name: data.nama, nrp: data.nrp },
      email_confirm: true,
    });
    console.log(error);
  }
  for (const data of matkul) {
    const { error } = await supabase
      .from("matkul")
      .insert({ id: data.id, modul_link: data.modul });
    console.log(error);
  }
  for (const data of judul) {
    const { error } = await supabase
      .from("praktikum")
      .insert({ id: data.kode, matkul: data.matkul, judul: data.judul });
    console.log(error);
  }
}

first();