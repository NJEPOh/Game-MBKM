/**
 * File: js/menu.js
 * Deskripsi: Mengelola interaksi Halaman Utama (index.html), Menu Pemilihan 3 Stage (stages.html),
 * Halaman Panduan (petunjuk.html), serta fitur Reset Progress.
 */

function perbaruiTampilanModeAwal(modeOpsional) {
    const modeAktif = modeOpsional || (typeof ambilModeKesulitan === "function" ? ambilModeKesulitan() : "normal");
    const daftarTombolMode = document.querySelectorAll(".tombol-mode");
    const elDeskripsiMode = document.getElementById("deskripsi-mode-awal");

    daftarTombolMode.forEach(function (tombol) {
        const kode = tombol.getAttribute("data-mode");
        const dipilih = kode === modeAktif;
        tombol.classList.toggle("aktif", dipilih);
        tombol.setAttribute("aria-pressed", dipilih ? "true" : "false");
    });

    if (elDeskripsiMode && typeof ambilAturanMode === "function") {
        const aturan = ambilAturanMode(modeAktif);
        elDeskripsiMode.textContent = "Mode " + aturan.label + ": " + aturan.deskripsiSingkat;
    }
}

function perbaruiTampilanProgresAwal(sinkronInputNama) {
    const inputNama = document.getElementById("input-nama-pemain");
    const infoProgres = document.getElementById("info-progres-awal");
    if (!inputNama) {
        return;
    }

    const data = ambilDataPermainan();
    perbaruiTampilanModeAwal(data.modeKesulitan);

    const adaProgres = typeof apakahAdaProgresTersimpan === "function"
        ? apakahAdaProgresTersimpan()
        : Boolean(data.namaPemain);

    if (adaProgres) {
        if (sinkronInputNama !== false && data.namaPemain) {
            inputNama.value = data.namaPemain;
        }
        if (infoProgres) {
            const stat = hitungStatistikTotal();
            const labelMode = ambilAturanMode(data.modeKesulitan).label;
            const namaTampil = data.namaPemain || "Siswa SMK";
            infoProgres.innerHTML =
                "Progres Tersimpan: <span>" +
                namaTampil +
                " (Mode: " +
                labelMode +
                " | " +
                stat.stageSelesai +
                "/3 Stage | Skor: " +
                stat.totalSkor +
                "/" +
                stat.maksSkor +
                ")</span>";
        }
    } else {
        if (sinkronInputNama === true) {
            inputNama.value = "";
        }
        if (infoProgres) {
            infoProgres.innerHTML = "Status Progres: <span>Belum ada progres tersimpan</span>";
        }
    }
}

function tampilkanPesanHalamanAwal(teks, jenis) {
    const kotakPesan = document.getElementById("pesan-validasi-awal");
    if (!kotakPesan) {
        return;
    }
    kotakPesan.textContent = teks;
    kotakPesan.className = "kotak-pesan pesan-" + (jenis || "peringatan");
}

function simpanProfilSaatIniJikaAda(namaFallback) {
    const inputNama = document.getElementById("input-nama-pemain");
    const nama = inputNama ? inputNama.value.trim() : "";
    if (nama) {
        simpanNamaPemain(nama);
    } else if (namaFallback && !ambilDataPermainan().namaPemain) {
        simpanNamaPemain(namaFallback);
    }
    const tombolModeAktif = document.querySelector(".tombol-mode.aktif");
    if (tombolModeAktif && typeof simpanModeKesulitan === "function") {
        simpanModeKesulitan(tombolModeAktif.getAttribute("data-mode"));
    }
}

function inisialisasiHalamanAwal() {
    const inputNama = document.getElementById("input-nama-pemain");
    const tombolMulai = document.getElementById("tombol-mulai");
    const tombolPetunjuk = document.getElementById("tombol-petunjuk");

    if (!inputNama || !tombolMulai) {
        return;
    }

    perbaruiTampilanProgresAwal(true);

    document.querySelectorAll(".tombol-mode").forEach(function (tombol) {
        tombol.addEventListener("click", function () {
            const modeBaru = tombol.getAttribute("data-mode");
            if (typeof simpanModeKesulitan === "function" && modeBaru) {
                simpanModeKesulitan(modeBaru);
                perbaruiTampilanModeAwal(modeBaru);
                perbaruiTampilanProgresAwal(false);
            }
        });
    });

    if (typeof ambilDanHapusNotifikasiReset === "function" && ambilDanHapusNotifikasiReset()) {
        tampilkanPesanHalamanAwal("Progres berhasil direset ke awal!", "sukses");
    }

    function mulaiPermainan() {
        const nama = inputNama.value.trim();
        if (!nama) {
            putarSFX("wrong.mp3");
            tampilkanPesanHalamanAwal("Tulis nama lengkap atau panggilanmu terlebih dahulu ya!", "peringatan");
            inputNama.focus();
            return;
        }
        simpanProfilSaatIniJikaAda(nama);
        pindahHalaman("stages.html", false);
    }

    tombolMulai.addEventListener("click", mulaiPermainan);

    inputNama.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            putarSFX("click.mp3");
            mulaiPermainan();
        }
    });

    if (tombolPetunjuk) {
        tombolPetunjuk.addEventListener("click", function () {
            simpanProfilSaatIniJikaAda("");
            pindahHalaman("petunjuk.html", false);
        });
    }

    // Navigasi materi langsung dari beranda
    document.querySelectorAll(".kartu-nav-materi").forEach(function (kartu) {
        kartu.addEventListener("click", function () {
            const target = kartu.getAttribute("data-target-halaman");
            if (!target) {
                return;
            }
            simpanProfilSaatIniJikaAda("Siswa SMK");
            pindahHalaman(target, true);
        });
        kartu.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                kartu.click();
            }
        });
    });
}

function inisialisasiFiturResetProgres() {
    const tombolReset = document.getElementById("tombol-reset-progres");
    const modalReset = document.getElementById("modal-konfirmasi-reset");
    const tombolBatal = document.getElementById("tombol-batal-reset");
    const tombolKonfirmasi = document.getElementById("tombol-konfirmasi-reset");

    if (!tombolReset || !modalReset || !tombolBatal || !tombolKonfirmasi) {
        return;
    }

    function bukaDialogReset() {
        modalReset.classList.remove("tersembunyi");
        tombolBatal.focus();
    }

    function tutupDialogReset() {
        modalReset.classList.add("tersembunyi");
        tombolReset.focus();
    }

    tombolReset.addEventListener("click", bukaDialogReset);
    tombolBatal.addEventListener("click", tutupDialogReset);

    modalReset.addEventListener("click", function (event) {
        if (event.target === modalReset) {
            putarSFX("click.mp3");
            tutupDialogReset();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !modalReset.classList.contains("tersembunyi")) {
            tutupDialogReset();
        }
    });

    tombolKonfirmasi.addEventListener("click", function () {
        resetPermainan();
        tutupDialogReset();
        putarSFX("correct.mp3");

        const sedangDiHalamanAwal = Boolean(document.getElementById("input-nama-pemain"));
        if (sedangDiHalamanAwal) {
            perbaruiTampilanProgresAwal(true);
            tampilkanPesanHalamanAwal("Progres berhasil direset ke awal!", "sukses");
        } else {
            if (typeof tandaiNotifikasiReset === "function") {
                tandaiNotifikasiReset();
            }
            pindahHalaman("index.html", true);
        }
    });
}

function inisialisasiHalamanPetunjuk() {
    const tombolKembali = document.getElementById("tombol-petunjuk-kembali");
    const tombolLanjut = document.getElementById("tombol-petunjuk-lanjut");

    if (tombolKembali) {
        tombolKembali.addEventListener("click", function () {
            pindahHalaman("index.html", false);
        });
    }
    if (tombolLanjut) {
        tombolLanjut.addEventListener("click", function () {
            pindahHalaman("stages.html", false);
        });
    }
}

function inisialisasiHalamanStages() {
    const wadahStages = document.getElementById("grid-tiga-stage");
    if (!wadahStages) {
        return;
    }

    const data = ambilDataPermainan();
    const stat = hitungStatistikTotal();

    const elNama = document.getElementById("nama-pemain-stages");
    const elProgres = document.getElementById("ringkasan-progres-stages");
    const elBadgeMode = document.getElementById("badge-mode-stages");
    const elPesanMaskot = document.getElementById("pesan-maskot-stages");
    const tombolHasil = document.getElementById("tombol-lihat-hasil-stages");

    if (elNama) {
        elNama.textContent = ambilNamaPemain();
    }
    if (elBadgeMode && typeof terapkanBadgeMode === "function") {
        terapkanBadgeMode(elBadgeMode, true);
    }
    if (elProgres) {
        elProgres.textContent =
            stat.stageSelesai + " dari 3 Stage Selesai | Total Skor: " + stat.totalSkor + " / " + stat.maksSkor;
    }

    const daftarConfig = [
        {
            kode: "sequential",
            nomor: "STAGE 1",
            judul: "Sequential Forest",
            sub: "Algoritma Sequential",
            deskripsi: "Petualangan alam rimba cozy: lompati rintangan, aktifkan CP 1, & buka 3 gerbang urutan aktivitas harian.",
            ikon: "assets/images/common/ui/icon-sequential.png",
            halaman: "stage1-sequential.html",
            satuan: "Gerbang"
        },
        {
            kode: "bubbleSort",
            nomor: "STAGE 2",
            judul: "Bubble Sort Valley",
            sub: "Algoritma Bubble Sort",
            deskripsi: "Lembah eksperimen: aktifkan CP 2, hindari bola energi, & urutkan objek visual di 3 gerbang sorting.",
            ikon: "assets/images/common/ui/icon-bubblesort.png",
            halaman: "stage2-bubblesort.html",
            satuan: "Gerbang"
        },
        {
            kode: "dos",
            nomor: "STAGE 3",
            judul: "DOS Tech Dungeon",
            sub: "DOS Command Line",
            deskripsi: "Dunia teknologi retro: aktifkan CP 3, hindari glitch, & kuasai 11 perintah DOS di 3 gerbang terminal.",
            ikon: "assets/images/common/ui/icon-dos.png",
            halaman: "stage3-dos.html",
            satuan: "Gerbang"
        }
    ];

    // Tentukan stage rekomendasi berikutnya
    let kodeRekomendasi = "sequential";
    for (let i = 0; i < daftarConfig.length; i++) {
        if (data.stage[daftarConfig[i].kode].status !== "selesai") {
            kodeRekomendasi = daftarConfig[i].kode;
            break;
        }
    }

    if (elPesanMaskot) {
        if (stat.stageSelesai === 3) {
            elPesanMaskot.textContent =
                "Selamat! Ketiga stage sudah kamu selesaikan. Buka halaman Hasil Akhir untuk melihat rekap lengkap pencapaianmu!";
        } else {
            const target = daftarConfig.find(function (c) { return c.kode === kodeRekomendasi; });
            elPesanMaskot.textContent =
                "Saran belajar berikutnya: " + target.nomor + " — " + target.judul + ". Kamu juga bisa memilih materi mana saja kapan pun!";
        }
    }

    if (tombolHasil) {
        const adaAktivitas = stat.stageSelesai > 0 || stat.totalSkor > 0;
        tombolHasil.classList.toggle("tersembunyi", !adaAktivitas);
        tombolHasil.addEventListener("click", function () {
            pindahHalaman("hasil.html", true);
        });
    }

    wadahStages.innerHTML = "";
    daftarConfig.forEach(function (cfg) {
        const st = data.stage[cfg.kode];
        const gerbangSelesai = Number(st.gerbangSelesai !== undefined ? st.gerbangSelesai : st.selesaiCount || 0);
        const totalGerbang = Number(st.totalGerbang || 3);
        const koinCount = Number(st.koin || 0);
        const totalKoin = Number(st.totalKoin || 15);
        const persen = totalGerbang > 0 ? Math.round((gerbangSelesai / totalGerbang) * 100) : 0;

        let teksStatus = "Belum Dimulai";
        let kelasStatus = "status-belum";
        let kelasKartu = "";
        let teksTombol = "Mulai " + cfg.nomor;

        if (st.status === "selesai") {
            teksStatus = "Selesai";
            kelasStatus = "status-selesai";
            kelasKartu = "stage-selesai";
            teksTombol = "Main Ulang";
        } else if (st.status === "sedang_berlangsung") {
            teksStatus = "Sedang Berlangsung";
            kelasStatus = "status-berlangsung";
            kelasKartu = "stage-sedang";
            teksTombol = "Lanjutkan";
        }

        if (cfg.kode === kodeRekomendasi && st.status !== "selesai") {
            kelasKartu += " stage-rekomendasi";
        }

        const kartu = document.createElement("article");
        kartu.className = "kartu-stage " + kelasKartu;
        kartu.innerHTML =
            '<span class="nomor-stage-label">' + cfg.nomor + "</span>" +
            '<div class="bungkus-ikon-stage">' +
            '<img src="' + cfg.ikon + '" alt="Ikon ' + cfg.judul + '" width="76" height="76">' +
            "</div>" +
            '<h2 class="judul-stage-kartu">' + cfg.judul + "</h2>" +
            '<span class="lencana-status-stage ' + kelasStatus + '">' + teksStatus + "</span>" +
            '<p class="deskripsi-stage-kartu">' + cfg.deskripsi + "</p>" +
            '<div class="progres-bar-kecil"><div class="progres-bar-isi" style="width: ' + persen + '%;"></div></div>' +
            '<div class="info-progres-stage">' +
            "<span>Gerbang: " + gerbangSelesai + "/" + totalGerbang + " | Koin: " + koinCount + "/" + totalKoin + "</span>" +
            "<span>Skor: " + st.skor + "/100</span>" +
            "</div>" +
            '<button type="button" class="tombol ' +
            (st.status === "selesai" ? "tombol-krem" : "tombol-utama") +
            '" style="width: 100%; margin-top: 6px;" data-sfx-hover data-sfx-click>' +
            teksTombol +
            "</button>";

        kartu.querySelector("button").addEventListener("click", function () {
            pindahHalaman(cfg.halaman, true);
        });

        wadahStages.appendChild(kartu);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    inisialisasiHalamanAwal();
    inisialisasiFiturResetProgres();
    inisialisasiHalamanPetunjuk();
    inisialisasiHalamanStages();
});
