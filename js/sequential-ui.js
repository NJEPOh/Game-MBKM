/**
 * File: js/sequential-ui.js
 * Deskripsi: Pengendali Stage 1 (Sequential Forest Platformer):
 * memilih 3 aktivitas unik dari bank 20 variasi kegiatan untuk 3 Gerbang Soal,
 * menyediakan interaksi drag & drop + tombol pindah pada Modal Gerbang Soal,
 * menerapkan penalti -1 HP pada jawaban salah, dan membuka gerbang saat benar.
 */

let daftarKegiatanSeq = [];
let soalGerbangSeq = {};
let kegiatanAktifModal = null;
let susunanLangkahAktif = [];
let hasilPeriksaTerakhir = null;
let gateAktifSeq = null;
let runnerSeq = null;
let indeksDragAsal = null;

let totalBenarSeq = 0;
let totalSalahSeq = 0;

async function muatBankKegiatanSequential() {
    if (Array.isArray(DATA_CADANGAN_SEQUENTIAL) && DATA_CADANGAN_SEQUENTIAL.length === 20) {
        try {
            const resp = await fetch("data/sequential.json");
            if (resp.ok) {
                const json = await resp.json();
                if (json && Array.isArray(json.kegiatan) && json.kegiatan.length === 20) {
                    daftarKegiatanSeq = json.kegiatan;
                    return;
                }
            }
        } catch (_) {
            // Fallback ke DATA_CADANGAN_SEQUENTIAL pada mode file://
        }
        daftarKegiatanSeq = DATA_CADANGAN_SEQUENTIAL.slice();
    }
}

function pilihTigaKegiatanDari20() {
    const grup1 = daftarKegiatanSeq.slice(0, 6);   // Pagi & Kebersihan
    const grup2 = daftarKegiatanSeq.slice(6, 12);  // Dapur & Memasak
    const grup3 = daftarKegiatanSeq.slice(12, 20); // Harian & Teknologi
    const acakSatu = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };

    soalGerbangSeq = {
        "seq-gate-1": acakSatu(grup1),
        "seq-gate-2": acakSatu(grup2),
        "seq-gate-3": acakSatu(grup3)
    };
}

function renderDaftarLangkahSeq() {
    const wadah = document.getElementById("daftar-langkah-seq");
    if (!wadah) return;
    wadah.innerHTML = "";

    susunanLangkahAktif.forEach(function (item, idx) {
        const kartu = document.createElement("div");
        kartu.className = "kartu-langkah-seq";
        kartu.setAttribute("draggable", "true");
        kartu.dataset.indeks = String(idx);

        if (hasilPeriksaTerakhir && Array.isArray(hasilPeriksaTerakhir.statusPerPosisi)) {
            kartu.classList.add(hasilPeriksaTerakhir.statusPerPosisi[idx] ? "posisi-benar" : "posisi-salah");
        }

        kartu.innerHTML =
            '<span class="pegangan-drag" title="Seret untuk mengurutkan"><img src="assets/images/stage-1-sequential/objects/drag-grip.png" alt="::"></span>' +
            '<span class="nomor-urutan-seq">' + (idx + 1) + "</span>" +
            '<span class="teks-langkah-seq">' + item.teks + "</span>" +
            '<div class="kontrol-geser-seq">' +
            '<button type="button" class="tombol-geser-seq" data-arah="-1" aria-label="Pindah ke atas"' + (idx === 0 ? " disabled" : "") + ">&#9650;</button>" +
            '<button type="button" class="tombol-geser-seq" data-arah="1" aria-label="Pindah ke bawah"' + (idx === susunanLangkahAktif.length - 1 ? " disabled" : "") + ">&#9660;</button>" +
            "</div>";

        const btns = kartu.querySelectorAll(".tombol-geser-seq");
        btns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                const arah = Number(btn.getAttribute("data-arah"));
                susunanLangkahAktif = SequentialLogic.pindahkanLangkah(susunanLangkahAktif, idx, idx + arah);
                hasilPeriksaTerakhir = null;
                if (typeof putarSFX === "function") putarSFX("drop.mp3");
                renderDaftarLangkahSeq();
            });
        });

        kartu.addEventListener("dragstart", function (ev) {
            indeksDragAsal = idx;
            kartu.classList.add("sedang-diseret");
            if (ev.dataTransfer) ev.dataTransfer.setData("text/plain", String(idx));
        });
        kartu.addEventListener("dragend", function () {
            kartu.classList.remove("sedang-diseret");
            indeksDragAsal = null;
        });
        kartu.addEventListener("dragover", function (ev) {
            ev.preventDefault();
            kartu.classList.add("target-jatuh");
        });
        kartu.addEventListener("dragleave", function () {
            kartu.classList.remove("target-jatuh");
        });
        kartu.addEventListener("drop", function (ev) {
            ev.preventDefault();
            kartu.classList.remove("target-jatuh");
            if (indeksDragAsal !== null && indeksDragAsal !== idx) {
                susunanLangkahAktif = SequentialLogic.pindahkanLangkah(susunanLangkahAktif, indeksDragAsal, idx);
                hasilPeriksaTerakhir = null;
                if (typeof putarSFX === "function") putarSFX("drop.mp3");
                renderDaftarLangkahSeq();
            }
        });

        wadah.appendChild(kartu);
    });
}

function bukaModalSoalSequential(gate, runner) {
    gateAktifSeq = gate;
    runnerSeq = runner;
    if (!soalGerbangSeq[gate.id]) {
        pilihTigaKegiatanDari20();
    }
    kegiatanAktifModal = soalGerbangSeq[gate.id] || daftarKegiatanSeq[gate.index] || daftarKegiatanSeq[0];
    susunanLangkahAktif = SequentialLogic.acakLangkah(kegiatanAktifModal.langkah);
    hasilPeriksaTerakhir = null;

    document.getElementById("lencana-gerbang-seq").textContent = "Gerbang Soal " + (gate.index + 1) + " / 3";
    document.getElementById("judul-gerbang-seq").textContent = "Buka " + gate.label + ": Urutkan Kegiatan";
    document.getElementById("kategori-kegiatan-seq").textContent = kegiatanAktifModal.kategori;
    document.getElementById("gambar-kegiatan-seq").src = kegiatanAktifModal.gambar;
    document.getElementById("judul-kegiatan-seq").textContent = kegiatanAktifModal.judul;
    document.getElementById("deskripsi-kegiatan-seq").textContent = kegiatanAktifModal.deskripsi;
    document.getElementById("teks-petunjuk-inline-seq").classList.add("tersembunyi");
    document.getElementById("kotak-penjelasan-seq").classList.add("tersembunyi");
    document.getElementById("tombol-buka-gerbang-seq").classList.add("tersembunyi");
    document.getElementById("tombol-periksa-seq").classList.remove("tersembunyi");
    document.getElementById("tombol-periksa-seq").disabled = false;
    document.getElementById("tombol-acak-ulang-seq").disabled = false;

    const msg = document.getElementById("pesan-umpan-balik-seq");
    msg.className = "kotak-pesan pesan-info";
    msg.textContent = "Seret kartu (drag & drop) atau pakai ▲/▼ lalu klik Periksa Jawaban!";

    runner.perbaruiHUD();
    renderDaftarLangkahSeq();
    document.getElementById("modal-soal-platformer").classList.remove("tersembunyi");
}

function periksaJawabanGerbangSeq() {
    if (!kegiatanAktifModal || !runnerSeq || !gateAktifSeq) return;
    const hasil = SequentialLogic.periksaUrutan(susunanLangkahAktif);
    hasilPeriksaTerakhir = hasil;
    renderDaftarLangkahSeq();

    const msg = document.getElementById("pesan-umpan-balik-seq");
    if (hasil.semuaBenar) {
        totalBenarSeq++;
        if (typeof putarSFX === "function") putarSFX("correct.mp3");
        msg.className = "kotak-pesan pesan-sukses";
        msg.textContent = "Benar! Urutan langkah sudah tepat dan gerbang siap dibuka.";
        document.getElementById("teks-penjelasan-seq").textContent = kegiatanAktifModal.penjelasan;
        document.getElementById("kotak-penjelasan-seq").classList.remove("tersembunyi");
        document.getElementById("tombol-periksa-seq").classList.add("tersembunyi");
        document.getElementById("tombol-buka-gerbang-seq").classList.remove("tersembunyi");
    } else {
        totalSalahSeq++;
        const sisaHp = runnerSeq.penaltiJawabanSalah({ salahCount: totalSalahSeq, benarCount: totalBenarSeq });
        msg.className = "kotak-pesan pesan-bahaya";
        if (sisaHp <= 0) {
            msg.textContent = "Urutan masih salah dan HP habis! Mempersiapkan respawn...";
            document.getElementById("tombol-periksa-seq").disabled = true;
            document.getElementById("tombol-acak-ulang-seq").disabled = true;
        } else {
            msg.textContent =
                "Urutan belum tepat (" + hasil.jumlahTepat + " dari " + hasil.total +
                " posisi benar). HP berkurang 1 (Sisa: " + sisaHp + "). Perbaiki kartu merah dan coba lagi!";
        }
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    const elNama = document.getElementById("nama-pemain-seq");
    if (elNama && typeof ambilNamaPemain === "function") elNama.textContent = ambilNamaPemain();
    const elMode = document.getElementById("badge-mode-seq");
    if (elMode && typeof terapkanBadgeMode === "function") terapkanBadgeMode(elMode, false);

    const saved = typeof ambilStage === "function" ? ambilStage("sequential") : null;
    if (saved) {
        totalBenarSeq = Number(saved.benarCount || 0);
        totalSalahSeq = Number(saved.salahCount || 0);
    }

    await muatBankKegiatanSequential();
    pilihTigaKegiatanDari20();

    runnerSeq = PlatformerRunner.buatSesi({
        kodeStage: "sequential",
        onOpenGate: function (gate, runner) {
            bukaModalSoalSequential(gate, runner);
        }
    });

    const faseMateri = document.getElementById("fase-materi-seq");
    const faseGame = document.getElementById("fase-game-seq");

    document.getElementById("tombol-mulai-seq").addEventListener("click", function () {
        faseMateri.classList.add("tersembunyi");
        faseGame.classList.remove("tersembunyi");
        runnerSeq.pauseManual(false);
        runnerSeq.start();
    });

    const btnUlangBrief = document.getElementById("tombol-ulang-seq");
    if (saved && saved.status !== "belum_dimulai" && btnUlangBrief) {
        btnUlangBrief.classList.remove("tersembunyi");
        btnUlangBrief.addEventListener("click", function () {
            if (typeof resetStage === "function") resetStage("sequential");
            window.location.reload();
        });
    }

    document.getElementById("tombol-buka-materi-seq").addEventListener("click", function () {
        runnerSeq.pauseManual(true);
        document.getElementById("modal-pause-platformer").classList.add("tersembunyi");
        faseGame.classList.add("tersembunyi");
        faseMateri.classList.remove("tersembunyi");
    });

    document.getElementById("tombol-periksa-seq").addEventListener("click", periksaJawabanGerbangSeq);
    document.getElementById("tombol-acak-ulang-seq").addEventListener("click", function () {
        if (!kegiatanAktifModal) return;
        susunanLangkahAktif = SequentialLogic.acakLangkah(kegiatanAktifModal.langkah);
        hasilPeriksaTerakhir = null;
        renderDaftarLangkahSeq();
    });

    document.getElementById("tombol-bantuan-seq").addEventListener("click", function () {
        if (!kegiatanAktifModal) return;
        const p = document.getElementById("teks-petunjuk-inline-seq");
        p.textContent = "Petunjuk Langkah Pertama: " + kegiatanAktifModal.langkah[0];
        p.classList.toggle("tersembunyi");
    });

    document.getElementById("tombol-buka-gerbang-seq").addEventListener("click", function () {
        if (!gateAktifSeq || !runnerSeq) return;
        runnerSeq.tandaiGerbangTerbuka(gateAktifSeq.id, {
            benarCount: totalBenarSeq,
            salahCount: totalSalahSeq
        });
    });
});
