# Product Requirements Document (PRD): MaBar (v2.0)

## 1. Overview

- **Product Name:** MaBar
- **Description:** MaBar adalah sebuah Progressive Web Application (PWA) yang berfungsi sebagai platform matchmaking cerdas untuk para pemain Padel. Aplikasi ini menghubungkan pemain dengan pemain lain dan dengan penyedia lapangan Padel melalui antarmuka percakapan berbasis AI (menggunakan Gemini) serta fitur sosial yang kaya. Tujuannya adalah untuk menciptakan ekosistem Padel yang terintegrasi, efisien, dan terpercaya.
- **Goal:** Menjadi platform komunitas utama bagi para pemain Padel di Jakarta untuk mencari teman bermain, menjadwalkan pertandingan, memesan lapangan, dan membangun reputasi permainan mereka.

---

## 2. The Problem vs. The Solution

### Customer Problems

1.  **Kesulitan Menemukan Lapangan & Lawan:** Pemain kesulitan menemukan lapangan Padel yang tersedia dan teman bermain yang sepadan secara bersamaan.
2.  **Koordinasi Manual yang Rumit:** Ketergantungan pada grup WhatsApp/Telegram tidak efisien, tidak terstruktur, dan sulit untuk dilacak.
3.  **Ketidakpastian Kualitas:** Tidak ada cara terukur untuk mengetahui tingkat keahlian (skill level) seorang pemain sebelum bermain atau kualitas sebuah lapangan sebelum memesan.
4.  **Kurangnya Komitmen:** Risiko pemain yang tidak datang (**no-show**) atau membatalkan di saat-saat terakhir merusak pengalaman bermain.
5.  **Fragmentasi Komunitas:** Sulit untuk tetap terhubung dengan teman bermain baru atau melacak histori permainan secara terpusat.

### Proposed Solution

1.  **AI-Powered Matchmaking Cerdas:** Mengintegrasikan Chat AI berbasis Gemini yang memahami kriteria kompleks (skill, usia, lokasi, jam, gender, frekuensi, histori, harga) untuk memberikan rekomendasi pemain dan lapangan yang paling relevan.
2.  **Sistem Booking End-to-End:** Menyediakan alur booking yang mulus, dari pencarian hingga validasi check-in di lokasi menggunakan **QR code yang di-scan oleh pemain**.
3.  **Sistem Reputasi Dinamis:** Membangun kepercayaan melalui sistem rating dinamis untuk pemain (berdasarkan ulasan rekan dan jam terbang) dan sistem review untuk venue (berdasarkan kebersihan, kenyamanan, dll).
4.  **Kebijakan Komunitas yang Jelas:** Menerapkan sistem "badge" untuk menandai perilaku pengguna (misalnya, badge **no-show** atau badge **sering cancel**), yang berdampak pada reputasi dan kemudahan booking di masa depan.
5.  **Platform Sosial Terintegrasi:** Memfasilitasi interaksi sosial melalui fitur sinkronisasi kontak, *follower*, *leaderboard*, serta chat personal dan grup (khusus untuk yang pernah bermain bersama), untuk memperkuat ikatan komunitas.
6.  **Tanpa Transaksi Finansial:** Aplikasi fokus pada matchmaking dan reservasi. Pembayaran sewa lapangan dilakukan secara langsung di luar aplikasi.

---

## 3. MVP (Minimum Viable Product) Scope

Untuk peluncuran awal, MaBar akan fokus pada fungsionalitas inti yang paling penting untuk memberikan nilai kepada pengguna. Fitur yang **wajib** ada dalam MVP adalah:
1.  **AI-Powered Matchmaking & Booking:** Kemampuan pengguna untuk berinteraksi dengan Chat AI untuk menemukan pemain dan lapangan serta menyelesaikan proses booking.
2.  **End-to-End Booking Flow:** Seluruh alur mulai dari pencarian sesi, konfirmasi booking, hingga proses check-in di lapangan menggunakan scan QR code oleh pemain.

---

## 4. Actors (User Roles)

- **Player:** Pengguna utama yang mencari lapangan dan teman bermain, mengelola profil dan reputasi, serta berinteraksi secara sosial dengan pemain lain.
- **Venue Owner:** Pemilik atau pengelola lapangan yang mendaftarkan venuenya, mengelola jadwal, dan menyediakan QR code untuk validasi booking.
- **Operations Team:** Tim internal MaBar yang memonitor aktivitas platform, mengelola data, dan menganalisis tren melalui dashboard BI.

---

## 5. EPIC & User Stories

### EPIC 1: User Onboarding & Profile Management

- **Description:** Proses pendaftaran, otentikasi, dan pengelolaan profil untuk semua actor.
- **User Stories:**
    - **1.1:** Sebagai `Player` baru, saya ingin bisa mendaftar/login via **SSO (Google, Facebook, Apple)**.
    - **1.2:** Sebagai `Player` baru, saat onboarding, saya ingin bisa melakukan **penilaian mandiri (self-assessment)** untuk `skill level` awal saya.
    - **1.3:** Sebagai `Player`, saya ingin profil saya menampilkan informasi seperti `skill level` dinamis, `badge` reputasi (no-show, cancel), statistik permainan, dan daftar teman yang saya ikuti.
    - **1.4:** Sebagai `Venue Owner`, saya ingin bisa mendaftarkan venue saya dengan detail lokasi, jam operasional, harga, dan foto.

### EPIC 2: AI-Powered Matchmaking & Booking

- **Description:** Fitur inti berupa asisten AI untuk memfasilitasi pencarian lapangan dan pemain.
- **User Stories:**
    - **2.1:** Sebagai `Player`, saya ingin bisa berinteraksi dengan **Chat AI (Gemini)** untuk mencari sesi permainan menggunakan bahasa natural.
    - **2.2:** Sebagai `Player`, saya ingin AI dapat memproses kriteria pencarian yang spesifik, termasuk: **skill level, usia, lokasi, jam, gender, frekuensi bermain, histori, dan budget harga lapangan**.
    - **2.3:** Sebagai `Player`, saya ingin AI memberikan beberapa rekomendasi sesi permainan yang paling cocok untuk saya pilih dan konfirmasi.

### EPIC 3: Manual Booking & Session Management

- **Description:** Menyediakan kontrol penuh bagi pengguna untuk membuat atau bergabung dalam sesi permainan secara manual.
- **User Stories:**
    - **3.1:** Sebagai `Player` (pembuat sesi), saya ingin bisa mengatur aturan sesi permainan saya: **Open to Public**, **Private (Approval Required)**, atau **Invite-Only (via link/kode)**.
    - **3.2:** Sebagai `Player`, saya ingin bisa mencari sesi permainan publik yang dibuat oleh pemain lain dan langsung bergabung.
    - **3.3:** Sebagai `Player`, saya ingin bisa meminta untuk bergabung ke sesi private dan menunggu persetujuan dari pembuat sesi.

### EPIC 4: Booking Management & Validation

- **Description:** Mengelola siklus hidup sebuah booking, dari konfirmasi, validasi, hingga pembatalan.
- **User Stories:**
    - **4.1:** Sebagai `Venue Owner`, saya ingin sistem menghasilkan **QR code unik** untuk setiap jadwal booking yang terkonfirmasi.
    - **4.2:** Sebagai `Player`, sesampainya di lokasi, saya ingin bisa **men-scan QR code** yang ditampilkan oleh `Venue Owner` untuk melakukan check-in.
    - **4.3:** Sebagai `Player`, setelah berhasil check-in, saya ingin status saya di aplikasi otomatis berubah dan **notifikasi terkirim** ke pemain lain dalam sesi tersebut bahwa saya telah tiba.
    - **4.4:** Sebagai `Player`, saya ingin bisa membatalkan booking maksimal **1 jam** sebelum jadwal bermain.

### EPIC 5: Dynamic Reputation & Policies

- **Description:** Mengimplementasikan sistem untuk membangun reputasi dan menegakkan aturan komunitas secara adil.
- **User Stories:**
    - **5.1:** Sebagai `Player`, setelah bermain, saya ingin bisa memberikan **rating kepada pemain lain** dalam sesi tersebut.
    - **5.2:** Sebagai `Operations Team`, saya ingin sistem secara otomatis mengkalkulasi ulang `skill level` pemain berdasarkan **akumulasi jam terbang (dari check-in) dan rata-rata rating** yang diterima dari pemain lain.
    - **5.3:** Sebagai `Player`, saya ingin bisa melaporkan pemain yang **no-show**. Pemain yang terverifikasi no-show akan mendapatkan **badge "No-Show"** di profilnya, ratingnya akan turun, dan AI akan menurunkan prioritasnya dalam pencarian di masa depan.
    - **5.4:** Sebagai `Player`, jika saya sering membatalkan booking (walaupun dalam batas waktu), saya akan menerima **badge reputasi pembatalan** (misal: "Sering Membatalkan") di profil saya.
    - **5.5:** Sebagai `Player` yang sudah bermain di sebuah venue, saya ingin bisa memberikan **review dan rating** untuk venue tersebut berdasarkan kebersihan, kenyamanan, dan value for money.

### EPIC 6: Social & Community Features

- **Description:** Fitur-fitur yang dirancang untuk memperkuat interaksi dan ikatan antar pemain.
- **User Stories:**
    - **6.1:** Sebagai `Player`, saya ingin bisa **menyinkronkan kontak** dari ponsel saya untuk menemukan teman yang sudah menggunakan MaBar.
    - **6.2:** Sebagai `Player`, saya ingin bisa **mengikuti (follow)** profil pemain lain untuk melihat aktivitas permainan mereka.
    - **6.3:** Sebagai `Player`, saya ingin bisa memulai **chat personal** dengan pemain lain.
    - **6.4:** Sebagai `Player`, saya ingin memiliki opsi untuk membuat **grup chat** dengan pemain lain, **hanya jika** kami pernah bermain bersama dalam satu sesi sebelumnya.
    - **6.5:** Sebagai `Player`, saya ingin melihat **leaderboard** yang menampilkan peringkat pemain berdasarkan `skill level` dan lokasi untuk memotivasi saya.

### EPIC 7: Venue Management & BI Dashboard

- **Description:** Portal untuk Venue Owner dan Operations Team untuk mengelola dan menganalisis data.
- **User Stories:**
    - **7.1:** Sebagai `Venue Owner`, saya ingin dashboard saya menampilkan semua **review dan rating** yang diberikan oleh pemain.
    - **7.2:** Sebagai `Venue Owner`, saya ingin bisa melihat statistik dasar seperti tingkat okupansi lapangan dan jam-jam paling populer.
    - **7.3:** Sebagai `Operations Team`, saya ingin memiliki akses ke dashboard BI global untuk memonitor metrik kunci platform (jumlah pengguna aktif, booking harian, dll).

---

## 6. Tech Stack & Non-Functional Requirements

### Tech Stack

- **Application Type:** Progressive Web App (PWA)
- **Frontend:** React.js, CSS3, HTML5
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **AI/LLM:** Google Gemini API
- **Authentication:** OAuth 2.0 (Google, Facebook, Apple SSO)
- **Deployment:** Platform yang mendukung stack Node.js.

### Non-Functional Requirements

- **Compatibility:** Aplikasi harus fully responsive dan berfungsi optimal di berbagai ukuran layar perangkat mobile (candy bar, foldable, tablet) pada platform **Apple (iOS)** dan **Android**.
- **Performance:** Waktu muat cepat, dan respons Chat AI harus terasa instan.
- **Scalability:** Arsitektur dirancang untuk dapat menangani pertumbuhan jumlah pengguna, venue, dan interaksi sosial.
- **Usability:** Antarmuka intuitif dan mudah dinavigasi untuk semua kalangan pengguna.
- **Security:** Perlindungan data pengguna dan proses otentikasi yang aman.