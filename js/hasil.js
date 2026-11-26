/**
 * File: js/hasil.js
 * Deskripsi: Menampilkan rekapitulasi hasil pembelajaran dari ketiga stage
 * (Algoritma Sequential, Bubble Sort, DOS), termasuk benar/salah, waktu,
 * perbandingan & pertukaran Bubble Sort, serta ketepatan perintah DOS.
 */

function dapatkanRingkasanPencapaian(persentase, stageSelesai) {
    if (stageSelesai === 3 && persentase >= 85) {
        return {
            predikat: "Master Computational Thinking",
            pesan: "Luar biasa! Kamu berhasil menguasai Sequential, Bubble Sort, dan DOS dengan sangat teliti."
        };
    }
    if (persentase >= 70) {
        return {
            predikat: "Siswa Logika Andal",
            pesan: "Kerja bagus! Kamu memahami konsep dasar ketiga materi dengan baik."
        };
    }
    return {
        predikat: "Pembelajar Aktif",
        pesan: "Terus berlatih menyusun urutan, membandingkan data, dan mengetik perintah DOS agar makin mahir!"
    };
}

document.addEventListener("DOMContentLoaded", function () {
    const data = ambilDataPermainan();
    const stat = hitungStatistikTotal();

    const seq = data.stage.sequential;
    const bs = data.stage.bubbleSort;
    const dos = data.stage.dos;

    const elNama = document.getElementById("nama-pemain-hasil");
    const elTotalPersen = document.getElementById("nilai-persentase-total");
    const elTotalPoin = document.getElementById("nilai-poin-total");
    const elPredikat = document.getElementById("predikat-pencapaian");
    const elMode = document.getElementById("mode-pencapaian");
    const elRingkasan = document.getElementById("ringkasan-pencapaian");

    if (elNama) elNama.textContent = ambilNamaPemain();
    if (elMode && typeof terapkanBadgeMode === "function") terapkanBadgeMode(elMode, true);
    if (elTotalPersen) elTotalPersen.textContent = stat.persentase + "%";
    if (elTotalPoin) elTotalPoin.textContent = stat.totalSkor + " / " + stat.maksSkor + " Poin";

    const info = dapatkanRingkasanPencapaian(stat.persentase, stat.stageSelesai);
    if (elPredikat) elPredikat.textContent = info.predikat;
    if (elRingkasan) elRingkasan.textContent = info.pesan;

    document.getElementById("total-benar-hasil").textContent = String(stat.totalBenar);
    document.getElementById("total-salah-hasil").textContent = String(stat.totalSalah);
    document.getElementById("total-waktu-hasil").textContent = formatDurasiDetik(stat.totalWaktuDetik);

    // Stage 1
    document.getElementById("batang-sequential").style.width = seq.skor + "%";
    document.getElementById("skor-sequential").textContent = seq.skor + " / 100 Poin";
    document.getElementById("stat-sequential").textContent =
        "Gerbang: " + (seq.gerbangSelesai || seq.selesaiCount) + "/3" +
        " | Koin: " + (seq.koin || 0) + "/" + (seq.totalKoin || 15) +
        " | Sisa HP: " + (seq.sisaHp !== undefined ? seq.sisaHp : "-") +
        " | Salah: " + seq.salahCount +
        " | Waktu: " + formatDurasiDetik(seq.waktuDetik);

    // Stage 2
    document.getElementById("batang-bubblesort").style.width = bs.skor + "%";
    document.getElementById("skor-bubblesort").textContent = bs.skor + " / 100 Poin";
    document.getElementById("stat-bubblesort").textContent =
        "Gerbang: " + (bs.gerbangSelesai || bs.selesaiCount) + "/3" +
        " | Koin: " + (bs.koin || 0) + "/" + (bs.totalKoin || 15) +
        " | Banding/Tukar: " + bs.perbandingan + "/" + bs.pertukaran +
        " | Waktu: " + formatDurasiDetik(bs.waktuDetik);

    // Stage 3
    const akurasiDos = dos.perintahTotal > 0 ? Math.round((dos.perintahBenar / dos.perintahTotal) * 100) : 0;
    document.getElementById("batang-dos").style.width = dos.skor + "%";
    document.getElementById("skor-dos").textContent = dos.skor + " / 100 Poin";
    document.getElementById("stat-dos").textContent =
        "Gerbang: " + (dos.gerbangSelesai || dos.selesaiCount) + "/3" +
        " | Koin: " + (dos.koin || 0) + "/" + (dos.totalKoin || 15) +
        " | Ketepatan DOS: " + akurasiDos + "%" +
        " | Waktu: " + formatDurasiDetik(dos.waktuDetik);

    document.getElementById("tombol-lihat-detail").addEventListener("click", function () {
        pindahHalaman("detail.html", false);
    });

    document.getElementById("tombol-main-lagi").addEventListener("click", function () {
        resetPermainan();
        pindahHalaman("index.html", true);
    });
});
