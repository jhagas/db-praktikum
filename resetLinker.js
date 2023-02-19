const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();
const url = process.env.SUPABASE_URL;
const skey = process.env.SERVICE_ROLE;

const supabase = createClient(url, skey);

async function reset() {
  await supabase.from("user_praktikum_linker").delete().neq("kelompok", "jksjlkahkshkah");
}

reset();
