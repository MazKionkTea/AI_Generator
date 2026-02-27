# README — Universal AI Prompt Generator Schema v3.0

> **Berlaku untuk:** AI Generator Gambar & Video (MidJourney, Stable Diffusion/SDXL, DALL-E 3, Runway, Pika, Kling, Sora)
> **Flow:** Berurutan sesuai workflow kreator — dari desain karakter hingga output final

---

## Catatan Penting

File ini mendefinisikan **seluruh struktur data** yang digunakan oleh prompt generator. Setiap section diurutkan berdasarkan **workflow kreator**: dimulai dari membangun karakter, menguncinya agar konsisten, kemudian menyusun scene di sekelilingnya.

**Prinsip Utama — CHARACTER CONSISTENCY FIRST:**
Prioritas tertinggi sistem ini adalah **konsistensi karakter** (wajah, postur, pakaian) di seluruh sesi generate. Layer 0–1 adalah fondasi yang tidak boleh diubah antar-generate. Layer 2–8 adalah variabel yang boleh berubah sesuka hati tanpa merusak identitas karakter.

**Perbedaan Gambar vs Video:**
- **Gambar** → Statis. AI render 1 frame. Tidak ada motion.
- **Video** → Temporal. AI render N frame berurutan. Tambahan section: `motion`, `temporal_sequence`. Nilai berbeda pada `technical`: fps, codec, bitrate.

---

## Bagian A — Flow Workflow Kreator

Urutan ini mencerminkan **cara kerja kreator**, bukan urutan teknis internal AI. Karakter dirancang dan dikunci lebih dulu — setelah itu scene, motion, dan output bisa divariasikan bebas tanpa merusak identitas karakter.

```
╔═════════════════════════════════════════════════════════╗
║  ★ ZONA CHARACTER LOCK (DIBUAT SEKALI, TIDAK BERUBAH) ★ ║
╠═════════════════════════════════════════════════════════╣
║                                                         ║
║  LAYER 0 → CHARACTER DESIGN                             ║
║  Kreator merancang karakter dari nol:                   ║
║  anatomi, proporsi, wajah, kostum, ekspresi.            ║
║  Ini adalah "blueprint" karakter sebelum dikunci.       ║
║                                                         ║
║  Fields: subjects                                       ║
║                           ↓                             ║
║  LAYER 1 → CHARACTER LOCK (IDENTITY ANCHOR)             ║
║  Setelah karakter selesai dirancang, identitasnya       ║
║  dikunci sebagai "paspor permanen". Semua fitur kritis  ║
║  (ras, usia, proporsi, wajah) diproteksi dari           ║
║  improvisasi AI di setiap generate berikutnya.          ║
║                                                         ║
║  Fields: identity_anchor, technical_constraints         ║
║                                                         ║
╚═════════════════════════════════════════════════════════╝
                     ↓
         (karakter sudah dikunci — aman divariasikan)
                     ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 2 → SCENE & SPATIAL CONTEXT                      │
│  Kreator menentukan di mana dan kapan scene terjadi.    │
│  Karakter yang sudah dikunci "ditempatkan" ke dalam     │
│  dunia ini. Bisa diganti tiap sesi tanpa batas.         │
│                                                         │
│  Fields: scene_core, environment                        │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 3 → CAMERA & COMPOSITION                         │
│  Tentukan sudut pandang, framing, dan kedalaman ruang.  │
│  Kamera tidak bisa ditentukan sebelum ada scene-nya.    │
│                                                         │
│  Fields: composition                                    │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 4 → MOTION (KHUSUS VIDEO)                        │
│  Tentukan bagaimana kamera, subjek, dan environment     │
│  bergerak. Motion adalah bagian dari scene construction │
│  — harus didefinisikan sebelum cahaya dan atmosfer      │
│  agar AI video tahu konteks gerak saat render.          │
│                                                         │
│  Untuk GAMBAR: layer ini dilewati.                      │
│                                                         │
│  Fields: motion, temporal_sequence                      │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 5 → LIGHTING SYSTEM                              │
│  Cahaya diterapkan di atas scene dan motion yang        │
│  sudah terbentuk. Posisi kamera (Layer 3) menentukan    │
│  dari mana cahaya terlihat. Motion (Layer 4) menentukan │
│  apakah cahaya perlu konsisten antar frame (video).     │
│                                                         │
│  Fields: lighting                                       │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 6 → ATMOSPHERE & MOOD                            │
│  Filter emosional dan estetika diterapkan terakhir      │
│  di atas semua elemen visual yang sudah ada.            │
│  Mempengaruhi warna, kontras, dan overall feel.         │
│  Atmosphere membungkus scene, bukan membangunnya.       │
│                                                         │
│  Fields: atmosphere                                     │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 7 → TECHNICAL RENDER                             │
│  Spesifikasi teknis output: resolusi, aspect ratio,     │
│  engine, post-processing. Untuk video: fps, codec.      │
│  Universal — disesuaikan per platform target.           │
│                                                         │
│  Fields: technical                                      │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 8 → OUTPUT CONFIGURATION                         │
│  Mengemas semua data menjadi prompt teks final,         │
│  memberi bobot per section, dan menambahkan             │
│  parameter spesifik per platform AI target.             │
│                                                         │
│  Fields: output_config, variations, metadata            │
└─────────────────────────────────────────────────────────┘
```

### Ringkasan: Mana yang TETAP vs BERUBAH

| | Layer | Status | Bisa diubah antar-generate? |
|--|-------|--------|-----------------------------|
| 🔒 | 0 — Character Design | **DIKUNCI setelah selesai** | ❌ Tidak |
| 🔒 | 1 — Identity Lock | **PERMANEN** | ❌ Tidak |
| 🎬 | 2 — Scene & Environment | Variabel | ✅ Bebas |
| 🎬 | 3 — Camera & Composition | Variabel | ✅ Bebas |
| 🎬 | 4 — Motion *(video)* | Variabel | ✅ Bebas |
| 🎬 | 5 — Lighting | Variabel | ✅ Bebas |
| 🎬 | 6 — Atmosphere | Variabel | ✅ Bebas |
| ⚙️ | 7 — Technical | Per platform | ✅ Sesuaikan platform |
| ⚙️ | 8 — Output Config | Per platform | ✅ Sesuaikan platform |

---

## Bagian B — Root Structure Tree

```
ROOT
├── schema_version              (string)
├── generator_type              (string) — "image" | "video" | "both"
├── template_id                 (string)
│
│ ╔══════════════════════════════════════╗
│ ║  🔒 CHARACTER LOCK ZONE             ║
│ ╠══════════════════════════════════════╣
├── [LAYER 0] CHARACTER DESIGN
│   └── subjects                (object)
│       ├── primary_subject
│       ├── secondary_subjects[]
│       ├── background_entities[]
│       ├── crowd_elements
│       └── relationships[]
│
├── [LAYER 1] CHARACTER LOCK
│   ├── identity_anchor         (object)  ← paspor permanen karakter
│   └── technical_constraints   (object)  ← negative DNA
│ ╚══════════════════════════════════════╝
│
├── [LAYER 2] SCENE & SPATIAL
│   ├── scene_core              (object)
│   └── environment             (object)
│
├── [LAYER 3] CAMERA & COMPOSITION
│   └── composition             (object)
│       ├── camera
│       ├── framing
│       ├── spatial_layers[]
│       └── geometry
│
├── [LAYER 4 — VIDEO ONLY] MOTION
│   ├── motion                  (object)
│   │   ├── camera_movement
│   │   ├── subject_motion
│   │   ├── environment_motion
│   │   └── motion_intensity
│   └── temporal_sequence       (object)
│       ├── total_duration
│       ├── fps
│       ├── shot_sequence[]
│       ├── transition
│       └── loop
│
├── [LAYER 5] LIGHTING
│   └── lighting                (object)
│       ├── preset
│       ├── key_light
│       ├── fill_light
│       ├── rim_light
│       ├── ambient_light
│       ├── natural_light
│       ├── practical_lights[]
│       ├── volumetric_effects
│       └── shadows
│
├── [LAYER 6] ATMOSPHERE
│   └── atmosphere              (object)
│       ├── emotional_tone[]
│       ├── narrative_implication
│       ├── visual_style
│       ├── temporal_quality
│       ├── spatial_quality
│       └── audio_implied
│
├── [LAYER 7] TECHNICAL
│   └── technical               (object)
│       ├── render_specs
│       ├── camera_tech
│       ├── post_processing
│       └── video_specs         (object — video only)
│           ├── codec
│           ├── bitrate
│           ├── audio_track
│           ├── delivery_format
│           └── stabilization
│
└── [LAYER 8] OUTPUT & VARIATIONS
    ├── metadata                (object)
    ├── variations              (object)
    └── output_config           (object)
```

---

## Bagian C — Definisi Lengkap Setiap Section

---

### Root Level Tags

| Tag | Fungsi | Deskripsi | Tipe Data |
|-----|--------|-----------|-----------|
| `schema_version` | Version control | Versi struktur JSON untuk backward compatibility | String |
| `generator_type` | Klasifikasi generator | Jenis generator: `"image"` \| `"video"` \| `"both"` | String |
| `template_id` | Unique identifier | ID unik template untuk tracking dan referensi | String |

---

### Layer 0 — `subjects` *(Character Design)*

> **Fungsi:** Kreator merancang karakter dari nol. Ini adalah tahap desain bebas — tentukan anatomi, proporsi, wajah, kostum, ekspresi, dan semua atribut visual karakter. Hasil dari layer ini akan dikunci permanen di Layer 1.
>
> ⚠️ **Setelah karakter selesai dan dikunci di Layer 1, field di Layer 0 tidak boleh diubah antar-generate agar konsistensi terjaga.**

| Tag | Fungsi | Deskripsi | Struktur |
|-----|--------|-----------|----------|
| `primary_subject` | Subject utama | Fokus #1 scene | Object |
| `secondary_subjects` | Subject pendukung | Fokus #2, #3, dst | Array of Objects |
| `background_entities` | Entitas latar | Ada dalam scene, bukan fokus | Array of Objects |
| `crowd_elements` | Elemen kerumunan | Mass population descriptor | Object |
| `relationships` | Relasi antar subject | Dinamika interpersonal | Array of Objects |

**`primary_subject` / `secondary_subjects` (Object)**

| Tag | Fungsi | Deskripsi | Struktur |
|-----|--------|-----------|----------|
| `subject_type` | Kategori entitas | human/creature/object/vehicle | String |
| `archetype` | Tipe karakter | Role atau persona | String |
| `physical_attributes` | Atribut fisik | Penampilan detail | Object |
| `dressing_room` | Sistem kostum | Overlay outfit system | Object |
| `pose_action` | Pose dan gerakan | Aktivitas saat ini | Object |
| `expression_emotion` | Ekspresi dan emosi | Kondisi emosional | Object |
| `modifiers` | Modifikasi khusus | Cybernetics, magic, dll | Object |

**`physical_attributes` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `species` | Spesies | Human atau lainnya | `"human"`, `"elf"`, `"android"`, `"demon"` |
| `age` | Usia | Rentang atau deskripsi | `"18-20 years old"`, `"young_adult"` |
| `gender_presentation` | Presentasi gender | Appearance gender | `"masculine"`, `"feminine"`, `"ambiguous"` |
| `stature` | Postur tubuh | Height + frame | Object: `{height, frame, shoulders}` |
| `face` | Detail wajah | Facial DNA | Object: `{shape, eyes, nose, mouth, ears}` |
| `body_proportions` | Proporsi tubuh | Chest, waist, hips, limbs | Object (dengan lock per sub-field) |
| `skin` | Kulit | Warna + tekstur | Object: `{color, texture, condition}` |
| `hair` | Rambut | Warna + gaya + panjang | Object: `{color, style, length}` |
| `distinctive_features` | Ciri khas | Unik identifier | Array: `["scar", "tattoo", "glowing_eyes"]` |

**`dressing_room` (Sub-object)**

> **Fungsi:** Sistem overlay kostum yang diletakkan di atas anatomi base **tanpa memodifikasi proporsi tubuh**.
> `collision: STRICT_BODY_INTEGRITY` | `compression: disabled`

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `physics_engine` | Engine fisika | Aturan interaksi pakaian-tubuh | Object |
| `active_outfit` | Outfit aktif | Set pakaian yang sedang dipakai | Object |
| `outfit_library` | Library kostum | Kumpulan outfit tersimpan | Array of Objects |

**`active_outfit` (Sub-sub-object)**

| Tag | Fungsi | Deskripsi | Contoh |
|-----|--------|-----------|--------|
| `set_name` | Nama set | Identifikasi outfit | `"Wilderness_Survival_Basic"` |
| `upper` | Badan atas | Pakaian atas | `"Halter-neck deep V-plunge burlap top"` |
| `lower` | Badan bawah | Pakaian bawah | `"Tattered mini skirt"` |
| `footwear` | Alas kaki | Sepatu atau telanjang | `"barefoot"` |
| `accessories` | Aksesoris | Item tambahan | `["silver choker", "emerald pendant"]` |
| `status` | Status aktif | Apakah sedang dipakai | `"active"` / `"stored"` |

**`pose_action` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `base_pose` | Pose fundamental | Stance dasar | `"standing"`, `"sitting"`, `"crouching"` |
| `action_verb` | Kata kerja aktif | Apa yang dilakukan | `"examining"`, `"running"`, `"gesturing"` |
| `action_object` | Objek aksi | Target dari action | `"ancient_artifact"`, `"distant_horizon"` |
| `energy_level` | Tingkat energi | Intensitas gerakan | `"static"`, `"subtle"`, `"dynamic"`, `"explosive"` |
| `balance` | Keseimbangan | Stabilitas pose | `"stable"`, `"precarious"`, `"mid_motion"` |
| `line_of_sight` | Arah pandang | Ke mana melihat | `"at_camera"`, `"away"`, `"at_object"`, `"down"` |

**`expression_emotion` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `primary_emotion` | Emosi utama | Dominant feeling | `"determination"`, `"fear"`, `"wonder"` |
| `secondary_emotion` | Emosi bawah | Undercurrent | `"sadness"`, `"lingering_anger"` |
| `intensity` | Kekuatan emosi | Seberapa kuat | `"subtle"`, `"moderate"`, `"intense"` |
| `micro_expressions` | Ekspresi mikro | Detail wajah | `["tight_jaw", "slight_smile", "furrowed_brow"]` |
| `eye_state` | Kondisi mata | Spesifik mata | `"focused"`, `"unfocused"`, `"squinting"`, `"wide"` |

---

### Layer 1A — `identity_anchor` *(Character Lock — Paspor Permanen)*

> **Fungsi:** Setelah karakter selesai dirancang di Layer 0, identitasnya dikunci di sini. `identity_anchor` adalah "paspor digital" karakter yang dibaca AI di setiap generate — memastikan ras, usia, proporsi, dan struktur wajah tidak pernah berubah meski scene, pose, atau kostum berganti.
>
> 🔒 **PERMANEN. Tidak boleh dimodifikasi setelah karakter pertama kali di-generate dan hasilnya disetujui.**
>
> **Dua skenario pengisian:**
> - **Karakter baru (dari nol)** → isi dari hasil desain di Layer 0, generate pertama kali, setujui, simpan hasilnya sebagai `reference_images`
> - **Karakter sudah ada (dari gambar)** → ekstrak atribut dari gambar ke Layer 0, langsung isi `reference_images` dengan gambar yang sudah ada

| Tag | Fungsi | Deskripsi | Tipe Data |
|-----|--------|-----------|-----------|
| `name` | Nama karakter | Identifikasi unik karakter | String |
| `lock_method` | Metode penguncian | Cara AI mengunci identitas | String |
| `reference_images` | Gambar referensi | Gambar aktual karakter sebagai anchor visual | Object |
| `age_profile` | Profil usia | Target usia + logika lock | Object |
| `race_matrix` | Matriks ras | Ras realistis + ras fantasi + skull logic | Object |
| `face_dna` | DNA wajah | Detail wajah spesifik yang dikunci | Object |
| `body_dna` | DNA tubuh | Proporsi tubuh yang dikunci | Object |
| `locked_features` | Fitur yang dikunci | List field yang tidak boleh diubah AI | Array |

**`lock_method` — Nilai yang tersedia:**

| Nilai | Deskripsi | Kekuatan |
|-------|-----------|----------|
| `"prompt_only"` | Hanya mengandalkan deskripsi teks | ⭐⭐ — Lemah, AI bisa drift |
| `"image_reference_primary"` | Gambar sebagai anchor utama, teks sebagai pendukung | ⭐⭐⭐⭐⭐ — Terkuat |
| `"image_reference_secondary"` | Teks utama, gambar sebagai konfirmasi | ⭐⭐⭐ — Sedang |
| `"lora_model"` | Karakter dikunci via LoRA/checkpoint khusus (SD only) | ⭐⭐⭐⭐⭐ — Terkuat untuk SD |

**`reference_images` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `primary` | Gambar utama | File referensi utama — full body, netral, pencahayaan merata | `"eira_base_v1.png"` |
| `face_closeup` | Closeup wajah | Gambar detail wajah untuk face lock | `"eira_face_v1.png"` |
| `angles` | Multi-angle | Referensi dari berbagai sudut | Object: `{front, side, three_quarter, back}` |
| `outfit_variants` | Varian kostum | Referensi tiap outfit yang tersimpan di outfit_library | Object: `{outfit_name: "file.png"}` |
| `platform_usage` | Cara pakai per platform | Instruksi penggunaan gambar di tiap platform | Object |

**`platform_usage` (Sub-sub-object)**

| Platform | Cara Implementasi | Parameter Kunci |
|----------|------------------|-----------------|
| `midjourney` | URL gambar di awal prompt | `--iw 0.5–2.0` (makin tinggi makin mirip referensi) |
| `stable_diffusion` | IP-Adapter + ControlNet FaceID | `ip_adapter_scale: 0.7–1.0` |
| `dalle3` | Upload gambar + instruksi teks | `"maintain exact appearance of the reference image"` |
| `kling` | Reference image field | `face_consistency: true` |
| `runway` | First frame upload | Gunakan sebagai starting frame |
| `pika` | Starting frame upload | Gunakan sebagai first frame |
| `sora` | Image-to-video mode | Upload sebagai reference frame |

**`face_dna` (Sub-object) — Kunci detail wajah yang spesifik**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `face_shape` | Bentuk wajah | Kontur keseluruhan | `"soft_oval"`, `"heart"`, `"round"`, `"sharp_v"` |
| `eye_shape` | Bentuk mata | Tipe kelopak mata | `"almond"`, `"monolid"`, `"hooded"`, `"round"` |
| `eye_color` | Warna iris | Warna mata spesifik | `"warm_brown"`, `"dark_obsidian"`, `"hazel"` |
| `nose_shape` | Bentuk hidung | Tipe hidung | `"small_button"`, `"straight_bridge"`, `"wide_flat"` |
| `lip_shape` | Bentuk bibir | Tipe bibir | `"thin_natural"`, `"full"`, `"cupid_bow"` |
| `jaw_line` | Kontur rahang | Ketegasan rahang | `"soft_rounded"`, `"defined"`, `"sharp_angular"` |
| `cheek_structure` | Struktur pipi | Tulang pipi | `"high_prominent"`, `"soft_flat"`, `"chubby"` |
| `skin_undertone` | Undertone kulit | Warm/cool/neutral | `"warm_peachy"`, `"cool_pink"`, `"neutral_beige"` |

**`body_dna` (Sub-object) — Kunci proporsi tubuh**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `height_category` | Kategori tinggi | Klasifikasi tinggi badan | `"petite"`, `"average"`, `"tall"` |
| `frame_type` | Tipe rangka | Besar-kecilnya tulang | `"ectomorph"`, `"mesomorph"`, `"endomorph"` |
| `shoulder_width` | Lebar bahu | Relatif terhadap pinggul | `"narrow"`, `"medium"`, `"broad"` |
| `waist_definition` | Definisi pinggang | Seberapa terlihat | `"undefined"`, `"subtle"`, `"defined"`, `"hourglass"` |
| `limb_proportion` | Proporsi anggota badan | Panjang lengan/kaki | `"short"`, `"average"`, `"long_limbed"` |

**`age_profile` (Sub-object)**

| Tag | Fungsi | Deskripsi | Contoh |
|-----|--------|-----------|--------|
| `target` | Target usia | Rentang usia yang dikunci | `"16-18 years old"` |
| `logic` | Logika lock | Apa yang diblokir oleh lock ini | `"locks_out: [aging_signs, mature_anatomy]"` |
| `skin_condition` | Kondisi kulit | Karakteristik kulit sesuai usia | `"smooth_porcelain_non_porous"` |
| `maturity_level` | Level kematangan | Tingkat kedewasaan fitur | `"juvenile"`, `"young_adult"`, `"adult"` |

**`race_matrix` (Sub-object)**

| Tag | Fungsi | Deskripsi | Contoh |
|-----|--------|-----------|--------|
| `fantasy` | Ras fantasi | Ras dalam dunia fiksi | `"High Elf"` |
| `realistic_base` | Ras realistis | Referensi etnis dunia nyata | `"East Asian descent"` |
| `skull_logic` | Logika tengkorak | Struktur wajah yang dikunci | `"locks_out: [European_facial_structure]"` |
| `skin_tone_range` | Rentang warna kulit | Variasi yang diizinkan | `"porcelain_to_light_beige_only"` |

---

### Layer 1B — `technical_constraints` *(Negative DNA — Pagar Permanen)*

> **Fungsi:** Pasangan dari `identity_anchor`. Jika identity_anchor adalah daftar *apa yang harus ada*, maka technical_constraints adalah daftar *apa yang dilarang keras muncul*. Bersama-sama keduanya membentuk DNA karakter yang tidak bisa ditembus AI.
>
> 🔒 **PERMANEN. Diisi sekali, berlaku di semua generate.**

| Tag | Fungsi | Deskripsi | Tipe Data |
|-----|--------|-----------|-----------|
| `negative_prompts` | Prompt negatif DNA | List fitur yang DILARANG muncul | Array of String |
| `identity_locks` | Kunci identitas | Field yang tidak bisa di-override user | Array of String |
| `rendering` | Setting render DNA | Engine dan kualitas yang dikunci untuk karakter | Object |

**Contoh nilai `negative_prompts`:**
```
"western facial features:1.3", "European facial structure",
"blonde hair", "blue eyes", "Caucasian",
"huge breasts:1.2", "fake proportions", "exaggerated curves",
"muscular body", "broad shoulders",
"human ears",  (jika karakter punya telinga fantasi)
"aged skin", "wrinkles", "sagging skin"
```

---

### Layer 2A — `scene_core` *(Scene — Bebas Divariasikan)*

> **Fungsi:** Menentukan "jiwa" dan "waktu" dari scene. Karakter yang sudah dikunci di Layer 1 kini "ditempatkan" ke dalam dunia yang didefinisikan di sini. Bisa diganti sepenuhnya di setiap sesi generate tanpa risiko merusak identitas karakter.

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `scene_type` | Klasifikasi scene | Tipe shot fundamental | `"wide_shot"`, `"portrait"`, `"macro"`, `"aerial"` |
| `primary_focus` | Fokus utama | Center of attention | `"character"`, `"landscape"`, `"action"`, `"object"` |
| `narrative_moment` | Momen cerita | Titik dalam story arc | `"calm_before_storm"`, `"climax"`, `"aftermath"` |
| `dramatic_weight` | Bobot dramatis | Intensitas scene | `"subtle"`, `"moderate"`, `"intense"`, `"epic"` |
| `time_setting` | Setting waktu | Kapan scene ini terjadi | Object |
| `space_setting` | Setting ruang | Di mana scene ini terjadi | Object |

**`time_setting` (Sub-object)**

| Tag | Fungsi | Deskripsi | Contoh |
|-----|--------|-----------|--------|
| `period` | Era waktu | Periode historis/futuristis | `"medieval"`, `"2080s"`, `"present"` |
| `season` | Musim | Kondisi musim | `"spring"`, `"late_autumn"`, `"winter"` |
| `time_of_day` | Waktu spesifik | Jam atau fase hari | `"blue_hour"`, `"3am"`, `"golden_hour"` |
| `time_flow` | Alur waktu | Kondisi temporal | `"frozen_moment"`, `"slow_motion"`, `"real_time"` |

**`space_setting` (Sub-object)**

| Tag | Fungsi | Deskripsi | Contoh |
|-----|--------|-----------|--------|
| `location_type` | Tipe lokasi | Kategori spatial | `"urban"`, `"natural"`, `"interior"`, `"space"` |
| `region` | Wilayah | Area spesifik | `"downtown"`, `"countryside"`, `"orbit"` |
| `specific_place` | Tempat exact | Nama atau deskripsi | `"abandoned_metro_station"` |
| `scale` | Skala ruang | Besaran environment | `"intimate"`, `"expansive"`, `"monumental"` |

---

### Layer 2B — `environment` *(Environment — Bebas Divariasikan)*

> **Fungsi:** Detail fisik dari dunia di sekitar karakter. Dibangun setelah `scene_core` karena environment adalah "isi" dari ruang yang sudah didefinisikan. Ganti sesuka hati — dari hutan ke kota, dari masa lalu ke masa depan.

| Tag | Fungsi | Deskripsi | Struktur |
|-----|--------|-----------|----------|
| `location` | Spesifikasi lokasi | Detail tempat | Object |
| `architecture` | Struktur buatan | Building dan infrastructure | Object |
| `natural_elements` | Elemen alam | Landscape features | Object |
| `weather_climate` | Kondisi cuaca | Atmospheric conditions | Object |
| `props_objects` | Objek dalam scene | Items dan furniture | Array of Objects |
| `signage_text` | Tanda dan tulisan | Text dalam environment | Object |
| `technology` | Elemen teknologi | Tech visible dalam scene | Object |

**`location` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `setting_type` | Tipe setting | Interior/exterior | `"interior"`, `"exterior"`, `"transition"` |
| `specific_location` | Lokasi spesifik | Nama tempat detail | `"narrow_service_alley"` |
| `geographic_region` | Wilayah | Area geografis | `"neo_tokyo_lower_district"` |
| `cultural_context` | Konteks budaya | Latar budaya | `"japanese_cyberpunk_melting_pot"` |
| `ownership` | Kepemilikan | Siapa punya lokasi ini | `"corporate_neglected"`, `"public"` |
| `maintenance_state` | Kondisi | Tingkat perawatan | `"pristine"`, `"decaying_functional"` |

**`natural_elements` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `terrain` | Medan | Kondisi tanah | `"flat_paved"`, `"rocky_slope"`, `"sandy"` |
| `vegetation` | Tumbuhan | Plant life | Object: `{density, types[]}` |
| `water_features` | Fitur air | Bodies of water | Array: `["stream", "puddle", "waterfall"]` |
| `geological` | Geologi | Rock dan earth | Array: `["crystal_formations", "volcanic_rock"]` |
| `celestial_bodies` | Objek langit | Sky elements | Array: `["twin_moons", "nebula"]` |
| `wildlife` | Kehidupan liar | Animals | Array: `["birds", "fantastic_creatures"]` |

**`weather_climate` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `precipitation` | Presipitasi | Jenis hujan/salju | `"none"`, `"light_drizzle"`, `"heavy_rain"`, `"blizzard"` |
| `wind` | Angin | Kekuatan angin | `"calm"`, `"breeze"`, `"gale"`, `"turbulent"` |
| `visibility` | Jarak pandang | Seberapa jelas | `"clear"`, `"hazy"`, `"foggy"`, `"zero_visibility"` |
| `temperature_indicators` | Indikator suhu | Tanda visual suhu | `["breath_visible", "sweat", "frost", "icicles"]` |
| `sky_condition` | Kondisi langit | Cuaca langit | `"clear"`, `"overcast"`, `"stormy"`, `"city_glow"` |
| `special_phenomena` | Fenomena khusus | Event langka | `["rainbow", "aurora", "lightning", "ash_fall"]` |

**`props_objects` (Array of Objects)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `name` | Nama prop | Identifikasi objek | `"metal_transaction_case"` |
| `type` | Tipe objek | Kategori | `"container"`, `"vehicle"`, `"furniture"` |
| `condition` | Kondisi | Tingkat kerusakan | `"pristine"`, `"worn"`, `"damaged"` |
| `importance` | Kepentingan | Plot relevance | `"plot_critical"`, `"atmospheric"`, `"background"` |
| `position` | Posisi | Lokasi dalam frame | `"foreground_left"`, `"background_prop"` |

---

### Layer 3 — `composition` *(Camera & Framing — Bebas Divariasikan)*

> **Fungsi:** Mendefinisikan sudut pandang kamera. Kamera tidak bisa ditentukan sebelum ada scene-nya (Layer 2). Untuk video, composition yang ditetapkan di sini akan menjadi referensi bagi motion (Layer 4) — camera_movement di Layer 4 bergerak relatif terhadap posisi awal yang didefinisikan di sini.

| Tag | Fungsi | Deskripsi | Struktur |
|-----|--------|-----------|----------|
| `camera` | Setup kamera | Parameter kamera fisik | Object |
| `framing` | Batas frame | Cara subject di-frame | Object |
| `spatial_layers` | Kedalaman layer | Z-depth arrangement | Array of Objects |
| `geometry` | Struktur geometris | Komposisi shape dan line | Object |

**`camera` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `shot_type` | Tipe shot | Kategori framing | `"ECU"`, `"CU"`, `"MCU"`, `"MS"`, `"FS"`, `"WS"`, `"EWS"` |
| `angle` | Sudut kamera | Posisi vertikal | `"eye_level"`, `"low"`, `"high"`, `"bird_eye"`, `"dutch"` |
| `lens` | Spesifikasi lensa | Focal length + karakteristik | Object |
| `height` | Ketinggian kamera | Dari ground level | `"ground"`, `"waist"`, `"chest"`, `"eye"`, `"overhead"` |
| `distance` | Jarak ke subject | Proximity | `"intimate"`, `"personal"`, `"social"`, `"public"` |
| `stability` | Stabilitas | Gerakan kamera | `"static"`, `"handheld"`, `"gimbal"`, `"crane"` |

**`lens` (Sub-sub-object)**

| Tag | Fungsi | Deskripsi | Contoh |
|-----|--------|-----------|--------|
| `focal_length` | Panjang focal | mm atau deskripsi | `"14mm"`, `"35mm"`, `"85mm"`, `"200mm"` |
| `aperture` | Bukaan lensa | f-stop atau efek | `"f/1.4"`, `"f/5.6"`, `"f/16"` |
| `lens_type` | Karakter lensa | Jenis optik | `"prime"`, `"zoom"`, `"anamorphic"`, `"fisheye"` |
| `dof` | Depth of field | Kedalaman fokus | `"ultra_shallow"`, `"shallow"`, `"deep"`, `"infinite"` |

**`framing` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `subject_placement` | Posisi subject | Rule of thirds atau lainnya | `"center"`, `"third_left"`, `"golden_ratio"` |
| `head_room` | Ruang atas | Jarak ke top frame | `"tight"`, `"normal"`, `"generous"` |
| `lead_room` | Ruang arah | Jarak arah gaze | `"minimal"`, `"balanced"`, `"abundant"` |
| `symmetry` | Kondisi simetris | Balance komposisi | `"asymmetrical"`, `"symmetrical"`, `"radial"` |
| `frame_within_frame` | Sub-frame | Elemen pembentuk frame | `["doorway", "window", "arch", "tunnel"]` |

**`spatial_layers` (Array of Objects)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `layer_index` | Urutan kedalaman | 0=foreground, n=back | Integer |
| `layer_name` | Label layer | Nama deskriptif | `"foreground"`, `"midground"`, `"background"` |
| `elements` | Isi layer | Objek dalam layer | Array of String |
| `focus_state` | Kondisi fokus | Sharpness level | `"sharp"`, `"soft"`, `"bokeh"`, `"silhouette"` |
| `opacity` | Transparansi | Visibility level | Float: `0.0` to `1.0` |
| `atmospheric_interaction` | Efek atmosfer | Haze/fog di layer ini | `"clear"`, `"light_haze"`, `"heavy_fog"` |

---

### Layer 5 — `lighting` *(Bebas Divariasikan)*

> **Fungsi:** Sistem pencahayaan diterapkan di atas scene, composition, dan motion yang sudah terbentuk. Posisi kamera (Layer 3) menentukan dari sudut mana cahaya terlihat. Untuk video, motion (Layer 4) menentukan apakah lighting perlu konsisten antar frame. Urutan penerapan cahaya: key → fill → rim → ambient → practical.
>
> Untuk konsistensi karakter: pastikan `rim_light` atau `key_light` selalu menyinari area wajah agar detail wajah yang dikunci di Layer 1 tetap terbaca AI dengan baik.

| Tag | Fungsi | Deskripsi | Struktur |
|-----|--------|-----------|----------|
| `preset` | Preset cahaya | Quick setup | String |
| `key_light` | Cahaya utama | Sumber primer | Object |
| `fill_light` | Cahaya fill | Mengurangi contrast | Object |
| `rim_light` | Cahaya pinggir | Memisahkan subject | Object |
| `ambient_light` | Cahaya sekitar | Base illumination | Object |
| `natural_light` | Cahaya alami | Matahari, bulan, langit | Object |
| `practical_lights` | Cahaya dalam scene | Lampu yang visible | Array of Objects |
| `volumetric_effects` | Efek volumetrik | Partikel + cahaya | Object |
| `shadows` | Sistem bayangan | Karakteristik shadow | Object |

**`key_light` / `fill_light` / `rim_light` / `ambient_light` / `natural_light` (Object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `enabled` | Status aktif | On/off | Boolean |
| `source_type` | Jenis sumber | Kategori cahaya | `"sun"`, `"window"`, `"neon"`, `"fire"`, `"magic"`, `"moon"` |
| `position` | Posisi sumber | Lokasi spatial | `"top_left"`, `"45_right"`, `"back"`, `"under"` |
| `intensity` | Kekuatan | Brightness | `"dim"`, `"moderate"`, `"bright"`, `"blinding"` |
| `quality` | Kualitas | Hard/soft | `"hard"`, `"soft"`, `"diffused"`, `"specular"` |
| `color` | Warna cahaya | Temperature atau hue | Object: `{temperature, hue, saturation}` |
| `falloff` | Penurunan intensitas | Decay rate | `"rapid"`, `"linear"`, `"slow"`, `"infinite"` |
| `modifiers` | Modifier cahaya | Alat pengubah | `["softbox", "gobo", "gel", "snoot", "reflector"]` |

**`color` (Sub-sub-object untuk cahaya)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `temperature` | Suhu warna | Kelvin atau deskripsi | `"3200K"`, `"5600K"`, `"warm"`, `"cool"` |
| `hue` | Warna spesifik | RGB atau nama warna | `"#FF5500"`, `"cyan"`, `"magenta"` |
| `saturation` | Intensitas warna | Chroma level | `"monochrome"`, `"muted"`, `"vivid"`, `"neon"` |

**`practical_lights` (Array of Objects)**

| Tag | Fungsi | Deskripsi | Contoh |
|-----|--------|-----------|--------|
| `light_name` | Identifikasi | Nama objek cahaya | `"street_lamp"`, `"candle"`, `"monitor"` |
| `location_in_frame` | Posisi dalam frame | Where visible | `"background_left"`, `"foreground_right"` |
| `emission_properties` | Karakter emisi | Flicker, pulse, steady | Object: `{pattern: "flicker", speed: "slow"}` |
| `contribution` | Kontribusi ke scene | Seberapa penting | `"accent"`, `"motivated"`, `"key"` |

**`volumetric_effects` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `enabled` | Status aktif | On/off | Boolean |
| `medium_type` | Medium partikel | Apa yang di udara | `"fog"`, `"dust"`, `"smoke"`, `"rain"`, `"steam"` |
| `density` | Kepadatan | Thickness | `"subtle"`, `"moderate"`, `"thick"`, `"opaque"` |
| `interaction_with_light` | Reaksi cahaya | God rays dll | `["god_rays", "light_cones", "glow"]` |
| `color_influence` | Pewarnaan medium | Tint dari medium | `"neutral"`, `"warm"`, `"colored"` |
| `movement` | Gerakan partikel | Dinamika | `"static"`, `"drifting"`, `"turbulent"` |

**`shadows` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `style` | Gaya bayangan | Karakter shadow | `"realistic"`, `"stylized"`, `"none"` |
| `softness` | Kelembutan | Hard/soft edge | `"hard"`, `"soft"`, `"diffused"` |
| `color_tint` | Warna bayangan | Tint pada shadow | `"neutral"`, `"cool_blue"`, `"warm"` |

---

### Layer 6 — `atmosphere` *(Bebas Divariasikan)*

> **Fungsi:** Filter emosional dan estetika yang diterapkan **terakhir** di atas semua elemen visual yang sudah ada. Atmosphere membungkus scene, bukan membangunnya — karena itu ia harus datang setelah semua elemen struktural (scene, komposisi, motion, cahaya) sudah terdefinisi. Mempengaruhi warna, kontras, dan overall feel output.

| Tag | Fungsi | Deskripsi | Struktur |
|-----|--------|-----------|----------|
| `emotional_tone` | Nada emosional | Array mood dominan | Array of String |
| `narrative_implication` | Implikasi cerita | Apa yang "sedang terjadi" | String |
| `visual_style` | Gaya visual | Estetika keseluruhan | Object |
| `temporal_quality` | Kualitas temporal | Feel of time | Object |
| `spatial_quality` | Kualitas spasial | Feel of space | Object |
| `audio_implied` | Audio implisit | Suara yang "terasa" | Object |

**`emotional_tone` — Nilai Umum**

| Value | Deskripsi |
|-------|-----------|
| `melancholic` | Sedih namun indah |
| `tense` | Menegangkan, waspada |
| `wonder` | Kebingungan, kagum |
| `dread` | Ketakutan mendalam |
| `nostalgic` | Kangen masa lalu |
| `hopeful` | Penuh harapan |
| `lonely` | Kesepian |
| `claustrophobic` | Terkekang |
| `liberating` | Membebaskan |
| `mysterious` | Misterius |

**`visual_style` (Sub-object)**

| Tag | Fungsi | Deskripsi | Contoh |
|-----|--------|-----------|--------|
| `art_movement` | Gerakan seni | Art history reference | `"impressionism"`, `"noir"`, `"cyberpunk"`, `"synthwave"` |
| `film_reference` | Referensi film | Movie aesthetic | `"blade_runner_2049"`, `"ghibli"`, `"kubrick"` |
| `photography_style` | Gaya fotografi | Photo technique | `"documentary"`, `"fashion"`, `"cinematic"` |
| `color_palette` | Palet warna | Dominant colors | `["neon_magenta", "cyan", "deep_black"]` |
| `contrast_mood` | Mood kontras | Lighting contrast feel | `"high_contrast_dramatic"`, `"low_contrast_misty"` |
| `texture_emphasis` | Emfasis tekstur | Surface quality focus | `"smooth_sleek"`, `"gritty_textured"`, `"organic_rough"` |

**`temporal_quality` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `time_feeling` | Feel waktu | Bagaimana waktu terasa | `"rushed"`, `"leisurely"`, `"eternal"` |
| `urgency` | Urgensi | Tingkat kemendesakan | `"low"`, `"moderate"`, `"high"`, `"critical"` |
| `timelessness` | Keabadian | Seberapa timeless | `"contemporary"`, `"timeless"`, `"anachronistic"` |

**`spatial_quality` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `openness` | Keterbukaan | Open vs confined | `"claustrophobic"`, `"intimate"`, `"open"`, `"vast"` |
| `intimacy` | Keintiman | Kedekatan emosional | `"distant"`, `"neutral"`, `"intimate"` |
| `verticality` | Vertikalitas | Sense of height | `"low"`, `"eye_level"`, `"towering"` |

**`audio_implied` (Sub-object)**

> Tidak membuat suara nyata. Ini adalah deskripsi suara yang "terasa" dari visual, membantu AI membangun mood yang lebih tepat.

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `ambient` | Suara ambient | Background audio | `["distant_sirens", "rain_on_metal"]` |
| `foreground` | Suara depan | Prominent sounds | `["muffled_conversation", "footstep"]` |
| `emotional_cue` | Cue emosional | Music/mood implied | `"tense_silence"`, `"hopeful_melody"` |

---

### Layer 4A — `motion` *(Khusus Video — Bebas Divariasikan)*

> **Fungsi:** Mendefinisikan semua gerakan dalam dimensi waktu — kamera, subjek, dan environment. Motion diposisikan setelah composition (Layer 3) karena gerakan kamera selalu relatif terhadap posisi awal kamera yang sudah ditetapkan. Motion harus didefinisikan **sebelum** lighting (Layer 5) agar AI video tahu apakah cahaya perlu konsisten antar frame atau boleh berubah mengikuti gerakan.
>
> Untuk **gambar**: layer ini dilewati sepenuhnya.

| Tag | Fungsi | Deskripsi | Struktur |
|-----|--------|-----------|----------|
| `camera_movement` | Gerakan kamera | Bagaimana kamera bergerak | Object |
| `subject_motion` | Gerakan subjek | Bagaimana subjek bergerak | Object |
| `environment_motion` | Gerakan environment | Elemen background yang bergerak | Object |
| `motion_intensity` | Intensitas gerakan | Overall motion level | String |

**`camera_movement` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `type` | Tipe gerakan | Jenis pergerakan | `"static"`, `"pan"`, `"tilt"`, `"zoom"`, `"dolly"`, `"orbit"` |
| `direction` | Arah | Ke mana bergerak | `"left"`, `"right"`, `"up"`, `"down"`, `"forward"`, `"back"` |
| `speed` | Kecepatan | Laju gerakan | `"slow"`, `"normal"`, `"fast"`, `"sudden"` |
| `easing` | Easing | Karakter gerakan | `"linear"`, `"ease_in"`, `"ease_out"`, `"smooth"` |
| `arc` | Jalur gerakan | Path kamera | `"straight"`, `"curved"`, `"circular"` |

**`subject_motion` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `primary_motion` | Gerakan utama | Apa yang dilakukan | `"walking"`, `"running"`, `"turning"`, `"idle"` |
| `motion_path` | Jalur gerakan | Ke mana bergerak | `"toward_camera"`, `"away"`, `"lateral"`, `"circular"` |
| `speed` | Kecepatan | Laju gerakan subjek | `"slow_motion"`, `"normal"`, `"fast"`, `"explosive"` |
| `cloth_physics` | Fisika pakaian | Gerakan kain | `"none"`, `"subtle_flutter"`, `"dramatic_flow"` |
| `hair_physics` | Fisika rambut | Gerakan rambut | `"none"`, `"light_sway"`, `"dynamic_flow"` |

**`environment_motion` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `elements` | Elemen yang bergerak | Apa yang bergerak | `["leaves", "water", "clouds", "neon_flicker"]` |
| `intensity` | Intensitas | Seberapa kuat bergerak | `"subtle"`, `"moderate"`, `"dramatic"` |
| `wind_effect` | Efek angin | Pengaruh angin | `"none"`, `"light_breeze"`, `"strong_wind"` |

---

### Layer 4B — `temporal_sequence` *(Khusus Video — Bebas Divariasikan)*

> **Fungsi:** Mendefinisikan struktur waktu dari video — duration, fps, urutan shot, dan transisi. Tidak ada padanannya di schema gambar.

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `total_duration` | Total durasi | Panjang video dalam detik | Float: `3.0`, `5.0`, `10.0` |
| `fps` | Frame per second | Kecepatan frame | Integer: `24`, `30`, `60`, `120` |
| `shot_sequence` | Urutan shot | Daftar shot dalam video | Array of Objects |
| `transition` | Transisi | Perpindahan antar shot | Object |
| `loop` | Perulangan | Apakah video loop | Boolean |

**`shot_sequence` (Array of Objects)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `shot_index` | Nomor urut shot | Urutan dalam sequence | Integer |
| `start_time` | Waktu mulai | Detik ke berapa | Float |
| `duration` | Durasi shot ini | Berapa lama | Float |
| `shot_type` | Tipe shot | Sama dengan composition | `"CU"`, `"MS"`, `"WS"` |
| `key_action` | Aksi kunci | Apa yang terjadi | `"character_enters"`, `"expression_change"` |

**`transition` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `type` | Tipe transisi | Cara perpindahan | `"cut"`, `"dissolve"`, `"fade"`, `"wipe"`, `"none"` |
| `duration` | Durasi | Berapa lama transisi | Float dalam detik |
| `style` | Gaya | Karakter transisi | `"hard_cut"`, `"soft_dissolve"`, `"match_cut"` |

---

### Layer 7 — `technical` *(Disesuaikan per Platform)*

> **Fungsi:** Spesifikasi teknis render akhir. Ini adalah layer yang paling bervariasi antar platform — nilai yang valid untuk MidJourney berbeda dengan Stable Diffusion, Runway, atau Pika. Untuk **gambar**: tidak ada `video_specs`. Untuk **video**: tambahkan `video_specs`.
>
> **Catatan kompatibilitas platform:**
> - **MidJourney** — pakai `render_specs.aspect_ratio`, abaikan `render_engine` dan `sampling`
> - **Stable Diffusion/SDXL** — semua field relevan, `sampling` sangat penting
> - **DALL-E 3** — hanya `resolution` dan `aspect_ratio` yang dipakai
> - **Runway / Kling / Sora** — fokus pada `video_specs` (fps, codec, duration)
> - **Pika** — `motion_intensity` dan `fps` adalah prioritas

| Tag | Fungsi | Deskripsi | Struktur |
|-----|--------|-----------|----------|
| `render_specs` | Spesifikasi render | Parameter output utama | Object |
| `camera_tech` | Teknik kamera | Virtual camera settings | Object |
| `post_processing` | Post-proses | Edit dan efek digital | Object |
| `video_specs` | Spesifikasi video | **Video only**: codec, fps, audio | Object |

**`render_specs` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `resolution` | Resolusi | Pixel dimensions | `"720p"`, `"1080p"`, `"4k"`, `"8k"`, `"1024x1024"` |
| `aspect_ratio` | Rasio aspek | Width:height | `"16:9"`, `"21:9"`, `"1:1"`, `"9:16"`, `"2:3"` |
| `render_engine` | Engine render | Software/AI | `"unreal_engine_5"`, `"octane"`, `"cycles"`, `"native"` |
| `quality_settings` | Setting kualitas | Detail level | `"draft"`, `"good"`, `"high"`, `"ultra"`, `"cinematic"` |
| `sampling` | Sampling rate | Anti-aliasing | `"low"`, `"medium"`, `"high"`, `"max"` |

**`camera_tech` (Sub-object)**

| Tag | Fungsi | Deskripsi | Contoh |
|-----|--------|-----------|--------|
| `film_back` | Ukuran sensor | Format kamera virtual | `"full_frame"`, `"aps_c"`, `"medium_format"` |
| `iso` | Sensitivitas | Light sensitivity | `"100"`, `"800"`, `"1600"`, `"6400"` |
| `shutter` | Shutter speed | Motion blur control | `"1/30"`, `"1/125"`, `"1/500"` |
| `look_profile` | Look profile | Color science | `"log"`, `"rec709"`, `"raw"`, `"print_emulation"` |

**`post_processing` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `color_grading` | Grading warna | Color correction | `"teal_orange"`, `"bleach_bypass"`, `"vintage"` |
| `grain_noise` | Butir dan noise | Film grain | `"clean"`, `"subtle_35mm"`, `"heavy_grain"` |
| `lens_effects` | Efek lensa | Optical effects | `["vignette", "chromatic_aberration", "anamorphic_flare"]` |
| `sharpening` | Ketajaman | Detail enhancement | `"soft"`, `"natural"`, `"crispy"` |
| `vfx_overlay` | Overlay VFX | Added elements | `["lens_dirt", "scan_lines", "film_damage"]` |

**`video_specs` (Sub-object) — Video Only**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `codec` | Format video | Kompresi video | `"h264"`, `"h265"`, `"prores"`, `"av1"` |
| `bitrate` | Kualitas data | Data per detik | `"8mbps"`, `"25mbps"`, `"50mbps"`, `"lossless"` |
| `audio_track` | Track audio | Deskripsi audio | `"none"`, `"ambient_only"`, `"music"`, `"dialogue"` |
| `delivery_format` | Format distribusi | Container format | `"mp4"`, `"mov"`, `"webm"`, `"gif"` |
| `stabilization` | Stabilisasi | Post stabilization | `"none"`, `"subtle"`, `"strong"` |

---

### Layer 8A — `metadata` *(Admin — Tidak Masuk Prompt)*

> **Fungsi:** Informasi administratif template. Diletakkan di akhir karena **tidak mempengaruhi generate sama sekali**. Hanya untuk tracking, versioning, dan management template koleksi karakter.

| Tag | Fungsi | Deskripsi | Contoh |
|-----|--------|-----------|--------|
| `title` | Nama template | Judul deskriptif | `"Cyberpunk Night Market"` |
| `description` | Penjelasan singkat | Overview fungsi template | `"Complex urban night scene"` |
| `author` | Pembuat | Creator template | `"username"` |
| `created_date` | Tanggal pembuatan | ISO 8601 | `"2024-01-15"` |
| `last_modified` | Update terakhir | Timestamp modifikasi | `"2024-02-08T14:30:00Z"` |
| `category` | Kategori utama | Genre atau tipe | `"sci-fi"`, `"fantasy"`, `"realistic"` |
| `subcategories` | Tag spesifik | Array kategori detail | `["cyberpunk", "urban", "night"]` |
| `complexity_level` | Tingkat kompleksitas | Seberapa kompleks | `"low"`, `"medium"`, `"high"`, `"ultra"` |
| `target_ai` | AI target | Platform yang dioptimalkan | `["midjourney", "sdxl", "runway"]` |
| `language` | Bahasa prompt | Kode bahasa output | `"en"`, `"id"`, `"ja"` |
| `version_notes` | Changelog | Riwayat perubahan | `"v3.0: Added identity_anchor"` |

---

### Layer 8B — `variations`

> **Fungsi:** Mengontrol variasi dan batch generation. User bisa menentukan elemen mana yang boleh berubah dan seberapa banyak.

| Tag | Fungsi | Deskripsi | Struktur |
|-----|--------|-----------|----------|
| `randomizable_elements` | Elemen acak | Yang boleh divariasi | Array of Strings |
| `variation_rules` | Rule variasi | Constraint perubahan | Array of Objects |
| `seed_system` | Sistem seed | Randomization control | Object |
| `batch_config` | Konfigurasi batch | Generate massal | Object |

**`variation_rules` (Array of Objects)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `target_element` | Elemen target | Path ke field | `"lighting.key_light.color.hue"` |
| `variation_type` | Tipe variasi | Cara mengubah | `"random_pick"`, `"range"`, `"toggle"` |
| `options` | Opsi variasi | Nilai yang mungkin | Array atau Range |
| `probability` | Probabilitas | Chance of change | Float: `0.0` to `1.0` |
| `constraints` | Batasan | Apa yang diproteksi | Object: `{locked_by_identity: true}` |

**`seed_system` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `base_seed` | Seed dasar | Angka awal randomisasi | Integer: `42` |
| `deterministic` | Deterministik | Seed sama = hasil sama | Boolean |

**`batch_config` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `count` | Jumlah variasi | Berapa banyak generate | Integer |
| `naming_pattern` | Pola penamaan | Format nama file output | `"character_{seed}_{n}"` |
| `output_directory` | Direktori output | Folder tujuan | String path |

---

### Layer 8C — `output_config`

> **Fungsi:** Mengontrol bagaimana semua data dikemas menjadi prompt teks final. Ini adalah "mesin" dari prompt generator.

| Tag | Fungsi | Deskripsi | Struktur |
|-----|--------|-----------|----------|
| `prompt_structure` | Struktur prompt | Format output text | Object |
| `section_weights` | Bobot section | Prioritas dalam prompt | Object |
| `negative_prompt` | Prompt negatif | Apa yang dikecualikan | String/Array |
| `parameter_append` | Parameter platform | AI-specific settings | Object |

**`prompt_structure` (Sub-object)**

| Tag | Fungsi | Deskripsi | Format |
|-----|--------|-----------|--------|
| `order` | Urutan section | Sequence pembangunan | Array of section names |
| `separator` | Pemisah | Antara section | `", "` atau `". "` atau `" | "` |
| `emphasis_syntax` | Sintaks emphasis | Cara highlight weight | `"parentheses"`, `"brackets"`, `"weight_suffix"` |
| `length_limit` | Batas panjang | Max characters | Integer: `1000`, `2000`, `4000` |
| `truncation_strategy` | Strategi potong | Jika terlalu panjang | `"priority_only"`, `"proportional"` |

**`section_weights` — Nilai Default**

> Skala: `0.5` (hint) → `1.0` (normal) → `2.0` (critical/locked)
> Weight di atas `1.0` menghasilkan emphasis dalam prompt. Weight `0.0` berarti tidak masuk prompt sama sekali.

| Section | Default Weight | Status | Keterangan |
|---------|---------------|--------|------------|
| `identity_anchor` | **2.0** | 🔒 LOCKED | CRITICAL — paspor permanen karakter |
| `technical_constraints` | **2.0** | 🔒 LOCKED | CRITICAL — negative DNA |
| `subjects` | **1.5** | 🔒 LOCKED | VERY IMPORTANT — blueprint karakter |
| `lighting` | **1.5** | 🎬 Variabel | VERY IMPORTANT — mempengaruhi keterbacaan wajah |
| `composition` | **1.3** | 🎬 Variabel | IMPORTANT |
| `atmosphere` | **1.2** | 🎬 Variabel | IMPORTANT |
| `scene_core` | 1.0 | 🎬 Variabel | NORMAL |
| `environment` | 1.0 | 🎬 Variabel | NORMAL |
| `motion` | 1.0 | 🎬 Variabel | NORMAL (video only) |
| `temporal_sequence` | 0.8 | 🎬 Variabel | SUPPORTING (video only) |
| `technical` | 0.8 | ⚙️ Platform | SUPPORTING |
| `variations` | 0.0 | ⚙️ Internal | Tidak masuk prompt |
| `metadata` | 0.0 | ⚙️ Admin | Tidak masuk prompt |

**`parameter_append` (Sub-object)**

| Tag | Fungsi | Contoh |
|-----|--------|--------|
| `midjourney` | MJ parameters | `"--ar 21:9 --v 6 --style raw --s 250"` |
| `stable_diffusion` | SD parameters | `"--steps 30 --cfg 7 --sampler DPM"` |
| `dalle3` | DALL-E params | `"quality=hd, style=vivid"` |
| `runway` | Runway params | `"--fps 24 --motion 1.2 --duration 4"` |
| `pika` | Pika params | `"--ar 16:9 --motion 2"` |

---

## Bagian D — Perbedaan Schema Gambar vs Video

| Aspek | Gambar | Video |
|-------|--------|-------|
| `generator_type` | `"image"` | `"video"` |
| Layer 0–1 (Character Lock) | ✅ Sama persis | ✅ Sama persis — konsistensi antar frame lebih kritis |
| Layer 4 `motion` | ❌ Dilewati | ✅ Wajib ada |
| Layer 4 `temporal_sequence` | ❌ Dilewati | ✅ Wajib ada |
| Layer 7 `technical.video_specs` | ❌ Tidak ada | ✅ Wajib ada |
| `subjects.dressing_room.cloth_physics` | Tidak aktif | ✅ Aktif (kain bergerak) |
| `composition.camera.stability` | Bebas | Lebih kritis (mempengaruhi motion) |
| `atmosphere.audio_implied` | Opsional | Lebih relevan |
| Konsistensi wajah antar frame | Tidak relevan | ✅ Sangat kritis — gunakan seed deterministik |
| Prioritas utama | Composition + Lighting | Character Lock + Motion consistency |

**BOTH (`generator_type = "both"`)**

Gunakan schema video (superset dari schema gambar). Generator menghasilkan dua output sekaligus: still frame (gambar) dan animated sequence (video). `output_config.parameter_append` harus berisi keduanya.

---

## Bagian E — Contoh Implementasi

### Contoh 1: Gambar (Karakter Fantasy)

```json
{
  "schema_version": "3.0",
  "generator_type": "image",
  "template_id": "EIRA_FOREST_001",

  "subjects": {
    "primary_subject": {
      "subject_type": "human",
      "archetype": "elven_ranger",
      "physical_attributes": {
        "species": "High Elf",
        "age": "18-20 years old",
        "stature": { "height": "158cm", "frame": "ectomorph" },
        "face": {
          "shape": "soft_heart",
          "eyes": "large_almond_dark_obsidian",
          "ears": "pointed_45_degree"
        },
        "hair": { "color": "jet_black", "style": "high_twisted_bun" }
      },
      "dressing_room": {
        "physics_engine": {
          "collision": "STRICT_BODY_INTEGRITY",
          "compression": "disabled"
        },
        "active_outfit": {
          "set_name": "Wilderness_Survival_Basic",
          "upper": "halter-neck deep V-plunge burlap top",
          "lower": "tattered mini skirt (jagged irregular hem)",
          "footwear": "barefoot",
          "accessories": ["thin silver-wire choker", "blue beads", "teardrop emerald green pendant"],
          "status": "active"
        }
      },
      "pose_action": {
        "base_pose": "standing",
        "line_of_sight": "at_camera",
        "energy_level": "subtle"
      },
      "expression_emotion": {
        "primary_emotion": "calm_confidence",
        "intensity": "moderate"
      }
    }
  },

  "identity_anchor": {
    "name": "Eira Shadowleaf",
    "base_body_reference": "eira",
    "age_profile": {
      "target": "18-20 years old",
      "logic": "locks_out: [aging_signs, mature_anatomy]",
      "skin_condition": "smooth_porcelain_non_porous"
    },
    "race_matrix": {
      "fantasy": "High Elf",
      "realistic_base": "East Asian descent",
      "skull_logic": "locks_out: [European_facial_structure]"
    },
    "locked_features": ["race", "age", "height", "chest_volume"]
  },

  "technical_constraints": {
    "negative_prompts": [
      "western facial features:1.3",
      "blonde hair", "blue eyes",
      "huge breasts:1.2", "fake proportions",
      "muscular body", "aged skin", "wrinkles"
    ],
    "identity_locks": ["race_matrix", "age_profile", "body_proportions"]
  },

  "scene_core": {
    "scene_type": "medium_shot",
    "primary_focus": "character",
    "narrative_moment": "peaceful_idle",
    "time_setting": {
      "period": "medieval_fantasy",
      "season": "late_autumn",
      "time_of_day": "golden_hour"
    },
    "space_setting": {
      "location_type": "natural",
      "specific_place": "ancient_forest_clearing",
      "scale": "intimate"
    }
  },

  "composition": {
    "camera": {
      "shot_type": "MS",
      "angle": "eye_level",
      "lens": { "focal_length": "85mm", "aperture": "f/2.8", "dof": "shallow" },
      "stability": "static"
    },
    "framing": {
      "subject_placement": "third_left",
      "symmetry": "asymmetrical"
    }
  },

  "lighting": {
    "preset": "golden_hour",
    "key_light": {
      "enabled": true,
      "source_type": "sun",
      "position": "45_right_back",
      "intensity": "bright",
      "quality": "soft",
      "color": { "temperature": "5200K", "hue": "warm_gold" }
    },
    "rim_light": {
      "enabled": true,
      "color": { "hue": "warm_amber" },
      "intensity": "moderate"
    },
    "volumetric_effects": {
      "enabled": true,
      "medium_type": "dust_motes",
      "density": "subtle"
    }
  },

  "atmosphere": {
    "emotional_tone": ["peaceful", "mysterious", "ethereal"],
    "visual_style": {
      "art_movement": "fantasy_realism",
      "film_reference": "lord_of_the_rings_extended",
      "color_palette": ["warm_gold", "deep_forest_green", "soft_amber"],
      "contrast_mood": "balanced",
      "texture_emphasis": "organic_soft"
    }
  },

  "technical": {
    "render_specs": {
      "resolution": "4k",
      "aspect_ratio": "2:3",
      "render_engine": "unreal_engine_5",
      "quality_settings": "cinematic"
    },
    "camera_tech": {
      "film_back": "full_frame",
      "iso": "400",
      "look_profile": "rec709"
    },
    "post_processing": {
      "color_grading": "warm_fantasy",
      "grain_noise": "subtle_35mm",
      "lens_effects": ["subtle_vignette", "gentle_bloom"]
    }
  },

  "output_config": {
    "prompt_structure": {
      "order": {
        "_note": "Setiap platform punya urutan optimal berbeda. Generator memilih order sesuai target_ai.",
        "midjourney": [
          "technical",
          "identity_anchor", "subjects",
          "scene_core", "environment",
          "composition", "lighting", "atmosphere"
        ],
        "stable_diffusion": [
          "identity_anchor", "technical_constraints", "subjects",
          "scene_core", "environment",
          "composition", "lighting", "atmosphere",
          "technical"
        ],
        "dalle3": [
          "identity_anchor", "subjects",
          "scene_core", "environment",
          "composition", "lighting", "atmosphere"
        ],
        "default": [
          "identity_anchor", "technical_constraints", "subjects",
          "scene_core", "environment",
          "composition", "lighting", "atmosphere",
          "technical"
        ]
      },
      "separator": {
        "midjourney": ", ",
        "stable_diffusion": ", ",
        "dalle3": ". ",
        "default": ", "
      },
      "emphasis_syntax": {
        "midjourney": "none",
        "stable_diffusion": "parentheses_with_weight",
        "dalle3": "none",
        "default": "parentheses"
      },
      "length_limit": {
        "midjourney": 600,
        "stable_diffusion": 300,
        "dalle3": 4000,
        "default": 2000
      },
      "truncation_strategy": "priority_only"
    },
    "section_weights": {
      "identity_anchor": 2.0,
      "technical_constraints": 2.0,
      "subjects": 1.5,
      "lighting": 1.5,
      "composition": 1.3,
      "atmosphere": 1.2,
      "scene_core": 1.0,
      "environment": 1.0,
      "technical": 0.8,
      "variations": 0.0,
      "metadata": 0.0
    },
    "negative_prompt": {
      "_note": "negative_prompt untuk SD diproses terpisah dari order, langsung ke negative prompt field.",
      "shared": "blurry, low_quality, deformed, bad anatomy",
      "identity": "western facial features:1.3, blonde hair, blue eyes, huge breasts:1.2, aged skin, wrinkles",
      "midjourney": "Masuk ke akhir prompt dengan prefix 'no': --no western facial features, blonde hair",
      "stable_diffusion": "western facial features:1.3, blonde hair, blue eyes, huge breasts:1.2, aged skin, wrinkles, blurry, low_quality, deformed"
    },
    "parameter_append": {
      "midjourney": "--ar 2:3 --v 6 --style raw --s 250 --iw 2",
      "stable_diffusion": "--steps 30 --cfg 7 --sampler DPM++ 2M Karras",
      "dalle3": "quality=hd, style=vivid"
    }
  },

  "metadata": {
    "title": "Eira in Autumn Forest",
    "author": "user",
    "created_date": "2025-02-17",
    "category": "fantasy",
    "target_ai": ["midjourney", "sdxl"],
    "version_notes": "v3.0 — identity_anchor implemented"
  }
}
```

### Contoh 2: Gambar (Scene Urban/Cyberpunk)

```json
{
  "schema_version": "3.0",
  "generator_type": "image",
  "template_id": "CYBERPUNK_ALLEY_001",

  "subjects": {
    "primary_subject": {
      "subject_type": "human",
      "archetype": "underworld_broker",
      "physical_attributes": {
        "age": "40s",
        "gender_presentation": "masculine"
      },
      "pose_action": {
        "base_pose": "standing",
        "action_verb": "exchanging",
        "action_object": "metal_transaction_case",
        "energy_level": "subtle"
      },
      "expression_emotion": {
        "primary_emotion": "suspicious",
        "secondary_emotion": "calculating",
        "intensity": "moderate"
      }
    },
    "secondary_subjects": [
      {
        "subject_type": "human",
        "archetype": "anonymous_contact",
        "pose_action": { "base_pose": "standing", "line_of_sight": "away" }
      }
    ]
  },

  "scene_core": {
    "scene_type": "wide_shot",
    "primary_focus": "action",
    "narrative_moment": "climax",
    "dramatic_weight": "intense",
    "time_setting": {
      "period": "2060s",
      "season": "winter",
      "time_of_day": "3am"
    },
    "space_setting": {
      "location_type": "urban",
      "region": "downtown",
      "specific_place": "narrow_service_alley",
      "scale": "intimate"
    }
  },

  "environment": {
    "location": {
      "setting_type": "exterior",
      "specific_location": "narrow_service_alley",
      "geographic_region": "neo_tokyo_lower_district",
      "cultural_context": "japanese_cyberpunk_melting_pot",
      "ownership": "corporate_neglected",
      "maintenance_state": "decaying_functional"
    },
    "architecture": {
      "architectural_style": "utilitarian_cyberpunk",
      "era_mix": ["2020s_infrastructure", "2060s_patches"],
      "materials": ["weathered_concrete", "rusted_metal", "temporal_plastic_panels"],
      "structural_features": ["exposed_utility_pipes", "haphazard_wiring", "emergency_ladders"],
      "decorative_elements": ["faded_holographic_ads", "gang_tags", "corporate_warning_signs"]
    },
    "weather_climate": {
      "precipitation": "light_drizzle",
      "wind": "calm",
      "visibility": "hazy",
      "temperature_indicators": ["breath_visible", "wet_surfaces"],
      "sky_condition": "overcast_city_glow"
    },
    "props_objects": [
      {
        "name": "metal_transaction_case",
        "type": "container",
        "condition": "worn_industrial",
        "importance": "plot_critical"
      },
      {
        "name": "abandoned_delivery_drone",
        "type": "vehicle",
        "condition": "damaged_inoperative",
        "position": "background_prop"
      }
    ],
    "technology": {
      "visible_tech": ["holographic_signs", "surveillance_camera_blinking", "charging_station"],
      "tech_condition": "mix_functional_and_broken"
    }
  },

  "composition": {
    "camera": {
      "shot_type": "WS",
      "angle": "low_angle",
      "lens": { "focal_length": "35mm", "aperture": "f/2.0", "dof": "moderate" },
      "stability": "static"
    },
    "framing": {
      "subject_placement": "center",
      "symmetry": "asymmetrical"
    }
  },

  "lighting": {
    "key_light": {
      "enabled": true,
      "source_type": "neon",
      "position": "top_left",
      "intensity": "moderate",
      "quality": "hard",
      "color": { "hue": "#FF00FF", "temperature": "cool" }
    },
    "fill_light": {
      "enabled": true,
      "source_type": "neon",
      "color": { "hue": "#00FFFF" },
      "intensity": "dim"
    },
    "volumetric_effects": {
      "enabled": true,
      "medium_type": "rain",
      "density": "moderate",
      "interaction_with_light": ["god_rays", "light_cones"]
    },
    "shadows": {
      "style": "realistic",
      "softness": "hard",
      "color_tint": "cool_blue"
    }
  },

  "atmosphere": {
    "emotional_tone": ["tense", "suspicious", "noir_mystery", "urban_decay"],
    "narrative_implication": "illegal_transaction_in_dystopian_underworld",
    "visual_style": {
      "art_movement": "cyber_noir",
      "film_reference": "blade_runner_2049_meets_the_third_man",
      "color_palette": ["neon_magenta", "cyan", "warm_orange", "deep_shadow_black"],
      "contrast_mood": "high_contrast_selective_color",
      "texture_emphasis": "wet_reflective_and_gritty"
    },
    "temporal_quality": {
      "time_feeling": "late_night_desperation",
      "urgency": "low_but_tense"
    },
    "audio_implied": {
      "ambient": ["distant_sirens", "hum_of_electronics", "rain_on_metal"],
      "foreground": ["muffled_conversation", "case_latch_click"]
    }
  },

  "technical": {
    "render_specs": {
      "resolution": "4k",
      "aspect_ratio": "21:9",
      "render_engine": "unreal_engine_5",
      "quality_settings": "cinematic",
      "sampling": "high"
    },
    "camera_tech": {
      "film_back": "full_frame",
      "iso": "1600",
      "shutter": "1/48",
      "look_profile": "log_with_high_dynamic_range"
    },
    "post_processing": {
      "color_grading": "teal_orange_with_neon_pop",
      "grain_noise": "subtle_35mm",
      "lens_effects": ["anamorphic_flare", "subtle_vignette"],
      "sharpening": "natural",
      "vfx_overlay": ["lens_dirt", "chromatic_aberration_edges"]
    }
  },

  "variations": {
    "randomizable_elements": [
      "lighting.key_light.color.hue",
      "subjects.primary_subject.pose_action.energy_level",
      "environment.weather_climate.precipitation"
    ],
    "variation_rules": [
      {
        "target_element": "lighting.key_light.color.hue",
        "variation_type": "random_pick",
        "options": ["#FF00FF", "#00FFFF", "#FFAA00", "#AA00FF"],
        "probability": 1.0,
        "constraints": { "harmony_with": "environment.architecture.decorative_elements" }
      }
    ],
    "seed_system": {
      "base_seed": 42,
      "deterministic": true
    }
  },

  "output_config": {
    "prompt_structure": {
      "order": {
        "_note": "Scene ini tidak menggunakan identity_anchor (karakter generik). Order difokuskan pada atmosphere dan environment.",
        "midjourney": [
          "technical",
          "atmosphere", "scene_core",
          "subjects", "environment",
          "composition", "lighting"
        ],
        "stable_diffusion": [
          "atmosphere", "subjects",
          "scene_core", "environment",
          "composition", "lighting",
          "technical"
        ],
        "default": [
          "atmosphere", "subjects",
          "scene_core", "environment",
          "composition", "lighting",
          "technical"
        ]
      },
      "separator": {
        "midjourney": ", ",
        "stable_diffusion": ", ",
        "default": ". "
      },
      "emphasis_syntax": {
        "midjourney": "none",
        "stable_diffusion": "parentheses_with_weight",
        "default": "parentheses"
      },
      "length_limit": {
        "midjourney": 600,
        "stable_diffusion": 300,
        "default": 2000
      },
      "truncation_strategy": "priority_only"
    },
    "section_weights": {
      "atmosphere": 1.5,
      "lighting": 1.5,
      "subjects": 1.3,
      "scene_core": 1.2,
      "environment": 1.2,
      "composition": 1.0,
      "technical": 0.8,
      "variations": 0.0,
      "metadata": 0.0
    },
    "negative_prompt": {
      "shared": "blurry, low_quality, cartoon, anime, oversaturated, duplicate_elements",
      "stable_diffusion": "blurry, low_quality, cartoon, anime, oversaturated, duplicate_elements, deformed, bad anatomy"
    },
    "parameter_append": {
      "midjourney": "--ar 21:9 --v 6 --style raw --s 250",
      "stable_diffusion": "--steps 30 --cfg 7 --sampler DPM++ 2M Karras"
    }
  },

  "metadata": {
    "title": "Cyberpunk Alley Deal",
    "author": "user",
    "created_date": "2025-01-15",
    "category": "sci-fi",
    "subcategories": ["cyberpunk", "urban", "night"],
    "complexity_level": "high",
    "target_ai": ["midjourney", "sdxl"],
    "version_notes": "v3.0 — merged from legacy schema"
  }
}
```

---

## Bagian F — Panduan `prompt_structure.order` per Platform

---

### Konsep: Dua Urutan yang Berbeda Tujuan

Schema ini memisahkan dua urutan yang bekerja secara independen:

| Urutan | Siapa yang pakai | Tujuan |
|--------|-----------------|--------|
| **Workflow Layer (0–8)** | Kreator | Urutan pengisian data — dari hal paling penting ke paling fleksibel |
| **`prompt_structure.order`** | Generator → AI | Urutan penyusunan prompt teks final — dioptimalkan per platform |

Keduanya tidak perlu sama. Kreator mengisi mengikuti logika kreatif. Generator menyusun ulang mengikuti logika platform AI target.

---

### Mengapa Urutan dalam Prompt Penting?

AI generator membaca prompt sebagai **sequence token**, bukan sebagai struktur data. Token yang muncul lebih awal mendapat **attention weight lebih tinggi** selama proses sampling — artinya elemen di awal prompt lebih dominan mempengaruhi output. Setiap platform punya karakteristik berbeda dalam hal ini.

---

### Perilaku per Platform

---

#### MidJourney

**Karakteristik:**
- Membaca prompt **kiri ke kanan**, token awal mendominasi komposisi dan mood
- Tidak memiliki negative prompt field terpisah — larangan ditulis dengan `--no` di akhir
- Sangat sensitif terhadap **style dan aesthetic keywords** di posisi awal
- Punya batas token ~60 kata efektif — prompt panjang diabaikan di akhir
- Parameter teknis (`--ar`, `--v`, `--s`) **tidak masuk ke dalam order**, diletakkan di `parameter_append`

**Rekomendasi order:**
```json
"order": [
  "technical",       ← aspect ratio & quality duluan — MJ butuh ini untuk setup canvas
  "identity_anchor", ← identitas karakter
  "subjects",        ← deskripsi fisik & kostum
  "atmosphere",      ← mood & style — MJ sangat responsif terhadap ini di posisi awal-tengah
  "scene_core",      ← konteks scene
  "environment",     ← detail environment
  "composition",     ← kamera & framing
  "lighting"         ← cahaya di akhir (MJ sering menginterpretasi ini dari atmosphere juga)
]
```

**Mengapa `technical` pertama di MJ?**
MidJourney membaca aspect ratio dan quality setting dari prompt teks (bukan hanya dari `--ar`) jika ditulis eksplisit. Menempatkannya pertama memastikan canvas proportion terbentuk sebelum AI membangun komposisi.

**Catatan negative prompt MJ:**
```
"negative_prompt_format": "Masuk ke parameter_append sebagai: --no [keywords]"
"contoh": "--no western facial features, blonde hair, aged skin"
```

---

#### Stable Diffusion / SDXL

**Karakteristik:**
- Menggunakan **CLIP tokenizer** — tiap kata adalah token, posisi awal mendapat attention lebih tinggi
- Mendukung **explicit weight syntax**: `(keyword:1.5)` atau `((keyword))` untuk emphasis
- Memiliki **negative prompt field terpisah** — diproses sepenuhnya independen dari order
- Batas token: 75 token per chunk (prompt dipotong per 75 token, chunk pertama paling berpengaruh)
- `technical` (resolusi, sampling) tidak masuk prompt teks — dikontrol via UI/API parameter

**Rekomendasi order:**
```json
"order": [
  "identity_anchor",       ← masuk chunk pertama (75 token pertama) = pengaruh maksimal
  "subjects",              ← detail fisik & kostum — tetap di chunk pertama jika memungkinkan
  "composition",           ← framing & shot type
  "lighting",              ← cahaya setelah komposisi
  "scene_core",            ← konteks scene
  "environment",           ← environment detail
  "atmosphere"             ← mood & style — SD lebih baik menerima ini di tengah-akhir
]
```

**Negative prompt SD (diproses terpisah, tidak masuk order):**
```
"negative_prompt_field": "western facial features:1.3, blonde hair, blue eyes,
                          huge breasts:1.2, aged skin, wrinkles,
                          blurry, low_quality, deformed, bad anatomy"
```

**Catatan emphasis syntax SD:**
```
identity_anchor weight 2.0 → diterjemahkan menjadi: (High Elf, East Asian features:1.5)
subjects weight 1.5        → diterjemahkan menjadi: (jet black hair, dark eyes:1.3)
atmosphere weight 1.2      → diterjemahkan menjadi: (fantasy realism:1.2)
```

---

#### DALL-E 3

**Karakteristik:**
- Merewrite prompt secara internal menggunakan GPT-4 sebelum generate — urutan asli **kurang berpengaruh**
- Yang benar-benar penting adalah **kelengkapan dan kejelasan deskripsi** dalam bahasa natural
- Tidak mendukung weight syntax seperti SD
- Tidak ada negative prompt field — larangan ditulis sebagai kalimat negatif dalam prompt
- Batas prompt sangat panjang (~4000 karakter) — manfaatkan untuk deskripsi detail
- Prompt berbentuk **kalimat lengkap** lebih efektif daripada keyword

**Rekomendasi order:**
```json
"order": [
  "identity_anchor", ← deskripsi karakter selengkap mungkin
  "subjects",        ← detail fisik & kostum dalam kalimat natural
  "scene_core",      ← konteks waktu dan tempat
  "environment",     ← detail environment
  "composition",     ← framing & sudut kamera
  "lighting",        ← deskripsi cahaya
  "atmosphere"       ← mood & gaya visual
]
```

**Catatan negative prompt DALL-E 3:**
```
"format": "Ditulis sebagai kalimat dalam prompt utama"
"contoh": "The character must NOT have European facial features,
           blonde hair, or blue eyes. Avoid any signs of aging."
```

---

#### Runway ML (Gen-3, Gen-4)

**Karakteristik:**
- Render **frame pertama** seperti image AI — order untuk image berlaku di sini
- Setelah frame pertama, **motion vector** diekstrak dari bagian motion dalam prompt
- Konsistensi karakter antar frame sangat kritis — `identity_anchor` harus kuat di awal
- Mendukung prompt terpisah untuk **first frame** dan **motion instruction**
- Batas prompt: ~500 karakter untuk motion instruction

**Rekomendasi order (frame pertama):**
```json
"order_first_frame": [
  "identity_anchor", ← kunci karakter untuk frame pertama
  "subjects",        ← tampilan visual karakter
  "scene_core",      ← konteks scene
  "environment",     ← detail environment frame pertama
  "composition",     ← framing awal
  "lighting",        ← cahaya frame pertama
  "atmosphere"       ← mood keseluruhan
]
```

**Rekomendasi order (motion instruction):**
```json
"order_motion": [
  "motion",           ← instruksi gerakan utama — harus pertama dan eksplisit
  "temporal_sequence" ← durasi, fps, transisi
]
```

**Catatan konsistensi antar frame Runway:**
```
"seed_system.deterministic": true   ← WAJIB untuk konsistensi karakter
"identity_anchor" harus identik persis di semua generate dalam satu session
"subjects.dressing_room.active_outfit" tidak boleh berubah di antara shot
```

---

#### Pika Labs

**Karakteristik:**
- Fokus pada **motion quality** — prompt motion lebih berpengaruh dari prompt visual
- Lebih sederhana dari Runway — prompt visual tidak perlu sepanjang image AI
- Motion intensity (`--motion 1-4`) sangat berpengaruh terhadap stabilitas karakter
- Konsistensi karakter lebih lemah dari Runway — gunakan motion intensity rendah (1-2) jika konsistensi prioritas

**Rekomendasi order:**
```json
"order": [
  "identity_anchor", ← identitas karakter ringkas dan kuat
  "subjects",        ← visual karakter
  "motion",          ← instruksi gerak — Pika sangat responsif terhadap ini
  "scene_core",      ← setting singkat
  "lighting",        ← cahaya ringkas
  "atmosphere"       ← mood
]
```

**Catatan parameter Pika:**
```
"parameter_append": "--ar 16:9 --motion 2 --fps 24"
"_note": "--motion 1-2 untuk karakter konsisten, 3-4 untuk efek dramatis"
```

---

#### Kling AI

**Karakteristik:**
- Sangat kuat dalam **konsistensi karakter antar frame** — terkuat di antara video AI saat ini
- Mendukung **reference image** untuk identity lock yang lebih kuat dari prompt saja
- Prompt berbasis deskripsi natural (mirip DALL-E) — keyword syntax kurang efektif
- Face consistency mode tersedia — aktifkan untuk karakter yang sama di seluruh video

**Rekomendasi order:**
```json
"order": [
  "identity_anchor", ← deskripsi karakter dalam kalimat natural, sangat detail
  "subjects",        ← kostum dan penampilan fisik lengkap
  "scene_core",      ← konteks scene
  "motion",          ← instruksi gerak dalam kalimat natural
  "environment",     ← environment detail
  "lighting",        ← cahaya
  "atmosphere"       ← mood & style
]
```

**Catatan Kling untuk konsistensi karakter:**
```
"_tip": "Gunakan reference image (hasil generate pertama yang disetujui) sebagai
         input tambahan ke Kling — ini jauh lebih efektif dari prompt saja
         untuk menjaga konsistensi wajah antar scene."
```

---

#### Sora (OpenAI)

**Karakteristik:**
- Memahami **prompt panjang berbentuk paragraf** dengan sangat baik
- Konsistensi karakter antar scene masih dalam pengembangan — kurang konsisten dibanding Kling
- Sangat kuat dalam **world simulation** dan physics — environment & motion sangat realistis
- Prompt natural language > keyword syntax

**Rekomendasi order:**
```json
"order": [
  "scene_core",      ← Sora sangat kuat di world building — mulai dari scene
  "environment",     ← detail dunia yang akan disimulasikan
  "identity_anchor", ← deskripsi karakter
  "subjects",        ← tampilan fisik karakter
  "motion",          ← instruksi gerak
  "composition",     ← framing kamera
  "lighting",        ← cahaya
  "atmosphere"       ← mood
]
```

**Catatan Sora:**
```
"_tip": "Untuk konsistensi karakter di Sora, gunakan deskripsi yang
         sangat spesifik dan unik — hindari deskripsi generik seperti
         'beautiful woman'. Semakin unik deskripsinya, semakin konsisten
         Sora mempertahankannya antar frame."
```

---

### Tabel Ringkasan Rekomendasi Order

| Posisi | MidJourney | Stable Diffusion | DALL-E 3 | Runway | Pika | Kling | Sora |
|--------|-----------|-----------------|----------|--------|------|-------|------|
| **1** | technical | identity_anchor | identity_anchor | identity_anchor | identity_anchor | identity_anchor | scene_core |
| **2** | identity_anchor | subjects | subjects | subjects | subjects | subjects | environment |
| **3** | subjects | composition | scene_core | scene_core | motion | scene_core | identity_anchor |
| **4** | atmosphere | lighting | environment | environment | scene_core | motion | subjects |
| **5** | scene_core | scene_core | composition | composition | lighting | environment | motion |
| **6** | environment | environment | lighting | lighting | atmosphere | lighting | composition |
| **7** | composition | atmosphere | atmosphere | atmosphere | — | atmosphere | lighting |
| **8** | lighting | — | — | — | — | — | atmosphere |
| **Negative** | `--no` di parameter_append | Field terpisah | Kalimat dalam prompt | Field terpisah | Field terpisah | Field terpisah | Kalimat dalam prompt |
| **Syntax** | Keyword | `(keyword:weight)` | Kalimat natural | Kalimat natural | Keyword | Kalimat natural | Paragraf |
| **Batas prompt** | ~60 kata | 75 token/chunk | ~4000 karakter | ~500 karakter | ~300 karakter | ~1000 karakter | ~2000 karakter |
| **Konsistensi karakter** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |

---

### Prinsip Universal yang Berlaku di Semua Platform

Terlepas dari platform apapun, tiga prinsip ini selalu berlaku:

**1. Identity selalu dekat dengan awal**
`identity_anchor` dan deskripsi karakter tidak boleh berada di posisi akhir prompt. Semakin awal, semakin kuat pengaruhnya terhadap konsistensi karakter.

**2. Motion selalu dekat dengan subject (untuk video)**
Instruksi gerakan harus berada dekat dengan deskripsi subject yang bergerak — bukan di bagian akhir setelah atmosphere. AI video mengasosiasikan motion dengan entitas yang paling dekat secara posisi dalam prompt.

**3. Atmosphere selalu terakhir (atau mendekati terakhir)**
Atmosphere adalah filter — ia memodifikasi apa yang sudah ada. Menempatkannya di awal bisa membuat AI menginterpretasinya sebagai elemen struktural, bukan sebagai lapisan estetika di atas scene yang sudah terbangun.

---

*README v3.0 — Universal AI Prompt Generator Schema*
*Berlaku untuk AI Generator Gambar & Video: MidJourney, Stable Diffusion/SDXL, DALL-E 3, Runway, Pika, Kling, Sora*
*Prinsip utama: Character Lock (Layer 0–1) adalah fondasi permanen. Layer 2–8 adalah variabel bebas.*
