
const { createClient } = require("@supabase/supabase-js");
const csv = require("csvtojson");

const url = process.env.SUPABASE_URL;
const skey = process.env.SERVICE_ROLE;
const supabase = createClient(url, skey);

async function insertLinker() {
  const jsonArray = await csv().fromFile("./data/matkul.csv");

  for (const data of jsonArray) {
    const { error } = await supabase
      .from("matkul")
      .insert({ id: data.id, modul_link: data.modul });
    console.log(error);
  }
}

insertLinker();
