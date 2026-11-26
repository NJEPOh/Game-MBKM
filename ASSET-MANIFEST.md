# Asset Manifest — Misi Logika (Cozy Pixel Art 2D Platformer)

Seluruh aset visual mengikuti arah seni **Cozy Pixel Art 2D Side-Scrolling Platformer** dengan skala piksel *nearest-neighbor*, transparansi RGBA penuh (`ct=6`), serta penjangkaran (*anchor point*) kaki tepat di dasar frame (`y = frameH - 1`) agar sejajar dengan *collision box* platform.

## 1. Karakter Utama (`assets/images/spritesheets/player/` & `common/characters/`)

| Nama | Lokasi File | Fungsi | Ukuran Gambar | Ukuran Frame | Jumlah Frame | Stage | Status |
|---|---|---|---|---|---|---|---|
| `player_idle.png` | `assets/images/spritesheets/player/player_idle.png` | Animasi berdiri diam (bernapas & berkedip) | `144x48` | `36x48` | 4 | Semua | Terintegrasi |
| `player_run.png` | `assets/images/spritesheets/player/player_run.png` | Animasi berlari ke kiri/kanan (flip horizontal) | `216x48` | `36x48` | 6 | Semua | Terintegrasi |
| `player_jump.png` | `assets/images/spritesheets/player/player_jump.png` | Animasi melompat ke atas | `72x48` | `36x48` | 2 | Semua | Terintegrasi |
| `player_fall.png` | `assets/images/spritesheets/player/player_fall.png` | Animasi jatuh dari ketinggian | `72x48` | `36x48` | 2 | Semua | Terintegrasi |
| `player_land.png` | `assets/images/spritesheets/player/player_land.png` | Animasi mendarat di platform | `72x48` | `36x48` | 2 | Semua | Terintegrasi |
| `player_hurt.png` | `assets/images/spritesheets/player/player_hurt.png` | Animasi terkena damage | `72x48` | `36x48` | 2 | Semua | Terintegrasi |
| `player_death.png` | `assets/images/spritesheets/player/player_death.png` | Animasi kekalahan saat HP = 0 | `144x48` | `36x48` | 4 | Semua | Terintegrasi |
| `player-portrait.png` | `assets/images/common/characters/player-portrait.png` | Potret HUD & dialog karakter | `36x48` | `36x48` | 1 | Semua | Terintegrasi |

## 2. Monster & Proyektil (`assets/images/spritesheets/enemies/` & `common/enemies/`)

### A. Monster yang Dapat Diinjak
| Nama | Lokasi File | Fungsi | Ukuran Gambar | Ukuran Frame | Jumlah Frame | Stage | Status |
|---|---|---|---|---|---|---|---|
| `slime_idle.png` | `assets/images/spritesheets/enemies/slime_idle.png` | Slime diam | `64x32` | `32x32` | 2 | Stage 1, 2 | Terintegrasi |
| `slime_walk.png` | `assets/images/spritesheets/enemies/slime_walk.png` | Slime bergerak otomatis | `128x32` | `32x32` | 4 | Stage 1, 2 | Terintegrasi |
| `slime_hurt.png` | `assets/images/spritesheets/enemies/slime_hurt.png` | Slime terkena injak | `64x32` | `32x32` | 2 | Stage 1, 2 | Terintegrasi |
| `slime_death.png` | `assets/images/spritesheets/enemies/slime_death.png` | Slime kalah | `128x32` | `32x32` | 4 | Stage 1, 2 | Terintegrasi |
| `mushroom_idle.png` | `assets/images/spritesheets/enemies/mushroom_idle.png` | Monster jamur diam | `64x32` | `32x32` | 2 | Stage 1, 2 | Terintegrasi |
| `mushroom_walk.png` | `assets/images/spritesheets/enemies/mushroom_walk.png` | Monster jamur berjalan | `128x32` | `32x32` | 4 | Stage 1, 2 | Terintegrasi |
| `mushroom_hurt.png` | `assets/images/spritesheets/enemies/mushroom_hurt.png` | Monster jamur terluka | `64x32` | `32x32` | 2 | Stage 1, 2 | Terintegrasi |
| `mushroom_death.png` | `assets/images/spritesheets/enemies/mushroom_death.png` | Monster jamur kalah | `128x32` | `32x32` | 4 | Stage 1, 2 | Terintegrasi |
| `drone_idle.png` | `assets/images/spritesheets/enemies/drone_idle.png` | Bot roda DOS diam | `64x32` | `32x32` | 2 | Stage 3 | Terintegrasi |
| `drone_walk.png` | `assets/images/spritesheets/enemies/drone_walk.png` | Bot roda DOS berpatroli | `128x32` | `32x32` | 4 | Stage 3 | Terintegrasi |
| `drone_hurt.png` | `assets/images/spritesheets/enemies/drone_hurt.png` | Bot roda DOS terluka | `64x32` | `32x32` | 2 | Stage 3 | Terintegrasi |
| `drone_death.png` | `assets/images/spritesheets/enemies/drone_death.png` | Bot roda DOS kalah | `128x32` | `32x32` | 4 | Stage 3 | Terintegrasi |

### B. Monster yang Harus Dihindari & Proyektil
| Nama | Lokasi File | Fungsi | Ukuran Gambar | Ukuran Frame | Jumlah Frame | Stage | Status |
|---|---|---|---|---|---|---|---|
| `bat_fly.png` / `idle` / `hurt` | `assets/images/spritesheets/enemies/bat_*.png` | Kelelawar terbang (bahaya diinjak/disentuh) | `128x32` / `64x32` | `32x32` | 4 / 2 | Stage 1 | Terintegrasi |
| `spark_fly.png` / `idle` / `hurt` | `assets/images/spritesheets/enemies/spark_*.png` | Bola energi lembah sorting (penghalang & penembak) | `128x32` / `64x32` | `32x32` | 4 / 2 | Stage 2 | Terintegrasi |
| `glitch_fly.png` / `idle` / `hurt` | `assets/images/spritesheets/enemies/glitch_*.png` | Virus glitch terbang (penghalang & penembak) | `128x32` / `64x32` | `32x32` | 4 / 2 | Stage 3 | Terintegrasi |
| `projectile_enemy.png` | `assets/images/spritesheets/enemies/projectile_enemy.png` | Proyektil monster terbang | `64x16` | `16x16` | 4 | Semua | Terintegrasi |

## 3. Objek Interaktif, Kolektibel, HUD, & Partikel (`assets/images/common/`)

| Nama | Lokasi File | Fungsi | Ukuran Gambar | Ukuran Frame | Jumlah Frame | Stage | Status |
|---|---|---|---|---|---|---|---|
| `checkpoint_inactive.png` | `assets/images/common/interactive/checkpoint_inactive.png` | Tiang checkpoint belum aktif | `40x56` | `40x56` | 1 | Semua | Terintegrasi |
| `checkpoint_active.png` | `assets/images/common/interactive/checkpoint_active.png` | Animasi checkpoint aktif | `160x56` | `40x56` | 4 | Semua | Terintegrasi |
| `gate_locked.png` | `assets/images/common/interactive/gate_locked.png` | Gerbang penghalang soal terkunci | `48x96` | `48x96` | 1 | Semua | Terintegrasi |
| `gate_open.png` | `assets/images/common/interactive/gate_open.png` | Gerbang soal setelah terbuka | `48x96` | `48x96` | 1 | Semua | Terintegrasi |
| `question_indicator.png` | `assets/images/common/interactive/question_indicator.png` | Penanda tantangan `[?]` di atas gerbang | `64x24` | `32x24` | 2 | Semua | Terintegrasi |
| `spike.png` | `assets/images/common/interactive/spike.png` | Rintangan duri berbahaya | `32x20` | `32x20` | 1 | Semua | Terintegrasi |
| `finish_flag.png` | `assets/images/common/interactive/finish_flag.png` | Bendera finish berkibar | `192x80` | `48x80` | 4 | Semua | Terintegrasi |
| `coin.png` | `assets/images/common/collectibles/coin.png` | Koin emas opsional berputar | `144x24` | `24x24` | 6 | Semua | Terintegrasi |
| `coin_collected.png` | `assets/images/common/collectibles/coin_collected.png` | Kilau koin terambil | `24x24` | `24x24` | 1 | Semua | Terintegrasi |
| `heart-full.png` / `heart-empty.png` | `assets/images/common/ui/heart-*.png` | Indikator HP HUD | `24x24` | `24x24` | 1 | Semua | Terintegrasi |
| `coin-hud.png`, `gate-*-hud.png`, `btn-*.png` | `assets/images/common/ui/` | Ikon HUD & kontrol sentuh | `24x24` | `24x24` | 1 | Semua | Terintegrasi |
| `fx-jump.png`, `fx-land.png`, `fx-hurt.png`, `fx-coin.png`, `fx-stomp.png` | `assets/images/common/effects/` | Efek partikel lompat, mendarat, damage, koin, injak | `96x24` / `128x32` | `24x24` / `32x32` | 4 | Semua | Terintegrasi |

## 4. Tileset, Parallax 4-Lapis, & Aset Khusus Per Stage

### Stage 1 — Sequential Forest (`assets/images/stage-1-sequential/`)
- `tilesets/tileset-forest.png` (`256x96`, grid `32x32` — 24 tile tanah, rumput, sudut, batu, platform horizontal/vertikal, jembatan kayu)
- `tilesets/moving-platform.png` (`96x24`, 1 frame)
- `backgrounds/parallax-1-sky.png` s/d `parallax-4-near.png` (`640x360`, 4 lapis parallax seamless)
- `decorations/`: `tree.png`, `bush.png`, `house.png`, `lantern.png`, `rock.png`, `crate.png`, `signpost.png`, `mushroom-deco.png`, `flower.png`, `grass.png`
- `activities/`: **20 ilustrasi kegiatan sehari-hari unik** untuk panel soal Sequential.

### Stage 2 — Bubble Sort Valley (`assets/images/stage-2-bubble-sort/`)
- `tilesets/tileset-valley.png` (`256x96`, grid `32x32`) & `tilesets/moving-platform.png` (`96x24`)
- `backgrounds/parallax-1-sky.png` s/d `parallax-4-near.png` (`640x360`, 4 lapis parallax seamless)
- `decorations/`: `sorting-machine.png`, `pillar.png`, `crystal.png`, `shrub-valley.png`
- `characters/person-1..6.png`, `objects/{block,book,bottle,box,tree,vehicle,object}-1..6.png`, `indicators/{compare,swap,sorted}.png`

### Stage 3 — DOS Tech Dungeon (`assets/images/stage-3-dos/`)
- `tilesets/tileset-tech.png` (`256x96`, grid `32x32`) & `tilesets/moving-platform.png` (`96x24`)
- `backgrounds/parallax-1-sky.png` s/d `parallax-4-near.png` (`640x360`, 4 lapis parallax seamless)
- `decorations/`: `server-rack.png`, `crt-station.png`, `keyboard-desk.png`, `tech-lamp.png`, `desk-plant.png`, `diskette.png`, `coffee-mug.png`
- `computers/retro-pc.png`, `folders/folder-{closed,open}.png`, `files/file-{txt,doc}.png`

## 5. Audio (`assets/audio/`)
- `bgm/music-background-1.mp3` s/d `9.mp3`
- `sfx/hover.mp3`, `click.mp3`, `drop.mp3`, `correct.mp3`, `wrong.mp3`
