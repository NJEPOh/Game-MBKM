/**
 * File: js/platformer-runner.js
 * Deskripsi: Pengendali sesi permainan platformer bersama untuk Stage 1, Stage 2, dan Stage 3.
 * Menghubungkan Canvas PlatformerEngine dengan HUD Pixel Art, keyboard (A/D/W/Space),
 * kontrol sentuh, toast checkpoint, modal Pause, modal Penghalang Soal, Game Over, dan Kemenangan Stage.
 */

const PlatformerRunner = {
    buatSesi: function (opsi) {
        const kodeStage = opsi.kodeStage;
        const levelCfg = PlatformerLevels[kodeStage];
        const maxHp = typeof ambilMaxHpMode === "function" ? ambilMaxHpMode() : 5;

        const dataTersimpan = typeof ambilStage === "function" ? ambilStage(kodeStage) : null;
        const sudahPernahSelesai = Boolean(dataTersimpan && dataTersimpan.status === "selesai");
        const solvedInit = sudahPernahSelesai
            ? []
            : (dataTersimpan && Array.isArray(dataTersimpan.daftarGerbangSelesai) ? dataTersimpan.daftarGerbangSelesai : []);
        const cpInit = sudahPernahSelesai ? false : Boolean(dataTersimpan && dataTersimpan.checkpointAktif);

        const state = PlatformerEngine.createState(levelCfg, {
            maxHp: maxHp,
            solvedGateIds: solvedInit,
            checkpointActive: cpInit,
            timeElapsed: sudahPernahSelesai ? 0 : Number(dataTersimpan && dataTersimpan.waktuDetik ? dataTersimpan.waktuDetik : 0)
        });

        let assets = null;
        let rafId = null;
        let lastTime = 0;
        let toastTimer = null;
        let aktif = false;

        const input = { left: false, right: false, jump: false };

        function ambilEl(id) {
            return document.getElementById(id);
        }

        function tampilkanToast(pesan, durasiMs) {
            const elToast = ambilEl("toast-canvas-platformer");
            if (!elToast) return;
            elToast.textContent = pesan;
            elToast.classList.remove("tersembunyi");
            if (toastTimer) clearTimeout(toastTimer);
            toastTimer = setTimeout(function () {
                elToast.classList.add("tersembunyi");
            }, durasiMs || 2600);
        }

        function hitungSkorStage() {
            const solvedCount = state.gates.filter(function (g) { return g.solved; }).length;
            const basisGerbang = Math.round((solvedCount / 3) * 75);
            const bonusKoin = Math.min(20, Math.round((state.coinsCollected / Math.max(1, state.totalCoins)) * 20));
            const bonusHp = Math.min(5, state.hp);
            return Math.min(100, basisGerbang + bonusKoin + bonusHp);
        }

        function perbaruiHUD() {
            const elHp = ambilEl("hud-deret-hp");
            if (elHp) {
                let html = "";
                for (let i = 0; i < state.maxHp; i++) {
                    const src = i < state.hp ? "assets/images/common/ui/heart-full.png" : "assets/images/common/ui/heart-empty.png";
                    html += '<img src="' + src + '" alt="HP">';
                }
                elHp.innerHTML = html;
            }

            const elHpTeks = ambilEl("hud-teks-hp");
            if (elHpTeks) elHpTeks.textContent = state.hp + "/" + state.maxHp;

            const elKoin = ambilEl("hud-teks-koin");
            if (elKoin) elKoin.textContent = state.coinsCollected + "/" + state.totalCoins;

            const elGerbang = ambilEl("hud-deret-gerbang");
            const solvedCount = state.gates.filter(function (g) { return g.solved; }).length;
            if (elGerbang) {
                let gHtml = "";
                state.gates.forEach(function (g) {
                    const src = g.solved ? "assets/images/common/ui/gate-open-hud.png" : "assets/images/common/ui/gate-locked-hud.png";
                    gHtml += '<img src="' + src + '" alt="' + g.label + '" title="' + g.label + '">';
                });
                elGerbang.innerHTML = gHtml;
            }

            const elGerbangTeks = ambilEl("hud-teks-gerbang");
            if (elGerbangTeks) elGerbangTeks.textContent = solvedCount + "/3";

            const elCp = ambilEl("hud-teks-cp");
            if (elCp) {
                elCp.textContent = state.checkpoint.activated ? state.checkpoint.label + " Aktif" : "Belum";
                elCp.style.color = state.checkpoint.activated ? "#9be87c" : "#fdecc8";
            }

            const elWaktu = ambilEl("hud-teks-waktu");
            if (elWaktu) elWaktu.textContent = formatDurasiDetik(Math.round(state.timeElapsed));

            const elSkor = ambilEl("hud-teks-skor");
            if (elSkor) elSkor.textContent = String(hitungSkorStage());

            const elBadgeGateHp = ambilEl("badge-hp-modal-gerbang");
            if (elBadgeGateHp) {
                elBadgeGateHp.textContent = "HP: " + state.hp + " / " + state.maxHp;
            }
        }

        function simpanProgresStage(extraFields) {
            if (typeof simpanStage !== "function") return;
            const solvedIds = state.gates.filter(function (g) { return g.solved; }).map(function (g) { return g.id; });
            const st = Object.assign({
                status: state.victory ? "selesai" : (aktif ? "sedang_berlangsung" : "belum_dimulai"),
                skor: hitungSkorStage(),
                selesaiCount: solvedIds.length,
                totalItem: 3,
                gerbangSelesai: solvedIds.length,
                totalGerbang: 3,
                daftarGerbangSelesai: solvedIds,
                koin: state.coinsCollected,
                totalKoin: state.totalCoins,
                sisaHp: state.hp,
                maxHp: state.maxHp,
                checkpointAktif: state.checkpoint.activated,
                waktuDetik: Math.round(state.timeElapsed)
            }, extraFields || {});
            simpanStage(kodeStage, st);
        }

        function bukaModalGameOver() {
            const modal = ambilEl("modal-gameover-platformer");
            const desc = ambilEl("teks-gameover-platformer");
            const btnRespawn = ambilEl("tombol-respawn-platformer");
            if (!modal) return;
            if (desc) {
                desc.textContent = state.checkpoint.activated
                    ? "HP habis! Kamu akan kembali ke " + state.checkpoint.label + " dengan HP penuh (" + state.maxHp + " HP). Gerbang soal yang sudah selesai tetap terbuka!"
                    : "HP habis! Belum ada checkpoint aktif, kamu akan kembali ke awal stage dengan HP penuh (" + state.maxHp + " HP).";
            }
            if (btnRespawn) {
                btnRespawn.textContent = state.checkpoint.activated
                    ? "Respawn di " + state.checkpoint.label + " (HP Penuh)"
                    : "Kembali ke Awal Stage (HP Penuh)";
            }
            modal.classList.remove("tersembunyi");
            if (typeof putarSFX === "function") putarSFX("wrong.mp3");
        }

        function bukaModalKemenangan() {
            simpanProgresStage({ status: "selesai" });
            const modal = ambilEl("modal-menang-platformer");
            if (!modal) return;
            const elSkor = ambilEl("menang-skor-stage");
            const elKoin = ambilEl("menang-koin-stage");
            const elHp = ambilEl("menang-hp-stage");
            const elWaktu = ambilEl("menang-waktu-stage");
            if (elSkor) elSkor.textContent = hitungSkorStage() + " / 100";
            if (elKoin) elKoin.textContent = state.coinsCollected + " / " + state.totalCoins;
            if (elHp) elHp.textContent = state.hp + " / " + state.maxHp;
            if (elWaktu) elWaktu.textContent = formatDurasiDetik(Math.round(state.timeElapsed));
            modal.classList.remove("tersembunyi");
            if (typeof putarSFX === "function") putarSFX("correct.mp3");
        }

        const callbacks = {
            onJump: function () {
                if (typeof putarSFX === "function") putarSFX("click.mp3");
            },
            onDamage: function () {
                if (typeof putarSFX === "function") putarSFX("wrong.mp3");
                perbaruiHUD();
            },
            onCoin: function () {
                if (typeof putarSFX === "function") putarSFX("correct.mp3");
                perbaruiHUD();
            },
            onStomp: function () {
                if (typeof putarSFX === "function") putarSFX("drop.mp3");
                perbaruiHUD();
            },
            onCheckpoint: function (cp) {
                if (typeof putarSFX === "function") putarSFX("correct.mp3");
                perbaruiHUD();
                simpanProgresStage();
                tampilkanToast(cp.label + " Diaktifkan! HP Dipulihkan Penuh (" + state.maxHp + " HP)", 3000);
            },
            onFinishBlocked: function (unlocked, total) {
                if (typeof putarSFX === "function") putarSFX("wrong.mp3");
                tampilkanToast("Masih ada gerbang soal terkunci (" + unlocked + "/" + total + ")! Selesaikan dulu.", 2600);
            },
            onEnterGate: function (gate) {
                input.left = false;
                input.right = false;
                input.jump = false;
                perbaruiHUD();
                if (opsi.onOpenGate) {
                    opsi.onOpenGate(gate, apiPublik);
                }
            },
            onGameOver: function () {
                const modalSoal = ambilEl("modal-soal-platformer");
                if (modalSoal) modalSoal.classList.add("tersembunyi");
                input.left = false;
                input.right = false;
                input.jump = false;
                perbaruiHUD();
                bukaModalGameOver();
            },
            onVictory: function () {
                input.left = false;
                input.right = false;
                input.jump = false;
                perbaruiHUD();
                bukaModalKemenangan();
            }
        };

        function loop(ts) {
            if (!lastTime) lastTime = ts;
            const dt = (ts - lastTime) / 1000;
            lastTime = ts;

            if (aktif) {
                PlatformerEngine.step(state, input, dt, callbacks);
                const canvas = ambilEl("platformer-canvas");
                if (canvas && assets) {
                    const ctx = canvas.getContext("2d");
                    PlatformerEngine.render(ctx, state, assets);
                }
                perbaruiHUD();
            }
            rafId = requestAnimationFrame(loop);
        }

        function pasangKontrolKeyboardDanSentuh() {
            window.addEventListener("keydown", function (e) {
                if (!aktif || state.pausedForGate || state.pausedManual || state.gameOver || state.victory) {
                    return;
                }
                const tag = document.activeElement && document.activeElement.tagName;
                if (tag === "INPUT" || tag === "TEXTAREA") return;

                if (e.code === "KeyA") {
                    input.left = true;
                } else if (e.code === "KeyD") {
                    input.right = true;
                } else if (e.code === "KeyW" || e.code === "Space") {
                    if (e.code === "Space") e.preventDefault();
                    input.jump = true;
                } else if (e.code === "Escape") {
                    bukaPause(true);
                }
            });

            window.addEventListener("keyup", function (e) {
                if (e.code === "KeyA") input.left = false;
                else if (e.code === "KeyD") input.right = false;
                else if (e.code === "KeyW" || e.code === "Space") input.jump = false;
            });

            window.addEventListener("blur", function () {
                input.left = false;
                input.right = false;
                input.jump = false;
            });

            function ikatTombolSentuh(id, key) {
                const btn = ambilEl(id);
                if (!btn) return;
                const mulai = function (ev) {
                    ev.preventDefault();
                    if (!state.pausedForGate && !state.pausedManual) {
                        input[key] = true;
                        btn.classList.add("ditekan");
                    }
                };
                const selesai = function (ev) {
                    if (ev) ev.preventDefault();
                    input[key] = false;
                    btn.classList.remove("ditekan");
                };
                btn.addEventListener("mousedown", mulai);
                btn.addEventListener("mouseup", selesai);
                btn.addEventListener("mouseleave", selesai);
                btn.addEventListener("touchstart", mulai, { passive: false });
                btn.addEventListener("touchend", selesai, { passive: false });
                btn.addEventListener("touchcancel", selesai);
            }

            ikatTombolSentuh("btn-sentuh-kiri", "left");
            ikatTombolSentuh("btn-sentuh-kanan", "right");
            ikatTombolSentuh("btn-sentuh-lompat", "jump");
        }

        function bukaPause(buka) {
            state.pausedManual = Boolean(buka);
            const modalPause = ambilEl("modal-pause-platformer");
            if (modalPause) {
                modalPause.classList.toggle("tersembunyi", !buka);
            }
            if (buka) {
                input.left = false;
                input.right = false;
                input.jump = false;
            }
        }

        function resetTotalStage() {
            if (typeof resetStage === "function") resetStage(kodeStage);
            window.location.reload();
        }

        const apiPublik = {
            state: state,
            input: input,
            start: async function () {
                aktif = true;
                perbaruiHUD();
                simpanProgresStage();
                if (!assets) {
                    assets = await PlatformerAssets.muatSemuaUntukStage(kodeStage);
                }
                if (!rafId) {
                    rafId = requestAnimationFrame(loop);
                }
            },
            pauseManual: function (val) {
                bukaPause(val);
            },
            perbaruiHUD: perbaruiHUD,
            simpanProgres: simpanProgresStage,
            tandaiGerbangTerbuka: function (gateId, extraStats) {
                const modalSoal = ambilEl("modal-soal-platformer");
                if (modalSoal) modalSoal.classList.add("tersembunyi");
                PlatformerEngine.markGateSolved(state, gateId);
                perbaruiHUD();
                simpanProgresStage(extraStats);
                tampilkanToast("Gerbang Soal Terbuka! Lanjutkan petualanganmu.", 2200);
            },
            penaltiJawabanSalah: function (extraStats) {
                PlatformerEngine.applyWrongAnswerPenalty(state, callbacks);
                perbaruiHUD();
                simpanProgresStage(extraStats);
                return state.hp;
            }
        };

        // Pasang event listener tombol modal standar platformer
        const btnPause = ambilEl("tombol-pause-platformer");
        if (btnPause) btnPause.addEventListener("click", function () { bukaPause(true); });

        const btnLanjutPause = ambilEl("tombol-lanjut-pause");
        if (btnLanjutPause) btnLanjutPause.addEventListener("click", function () { bukaPause(false); });

        const btnResetPause = ambilEl("tombol-ulang-pause");
        if (btnResetPause) btnResetPause.addEventListener("click", resetTotalStage);

        const btnRespawn = ambilEl("tombol-respawn-platformer");
        if (btnRespawn) {
            btnRespawn.addEventListener("click", function () {
                const modal = ambilEl("modal-gameover-platformer");
                if (modal) modal.classList.add("tersembunyi");
                PlatformerEngine.respawnAtCheckpoint(state);
                perbaruiHUD();
            });
        }

        const btnRestartGO = ambilEl("tombol-ulang-gameover");
        if (btnRestartGO) btnRestartGO.addEventListener("click", resetTotalStage);

        pasangKontrolKeyboardDanSentuh();
        perbaruiHUD();
        return apiPublik;
    }
};
