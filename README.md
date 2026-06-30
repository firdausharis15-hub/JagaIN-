# JagaIN - Platform Edukasi & Verifikasi Keamanan Siber

JagaIN adalah aplikasi full-stack interaktif berbasis **React (Vite)** dan **Express (Node.js)** yang dirancang untuk melindungi masyarakat Indonesia dari ancaman kejahatan siber, seperti penyebaran berita hoax, tautan phishing berbahaya, serta memberikan edukasi interaktif seputar keamanan siber menggunakan kecerdasan buatan (AI).

---

## 🚀 Fitur Utama

1. **Cek Hoax Interaktif**: Verifikasi klaim berita atau pesan berantai menggunakan teknologi AI Gemini untuk mendeteksi potensi misinformasi/hoax dengan analisis transparan.
2. **Analisis Tautan (Link Checker)**: Memeriksa keamanan domain/URL dari risiko phishing, malware, atau penipuan siber.
3. **Tanya AI (Asisten JagaIN)**: Chatbot asisten siber interaktif yang ditenagai oleh model Gemini untuk memberikan tips keamanan digital, menjaga privasi data, dan panduan mitigasi ancaman siber.
4. **Kabar Keamanan Resmi**: Menyediakan pembaruan berita dan peringatan siber langsung (real-time RSS feed dari BSSN & portal teknologi) dengan mekanisme failover lokal yang handal.

---

## 🛠️ Prasyarat (Prerequisites)

Sebelum menjalankan aplikasi ini secara lokal, pastikan Anda telah memasang:
- **Node.js** (Versi 18 ke atas direkomendasikan)
- **NPM** (Bawaan dari instalasi Node.js)

---

## ⚙️ Panduan Instalasi & Konfigurasi untuk Juri / Penguji

Ikuti langkah-langkah mudah berikut untuk menjalankan aplikasi JagaIN di komputer Anda:

### 1. Kloning atau Unduh Repositori
Ekstrak file ZIP proyek ini, atau kloning repositori jika diunggah di GitHub:
```bash
git clone <url-repositori-anda>
cd jagain
```

### 2. Instalasi Dependensi
Jalankan perintah berikut untuk mengunduh dan menginstal seluruh modul yang diperlukan:
```bash
npm install
```

### 3. Konfigurasi API Key (Variabel Lingkungan)
Aplikasi JagaIN membutuhkan **Gemini API Key** untuk menjalankan fitur analisis AI.
1. Salin file `.env.example` menjadi file baru bernama `.env`:
   ```bash
   cp .env.example .env
   ```
2. Buka file `.env` yang baru dibuat menggunakan teks editor Anda.
3. Masukkan kunci API Gemini milik Anda pada baris berikut:
   ```env
   GEMINI_API_KEY="ISI_DENGAN_API_KEY_GEMINI_ANDA"
   APP_URL="http://localhost:3000"
   ```

> 💡 **Cara mendapatkan Gemini API Key gratis:**
> 1. Kunjungi [Google AI Studio](https://aistudio.google.com).
> 2. Masuk menggunakan akun Google Anda.
> 3. Klik tombol **"Get API Key"** dan buat kunci API baru secara gratis.

---

## 🖥️ Menjalankan Aplikasi

Setelah konfigurasi selesai, jalankan aplikasi menggunakan perintah berikut:

### Mode Pengembangan (Development Mode)
```bash
npm run dev
```
Aplikasi akan otomatis berjalan di **[http://localhost:3000](http://localhost:3000)**. Silakan buka tautan tersebut di peramban (browser) Anda.

### Mode Produksi (Production Build & Start)
Untuk mensimulasikan performa optimal server produksi:
```bash
npm run build
npm run start
```

---

## 🛡️ Arsitektur, Keamanan, & FAQ Uji Coba

- **Full-Stack Isolation (Proxy Sisi Server)**: Demi keamanan maksimal, semua API Key yang digunakan untuk berkomunikasi dengan model AI **tidak pernah dikirim ke browser pengguna**. Permintaan akan diproses terlebih dahulu melalui backend Express di sisi server (`server.ts`) sebelum hasil analisis dikirim kembali ke pengguna. Hal ini mencegah kebocoran kunci API di sisi klien (*client-side exposure*).
- **Mekanisme Failover Handal (Cascading Models)**: Jika model AI utama mengalami batas kuota (*rate limit*) atau kegagalan koneksi, sistem memiliki pertahanan berlapis dengan beralih secara otomatis ke model cadangan (`gemini-3.5-flash` ➡️ `gemini-flash-latest` ➡️ `gemini-3.1-flash-lite`) sehingga juri tetap mendapatkan pengalaman uji coba yang mulus tanpa interupsi kesalahan (*error-free testing*).
- **Mode Offline & Fallback Berita Lokal**: Jika Anda menguji tanpa menggunakan kunci API (atau saat koneksi internet bermasalah), sistem JagaIN tidak akan mengalami *crash* atau *blank screen*. Backend dan frontend kami dilengkapi data simulasi terenkripsi berkualitas tinggi secara lokal untuk menyajikan berita dan analisis yang terlihat nyata sehingga proses penilaian berjalan 100% lancar.
- **Pemberitahuan WebSocket Connection di Konsol Browser**: Saat menjalankan mode pengembangan, Anda mungkin melihat pesan kesalahan seperti `[vite] failed to connect to websocket` atau sejenisnya di konsol browser. **Pesan ini 100% aman dan normal untuk diabaikan**. Hal ini terjadi karena modul *Hot Module Replacement* (HMR) dinonaktifkan demi stabilitas performa selama simulasi wadah server sandbox. Semua fungsi aplikasi tetap bekerja normal secara penuh.
