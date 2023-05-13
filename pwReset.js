const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const url = process.env.SUPABASE_URL;
const skey = process.env.SERVICE_ROLE;
const supabase = createClient(url, skey);

async function resetUser(nrp) {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("nrp", nrp)
    .limit(1)
    .single();
  const { data: user, error } = await supabase.auth.admin.updateUserById(data.id, {
    password: String(nrp),
  });
  console.log(user, error)
}

resetUser(5001211158);
