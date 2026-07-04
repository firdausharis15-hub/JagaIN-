import { Article, Notification } from "./types";

export const ARTICLES: Article[] = [
  {
    id: "global-cyber-attack",
    title: "Judul Lengkap Berita: Jaringan Keamanan Global Terancam Serangan Siber Terbaru",
    category: "Breaking News",
    source: "Portal XYZ",
    date: "30 Jun 2026",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBejroCMrnHo3bUnqDOP-XTVkD-GWnMdMbPlmG6fU6ZjZEd_arnIcKU4udoG7L_6pwhyMxZFyZaxsVuj-0q2GohBYWTPtvAGpCjoCGCrs9jzxxXJpUkhL0Kzp5ApyCU6NcPboxKZLxYv5sDtrYat54APQ24gC1zewUX0pnVkwoyuAQsFQ7vaEj7yrk0mYnMYYhzPYQgHmAIYSdmt46WMy-sIU5EfDSA2_vrc0KcnopZYavPQOXIKY2MgEEGVPmZRj53VoH_r785zlPL",
    content: [
      "Laporan terbaru mengungkapkan adanya upaya penetrasi terorganisir yang menargetkan infrastruktur digital nasional. Pakar keamanan memperingatkan bahwa metode yang digunakan melibatkan algoritma pembelajaran mesin tingkat lanjut yang mampu melewati protokol enkripsi standar.",
      "Tim respons insiden sedang bekerja sepanjang waktu untuk mengisolasi segmen jaringan yang terdampak. Warga dihimbau untuk tetap waspada terhadap upaya phising yang mungkin memanfaatkan momentum berita ini untuk mencuri kredensial akses pengguna.",
      "Hingga saat ini, belum ada konfirmasi resmi mengenai kebocoran data sensitif, namun langkah-langkah preventif sedang diperketat di seluruh sektor vital."
    ],
    linkUrl: "#"
  },
  {
    id: "whatsapp-scams",
    title: "Waspada Modus Penipuan Undangan APK dan Link Kuota Gratis di WhatsApp",
    category: "Penting",
    source: "Direktorat Keamanan Siber",
    date: "29 Jun 2026",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBT1iC5bIB3Tjy-vx-O5Cle-7wtbkYV3pu5YyH3YwDwgNgxcqCzeHyuKgZIGDDHpZhN27ExGAGYoBInF2atZxBIp6TQXmumIK-In7O_Ym8GV9RrNEb2iNJBpN3ylyPCyyotn6h_9oQyEwJvl3Ik0mWBxUgmArHkreulLEGnUMgUydMn93QcWYrE6hJE_WvY8yIc-W95j4Uu2yOyvomBtjNFmbWXzfJtpiM11zxDlr4J3R1SqJMk9JqTOHo9EiUECUQ74Y3eIEE4r8VR",
    content: [
      "Kementerian Komunikasi dan Informatika mengimbau masyarakat untuk mewaspadai modus penipuan pengiriman file APK (Application Package) berkedok undangan pernikahan digital, tagihan BPJS, atau kurir paket.",
      "Modus penipuan ini menargetkan pengguna WhatsApp dengan harapan korban menginstal file berbahaya tersebut. Begitu terinstal, aplikasi jahat ini dapat mengakses SMS, OTP perbankan, dan data pribadi sensitif lainnya tanpa sepengetahuan korban.",
      "Selain APK, pesan berantai yang menawarkan subsidi energi atau kuota internet gratis 100GB juga dipastikan adalah hoaks phishing untuk mencuri data pribadi. Pastikan Anda hanya mengandalkan saluran komunikasi resmi instansi pemerintah."
    ],
    linkUrl: "#"
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "login-alert",
    title: "Upaya Login Mencurigakan",
    description: "Seseorang mencoba masuk ke akun Anda dari Jakarta. Segera amankan akun.",
    time: "5m",
    type: "security",
    isUnread: true,
    priority: "high"
  },
  {
    id: "top-news",
    title: "Berita Terpopuler Hari Ini",
    description: "Waspada penipuan link melalui pesan WhatsApp yang sedang marak.",
    time: "2h",
    type: "news",
    isUnread: true
  },
  {
    id: "database-update",
    title: "Keamanan Link Diperbarui",
    description: "Database link berbahaya kami telah diperbarui untuk perlindungan maksimal.",
    time: "5h",
    type: "system",
    isUnread: true
  },
  {
    id: "hoax-detected-notif",
    title: "Hoax Terdeteksi",
    description: "Pesan berantai subsidi listrik 1jt telah dikonfirmasi Hoax oleh tim AI.",
    time: "1d",
    type: "hoax",
    isUnread: false
  }
];

export const INDONESIA_NEWS: Article[] = [
  {
    id: "indo-news-disaster-1",
    title: "BMKG Rilis Peringatan Dini Cuaca Ekstrem dan Potensi Banjir Bandang di Sejumlah Wilayah Indonesia",
    category: "Bencana Alam",
    source: "BMKG Indonesia",
    date: "Hari ini",
    imageUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80",
    content: [
      "Badan Meteorologi, Klimatologi, dan Geofisika (BMKG) mengimbau warga di sepanjang lereng sungai dan wilayah pesisir untuk mengantisipasi potensi curah hujan ekstrem yang dapat memicu banjir bandang dan tanah longsor.",
      "Sistem pemantauan radar cuaca mendeteksi anomali atmosfer aktif yang membawa massa udara basah tinggi di atas sebagian besar pulau Sumatera, Jawa, dan Sulawesi."
    ],
    linkUrl: "https://www.bmkg.go.id"
  },
  {
    id: "indo-news-disaster-2",
    title: "Gunung Merapi Kembali Luncurkan Guguran Awan Panas Sejauh 1,5 Kilometer, Warga Diimbau Waspada",
    category: "Bencana Alam",
    source: "BPPTKG Yogyakarta",
    date: "Kemarin",
    imageUrl: "https://images.unsplash.com/photo-1461088945293-0c17689e48ac?w=800&auto=format&fit=crop&q=80",
    content: [
      "Balai Penyelidikan dan Pengembangan Teknologi Kebencanaan Geologi (BPPTKG) melaporkan aktivitas vulkanik Gunung Merapi berupa luncuran awan panas guguran ke arah barat daya.",
      "Warga diimbau untuk tidak melakukan aktivitas apa pun di daerah potensi bahaya radius 5 kilometer dari puncak demi keselamatan bersama."
    ],
    linkUrl: "https://bpptkg.esdm.go.id"
  },
  {
    id: "indo-news-politics-1",
    title: "Sidang Parlemen Ketat: RUU Keamanan Data Pribadi dan Regulasi Etika AI Memasuki Tahap Finalisasi",
    category: "Politik",
    source: "Humas DPR RI",
    date: "Hari ini",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80",
    content: [
      "Dewan Perwakilan Rakyat mempercepat pembahasan regulasi tata kelola kecerdasan buatan demi menekan maraknya penyalahgunaan teknologi deepfake dan manipulasi opini publik menjelang masa kampanye.",
      "Undang-undang baru ini dirancang untuk memberikan sanksi administratif dan pidana berat bagi korporasi atau individu yang menyebarkan informasi manipulatif bertenaga AI tanpa label peringatan."
    ],
    linkUrl: "https://www.dpr.go.id"
  },
  {
    id: "indo-news-politics-2",
    title: "Komisi Pemilihan Umum Siapkan Simulasi Sistem Pemungutan Suara Digital dan E-Voting Nasional",
    category: "Politik",
    source: "KPU RI",
    date: "3 hari yang lalu",
    imageUrl: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=80",
    content: [
      "KPU RI mulai menguji coba sistem e-voting terenkripsi untuk wilayah terpencil guna meningkatkan efisiensi penghitungan suara secara real-time.",
      "Tim ahli keamanan siber dilibatkan secara penuh untuk melakukan penetrasi pengujian (penetration testing) guna meminimalkan risiko sabotase digital."
    ],
    linkUrl: "https://www.kpu.go.id"
  },
  {
    id: "indo-news-1",
    title: "Rekor Baru MRT Jakarta Tembus 150.000 Penumpang Sehari Pasca Perluasan Rute Utama",
    category: "Megapolitan",
    source: "Detikcom",
    date: "Hari ini",
    imageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop&q=80",
    content: [
      "Jumlah pengguna MRT Jakarta mencapai rekor tertinggi baru sepanjang sejarah. Perluasan rute ke wilayah utara dan integrasi moda transportasi Transjakarta menjadi faktor utama lonjakan penumpang yang sangat signifikan ini.",
      "Integrasi fisik antarmoda dan kemudahan tap-in menggunakan sistem pembayaran digital turut mendongkrak minat masyarakat beralih dari transportasi pribadi."
    ],
    linkUrl: "https://www.detik.com"
  },
  {
    id: "indo-news-2",
    title: "Kualifikasi Piala Dunia: STY Optimistis Timnas Indonesia Amankan Poin Penuh di Laga Kandang",
    category: "Sepak Bola",
    source: "Kompas.com",
    date: "Hari ini",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
    content: [
      "Pelatih Shin Tae-yong menegaskan bahwa seluruh skuad Garuda berada dalam kondisi fisik prima dan fokus penuh menghadapi pertandingan krusial besok malam di Stadion Utama Gelora Bung Karno.",
      "Para pemain siap bertarung mati-matian demi menjaga asa lolos ke putaran berikutnya dan meminta dukungan penuh dari seluruh masyarakat Indonesia."
    ],
    linkUrl: "https://www.kompas.com"
  },
  {
    id: "indo-news-3",
    title: "Penampakan Langka Komet Hijau Melintasi Candi Borobudur, Terjadi 75 Tahun Sekali",
    category: "Sains & Viral",
    source: "Tribunnews.com",
    date: "Kemarin",
    imageUrl: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&auto=format&fit=crop&q=80",
    content: [
      "Para astronom dan fotografer berhasil mengabadikan momen magis saat komet hijau melintas tepat di atas stupa Candi Borobudur. Fenomena astronomi langka ini menarik perhatian ribuan warga lokal dan wisatawan.",
      "Komet ini memiliki pancaran warna kehijauan yang khas akibat kandungan gas karbon diatomik di kepalanya saat mendekati matahari."
    ],
    linkUrl: "https://www.tribunnews.com"
  },
  {
    id: "indo-news-4",
    title: "Flagship Baru Diluncurkan! Smartphone Layar Lipat Generasi Terbaru Dobrak Pasar Indonesia",
    category: "Teknologi",
    source: "Liputan6.com",
    date: "Kemarin",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
    content: [
      "Produsen teknologi terkemuka resmi merilis ponsel lipat teringan dan tertipis dengan engsel titanium yang diklaim mampu bertahan hingga 500.000 lipatan. Dilengkapi kamera sensor raksasa dan AI terintegrasi.",
      "Ponsel pintar ini juga menawarkan fungsionalitas produktivitas tingkat tinggi dengan fitur multitasking mutakhir bagi profesional muda."
    ],
    linkUrl: "https://www.liputan6.com"
  },
  {
    id: "indo-news-5",
    title: "Kuliner Nusantara Pecahkan Rekor Dunia: Sate Padang Terpanjang Disajikan di Festival Padang",
    category: "Kuliner & Budaya",
    source: "Suara.com",
    date: "2 hari yang lalu",
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=80",
    content: [
      "Festival Kuliner Padang sukses menyajikan sate padang sepanjang 500 meter tanpa putus, memanggang ribuan tusuk sate secara serentak menggunakan bumbu rempah khas Sumatera Barat yang otentik.",
      "Ribuan pengunjung memadati lokasi festival untuk mencicipi hidangan tradisional legendaris ini secara gratis pasca penilaian rekor."
    ],
    linkUrl: "https://www.suara.com"
  }
];

export const SOSMED_TRENDS: Article[] = [
  {
    id: "sosmed-trend-1",
    title: "Viral Tren 'Glow Up' Challenge di TikTok, Jutaan Kreator Bagikan Transformasi Penampilan Inspiratif",
    category: "FYP TikTok",
    source: "TikTok @kreator_id",
    date: "3 jam yang lalu",
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80",
    content: [
      "Sebuah tren baru bernama 'Glow Up Challenge' sedang mendominasi linimasa TikTok di Indonesia. Jutaan pengguna mengunggah video kompilasi foto masa kecil mereka yang disandingkan dengan penampilan saat ini.",
      "Tren ini dinilai sangat positif karena banyak kreator yang menyisipkan pesan tentang pentingnya mencintai diri sendiri (self-love), menjaga kesehatan kulit, serta berolahraga secara teratur."
    ],
    linkUrl: "https://tiktok.com"
  },
  {
    id: "sosmed-trend-disaster-1",
    title: "Viral Kepanikan Warga saat Gempa Ringan Mengguncang Sejumlah Wilayah Barat Jawa, Video Amatir Banjiri X",
    category: "Trending X",
    source: "X @InfoBencana_RI",
    date: "4 jam yang lalu",
    imageUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80",
    content: [
      "Sejumlah video rekaman CCTV dan ponsel pintar milik warga yang merekam getaran gempa ringan berdurasi singkat mendadak viral di platform X (Twitter). Banyak warganet saling membagikan info kondisi wilayah masing-masing.",
      "Getaran dilaporkan terasa di beberapa wilayah perumahan padat penduduk. Warga dihimbau tidak panik namun tetap waspada terhadap informasi ramalan gempa hoaks yang sering beredar setelah kejadian."
    ],
    linkUrl: "https://x.com"
  },
  {
    id: "sosmed-trend-2",
    title: "Heboh Konser Rahasia Musisi Internasional di Jakarta, Tiket Sold Out dalam Waktu Kurang dari 5 Menit",
    category: "Trending X",
    source: "Menfess @X_Trend",
    date: "6 jam yang lalu",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    content: [
      "Penggemar musik di tanah air dikejutkan dengan pengumuman mendadak konser rahasia (secret show) salah satu grup band legendaris dunia yang akan digelar di Jakarta minggu depan.",
      "Penjualan tiket yang dibuka tanpa pemberitahuan awal langsung diserbu hingga ludes terjual dalam kurun waktu kurang dari lima menit, menyisakan kekecewaan bagi puluhan ribu fans yang kehabisan tiket."
    ],
    linkUrl: "https://x.com"
  },
  {
    id: "sosmed-trend-politics-1",
    title: "Debat Sengit Netizen di Instagram Mengenai Kebijakan Baru Simulasi Pemungutan Suara Digital (E-Voting) KPU",
    category: "Politik Sosmed",
    source: "IG @suaramahasiswa",
    date: "8 jam yang lalu",
    imageUrl: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=80",
    content: [
      "Halaman komentar salah satu postingan infografis KPU mengenai simulasi e-voting dipenuhi oleh ribuan komentar pro dan kontra dari warganet Instagram.",
      "Sebagian warganet menyambut baik modernisasi sistem pemilu demi efisiensi, sementara sebagian lainnya menyatakan keraguan terkait kesiapan infrastruktur keamanan siber untuk mencegah potensi manipulasi data digital."
    ],
    linkUrl: "https://instagram.com"
  },
  {
    id: "sosmed-trend-3",
    title: "Tren Kuliner Baru 'Mochi Bakar' Viral di Instagram, Antrean Pengunjung di Blok M Mengular hingga Ratusan Meter",
    category: "Kuliner Viral",
    source: "IG @infokuliner",
    date: "12 jam yang lalu",
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80",
    content: [
      "Kawasan kuliner Blok M Jakarta Selatan kembali menghadirkan sensasi baru berupa kedai 'Mochi Bakar' khas Jepang yang dimodifikasi dengan saus karamel lokal dan keju meleleh.",
      "Antrean pembeli terlihat memadati area trotoar sejak siang hingga malam hari, dengan waktu tunggu rata-rata mencapai satu hingga dua jam demi mencicipi mochi bertekstur kenyal dan harum tersebut."
    ],
    linkUrl: "https://instagram.com"
  },
  {
    id: "sosmed-trend-disaster-2",
    title: "Viral Rekaman Menegangkan Guguran Awan Panas Gunung Merapi Terpantau Jelas Melalui Siaran Langsung TikTok",
    category: "FYP TikTok",
    source: "TikTok @merapi_live",
    date: "Kemarin",
    imageUrl: "https://images.unsplash.com/photo-1461088945293-0c17689e48ac?w=800&auto=format&fit=crop&q=80",
    content: [
      "Sebuah siaran langsung yang menampilkan puncak Gunung Merapi saat meluncurkan awan panas mendadak ditonton oleh puluhan ribu pengguna TikTok secara real-time.",
      "Warganet berbondong-bondong memberikan doa keselamatan bagi warga yang berada di lereng Merapi. Rekomendasi zona aman dari BPPTKG pun ramai dibagikan ulang sebagai panduan resmi evakuasi mandiri."
    ],
    linkUrl: "https://tiktok.com"
  },
  {
    id: "sosmed-trend-4",
    title: "Kucing 'Oyen' Penjaga Minimarket di Bandung Jadi Idola Baru Netizen, Punya Akun Sosmed dengan Ratusan Ribu Followers",
    category: "Viral Menarik",
    source: "Threads @dunia_hewan",
    date: "Kemarin",
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80",
    content: [
      "Seekor kucing berbulu oranye alias 'Oyen' yang kerap terlihat tertidur dengan tenang di atas keset pintu masuk sebuah minimarket di Bandung mendadak jadi selebritis internet.",
      "Kombinasi tingkahnya yang ramah saat diajak berfoto bersama pelanggan dan ekspresi wajahnya yang menggemaskan membuat akun media sosial buatannya kebanjiran pengikut dari seluruh penjuru nusantara."
    ],
    linkUrl: "https://threads.net"
  },
  {
    id: "sosmed-trend-politics-2",
    title: "Ramai Utas Panjang di X Membedah RUU Keamanan Data Pribadi Baru dan Regulasi Ketat Etika Penggunaan AI",
    category: "Trending X",
    source: "X @TeknoPolitik_ID",
    date: "2 hari yang lalu",
    imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80",
    content: [
      "Sebuah thread analisis hukum mengenai rancangan regulasi etika AI nasional viral di X dengan ribuan retweets. Utas tersebut mengupas dampak sanksi bagi penyebar deepfake AI manipulatif.",
      "Masyarakat akademis dan praktisi IT menyuarakan pentingnya pengawasan independen agar implementasi undang-undang ini berjalan adil tanpa mematikan kreativitas inovator lokal."
    ],
    linkUrl: "https://x.com"
  }
];

