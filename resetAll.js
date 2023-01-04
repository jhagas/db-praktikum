const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();
const url = process.env.SUPABASE_URL;
const skey = process.env.SERVICE_ROLE;

const supabase = createClient(url, skey);

async function reset() {
  await supabase.from("user_praktikum_linker").delete().neq("kelompok", "jksjlkahkshkah");

  await supabase.from("praktikum").delete().neq("id", "a");
  
  await supabase.from("matkul").delete().neq("id", "a");

  const { data } = await supabase.from("profiles").select("id");
  const datas = data;
  for (const idJSON of datas) {
    const { error } = await supabase.auth.admin.deleteUser(idJSON.id);
    console.log(error);
  }
}

reset();
