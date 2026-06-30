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
