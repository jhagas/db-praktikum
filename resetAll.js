const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();
const url = process.env.SUPABASE_URL;
const skey = process.env.SERVICE_ROLE;

const supabase = createClient(url, skey);

async function reset() {
  const { data } = await supabase.from("profiles").select("id");
  const datas = data;

  for (const idJSON of datas) {
    const { error } = await supabase.auth.admin.deleteUser(idJSON.id);
    console.log(error);
  }
  const { error1 } = await supabase.from("matkul").delete().neq("id", "a");
  const { error2 } = await supabase.from("praktikum").delete().neq("id", "a");
  const { error3 } = await supabase.from("user_praktikum_linker").delete().neq("id", "a");
  console.log(error1);
  console.log(error2);
  console.log(error3);
}
reset();
