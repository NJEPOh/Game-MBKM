/**
 * File: js/bubblesort-ui.js
 * Deskripsi: Pengendali Stage 2 (Bubble Sort Valley Platformer):
 * menyediakan Mode Belajar Demo Interaktif, memilih 3 variasi objek dari bank 8 tantangan
 * (angka + objek atribut berbeda), menjalankan perbandingan & tukar pada Modal Gerbang Soal,
 * serta menerapkan penalti -1 HP bila memilih keputusan yang keliru.
 */

let daftarTantanganBS = [];
let tantanganGerbangBS = {};
let tantanganAktifModal = null;
let stateAktifBS = null;
let sedangAnimasiSwap = false;
let gateAktifBS = null;
let runnerBS = null;

let totalPerbandinganBS = 0;
let totalPertukaranBS = 0;
let totalBenarBS = 0;
let totalSalahBS = 0;

let jejakDemoBS = [];
let indeksDemoBS = 0;
let timerAutoDemoBS = null;

async function muatBankTantanganBS() {
    if (Array.isArray(DATA_CADANGAN_BUBBLESORT)) {
        try {
            const resp = await fetch("data/bubblesort.json");
            if (resp.ok) {
                const json = await resp.json();
                if (json && Array.isArray(json.tantangan) && json.tantangan.length >= 3) {
                    daftarTantanganBS = json.tantangan;
                    return;
                }
            }
        } catch (_) {
            // Fallback ke DATA_CADANGAN_BUBBLESORT
        }
        daftarTantanganBS = DATA_CADANGAN_BUBBLESORT.slice();
    }
}

function pilihTigaTantanganBS() {
    const angka = daftarTantanganBS[0]; // bs-01: Blok Angka Dasar
    const poolAtribut1 = [daftarTantanganBS[1], daftarTantanganBS[2], daftarTantanganBS[5], daftarTantanganBS[7]].filter(Boolean);
    const poolAtribut2 = [daftarTantanganBS[3], daftarTantanganBS[4], daftarTantanganBS[6]].filter(Boolean);
    const pilih = function (arr, fallback) { return arr.length ? arr[Math.floor(Math.random() * arr.length)] : fallback; };

    tantanganGerbangBS = {
        "bs-gate-1": angka,
        "bs-gate-2": pilih(poolAtribut1, daftarTantanganBS[1]),
        "bs-gate-3": pilih(poolAtribut2, daftarTantanganBS[6] || daftarTantanganBS[3])
    };
}

function renderDemoBS() {
    const wadah = document.getElementById("deret-demo-bs");
    const ket = document.getElementById("keterangan-demo-bs");
    const stat = document.getElementById("statistik-demo-bs");
    if (!wadah || !jejakDemoBS.length) return;

    const frame = jejakDemoBS[indeksDemoBS] || jejakDemoBS[0];
    wadah.innerHTML = "";

    frame.arr.forEach(function (val, idx) {
        const box = document.createElement("div");
        box.className = "blok-demo-angka";
        if (idx >= frame.sortedFrom) box.classList.add("terurut");
        if (frame.pasangan && (idx === frame.pasangan[0] || idx === frame.pasangan[1])) {
            box.classList.add(frame.tukar ? "ditukar" : "dibandingkan");
        }
        box.textContent = String(val);
        wadah.appendChild(box);
    });

    if (stat) {
        stat.textContent = "Pass " + frame.pass + " | Perbandingan: " + frame.perbandingan + " | Pertukaran: " + frame.pertukaran;
    }
    if (ket) {
        ket.textContent = frame.pesan;
        ket.className = "kotak-pesan " + (frame.selesai ? "pesan-sukses" : (frame.tukar ? "pesan-peringatan" : "pesan-info"));
    }
}

function inisialisasiDemoBS() {
    jejakDemoBS = BubbleSortLogic.buatJejakDemo([45, 18, 32, 10]);
    indeksDemoBS = 0;
    renderDemoBS();

    document.getElementById("tombol-demo-langkah").addEventListener("click", function () {
        if (timerAutoDemoBS) {
            clearInterval(timerAutoDemoBS);
            timerAutoDemoBS = null;
            document.getElementById("tombol-demo-auto").textContent = "Putar Otomatis";
        }
        if (indeksDemoBS < jejakDemoBS.length - 1) {
            indeksDemoBS++;
            renderDemoBS();
        }
    });

    document.getElementById("tombol-demo-auto").addEventListener("click", function () {
        const btn = this;
        if (timerAutoDemoBS) {
            clearInterval(timerAutoDemoBS);
            timerAutoDemoBS = null;
            btn.textContent = "Putar Otomatis";
            return;
        }
        if (indeksDemoBS >= jejakDemoBS.length - 1) indeksDemoBS = 0;
        btn.textContent = "Hentikan Demo";
        timerAutoDemoBS = setInterval(function () {
            if (indeksDemoBS < jejakDemoBS.length - 1) {
                indeksDemoBS++;
                renderDemoBS();
            } else {
                clearInterval(timerAutoDemoBS);
                timerAutoDemoBS = null;
                btn.textContent = "Putar Otomatis";
            }
        }, 750);
    });

    document.getElementById("tombol-demo-reset").addEventListener("click", function () {
        if (timerAutoDemoBS) {
            clearInterval(timerAutoDemoBS);
            timerAutoDemoBS = null;
            document.getElementById("tombol-demo-auto").textContent = "Putar Otomatis";
        }
        indeksDemoBS = 0;
        renderDemoBS();
    });
}

function renderPassPillsBS() {
    const baris = document.getElementById("baris-pass-bs");
    if (!baris || !stateAktifBS) return;
    baris.innerHTML = "";
    const totalPass = Math.max(1, stateAktifBS.n - 1);
    for (let p = 1; p <= totalPass; p++) {
        const pil = document.createElement("span");
        pil.className = "pil-pass-bs";
        if (stateAktifBS.selesai || p < stateAktifBS.pass) pil.classList.add("selesai");
        else if (p === stateAktifBS.pass) pil.classList.add("aktif");
        pil.textContent = "Pass " + p;
        baris.appendChild(pil);
    }
}

function renderKartuArenaBS(indeksSwap) {
    const wadah = document.getElementById("deret-kartu-bs");
    if (!wadah || !stateAktifBS) return;
    wadah.innerHTML = "";

    stateAktifBS.items.forEach(function (obj, idx) {
        const kartu = document.createElement("div");
        kartu.className = "kartu-objek-bs";

        const sedangBanding = !stateAktifBS.selesai && (idx === stateAktifBS.j || idx === stateAktifBS.j + 1);
        const sudahUrut = stateAktifBS.selesai || idx >= stateAktifBS.sortedFromIndex;

        if (sedangBanding) kartu.classList.add("sedang-dibandingkan");
        if (sudahUrut) kartu.classList.add("sudah-terurut");
        if (Array.isArray(indeksSwap)) {
            if (idx === indeksSwap[0]) kartu.classList.add("anim-swap-kiri");
            if (idx === indeksSwap[1]) kartu.classList.add("anim-swap-kanan");
        }

        let badgeHtml = "";
        if (sedangBanding) {
            badgeHtml = '<span class="lencana-cek-bs">Cek #' + (idx === stateAktifBS.j ? "1" : "2") + "</span>";
        } else if (sudahUrut) {
            badgeHtml = '<span class="lencana-cek-bs terurut">Terurut</span>';
        }

        const isAngka = tantanganAktifModal && tantanganAktifModal.kategori === "Angka";
        const visualHtml =
            '<div class="bungkus-sprite-bs">' +
            '<img src="' + obj.gambar + '" alt="' + obj.nama + '">' +
            (isAngka ? '<span class="angka-dalam-blok">' + (obj.angkaBlok || obj.tampilNilai) + "</span>" : "") +
            "</div>";

        kartu.innerHTML =
            badgeHtml +
            visualHtml +
            '<div class="nama-objek-bs">' + obj.nama + "</div>" +
            '<div class="nilai-objek-bs">' + obj.tampilNilai + "</div>";

        wadah.appendChild(kartu);
    });

    document.getElementById("indikator-pass-bs").textContent = "Pass " + stateAktifBS.pass;
    document.getElementById("indikator-banding-bs").textContent = String(totalPerbandinganBS);
    document.getElementById("indikator-tukar-bs").textContent = String(totalPertukaranBS);
    renderPassPillsBS();

    const teksBanding = document.getElementById("teks-perbandingan-aktif");
    if (stateAktifBS.selesai) {
        teksBanding.textContent = "Semua objek sudah terurut! Klik Buka Gerbang untuk melanjutkan.";
        document.getElementById("tombol-tukar-bs").classList.add("tersembunyi");
        document.getElementById("tombol-pertahankan-bs").classList.add("tersembunyi");
        document.getElementById("tombol-buka-gerbang-bs").classList.remove("tersembunyi");
    } else {
        const a = stateAktifBS.items[stateAktifBS.j];
        const b = stateAktifBS.items[stateAktifBS.j + 1];
        teksBanding.innerHTML =
            "Bandingkan: <strong>" + a.nama + " (" + a.tampilNilai + ")</strong> vs <strong>" + b.nama + " (" + b.tampilNilai + ")</strong>";
    }
}

function bukaModalSoalBS(gate, runner) {
    gateAktifBS = gate;
    runnerBS = runner;
    if (!tantanganGerbangBS[gate.id]) pilihTigaTantanganBS();
    tantanganAktifModal = tantanganGerbangBS[gate.id] || daftarTantanganBS[gate.index] || daftarTantanganBS[0];
    stateAktifBS = BubbleSortLogic.buatStateTantangan(tantanganAktifModal);
    sedangAnimasiSwap = false;

    document.getElementById("lencana-gerbang-bs").textContent = "Gerbang Sort " + (gate.index + 1) + " / 3";
    document.getElementById("judul-gerbang-bs").textContent = "Buka " + gate.label;
    document.getElementById("judul-tantangan-bs").textContent = tantanganAktifModal.judul + " (" + tantanganAktifModal.kategori + ")";
    document.getElementById("deskripsi-tantangan-bs").textContent = tantanganAktifModal.deskripsi;

    const badgeArah = document.getElementById("badge-arah-bs");
    badgeArah.textContent = tantanganAktifModal.labelArah;
    badgeArah.classList.toggle("arah-desc", tantanganAktifModal.arah === "desc");

    document.getElementById("tombol-tukar-bs").classList.remove("tersembunyi");
    document.getElementById("tombol-pertahankan-bs").classList.remove("tersembunyi");
    document.getElementById("tombol-tukar-bs").disabled = false;
    document.getElementById("tombol-pertahankan-bs").disabled = false;
    document.getElementById("tombol-buka-gerbang-bs").classList.add("tersembunyi");

    const msg = document.getElementById("pesan-umpan-balik-bs");
    msg.className = "kotak-pesan pesan-info";
    msg.textContent = "Bandingkan dua objek yang disorot, lalu pilih Tukar Posisi atau Pertahankan Posisi! (Salah = -1 HP)";

    runner.perbaruiHUD();
    renderKartuArenaBS(null);
    document.getElementById("modal-soal-platformer").classList.remove("tersembunyi");
}

function prosesAksiBS(aksi) {
    if (!stateAktifBS || stateAktifBS.selesai || sedangAnimasiSwap || !runnerBS) return;
    const jSebelum = stateAktifBS.j;
    const hasil = BubbleSortLogic.prosesKeputusan(stateAktifBS, aksi);
    const msg = document.getElementById("pesan-umpan-balik-bs");

    if (!hasil.valid) {
        totalSalahBS++;
        const sisaHp = runnerBS.penaltiJawabanSalah({
            salahCount: totalSalahBS,
            perbandingan: totalPerbandinganBS,
            pertukaran: totalPertukaranBS
        });
        msg.className = "kotak-pesan pesan-bahaya";
        if (sisaHp <= 0) {
            msg.textContent = "Keputusan salah dan HP habis! Mempersiapkan respawn...";
            document.getElementById("tombol-tukar-bs").disabled = true;
            document.getElementById("tombol-pertahankan-bs").disabled = true;
        } else {
            msg.textContent = hasil.pesan + " HP berkurang 1 (Sisa: " + sisaHp + ").";
        }
        return;
    }

    totalPerbandinganBS++;
    totalBenarBS++;
    if (hasil.ditukar) {
        totalPertukaranBS++;
        if (typeof putarSFX === "function") putarSFX("drop.mp3");
        sedangAnimasiSwap = true;
        renderKartuArenaBS([jSebelum, jSebelum + 1]);
        setTimeout(function () {
            sedangAnimasiSwap = false;
            renderKartuArenaBS(null);
        }, 320);
    } else {
        if (typeof putarSFX === "function") putarSFX("correct.mp3");
        renderKartuArenaBS(null);
    }

    msg.className = hasil.tantanganSelesai ? "kotak-pesan pesan-sukses" : "kotak-pesan pesan-info";
    msg.textContent = hasil.pesan;
}

document.addEventListener("DOMContentLoaded", async function () {
    const elNama = document.getElementById("nama-pemain-bs");
    if (elNama && typeof ambilNamaPemain === "function") elNama.textContent = ambilNamaPemain();
    const elMode = document.getElementById("badge-mode-bs");
    if (elMode && typeof terapkanBadgeMode === "function") terapkanBadgeMode(elMode, false);

    const saved = typeof ambilStage === "function" ? ambilStage("bubbleSort") : null;
    if (saved) {
        totalPerbandinganBS = Number(saved.perbandingan || 0);
        totalPertukaranBS = Number(saved.pertukaran || 0);
        totalBenarBS = Number(saved.benarCount || 0);
        totalSalahBS = Number(saved.salahCount || 0);
    }

    await muatBankTantanganBS();
    pilihTigaTantanganBS();
    inisialisasiDemoBS();

    runnerBS = PlatformerRunner.buatSesi({
        kodeStage: "bubbleSort",
        onOpenGate: function (gate, runner) {
            bukaModalSoalBS(gate, runner);
        }
    });

    const faseMateri = document.getElementById("fase-materi-bs");
    const faseGame = document.getElementById("fase-game-bs");

    document.getElementById("tombol-mulai-bs").addEventListener("click", function () {
        if (timerAutoDemoBS) {
            clearInterval(timerAutoDemoBS);
            timerAutoDemoBS = null;
        }
        faseMateri.classList.add("tersembunyi");
        faseGame.classList.remove("tersembunyi");
        runnerBS.pauseManual(false);
        runnerBS.start();
    });

    const btnUlangBrief = document.getElementById("tombol-ulang-bs");
    if (saved && saved.status !== "belum_dimulai" && btnUlangBrief) {
        btnUlangBrief.classList.remove("tersembunyi");
        btnUlangBrief.addEventListener("click", function () {
            if (typeof resetStage === "function") resetStage("bubbleSort");
            window.location.reload();
        });
    }

    document.getElementById("tombol-buka-materi-bs").addEventListener("click", function () {
        runnerBS.pauseManual(true);
        document.getElementById("modal-pause-platformer").classList.add("tersembunyi");
        faseGame.classList.add("tersembunyi");
        faseMateri.classList.remove("tersembunyi");
    });

    document.getElementById("tombol-tukar-bs").addEventListener("click", function () { prosesAksiBS("swap"); });
    document.getElementById("tombol-pertahankan-bs").addEventListener("click", function () { prosesAksiBS("keep"); });
    document.getElementById("tombol-buka-gerbang-bs").addEventListener("click", function () {
        if (!gateAktifBS || !runnerBS) return;
        runnerBS.tandaiGerbangTerbuka(gateAktifBS.id, {
            benarCount: totalBenarBS,
            salahCount: totalSalahBS,
            perbandingan: totalPerbandinganBS,
            pertukaran: totalPertukaranBS
        });
    });
});
