const { createClient } = require("@supabase/supabase-js");
const csv = require("csvtojson");
require("dotenv").config();

const url = process.env.SUPABASE_URL;
const skey = process.env.SERVICE_ROLE;
const supabase = createClient(url, skey);

async function insertLinker() {
  const { data } = await supabase.from("profiles").select("id, nrp");
  const profiles = data;
  const nilai = {
    prelab: 0,
    abstrak: 0,
    pendahuluan_metodologi: 0,
    postlab: 0,
    kesimpulan: 0,
    format: 0,
    waktu: 0,
  };

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
            .insert({
              id: profile.id,
              nrp: aslabs[i],
              kelompok: nama,
              praktikum_role: "aslab",
              kode_praktikum: data,
              minggu: minggu[i],
              nilai,
            });
          console.log(error);
        }
      }

      for (const praktikan of praktikanCSV) {
        if (praktikan.kelompok === nama) {
          for (const profile of profiles) {
            if (profile.nrp == praktikan.nrp) {
              const { error } = await supabase
                .from("user_praktikum_linker")
                .insert({
                  id: profile.id,
                  nrp: praktikan.nrp,
                  kelompok: nama,
                  praktikum_role: praktikan.role,
                  kode_praktikum: data,
                  minggu: minggu[i],
                  nilai,
                });
              console.log(error);
            }
          }
        }
      }
    }
  }
}

insertLinker();
