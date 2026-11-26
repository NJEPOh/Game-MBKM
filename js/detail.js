/**
 * File: js/detail.js
 * Deskripsi: Menampilkan rincian evaluasi penguasaan materi untuk ketiga stage
 * (Algoritma Sequential, Algoritma Bubble Sort, DOS Command Line) pada detail.html.
 */

function evaluasiKemampuanStage(kodeStage, st) {
    const nilaiSkor = Number(st.skor || 0);
    let tingkat = "Berkembang";
    let kelasCSS = "level-berkembang";

    if (nilaiSkor >= 85) {
        tingkat = "Sangat Mahir";
        kelasCSS = "level-mahir";
    } else if (nilaiSkor >= 70) {
        tingkat = "Cakap";
        kelasCSS = "level-cakap";
    }

    let keterangan = "";
    const gerbang = st.gerbangSelesai || st.selesaiCount || 0;
    const koin = st.koin || 0;
    if (kodeStage === "sequential") {
        keterangan =
            nilaiSkor >= 85
                ? "Hebat! Kamu menaklukkan Sequential Forest (" + gerbang + "/3 gerbang terbuka, " + koin + " koin) dengan sangat presisi."
                : nilaiSkor >= 70
                    ? "Bagus! Kamu memahami ketergantungan urutan langkah (" + gerbang + "/3 gerbang, " + koin + " koin)."
                    : "Terus berlatih menyusun prosedur harian sambil menghindari rintangan platformer (" + gerbang + "/3 gerbang).";
    } else if (kodeStage === "bubbleSort") {
        keterangan =
            nilaiSkor >= 85
                ? "Sempurna! Kamu menguasai Bubble Sort Valley (" + gerbang + "/3 gerbang, " + st.perbandingan + " perbandingan, " + st.pertukaran + " pertukaran)."
                : nilaiSkor >= 70
                    ? "Baik! Kamu sudah memahami perbandingan berpasangan pada Bubble Sort (" + gerbang + "/3 gerbang, " + koin + " koin)."
                    : "Perhatikan arah pengurutan sebelum memilih Tukar atau Pertahankan (" + gerbang + "/3 gerbang).";
    } else {
        const akurasi = st.perintahTotal > 0 ? Math.round((st.perintahBenar / st.perintahTotal) * 100) : 0;
        keterangan =
            nilaiSkor >= 85
                ? "Mantap! Kamu menaklukkan DOS Tech Dungeon (" + gerbang + "/3 gerbang, " + akurasi + "% ketepatan DOS, " + koin + " koin)."
                : nilaiSkor >= 70
                    ? "Bagus! Kamu mampu mengelola direktori & file di terminal DOS (" + gerbang + "/3 gerbang, " + koin + " koin)."
                    : "Biasakan mengecek lokasi direktori dengan DIR sebelum COPY, REN, DEL, atau RD (" + gerbang + "/3 gerbang).";
    }

    return {
        tingkat: tingkat,
        kelasCSS: kelasCSS,
        keterangan: keterangan
    };
}

document.addEventListener("DOMContentLoaded", function () {
    const data = ambilDataPermainan();
    const stat = hitungStatistikTotal();

    const elNama = document.getElementById("nama-pemain-detail");
    const elMode = document.getElementById("mode-pemain-detail");
    const elTotal = document.getElementById("total-persen-detail");

    if (elNama) elNama.textContent = ambilNamaPemain();
    if (elMode && typeof terapkanBadgeMode === "function") terapkanBadgeMode(elMode, false);
    if (elTotal) elTotal.textContent = stat.persentase + "%";

    DAFTAR_STAGE_RESMI.forEach(function (kode) {
        const st = data.stage[kode];
        const nilai = Number(st.skor || 0);
        const evalHasil = evaluasiKemampuanStage(kode, st);

        const elSkor = document.getElementById("detail-skor-" + kode);
        const elPersen = document.getElementById("detail-persen-" + kode);
        const elLevel = document.getElementById("detail-level-" + kode);
        const elDeskripsi = document.getElementById("detail-deskripsi-" + kode);
        const elBatang = document.getElementById("detail-batang-" + kode);

        if (elSkor) elSkor.textContent = nilai + "%";
        if (elPersen) elPersen.textContent = nilai + " / 100 Poin";
        if (elLevel) {
            elLevel.textContent = evalHasil.tingkat;
            elLevel.className = "lencana-level-kemampuan " + evalHasil.kelasCSS;
        }
        if (elDeskripsi) elDeskripsi.textContent = evalHasil.keterangan;
        if (elBatang) elBatang.style.width = nilai + "%";
    });

    document.getElementById("tombol-kembali-ringkasan").addEventListener("click", function () {
        pindahHalaman("hasil.html", false);
    });
});
