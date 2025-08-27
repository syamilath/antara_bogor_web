-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 22 Bulan Mei 2025 pada 04.24
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `antara_bogor`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `articles`
--

CREATE TABLE `articles` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `author_id` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `articles`
--

INSERT INTO `articles` (`id`, `title`, `slug`, `content`, `image_url`, `author_id`, `category_id`, `status`, `created_at`, `updated_at`) VALUES
(2, 'wahuuuuuu', 'wahuuuuuu', 'Autemnatus, et, ullam, amet, sed autem? Sedautem vel nobis, laborum, dolor, eos! Faciliseos, ratione nisi ratione, quasi unde? Liberoiure ut quis hic autem, iure. Autemnatus, et, ullam, amet, sed autem? Sedautem vel nobis, laborum, dolor, eos! Faciliseos, ratione nisi ratione, quasi unde? Liberoiure ut quis hic autem, iure. Autemnatus, et, ullam, amet, sed autem? Sedautem vel nobis, laborum, dolor, eos! Faciliseos, ratione nisi ratione, quasi unde? Liberoiure ut quis hic autem, iure. Autemnatus, et, ullam, amet, sed autem? Sedautem vel nobis, laborum, dolor, eos! Faciliseos, ratione nisi ratione, quasi unde? Liberoiure ut quis hic autem, iure. Autemnatus, et, ullam, amet, sed autem? Sedautem vel nobis, laborum, dolor, eos! Faciliseos, ratione nisi ratione, quasi unde? Liberoiure ut quis hic autem, iure. Autemnatus, et, ullam, amet, sed autem? Sedautem vel nobis, laborum, dolor, eos! Faciliseos, ratione nisi ratione, quasi unde? Liberoiure ut quis hic autem, iure. Autemnatus, et, ullam, amet, sed autem? Sedautem vel nobis, laborum, dolor, eos! Faciliseos, ratione nisi ratione, quasi unde? Liberoiure ut quis hic autem, iure. Autemnatus, et, ullam, amet, sed autem? Sedautem vel nobis, laborum, dolor, eos! Faciliseos, ratione nisi ratione, quasi unde? Liberoiure ut quis hic autem, iure. Autemnatus, et, ullam, amet, sed autem? Sedautem vel nobis, laborum, dolor, eos! Faciliseos, ratione nisi ratione, quasi unde? Liberoiure ut quis hic autem, iure. Autemnatus, et, ullam, amet, sed autem? Sedautem vel nobis, laborum, dolor, eos! Faciliseos, ratione nisi ratione, quasi unde? Liberoiure ut quis hic autem, iure. Autemnatus, et, ullam, amet, sed autem? Sedautem vel nobis, laborum, dolor, eos! Faciliseos, ratione nisi ratione, quasi unde? Liberoiure ut quis hic autem, iure. Autemnatus, et, ullam, amet, sed autem? Sedautem vel nobis, laborum, dolor, eos! Faciliseos, ratione nisi ratione, quasi unde? Liberoiure ut quis hic autem, iure. Autemnatus, et, ullam, amet, sed autem? Sedautem vel nobis, laborum, dolor, eos! Faciliseos, ratione nisi ratione, quasi unde? Liberoiure ut quis hic autem, iure. Autemnatus, et, ullam, amet, sed autem? Sedautem vel nobis, laborum, dolor, eos! Faciliseos, ratione nisi ratione, quasi unde? Liberoiure ut quis hic autem, iure. Autemnatus, et, ullam, amet, sed autem? Sedautem vel nobis, laborum, dolor, eos! Faciliseos, ratione nisi ratione, quasi unde? Liberoiure ut quis hic autem, iure. Autemnatus, et, ullam, amet, sed autem? Sedautem vel nobis, laborum, dolor, eos! Faciliseos, ratione nisi ratione, quasi unde? Liberoiure ut quis hic autem, iure. Autemnatus, et, ullam, amet, sed autem? Sedautem vel nobis, laborum, dolor, eos! Faciliseos, ratione nisi ratione, quasi unde? Liberoiure ut quis hic autem, iure. Autemnatus, et, ullam, amet, sed autem? Sedautem vel nobis, laborum, dolor, eos! Faciliseos, ratione nisi ratione, quasi unde? Liberoiure ut quis hic autem, iure. Autemnatus, et, ullam, amet, sed autem? Sedautem vel nobis, laborum, dolor, eos! Faciliseos, ratione nisi ratione, quasi unde? Liberoiure ut quis hic autem, iure. ', '/uploads/2025/5/wahuuuuuu-1746242444529-502074943.jpeg', 1, 5, 'published', '2025-05-03 03:20:44', '2025-05-03 03:20:44'),
(4, 'XI SIJA 2 MERAYAKAN HARI GURU DI SMKN 1 CIBINONG', 'xi-sija-2-merayakan-hari-guru-di-smkn-1-cibinong', '🎤 Narasi Hari Guru 11 SIJA 2 🎤\r\n\r\n(musik latar instrumental lembut, seperti piano atau orkestra)\r\n\r\n“Hari ini, sebuah momen istimewa tercipta. Di dalam ruangan yang megah, penuh warna, penuh cahaya, kami — keluarga besar kelas 11 SIJA 2 — berdiri bersama, menyatukan hati, menyusun karya, untuk satu tujuan: mempersembahkan penghormatan yang tak ternilai kepada sosok-sosok luar biasa… guru-guru kami.”\r\n\r\n(suara jeda sejenak, lalu lanjut)\r\n\r\n“Dengan dekorasi yang elegan, gemerlap cahaya lampu, dan rangkaian bunga yang indah, kami hadir bukan hanya untuk merayakan… tetapi untuk mengucapkan terima kasih. Terima kasih atas ilmu, atas bimbingan, atas kesabaran, dan atas ketulusan yang tak pernah lelah mengalir kepada kami, murid-muridmu.”\r\n\r\n(musik menguat sedikit)\r\n\r\n“Hari ini, kami persembahkan perayaan mewah ini bukan untuk sekadar pesta… tetapi sebagai wujud rasa hormat kami. Kami ingin para guru tahu, betapa berharganya kehadiranmu dalam setiap langkah kami menuju masa depan. Betapa berharganya setiap peluh, setiap kata, setiap doa yang engkau titipkan.”\r\n\r\n(suara lebih emosional)\r\n\r\n“Di balik tirai kemewahan ini, terselip doa-doa tulus kami… Semoga engkau, guru kami, selalu sehat, selalu bahagia, selalu dalam lindungan-Nya. Dan semoga apa yang kami perbuat hari ini, meski tak sebanding dengan jasamu, dapat menjadi pengingat… bahwa kami selalu mencintai, menghormati, dan membanggakanmu.”\r\n\r\n(musik melambat, lebih syahdu)\r\n\r\n“Selamat Hari Guru. Terima kasih atas segalanya. Dari kami, 11 SIJA 2, untuk guru-guru tercinta.”', '/uploads/2025/5/xi-sija-2-merayakan-hari-guru-di-smkn-1-cibinong-1746771345669-308888419.JPG', 4, 6, 'published', '2025-05-09 06:15:45', '2025-05-09 06:15:45'),
(5, 'KONSISTEN MEMBANGUN KADERISASI: PC GP ANSOR KOTA BOGOR DI BAWAH KEPEMIMPINAN H. AHMAD IRFAN', 'konsisten-membangun-kaderisasi-pc-gp-ansor-kota-bogor-di-bawah-kepemimpinan-h-ahmad-irfan', 'KONSISTEN MEMBANGUN KADERISASI: PC GP ANSOR KOTA BOGOR DI BAWAH KEPEMIMPINAN H. AHMAD IRFAN\r\n\r\nPimpinan Cabang Gerakan Pemuda Ansor (PC GP Ansor) Kota Bogor di bawah komando H. Ahmad Irfan terus menunjukkan komitmennya dalam memajukan organisasi melalui proses kaderisasi yang berkelanjutan dan berintegritas. Prinsip kepemimpinan yang dipegang teguh oleh H. Ahmad Irfan adalah menjaga marwah organisasi dengan tetap berpegang pada Peraturan Organisasi (PO) yang ada, tanpa kompromi dan tanpa menabrak aturan yang telah ditetapkan.\r\n\r\nBukti nyata dari komitmen tersebut terlihat pada langkah strategis yang diambil oleh H. Ahmad Irfan dengan memberangkatkan enam kader terbaik PC GP Ansor Kota Bogor untuk mengikuti Pelatihan Kepemimpinan Lanjutan (PKL) yang diselenggarakan oleh PC GP Ansor Kabupaten Bandung. Kegiatan tersebut berlangsung pada 1 Mei hingga 4 Mei di Awana Resort Rancabali, Kabupaten Bandung.\r\n\r\nLangkah tersebut bukan sekadar rutinitas organisasi, melainkan bagian dari visi besar H. Ahmad Irfan dalam mencetak kader-kader berkualitas yang siap berkontribusi untuk kemajuan organisasi dan masyarakat. Keikutsertaan kader-kader terbaik dalam PKL diharapkan mampu memperdalam pemahaman ideologis, meningkatkan kapasitas kepemimpinan, serta memperluas jaringan antar kader di tingkat regional maupun nasional.\r\n\r\n“Kita ingin memastikan bahwa kaderisasi di PC GP Ansor Kota Bogor berjalan dengan baik, terarah, dan sesuai aturan. Kader yang kita kirim adalah mereka yang memiliki semangat juang tinggi, loyalitas kepada organisasi, dan komitmen kuat untuk mengabdi pada masyarakat,\" ujar H. Ahmad Irfan dengan optimisme tinggi.\r\n\r\nLangkah ini menjadi sinyal positif bagi perkembangan PC GP Ansor Kota Bogor ke depan. H. Ahmad Irfan berharap para kader yang telah mengikuti PKL mampu mengimplementasikan ilmu dan pengalaman yang didapat untuk membawa perubahan positif di lingkungan masing-masing, sekaligus memperkuat soliditas organisasi.\r\n\r\nDi bawah kepemimpinan H. Ahmad Irfan, PC GP Ansor Kota Bogor optimis mampu melahirkan generasi pemuda yang tangguh, berintegritas, dan berdaya saing tinggi, sesuai dengan nilai-nilai perjuangan Ansor dan Nahdlatul Ulama.', '/uploads/2025/5/konsisten-membangun-kaderisasi-pc-gp-ansor-kota-bogor-di-bawah-kepemimpinan-h-ahmad-irfan-1746772148388-749463005.jpg', 4, 1, 'published', '2025-05-09 06:29:08', '2025-05-09 06:29:08'),
(6, 'HIDUPP JOKOWIIIII ', 'hidupp-jokowiiiii', 'HIDUP JOKOWII\r\nHIDUP JOKOWII\r\nHIDUP JOKOWII\r\nHIDUP JOKOWII\r\nHIDUP JOKOWII\r\nHIDUP JOKOWII\r\nHIDUP JOKOWII\r\nHIDUP JOKOWII\r\nHIDUP JOKOWII\r\nHIDUP JOKOWII', '/uploads/2025/5/hidupp-jokowiiiii-1746971787220-139346273.jpg', 4, 1, 'published', '2025-05-11 13:56:27', '2025-05-11 13:56:27'),
(7, 'GOAT ANTHONY KEMBALI MENCETAK GOOL ( MU MENYESALL)', 'goat-anthony-kembali-mencetak-gool-mu-menyesall', 'ORANG YANG SANGAT BERBAHAYA YANG DI TAKUTI OLEH BARCA DAN JUGA  REAL MADRID DIALAH GOAT ANTHONY  ', '/uploads/2025/5/goat-anthony-kembali-mencetak-gool-mu-menyesall-1746974008368-43797567.jpeg', 4, 4, 'published', '2025-05-11 14:33:28', '2025-05-11 14:33:28'),
(8, 'CITY GOBLOK DI TAHAN IMBANG OLEH SOUTHHAMPTON (The Cityzens kecewa berat njrr)', 'city-goblok-di-tahan-imbang-oleh-southhampton-the-cityzens-kecewa-berat-njrr', 'ahhhh males berkata kata gw kecewa parahh', '/uploads/2025/5/city-goblok-di-tahan-imbang-oleh-southhampton-the-cityzens-kecewa-berat-njrr-1746974718775-494960615.jpeg', 4, 4, 'published', '2025-05-11 14:45:18', '2025-05-11 14:45:18'),
(9, 'SETAN MERAH DIKALAHKAN OLEH WESTHAM (mu gob*ok)', 'setan-merah-dikalahkan-oleh-westham-mu-gobok', 'MU TURUN KE PRINGKAT 16 EPL MAMPUSSS', '/uploads/2025/5/setan-merah-dikalahkan-oleh-westham-mu-gobok-1747015608692-473285898.jpg', 4, 4, 'published', '2025-05-12 02:06:48', '2025-05-12 02:06:48'),
(11, 'BESOK FINAL FA CUP CITY vs CRYSTAL PALLACE', 'besok-final-fa-cup-city-vs-crystal-pallace', 'MENANG INI MAHHH', '/uploads/2025/5/besok-final-fa-cup-city-vs-crystal-pallace-1747368212532-906911158.jpg', 5, 4, 'published', '2025-05-16 04:03:32', '2025-05-16 04:03:32');

-- --------------------------------------------------------

--
-- Struktur dari tabel `article_tags`
--

CREATE TABLE `article_tags` (
  `article_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `article_tags`
--

INSERT INTO `article_tags` (`article_id`, `tag_id`) VALUES
(2, 1),
(4, 7),
(4, 8),
(5, 9),
(5, 10),
(6, 11),
(7, 12),
(8, 13),
(9, 13),
(11, 13);

-- --------------------------------------------------------

--
-- Struktur dari tabel `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`) VALUES
(1, 'Politics', 'politics'),
(2, 'Technology', 'technology'),
(3, 'Business', 'business'),
(4, 'Sports', 'sports'),
(5, 'Entertainment', 'entertainment'),
(6, 'History', 'history');

-- --------------------------------------------------------

--
-- Struktur dari tabel `tags`
--

CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `tags`
--

INSERT INTO `tags` (`id`, `name`) VALUES
(5, 'aw'),
(6, 'aww'),
(4, 'bat'),
(13, 'bola'),
(14, 'dsa'),
(3, 'ganteng'),
(12, 'goat'),
(9, 'GP Ansor'),
(8, 'hari guru'),
(11, 'HIDUP'),
(10, 'Organisasi'),
(2, 'rehan'),
(7, 'sekolah'),
(1, 'wahu');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `created_at`) VALUES
(1, 'sirhan', 'r.sirhan2007@gmail.com', '$2b$10$ZV1xjS/lLxdvJOMM93TrL.JsD7SjJb8Icsqaktu8vHXZubnsn0UEq', '2025-04-28 13:27:12'),
(3, 'rehan ganteng', 'kamarov2827@gmail.com', '$2b$10$qvKMH31Uw6c6bmxv7mkjPuS6Eaf1S/weq5fgo5ThJrjDXsFjR3qw6', '2025-05-03 07:42:58'),
(4, 'kaivanra', 'syamilathalla21@gmail.com', '$2b$10$Kx0jpv1lcKo4PwctftLjgOGZNj.m6S489SuII5RpAKrfZI8.hAXDS', '2025-05-09 06:12:30'),
(5, 'asepp', 'syamilathalla@gmail.com', '$2b$10$/sdZAH5dLFCD6.ZS7lZsrucNMvpVo7xno08/AOeIUyDWTXHGaEdhe', '2025-05-13 08:09:44');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `articles`
--
ALTER TABLE `articles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `author_id` (`author_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indeks untuk tabel `article_tags`
--
ALTER TABLE `article_tags`
  ADD PRIMARY KEY (`article_id`,`tag_id`),
  ADD KEY `tag_id` (`tag_id`);

--
-- Indeks untuk tabel `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indeks untuk tabel `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `articles`
--
ALTER TABLE `articles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT untuk tabel `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `articles`
--
ALTER TABLE `articles`
  ADD CONSTRAINT `articles_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `articles_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `article_tags`
--
ALTER TABLE `article_tags`
  ADD CONSTRAINT `article_tags_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `article_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
