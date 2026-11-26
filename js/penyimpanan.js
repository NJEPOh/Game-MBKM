/**
 * File: js/penyimpanan.js
 * Deskripsi: Mengelola penyimpanan data pemain, mode kesulitan, progres 3 stage
 * (Sequential, Bubble Sort, DOS), skor, dan statistik pembelajaran via localStorage.
 */

const KUNCI_PENYIMPANAN = "misi_logika_ct_v2_data";
const KUNCI_NOTIFIKASI_RESET = "misi_logika_notifikasi_reset";

const DAFTAR_STAGE_RESMI = ["sequential", "bubbleSort", "dos"];

const PETA_MODE_KESULITAN = {
    easy: {
        kode: "easy",
        label: "Easy (Santai)",
        judul: "Easy — 7 HP",
        maxHp: 7,
        deskripsiSingkat: "7 HP (Nyawa) & penalti ringan, cocok untuk belajar sambil menjelajah.",
        penaltiSalah: 1,
        batasSkorMinimalPersentase: 0.4
    },
    normal: {
        kode: "normal",
        label: "Normal",
        judul: "Normal — 5 HP",
        maxHp: 5,
        deskripsiSingkat: "5 HP (Nyawa) seimbang untuk petualangan platformer & tantangan logika.",
        penaltiSalah: 2,
        batasSkorMinimalPersentase: 0.25
    },
    hard: {
        kode: "hard",
        label: "Hard (Tantangan)",
        judul: "Hard — 3 HP",
        maxHp: 3,
        deskripsiSingkat: "3 HP (Nyawa) penuh tantangan untuk menguji ketelitian dan ketangkasan.",
        penaltiSalah: 3,
        batasSkorMinimalPersentase: 0.1
    }
};

/**
 * Mengembalikan jumlah HP awal sesuai tingkat kesulitan ('easy' | 'normal' | 'hard').
 */
function ambilMaxHpMode(modeOpsional) {
    const aturan = ambilAturanMode(modeOpsional);
    return aturan && aturan.maxHp ? Number(aturan.maxHp) : 5;
}

/**
 * Membuat struktur data awal permainan untuk 3 stage platformer edukasi.
 */
function buatDataAwal() {
    return {
        namaPemain: "",
        modeKesulitan: "normal",
        stage: {
            sequential: {
                status: "belum_dimulai",
                skor: 0,
                selesaiCount: 0,
                totalItem: 3,
                gerbangSelesai: 0,
                totalGerbang: 3,
                daftarGerbangSelesai: [],
                koin: 0,
                totalKoin: 15,
                sisaHp: 5,
                maxHp: 5,
                checkpointAktif: false,
                benarCount: 0,
                salahCount: 0,
                waktuDetik: 0,
                indeksAktif: 0,
                daftarSelesai: []
            },
            bubbleSort: {
                status: "belum_dimulai",
                skor: 0,
                selesaiCount: 0,
                totalItem: 3,
                gerbangSelesai: 0,
                totalGerbang: 3,
                daftarGerbangSelesai: [],
                koin: 0,
                totalKoin: 15,
                sisaHp: 5,
                maxHp: 5,
                checkpointAktif: false,
                benarCount: 0,
                salahCount: 0,
                perbandingan: 0,
                pertukaran: 0,
                waktuDetik: 0,
                indeksAktif: 0,
                daftarSelesai: []
            },
            dos: {
                status: "belum_dimulai",
                skor: 0,
                selesaiCount: 0,
                totalItem: 3,
                gerbangSelesai: 0,
                totalGerbang: 3,
                daftarGerbangSelesai: [],
                koin: 0,
                totalKoin: 15,
                sisaHp: 5,
                maxHp: 5,
                checkpointAktif: false,
                benarCount: 0,
                salahCount: 0,
                perintahBenar: 0,
                perintahTotal: 0,
                waktuDetik: 0,
                indeksAktif: 0,
                daftarSelesai: []
            }
        }
    };
}

/**
 * Mengambil seluruh data permainan dari localStorage secara aman.
 */
function ambilDataPermainan() {
    const dataTersimpan = localStorage.getItem(KUNCI_PENYIMPANAN);
    const dataDefault = buatDataAwal();
    if (!dataTersimpan) {
        return dataDefault;
    }

    try {
        const obj = JSON.parse(dataTersimpan);
        const modeValid = Object.prototype.hasOwnProperty.call(
            PETA_MODE_KESULITAN,
            obj.modeKesulitan
        )
            ? obj.modeKesulitan
            : dataDefault.modeKesulitan;

        const stageObj = obj.stage || {};
        return {
            namaPemain: typeof obj.namaPemain === "string" ? obj.namaPemain : "",
            modeKesulitan: modeValid,
            stage: {
                sequential: Object.assign({}, dataDefault.stage.sequential, stageObj.sequential || {}),
                bubbleSort: Object.assign({}, dataDefault.stage.bubbleSort, stageObj.bubbleSort || {}),
                dos: Object.assign({}, dataDefault.stage.dos, stageObj.dos || {})
            }
        };
    } catch (kesalahan) {
        console.warn("Gagal membaca data penyimpanan, menggunakan data awal.", kesalahan);
        return dataDefault;
    }
}

/**
 * Menyimpan seluruh objek data permainan ke localStorage.
 */
function simpanDataPermainan(data) {
    try {
        localStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(data));
    } catch (kesalahan) {
        console.error("Gagal menyimpan data ke localStorage:", kesalahan);
    }
}

/**
 * Menyimpan nama pemain ke localStorage.
 */
function simpanNamaPemain(nama) {
    const data = ambilDataPermainan();
    data.namaPemain = String(nama || "").trim();
    simpanDataPermainan(data);
}

/**
 * Mengambil nama pemain dari localStorage.
 */
function ambilNamaPemain() {
    const data = ambilDataPermainan();
    return data.namaPemain && data.namaPemain.trim() !== "" ? data.namaPemain.trim() : "Siswa SMK";
}

/**
 * Menyimpan mode kesulitan ('easy', 'normal', 'hard') ke localStorage.
 */
function simpanModeKesulitan(mode) {
    const modeAman = Object.prototype.hasOwnProperty.call(PETA_MODE_KESULITAN, mode)
        ? mode
        : "normal";
    const data = ambilDataPermainan();
    data.modeKesulitan = modeAman;
    simpanDataPermainan(data);
}

/**
 * Mengambil kode mode kesulitan yang aktif saat ini.
 */
function ambilModeKesulitan() {
    const data = ambilDataPermainan();
    return Object.prototype.hasOwnProperty.call(PETA_MODE_KESULITAN, data.modeKesulitan)
        ? data.modeKesulitan
        : "normal";
}

/**
 * Mengambil objek konfigurasi aturan skoring untuk mode tertentu atau mode aktif.
 */
function ambilAturanMode(modeOpsional) {
    const kode = modeOpsional && Object.prototype.hasOwnProperty.call(PETA_MODE_KESULITAN, modeOpsional)
        ? modeOpsional
        : ambilModeKesulitan();
    return PETA_MODE_KESULITAN[kode];
}

/**
 * Mengambil data progres untuk stage tertentu ('sequential' | 'bubbleSort' | 'dos').
 */
function ambilStage(kodeStage) {
    const data = ambilDataPermainan();
    if (Object.prototype.hasOwnProperty.call(data.stage, kodeStage)) {
        return data.stage[kodeStage];
    }
    return null;
}

/**
 * Memperbarui dan menyimpan progres suatu stage ke localStorage.
 */
function simpanStage(kodeStage, pembaruan) {
    const data = ambilDataPermainan();
    if (!Object.prototype.hasOwnProperty.call(data.stage, kodeStage)) {
        return;
    }
    const digabung = Object.assign({}, data.stage[kodeStage], pembaruan || {});
    digabung.skor = Math.max(0, Math.min(100, Math.round(Number(digabung.skor) || 0)));
    data.stage[kodeStage] = digabung;
    simpanDataPermainan(data);
}

/**
 * Mengulang progres satu stage ke keadaan awal tanpa menghapus stage lain.
 */
function resetStage(kodeStage) {
    const data = ambilDataPermainan();
    const awal = buatDataAwal();
    if (Object.prototype.hasOwnProperty.call(awal.stage, kodeStage)) {
        data.stage[kodeStage] = awal.stage[kodeStage];
        simpanDataPermainan(data);
    }
}

/**
 * Menghitung rekapitulasi skor, progres, benar/salah, dan waktu dari ketiga stage.
 */
function hitungStatistikTotal() {
    const data = ambilDataPermainan();
    let totalSkor = 0;
    let stageSelesai = 0;
    let totalBenar = 0;
    let totalSalah = 0;
    let totalWaktuDetik = 0;
    let totalKoin = 0;
    let totalGerbang = 0;

    DAFTAR_STAGE_RESMI.forEach(function (kode) {
        const st = data.stage[kode];
        totalSkor += Number(st.skor || 0);
        if (st.status === "selesai") {
            stageSelesai++;
        }
        totalBenar += Number(st.benarCount || 0);
        totalSalah += Number(st.salahCount || 0);
        totalWaktuDetik += Number(st.waktuDetik || 0);
        totalKoin += Number(st.koin || 0);
        totalGerbang += Number(st.gerbangSelesai || 0);
    });

    const maksSkor = DAFTAR_STAGE_RESMI.length * 100;
    const persentase = Math.round((totalSkor / maksSkor) * 100);

    return {
        totalSkor: totalSkor,
        maksSkor: maksSkor,
        persentase: persentase,
        stageSelesai: stageSelesai,
        totalStage: DAFTAR_STAGE_RESMI.length,
        totalBenar: totalBenar,
        totalSalah: totalSalah,
        totalWaktuDetik: totalWaktuDetik,
        totalKoin: totalKoin,
        totalGerbang: totalGerbang,
        maksGerbang: DAFTAR_STAGE_RESMI.length * 3
    };
}

/**
 * Memeriksa apakah ada progres permainan yang tersimpan.
 */
function apakahAdaProgresTersimpan() {
    const dataMentah = localStorage.getItem(KUNCI_PENYIMPANAN);
    if (!dataMentah) {
        return false;
    }
    const data = ambilDataPermainan();
    const adaNama = Boolean(data.namaPemain && data.namaPemain.trim() !== "");
    const adaAktivitas = DAFTAR_STAGE_RESMI.some(function (kode) {
        const st = data.stage[kode];
        return st.status !== "belum_dimulai" || st.skor > 0 || st.selesaiCount > 0;
    });
    return adaNama || adaAktivitas;
}

/**
 * Menerapkan badge mode kesulitan ke elemen DOM target.
 */
function terapkanBadgeMode(elemen, pakaiPrefix) {
    if (!elemen) {
        return;
    }
    const aturan = ambilAturanMode();
    elemen.textContent = pakaiPrefix ? "Mode: " + aturan.label : aturan.label;
    elemen.classList.remove("mode-easy", "mode-normal", "mode-hard");
    elemen.classList.add("mode-" + aturan.kode);
}

/**
 * Memformat durasi detik ke bentuk teks mudah dibaca (contoh: "1m 15d" atau "42 dtk").
 */
function formatDurasiDetik(totalDetik) {
    const d = Math.max(0, Math.round(Number(totalDetik) || 0));
    if (d < 60) {
        return d + " dtk";
    }
    const menit = Math.floor(d / 60);
    const sisa = d % 60;
    return menit + "m " + sisa + "d";
}

/**
 * Menghapus progres game dari localStorage tanpa menghapus preferensi audio.
 */
function resetPermainan() {
    localStorage.removeItem(KUNCI_PENYIMPANAN);
}

/**
 * Menandai bahwa progres baru saja direset untuk menampilkan notifikasi di beranda.
 */
function tandaiNotifikasiReset() {
    sessionStorage.setItem(KUNCI_NOTIFIKASI_RESET, "true");
}

/**
 * Mengambil dan menghapus tanda notifikasi reset satu kali pakai.
 */
function ambilDanHapusNotifikasiReset() {
    const status = sessionStorage.getItem(KUNCI_NOTIFIKASI_RESET);
    if (status === "true") {
        sessionStorage.removeItem(KUNCI_NOTIFIKASI_RESET);
        return true;
    }
    return false;
}
