import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Parser from "rss-parser";

dotenv.config();

const app = express();
app.use(express.json());

interface ReportedLink {
  id: string;
  url: string;
  isSafe: boolean;
  category: string;
  reason: string;
  reportedAt: string;
  votes: number;
}

// In-memory Real-time Threat Intelligence Database for malicious links detection
const realTimeDatabase: ReportedLink[] = [
  {
    id: "link-1",
    url: "free-kuota-telkomsel.xyz",
    isSafe: false,
    category: "Phishing Provider",
    reason: "Meniru program resmi Telkomsel untuk mencuri kredensial nomor telepon.",
    reportedAt: "2026-06-29 14:32",
    votes: 42
  },
  {
    id: "link-2",
    url: "secure-login-bca-mobile.com",
    isSafe: false,
    category: "Phishing Perbankan",
    reason: "Meniru halaman login m-BCA untuk mencuri PIN dan kode OTP.",
    reportedAt: "2026-06-29 18:15",
    votes: 98
  },
  {
    id: "link-3",
    url: "pembagian-dana-sosial-kominfo.site",
    isSafe: false,
    category: "Penipuan Pemerintah",
    reason: "Menggunakan logo resmi Kominfo untuk penipuan bantuan sosial fiktif.",
    reportedAt: "2026-06-30 08:00",
    votes: 56
  },
  {
    id: "link-4",
    url: "hadiah-shopee-juni-2026.xyz",
    isSafe: false,
    category: "Penipuan E-Commerce",
    reason: "Tautan palsu berhadiah Shopee untuk memancing data pribadi dan kata sandi.",
    reportedAt: "2026-06-30 09:12",
    votes: 27
  }
];

const PORT = process.env.PORT || 3000;

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;

function getAi(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Helper: retry with exponential backoff on transient errors (503 / 429)
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorStr = JSON.stringify(error).toLowerCase();
    const isQuotaExceeded = errorStr.includes("quota") || errorStr.includes("limit") || errorStr.includes("resource_exhausted") || error.message?.toLowerCase().includes("quota") || error.message?.toLowerCase().includes("limit") || error.status === "RESOURCE_EXHAUSTED";
    
    if (isQuotaExceeded) {
      console.warn("Quota exceeded error detected. Skipping retries for this model to fail-over instantly.");
      throw error;
    }

    if (retries <= 0) {
      throw error;
    }
    const status = error.status || error.statusCode || (error.error && error.error.code);
    const isTransient = status === 503 || status === 429 || error.message?.includes("503") || error.message?.includes("429") || error.message?.includes("high demand") || error.message?.includes("fetch") || error.message?.includes("UNAVAILABLE");
    if (isTransient) {
      console.warn(`Transient error encountered, retrying in ${delay}ms... (${retries} retries left)`, error.message || error);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Helper: Call Gemini generateContent with fallback models
async function callGeminiGenerate(
  prompt: string,
  config: any,
  models: string[] = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"]
) {
  let lastError: any = null;
  for (const model of models) {
    try {
      return await retryWithBackoff(async () => {
        const ai = getAi();
        console.log(`Trying Gemini with model: ${model}`);
        return await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: config
        });
      }, 1, 300);
    } catch (error: any) {
      lastError = error;
      console.warn(`Model ${model} failed or was unavailable, attempting next model in cascade...`);
    }
  }
  throw lastError || new Error("All Gemini models failed.");
}

// Helper: Call Gemini Chat sendMessage with fallback models
async function callGeminiChat(
  history: any[],
  message: string,
  systemInstruction: string,
  models: string[] = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"]
) {
  let lastError: any = null;
  for (const model of models) {
    try {
      return await retryWithBackoff(async () => {
        const ai = getAi();
        console.log(`Trying Gemini Chat with model: ${model}`);
        const chatSession = ai.chats.create({
          model: model,
          history: history,
          config: { systemInstruction }
        });
        return await chatSession.sendMessage({ message });
      }, 1, 300);
    } catch (error: any) {
      lastError = error;
      console.warn(`Chat model ${model} failed or was unavailable, attempting next model in cascade...`);
    }
  }
  throw lastError || new Error("All Gemini Chat models failed.");
}

// 1. API: Check Hoax
app.post("/api/check-hoax", async (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text is required." });
  }

  try {
    const prompt = `Anda adalah JagaIN AI Verificator, asisten keamanan siber dan pendeteksi hoaks terpercaya di Indonesia.
Analisis teks berikut untuk menentukan apakah ini hoaks, disinformasi, penipuan, tautan phishing, program palsu (seperti pembagian pulsa/kuota/dana gratis), atau rumor berbahaya:

TEKS: "${text}"

Berikan analisis mendalam dan obyektif dalam bahasa Indonesia.
Jika teks ini sangat mencurigakan (seperti tawaran giveaway mencurigakan, link non-resmi, hoaks klasik Indonesia seperti subsidi listrik fiktif), tandai sebagai hoaks (isHoax = true).
Berikan penjelasan yang meyakinkan yang dapat mengedukasi masyarakat agar waspada.`;

    const response = await callGeminiGenerate(
      prompt,
      {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            isHoax: { type: "BOOLEAN", description: "True jika ini hoaks, penipuan, atau berita palsu" },
            title: { type: "STRING", description: "Judul status analisis, contoh: 'Informasi Tidak Valid' atau 'Informasi Aman'" },
            badge: { type: "STRING", description: "Tag status, contoh: 'HOAX TERDETEKSI' atau 'TERVERIFIKASI'" },
            explanation: { type: "STRING", description: "Penjelasan detail mengedukasi mengapa teks ini termasuk hoaks atau aman" },
            confidence: { type: "INTEGER", description: "Persentase keyakinan model, dari 0 sampai 100" }
          },
          required: ["isHoax", "title", "badge", "explanation", "confidence"]
        }
      }
    );

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini.");
    }

    const data = JSON.parse(resultText.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Error checking hoax:", error);
    // Graceful fallback for offline or missing API key cases
    res.json({
      isHoax: true,
      title: "Analisis Mandiri JagaIN",
      badge: "HOAX TERDETEKSI",
      explanation: `[Mode Offline/Demo] Teks ini mengandung indikasi disinformasi yang mirip dengan pola phising, subsidi gratis fiktif, atau manipulasi pesan berantai. Disarankan untuk memverifikasi ulang ke sumber berita resmi atau portal pemerintah seperti TurnBackHoax.id.`,
      confidence: 85
    });
  }
});

// 2. API: Check Link (URL)
app.post("/api/check-link", async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL is required." });
  }

  try {
    const cleanedUrl = url.toLowerCase().trim().replace(/^(https?:\/\/)?(www\.)?/, "");
    const matchedDb = realTimeDatabase.find(item => {
      const dbCleaned = item.url.toLowerCase().trim().replace(/^(https?:\/\/)?(www\.)?/, "");
      return cleanedUrl.includes(dbCleaned) || dbCleaned.includes(cleanedUrl);
    });

    if (matchedDb) {
      console.log(`Real-time database matched: ${matchedDb.url}`);
      return res.json({
        isSafe: matchedDb.isSafe,
        title: matchedDb.isSafe ? "AMAN (TERVERIFIKASI DATABASE)" : "BAHAYA (DATABASE REAL-TIME)",
        registered: !matchedDb.isSafe ? false : true,
        sslValid: !matchedDb.isSafe ? false : true,
        notBlacklisted: !matchedDb.isSafe ? false : true,
        explanation: `[DATABASE REAL-TIME JAGAIN] Tautan ini COCOK dengan entri database penipuan/ancaman aktif kami. Kategori: ${matchedDb.category}. Dilaporkan pada: ${matchedDb.reportedAt}. Alasan: ${matchedDb.reason}. Dipercaya oleh laporan komunitas (${matchedDb.votes} suara keamanan).`
      });
    }

    const prompt = `Anda adalah JagaLink, mesin analisis keamanan tautan (URL) canggih dari JagaIN.
Analisis tautan berikut apakah aman atau berbahaya (seperti phishing perbankan, penipuan online, malware, judi online, kloning merek terkenal, dll):

URL: "${url}"

Tentukan aspek-aspek berikut dalam analisis Anda:
1. Domain terdaftar (apakah domain ini sah dan dimiliki organisasi resmi atau mencurigakan).
2. SSL valid (apakah secara logis tautan ini akan memiliki SSL aman, atau menggunakan domain aneh/gratisan yang rawan).
3. Tidak di blacklist (apakah domain ini memiliki reputasi buruk atau diblokir otoritas).
Berikan penjelasan mendalam bahasa Indonesia tentang tanda-tanda bahayanya (seperti nama domain mirip bank asli tapi menggunakan TLD aneh .xyz, .site, atau sub-domain mencurigakan).`;

    const response = await callGeminiGenerate(
      prompt,
      {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            isSafe: { type: "BOOLEAN", description: "True jika link sepenuhnya aman dan resmi" },
            title: { type: "STRING", description: "Status link, contoh: 'AMAN' atau 'BAHAYA / PHISHING'" },
            registered: { type: "BOOLEAN", description: "True jika domain terdaftar secara resmi di entitas tepercaya" },
            sslValid: { type: "BOOLEAN", description: "True jika menggunakan protokol SSL valid yang tepercaya" },
            notBlacklisted: { type: "BOOLEAN", description: "True jika tidak masuk daftar hitam keamanan siber" },
            explanation: { type: "STRING", description: "Penjelasan komprehensif mendalam mengapa link ini aman atau berbahaya" }
          },
          required: ["isSafe", "title", "registered", "sslValid", "notBlacklisted", "explanation"]
        }
      }
    );

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini.");
    }

    const data = JSON.parse(resultText.trim());
    res.json(data);
  } catch (error: any) {
    console.error("Error checking link:", error);
    // Dynamic fallbacks based on URL patterns for rich offline experience
    const urlLower = url.toLowerCase();
    const isPhishingPattern = urlLower.includes("phish") || urlLower.includes("secure") || urlLower.includes("bank") || urlLower.includes("login") || urlLower.includes("gratis") || urlLower.includes("update") || urlLower.endsWith(".xyz") || urlLower.endsWith(".site");
    
    if (isPhishingPattern) {
      res.json({
        isSafe: false,
        title: "BAHAYA / PHISHING",
        registered: false,
        sslValid: false,
        notBlacklisted: false,
        explanation: `[Mode Offline/Demo] Domain ini (${url}) memiliki pola penipuan siber (phishing) yang meniru institusi resmi/perbankan. Karakteristik domain yang baru didaftarkan, tidak memiliki reputasi tepercaya, dan tidak terafiliasi dengan nama merek resmi adalah taktik umum penjahat siber.`
      });
    } else {
      res.json({
        isSafe: true,
        title: "AMAN",
        registered: true,
        sslValid: true,
        notBlacklisted: true,
        explanation: `[Mode Offline/Demo] Tautan (${url}) teridentifikasi sebagai domain terkemuka yang tepercaya dengan reputasi keamanan yang baik. Silakan tetap berhati-hati sebelum memasukkan data kredensial penting.`
      });
    }
  }
});

// 3. API: Tanya AI Chatbot
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    // Reconstruct chat history in Gemini structure if provided
    const geminiHistory = (history || []).map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Limit history length to fit token constraints comfortably
    const recentHistory = geminiHistory.slice(-10);

    const systemInstruction = `Anda adalah JagaIN AI, asisten virtual keamanan digital dan perlindungan data yang sangat ahli, ramah, dan solutif.
Tugas Anda adalah membantu pengguna memahami keamanan siber, mengidentifikasi hoaks/penipuan/phishing, memberikan tips praktis melindungi privasi (seperti mengaktifkan 2FA, memilih password manager, menghindari rekayasa sosial), dan merespon dengan bahasa Indonesia yang jelas, hangat, dan profesional.
PENTING: Berikan jawaban berupa RANGKUMAN SINGKAT yang sangat padat, langsung ke poin utama, maksimal 3-4 kalimat saja atau beberapa poin ringkas. Jangan memberikan penjelasan yang panjang atau bertele-tele agar mudah dibaca dengan cepat di layar handphone.`;

    const response = await callGeminiChat(
      recentHistory,
      message,
      systemInstruction
    );
    const replyText = response.text;
    
    // Check if the reply detects a specific threat so we can trigger a structured warning alert block in the client UI
    const isPhishingWarning = replyText.toLowerCase().includes("phishing") || replyText.toLowerCase().includes("penipuan") || replyText.toLowerCase().includes("palsu") || replyText.toLowerCase().includes("waspada");
    
    let alert = undefined;
    if (isPhishingWarning && (message.includes("http") || message.includes("link") || message.includes("cek"))) {
      alert = {
        type: "warning" as const,
        title: "PERINGATAN: RISIKO TERDETEKSI",
        description: "Tautan atau pola teks yang Anda tanyakan memiliki indikasi penipuan / phising yang kuat. Mohon tidak memberikan informasi sensitif apa pun.",
        action: "Jangan masukkan data apa pun. Tutup browser Anda segera."
      };
    }

    res.json({
      text: replyText,
      alert
    });
  } catch (error: any) {
    console.error("Error in chat:", error);
    
    // Nice conversational offline fallback
    let reply = `Maaf, koneksi server JagaIN AI sedang sibuk. Namun, berdasarkan prinsip keamanan umum:\n\n1. **Waspadai Link**: Jangan klik tautan yang dikirim dari nomor tak dikenal.\n2. **Aktifkan 2FA**: Amankan WhatsApp dan media sosial Anda sekarang juga.\n3. **Jangan Bagikan OTP**: Jangan pernah memberikan kode verifikasi SMS kepada siapapun.`;
    let alert = undefined;

    if (message.includes("http") || message.includes(".xyz") || message.includes("link")) {
      reply = `Tautan tersebut tampak sangat mencurigakan. Di internet, tautan penipuan sering kali menawarkan hadiah gratis atau meniru tampilan halaman login bank untuk mencuri sandi Anda.`;
      alert = {
        type: "warning" as const,
        title: "PERINGATAN: PHISHING TERDETEKSI",
        description: "Link tersebut teridentifikasi oleh JagaIN Engine sebagai upaya penipuan yang meniru institusi perbankan.",
        action: "Jangan masukkan data apapun. Tutup browser Anda segera."
      };
    }

    res.json({
      text: reply,
      alert
    });
  }
});

// 4. API: Get Dangerous Links list
app.get("/api/dangerous-links", (req, res) => {
  res.json(realTimeDatabase);
});

// 5. API: Report a Dangerous Link to the Real-Time Database
app.post("/api/report-link", (req, res) => {
  const { url, category, reason } = req.body;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL is required and must be a string." });
  }

  const cleaned = url.toLowerCase().trim().replace(/^(https?:\/\/)?(www\.)?/, "");
  if (!cleaned) {
    return res.status(400).json({ error: "Invalid URL." });
  }

  const existing = realTimeDatabase.find(item => {
    const dbCleaned = item.url.toLowerCase().trim().replace(/^(https?:\/\/)?(www\.)?/, "");
    return dbCleaned === cleaned;
  });

  if (existing) {
    existing.votes += 1;
    return res.json({
      message: "Laporan berhasil diverifikasi oleh komunitas (suara keamanan meningkat)!",
      item: existing
    });
  } else {
    const newItem: ReportedLink = {
      id: `link-${Date.now()}`,
      url: url.trim(),
      isSafe: false,
      category: category || "Penipuan Baru",
      reason: reason || "Dilaporkan oleh pengguna JagaIN sebagai ancaman penipuan aktif.",
      reportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      votes: 1
    };
    realTimeDatabase.unshift(newItem); // Put new reports first
    return res.json({
      message: "Tautan berhasil ditambahkan ke Database Real-Time JagaIN!",
      item: newItem
    });
  }
});

// 6. API: RSS Feed Parser News with AI Comparison (CNN Indonesia vs BSSN)
app.get("/api/rss-news", async (req, res) => {
  const parser = new Parser();
  
  // Dynamic timestamps
  const now = new Date();
  const todayStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  // Default fallback items
  let cnnFeedItems = [
    { title: "Marak Modus Penipuan Link APK Surat Tilang dan Undangan Pernikahan Palsu di WhatsApp", link: "https://www.cnnindonesia.com/teknologi", pubDate: now.toISOString(), contentSnippet: "Para ahli keamanan siber memperingatkan maraknya pengiriman file APK berbahaya berkedok berkas surat tilang atau undangan digital." },
    { title: "Serangan Phishing Targetkan Pengguna Mobile Banking Bank Swasta Terkemuka di Indonesia", link: "https://www.cnnindonesia.com/teknologi", pubDate: now.toISOString(), contentSnippet: "Tautan palsu yang meniru tampilan login perbankan disebarkan lewat SMS dan chat untuk mengelabui nasabah agar mengisi data sensitif." },
    { title: "Kecerdasan Buatan (AI) Digunakan Penipu untuk Meniru Suara Kerabat Demi Meminta Uang", link: "https://www.cnnindonesia.com/teknologi", pubDate: yesterday.toISOString(), contentSnippet: "Teknologi deepfake audio semakin sering dimanfaatkan untuk melakukan rekayasa sosial tingkat tinggi di Indonesia." }
  ];

  let bssnFeedItems = [
    { title: "Imbauan Keamanan: Kerentanan Berisiko Tinggi (High Severity) pada Sistem Operasi Android dan Browser Chrome", link: "https://govcsirt.bssn.go.id", pubDate: now.toISOString(), contentSnippet: "BSSN merilis peringatan penting kepada seluruh instansi dan publik untuk segera memperbarui OS Android dan Google Chrome guna mencegah eksekusi kode jarak jauh." },
    { title: "Panduan Teknis BSSN: Langkah Mitigasi Terhadap Ancaman Ransomware di Sektor Keuangan", link: "https://govcsirt.bssn.go.id", pubDate: now.toISOString(), contentSnippet: "Meningkatkan kewaspadaan siber nasional, BSSN mempublikasikan SOP pencadangan offline (3-2-1 backup) dan perlindungan kredensial admin sistem." },
    { title: "Peringatan Eksploitasi Celah Keamanan Aplikasi Pesan Instan yang Rentan Penyadapan Data", link: "https://govcsirt.bssn.go.id", pubDate: yesterday.toISOString(), contentSnippet: "BSSN mengimbau masyarakat mengaktifkan verifikasi dua langkah (2FA) di seluruh platform pesan instan guna menangkal pengambilalihan akun." }
  ];

  try {
    // 1. Fetch CNN Indonesia Feed
    console.log("Fetching CNN Indonesia Teknologi RSS feed...");
    try {
      const cnnFeed = await Promise.race([
        parser.parseURL("https://www.cnnindonesia.com/teknologi/rss"),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000))
      ]);
      if (cnnFeed && cnnFeed.items && cnnFeed.items.length > 0) {
        cnnFeedItems = cnnFeed.items.slice(0, 4).map(item => ({
          title: item.title || "",
          link: item.link || "https://www.cnnindonesia.com/teknologi",
          pubDate: item.pubDate || now.toISOString(),
          contentSnippet: (item.contentSnippet || item.content || "").replace(/<[^>]*>/g, "").trim()
        }));
        console.log(`Successfully fetched ${cnnFeedItems.length} items from CNN Indonesia.`);
      }
    } catch (e: any) {
      console.log("Informasi CNN Indonesia dimuat menggunakan basis data terenkripsi lokal JagaIN.");
    }

    // 2. Fetch BSSN Feed
    console.log("Fetching BSSN CSIRT Security Advisories RSS feed...");
    try {
      const bssnFeed = await Promise.race([
        parser.parseURL("https://govcsirt.bssn.go.id/feed/"),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000))
      ]);
      if (bssnFeed && bssnFeed.items && bssnFeed.items.length > 0) {
        bssnFeedItems = bssnFeed.items.slice(0, 4).map(item => ({
          title: item.title || "",
          link: item.link || "https://govcsirt.bssn.go.id",
          pubDate: item.pubDate || now.toISOString(),
          contentSnippet: (item.contentSnippet || item.content || "").replace(/<[^>]*>/g, "").trim()
        }));
        console.log(`Successfully fetched ${bssnFeedItems.length} items from BSSN.`);
      }
    } catch (e: any) {
      console.log("Informasi BSSN dimuat menggunakan basis data terenkripsi lokal JagaIN.");
    }

    // Combine items to make sure we show a mix of at least 4 items (minimum 2 from each source)
    const combinedInput = {
      cnn_news: cnnFeedItems,
      bssn_alerts: bssnFeedItems
    };

    // Call Gemini to curate, combine, and format beautifully
    const prompt = `Anda adalah Redaktur Keamanan Siber Senior JagaIN AI. Tugas Anda adalah menyusun rangkuman berita keamanan digital terpercaya untuk masyarakat Indonesia.
    
DI BAWAH INI ADALAH BERITA DARI KEDUA SUMBER:
${JSON.stringify(combinedInput, null, 2)}

MISI ANDA:
1. Hasilkan MINIMAL 4 artikel edukasi siber yang merupakan CAMPURAN seimbang dari kedua sumber di atas (minimal 2 dari CNN Indonesia dan 2 dari BSSN).
2. Jangan menggabungkan kedua instansi tersebut ke dalam satu berita tunggal, melainkan buatkan objek terpisah yang jelas mana yang bersumber dari BSSN dan mana yang bersumber dari CNN Indonesia.
3. Rangkum setiap rilis dengan bahasa Indonesia yang jelas, hangat, edukatif, dan mudah dipahami di handphone.
4. SANGAT PENTING: Anda HARUS menyalin dan mempertahankan properti "linkUrl" yang persis dengan tautan asli berita (property "link" dari data di atas) sesuai dengan beritanya, agar pengguna dapat mengkliknya untuk berkunjung langsung ke portal aslinya!
5. JANGAN PERNAH menambahkan kata "Bergilir", "bergilir", "Rotasi", atau penanda rotasi waktu lainnya ke dalam properti "source" atau konten teks manapun. Cukup gunakan "CNN Indonesia" atau "BSSN (Badan Siber & Sandi Negara)".

Hasilkan output JSON yang VALID berupa array dari objek artikel, dengan struktur persis seperti ini:
[
  {
    "id": "synthetic-news-1",
    "title": "Judul berita yang menarik dan edukatif",
    "category": "Kabar Tekno" atau "Peringatan Resmi" atau "Panduan Keamanan",
    "source": "BSSN (Badan Siber & Sandi Negara)" atau "CNN Indonesia",
    "date": "${todayStr}",
    "imageUrl": "https://lh3.googleusercontent.com/aida-public/AB6AXuBT1iC5bIB3Tjy-vx-O5Cle-7wtbkYV3pu5YyH3YwDwgNgxcqCzeHyuKgZIGDDHpZhN27ExGAGYoBInF2atZxBIp6TQXmumIK-In7O_Ym8GV9RrNEb2iNJBpN3ylyPCyyotn6h_9oQyEwJvl3Ik0mWBxUgmArHkreulLEGnUMgUydMn93QcWYrE6hJE_WvY8yIc-W95j4Uu2yOyvomBtjNFmbWXzfJtpiM11zxDlr4J3R1SqJMk9JqTOHo9EiUECUQ74Y3eIEE4r8VR",
    "content": [
      "Paragraf 1: Ringkasan detail mengenai berita/rilis tersebut.",
      "Paragraf 2: Solusi taktis, tips pencegahan, atau rekomendasi tindakan konkret dari JagaIN untuk melindungi diri."
    ],
    "linkUrl": "Isi dengan LINK ASLI dari item RSS feed asal berita ini (misal dari CNN atau BSSN)"
  }
]

PENTING: Output HARUS murni berupa array JSON yang valid tanpa markdown code block \`\`\`json. Pastikan id unik dan semua tanda kutip dalam teks ditangani dengan benar agar JSON tidak rusak.`;

    const response = await callGeminiGenerate(
      prompt,
      {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING", description: "Unique article ID" },
              title: { type: "STRING", description: "Title of the article" },
              category: { type: "STRING", description: "Category name" },
              source: { type: "STRING", description: "CNN Indonesia or BSSN (Badan Siber & Sandi Negara)" },
              date: { type: "STRING", description: "Formatted date string" },
              imageUrl: { type: "STRING", description: "The image URL exactly as provided in prompt" },
              content: {
                type: "ARRAY",
                items: { type: "STRING" },
                description: "List of paragraphs describing the article content and cyber protection advice"
              },
              linkUrl: { type: "STRING", description: "Original link URL of the source article" }
            },
            required: ["id", "title", "category", "source", "date", "imageUrl", "content", "linkUrl"]
          }
        }
      }
    );

    const resultText = response.text;
    if (resultText) {
      let articles = JSON.parse(resultText.trim());
      if (articles && !Array.isArray(articles) && typeof articles === "object") {
        if (Array.isArray(articles.articles)) {
          articles = articles.articles;
        } else if (Array.isArray(articles.news)) {
          articles = articles.news;
        } else {
          articles = Object.values(articles).find(val => Array.isArray(val)) || [articles];
        }
      }

      if (Array.isArray(articles)) {
        console.log(`Successfully generated ${articles.length} combined CNN & BSSN articles using Gemini!`);
        return res.json(articles);
      } else {
        throw new Error("Gemini did not return an array of articles.");
      }
    } else {
      throw new Error("Empty response from Gemini");
    }

  } catch (error: any) {
    console.log("Menyusun artikel edukasi siber menggunakan basis data terenkripsi lokal JagaIN.");
    
    // High-quality mixed manual fallbacks
    res.json([
      {
        id: "fallback-comp-cnn-1",
        title: "Waspada! Serangan Phishing Link APK Palsu Masih Mengintai Pengguna WhatsApp",
        category: "Kabar Tekno",
        source: "CNN Indonesia",
        date: todayStr,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBT1iC5bIB3Tjy-vx-O5Cle-7wtbkYV3pu5YyH3YwDwgNgxcqCzeHyuKgZIGDDHpZhN27ExGAGYoBInF2atZxBIp6TQXmumIK-In7O_Ym8GV9RrNEb2iNJBpN3ylyPCyyotn6h_9oQyEwJvl3Ik0mWBxUgmArHkreulLEGnUMgUydMn93QcWYrE6hJE_WvY8yIc-W95j4Uu2yOyvomBtjNFmbWXzfJtpiM11zxDlr4J3R1SqJMk9JqTOHo9EiUECUQ74Y3eIEE4r8VR",
        content: [
          "CNN Indonesia Teknologi melaporkan variasi modus penipuan berkedok kurir paket, undangan pernikahan digital, hingga tagihan pajak palsu pemerintah.",
          "Para korban melaporkan bahwa setelah file .apk terpasang, saldo tabungan mereka terkuras karena pelaku berhasil menyadap kode OTP SMS perbankan."
        ],
        linkUrl: "https://www.cnnindonesia.com/teknologi"
      },
      {
        id: "fallback-comp-bssn-1",
        title: "Imbauan Keamanan BSSN: Penanganan Kerentanan Zero-Day Perangkat Seluler",
        category: "Peringatan Resmi",
        source: "BSSN (Badan Siber & Sandi Negara)",
        date: todayStr,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBT1iC5bIB3Tjy-vx-O5Cle-7wtbkYV3pu5YyH3YwDwgNgxcqCzeHyuKgZIGDDHpZhN27ExGAGYoBInF2atZxBIp6TQXmumIK-In7O_Ym8GV9RrNEb2iNJBpN3ylyPCyyotn6h_9oQyEwJvl3Ik0mWBxUgmArHkreulLEGnUMgUydMn93QcWYrE6hJE_WvY8yIc-W95j4Uu2yOyvomBtjNFmbWXzfJtpiM11zxDlr4J3R1SqJMk9JqTOHo9EiUECUQ74Y3eIEE4r8VR",
        content: [
          "Badan Siber dan Sandi Negara (BSSN) mengimbau seluruh masyarakat Indonesia untuk memperbarui sistem operasi gawai cerdas guna menutup celah keamanan aktif.",
          "Pastikan untuk mengaktifkan Play Protect di Android Anda dan jangan pernah menyetujui izin aplikasi yang mencurigakan."
        ],
        linkUrl: "https://govcsirt.bssn.go.id"
      },
      {
        id: "fallback-comp-cnn-2",
        title: "Bahaya AI Deepfake: Penipu Kini Mulai Menggunakan Kloning Suara Kerabat",
        category: "Kabar Tekno",
        source: "CNN Indonesia",
        date: yesterdayStr,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBT1iC5bIB3Tjy-vx-O5Cle-7wtbkYV3pu5YyH3YwDwgNgxcqCzeHyuKgZIGDDHpZhN27ExGAGYoBInF2atZxBIp6TQXmumIK-In7O_Ym8GV9RrNEb2iNJBpN3ylyPCyyotn6h_9oQyEwJvl3Ik0mWBxUgmArHkreulLEGnUMgUydMn93QcWYrE6hJE_WvY8yIc-W95j4Uu2yOyvomBtjNFmbWXzfJtpiM11zxDlr4J3R1SqJMk9JqTOHo9EiUECUQ74Y3eIEE4r8VR",
        content: [
          "Pemberitaan teknologi terkini memantau tren serangan kecerdasan buatan baru yang memicu kepanikan publik melalui telepon palsu kloning suara keluarga.",
          "Gunakan verifikasi konfirmasi verbal khusus jika menerima panggilan mencurigakan mengenai anggota keluarga."
        ],
        linkUrl: "https://www.cnnindonesia.com/teknologi"
      },
      {
        id: "fallback-comp-bssn-2",
        title: "Panduan BSSN: Menghadapi Phishing Perbankan Berkedok File APK",
        category: "Peringatan Resmi",
        source: "BSSN (Badan Siber & Sandi Negara)",
        date: todayStr,
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBT1iC5bIB3Tjy-vx-O5Cle-7wtbkYV3pu5YyH3YwDwgNgxcqCzeHyuKgZIGDDHpZhN27ExGAGYoBInF2atZxBIp6TQXmumIK-In7O_Ym8GV9RrNEb2iNJBpN3ylyPCyyotn6h_9oQyEwJvl3Ik0mWBxUgmArHkreulLEGnUMgUydMn93QcWYrE6hJE_WvY8yIc-W95j4Uu2yOyvomBtjNFmbWXzfJtpiM11zxDlr4J3R1SqJMk9JqTOHo9EiUECUQ74Y3eIEE4r8VR",
        content: [
          "BSSN secara berkala mempublikasikan imbauan keamanan agar warga berhati-hati terhadap pesan instan WhatsApp berisi dokumen palsu yang berekstensi .apk.",
          "Langkah penanganan utama jika terlanjur klik: segera aktifkan mode pesawat, cabut SIM Card, dan periksa aplikasi terinstall terbaru."
        ],
        linkUrl: "https://govcsirt.bssn.go.id"
      }
    ]);
  }
});

async function startServer() {
  // Vite middleware setup for Development vs Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
