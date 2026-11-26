/**
 * File: js/platformer-levels.js
 * Deskripsi: Definisi level 2D side-scrolling platformer untuk ketiga stage
 * (Stage 1: Sequential Forest, Stage 2: Bubble Sort Valley, Stage 3: DOS Tech Dungeon).
 * Setiap level memiliki area awal, platform bervariasi ketinggian, platform bergerak,
 * rintangan duri & jurang, monster diinjak & dihindari + proyektil, 3 gerbang soal,
 * tepat 1 checkpoint (CP 1/CP 2/CP 3), koin opsional, dan garis finish.
 */

const PlatformerLevels = {
    sequential: {
        kode: "sequential",
        judulDunia: "Sequential Forest",
        worldWidth: 3264,
        worldHeight: 360,
        spawn: { x: 56, y: 254 },
        checkpoint: { label: "CP 1", x: 1620, y: 240 },
        finish: { x: 3120, y: 216 },
        solids: [
            // Area awal & Seksi 1 (ground y=296, tinggi 64px = 2 baris tile)
            { x: 0, y: 296, w: 480, h: 64 },
            // Lubang 1: 480..576 (lebar 96px, mudah dilompati!)
            { x: 576, y: 296, w: 512, h: 64 },
            // Lubang 2: 1088..1312 (disediakan platform bergerak horisontal)
            { x: 1312, y: 296, w: 768, h: 64 },
            // Lubang 3: 2080..2208 (lebar 128px + platform bantu di atas)
            { x: 2208, y: 296, w: 416, h: 64 },
            // Jurang 4: 2624..2720 (lebar 96px)
            { x: 2720, y: 296, w: 544, h: 64 }
        ],
        platforms: [
            { x: 224, y: 236, w: 96, h: 22 },
            { x: 384, y: 184, w: 96, h: 22 },
            { x: 672, y: 224, w: 128, h: 22 },
            { x: 1472, y: 216, w: 96, h: 22 },
            { x: 2112, y: 232, w: 96, h: 22 },
            { x: 2336, y: 176, w: 128, h: 22 },
            { x: 2624, y: 224, w: 96, h: 22 }
        ],
        movingPlatforms: [
            { x: 1120, y: 264, w: 96, h: 20, axis: "x", range: 52, speed: 1.7, phase: 0 },
            { x: 2496, y: 208, w: 96, h: 20, axis: "y", range: 36, speed: 2.0, phase: 1.0 }
        ],
        spikes: [
            { x: 768, y: 276, w: 32, h: 20 },
            { x: 1440, y: 276, w: 32, h: 20 },
            { x: 2304, y: 276, w: 32, h: 20 }
        ],
        enemies: [
            // Kategori A (Dapat diinjak)
            { id: "s1-e1", kind: "slime", stompable: true, x: 300, y: 270, minX: 250, maxX: 460, vx: 52 },
            { id: "s1-e2", kind: "mushroom", stompable: true, x: 1380, y: 270, minX: 1320, maxX: 1580, vx: 58 },
            { id: "s1-e3", kind: "slime", stompable: true, x: 2360, y: 270, minX: 2340, maxX: 2600, vx: 62 },
            // Kategori B (Harus dihindari, kelelawar terbang + proyektil di akhir)
            { id: "s1-b1", kind: "bat", stompable: false, x: 690, y: 148, minX: 620, maxX: 840, vx: 65, ampY: 16, shootInterval: 0 },
            { id: "s1-b2", kind: "bat", stompable: false, x: 2260, y: 132, minX: 2200, maxX: 2540, vx: 70, ampY: 18, shootInterval: 3.1 }
        ],
        gates: [
            { id: "seq-gate-1", label: "Gerbang Soal 1", x: 960, y: 200 },
            { id: "seq-gate-2", label: "Gerbang Soal 2", x: 1920, y: 200 },
            { id: "seq-gate-3", label: "Gerbang Soal 3", x: 2880, y: 200 }
        ],
        coins: [
            { x: 244, y: 206 }, { x: 278, y: 206 },
            { x: 416, y: 154 },
            { x: 520, y: 210 },
            { x: 700, y: 194 }, { x: 740, y: 194 },
            { x: 1168, y: 224 }, { x: 1216, y: 224 },
            { x: 1504, y: 186 },
            { x: 1740, y: 260 }, { x: 1780, y: 260 },
            { x: 2144, y: 200 },
            { x: 2380, y: 146 },
            { x: 2658, y: 192 },
            { x: 2980, y: 260 }
        ],
        decorations: [
            { kind: "signpost", x: 24, y: 296 },
            { kind: "house", x: 108, y: 296 },
            { kind: "tree", x: 340, y: 296 },
            { kind: "bush", x: 604, y: 296 },
            { kind: "flower", x: 644, y: 296 },
            { kind: "lantern", x: 924, y: 296 },
            { kind: "crate", x: 1336, y: 296 },
            { kind: "tree", x: 1550, y: 296 },
            { kind: "mushroomDeco", x: 1684, y: 296 },
            { kind: "lantern", x: 1884, y: 296 },
            { kind: "rock", x: 2224, y: 296 },
            { kind: "house", x: 2740, y: 296 },
            { kind: "tree", x: 3020, y: 296 }
        ]
    },

    bubbleSort: {
        kode: "bubbleSort",
        judulDunia: "Bubble Sort Valley",
        worldWidth: 3264,
        worldHeight: 360,
        spawn: { x: 56, y: 254 },
        checkpoint: { label: "CP 2", x: 1620, y: 240 },
        finish: { x: 3120, y: 216 },
        solids: [
            { x: 0, y: 296, w: 448, h: 64 },
            // Lubang 1: 448..544
            { x: 544, y: 296, w: 544, h: 64 },
            // Lubang 2: 1088..1344 (platform bergerak horisontal)
            { x: 1344, y: 296, w: 736, h: 64 },
            // Lubang 3: 2080..2240 (platform lompat + bergerak vertikal)
            { x: 2240, y: 296, w: 384, h: 64 },
            // Lubang 4: 2624..2720
            { x: 2720, y: 296, w: 544, h: 64 }
        ],
        platforms: [
            { x: 192, y: 232, w: 128, h: 22 },
            { x: 352, y: 180, w: 96, h: 22 },
            { x: 640, y: 224, w: 96, h: 22 },
            { x: 768, y: 176, w: 128, h: 22 },
            { x: 1472, y: 224, w: 128, h: 22 },
            { x: 2112, y: 240, w: 96, h: 22 },
            { x: 2368, y: 184, w: 128, h: 22 },
            { x: 2624, y: 224, w: 96, h: 22 }
        ],
        movingPlatforms: [
            { x: 1136, y: 256, w: 96, h: 20, axis: "x", range: 64, speed: 1.9, phase: 0.4 },
            { x: 2272, y: 208, w: 96, h: 20, axis: "y", range: 38, speed: 2.1, phase: 0 }
        ],
        spikes: [
            { x: 608, y: 276, w: 32, h: 20 },
            { x: 1440, y: 276, w: 32, h: 20 },
            { x: 2400, y: 276, w: 32, h: 20 },
            { x: 2528, y: 276, w: 32, h: 20 }
        ],
        enemies: [
            { id: "s2-e1", kind: "slime", stompable: true, x: 260, y: 270, minX: 200, maxX: 430, vx: 60 },
            { id: "s2-e2", kind: "mushroom", stompable: true, x: 1490, y: 270, minX: 1480, maxX: 1600, vx: 60 },
            { id: "s2-e3", kind: "mushroom", stompable: true, x: 1740, y: 270, minX: 1700, maxX: 1890, vx: 66 },
            { id: "s2-f1", kind: "spark", stompable: false, x: 760, y: 132, minX: 660, maxX: 900, vx: 72, ampY: 16, shootInterval: 3.0 },
            { id: "s2-f2", kind: "spark", stompable: false, x: 2380, y: 132, minX: 2280, maxX: 2600, vx: 76, ampY: 20, shootInterval: 2.7 }
        ],
        gates: [
            { id: "bs-gate-1", label: "Gerbang Sort 1", x: 960, y: 200 },
            { id: "bs-gate-2", label: "Gerbang Sort 2", x: 1920, y: 200 },
            { id: "bs-gate-3", label: "Gerbang Sort 3", x: 2880, y: 200 }
        ],
        coins: [
            { x: 224, y: 202 }, { x: 272, y: 202 },
            { x: 384, y: 150 },
            { x: 488, y: 214 },
            { x: 672, y: 194 }, { x: 816, y: 146 },
            { x: 1184, y: 218 }, { x: 1232, y: 218 },
            { x: 1520, y: 192 },
            { x: 1760, y: 256 },
            { x: 2144, y: 208 },
            { x: 2416, y: 152 }, { x: 2464, y: 152 },
            { x: 2658, y: 192 },
            { x: 2992, y: 256 }
        ],
        decorations: [
            { kind: "machine", x: 110, y: 296 },
            { kind: "pillar", x: 380, y: 296 },
            { kind: "crystal", x: 560, y: 296 },
            { kind: "shrub", x: 688, y: 296 },
            { kind: "pillar", x: 916, y: 296 },
            { kind: "machine", x: 1364, y: 296 },
            { kind: "crystal", x: 1690, y: 296 },
            { kind: "pillar", x: 1876, y: 296 },
            { kind: "shrub", x: 2256, y: 296 },
            { kind: "machine", x: 2744, y: 296 },
            { kind: "pillar", x: 3036, y: 296 }
        ]
    },

    dos: {
        kode: "dos",
        judulDunia: "DOS Tech Dungeon",
        worldWidth: 3264,
        worldHeight: 360,
        spawn: { x: 56, y: 254 },
        checkpoint: { label: "CP 3", x: 1620, y: 240 },
        finish: { x: 3120, y: 216 },
        solids: [
            { x: 0, y: 296, w: 416, h: 64 },
            // Lubang 1: 416..512
            { x: 512, y: 296, w: 576, h: 64 },
            // Lubang 2: 1088..1344
            { x: 1344, y: 296, w: 704, h: 64 },
            // Lubang 3: 2048..2240
            { x: 2240, y: 296, w: 384, h: 64 },
            // Lubang 4: 2624..2720
            { x: 2720, y: 296, w: 544, h: 64 }
        ],
        platforms: [
            { x: 192, y: 232, w: 96, h: 22 },
            { x: 320, y: 176, w: 96, h: 22 },
            { x: 608, y: 224, w: 128, h: 22 },
            { x: 768, y: 176, w: 96, h: 22 },
            { x: 1472, y: 216, w: 128, h: 22 },
            { x: 2080, y: 236, w: 96, h: 22 },
            { x: 2336, y: 176, w: 128, h: 22 },
            { x: 2624, y: 224, w: 96, h: 22 }
        ],
        movingPlatforms: [
            { x: 1136, y: 256, w: 96, h: 20, axis: "x", range: 68, speed: 2.0, phase: 0 },
            { x: 2240, y: 210, w: 96, h: 20, axis: "y", range: 40, speed: 2.2, phase: 1.2 }
        ],
        spikes: [
            { x: 576, y: 276, w: 32, h: 20 },
            { x: 1408, y: 276, w: 32, h: 20 },
            { x: 1792, y: 276, w: 32, h: 20 },
            { x: 2368, y: 276, w: 32, h: 20 },
            { x: 2496, y: 276, w: 32, h: 20 }
        ],
        enemies: [
            { id: "s3-e1", kind: "drone", stompable: true, x: 240, y: 270, minX: 180, maxX: 400, vx: 64 },
            { id: "s3-e2", kind: "drone", stompable: true, x: 690, y: 270, minX: 620, maxX: 880, vx: 68 },
            { id: "s3-e3", kind: "drone", stompable: true, x: 1500, y: 270, minX: 1460, maxX: 1600, vx: 64 },
            { id: "s3-g1", kind: "glitch", stompable: false, x: 740, y: 128, minX: 620, maxX: 880, vx: 78, ampY: 18, shootInterval: 2.8 },
            { id: "s3-g2", kind: "glitch", stompable: false, x: 2380, y: 126, minX: 2260, maxX: 2600, vx: 82, ampY: 22, shootInterval: 2.5 }
        ],
        gates: [
            { id: "dos-gate-1", label: "Gerbang Terminal 1", x: 960, y: 200 },
            { id: "dos-gate-2", label: "Gerbang Terminal 2", x: 1920, y: 200 },
            { id: "dos-gate-3", label: "Gerbang Terminal 3", x: 2880, y: 200 }
        ],
        coins: [
            { x: 224, y: 200 },
            { x: 352, y: 146 },
            { x: 456, y: 214 },
            { x: 648, y: 194 }, { x: 800, y: 146 },
            { x: 1184, y: 216 }, { x: 1232, y: 216 },
            { x: 1520, y: 184 },
            { x: 1720, y: 258 }, { x: 1756, y: 258 },
            { x: 2112, y: 206 },
            { x: 2376, y: 146 }, { x: 2420, y: 146 },
            { x: 2658, y: 192 },
            { x: 2992, y: 256 }
        ],
        decorations: [
            { kind: "crtStation", x: 108, y: 296 },
            { kind: "serverRack", x: 328, y: 296 },
            { kind: "techLamp", x: 536, y: 296 },
            { kind: "keyboardDesk", x: 724, y: 296 },
            { kind: "techLamp", x: 924, y: 296 },
            { kind: "serverRack", x: 1360, y: 296 },
            { kind: "crtStation", x: 1700, y: 296 },
            { kind: "techLamp", x: 1884, y: 296 },
            { kind: "serverRack", x: 2264, y: 296 },
            { kind: "keyboardDesk", x: 2744, y: 296 },
            { kind: "crtStation", x: 3016, y: 296 }
        ]
    }
};
