const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const url = process.env.SUPABASE_URL;
const skey = process.env.SERVICE_ROLE;
const supabase = createClient(url, skey);

async function gantiMinggu() {
  const c = await supabase
    .from("user_praktikum_linker")
    .update({ minggu: 11 })
    .eq("minggu", 10);
  const b = await supabase
    .from("user_praktikum_linker")
    .update({ minggu: 10 })
    .eq("minggu", 9);
  const a = await supabase
    .from("user_praktikum_linker")
    .update({ minggu: 9 })
    .eq("minggu", 8);

  console.log(a.error, b.error, c.error);
}
gantiMinggu()