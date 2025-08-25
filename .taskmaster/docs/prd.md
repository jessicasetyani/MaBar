# Product Requirements Document (PRD): MaBar (v3.0)

## 1. Overview

- **Product Name:** MaBar
- **Description:** MaBar adalah sebuah Progressive Web Application (PWA) yang berfungsi sebagai platform matchmaking cerdas untuk para pemain Padel. Aplikasi ini menghubungkan pemain dengan pemain lain dan dengan penyedia lapangan Padel melalui antarmuka percakapan berbasis AI (menggunakan Gemini) serta fitur sosial yang kaya. Platform ini dirancang untuk memberikan rekomendasi yang sangat personal berdasarkan preferensi detail pengguna.
- **Goal:** Menjadi platform komunitas utama bagi para pemain Padel di Jakarta untuk mencari teman bermain, menjadwalkan pertandingan, memesan lapangan, dan membangun reputasi permainan mereka.
- **Last Updated:** August 25, 2025

---

## 2. The Problem vs. The Solution

### Customer Problems

1.  **Kesulitan Menemukan Lapangan & Lawan:** Pemain kesulitan menemukan lapangan Padel yang tersedia dan teman bermain yang sepadan secara bersamaan.
2.  **Koordinasi Manual yang Rumit:** Ketergantungan pada grup WhatsApp/Telegram tidak efisien, tidak terstruktur, dan sulit untuk dilacak.
3.  **Ketidakpastian Kualitas:** Tidak ada cara terukur untuk mengetahui tingkat keahlian (skill level) seorang pemain sebelum bermain atau kualitas sebuah lapangan sebelum memesan.
4.  **Kurangnya Komitmen:** Risiko pemain yang tidak datang (**no-show**) atau membatalkan di saat-saat terakhir merusak pengalaman bermain.
5.  **Fragmentasi Komunitas:** Sulit untuk tetap terhubung dengan teman bermain baru atau melacak histori permainan secara terpusat.

### Proposed Solution

1.  **AI-Powered Matchmaking Cerdas:** Mengintegrasikan Chat AI berbasis Gemini yang memahami kriteria kompleks (skill, usia, ketersediaan rutin, budget, dll) untuk memberikan rekomendasi pemain dan lapangan yang paling relevan.
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

- **Player:** Pengguna utama yang mencari lapangan dan teman bermain. Mereka dapat melengkapi profil dengan preferensi mendalam untuk mendapatkan rekomendasi matchmaking yang akurat dan berinteraksi secara sosial.
- **Venue Owner:** Pemilik atau pengelola lapangan yang mendaftarkan venuenya. Mereka memiliki alur onboarding yang fleksibel yang memungkinkan penyimpanan progres dan penyelesaian data di lain waktu.
- **Operations Team:** Tim internal MaBar yang memonitor aktivitas platform, memverifikasi venue, dan menganalisis tren melalui dashboard BI.

---

## 5. EPIC & User Stories

### EPIC 1: User Onboarding & Advanced Profile Management

- **Description:** Proses pendaftaran, otentikasi, dan pengelolaan profil yang detail untuk semua actor, termasuk alur yang fleksibel dan personalisasi mendalam.
- **User Stories:**
    - **1.1:** Sebagai `Player` baru, saya ingin bisa mendaftar/login via **SSO (Google, Facebook, Apple)**.
    - **1.2:** Sebagai `Player` baru, saat onboarding, saya ingin bisa melakukan **penilaian mandiri (self-assessment)** untuk `skill level` awal saya.
    - **1.3:** Sebagai `Venue Owner`, jika saya keluar saat proses onboarding, saya ingin sistem **menyimpan progres** saya sehingga saya bisa melanjutkannya nanti.
    - **1.4:** Sebagai `Venue Owner` yang belum melengkapi profil, saat login kembali, saya ingin melihat **notifikasi atau kartu di dashboard** yang mengajak saya untuk menyelesaikan pendaftaran venue.
    - **1.5:** Sebagai `Player`, saya ingin memiliki halaman **"Profil Saya"** sebagai pusat untuk mengedit semua informasi dan preferensi saya.
    - **1.6:** Sebagai `Player`, di profil saya, saya ingin bisa mengatur **ketersediaan rutin (Weekly Availability)** saya (misal: Senin malam, Sabtu pagi) agar AI bisa proaktif mencarikan jadwal.
    - **1.7:** Sebagai `Player`, di profil saya, saya ingin bisa mengatur **preferensi matchmaking detail**: Gaya Bermain (Fun/Kompetitif), Preferensi Lawan (Gender/Usia), Budget per Sesi, dan Jarak Tempuh Maksimal.
    - **1.8:** Sebagai `Player`, saya ingin melihat **"Profile Strength Meter"** di halaman profil saya yang memotivasi saya untuk melengkapi semua preferensi demi matchmaking yang lebih baik.

### EPIC 2: AI-Powered Matchmaking & Booking
- **Description:** Fitur inti berupa asisten AI yang menggunakan data profil pengguna yang kaya untuk memfasilitasi pencarian lapangan dan pemain.
- **User Stories:**
    - **2.1:** Sebagai `Player`, saya ingin bisa berinteraksi dengan **Chat AI (Gemini)** untuk mencari sesi permainan menggunakan bahasa natural.
    - **2.2:** Sebagai `Player`, saya ingin AI dapat memproses permintaan pencarian yang spesifik, dan juga **menggunakan data preferensi dari profil saya** (seperti ketersediaan rutin, budget, dan gaya bermain) untuk memberikan rekomendasi yang paling akurat.
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

## 6. Detailed User Flows

### 6.1. Player Onboarding Flow
1.  **Welcome & Sign-Up**: Layar sambutan dengan logo MaBar. Pengguna baru memilih metode **SSO (Google, Facebook, Apple)**.
2.  **Role Selection**: Pengguna memilih peran "**I'm a Player**".
3.  **Profile Basics**: Formulir diisi otomatis dengan nama & foto dari akun SSO. Pengguna diminta memilih **lokasi bermain utama**.
4.  **Skill Self-Assessment**: Pengguna memilih satu dari tiga level keahlian (Beginner, Intermediate, Advanced) dengan deskripsi yang jelas.
5.  **Permissions**: Aplikasi meminta izin untuk notifikasi dan (opsional) sinkronisasi kontak.
6.  **Onboarding Complete**: Layar sambutan dengan tombol CTA yang mengarahkan ke dashboard utama atau AI Chat.

### 6.2. Venue Owner Onboarding Flow (Flexible)
1.  **Welcome & Sign-Up**: Sama seperti alur Player, menggunakan SSO.
2.  **Role Selection**: Pengguna memilih peran "**I'm a Venue Owner**".
3.  **Venue Core Details (Minimal)**: Pengguna mengisi informasi minimal untuk membuat draft profil: Nama Venue, Lokasi via pin peta, dan Info Kontak. Progres akan **tersimpan otomatis** jika pengguna keluar.
4.  **Return & Complete**: Saat login kembali, dashboard akan menampilkan notifikasi untuk **melanjutkan dan melengkapi profil** (jam operasional, jumlah lapangan, unggah foto, harga).
5.  **Submission & Review**: Setelah semua data lengkap, profil akan dikirim ke `Operations Team` untuk direview sebelum tayang.
6.  **Onboarding Complete**: Layar konfirmasi dengan tombol CTA yang mengarahkan ke dashboard venue.

### 6.3. Player Profile Completion Flow (Post-Onboarding)
1.  **Navigation**: Player menavigasi ke tab **"Profil Saya"** dari menu utama aplikasi.
2.  **Motivation**: Player melihat **"Profile Strength Meter"** yang menunjukkan persentase kelengkapan profil.
3.  **Action**: Player masuk ke mode edit dan melengkapi bagian **"Preferensi Matchmaking"**:
    - **Ketersediaan Rutin**: Mengisi jadwal mingguan kapan mereka biasanya bisa bermain.
    - **Preferensi Detail**: Mengatur gaya bermain, preferensi lawan, budget per sesi, dan jarak tempuh maksimal.
4.  **Confirmation**: Setelah disimpan, preferensi ini akan langsung digunakan oleh AI untuk memberikan rekomendasi yang lebih akurat.

---

## 7. Business & Monetization

### 7.1. Monetization Strategy
- Pada fase awal, MaBar tidak akan mengimplementasikan fitur monetisasi. Fokus utama adalah pada pertumbuhan pengguna, adopsi platform oleh venue, dan membangun komunitas yang solid.
- Rencana monetisasi di masa depan dapat dieksplorasi setelah mencapai massa kritis, seperti fitur premium untuk pemain atau model langganan untuk venue.

### 7.2. Currency
- Semua nilai moneter, harga, dan budget yang ditampilkan dan digunakan di dalam aplikasi MaBar adalah dalam **Indonesian Rupiah (IDR)**.

---

## 8. Tech Stack & Non-Functional Requirements

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