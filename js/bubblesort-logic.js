/**
 * File: js/bubblesort-logic.js
 * Deskripsi: Mesin algoritma Bubble Sort murni (terpisah dari DOM UI):
 * mengacak data dengan minimal 2 inversi, mengevaluasi keputusan Tukar/Pertahankan,
 * melacak pass, batas terurut, serta menghasilkan jejak demo untuk Mode Belajar.
 */

const BubbleSortLogic = {
    /**
     * Memeriksa apakah array objek sudah terurut penuh sesuai arah ('asc' atau 'desc').
     */
    apakahSudahTerurut: function (items, arah) {
        for (let i = 0; i < items.length - 1; i++) {
            if (arah === "asc" && items[i].nilai > items[i + 1].nilai) {
                return false;
            }
            if (arah === "desc" && items[i].nilai < items[i + 1].nilai) {
                return false;
            }
        }
        return true;
    },

    /**
     * Mengacak daftar objek hingga memiliki minimal 2 inversi (tidak langsung terurut).
     */
    acakUntukSort: function (daftarObjek, arah) {
        const n = daftarObjek.length;
        let hasil = daftarObjek.slice();
        let percobaan = 0;

        function hitungInversi(arr) {
            let inv = 0;
            for (let i = 0; i < arr.length; i++) {
                for (let j = i + 1; j < arr.length; j++) {
                    if (arah === "asc" && arr[i].nilai > arr[j].nilai) inv++;
                    if (arah === "desc" && arr[i].nilai < arr[j].nilai) inv++;
                }
            }
            return inv;
        }

        do {
            for (let i = n - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const tmp = hasil[i];
                hasil[i] = hasil[j];
                hasil[j] = tmp;
            }
            percobaan++;
        } while (percobaan < 20 && hitungInversi(hasil) < Math.min(3, Math.floor(n / 2) + 1));

        // Jika masih terurut secara kebetulan, balik urutannya agar menantang
        if (this.apakahSudahTerurut(hasil, arah) && n >= 2) {
            hasil.reverse();
        }
        return hasil;
    },

    /**
     * Membuat state awal permainan Bubble Sort untuk satu tantangan.
     */
    buatStateTantangan: function (tantangan) {
        const items = this.acakUntukSort(tantangan.objek, tantangan.arah);
        return {
            tantanganId: tantangan.id,
            arah: tantangan.arah,
            items: items,
            n: items.length,
            pass: 1,
            j: 0,
            swappedInPass: false,
            sortedFromIndex: items.length,
            perbandingan: 0,
            pertukaran: 0,
            salah: 0,
            selesai: false
        };
    },

    /**
     * Menentukan apakah pasangan (j, j+1) pada state saat ini perlu ditukar.
     */
    perluDitukar: function (state) {
        const a = state.items[state.j];
        const b = state.items[state.j + 1];
        if (!a || !b) {
            return false;
        }
        return state.arah === "asc" ? a.nilai > b.nilai : a.nilai < b.nilai;
    },

    /**
     * Memproses aksi pemain ('swap' atau 'keep') sesuai algoritma Bubble Sort asli.
     */
    prosesKeputusan: function (state, aksiPemain) {
        if (state.selesai) {
            return { valid: false, pesan: "Tantangan ini sudah selesai." };
        }

        const a = state.items[state.j];
        const b = state.items[state.j + 1];
        const harusTukar = this.perluDitukar(state);
        const pilihanBenar = (aksiPemain === "swap" && harusTukar) || (aksiPemain === "keep" && !harusTukar);

        if (!pilihanBenar) {
            state.salah++;
            const teksArah = state.arah === "asc" ? "terkecil ke terbesar" : "terbesar ke terkecil";
            const alasan = harusTukar
                ? "Belum tepat! Untuk urutan " + teksArah + ", " + a.nama + " (" + a.tampilNilai + ") dan " +
                  b.nama + " (" + b.tampilNilai + ") posisinya terbalik sehingga HARUS DITUKAR."
                : "Belum tepat! Untuk urutan " + teksArah + ", " + a.nama + " (" + a.tampilNilai + ") dan " +
                  b.nama + " (" + b.tampilNilai + ") sudah sesuai urutan sehingga HARUS DIPERTAHANKAN.";
            return {
                valid: false,
                ditukar: false,
                selesaiPass: false,
                selesaiLevel: false,
                pesan: alasan
            };
        }

        state.perbandingan++;
        let ditukar = false;

        if (harusTukar) {
            const temp = state.items[state.j];
            state.items[state.j] = state.items[state.j + 1];
            state.items[state.j + 1] = temp;
            state.swappedInPass = true;
            state.pertukaran++;
            ditukar = true;
        }

        let selesaiPass = false;
        let selesaiLevel = false;
        let passSelesaiKe = state.pass;
        let indeksTerkunciBaru = -1;

        const batasAkhirPass = state.n - 1 - state.pass;
        if (state.j < batasAkhirPass) {
            state.j++;
        } else {
            // Akhir dari satu Pass
            selesaiPass = true;
            indeksTerkunciBaru = state.n - state.pass;
            state.sortedFromIndex = indeksTerkunciBaru;

            if (!state.swappedInPass || state.pass >= state.n - 1) {
                state.selesai = true;
                state.sortedFromIndex = 0;
                selesaiLevel = true;
            } else {
                state.pass++;
                state.j = 0;
                state.swappedInPass = false;
            }
        }

        let pesan = ditukar
            ? "Benar! " + a.nama + " (" + a.tampilNilai + ") ditukar dengan " + b.nama + " (" + b.tampilNilai + ")."
            : "Tepat! Urutan " + a.nama + " (" + a.tampilNilai + ") dan " + b.nama + " (" + b.tampilNilai + ") sudah benar, posisi dipertahankan.";

        if (selesaiLevel) {
            pesan += !state.swappedInPass && passSelesaiKe < state.n - 1
                ? " Tidak ada pertukaran lagi di Pass " + passSelesaiKe + ", seluruh data telah terurut sempurna!"
                : " Pass " + passSelesaiKe + " selesai — seluruh objek kini terurut sempurna!";
        } else if (selesaiPass) {
            pesan += " Pass " + passSelesaiKe + " selesai! Elemen paling kanan sudah berada di posisi final, lanjut ke Pass " + state.pass + ".";
        }

        return {
            valid: true,
            ditukar: ditukar,
            selesaiPass: selesaiPass,
            passSelesaiKe: passSelesaiKe,
            indeksTerkunciBaru: indeksTerkunciBaru,
            selesaiLevel: selesaiLevel,
            pesan: pesan
        };
    },

    /**
     * Menghitung skor per tantangan (8 tantangan -> total maksimal 100 poin).
     */
    hitungPoinTantangan: function (indeksTantangan, jumlahSalah, aturanMode) {
        // 8 tantangan: 4 tantangan bernilai 12, 4 tantangan bernilai 13 => tepat 100!
        const dasar = indeksTantangan % 2 === 0 ? 12 : 13;
        const penalti = aturanMode && aturanMode.kode === "hard" ? 2 : (aturanMode && aturanMode.kode === "normal" ? 1.5 : 1);
        const minimal = aturanMode && aturanMode.kode === "easy" ? 7 : 5;
        return Math.max(minimal, Math.min(dasar, Math.round(dasar - jumlahSalah * penalti)));
    },

    /**
     * Menghasilkan urutan lengkap langkah-langkah untuk Mode Belajar (Demo Interaktif).
     */
    buatJejakDemo: function (nilaiAwal) {
        const arr = nilaiAwal.slice();
        const n = arr.length;
        const jejak = [
            {
                arr: arr.slice(),
                compareIdx: [0, 1],
                sortedFrom: n,
                pass: 1,
                perbandingan: 0,
                pertukaran: 0,
                ditukar: false,
                selesai: false,
                keterangan: "Data awal acak: [" + arr.join(", ") + "]. Mulai Pass 1 dengan membandingkan dua elemen pertama (" + arr[0] + " dan " + arr[1] + ")."
            }
        ];

        let perbandingan = 0;
        let pertukaran = 0;

        for (let pass = 1; pass < n; pass++) {
            let swapped = false;
            for (let j = 0; j < n - pass; j++) {
                perbandingan++;
                const a = arr[j];
                const b = arr[j + 1];
                let ditukar = false;
                if (a > b) {
                    arr[j] = b;
                    arr[j + 1] = a;
                    pertukaran++;
                    swapped = true;
                    ditukar = true;
                }
                const akhirPass = j === n - pass - 1;
                const sortedFrom = akhirPass ? n - pass : n - (pass - 1);
                const selesaiTotal = akhirPass && (!swapped || pass === n - 1);

                let ket = "Pass " + pass + ": Bandingkan " + a + " dan " + b + ". ";
                if (ditukar) {
                    ket += "Karena " + a + " > " + b + ", keduanya DITUKAR menjadi [" + arr.join(", ") + "].";
                } else {
                    ket += "Karena " + a + " <= " + b + ", posisi DIPERTAHANKAN.";
                }
                if (selesaiTotal) {
                    ket += " Seluruh data sudah terurut sempurna!";
                } else if (akhirPass) {
                    ket += " Akhir Pass " + pass + ": angka " + arr[n - pass] + " terkunci di posisi terurut!";
                }

                jejak.push({
                    arr: arr.slice(),
                    compareIdx: selesaiTotal ? [] : (akhirPass ? [0, 1] : [j + 1, j + 2]),
                    sortedFrom: selesaiTotal ? 0 : sortedFrom,
                    pass: selesaiTotal ? pass : (akhirPass ? pass + 1 : pass),
                    perbandingan: perbandingan,
                    pertukaran: pertukaran,
                    ditukar: ditukar,
                    selesai: selesaiTotal,
                    keterangan: ket
                });

                if (selesaiTotal) {
                    return jejak;
                }
            }
        }
        return jejak;
    }
};
