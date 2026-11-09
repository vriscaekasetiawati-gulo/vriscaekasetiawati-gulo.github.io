# Portofolio Vrisca Eka Setiawati Gulo, S.Si

Website portofolio penuh animasi, dibuat dengan **HTML + CSS + JavaScript murni** (tanpa library, tanpa framework).
Isi dan foto diambil dari dokumen PDF portofolio.

Konsepnya "buku catatan laboratorium": kertas milimeter, warna navy dan kuning stabilo dari PDF, serta cerita
**titrasi**: halaman bergerak menuju "titik akhir" berwarna merah muda di bagian Kontak.

---

## Isi folder

```
portofolio-vrisca/
├── index.html          ← semua teks & struktur halaman (edit konten di sini)
├── css/style.css       ← tampilan: warna, ukuran, tata letak, animasi CSS
├── js/main.js          ← animasi & interaksi (preloader, gulir, galeri, dll.)
├── assets/
│   ├── img/            ← foto (WebP), logo, favicon, gambar pratinjau (og-image)
│   └── fonts/          ← font Inter yang disimpan sendiri + lisensinya
└── README.md           ← panduan ini
```

## Animasi yang ada

| Bagian | Animasi |
|---|---|
| Pembuka | Preloader: tinta dituang ke labu Erlenmeyer sampai berubah merah muda (titik akhir), lalu merah muda membanjiri layar dan surut ke bawah membuka halaman. Muncul **setiap kali** halaman dibuka/dimuat ulang (±3 detik) |
| Hero | Setelah merah muda surut: huruf PORTOFOLIO jatuh satu per satu, foto berjalan masuk dari kanan, nama & teks menyusul; efek kedalaman (parallax) saat digulir |
| Foto profil (Hero & Tentang) | Arahkan kursor ke foto: hanya "lensa" bulat di sekitar kursor yang berubah menjadi rumus senyawa kimia (C₂₀H₁₄O₄, NiFe₂O₄, –SO₃H, …) berwarna navy → magenta, dan lensa mengikuti kursor. Di HP/tablet: ketuk foto |
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
| Lama jeda preloader | `js/main.js` | `PRELOADER` di bagian 3: `MIN` (lama tinta dituang), `HOLD`, `FLOOD` (milidetik) |
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

## Lisensi font

Inter oleh The Inter Project Authors, SIL Open Font License 1.1 (lihat `assets/fonts/LICENSE-Inter.txt`).
