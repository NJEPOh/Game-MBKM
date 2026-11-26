/**
 * File: js/platformer-assets.js
 * Deskripsi: Memuat dan merender spritesheet animasi, tileset modular 32x32,
 * background 4-layer parallax, dekorasi, dan efek partikel bergaya Cozy Pixel Art.
 */

const PlatformerAssets = {
    SPRITE_SPECS: {
        player_idle:   { path: "assets/images/spritesheets/player/player_idle.png",   fw: 36, fh: 48, frames: 4, fps: 5 },
        player_run:    { path: "assets/images/spritesheets/player/player_run.png",    fw: 36, fh: 48, frames: 6, fps: 11 },
        player_jump:   { path: "assets/images/spritesheets/player/player_jump.png",   fw: 36, fh: 48, frames: 2, fps: 6 },
        player_fall:   { path: "assets/images/spritesheets/player/player_fall.png",   fw: 36, fh: 48, frames: 2, fps: 6 },
        player_land:   { path: "assets/images/spritesheets/player/player_land.png",   fw: 36, fh: 48, frames: 2, fps: 12 },
        player_hurt:   { path: "assets/images/spritesheets/player/player_hurt.png",   fw: 36, fh: 48, frames: 2, fps: 10 },
        player_death:  { path: "assets/images/spritesheets/player/player_death.png",  fw: 36, fh: 48, frames: 4, fps: 7 },

        slime_idle:    { path: "assets/images/spritesheets/enemies/slime_idle.png",   fw: 32, fh: 32, frames: 2, fps: 4 },
        slime_walk:    { path: "assets/images/spritesheets/enemies/slime_walk.png",   fw: 32, fh: 32, frames: 4, fps: 7 },
        slime_hurt:    { path: "assets/images/spritesheets/enemies/slime_hurt.png",   fw: 32, fh: 32, frames: 2, fps: 8 },
        slime_death:   { path: "assets/images/spritesheets/enemies/slime_death.png",  fw: 32, fh: 32, frames: 4, fps: 9 },

        mushroom_idle: { path: "assets/images/spritesheets/enemies/mushroom_idle.png",  fw: 32, fh: 32, frames: 2, fps: 4 },
        mushroom_walk: { path: "assets/images/spritesheets/enemies/mushroom_walk.png",  fw: 32, fh: 32, frames: 4, fps: 7 },
        mushroom_hurt: { path: "assets/images/spritesheets/enemies/mushroom_hurt.png",  fw: 32, fh: 32, frames: 2, fps: 8 },
        mushroom_death:{ path: "assets/images/spritesheets/enemies/mushroom_death.png", fw: 32, fh: 32, frames: 4, fps: 9 },

        drone_idle:    { path: "assets/images/spritesheets/enemies/drone_idle.png",   fw: 32, fh: 32, frames: 2, fps: 4 },
        drone_walk:    { path: "assets/images/spritesheets/enemies/drone_walk.png",   fw: 32, fh: 32, frames: 4, fps: 8 },
        drone_hurt:    { path: "assets/images/spritesheets/enemies/drone_hurt.png",   fw: 32, fh: 32, frames: 2, fps: 8 },
        drone_death:   { path: "assets/images/spritesheets/enemies/drone_death.png",  fw: 32, fh: 32, frames: 4, fps: 9 },

        bat_fly:       { path: "assets/images/spritesheets/enemies/bat_fly.png",      fw: 32, fh: 32, frames: 4, fps: 9 },
        bat_idle:      { path: "assets/images/spritesheets/enemies/bat_idle.png",     fw: 32, fh: 32, frames: 2, fps: 5 },
        bat_hurt:      { path: "assets/images/spritesheets/enemies/bat_hurt.png",     fw: 32, fh: 32, frames: 2, fps: 8 },

        spark_fly:     { path: "assets/images/spritesheets/enemies/spark_fly.png",    fw: 32, fh: 32, frames: 4, fps: 10 },
        spark_idle:    { path: "assets/images/spritesheets/enemies/spark_idle.png",   fw: 32, fh: 32, frames: 2, fps: 6 },
        spark_hurt:    { path: "assets/images/spritesheets/enemies/spark_hurt.png",   fw: 32, fh: 32, frames: 2, fps: 8 },

        glitch_fly:    { path: "assets/images/spritesheets/enemies/glitch_fly.png",   fw: 32, fh: 32, frames: 4, fps: 10 },
        glitch_idle:   { path: "assets/images/spritesheets/enemies/glitch_idle.png",  fw: 32, fh: 32, frames: 2, fps: 6 },
        glitch_hurt:   { path: "assets/images/spritesheets/enemies/glitch_hurt.png",  fw: 32, fh: 32, frames: 2, fps: 8 },

        projectile:    { path: "assets/images/spritesheets/enemies/projectile_enemy.png", fw: 16, fh: 16, frames: 4, fps: 10 },

        coin:          { path: "assets/images/common/collectibles/coin.png",          fw: 24, fh: 24, frames: 6, fps: 8 },
        checkpoint_off:{ path: "assets/images/common/interactive/checkpoint_inactive.png", fw: 40, fh: 56, frames: 1, fps: 1 },
        checkpoint_on: { path: "assets/images/common/interactive/checkpoint_active.png",   fw: 40, fh: 56, frames: 4, fps: 6 },
        gate_locked:   { path: "assets/images/common/interactive/gate_locked.png",    fw: 48, fh: 96, frames: 1, fps: 1 },
        gate_open:     { path: "assets/images/common/interactive/gate_open.png",      fw: 48, fh: 96, frames: 1, fps: 1 },
        question_ind:  { path: "assets/images/common/interactive/question_indicator.png", fw: 32, fh: 24, frames: 2, fps: 3 },
        spike:         { path: "assets/images/common/interactive/spike.png",          fw: 32, fh: 20, frames: 1, fps: 1 },
        finish_flag:   { path: "assets/images/common/interactive/finish_flag.png",    fw: 48, fh: 80, frames: 4, fps: 6 },

        fx_jump:       { path: "assets/images/common/effects/fx-jump.png",            fw: 24, fh: 24, frames: 4, fps: 12 },
        fx_land:       { path: "assets/images/common/effects/fx-land.png",            fw: 24, fh: 24, frames: 4, fps: 12 },
        fx_hurt:       { path: "assets/images/common/effects/fx-hurt.png",            fw: 24, fh: 24, frames: 4, fps: 12 },
        fx_coin:       { path: "assets/images/common/effects/fx-coin.png",            fw: 24, fh: 24, frames: 4, fps: 12 },
        fx_stomp:      { path: "assets/images/common/effects/fx-stomp.png",           fw: 32, fh: 32, frames: 4, fps: 12 }
    },

    STAGE_EXTRA_SPECS: {
        sequential: {
            tileset: "assets/images/stage-1-sequential/tilesets/tileset-forest.png",
            movingPlatform: "assets/images/stage-1-sequential/tilesets/moving-platform.png",
            parallax: [
                "assets/images/stage-1-sequential/backgrounds/parallax-1-sky.png",
                "assets/images/stage-1-sequential/backgrounds/parallax-2-far.png",
                "assets/images/stage-1-sequential/backgrounds/parallax-3-mid.png",
                "assets/images/stage-1-sequential/backgrounds/parallax-4-near.png"
            ],
            decorations: {
                tree: "assets/images/stage-1-sequential/decorations/tree.png",
                bush: "assets/images/stage-1-sequential/decorations/bush.png",
                house: "assets/images/stage-1-sequential/decorations/house.png",
                lantern: "assets/images/stage-1-sequential/decorations/lantern.png",
                rock: "assets/images/stage-1-sequential/decorations/rock.png",
                crate: "assets/images/stage-1-sequential/decorations/crate.png",
                signpost: "assets/images/stage-1-sequential/decorations/signpost.png",
                mushroomDeco: "assets/images/stage-1-sequential/decorations/mushroom-deco.png",
                flower: "assets/images/stage-1-sequential/decorations/flower.png",
                grass: "assets/images/stage-1-sequential/decorations/grass.png"
            }
        },
        bubbleSort: {
            tileset: "assets/images/stage-2-bubble-sort/tilesets/tileset-valley.png",
            movingPlatform: "assets/images/stage-2-bubble-sort/tilesets/moving-platform.png",
            parallax: [
                "assets/images/stage-2-bubble-sort/backgrounds/parallax-1-sky.png",
                "assets/images/stage-2-bubble-sort/backgrounds/parallax-2-far.png",
                "assets/images/stage-2-bubble-sort/backgrounds/parallax-3-mid.png",
                "assets/images/stage-2-bubble-sort/backgrounds/parallax-4-near.png"
            ],
            decorations: {
                machine: "assets/images/stage-2-bubble-sort/decorations/sorting-machine.png",
                pillar: "assets/images/stage-2-bubble-sort/decorations/pillar.png",
                crystal: "assets/images/stage-2-bubble-sort/decorations/crystal.png",
                shrub: "assets/images/stage-2-bubble-sort/decorations/shrub-valley.png"
            }
        },
        dos: {
            tileset: "assets/images/stage-3-dos/tilesets/tileset-tech.png",
            movingPlatform: "assets/images/stage-3-dos/tilesets/moving-platform.png",
            parallax: [
                "assets/images/stage-3-dos/backgrounds/parallax-1-sky.png",
                "assets/images/stage-3-dos/backgrounds/parallax-2-far.png",
                "assets/images/stage-3-dos/backgrounds/parallax-3-mid.png",
                "assets/images/stage-3-dos/backgrounds/parallax-4-near.png"
            ],
            decorations: {
                serverRack: "assets/images/stage-3-dos/decorations/server-rack.png",
                crtStation: "assets/images/stage-3-dos/decorations/crt-station.png",
                keyboardDesk: "assets/images/stage-3-dos/decorations/keyboard-desk.png",
                techLamp: "assets/images/stage-3-dos/decorations/tech-lamp.png"
            }
        }
    },

    muatGambar: function (src) {
        return new Promise(function (resolve) {
            const img = new Image();
            img.onload = function () { resolve(img); };
            img.onerror = function () { resolve(null); };
            img.src = src;
        });
    },

    muatSemuaUntukStage: async function (kodeStage) {
        const hasil = {
            sprites: {},
            tileset: null,
            movingPlatform: null,
            parallax: [],
            decorations: {}
        };

        const tugas = [];
        Object.keys(this.SPRITE_SPECS).forEach(function (k) {
            const spec = PlatformerAssets.SPRITE_SPECS[k];
            tugas.push(
                PlatformerAssets.muatGambar(spec.path).then(function (img) {
                    hasil.sprites[k] = Object.assign({ img: img }, spec);
                })
            );
        });

        const ekstra = this.STAGE_EXTRA_SPECS[kodeStage] || this.STAGE_EXTRA_SPECS.sequential;
        tugas.push(PlatformerAssets.muatGambar(ekstra.tileset).then(function (img) { hasil.tileset = img; }));
        tugas.push(PlatformerAssets.muatGambar(ekstra.movingPlatform).then(function (img) { hasil.movingPlatform = img; }));

        ekstra.parallax.forEach(function (pSrc, idx) {
            tugas.push(PlatformerAssets.muatGambar(pSrc).then(function (img) { hasil.parallax[idx] = img; }));
        });

        Object.keys(ekstra.decorations).forEach(function (dk) {
            tugas.push(
                PlatformerAssets.muatGambar(ekstra.decorations[dk]).then(function (img) {
                    hasil.decorations[dk] = img;
                })
            );
        });

        await Promise.all(tugas);
        return hasil;
    },

    gambarFrame: function (ctx, spriteObj, frameIdx, drawX, drawY, flipX) {
        if (!spriteObj || !spriteObj.img) {
            return;
        }
        const f = Math.max(0, Math.min(spriteObj.frames - 1, Math.floor(frameIdx)));
        const sx = f * spriteObj.fw;
        const rx = Math.round(drawX);
        const ry = Math.round(drawY);

        ctx.imageSmoothingEnabled = false;
        if (flipX) {
            ctx.save();
            ctx.translate(rx + spriteObj.fw, ry);
            ctx.scale(-1, 1);
            ctx.drawImage(spriteObj.img, sx, 0, spriteObj.fw, spriteObj.fh, 0, 0, spriteObj.fw, spriteObj.fh);
            ctx.restore();
        } else {
            ctx.drawImage(spriteObj.img, sx, 0, spriteObj.fw, spriteObj.fh, rx, ry, spriteObj.fw, spriteObj.fh);
        }
    },

    gambarTile: function (ctx, tilesetImg, colIdx, rowIdx, dx, dy) {
        if (!tilesetImg) {
            return;
        }
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tilesetImg, colIdx * 32, rowIdx * 32, 32, 32, Math.round(dx), Math.round(dy), 32, 32);
    }
};
