const { createClient } = require("@supabase/supabase-js");
const csv = require("csvtojson");
require("dotenv").config();

const url = process.env.SUPABASE_URL;
const skey = process.env.SERVICE_ROLE;
const supabase = createClient(url, skey);

async function insertLinker() {
  const { data } = await supabase.from("profiles").select("id, nrp");
  const profiles = data;

  const kelompokCSV = await csv().fromFile("./data/kelompok.csv");
  const praktikanCSV = await csv().fromFile("./data/praktikan.csv");

  for (const kelompok of kelompokCSV) {
    const nama = kelompok.kelompok;
    const praktikum = kelompok.praktikum.split(";");
    const aslabs = kelompok.nrp_aslab.split(";");
    const minggu = kelompok.minggu.split(";");

    if (praktikum.length !== aslabs.length) {
      console.log(
        "Error, jumlah Praktikum tidak sesuai dengan jumlah Aslab pada kelompok",
        nama
      );
      return;
    }

    for (const [i, data] of praktikum.entries()) {
      for (const profile of profiles) {
        if (profile.nrp == aslabs[i]) {
          const { error } = await supabase
            .from("user_praktikum_linker")
            .update({
              minggu: minggu[i],
            })
            .eq("id", profile.id)
            .eq("kelompok", nama)
            .eq("praktikum_role", "aslab")
            .eq("kode_praktikum", data);
          console.log(error);
        }
      }

      for (const praktikan of praktikanCSV) {
        if (praktikan.kelompok === nama) {
          for (const profile of profiles) {
            if (profile.nrp == praktikan.nrp) {
              const { error } = await supabase
                .from("user_praktikum_linker")
                .update({
                  minggu: minggu[i],
                })
                .eq("id", profile.id)
                .eq("kelompok", nama)
                .eq("praktikum_role", praktikan.role)
                .eq("kode_praktikum", data);
              console.log(error);
            }
          }
        }
      }
    }
  }
}

insertLinker();
