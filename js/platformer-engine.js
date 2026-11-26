/**
 * File: js/platformer-engine.js
 * Deskripsi: Mesin permainan 2D Side-Scrolling Platformer murni (terpisah dari DOM modal soal):
 * fisika gerak (A/D/W/Space), kamera parallax, collision tiles/platform bergerak,
 * HP & invulnerability 1,5 detik, monster diinjak vs dihindari, rintangan duri/jurang/proyektil,
 * sistem Checkpoint, 3 Penghalang Soal, Koin opsional, dan Garis Finish.
 */

const PlatformerEngine = {
    VIEW_W: 640,
    VIEW_H: 360,
    TILE: 32,
    GRAVITY: 1180,
    MOVE_SPEED: 215,
    JUMP_VEL: -475,
    STOMP_BOUNCE: -320,
    MAX_FALL: 660,
    INVULN_DURATION: 1.5,

    rectsOverlap: function (a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    },

    createState: function (levelCfg, options) {
        const opts = options || {};
        const maxHp = Math.max(1, Number(opts.maxHp || 5));
        const solvedSet = {};
        if (Array.isArray(opts.solvedGateIds)) {
            opts.solvedGateIds.forEach(function (id) { solvedSet[id] = true; });
        }

        const startX = Number(levelCfg.spawn.x || 48);
        const startY = Number(levelCfg.spawn.y || 254);

        const movingPlatforms = (levelCfg.movingPlatforms || []).map(function (mp) {
            return {
                x: mp.x,
                y: mp.y,
                baseX: mp.x,
                baseY: mp.y,
                w: mp.w || 96,
                h: mp.h || 20,
                axis: mp.axis || "x",
                range: mp.range || 64,
                speed: mp.speed || 1.6,
                phase: mp.phase || 0,
                dx: 0,
                dy: 0,
                t: 0
            };
        });

        const enemies = (levelCfg.enemies || []).map(function (en, idx) {
            return {
                id: en.id || ("enemy-" + idx),
                kind: en.kind || "slime",
                stompable: en.stompable !== false,
                x: en.x,
                y: en.y,
                baseX: en.x,
                baseY: en.y,
                w: en.w || 26,
                h: en.h || 26,
                spriteW: 32,
                spriteH: 32,
                vx: en.vx || (en.stompable !== false ? 56 : 48),
                minX: en.minX !== undefined ? en.minX : en.x - 80,
                maxX: en.maxX !== undefined ? en.maxX : en.x + 80,
                ampY: en.ampY || (en.stompable === false ? 18 : 0),
                shootInterval: en.shootInterval || 0,
                shootTimer: en.shootOffset || 1.4,
                alive: true,
                deadTimer: 0,
                hurtTimer: 0,
                animTime: (idx * 0.37) % 2,
                facing: en.vx && en.vx < 0 ? -1 : 1
            };
        });

        const gates = (levelCfg.gates || []).map(function (g, idx) {
            const gid = g.id || ("gate-" + (idx + 1));
            return {
                id: gid,
                index: idx,
                label: g.label || ("Gerbang " + (idx + 1)),
                x: g.x,
                y: g.y,
                w: g.w || 48,
                h: g.h || 96,
                solved: Boolean(solvedSet[gid])
            };
        });

        const coins = (levelCfg.coins || []).map(function (c, idx) {
            return {
                id: "coin-" + idx,
                x: c.x,
                y: c.y,
                w: 20,
                h: 20,
                collected: Boolean(opts.collectedCoinIds && opts.collectedCoinIds[idx]),
                shimmerTimer: 0
            };
        });

        const cpCfg = levelCfg.checkpoint || { label: "CP 1", x: 1560, y: 240 };
        const checkpointActive = Boolean(opts.checkpointActive);
        const spawnActualX = checkpointActive ? cpCfg.x - 4 : startX;
        const spawnActualY = checkpointActive ? cpCfg.y + 56 - 42 : startY;

        return {
            level: levelCfg,
            worldWidth: levelCfg.worldWidth || 3200,
            worldHeight: levelCfg.worldHeight || 360,
            player: {
                x: spawnActualX,
                y: spawnActualY,
                w: 22,
                h: 42,
                vx: 0,
                vy: 0,
                facing: 1,
                onGround: false,
                coyoteTimer: 0,
                jumpBufferTimer: 0,
                jumpHeldPrev: false,
                landTimer: 0,
                hurtTimer: 0,
                deathTimer: 0,
                invulnTimer: 0,
                animState: "idle",
                animTime: 0,
                standingPlatform: null,
                lastSafeX: spawnActualX,
                lastSafeY: spawnActualY
            },
            hp: maxHp,
            maxHp: maxHp,
            coinsCollected: coins.filter(function (c) { return c.collected; }).length,
            totalCoins: coins.length,
            bonusPoints: 0,
            timeElapsed: Number(opts.timeElapsed || 0),
            cameraX: Math.max(0, Math.min((levelCfg.worldWidth || 3200) - this.VIEW_W, spawnActualX - this.VIEW_W * 0.35)),
            solids: levelCfg.solids || [],
            platforms: levelCfg.platforms || [],
            movingPlatforms: movingPlatforms,
            spikes: levelCfg.spikes || [],
            enemies: enemies,
            projectiles: [],
            gates: gates,
            coins: coins,
            checkpoint: {
                label: cpCfg.label || "CP 1",
                x: cpCfg.x,
                y: cpCfg.y,
                w: 40,
                h: 56,
                activated: checkpointActive,
                animTime: 0
            },
            finish: Object.assign({ w: 48, h: 80 }, levelCfg.finish || { x: 3040, y: 216 }),
            particles: [],
            pausedForGate: null,
            pausedManual: false,
            gateCooldown: 0,
            finishLockCooldown: 0,
            gameOver: false,
            dying: false,
            victory: false
        };
    },

    spawnParticle: function (state, kind, x, y) {
        state.particles.push({
            kind: kind,
            x: x,
            y: y,
            t: 0,
            duration: 0.34
        });
    },

    applyPhysicalDamage: function (state, sourceX, callbacks, bypassInvuln) {
        const p = state.player;
        if (state.dying || state.gameOver || state.victory) {
            return false;
        }
        if (!bypassInvuln && p.invulnTimer > 0) {
            return false;
        }

        state.hp = Math.max(0, state.hp - 1);
        p.invulnTimer = this.INVULN_DURATION;
        p.hurtTimer = 0.28;
        this.spawnParticle(state, "fx_hurt", p.x + p.w / 2 - 12, p.y + p.h / 2 - 12);

        if (sourceX !== null && sourceX !== undefined) {
            const pushDir = p.x + p.w / 2 < sourceX ? -1 : 1;
            p.vx = pushDir * 165;
            p.vy = -220;
            p.onGround = false;
        }

        if (callbacks && callbacks.onDamage) {
            callbacks.onDamage(state);
        }

        if (state.hp <= 0) {
            state.dying = true;
            p.deathTimer = 0.72;
            p.vx = 0;
            p.vy = -120;
            p.animState = "death";
            p.animTime = 0;
        }
        return true;
    },

    applyWrongAnswerPenalty: function (state, callbacks) {
        // Penalti jawaban salah SELALU mengurangi 1 HP (mengabaikan invulnerability fisik!)
        const p = state.player;
        if (state.gameOver || state.victory) {
            return false;
        }
        state.hp = Math.max(0, state.hp - 1);
        p.hurtTimer = 0.25;
        if (callbacks && callbacks.onDamage) {
            callbacks.onDamage(state);
        }
        if (state.hp <= 0) {
            state.pausedForGate = null;
            state.dying = true;
            p.deathTimer = 0.65;
            p.animState = "death";
            p.animTime = 0;
        }
        return true;
    },

    markGateSolved: function (state, gateId) {
        const gate = state.gates.find(function (g) { return g.id === gateId; });
        if (gate) {
            gate.solved = true;
            this.spawnParticle(state, "fx_stomp", gate.x + 8, gate.y + 32);
        }
        state.pausedForGate = null;
        state.gateCooldown = 0.35;
    },

    respawnAtCheckpoint: function (state) {
        const cp = state.checkpoint;
        const p = state.player;
        const rx = cp.activated ? cp.x - 4 : (state.level.spawn.x || 48);
        const ry = cp.activated ? cp.y + cp.h - p.h : (state.level.spawn.y || 254);

        p.x = rx;
        p.y = ry;
        p.vx = 0;
        p.vy = 0;
        p.hurtTimer = 0;
        p.invulnTimer = 0.8;
        p.deathTimer = 0;
        p.animState = "idle";
        p.animTime = 0;
        p.onGround = false;
        p.lastSafeX = rx;
        p.lastSafeY = ry;

        state.hp = state.maxHp;
        state.dying = false;
        state.gameOver = false;
        state.pausedForGate = null;
        state.gateCooldown = 0.4;
        state.projectiles = [];

        // Reset monster hidup secara adil, gerbang yang sudah terbuka tetap terbuka!
        state.enemies.forEach(function (en) {
            en.x = en.baseX;
            en.y = en.baseY;
            en.alive = true;
            en.deadTimer = 0;
            en.hurtTimer = 0;
            en.shootTimer = 1.2;
        });

        state.cameraX = Math.max(0, Math.min(state.worldWidth - this.VIEW_W, p.x - this.VIEW_W * 0.35));
    },

    obtieneRectsSolid4Arah: function (state) {
        const rects = [];
        for (let i = 0; i < state.solids.length; i++) {
            rects.push(state.solids[i]);
        }
        for (let i = 0; i < state.gates.length; i++) {
            if (!state.gates[i].solved) {
                rects.push(state.gates[i]);
            }
        }
        return rects;
    },

    obtienePlatformSatuArah: function (state) {
        const list = [];
        for (let i = 0; i < state.platforms.length; i++) {
            list.push(state.platforms[i]);
        }
        for (let i = 0; i < state.movingPlatforms.length; i++) {
            list.push(state.movingPlatforms[i]);
        }
        return list;
    },

    step: function (state, input, dtRaw, callbacks) {
        const dt = Math.min(0.035, Math.max(0.001, dtRaw || 0.016));
        const p = state.player;
        const cbs = callbacks || {};

        // Update animasi dekorasi koin, bendera, checkpoint, partikel walau jeda ringan
        if (state.pausedManual || state.victory || state.gameOver) {
            return;
        }

        // Jika animasi kematian sedang diputar menuju Game Over
        if (state.dying) {
            p.animState = "death";
            p.animTime += dt;
            p.deathTimer -= dt;
            if (p.deathTimer <= 0) {
                state.dying = false;
                state.gameOver = true;
                if (cbs.onGameOver) {
                    cbs.onGameOver(state);
                }
            }
            return;
        }

        // Jeda dunia platformer saat penghalang soal aktif
        if (state.pausedForGate) {
            return;
        }

        state.timeElapsed += dt;
        if (state.gateCooldown > 0) state.gateCooldown -= dt;
        if (state.finishLockCooldown > 0) state.finishLockCooldown -= dt;
        if (p.invulnTimer > 0) p.invulnTimer = Math.max(0, p.invulnTimer - dt);
        if (p.hurtTimer > 0) p.hurtTimer = Math.max(0, p.hurtTimer - dt);
        if (p.landTimer > 0) p.landTimer = Math.max(0, p.landTimer - dt);

        // 1. Update Platform Bergerak terlebih dahulu dan bawa pemain jika berdiri di atasnya
        for (let i = 0; i < state.movingPlatforms.length; i++) {
            const mp = state.movingPlatforms[i];
            const prevX = mp.x;
            const prevY = mp.y;
            mp.t += dt * mp.speed;
            const offset = Math.sin(mp.t + mp.phase) * mp.range;
            if (mp.axis === "y") {
                mp.y = mp.baseY + offset;
            } else {
                mp.x = mp.baseX + offset;
            }
            mp.dx = mp.x - prevX;
            mp.dy = mp.y - prevY;
            if (p.standingPlatform === mp) {
                p.x += mp.dx;
                p.y += mp.dy;
            }
        }

        // 2. Kontrol Gerak Karakter (A: kiri, D: kanan, W/Space: lompat identik)
        const moveDir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
        const targetVx = moveDir * this.MOVE_SPEED;
        const accel = p.onGround ? 1850 : 1250;
        if (p.hurtTimer <= 0) {
            if (p.vx < targetVx) {
                p.vx = Math.min(targetVx, p.vx + accel * dt);
            } else if (p.vx > targetVx) {
                p.vx = Math.max(targetVx, p.vx - accel * dt);
            }
            if (moveDir !== 0) {
                p.facing = moveDir;
            }
        }

        // Jump buffer & Coyote time untuk lompatan yang responsif dan natural
        const jumpEdge = Boolean(input.jump && !p.jumpHeldPrev);
        p.jumpHeldPrev = Boolean(input.jump);
        if (jumpEdge) {
            p.jumpBufferTimer = 0.12;
        } else if (p.jumpBufferTimer > 0) {
            p.jumpBufferTimer -= dt;
        }

        if (p.onGround) {
            p.coyoteTimer = 0.1;
        } else if (p.coyoteTimer > 0) {
            p.coyoteTimer -= dt;
        }

        if (p.jumpBufferTimer > 0 && p.coyoteTimer > 0) {
            p.vy = this.JUMP_VEL;
            p.onGround = false;
            p.standingPlatform = null;
            p.coyoteTimer = 0;
            p.jumpBufferTimer = 0;
            this.spawnParticle(state, "fx_jump", p.x + p.w / 2 - 12, p.y + p.h - 20);
            if (cbs.onJump) cbs.onJump();
        }

        // Variable jump cut bila tombol W/Space dilepas lebih awal
        if (!input.jump && p.vy < -160) {
            p.vy *= Math.pow(0.45, dt * 10);
        }

        // Gravitasi
        p.vy = Math.min(this.MAX_FALL, p.vy + this.GRAVITY * dt);

        const prevBottom = p.y + p.h;
        const solid4 = this.obtieneRectsSolid4Arah(state);
        const oneWayPlats = this.obtienePlatformSatuArah(state);

        // 3. Collision Detection Sumbu X (hanya terhadap dinding/tanah solid dan gerbang terkunci)
        p.x += p.vx * dt;
        if (p.x < 0) {
            p.x = 0;
            p.vx = 0;
        }
        if (p.x + p.w > state.worldWidth) {
            p.x = state.worldWidth - p.w;
            p.vx = 0;
        }
        for (let i = 0; i < solid4.length; i++) {
            const s = solid4[i];
            if (this.rectsOverlap(p, s)) {
                if (p.vx > 0) {
                    p.x = s.x - p.w;
                    p.vx = 0;
                } else if (p.vx < 0) {
                    p.x = s.x + s.w;
                    p.vx = 0;
                }
            }
        }

        // 4. Collision Detection Sumbu Y (tanah solid + platform satu-arah dari atas)
        const wasOnGround = p.onGround;
        p.y += p.vy * dt;
        p.onGround = false;
        p.standingPlatform = null;

        for (let i = 0; i < solid4.length; i++) {
            const s = solid4[i];
            if (this.rectsOverlap(p, s)) {
                if (p.vy >= 0) {
                    p.y = s.y - p.h;
                    p.vy = 0;
                    p.onGround = true;
                } else if (p.vy < 0) {
                    p.y = s.y + s.h;
                    p.vy = 0;
                }
            }
        }

        if (p.vy >= 0) {
            for (let i = 0; i < oneWayPlats.length; i++) {
                const pl = oneWayPlats[i];
                const horizOverlap = p.x + p.w > pl.x + 2 && p.x < pl.x + pl.w - 2;
                const tol = 10 + Math.abs(pl.dy || 0);
                if (horizOverlap && prevBottom <= pl.y + tol && p.y + p.h >= pl.y) {
                    p.y = pl.y - p.h;
                    p.vy = 0;
                    p.onGround = true;
                    if (pl.axis) {
                        p.standingPlatform = pl;
                    }
                }
            }
        }

        if (p.onGround && !wasOnGround) {
            p.landTimer = 0.14;
            this.spawnParticle(state, "fx_land", p.x + p.w / 2 - 12, p.y + p.h - 20);
        }

        // Simpan posisi aman terakhir (di atas tanah statis jauh dari jurang) untuk recovery lubang
        if (p.onGround && !p.standingPlatform && p.y < 310) {
            let safeGround = false;
            for (let i = 0; i < state.solids.length; i++) {
                const s = state.solids[i];
                if (Math.abs(p.y + p.h - s.y) < 3 && p.x >= s.x + 8 && p.x + p.w <= s.x + s.w - 8) {
                    safeGround = true;
                    break;
                }
            }
            if (safeGround) {
                p.lastSafeX = p.x;
                p.lastSafeY = p.y;
            }
        }

        // 5. Deteksi Jatuh ke Jurang / Lubang
        if (p.y > state.worldHeight + 28) {
            this.applyPhysicalDamage(state, null, cbs, true);
            if (!state.dying && state.hp > 0) {
                p.x = p.lastSafeX;
                p.y = p.lastSafeY;
                p.vx = 0;
                p.vy = 0;
            }
        }

        // 6. Deteksi Sentuhan Duri (Spikes)
        for (let i = 0; i < state.spikes.length; i++) {
            const sp = state.spikes[i];
            const hitbox = { x: sp.x + 3, y: sp.y + 4, w: (sp.w || 32) - 6, h: (sp.h || 20) - 4 };
            if (this.rectsOverlap(p, hitbox)) {
                this.applyPhysicalDamage(state, sp.x + 16, cbs, false);
                break;
            }
        }

        // 7. Update Monster (Kategori A bisa diinjak, Kategori B harus dihindari + proyektil)
        for (let i = 0; i < state.enemies.length; i++) {
            const en = state.enemies[i];
            en.animTime += dt;
            if (en.hurtTimer > 0) en.hurtTimer -= dt;

            if (!en.alive) {
                if (en.deadTimer > 0) en.deadTimer -= dt;
                continue;
            }

            if (en.stompable) {
                en.x += en.vx * dt;
                if (en.x <= en.minX) {
                    en.x = en.minX;
                    en.vx = Math.abs(en.vx);
                } else if (en.x + en.w >= en.maxX) {
                    en.x = en.maxX - en.w;
                    en.vx = -Math.abs(en.vx);
                }
                en.facing = en.vx >= 0 ? 1 : -1;
            } else {
                en.x += en.vx * dt;
                if (en.x <= en.minX) {
                    en.x = en.minX;
                    en.vx = Math.abs(en.vx);
                } else if (en.x + en.w >= en.maxX) {
                    en.x = en.maxX - en.w;
                    en.vx = -Math.abs(en.vx);
                }
                en.facing = en.vx >= 0 ? 1 : -1;
                en.y = en.baseY + Math.sin(en.animTime * 3.1) * en.ampY;

                // Tembakkan proyektil periodik bila jarak pemain dekat
                if (en.shootInterval > 0 && Math.abs((p.x + p.w / 2) - (en.x + en.w / 2)) < 360) {
                    en.shootTimer -= dt;
                    if (en.shootTimer <= 0) {
                        en.shootTimer = en.shootInterval;
                        const dirX = p.x < en.x ? -1 : 1;
                        state.projectiles.push({
                            x: en.x + en.w / 2 - 6,
                            y: en.y + en.h / 2 - 6,
                            w: 12,
                            h: 12,
                            vx: dirX * 148,
                            vy: 12,
                            life: 3.2,
                            animTime: 0
                        });
                    }
                }
            }

            // Cek tabrakan pemain dengan monster
            if (this.rectsOverlap(p, en)) {
                const isStompHit = en.stompable && p.vy > 0 && prevBottom <= en.y + en.h * 0.62;
                if (isStompHit) {
                    en.alive = false;
                    en.deadTimer = 0.48;
                    p.vy = this.STOMP_BOUNCE;
                    p.onGround = false;
                    state.bonusPoints += 10;
                    this.spawnParticle(state, "fx_stomp", en.x, en.y - 4);
                    if (cbs.onStomp) cbs.onStomp(en, state);
                } else {
                    this.applyPhysicalDamage(state, en.x + en.w / 2, cbs, false);
                }
            }
        }

        // 8. Update Proyektil Monster
        for (let i = state.projectiles.length - 1; i >= 0; i--) {
            const pr = state.projectiles[i];
            pr.x += pr.vx * dt;
            pr.y += pr.vy * dt;
            pr.life -= dt;
            pr.animTime += dt;

            let hitSolid = pr.life <= 0;
            if (!hitSolid) {
                for (let j = 0; j < state.solids.length; j++) {
                    if (this.rectsOverlap(pr, state.solids[j])) {
                        hitSolid = true;
                        break;
                    }
                }
            }
            if (!hitSolid && this.rectsOverlap(p, pr)) {
                this.applyPhysicalDamage(state, pr.x + 6, cbs, false);
                hitSolid = true;
            }
            if (hitSolid) {
                state.projectiles.splice(i, 1);
            }
        }

        // 9. Update & Deteksi Checkpoint
        const cp = state.checkpoint;
        cp.animTime += dt;
        if (!cp.activated && this.rectsOverlap(p, cp)) {
            cp.activated = true;
            state.hp = state.maxHp;
            this.spawnParticle(state, "fx_coin", cp.x + 8, cp.y + 8);
            if (cbs.onCheckpoint) {
                cbs.onCheckpoint(cp, state);
            }
        }

        // 10. Koleksi Koin Opsional
        for (let i = 0; i < state.coins.length; i++) {
            const coin = state.coins[i];
            if (coin.shimmerTimer > 0) coin.shimmerTimer -= dt;
            if (!coin.collected && this.rectsOverlap(p, coin)) {
                coin.collected = true;
                coin.shimmerTimer = 0.25;
                state.coinsCollected++;
                this.spawnParticle(state, "fx_coin", coin.x - 2, coin.y - 2);
                if (cbs.onCoin) cbs.onCoin(coin, state);
            }
        }

        // 11. Pemicu Penghalang Soal saat mendekati Gerbang yang belum selesai
        if (state.gateCooldown <= 0) {
            for (let i = 0; i < state.gates.length; i++) {
                const g = state.gates[i];
                if (!g.solved) {
                    const triggerZone = { x: g.x - 24, y: g.y - 16, w: g.w + 32, h: g.h + 24 };
                    if (this.rectsOverlap(p, triggerZone)) {
                        p.vx = 0;
                        p.vy = 0;
                        state.pausedForGate = g.id;
                        if (cbs.onEnterGate) {
                            cbs.onEnterGate(g, state);
                        }
                        break;
                    }
                }
            }
        }

        // 12. Cek Garis Finish
        if (this.rectsOverlap(p, state.finish)) {
            const unlocked = state.gates.filter(function (g) { return g.solved; }).length;
            if (unlocked >= state.gates.length) {
                state.victory = true;
                p.vx = 0;
                if (cbs.onVictory) {
                    cbs.onVictory(state);
                }
            } else if (state.finishLockCooldown <= 0) {
                state.finishLockCooldown = 1.6;
                if (cbs.onFinishBlocked) {
                    cbs.onFinishBlocked(unlocked, state.gates.length);
                }
            }
        }

        // 13. Update Partikel Efek
        for (let i = state.particles.length - 1; i >= 0; i--) {
            state.particles[i].t += dt;
            if (state.particles[i].t >= state.particles[i].duration) {
                state.particles.splice(i, 1);
            }
        }

        // 14. Tentukan Animasi Pemain
        let nextAnim = "idle";
        if (p.hurtTimer > 0) {
            nextAnim = "hurt";
        } else if (!p.onGround) {
            nextAnim = p.vy < 0 ? "jump" : "fall";
        } else if (p.landTimer > 0) {
            nextAnim = "land";
        } else if (Math.abs(p.vx) > 18) {
            nextAnim = "run";
        }
        if (nextAnim !== p.animState) {
            p.animState = nextAnim;
            p.animTime = 0;
        } else {
            p.animTime += dt;
        }

        // 15. Update Kamera Side-Scrolling
        const targetCamX = Math.max(0, Math.min(state.worldWidth - this.VIEW_W, p.x + p.w / 2 - this.VIEW_W * 0.36));
        state.cameraX += (targetCamX - state.cameraX) * Math.min(1, dt * 8.5);
    },

    render: function (ctx, state, assets) {
        const camX = Math.round(state.cameraX);
        const nowSec = state.timeElapsed;

        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, this.VIEW_W, this.VIEW_H);

        // 1. 4-Layer Parallax Backgrounds
        const parallaxSpeeds = [0.06, 0.2, 0.42, 0.66];
        for (let layer = 0; layer < 4; layer++) {
            const img = assets.parallax[layer];
            if (!img) continue;
            const w = img.width || this.VIEW_W;
            const off = -((Math.round(camX * parallaxSpeeds[layer]) % w + w) % w);
            ctx.drawImage(img, off, 0);
            ctx.drawImage(img, off + w, 0);
        }

        // 2. Dekorasi Latar Belakang (Pohon, Rumah, Mesin Sorting, Server Rack)
        const decos = state.level.decorations || [];
        for (let i = 0; i < decos.length; i++) {
            const d = decos[i];
            const img = assets.decorations[d.kind];
            if (!img) continue;
            const drawX = d.x - camX;
            if (drawX + img.width < -16 || drawX > this.VIEW_W + 16) continue;
            const drawY = d.y - img.height;
            ctx.drawImage(img, Math.round(drawX), Math.round(drawY));
        }

        // 3. Render Terrain Solids dengan Tileset Modular 32x32
        for (let i = 0; i < state.solids.length; i++) {
            const s = state.solids[i];
            if (s.x + s.w < camX - 32 || s.x > camX + this.VIEW_W + 32) continue;
            const cols = Math.round(s.w / 32);
            const rows = Math.round(s.h / 32);
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    let tx = 3;
                    let ty = 0;
                    if (r === 0) {
                        tx = cols === 1 ? 3 : (c === 0 ? 0 : (c === cols - 1 ? 2 : 1));
                        ty = cols === 1 ? 2 : 0;
                    } else {
                        tx = c === 0 ? 4 : (c === cols - 1 ? 6 : 3);
                        ty = 0;
                    }
                    PlatformerAssets.gambarTile(ctx, assets.tileset, tx, ty, s.x + c * 32 - camX, s.y + r * 32);
                }
            }
        }

        // 4. Platform Statis Melayang (Horizontal / Stone)
        for (let i = 0; i < state.platforms.length; i++) {
            const pl = state.platforms[i];
            if (pl.x + pl.w < camX - 32 || pl.x > camX + this.VIEW_W + 32) continue;
            const cols = Math.max(1, Math.round(pl.w / 32));
            for (let c = 0; c < cols; c++) {
                const tx = cols === 1 ? 3 : (c === 0 ? 0 : (c === cols - 1 ? 2 : 1));
                PlatformerAssets.gambarTile(ctx, assets.tileset, tx, 1, pl.x + c * 32 - camX, pl.y);
            }
        }

        // 5. Platform Bergerak
        for (let i = 0; i < state.movingPlatforms.length; i++) {
            const mp = state.movingPlatforms[i];
            if (assets.movingPlatform) {
                ctx.drawImage(assets.movingPlatform, Math.round(mp.x - camX), Math.round(mp.y));
            }
        }

        // 6. Rintangan Duri (Spikes)
        const spikeSp = assets.sprites.spike;
        for (let i = 0; i < state.spikes.length; i++) {
            const sp = state.spikes[i];
            PlatformerAssets.gambarFrame(ctx, spikeSp, 0, sp.x - camX, sp.y, false);
        }

        // 7. Checkpoint (CP 1 / CP 2 / CP 3)
        const cp = state.checkpoint;
        const cpSp = cp.activated ? assets.sprites.checkpoint_on : assets.sprites.checkpoint_off;
        const cpFrame = cp.activated ? Math.floor(cp.animTime * cpSp.fps) % cpSp.frames : 0;
        PlatformerAssets.gambarFrame(ctx, cpSp, cpFrame, cp.x - camX, cp.y, false);

        // Label kecil piksel CP di atas tiang
        ctx.fillStyle = cp.activated ? "#d9f0cd" : "#fdecc8";
        ctx.fillRect(Math.round(cp.x - camX + 2), Math.round(cp.y - 18), 36, 14);
        ctx.strokeStyle = "#2b1d13";
        ctx.lineWidth = 2;
        ctx.strokeRect(Math.round(cp.x - camX + 2), Math.round(cp.y - 18), 36, 14);
        ctx.fillStyle = "#2b1d13";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(cp.label, Math.round(cp.x - camX + 20), Math.round(cp.y - 8));

        // 8. Tiga Penghalang Soal (Locked vs Open Gate + Question Indicator)
        for (let i = 0; i < state.gates.length; i++) {
            const g = state.gates[i];
            const gSp = g.solved ? assets.sprites.gate_open : assets.sprites.gate_locked;
            PlatformerAssets.gambarFrame(ctx, gSp, 0, g.x - camX, g.y, false);
            if (!g.solved) {
                const indSp = assets.sprites.question_ind;
                const indFrame = Math.floor(nowSec * indSp.fps) % indSp.frames;
                const bobY = Math.round(Math.sin(nowSec * 4) * 3);
                PlatformerAssets.gambarFrame(ctx, indSp, indFrame, g.x - camX + 8, g.y - 28 + bobY, false);
            }
        }

        // 9. Garis Finish (Animated Flag)
        const finSp = assets.sprites.finish_flag;
        const finFrame = Math.floor(nowSec * finSp.fps) % finSp.frames;
        PlatformerAssets.gambarFrame(ctx, finSp, finFrame, state.finish.x - camX, state.finish.y, false);

        // 10. Koin Opsional
        const coinSp = assets.sprites.coin;
        for (let i = 0; i < state.coins.length; i++) {
            const c = state.coins[i];
            if (c.collected) continue;
            const cFrame = Math.floor((nowSec * coinSp.fps + i * 0.4) % coinSp.frames);
            const hover = Math.round(Math.sin(nowSec * 3.5 + i) * 2);
            PlatformerAssets.gambarFrame(ctx, coinSp, cFrame, c.x - camX - 2, c.y + hover - 2, false);
        }

        // 11. Monster (Kategori A & Kategori B)
        for (let i = 0; i < state.enemies.length; i++) {
            const en = state.enemies[i];
            if (!en.alive && en.deadTimer <= 0) continue;
            let anim = en.stompable ? "walk" : "fly";
            if (!en.alive) anim = "death";
            else if (en.hurtTimer > 0) anim = "hurt";

            const spKey = en.kind + "_" + anim;
            const sp = assets.sprites[spKey] || assets.sprites[en.kind + "_idle"];
            if (!sp) continue;

            const frame = !en.alive
                ? Math.min(sp.frames - 1, Math.floor((0.48 - en.deadTimer) / 0.48 * sp.frames))
                : Math.floor(en.animTime * sp.fps) % sp.frames;
            const drawX = en.x + en.w / 2 - sp.fw / 2 - camX;
            const drawY = en.y + en.h - sp.fh;
            PlatformerAssets.gambarFrame(ctx, sp, frame, drawX, drawY, en.facing < 0);
        }

        // 12. Proyektil Monster
        const projSp = assets.sprites.projectile;
        for (let i = 0; i < state.projectiles.length; i++) {
            const pr = state.projectiles[i];
            const pf = Math.floor(pr.animTime * projSp.fps) % projSp.frames;
            PlatformerAssets.gambarFrame(ctx, projSp, pf, pr.x - camX - 2, pr.y - 2, false);
        }

        // 13. Karakter Utama (dengan efek kedipan invulnerability 1,5 detik!)
        const p = state.player;
        const showBlink = p.invulnTimer > 0 && !state.dying && Math.floor(p.invulnTimer * 14) % 2 === 1;
        if (!showBlink) {
            const pSp = assets.sprites["player_" + p.animState] || assets.sprites.player_idle;
            const pf = p.animState === "death"
                ? Math.min(pSp.frames - 1, Math.floor(p.animTime * pSp.fps))
                : Math.floor(p.animTime * pSp.fps) % pSp.frames;
            const pDrawX = p.x + p.w / 2 - pSp.fw / 2 - camX;
            const pDrawY = p.y + p.h - pSp.fh;
            PlatformerAssets.gambarFrame(ctx, pSp, pf, pDrawX, pDrawY, p.facing < 0);
        }

        // 14. Efek Partikel (Lompat, Mendarat, Damage, Koin, Injak)
        for (let i = 0; i < state.particles.length; i++) {
            const pt = state.particles[i];
            const ptSp = assets.sprites[pt.kind];
            if (!ptSp) continue;
            const fIdx = Math.min(ptSp.frames - 1, Math.floor((pt.t / pt.duration) * ptSp.frames));
            PlatformerAssets.gambarFrame(ctx, ptSp, fIdx, pt.x - camX, pt.y, false);
        }
    }
};
