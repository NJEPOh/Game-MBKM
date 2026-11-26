/**
 * File: js/dos-ui.js
 * Deskripsi: Pengendali Stage 3 (DOS Tech Dungeon Platformer):
 * membagi seluruh 11 materi perintah DOS ke dalam 3 Gerbang Terminal Virtual interaktif
 * (Gerbang 1: MD/DIR/CD, Gerbang 2: COPY CON+Ctrl+Z/COPY/REN, Gerbang 3: DEL/CD../RD),
 * menerapkan penalti -1 HP bila perintah error, dan menjaga visualisasi direktori virtual.
 */

const GRUP_MISI_GERBANG_DOS = {
    "dos-gate-1": [0, 1, 2],    // dos-01 (MD), dos-02 (DIR), dos-03 (CD)
    "dos-gate-2": [3, 4, 5],    // dos-04 (COPY CON + Ctrl+Z), dos-05 (COPY), dos-06 (REN)
    "dos-gate-3": [6, 7, 8]     // dos-07 (DEL), dos-08 (DEL+CD..), dos-09 (RD/RMDIR)
};

let fsVirtual = DosVFS.buatFilesystemAwal();
let gateAktifDOS = null;
let runnerDOS = null;
let daftarIdxMisiGerbang = [];
let posisiSubMisi = 0;
let gerbangMisiTuntas = false;

let totalBenarDOS = 0;
let totalSalahDOS = 0;
let perintahBenarDOS = 0;
let perintahTotalDOS = 0;

let sedangModeCopyCon = false;
let namaFileCopyCon = "";
let barisIsiCopyCon = [];
let siapCtrlZEnter = false;
let riwayatPerintah = [];
let indeksRiwayat = -1;

function tulisTerminalDOS(barisList, kelasCss) {
    const layar = document.getElementById("layar-terminal-dos");
    if (!layar) return;
    barisList.forEach(function (teks) {
        const div = document.createElement("div");
        div.className = "baris-term" + (kelasCss ? " " + kelasCss : "");
        div.textContent = teks === "" ? "\u00A0" : teks;
        layar.appendChild(div);
    });
    layar.scrollTop = layar.scrollHeight;
}

function perbaruiPromptTerminal() {
    const elPrompt = document.getElementById("prompt-dos");
    const elInput = document.getElementById("input-perintah-dos");
    const elCtrlZ = document.getElementById("tombol-ctrlz-dos");
    const path = DosVFS.dapatkanPathPrompt(fsVirtual);

    if (sedangModeCopyCon) {
        if (elPrompt) elPrompt.textContent = siapCtrlZEnter ? "^Z (Enter) >" : "isi> ";
        if (elInput) {
            elInput.placeholder = siapCtrlZEnter
                ? "Tekan Enter sekarang untuk menyimpan file..."
                : "Ketik isi teks lalu Enter; setelah selesai tekan CTRL+Z lalu Enter...";
        }
        if (elCtrlZ) elCtrlZ.classList.remove("tersembunyi");
    } else {
        if (elPrompt) elPrompt.textContent = path + ">";
        if (elInput) elInput.placeholder = "Ketik perintah DOS lalu Enter...";
        if (elCtrlZ) elCtrlZ.classList.add("tersembunyi");
    }
    renderPohonDirektoriVFS();
}

function renderPohonDirektoriVFS() {
    const elPath = document.getElementById("jalur-aktif-vfs");
    const wadah = document.getElementById("pohon-direktori-vfs");
    if (!wadah) return;

    const pathStr = DosVFS.dapatkanPathPrompt(fsVirtual);
    if (elPath) elPath.textContent = "Lokasi Aktif: " + pathStr;
    wadah.innerHTML = "";

    function bangunNode(node, pathArr, kedalaman) {
        const div = document.createElement("div");
        const isDir = node.tipe === "dir";
        const keyNode = "C:\\" + pathArr.join("\\");
        const isAktif = keyNode.toUpperCase() === pathStr.toUpperCase();

        div.className = "item-vfs" + (isAktif ? " aktif-cwd" : "");
        div.style.paddingLeft = (8 + kedalaman * 16) + "px";

        const ikon = isDir
            ? (isAktif ? "assets/images/stage-3-dos/folders/folder-open.png" : "assets/images/stage-3-dos/folders/folder-closed.png")
            : "assets/images/stage-3-dos/files/file-txt.png";

        div.innerHTML =
            '<img src="' + ikon + '" alt="" width="20" height="20">' +
            "<span>" + (kedalaman === 0 ? "C:\\" : node.nama) + "</span>" +
            (isDir ? '<span style="margin-left:auto;font-size:11px;opacity:0.7;">&lt;DIR&gt;</span>' : '<span style="margin-left:auto;font-size:11px;opacity:0.7;">' + node.ukuran + "B</span>");

        wadah.appendChild(div);

        if (isDir && node.anak) {
            const keys = Object.keys(node.anak).sort(function (a, b) {
                const na = node.anak[a];
                const nb = node.anak[b];
                if (na.tipe !== nb.tipe) return na.tipe === "dir" ? -1 : 1;
                return na.nama.localeCompare(nb.nama);
            });
            keys.forEach(function (k) {
                bangunNode(node.anak[k], pathArr.concat([node.anak[k].nama]), kedalaman + 1);
            });
        }
    }

    bangunNode(fsVirtual.akar, [], 0);
}

function muatSubMisiAktifDOS() {
    const idxGlobal = daftarIdxMisiGerbang[posisiSubMisi];
    const misi = MISI_STAGE_DOS[idxGlobal];
    if (!misi) return;

    if (typeof misi.siapkanPrasyarat === "function") {
        // Pastikan prasyarat ada (berguna bila pemain respawn/refresh tengah stage)
        if (posisiSubMisi === 0) {
            misi.siapkanPrasyarat(fsVirtual);
        }
    }

    document.getElementById("badge-materi-dos").textContent =
        "Langkah " + (posisiSubMisi + 1) + " / " + daftarIdxMisiGerbang.length + " • Materi: " + misi.materi;
    document.getElementById("judul-misi-dos").textContent = misi.judul;
    document.getElementById("instruksi-misi-dos").textContent = misi.instruksi;
    document.getElementById("teks-petunjuk-inline-dos").classList.add("tersembunyi");
    perbaruiPromptTerminal();
}

function bukaModalTerminalDOS(gate, runner) {
    gateAktifDOS = gate;
    runnerDOS = runner;
    daftarIdxMisiGerbang = GRUP_MISI_GERBANG_DOS[gate.id] || [0, 1, 2];
    posisiSubMisi = 0;
    gerbangMisiTuntas = false;
    sedangModeCopyCon = false;
    siapCtrlZEnter = false;
    barisIsiCopyCon = [];

    document.getElementById("lencana-gerbang-dos").textContent = "Gerbang Terminal " + (gate.index + 1) + " / 3";
    document.getElementById("judul-gerbang-dos").textContent = "Buka " + gate.label;
    document.getElementById("tombol-buka-gerbang-dos").classList.add("tersembunyi");
    document.getElementById("input-perintah-dos").disabled = false;
    document.getElementById("tombol-kirim-dos").disabled = false;

    const msg = document.getElementById("pesan-umpan-balik-dos");
    msg.className = "kotak-pesan pesan-info";
    msg.textContent = "Selesaikan seluruh langkah perintah DOS di bawah untuk membuka gerbang!";

    const layar = document.getElementById("layar-terminal-dos");
    if (layar && layar.children.length === 0) {
        tulisTerminalDOS([
            "Microsoft(R) MS-DOS Simulator — Misi Logika SMK",
            "Ketik HELP untuk melihat daftar perintah. Selamat berlatih!",
            ""
        ], "term-info");
    }

    muatSubMisiAktifDOS();
    runner.perbaruiHUD();
    document.getElementById("modal-soal-platformer").classList.remove("tersembunyi");
    setTimeout(function () {
        const inp = document.getElementById("input-perintah-dos");
        if (inp) inp.focus();
    }, 60);
}

function selesaikanCopyConDanSimpan() {
    const teks = barisIsiCopyCon.join("\n").trim();
    const msg = document.getElementById("pesan-umpan-balik-dos");

    if (!teks) {
        tulisTerminalDOS(["Isi file belum boleh kosong. Ketik teks dahulu sebelum CTRL+Z."], "term-err");
        totalSalahDOS++;
        perintahTotalDOS++;
        const sisaHp = runnerDOS.penaltiJawabanSalah({
            salahCount: totalSalahDOS,
            perintahBenar: perintahBenarDOS,
            perintahTotal: perintahTotalDOS
        });
        siapCtrlZEnter = false;
        perbaruiPromptTerminal();
        msg.className = "kotak-pesan pesan-bahaya";
        msg.textContent = sisaHp <= 0
            ? "Isi file kosong & HP habis! Mempersiapkan respawn..."
            : "Isi file tidak boleh kosong! HP berkurang 1 (Sisa: " + sisaHp + ").";
        return;
    }

    const res = DosVFS.simpanFileCopyCon(fsVirtual, namaFileCopyCon, teks);
    tulisTerminalDOS(["^Z"].concat(res.output), "term-ok");
    sedangModeCopyCon = false;
    siapCtrlZEnter = false;
    namaFileCopyCon = "";
    barisIsiCopyCon = [];
    perintahBenarDOS++;
    perintahTotalDOS++;
    perbaruiPromptTerminal();
    cekKemajuanMisiGerbang(res);
}

function cekKemajuanMisiGerbang(hasilCmd) {
    if (gerbangMisiTuntas) return;
    const idxGlobal = daftarIdxMisiGerbang[posisiSubMisi];
    const misi = MISI_STAGE_DOS[idxGlobal];
    if (!misi || !misi.cekSelesai(fsVirtual, hasilCmd)) return;

    totalBenarDOS++;
    if (typeof putarSFX === "function") putarSFX("correct.mp3");
    const msg = document.getElementById("pesan-umpan-balik-dos");

    if (posisiSubMisi < daftarIdxMisiGerbang.length - 1) {
        posisiSubMisi++;
        msg.className = "kotak-pesan pesan-sukses";
        msg.textContent = "Langkah selesai! Lanjut ke langkah terminal berikutnya.";
        muatSubMisiAktifDOS();
    } else {
        gerbangMisiTuntas = true;
        msg.className = "kotak-pesan pesan-sukses";
        msg.textContent = "Semua tugas pada " + gateAktifDOS.label + " selesai! Klik Buka Gerbang & Lanjutkan.";
        document.getElementById("tombol-buka-gerbang-dos").classList.remove("tersembunyi");
    }
}

function prosesInputTerminalDOS() {
    const inp = document.getElementById("input-perintah-dos");
    if (!inp || !runnerDOS || inp.disabled) return;

    const val = inp.value;
    inp.value = "";

    if (sedangModeCopyCon) {
        if (siapCtrlZEnter || val.trim().toUpperCase() === "^Z") {
            selesaikanCopyConDanSimpan();
            return;
        }
        if (val.trim() !== "") {
            barisIsiCopyCon.push(val);
            tulisTerminalDOS(["  " + val], "");
        }
        perbaruiPromptTerminal();
        return;
    }

    const teksTrim = val.trim();
    if (!teksTrim) return;

    riwayatPerintah.push(teksTrim);
    indeksRiwayat = riwayatPerintah.length;

    const promptSaatIni = DosVFS.dapatkanPathPrompt(fsVirtual) + ">";
    tulisTerminalDOS([promptSaatIni + teksTrim], "term-cmd");

    const hasil = DosVFS.eksekusiPerintah(fsVirtual, teksTrim);
    if (hasil.aksi === "CLS") {
        document.getElementById("layar-terminal-dos").innerHTML = "";
        return;
    }

    perintahTotalDOS++;
    const msg = document.getElementById("pesan-umpan-balik-dos");

    if (hasil.aksi === "START_COPY_CON") {
        sedangModeCopyCon = true;
        namaFileCopyCon = hasil.namaFile;
        barisIsiCopyCon = [];
        siapCtrlZEnter = false;
        perintahBenarDOS++;
        tulisTerminalDOS(hasil.output, "term-info");
        perbaruiPromptTerminal();
        return;
    }

    if (hasil.ok) {
        perintahBenarDOS++;
        tulisTerminalDOS(hasil.output, "");
        perbaruiPromptTerminal();
        cekKemajuanMisiGerbang(hasil);
    } else {
        totalSalahDOS++;
        tulisTerminalDOS(hasil.output, "term-err");
        perbaruiPromptTerminal();
        const sisaHp = runnerDOS.penaltiJawabanSalah({
            salahCount: totalSalahDOS,
            perintahBenar: perintahBenarDOS,
            perintahTotal: perintahTotalDOS
        });
        msg.className = "kotak-pesan pesan-bahaya";
        if (sisaHp <= 0) {
            msg.textContent = "Perintah tidak valid dan HP habis! Mempersiapkan respawn...";
            inp.disabled = true;
            document.getElementById("tombol-kirim-dos").disabled = true;
        } else {
            msg.textContent = (hasil.output[0] || "Perintah salah.") + " HP berkurang 1 (Sisa: " + sisaHp + ").";
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const elNama = document.getElementById("nama-pemain-dos");
    if (elNama && typeof ambilNamaPemain === "function") elNama.textContent = ambilNamaPemain();
    const elMode = document.getElementById("badge-mode-dos");
    if (elMode && typeof terapkanBadgeMode === "function") terapkanBadgeMode(elMode, false);

    const saved = typeof ambilStage === "function" ? ambilStage("dos") : null;
    if (saved) {
        totalBenarDOS = Number(saved.benarCount || 0);
        totalSalahDOS = Number(saved.salahCount || 0);
        perintahBenarDOS = Number(saved.perintahBenar || 0);
        perintahTotalDOS = Number(saved.perintahTotal || 0);
    }

    runnerDOS = PlatformerRunner.buatSesi({
        kodeStage: "dos",
        onOpenGate: function (gate, runner) {
            bukaModalTerminalDOS(gate, runner);
        }
    });

    const faseMateri = document.getElementById("fase-materi-dos");
    const faseGame = document.getElementById("fase-game-dos");

    document.getElementById("tombol-mulai-dos").addEventListener("click", function () {
        faseMateri.classList.add("tersembunyi");
        faseGame.classList.remove("tersembunyi");
        runnerDOS.pauseManual(false);
        runnerDOS.start();
    });

    const btnUlangBrief = document.getElementById("tombol-ulang-dos");
    if (saved && saved.status !== "belum_dimulai" && btnUlangBrief) {
        btnUlangBrief.classList.remove("tersembunyi");
        btnUlangBrief.addEventListener("click", function () {
            if (typeof resetStage === "function") resetStage("dos");
            window.location.reload();
        });
    }

    document.getElementById("tombol-buka-materi-dos").addEventListener("click", function () {
        runnerDOS.pauseManual(true);
        document.getElementById("modal-pause-platformer").classList.add("tersembunyi");
        faseGame.classList.add("tersembunyi");
        faseMateri.classList.remove("tersembunyi");
    });

    const inp = document.getElementById("input-perintah-dos");
    inp.addEventListener("keydown", function (ev) {
        if (sedangModeCopyCon && (ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "z") {
            ev.preventDefault();
            siapCtrlZEnter = true;
            inp.value = "^Z";
            perbaruiPromptTerminal();
            return;
        }
        if (ev.key === "Enter") {
            ev.preventDefault();
            prosesInputTerminalDOS();
        } else if (ev.key === "ArrowUp" && !sedangModeCopyCon && riwayatPerintah.length) {
            ev.preventDefault();
            indeksRiwayat = Math.max(0, indeksRiwayat - 1);
            inp.value = riwayatPerintah[indeksRiwayat];
        } else if (ev.key === "ArrowDown" && !sedangModeCopyCon) {
            ev.preventDefault();
            indeksRiwayat = Math.min(riwayatPerintah.length, indeksRiwayat + 1);
            inp.value = indeksRiwayat >= riwayatPerintah.length ? "" : riwayatPerintah[indeksRiwayat];
        }
    });

    document.getElementById("tombol-kirim-dos").addEventListener("click", prosesInputTerminalDOS);
    document.getElementById("tombol-ctrlz-dos").addEventListener("click", function () {
        if (sedangModeCopyCon) selesaikanCopyConDanSimpan();
    });

    document.getElementById("tombol-bantuan-dos").addEventListener("click", function () {
        const idxGlobal = daftarIdxMisiGerbang[posisiSubMisi];
        const misi = MISI_STAGE_DOS[idxGlobal];
        const p = document.getElementById("teks-petunjuk-inline-dos");
        if (misi && p) {
            p.textContent = "Petunjuk: " + misi.petunjuk;
            p.classList.toggle("tersembunyi");
        }
    });

    document.getElementById("tombol-buka-gerbang-dos").addEventListener("click", function () {
        if (!gateAktifDOS || !runnerDOS) return;
        runnerDOS.tandaiGerbangTerbuka(gateAktifDOS.id, {
            benarCount: totalBenarDOS,
            salahCount: totalSalahDOS,
            perintahBenar: perintahBenarDOS,
            perintahTotal: perintahTotalDOS
        });
    });
});
