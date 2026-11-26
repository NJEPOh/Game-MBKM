/**
 * File: js/sequential-logic.js
 * Deskripsi: Logika murni permainan Algoritma Sequential (terpisah dari DOM UI):
 * pengacakan langkah tanpa hasil sudah-terurut, validasi urutan, dan perhitungan poin.
 */

const SequentialLogic = {
    /**
     * Mengacak daftar langkah menggunakan Fisher-Yates serta memastikan hasil acakan
     * tidak kebetulan sama persis dengan urutan benar asli.
     */
    acakLangkah: function (daftarBenar) {
        const itemDenganId = daftarBenar.map(function (teks, idx) {
            return { urutanAsli: idx, teks: teks };
        });

        if (itemDenganId.length <= 1) {
            return itemDenganId;
        }

        let salinan = itemDenganId.slice();
        let percobaan = 0;

        do {
            for (let i = salinan.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const temp = salinan[i];
                salinan[i] = salinan[j];
                salinan[j] = temp;
            }
            percobaan++;
        } while (
            percobaan < 12 &&
            salinan.every(function (item, idx) { return item.urutanAsli === idx; })
        );

        // Jaminan mutlak tidak sama dengan urutan benar
        if (salinan.every(function (item, idx) { return item.urutanAsli === idx; })) {
            const temp = salinan[0];
            salinan[0] = salinan[1];
            salinan[1] = temp;
        }

        return salinan;
    },

    /**
     * Memindahkan elemen dari indeks asal ke indeks tujuan secara immutable.
     */
    pindahkanLangkah: function (daftarLangkah, dariIndeks, keIndeks) {
        if (
            dariIndeks < 0 ||
            keIndeks < 0 ||
            dariIndeks >= daftarLangkah.length ||
            keIndeks >= daftarLangkah.length ||
            dariIndeks === keIndeks
        ) {
            return daftarLangkah.slice();
        }
        const hasil = daftarLangkah.slice();
        const dipindah = hasil.splice(dariIndeks, 1)[0];
        hasil.splice(keIndeks, 0, dipindah);
        return hasil;
    },

    /**
     * Memvalidasi susunan langkah pemain dibandingkan urutan yang benar.
     */
    periksaUrutan: function (daftarSekarang) {
        const statusPerPosisi = daftarSekarang.map(function (item, idx) {
            return item.urutanAsli === idx;
        });
        const jumlahTepat = statusPerPosisi.filter(Boolean).length;
        const semuaBenar = jumlahTepat === daftarSekarang.length;

        return {
            semuaBenar: semuaBenar,
            jumlahTepat: jumlahTepat,
            total: daftarSekarang.length,
            statusPerPosisi: statusPerPosisi
        };
    },

    /**
     * Menghitung poin satu kegiatan (maks 5 poin, total 20 kegiatan = 100 poin).
     */
    hitungPoinKegiatan: function (jumlahSalahKegiatan, aturanMode) {
        const maksPoin = 5;
        const penalti = aturanMode && aturanMode.kode === "hard" ? 1.5 : (aturanMode && aturanMode.kode === "normal" ? 1 : 0.5);
        const minimal = aturanMode && aturanMode.kode === "easy" ? 3 : 2;
        const skor = maksPoin - Math.round(jumlahSalahKegiatan * penalti);
        return Math.max(minimal, Math.min(maksPoin, skor));
    }
};
