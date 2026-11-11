# Portofolio Vrisca Eka Setiawati Gulo, S.Si

Website portofolio penuh animasi, dibuat dengan **HTML + CSS + JavaScript murni** (tanpa library, tanpa framework).
Isi dan foto diambil dari dokumen PDF portofolio.

Konsepnya "buku catatan laboratorium": kertas milimeter, warna navy dan kuning stabilo dari PDF, serta cerita
**titrasi**: halaman bergerak menuju "titik akhir" berwarna merah muda di bagian Kontak.

---

## Pembaruan terbaru: hero hitam · merah muda · putih + suara

Yang berubah **hanya bagian pembuka (hero) dan layar tinta (preloader)**. Foto dan bagian lain tetap sama.

- **Tulisan baru:** "HELLO, WELCOME TO MY / PORTFOLIO". Hurufnya naik dan jatuh satu per satu. Setelah itu
  kilau putih lewat di kata PORTFOLIO, hurufnya mengayun pelan, dan "HELLO," melompat seperti orang melambai.
- **Latar bergerak:** animasi benang **WebThreads** dari React Bits, merah muda dan putih di latar hitam.
  Benang terdekat dengan kursor menyala; klik di area hero mengirim kilau cahaya di sepanjang benang.
- **Tombol masuk + suara:** sebelum tinta dituang, pengunjung klik **Masuk ke portofolio**. Tinta dituang
  dengan backsound **aurora** (React Bits Sound Lab) dan cairan berubah merah muda tepat di puncak suaranya.
  Saat hero muncul terdengar **"Hello, welcome to my portfolio"** dan tulisannya menyala kata demi kata.
  Ada juga pilihan **Masuk tanpa suara**.

> **Kenapa harus klik dulu?** Chrome, Edge, dan Safari melarang website memutar suara sebelum pengunjung
> mengklik sesuatu. Klik tombol Masuk itulah yang memberi izin, jadi backsound bisa langsung terdengar.

### File yang berubah

| File | Keterangan |
|---|---|
| `index.html` | diubah: hero, tombol masuk di preloader, memuat `js/web-threads.js` |
| `css/style.css` | diubah: warna & animasi hero, tombol masuk, header putih di atas hero hitam |
| `js/main.js` | diubah: bagian 3 (tombol masuk & suara) dan bagian 5b (benang) |
| `js/web-threads.js` | baru: WebThreads React Bits versi JavaScript biasa (situs ini tidak memakai React) |
| `assets/audio/aurora.mp3` | baru: backsound saat tinta dituang |
| `README.md` | diperbarui |

### Langkah memasang pembaruan ini

1. **Cadangkan dulu.** Salin folder proyekmu yang sekarang, beri nama misalnya `portofolio-lama`.
   Kalau ada yang tidak cocok, kamu bisa kembali ke sini.
2. **Ekstrak zip** pembaruan, lalu salin semua file di tabel atas ke folder proyekmu dengan susunan folder
   yang sama (pilih *Replace/Ganti* saat ditanya). Folder `assets/img` dan `assets/fonts` tidak berubah.
   Kalau setelah membuat zip ini kamu sempat mengubah `index.html`, `style.css`, atau `main.js` sendiri,
   perubahan itu akan tertimpa, jadi ulangi perubahannya setelah menyalin.
3. **Coba di komputer.** Di VS Code klik kanan `index.html` → **Open with Live Server**. Nyalakan speaker,
   klik **Masuk ke portofolio**: aurora terdengar saat tinta dituang, lalu sapaan saat hero muncul.
   Coba juga mode HP (`F12` → ikon HP) untuk melihat tampilan di layar kecil.
4. **Upload ke GitHub.** Buka repository situsmu → **Add file → Upload files** → seret `index.html`,
   `README.md`, serta folder `css`, `js`, dan `assets` ke halaman itu → **Commit changes**.
   Dengan Git (terminal VS Code):
   ```
   git add .
   git commit -m "Hero hitam pink, benang WebThreads, suara aurora & sapaan"
   git push
   ```
5. **Cek online.** Tunggu 1–2 menit, buka situsmu, lalu tekan `Ctrl+Shift+R` agar file terbaru terpakai.

---

## Isi folder

```
portofolio-vrisca/
├── index.html          ← semua teks & struktur halaman (edit konten di sini)
├── css/style.css       ← tampilan: warna, ukuran, tata letak, animasi CSS
├── js/main.js          ← animasi & interaksi (preloader, suara, gulir, galeri, dll.)
├── js/web-threads.js   ← animasi benang WebThreads (React Bits) di latar hero
├── assets/
│   ├── img/            ← foto (WebP), logo, favicon, gambar pratinjau (og-image)
│   ├── audio/          ← aurora.mp3 (backsound saat tinta dituang)
│   └── fonts/          ← font Inter yang disimpan sendiri + lisensinya
└── README.md           ← panduan ini
```

## Animasi yang ada

| Bagian | Animasi |
|---|---|
| Pembuka | Tombol **Masuk ke portofolio** (atau **Masuk tanpa suara**), lalu tinta dituang ke labu Erlenmeyer dengan backsound aurora sampai berubah merah muda (titik akhir), merah muda membanjiri layar dan surut ke bawah membuka halaman. Muncul **setiap kali** halaman dibuka/dimuat ulang (±3–4 detik setelah klik) |
| Hero | Latar hitam dengan benang WebThreads merah muda & putih yang terus bergerak (menyala di dekat kursor, berkilau saat diklik) dan cahaya aurora yang bergeser pelan. "HELLO, WELCOME TO MY" naik huruf per huruf, huruf PORTFOLIO jatuh satu per satu lalu berkilau & mengayun, "HELLO," melompat seperti melambai. Suara "Hello, welcome to my portfolio" terdengar sambil tulisannya menyala kata demi kata. Foto berjalan masuk dari kanan, nama & teks menyusul; parallax saat digulir |
| Foto profil (Hero & Tentang) | Arahkan kursor ke foto: hanya "lensa" bulat di sekitar kursor yang berubah menjadi rumus senyawa kimia (C₂₀H₁₄O₄, NiFe₂O₄, –SO₃H, …) berwarna navy → magenta (di hero: merah muda → putih), dan lensa mengikuti kursor. Di HP/tablet: ketuk foto |
| Header & menu | Laptop/desktop: navigasi lengkap di header. HP & tablet: tombol Menu membuka panel ringkas "tabel periodik"; tinta merah muda menyebar dari tombol, ubin unsur terbalik masuk satu per satu, dan menutup dengan animasi kebalikannya |
| Seluruh halaman | Gulir halus untuk mouse/trackpad, judul bagian muncul huruf per huruf, indikator buret di kanan |
| Tentang | Paragraf menyala kata demi kata mengikuti gulir, lalu efek stabilo kuning |
| Keahlian | Kotak "tabel periodik" berkumpul dari posisi acak; arahkan kursor untuk menyorot satu golongan |
| Pengalaman | Checklist tercentang satu per satu, foto "ditempel selotip" jatuh ke halaman |
| Proyek | Kartu digeser horizontal saat menggulir (desktop), ilustrasi kisi biochar & aliran listrik |
| Publikasi | Makalah miring 3D mengikuti kursor |
| Organisasi | Galeri foto yang bisa di-drag (desktop) atau digeser jari (HP) |
| Sertifikat | Pratinjau sertifikat mengikuti kursor; klik untuk memperbesar |
| Kontak | Cairan merah muda naik memenuhi layar = titik akhir titrasi |

Semua foto bisa diklik untuk dibuka di penampil (lightbox) dengan tombol panah/geser.
Animasi sengaja **selalu jalan**, walau "Animation effects" di Windows (atau "kurangi gerakan" di HP) dimatikan.
Untuk kembali mengikuti pengaturan itu: di `js/main.js` ubah `IKUTI_KURANGI_GERAKAN` menjadi `true`, lalu di
`css/style.css` kembalikan `@media all` → `@media (prefers-reduced-motion: no-preference)` dan
`@media not all` → `@media (prefers-reduced-motion: reduce)`. Situs juga tetap terbaca bila JavaScript mati.

---

## Langkah 1: Siapkan alat

1. Install **Visual Studio Code**: https://code.visualstudio.com
2. Di VS Code buka Extensions (`Ctrl+Shift+X`), cari **Live Server** (oleh Ritwick Dey), lalu klik Install.
3. Buat akun **GitHub** (gratis): https://github.com

## Langkah 2: Jalankan di komputer

1. Ekstrak `portofolio-vrisca.zip`.
2. Buka VS Code, pilih **File → Open Folder**, lalu pilih folder `portofolio-vrisca`.
3. Klik kanan `index.html` → **Open with Live Server**. Browser terbuka di `http://127.0.0.1:5500`.
4. Setiap kali kamu menyimpan file (`Ctrl+S`), halaman memuat ulang otomatis.

Cara lain memakai Python: buka terminal di folder ini, jalankan

```
python -m http.server 8000
```

lalu buka http://localhost:8000.

> Membuka `index.html` dengan klik dua kali juga bisa, tetapi console browser akan menampilkan
> peringatan CORS untuk font (aman diabaikan). Pakai Live Server supaya sama persis seperti saat online.

## Langkah 3: Pahami dan ubah isinya

| Yang ingin diubah | File | Cari bagian |
|---|---|---|
| Teks (nama, pengalaman, proyek, sertifikat) | `index.html` | komentar seperti `<!-- 4. PENGALAMAN KERJA -->` |
| Warna | `css/style.css` | blok `:root` paling atas (`--ink`, `--endpoint`, `--marker`, …) |
| Ukuran huruf & jarak | `css/style.css` | `--step-…`, `--gutter`, `--section-space` di `:root` |
| Foto | `assets/img/` | ganti file dengan nama yang sama, atau ubah `src` di `index.html` |
| Kehalusan gulir | `js/main.js` | angka `0.1` di bagian "1. Smooth scroll" (lebih kecil = lebih halus) |
| Lama jeda preloader | `js/main.js` | `PRELOADER` di bagian 3: `MIN` (tinta dituang, tanpa suara), `MIN_BERSUARA` (dengan suara, disamakan dengan puncak aurora), `HOLD`, `FLOOD` (milidetik) |
| Tulisan sambutan di hero | `index.html` | `<div class="hero__headline">` (tulis huruf kapital; kedua baris otomatis disamakan lebarnya) |
| Kalimat yang diucapkan | `js/main.js` | `SUARA.KALIMAT` di bagian 3 (juga `KECEPATAN`, `NADA`, `BAHASA`) |
| Volume / ganti backsound | `js/main.js` | `SUARA.VOLUME_LATAR` dan `SUARA.LATAR` di bagian 3 (taruh file baru di `assets/audio/`) |
| Pakai rekaman suaramu sendiri | `assets/audio/` + `js/main.js` | rekam "Hello, welcome to my portfolio", simpan sebagai `assets/audio/welcome.mp3`, lalu isi `SUARA.REKAMAN: 'assets/audio/welcome.mp3'` |
| Warna hero (hitam, merah muda) | `css/style.css` | `--hero-bg`, `--hero-pink`, `--hero-pink-soft` di blok `:root` |
| Warna, jumlah, kecepatan benang | `js/main.js` | `BENANG` di bagian 5b (`BENANG_HP` untuk HP & tablet) |
| Rumus kimia di foto profil | `js/main.js` | daftar `FORMULAS` di bagian 8 (angka setelah huruf otomatis jadi subskrip) |
| Isi menu HP (simbol & nama) | `index.html` | komentar `<!-- Menu ringkas HP & tablet … -->` |
| Foto mana yang berubah jadi rumus | `index.html` | atribut `data-formula` pada `<figure>` (hapus untuk mematikan, tambahkan untuk foto lain) |

Contoh:

- **Menambah sertifikat**: salin satu blok `<li class="cert">…</li>` di `index.html`, ubah judul, penerbit,
  tanggal, dan nama file gambarnya. Nomor `style="--i:…"` hanya untuk urutan animasi.
- **Menambah keahlian**: salin satu `<li class="el">…</li>` di golongan yang sesuai.
- **Menambah foto pengalaman**: salin satu `<button class="shot">…</button>`; atribut `data-gallery`
  yang sama membuat foto-foto itu satu galeri di lightbox.

Tips foto: simpan dalam format `.webp` atau `.jpg` dengan lebar maksimal sekitar 1280 px agar situs
tetap ringan (bisa memakai https://squoosh.app).

## Langkah 4: Cek tampilan di HP

- Di Chrome tekan `F12`, klik ikon HP/tablet (*Toggle device toolbar*), lalu pilih misalnya iPhone 13 atau Galaxy S.
- Untuk mencoba di HP sungguhan: sambungkan HP dan laptop ke Wi-Fi yang sama, lalu buka alamat
  Live Server memakai IP laptop, misalnya `http://192.168.1.5:5500`.
- Coba juga mode "kurangi gerakan" (Windows 11: *Settings → Accessibility → Visual effects →
  Animation effects* dimatikan) untuk memastikan halaman tetap rapi.

## Langkah 5: Upload ke GitHub

**Cara termudah (lewat browser):**

1. Login GitHub, klik **New repository**.
2. Beri nama, misalnya `portofolio`, pilih **Public**, lalu **Create repository**.
3. Klik tautan **uploading an existing file**, lalu seret **isi** folder (`index.html`, `css`, `js`,
   `assets`, `README.md`), bukan folder induknya. Klik **Commit changes**.

Pastikan `index.html` langsung terlihat di halaman utama repository (tidak berada di dalam subfolder).

**Cara dengan Git (terminal):**

```
git init
git add .
git commit -m "Portofolio pertama"
git branch -M main
git remote add origin https://github.com/USERNAME/portofolio.git
git push -u origin main
```

## Langkah 6: Deploy (online, gratis)

Pilih salah satu.

**A. GitHub Pages** (disarankan)

1. Di repository, buka **Settings → Pages**.
2. Pada *Build and deployment*, Source: **Deploy from a branch**; Branch: **main**, folder **/ (root)**, lalu **Save**.
3. Tunggu 1–2 menit lalu muat ulang halaman Settings. Alamat situs muncul di sana:
   `https://USERNAME.github.io/portofolio/`

**B. Netlify Drop** (paling cepat, tanpa GitHub)

1. Buka https://app.netlify.com/drop
2. Seret folder `portofolio-vrisca` ke halaman itu; situs langsung online.
3. Buat akun agar situs tidak hilang, lalu ganti namanya di *Site configuration → Change site name*.

**C. Vercel**

1. Login di https://vercel.com memakai akun GitHub.
2. **Add New → Project**, pilih repository `portofolio`, Framework Preset **Other**, lalu **Deploy**.

## Langkah 7: Setelah online

1. Di `index.html`, ganti `og:image` menjadi alamat lengkap, contoh
   `https://USERNAME.github.io/portofolio/assets/img/og-image.jpg`, lalu upload ulang.
   Ini membuat pratinjau rapi saat link dibagikan di WhatsApp atau LinkedIn.
2. Pasang link website di profil LinkedIn, bio Instagram, dan CV.
3. Opsional: pakai domain sendiri (misalnya `.my.id`), lalu hubungkan lewat *Settings → Pages → Custom domain*.
4. Setiap ada perubahan: edit file, upload/commit ulang, situs ter-update otomatis dalam 1–2 menit.

---

## Catatan isi (mohon dicek sebelum dipublikasikan)

- **Chemistry Goes To School**: kalimat tugas pertama terpotong di PDF asli
  ("…sesuai dengan perencanaan dan jadwal yang telah ditetapkan."). Di website dilengkapi menjadi
  "Memastikan kegiatan berjalan sesuai dengan perencanaan dan jadwal yang telah ditetapkan." Sesuaikan bila perlu.
- **Proyek skripsi**: kalimat "…serta kemudahan pemisahan melalui." terpotong di PDF; kata "melalui" dihapus.
- **Organisasi**: frasa "pelatihan ISO 2019" ditulis apa adanya; periksa apakah nomor standarnya sudah benar.
- Ejaan dirapikan: *Assistent → Assistant*, *Fungtional → Functional*, *Tansile → Tensile*, *Distilation → Distillation*.
- **Sertifikat kursus komputer** (LKP Wishes Computer): baris tempat/tanggal lahir dan nama orang tua
  sengaja diburamkan, karena website bisa dibaca siapa saja.
- Nomor WhatsApp dan email tampil publik dan bisa diambil bot spam. Jika keberatan, hapus kartu WhatsApp
  di bagian Kontak.

## Masalah yang sering muncul

| Masalah | Solusi |
|---|---|
| Gambar tidak muncul setelah deploy | Nama file beda huruf besar/kecil. GitHub Pages membedakan `Foto.webp` dan `foto.webp`. |
| Perubahan belum terlihat | Tekan `Ctrl+Shift+R` (muat ulang paksa) atau tunggu 1–2 menit. |
| Preloader terasa terlalu lama/cepat | Ubah angka `MIN` di `js/main.js` bagian 3 (misalnya 1000 = lebih cepat). |
| Menu tabel periodik tidak terlihat di laptop | Memang khusus layar < 1024px. Perkecil jendela browser atau pakai mode HP di DevTools (`F12` → ikon HP). |
| Warna efek rumus di foto hanya gradasi sederhana | Terjadi bila `index.html` dibuka dengan klik dua kali (browser melarang membaca piksel foto). Jalankan dengan Live Server atau setelah online, warnanya mengikuti foto. |
| Animasi tidak jalan | Tekan `Ctrl+Shift+R` (muat ulang paksa) agar CSS/JS terbaru terpakai, lalu cek console (`F12`) untuk error merah. |
| Tidak ada suara | Klik **Masuk ke portofolio** (bukan "tanpa suara"), cek volume laptop/HP, dan pastikan tab browser tidak di-*mute* (klik kanan tab). Pastikan `assets/audio/aurora.mp3` ikut ter-upload. |
| Suara sapaan berbeda di tiap perangkat | Sapaan memakai suara bawaan browser (Edge: Aria, Chrome: Google US English, iPhone: Samantha), jadi warna suaranya bisa beda. Agar sama di semua perangkat, pakai rekaman sendiri (`SUARA.REKAMAN`). |
| Benang di hero tidak muncul | Browser sangat lama tanpa WebGL2; halaman tetap normal tanpa benang. Pastikan juga `js/web-threads.js` ikut ter-upload. |
| Laptop terasa berat di bagian hero | Di `BENANG` (js/main.js bagian 5b) kecilkan `dpr` (misalnya `1`) atau `threadCount` (misalnya `5`). |

## Lisensi font & kredit

Inter oleh The Inter Project Authors, SIL Open Font License 1.1 (lihat `assets/fonts/LICENSE-Inter.txt`).

Animasi benang **WebThreads** dari [React Bits](https://reactbits.dev) karya David Haz (MIT + Commons Clause,
teks lisensinya ada di awal `js/web-threads.js`). Backsound **aurora** dari React Bits Sound Lab.
