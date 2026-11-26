/**
 * File: js/dos-vfs.js
 * Deskripsi: Mesin Virtual Filesystem & Parser Perintah DOS murni (aman di memori,
 * tidak mengakses filesystem komputer asli). Mendukung MD/MKDIR, DIR, CD, CD..,
 * COPY CON (dengan input baris & Ctrl+Z), COPY, REN, DEL, RD/RMDIR, TYPE, CLS, HELP.
 */

const DosVFS = {
    buatFilesystemAwal: function () {
        return {
            akar: {
                tipe: "dir",
                nama: "C:",
                anak: {
                    SISWA: {
                        tipe: "dir",
                        nama: "SISWA",
                        anak: {
                            "README.TXT": {
                                tipe: "file",
                                nama: "README.TXT",
                                isi: "Selamat datang di Terminal DOS Virtual Misi Logika!",
                                ukuran: 53
                            }
                        }
                    }
                }
            },
            cwd: ["SISWA"]
        };
    },

    dapatkanPathPrompt: function (fs) {
        if (!fs.cwd || fs.cwd.length === 0) {
            return "C:\\";
        }
        return "C:\\" + fs.cwd.join("\\");
    },

    dapatkanNodeDirektori: function (fs, jalurArr) {
        let node = fs.akar;
        const target = jalurArr || fs.cwd;
        for (let i = 0; i < target.length; i++) {
            const seg = target[i].toUpperCase();
            if (!node.anak || !node.anak[seg] || node.anak[seg].tipe !== "dir") {
                return null;
            }
            node = node.anak[seg];
        }
        return node;
    },

    cariNamaAnakCaseInsensitive: function (dirNode, namaDicari) {
        if (!dirNode || !dirNode.anak || !namaDicari) {
            return null;
        }
        const targetUpper = namaDicari.toUpperCase();
        const keys = Object.keys(dirNode.anak);
        for (let i = 0; i < keys.length; i++) {
            if (keys[i].toUpperCase() === targetUpper) {
                return keys[i];
            }
        }
        return null;
    },

    validasiNamaEntri: function (nama) {
        if (!nama) return false;
        return /^[a-zA-Z0-9_.\-]+$/.test(nama) && nama !== "." && nama !== "..";
    },

    eksekusiPerintah: function (fs, inputMentah) {
        const teks = String(inputMentah || "").trim();
        if (!teks) {
            return { ok: true, aksi: "EMPTY", output: [], dirDipanggil: false };
        }

        // Tangani perintah langsung CD.. atau CD\ tanpa spasi
        let cmd = "";
        let args = [];

        if (/^cd\.\.$/i.test(teks)) {
            cmd = "CD";
            args = [".."];
        } else if (/^cd\\$/i.test(teks)) {
            cmd = "CD";
            args = ["\\"];
        } else {
            const bagian = teks.split(/\s+/);
            cmd = bagian[0].toUpperCase();
            args = bagian.slice(1);
        }

        const dirAktif = this.dapatkanNodeDirektori(fs);

        // 1. HELP
        if (cmd === "HELP" || cmd === "?") {
            return {
                ok: true,
                aksi: "HELP",
                output: [
                    "Daftar Perintah DOS yang Tersedia:",
                    "  MD <folder> / MKDIR <folder>   Membuat direktori baru",
                    "  DIR                            Melihat isi direktori saat ini",
                    "  CD <folder>                    Masuk ke direktori",
                    "  CD..                           Kembali ke direktori induk",
                    "  COPY CON <file>                Membuat & mengisi file (simpan Ctrl+Z + Enter)",
                    "  COPY <sumber> <tujuan>         Menyalin file",
                    "  REN <lama> <baru>              Mengubah nama file",
                    "  DEL <file>                     Menghapus file",
                    "  RD <folder> / RMDIR <folder>   Menghapus direktori kosong",
                    "  TYPE <file>                    Membaca isi file teks",
                    "  CLS                            Membersihkan layar terminal"
                ]
            };
        }

        // 2. CLS
        if (cmd === "CLS") {
            return { ok: true, aksi: "CLS", clear: true, output: [] };
        }

        // 3. DIR
        if (cmd === "DIR") {
            const jalur = this.dapatkanPathPrompt(fs);
            const entriKeys = Object.keys(dirAktif.anak);
            const baris = [
                " Volume in drive C is MISI_LOGIKA",
                " Directory of " + jalur,
                ""
            ];

            let countFile = 0;
            let countDir = 0;
            let totalBytes = 0;

            if (fs.cwd.length > 0) {
                baris.push(" .              <DIR>");
                baris.push(" ..             <DIR>");
                countDir += 2;
            }

            entriKeys.forEach(function (k) {
                const item = dirAktif.anak[k];
                const namaPad = (item.nama + "                ").slice(0, 16);
                if (item.tipe === "dir") {
                    countDir++;
                    baris.push(" " + namaPad + "<DIR>");
                } else {
                    countFile++;
                    const uk = Number(item.ukuran || (item.isi ? item.isi.length : 0));
                    totalBytes += uk;
                    const ukStr = ("       " + uk).slice(-7);
                    baris.push(" " + namaPad + ukStr + " bytes");
                }
            });

            baris.push("        " + countFile + " file(s)    " + totalBytes + " bytes");
            baris.push("        " + countDir + " dir(s)");

            return { ok: true, aksi: "DIR", output: baris, dirDipanggil: true };
        }

        // 4. MD / MKDIR
        if (cmd === "MD" || cmd === "MKDIR") {
            if (args.length === 0) {
                return { ok: false, aksi: "MD", output: ["Sintaks perintah kurang lengkap. Contoh: MD LATIHAN"] };
            }
            const namaBaru = args[0];
            if (!this.validasiNamaEntri(namaBaru)) {
                return { ok: false, aksi: "MD", output: ["Nama direktori tidak valid: " + namaBaru] };
            }
            if (this.cariNamaAnakCaseInsensitive(dirAktif, namaBaru)) {
                return { ok: false, aksi: "MD", output: ["Subdirektori atau file '" + namaBaru + "' sudah ada."] };
            }
            const keyUpper = namaBaru.toUpperCase();
            dirAktif.anak[keyUpper] = {
                tipe: "dir",
                nama: namaBaru,
                anak: {}
            };
            return { ok: true, aksi: "MD", target: namaBaru, output: [] };
        }

        // 5. CD
        if (cmd === "CD") {
            if (args.length === 0) {
                return { ok: true, aksi: "CD", output: [this.dapatkanPathPrompt(fs)] };
            }
            const tujuan = args[0];
            if (tujuan === "..") {
                if (fs.cwd.length === 0) {
                    return { ok: false, aksi: "CD..", output: ["Sudah berada di direktori paling atas (C:\\)."] };
                }
                fs.cwd.pop();
                return { ok: true, aksi: "CD..", output: [] };
            }
            if (tujuan === "\\") {
                fs.cwd = [];
                return { ok: true, aksi: "CD\\", output: [] };
            }
            const keyAda = this.cariNamaAnakCaseInsensitive(dirAktif, tujuan);
            if (!keyAda || dirAktif.anak[keyAda].tipe !== "dir") {
                return { ok: false, aksi: "CD", output: ["Direktori '" + tujuan + "' tidak ditemukan."] };
            }
            fs.cwd.push(dirAktif.anak[keyAda].nama);
            return { ok: true, aksi: "CD", target: dirAktif.anak[keyAda].nama, output: [] };
        }

        // 6. COPY CON & COPY
        if (cmd === "COPY") {
            if (args.length >= 2 && args[0].toUpperCase() === "CON") {
                const namaFile = args[1];
                if (!this.validasiNamaEntri(namaFile)) {
                    return { ok: false, aksi: "COPY_CON", output: ["Nama file tidak valid: " + namaFile] };
                }
                const keyAda = this.cariNamaAnakCaseInsensitive(dirAktif, namaFile);
                if (keyAda && dirAktif.anak[keyAda].tipe === "dir") {
                    return { ok: false, aksi: "COPY_CON", output: ["Nama '" + namaFile + "' sudah digunakan oleh direktori."] };
                }
                return {
                    ok: true,
                    aksi: "START_COPY_CON",
                    namaFile: namaFile,
                    output: ["[Mode COPY CON aktif — ketik isi file lalu tekan CTRL+Z dan Enter untuk menyimpan]"]
                };
            }

            if (args.length < 2) {
                return {
                    ok: false,
                    aksi: "COPY",
                    output: ["Sintaks COPY tidak lengkap. Contoh: COPY catatan.txt salinan.txt atau COPY CON catatan.txt"]
                };
            }

            const sumber = args[0];
            const tujuan = args[1];
            const keySumber = this.cariNamaAnakCaseInsensitive(dirAktif, sumber);
            if (!keySumber || dirAktif.anak[keySumber].tipe !== "file") {
                return { ok: false, aksi: "COPY", output: ["File sumber '" + sumber + "' tidak ditemukan."] };
            }
            if (!this.validasiNamaEntri(tujuan)) {
                return { ok: false, aksi: "COPY", output: ["Nama file tujuan tidak valid: " + tujuan] };
            }
            const keyTujuanAda = this.cariNamaAnakCaseInsensitive(dirAktif, tujuan);
            if (keyTujuanAda && dirAktif.anak[keyTujuanAda].tipe === "dir") {
                return { ok: false, aksi: "COPY", output: ["Tujuan adalah direktori, gunakan nama file."] };
            }

            const fileSumber = dirAktif.anak[keySumber];
            if (keyTujuanAda) {
                delete dirAktif.anak[keyTujuanAda];
            }
            dirAktif.anak[tujuan.toUpperCase()] = {
                tipe: "file",
                nama: tujuan,
                isi: fileSumber.isi,
                ukuran: fileSumber.isi.length
            };
            return {
                ok: true,
                aksi: "COPY",
                sumber: fileSumber.nama,
                tujuan: tujuan,
                output: ["        1 file(s) copied."]
            };
        }

        // 7. REN / RENAME
        if (cmd === "REN" || cmd === "RENAME") {
            if (args.length < 2) {
                return { ok: false, aksi: "REN", output: ["Sintaks REN kurang lengkap. Contoh: REN salinan.txt tugas.txt"] };
            }
            const lama = args[0];
            const baru = args[1];
            const keyLama = this.cariNamaAnakCaseInsensitive(dirAktif, lama);
            if (!keyLama) {
                return { ok: false, aksi: "REN", output: ["File '" + lama + "' tidak ditemukan."] };
            }
            if (!this.validasiNamaEntri(baru)) {
                return { ok: false, aksi: "REN", output: ["Nama file baru tidak valid: " + baru] };
            }
            if (this.cariNamaAnakCaseInsensitive(dirAktif, baru)) {
                return { ok: false, aksi: "REN", output: ["File atau direktori bernama '" + baru + "' sudah ada."] };
            }
            const node = dirAktif.anak[keyLama];
            delete dirAktif.anak[keyLama];
            node.nama = baru;
            dirAktif.anak[baru.toUpperCase()] = node;
            return { ok: true, aksi: "REN", lama: lama, baru: baru, output: [] };
        }

        // 8. DEL / ERASE
        if (cmd === "DEL" || cmd === "ERASE") {
            if (args.length === 0) {
                return { ok: false, aksi: "DEL", output: ["Sintaks DEL kurang lengkap. Contoh: DEL tugas.txt"] };
            }
            const target = args[0];
            const keyAda = this.cariNamaAnakCaseInsensitive(dirAktif, target);
            if (!keyAda) {
                return { ok: false, aksi: "DEL", output: ["File '" + target + "' tidak ditemukan."] };
            }
            if (dirAktif.anak[keyAda].tipe === "dir") {
                return { ok: false, aksi: "DEL", output: ["'" + target + "' adalah direktori. Gunakan RD/RMDIR untuk menghapus folder kosong."] };
            }
            delete dirAktif.anak[keyAda];
            return { ok: true, aksi: "DEL", target: target, output: [] };
        }

        // 9. RD / RMDIR
        if (cmd === "RD" || cmd === "RMDIR") {
            if (args.length === 0) {
                return { ok: false, aksi: "RD", output: ["Sintaks RD kurang lengkap. Contoh: RD LATIHAN"] };
            }
            const target = args[0];
            const keyAda = this.cariNamaAnakCaseInsensitive(dirAktif, target);
            if (!keyAda || dirAktif.anak[keyAda].tipe !== "dir") {
                return { ok: false, aksi: "RD", output: ["Direktori '" + target + "' tidak ditemukan."] };
            }
            const isiAnak = Object.keys(dirAktif.anak[keyAda].anak);
            if (isiAnak.length > 0) {
                return {
                    ok: false,
                    aksi: "RD",
                    output: ["Direktori tidak kosong! Hapus seluruh file di dalam '" + target + "' terlebih dahulu sebelum menghapus folder."]
                };
            }
            delete dirAktif.anak[keyAda];
            return { ok: true, aksi: "RD", target: target, output: [] };
        }

        // 10. TYPE
        if (cmd === "TYPE") {
            if (args.length === 0) {
                return { ok: false, aksi: "TYPE", output: ["Sintaks TYPE kurang lengkap. Contoh: TYPE catatan.txt"] };
            }
            const target = args[0];
            const keyAda = this.cariNamaAnakCaseInsensitive(dirAktif, target);
            if (!keyAda || dirAktif.anak[keyAda].tipe !== "file") {
                return { ok: false, aksi: "TYPE", output: ["File '" + target + "' tidak ditemukan."] };
            }
            const isi = dirAktif.anak[keyAda].isi || "(file kosong)";
            return { ok: true, aksi: "TYPE", output: isi.split("\n") };
        }

        return {
            ok: false,
            aksi: "UNKNOWN",
            output: ["'" + cmd + "' tidak dikenali sebagai perintah DOS. Ketik HELP untuk melihat panduan perintah."]
        };
    },

    simpanFileCopyCon: function (fs, namaFile, isiTeks) {
        const dirAktif = this.dapatkanNodeDirektori(fs);
        const keyAda = this.cariNamaAnakCaseInsensitive(dirAktif, namaFile);
        if (keyAda) {
            delete dirAktif.anak[keyAda];
        }
        const isiFinal = String(isiTeks || "").trim();
        dirAktif.anak[namaFile.toUpperCase()] = {
            tipe: "file",
            nama: namaFile,
            isi: isiFinal,
            ukuran: isiFinal.length
        };
        return {
            ok: true,
            aksi: "FINISH_COPY_CON",
            namaFile: namaFile,
            output: ["        1 file(s) copied."]
        };
    }
};

/**
 * Daftar 10 Misi Bertahap Stage 3 DOS yang mencakup seluruh 11 materi wajib.
 */
const MISI_STAGE_DOS = [
    {
        id: "dos-01",
        judul: "Misi 1: Membuat Folder (MD / MKDIR)",
        materi: "MD atau MKDIR",
        instruksi: 'Buat sebuah direktori baru bernama "LATIHAN" di dalam C:\\SISWA.',
        petunjuk: "Ketik perintah: MD LATIHAN (atau MKDIR LATIHAN) lalu tekan Enter.",
        siapkanPrasyarat: function (fs) {
            fs.cwd = ["SISWA"];
        },
        cekSelesai: function (fs) {
            const siswa = DosVFS.dapatkanNodeDirektori(fs, ["SISWA"]);
            return Boolean(siswa && DosVFS.cariNamaAnakCaseInsensitive(siswa, "LATIHAN"));
        }
    },
    {
        id: "dos-02",
        judul: "Misi 2: Melihat Isi Direktori (DIR)",
        materi: "DIR",
        instruksi: 'Tampilkan isi direktori C:\\SISWA untuk memastikan folder "LATIHAN" sudah ada.',
        petunjuk: "Ketik perintah: DIR lalu tekan Enter.",
        siapkanPrasyarat: function (fs) {
            fs.cwd = ["SISWA"];
            const siswa = DosVFS.dapatkanNodeDirektori(fs, ["SISWA"]);
            if (!DosVFS.cariNamaAnakCaseInsensitive(siswa, "LATIHAN")) {
                siswa.anak["LATIHAN"] = { tipe: "dir", nama: "LATIHAN", anak: {} };
            }
        },
        cekSelesai: function (fs, hasilTerakhir) {
            const siswa = DosVFS.dapatkanNodeDirektori(fs, ["SISWA"]);
            return Boolean(
                hasilTerakhir &&
                hasilTerakhir.aksi === "DIR" &&
                siswa &&
                DosVFS.cariNamaAnakCaseInsensitive(siswa, "LATIHAN")
            );
        }
    },
    {
        id: "dos-03",
        judul: "Misi 3: Masuk ke Direktori (CD)",
        materi: "CD",
        instruksi: 'Pindah masuk ke dalam direktori "LATIHAN" yang telah dibuat.',
        petunjuk: "Ketik perintah: CD LATIHAN lalu tekan Enter.",
        siapkanPrasyarat: function (fs) {
            fs.cwd = ["SISWA"];
            const siswa = DosVFS.dapatkanNodeDirektori(fs, ["SISWA"]);
            if (!DosVFS.cariNamaAnakCaseInsensitive(siswa, "LATIHAN")) {
                siswa.anak["LATIHAN"] = { tipe: "dir", nama: "LATIHAN", anak: {} };
            }
        },
        cekSelesai: function (fs) {
            return fs.cwd.length === 2 && fs.cwd[1].toUpperCase() === "LATIHAN";
        }
    },
    {
        id: "dos-04",
        judul: "Misi 4: Membuat, Mengisi & Menyimpan File (COPY CON)",
        materi: "COPY CON + Teks + CTRL + Z",
        instruksi: 'Di dalam C:\\SISWA\\LATIHAN, buat file "catatan.txt" menggunakan COPY CON, ketik teks isinya, lalu simpan memakai CTRL+Z dan Enter.',
        petunjuk: "1) Ketik: COPY CON catatan.txt lalu Enter. 2) Ketik bebas isi catatanmu lalu Enter. 3) Tekan CTRL+Z (atau tombol ^Z + Enter) untuk menyimpan!",
        siapkanPrasyarat: function (fs) {
            const siswa = DosVFS.dapatkanNodeDirektori(fs, ["SISWA"]);
            if (!DosVFS.cariNamaAnakCaseInsensitive(siswa, "LATIHAN")) {
                siswa.anak["LATIHAN"] = { tipe: "dir", nama: "LATIHAN", anak: {} };
            }
            fs.cwd = ["SISWA", siswa.anak["LATIHAN"] ? siswa.anak["LATIHAN"].nama : "LATIHAN"];
        },
        cekSelesai: function (fs) {
            const lat = DosVFS.dapatkanNodeDirektori(fs, ["SISWA", "LATIHAN"]);
            if (!lat) return false;
            const key = DosVFS.cariNamaAnakCaseInsensitive(lat, "catatan.txt");
            return Boolean(key && lat.anak[key].tipe === "file" && lat.anak[key].isi.trim().length > 0);
        }
    },
    {
        id: "dos-05",
        judul: "Misi 5: Menyalin File (COPY)",
        materi: "COPY",
        instruksi: 'Salin file "catatan.txt" menjadi file baru bernama "salinan.txt" di folder LATIHAN.',
        petunjuk: "Ketik perintah: COPY catatan.txt salinan.txt lalu tekan Enter.",
        siapkanPrasyarat: function (fs) {
            const siswa = DosVFS.dapatkanNodeDirektori(fs, ["SISWA"]);
            if (!DosVFS.cariNamaAnakCaseInsensitive(siswa, "LATIHAN")) {
                siswa.anak["LATIHAN"] = { tipe: "dir", nama: "LATIHAN", anak: {} };
            }
            const lat = siswa.anak["LATIHAN"];
            if (!DosVFS.cariNamaAnakCaseInsensitive(lat, "catatan.txt")) {
                lat.anak["CATATAN.TXT"] = { tipe: "file", nama: "catatan.txt", isi: "Belajar DOS Dasar", ukuran: 17 };
            }
            fs.cwd = ["SISWA", lat.nama];
        },
        cekSelesai: function (fs) {
            const lat = DosVFS.dapatkanNodeDirektori(fs, ["SISWA", "LATIHAN"]);
            return Boolean(
                lat &&
                DosVFS.cariNamaAnakCaseInsensitive(lat, "catatan.txt") &&
                DosVFS.cariNamaAnakCaseInsensitive(lat, "salinan.txt")
            );
        }
    },
    {
        id: "dos-06",
        judul: "Misi 6: Mengubah Nama File (REN)",
        materi: "REN",
        instruksi: 'Ubah nama file "salinan.txt" menjadi "tugas.txt".',
        petunjuk: "Ketik perintah: REN salinan.txt tugas.txt lalu tekan Enter.",
        siapkanPrasyarat: function (fs) {
            MISI_STAGE_DOS[4].siapkanPrasyarat(fs);
            const lat = DosVFS.dapatkanNodeDirektori(fs, ["SISWA", "LATIHAN"]);
            if (!DosVFS.cariNamaAnakCaseInsensitive(lat, "salinan.txt")) {
                lat.anak["SALINAN.TXT"] = { tipe: "file", nama: "salinan.txt", isi: "Belajar DOS Dasar", ukuran: 17 };
            }
        },
        cekSelesai: function (fs) {
            const lat = DosVFS.dapatkanNodeDirektori(fs, ["SISWA", "LATIHAN"]);
            return Boolean(
                lat &&
                !DosVFS.cariNamaAnakCaseInsensitive(lat, "salinan.txt") &&
                DosVFS.cariNamaAnakCaseInsensitive(lat, "tugas.txt")
            );
        }
    },
    {
        id: "dos-07",
        judul: "Misi 7: Menghapus File (DEL)",
        materi: "DEL",
        instruksi: 'Hapus file "tugas.txt" dari dalam direktori LATIHAN.',
        petunjuk: "Ketik perintah: DEL tugas.txt lalu tekan Enter.",
        siapkanPrasyarat: function (fs) {
            MISI_STAGE_DOS[4].siapkanPrasyarat(fs);
            const lat = DosVFS.dapatkanNodeDirektori(fs, ["SISWA", "LATIHAN"]);
            if (!DosVFS.cariNamaAnakCaseInsensitive(lat, "tugas.txt")) {
                lat.anak["TUGAS.TXT"] = { tipe: "file", nama: "tugas.txt", isi: "Belajar DOS Dasar", ukuran: 17 };
            }
        },
        cekSelesai: function (fs) {
            const lat = DosVFS.dapatkanNodeDirektori(fs, ["SISWA", "LATIHAN"]);
            return Boolean(lat && !DosVFS.cariNamaAnakCaseInsensitive(lat, "tugas.txt"));
        }
    },
    {
        id: "dos-08",
        judul: "Misi 8: Mengosongkan Folder & Kembali ke Induk (DEL + CD..)",
        materi: "DEL & CD..",
        instruksi: 'Hapus sisa file "catatan.txt" agar folder LATIHAN benar-benar kosong, lalu kembali ke direktori induk C:\\SISWA dengan CD..',
        petunjuk: "Jalankan berurutan: 1) DEL catatan.txt  2) CD..",
        siapkanPrasyarat: function (fs) {
            MISI_STAGE_DOS[4].siapkanPrasyarat(fs);
        },
        cekSelesai: function (fs) {
            const lat = DosVFS.dapatkanNodeDirektori(fs, ["SISWA", "LATIHAN"]);
            const kosong = lat && Object.keys(lat.anak).length === 0;
            const diInduk = fs.cwd.length === 1 && fs.cwd[0].toUpperCase() === "SISWA";
            return Boolean(kosong && diInduk);
        }
    },
    {
        id: "dos-09",
        judul: "Misi 9: Menghapus Direktori Kosong (RD / RMDIR)",
        materi: "RD atau RMDIR",
        instruksi: 'Direktori "LATIHAN" sekarang sudah kosong. Hapus direktori "LATIHAN" dari C:\\SISWA.',
        petunjuk: "Ketik perintah: RD LATIHAN (atau RMDIR LATIHAN) lalu tekan Enter.",
        siapkanPrasyarat: function (fs) {
            fs.cwd = ["SISWA"];
            const siswa = DosVFS.dapatkanNodeDirektori(fs, ["SISWA"]);
            siswa.anak["LATIHAN"] = { tipe: "dir", nama: "LATIHAN", anak: {} };
        },
        cekSelesai: function (fs) {
            const siswa = DosVFS.dapatkanNodeDirektori(fs, ["SISWA"]);
            return Boolean(siswa && !DosVFS.cariNamaAnakCaseInsensitive(siswa, "LATIHAN"));
        }
    },
    {
        id: "dos-10",
        judul: "Misi 10: Kombinasi Perintah Proyek Akhir",
        materi: "Kombinasi MD, CD, COPY CON, COPY & DIR",
        instruksi: 'Di C:\\SISWA, buat folder "PROYEK", masuk ke dalamnya, buat file "laporan.txt" via COPY CON, salin menjadi "arsip.txt", dan jalankan DIR!',
        petunjuk: "Urutan: MD PROYEK -> CD PROYEK -> COPY CON laporan.txt (isi + Ctrl+Z) -> COPY laporan.txt arsip.txt -> DIR",
        siapkanPrasyarat: function (fs) {
            fs.cwd = ["SISWA"];
        },
        cekSelesai: function (fs, hasilTerakhir) {
            const proyek = DosVFS.dapatkanNodeDirektori(fs, ["SISWA", "PROYEK"]);
            if (!proyek) return false;
            const f1 = DosVFS.cariNamaAnakCaseInsensitive(proyek, "laporan.txt");
            const f2 = DosVFS.cariNamaAnakCaseInsensitive(proyek, "arsip.txt");
            const diProyek = fs.cwd.length === 2 && fs.cwd[1].toUpperCase() === "PROYEK";
            return Boolean(f1 && f2 && diProyek && hasilTerakhir && hasilTerakhir.aksi === "DIR");
        }
    }
];
