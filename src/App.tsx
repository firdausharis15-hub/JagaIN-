/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Newspaper,
  ShieldAlert,
  Link2,
  Bot,
  Bell,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Star,
  Send,
  Share2,
  History,
  User,
  Copy,
  PlusCircle,
  Lock,
  ShieldCheck,
  HelpCircle,
  Activity,
  Mail,
  Construction,
  Lightbulb,
  FileText,
  MoreHorizontal,
  Plus,
  Compass,
  Check,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Article, Notification, ChatMessage, HoaxResult, LinkResult } from "./types";
import { ARTICLES, INITIAL_NOTIFICATIONS } from "./data";
import { sanitizeSensitiveData, sanitizeUrlCredentials, obfuscateData, deobfuscateData } from "./utils/security";

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'kabar' | 'hoax' | 'link' | 'ai'>('hoax');
  const [subView, setSubView] = useState<null | 'kabar-detail' | 'panduan-hoax' | 'panduan-sosmed' | 'notifications' | 'feedback'>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem("jagain_notifications");
    try {
      const decrypted = saved ? deobfuscateData(saved) : null;
      return decrypted ? JSON.parse(decrypted) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // History State
  const [hoaxHistory, setHoaxHistory] = useState<{ text: string; isHoax: boolean; time: string }[]>(() => {
    const saved = localStorage.getItem("jagain_hoax_history");
    try {
      const decrypted = saved ? deobfuscateData(saved) : null;
      return decrypted ? JSON.parse(decrypted) : [
        { text: "Pemberian bantuan subsidi listrik 1jt rupiah", isHoax: true, time: "1 hari yang lalu" },
        { text: "Update jadwal perjalanan KRL Commuter Line Jabodetabek", isHoax: false, time: "2 jam yang lalu" }
      ];
    } catch {
      return [
        { text: "Pemberian bantuan subsidi listrik 1jt rupiah", isHoax: true, time: "1 hari yang lalu" },
        { text: "Update jadwal perjalanan KRL Commuter Line Jabodetabek", isHoax: false, time: "2 jam yang lalu" }
      ];
    }
  });

  const [linkHistory, setLinkHistory] = useState<{ url: string; isSafe: boolean; time: string }[]>(() => {
    const saved = localStorage.getItem("jagain_link_history");
    try {
      const decrypted = saved ? deobfuscateData(saved) : null;
      return decrypted ? JSON.parse(decrypted) : [
        { url: "example.com", isSafe: true, time: "Diperiksa 2 jam yang lalu" },
        { url: "phishing.xyz", isSafe: false, time: "Diperiksa 5 jam yang lalu" }
      ];
    } catch {
      return [
        { url: "example.com", isSafe: true, time: "Diperiksa 2 jam yang lalu" },
        { url: "phishing.xyz", isSafe: false, time: "Diperiksa 5 jam of yang lalu" }
      ];
    }
  });

  // Chatbot State
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("jagain_chat_messages");
    try {
      const decrypted = saved ? deobfuscateData(saved) : null;
      return decrypted ? JSON.parse(decrypted) : [
        {
          id: "msg-welcome",
          sender: "ai",
          text: "Halo! Saya asisten JagaIN. Saya bisa membantu memverifikasi teks mencurigakan, memeriksa link yang berbahaya, atau membagikan tips praktis perlindungan data pribadi Anda."
        }
      ];
    } catch {
      return [
        {
          id: "msg-welcome",
          sender: "ai",
          text: "Halo! Saya asisten JagaIN. Saya bisa membantu memverifikasi teks mencurigakan, memeriksa link yang berbahaya, atau membagikan tips praktis perlindungan data pribadi Anda."
        }
      ];
    }
  });
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Form Inputs
  const [hoaxInput, setHoaxInput] = useState("");
  const [isHoaxLoading, setIsHoaxLoading] = useState(false);
  const [hoaxResult, setHoaxResult] = useState<HoaxResult | null>(null);
  const [isHoaxModalOpen, setIsHoaxModalOpen] = useState(false);

  const [linkInput, setLinkInput] = useState("");
  const [isLinkLoading, setIsLinkLoading] = useState(false);
  const [linkResult, setLinkResult] = useState<LinkResult | null>(null);

  // RSS News and Real-time Dangerous Links database states
  const [articles, setArticles] = useState<Article[]>([]);
  const [isRssLoading, setIsRssLoading] = useState(false);
  const [dangerousLinks, setDangerousLinks] = useState<any[]>([]);
  const [isDbLoading, setIsDbLoading] = useState(false);
  
  // New Dangerous Link report inputs
  const [reportUrlInput, setReportUrlInput] = useState("");
  const [reportCategoryInput, setReportCategoryInput] = useState("Phishing Perbankan");
  const [reportReasonInput, setReportReasonInput] = useState("");
  const [isReportSubmitting, setIsReportSubmitting] = useState(false);
  const [reportSuccessMsg, setReportSuccessMsg] = useState("");

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackCategory, setFeedbackCategory] = useState<'Masalah Teknis' | 'Saran Fitur' | 'Konten Berita' | 'Lainnya' | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);

  // Fetch RSS news and real-time dangerous links on mount
  useEffect(() => {
    const fetchRssAndLinks = async () => {
      setIsRssLoading(true);
      try {
        const res = await fetch("/api/rss-news");
        const data = await res.json();
        if (data && data.length > 0) {
          setArticles(data);
        } else {
          throw new Error("No articles parsed");
        }
      } catch (err) {
        console.error("Failed to load RSS news:", err);
        // Direct local high-quality client-side fallback to prevent empty screen/errors
        const todayStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
        setArticles([
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
          }
        ]);
      } finally {
        setIsRssLoading(false);
      }

      setIsDbLoading(true);
      try {
        const res = await fetch("/api/dangerous-links");
        const data = await res.json();
        setDangerousLinks(data);
      } catch (err) {
        console.error("Failed to load dangerous links:", err);
      } finally {
        setIsDbLoading(false);
      }
    };

    fetchRssAndLinks();
  }, []);

  const handleReportLink = async () => {
    if (!reportUrlInput.trim()) {
      alert("Mohon masukkan tautan URL terlebih dahulu.");
      return;
    }
    setIsReportSubmitting(true);
    setReportSuccessMsg("");
    try {
      const res = await fetch("/api/report-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: reportUrlInput,
          category: reportCategoryInput,
          reason: reportReasonInput || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setReportSuccessMsg(data.message || "Laporan berhasil dikirim!");
        setReportUrlInput("");
        setReportReasonInput("");
        // Reload dangerous links
        const dbRes = await fetch("/api/dangerous-links");
        const dbData = await dbRes.json();
        setDangerousLinks(dbData);
      } else {
        alert(data.error || "Gagal melaporkan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengirim laporan.");
    } finally {
      setIsReportSubmitting(false);
    }
  };

  const handleVoteLink = async (url: string) => {
    try {
      const res = await fetch("/api/report-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      if (res.ok) {
        // Reload dangerous links
        const dbRes = await fetch("/api/dangerous-links");
        const dbData = await dbRes.json();
        setDangerousLinks(dbData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Persistent States Saving
  useEffect(() => {
    localStorage.setItem("jagain_notifications", obfuscateData(JSON.stringify(notifications)));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("jagain_hoax_history", obfuscateData(JSON.stringify(hoaxHistory)));
  }, [hoaxHistory]);

  useEffect(() => {
    localStorage.setItem("jagain_link_history", obfuscateData(JSON.stringify(linkHistory)));
  }, [linkHistory]);

  useEffect(() => {
    localStorage.setItem("jagain_chat_messages", obfuscateData(JSON.stringify(messages)));
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Unread notifications count
  const unreadCount = notifications.filter(n => n.isUnread).length;

  // Actions
  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  const handleClearHistory = () => {
    if (confirm("Hapus semua riwayat pemeriksaan?")) {
      setHoaxHistory([]);
      setLinkHistory([]);
    }
  };

  // 1. Cek Hoax Analyzer Submit
  const handleAnalyzeHoax = async () => {
    if (!hoaxInput.trim()) {
      alert("Mohon masukkan teks berita terlebih dahulu.");
      return;
    }

    setIsHoaxLoading(true);
    setHoaxResult(null);

    // SILENT SECURITY FEATURE: Sanitize any accidentally pasted sensitive data (like OTP, PIN, Credit Cards)
    const sanitizedHoaxInput = sanitizeSensitiveData(hoaxInput);

    try {
      const res = await fetch("/api/check-hoax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sanitizedHoaxInput })
      });
      const data = await res.json();
      setHoaxResult(data);

      // Save to recent checks list using sanitized text to protect privacy
      setHoaxHistory(prev => [
        { text: sanitizedHoaxInput, isHoax: data.isHoax, time: "Baru saja" },
        ...prev.slice(0, 4)
      ]);

      // If it's a hoax, inject a high-priority notification to simulate active protection!
      if (data.isHoax) {
        const newNotif: Notification = {
          id: `alert-${Date.now()}`,
          title: "Hoaks Baru Terdeteksi",
          description: `Teks "${sanitizedHoaxInput.slice(0, 25)}..." terkonfirmasi sebagai disinformasi berbahaya.`,
          time: "Baru saja",
          type: "hoax",
          isUnread: true,
          priority: "high"
        };
        setNotifications(prev => [newNotif, ...prev]);
      }

      setIsHoaxModalOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsHoaxLoading(false);
    }
  };

  // 2. Jaga Link Checker Submit
  const handleCheckLink = async (targetUrl?: string) => {
    const urlToTest = targetUrl || linkInput;
    if (!urlToTest.trim()) {
      alert("Mohon masukkan URL tautan terlebih dahulu.");
      return;
    }

    setIsLinkLoading(true);
    setLinkResult(null);

    // SILENT SECURITY FEATURE: Strip sensitive credential parameters (token, pass, otp) and sanitize Indonesian credentials
    const sanitizedUrl = sanitizeSensitiveData(sanitizeUrlCredentials(urlToTest.trim()));

    try {
      const res = await fetch("/api/check-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sanitizedUrl })
      });
      const data = await res.json();
      setLinkResult(data);

      // Add to search history using sanitized URL to protect privacy
      setLinkHistory(prev => [
        { url: sanitizedUrl, isSafe: data.isSafe, time: "Baru saja" },
        ...prev.filter(item => item.url !== sanitizedUrl).slice(0, 4)
      ]);

      // If dangerous, inject notification
      if (!data.isSafe) {
        const newNotif: Notification = {
          id: `link-alert-${Date.now()}`,
          title: "Tautan Berbahaya Ditemukan",
          description: `Tautan "${sanitizedUrl}" berisiko tinggi penipuan / phishing.`,
          time: "Baru saja",
          type: "security",
          isUnread: true,
          priority: "high"
        };
        setNotifications(prev => [newNotif, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLinkLoading(false);
    }
  };

  // 3. Tanya AI Chatbot send
  const handleSendChat = async (presetText?: string) => {
    const textToSend = presetText || chatInput;
    if (!textToSend.trim()) return;

    let currentMessages = messages;
    const currentUserQuestionCount = messages.filter(m => m.sender === "user").length;

    // Jika pengguna sudah bertanya sebanyak 3 kali, otomatis hapus history & mulai sesi baru demi privasi
    if (currentUserQuestionCount >= 3) {
      currentMessages = [
        {
          id: `msg-welcome-reset-${Date.now()}`,
          sender: "ai",
          text: "Sesi tanya jawab baru telah dimulai secara otomatis demi melindungi privasi siber Anda. Silakan tanyakan hal baru."
        }
      ];
    }

    // SILENT SECURITY FEATURE: Strip user sensitive data before saving in UI/history or sending to LLM
    const sanitizedTextToSend = sanitizeSensitiveData(textToSend);

    const userMsg: ChatMessage = {
      id: `user-msg-${Date.now()}`,
      sender: "user",
      text: sanitizedTextToSend
    };

    const updatedMessages = [...currentMessages, userMsg];
    setMessages(updatedMessages);
    if (!presetText) setChatInput("");
    setIsAiTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: sanitizedTextToSend,
          history: currentMessages
        })
      });
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-msg-${Date.now()}`,
        sender: "ai",
        text: data.text,
        alert: data.alert
      };

      setMessages(prev => {
        // If messages were cleared while waiting, handle properly
        const filtered = prev.filter(m => m.id !== "msg-welcome");
        // Ensure userMsg is included
        const base = prev.find(m => m.id === userMsg.id) ? prev : [...prev, userMsg];
        return [...base, aiMsg];
      });
    } catch (err) {
      console.error(err);
      const offlineMsg: ChatMessage = {
        id: `ai-msg-offline-${Date.now()}`,
        sender: "ai",
        text: "Maaf, server AI sedang mengalami kendala jaringan. Harap waspada terhadap tautan asing, jangan pernah berikan kode OTP kepada siapapun!"
      };
      setMessages(prev => [...prev, offlineMsg]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // 4. Send Feedback Form
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackRating === 0 || !feedbackMessage.trim()) {
      alert("Mohon berikan penilaian bintang dan pesan detail masukan Anda.");
      return;
    }
    setIsFeedbackSubmitted(true);
  };

  const handleResetFeedback = () => {
    setFeedbackRating(0);
    setFeedbackCategory(null);
    setFeedbackMessage("");
    setFeedbackEmail("");
    setIsFeedbackSubmitted(false);
    setSubView(null);
  };

  const selectedArticle = articles.find(a => a.id === selectedArticleId);

  return (
    <div className="min-h-screen bg-[#050a10] flex justify-center items-center py-0 sm:py-6 px-0 sm:px-4">
      {/* Container simulating a phone screen on desktop, or flexible responsive layout */}
      <div className="w-full max-w-md bg-background h-[100dvh] sm:h-[880px] sm:rounded-3xl sm:border sm:border-white/10 shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* TOP BAR / HEADER */}
        <header className="absolute top-0 left-0 w-full z-40 h-16 bg-background/50 backdrop-blur-lg border-b border-white/5 flex justify-between items-center px-5">
          <div className="flex items-center gap-3">
            {subView ? (
              <button
                onClick={() => {
                  setSubView(null);
                  if (activeTab === 'kabar' && subView === 'kabar-detail') {
                    setSelectedArticleId(null);
                  }
                }}
                className="p-1 -ml-1 text-on-surface hover:text-secondary transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            ) : (
              <ShieldCheck className="w-7 h-7 text-secondary fill-secondary/10" />
            )}
            
            <h1 className="font-sans text-xl font-bold tracking-tight text-on-background">
              {subView === 'notifications' && "Notifikasi"}
              {subView === 'feedback' && "Kirim Masukan"}
              {subView === 'panduan-hoax' && "Panduan Cek Hoax"}
              {subView === 'panduan-sosmed' && "Panduan Media Sosial"}
              {subView === 'kabar-detail' && "Kabar Detail"}
              {!subView && (
                <>
                  JagaIN
                  {activeTab === 'ai' && (
                    <span className="text-secondary font-semibold text-base ml-2 border-l border-white/20 pl-2">Tanya AI</span>
                  )}
                </>
              )}
            </h1>
          </div>

          <div className="flex items-center">
            {subView !== 'notifications' && (
              <button
                onClick={() => setSubView('notifications')}
                className="p-2 relative hover:opacity-80 transition-opacity active:scale-95 duration-200"
              >
                <Bell className="w-6 h-6 text-on-surface-variant" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-secondary rounded-full ring-2 ring-background animate-pulse" />
                )}
              </button>
            )}
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <main className="flex-1 overflow-y-auto pt-20 pb-24 no-scrollbar">
          <AnimatePresence mode="wait">
            
            {/* SUBVIEWS (MODALS/FULL PAGES OVER TAB MAIN CONTENT) */}
            {subView === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="px-5 space-y-6"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">HARI INI</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllNotificationsRead}
                      className="text-xs font-bold text-secondary hover:underline"
                    >
                      Tandai Semua Dibaca
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        // Mark as read on click
                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isUnread: false } : n));
                      }}
                      className={`glass-card rounded-2xl p-4 flex gap-4 transition-all duration-300 relative ${
                        notif.priority === 'high' ? 'border-error/25 glow-error' : 'hover:bg-white/5'
                      }`}
                    >
                      {notif.isUnread && (
                        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-secondary" />
                      )}
                      
                      <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center ${
                        notif.type === 'security' ? 'bg-error/10 border border-error/20 text-error' :
                        notif.type === 'news' ? 'bg-primary/10 border border-primary/20 text-primary' :
                        notif.type === 'hoax' ? 'bg-secondary/15 border border-secondary/20 text-secondary' :
                        'bg-on-surface-variant/10 border border-on-surface-variant/20 text-on-surface-variant'
                      }`}>
                        {notif.type === 'security' && <ShieldAlert className="w-6 h-6" />}
                        {notif.type === 'news' && <Newspaper className="w-6 h-6" />}
                        {notif.type === 'hoax' && <AlertTriangle className="w-6 h-6" />}
                        {notif.type === 'system' && <CheckCircle2 className="w-6 h-6" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-semibold text-base text-on-background line-clamp-1">{notif.title}</h4>
                          <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap">{notif.time}</span>
                        </div>
                        <p className="text-sm text-on-surface-variant mt-1 leading-snug">{notif.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Decorative scanning animation inside notifications to highlight live engine status */}
                <div className="pt-8 flex justify-center opacity-30 pointer-events-none">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-dashed border-secondary/40 animate-[spin_15s_linear_infinite]"></div>
                    <div className="absolute inset-3 rounded-full border border-primary/20 animate-pulse"></div>
                    <ShieldCheck className="w-10 h-10 text-secondary" />
                  </div>
                </div>
              </motion.div>
            )}

            {subView === 'feedback' && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="px-5"
              >
                {!isFeedbackSubmitted ? (
                  <form onSubmit={handleSubmitFeedback} className="space-y-6">
                    {/* Hero Banner */}
                    <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-28 h-28 bg-secondary/10 rounded-full blur-2xl"></div>
                      <h3 className="font-bold text-lg text-secondary mb-1">Suara Anda Penting</h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        Bantu kami meningkatkan JagaIN Shield System dengan memberikan penilaian dan masukan tulus Anda.
                      </p>
                    </div>

                    {/* Star Rating Section */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold tracking-widest text-on-surface-variant uppercase block">TINGKAT KEPUASAN</label>
                      <div className="glass-card rounded-xl p-4 flex justify-between items-center">
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((starValue) => (
                            <button
                              type="button"
                              key={starValue}
                              onClick={() => setFeedbackRating(starValue)}
                              className="focus:outline-none transition-transform hover:scale-110 active:scale-95 duration-150"
                            >
                              <Star className={`w-8 h-8 ${
                                feedbackRating >= starValue ? 'text-secondary fill-secondary' : 'text-on-surface-variant/30'
                              }`} />
                            </button>
                          ))}
                        </div>
                        {feedbackRating > 0 && (
                          <span className="text-secondary font-bold text-xs tracking-wider animate-pulse">
                            {["BURUK", "KURANG", "CUKUP", "BAIK", "MEMUASKAN"][feedbackRating - 1]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Category Selector Chips */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold tracking-widest text-on-surface-variant uppercase block">KATEGORI MASUKAN</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'Masalah Teknis', icon: Construction },
                          { key: 'Saran Fitur', icon: Lightbulb },
                          { key: 'Konten Berita', icon: Newspaper },
                          { key: 'Lainnya', icon: MoreHorizontal }
                        ].map((cat) => {
                          const IconComp = cat.icon;
                          const isSelected = feedbackCategory === cat.key;
                          return (
                            <button
                              type="button"
                              key={cat.key}
                              onClick={() => setFeedbackCategory(cat.key as any)}
                              className={`glass-card rounded-xl py-3.5 px-4 text-left border transition-all flex items-center gap-2.5 ${
                                isSelected ? 'border-secondary bg-secondary/10' : 'border-white/5 hover:border-white/20'
                              }`}
                            >
                              <IconComp className={`w-5 h-5 ${isSelected ? 'text-secondary' : 'text-on-surface-variant'}`} />
                              <span className="text-sm font-semibold">{cat.key}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Message detail */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold tracking-widest text-on-surface-variant uppercase block">DETAIL MASUKAN</label>
                      <div className="relative">
                        <textarea
                          value={feedbackMessage}
                          onChange={(e) => setFeedbackMessage(e.target.value.slice(0, 500))}
                          className="w-full min-h-[140px] bg-surface-container-low border border-white/5 rounded-2xl p-4 text-on-surface text-sm focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none placeholder:text-white/20 resize-none leading-relaxed"
                          placeholder="Tuliskan pengalaman atau saran Anda di sini..."
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-on-surface-variant/40 font-mono">
                          {feedbackMessage.length}/500
                        </div>
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold tracking-widest text-on-surface-variant uppercase block">EMAIL (OPSIONAL)</label>
                      <div className="glass-card rounded-2xl flex items-center px-4 focus-within:border-secondary transition-all">
                        <Mail className="w-5 h-5 text-white/20 mr-3" />
                        <input
                          type="email"
                          value={feedbackEmail}
                          onChange={(e) => setFeedbackEmail(e.target.value)}
                          className="w-full bg-transparent border-none py-4 text-sm text-on-surface focus:ring-0 outline-none placeholder:text-white/20"
                          placeholder="name@example.com"
                        />
                      </div>
                      <p className="text-[11px] text-white/30 italic">Kami hanya menghubungi jika diperlukan klarifikasi lanjutan.</p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full bg-secondary hover:bg-secondary/90 text-background py-4 rounded-2xl font-bold text-base flex justify-center items-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,212,170,0.25)]"
                    >
                      <Send className="w-5 h-5 fill-background" />
                      Kirim Masukan
                    </button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-12 space-y-6"
                  >
                    <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full border-2 border-secondary animate-ping opacity-25"></div>
                      <CheckCircle2 className="w-14 h-14 text-secondary fill-secondary/10" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-bold text-2xl text-on-background">Berhasil Terkirim!</h3>
                      <p className="text-on-surface-variant text-base max-w-[280px] mx-auto leading-relaxed">
                        Terima kasih atas partisipasi Anda dalam menjaga ekosistem digital JagaIN.
                      </p>
                    </div>

                    <button
                      onClick={handleResetFeedback}
                      className="glass-card px-8 py-3 rounded-full text-secondary font-bold hover:bg-secondary/5 transition-all active:scale-95 duration-150 border border-secondary/35"
                    >
                      Kembali ke Beranda
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {subView === 'panduan-hoax' && (
              <motion.div
                key="panduan-hoax"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="px-5 space-y-8"
              >
                {/* Hero Section */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-20 h-20 mb-5 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-secondary/10 blur-xl"></div>
                    <div className="w-full h-full rounded-full bg-surface-container border border-secondary/30 flex items-center justify-center glow-secondary">
                      <ShieldCheck className="w-10 h-10 text-secondary" />
                    </div>
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-on-background">Cara Cek Berita Hoax dengan AI</h3>
                  <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">
                    Lindungi diri dari disinformasi. JagaIN AI akan memindai dan memvalidasi setiap teks atau tautan yang Anda temukan secara seketika.
                  </p>
                </div>

                {/* Timeline Grid */}
                <div className="relative">
                  <div className="absolute left-[23px] top-6 bottom-12 w-[2px] bg-gradient-to-b from-secondary/50 via-outline-variant/30 to-transparent"></div>
                  
                  {[
                    { step: 1, title: "Salin Tautan atau Teks", icon: Copy, desc: "Temukan pesan, broadcast, atau berita mencurigakan. Blok lalu salin (copy) teks tersebut dari browser atau chat WhatsApp Anda." },
                    { step: 2, title: "Buka Menu Hoax", icon: ShieldAlert, desc: "Kembali ke aplikasi JagaIN dan pilih tab khusus 'Hoax' pada navigasi bar di bagian bawah." },
                    { step: 3, title: "Tempel dan Analisis", icon: FileText, desc: "Tempelkan (paste) konten pada kolom input yang disediakan, lalu tekan tombol 'ANALISIS' untuk memicu verifikasi AI." },
                    { step: 4, title: "Pahami Hasil AI", icon: Sparkles, desc: "Tinjau skor kepercayaan dan rincian penjelasan yang diberikan oleh AI untuk mengambil keputusan yang aman." }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.step} className="relative z-10 flex gap-4 mb-6">
                        <div className="w-12 h-12 shrink-0 rounded-full bg-surface-container border border-secondary/20 flex items-center justify-center glow-secondary text-secondary font-bold text-base">
                          {item.step}
                        </div>
                        <div className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-1 h-full bg-surface-variant group-hover:bg-secondary transition-colors duration-300"></div>
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-4.5 h-4.5 text-on-surface-variant" />
                            <h4 className="font-semibold text-base text-on-background">{item.title}</h4>
                          </div>
                          <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubView(null);
                      setActiveTab('hoax');
                    }}
                    className="w-full bg-secondary hover:bg-secondary/90 text-background rounded-2xl py-4 font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all glow-secondary"
                  >
                    <ShieldCheck className="w-5 h-5 fill-background" />
                    Coba Cek Sekarang
                  </button>
                </div>
              </motion.div>
            )}

            {subView === 'panduan-sosmed' && (
              <motion.div
                key="panduan-sosmed"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="px-5 space-y-6"
              >
                {/* Hero Banner */}
                <div className="glass-card rounded-2xl overflow-hidden relative border border-white/5">
                  <div className="h-32 w-full relative">
                    <img
                      className="w-full h-full object-cover opacity-50"
                      referrerPolicy="no-referrer"
                      alt="Cybersecurity concept illustration"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT1iC5bIB3Tjy-vx-O5Cle-7wtbkYV3pu5YyH3YwDwgNgxcqCzeHyuKgZIGDDHpZhN27ExGAGYoBInF2atZxBIp6TQXmumIK-In7O_Ym8GV9RrNEb2iNJBpN3ylyPCyyotn6h_9oQyEwJvl3Ik0mWBxUgmArHkreulLEGnUMgUydMn93QcWYrE6hJE_WvY8yIc-W95j4Uu2yOyvomBtjNFmbWXzfJtpiM11zxDlr4J3R1SqJMk9JqTOHo9EiUECUQ74Y3eIEE4r8VR"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a141e] via-transparent to-transparent"></div>
                  </div>
                  <div className="p-4 -mt-6 relative z-10">
                    <h3 className="font-bold text-lg text-on-background mb-1">Panduan Keamanan Media Sosial</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Langkah-langkah esensial untuk melindungi data pribadi dan mencegah pengambilalihan akun Anda dari ancaman siber.
                    </p>
                  </div>
                </div>

                {/* Tips Section */}
                <div className="space-y-4">
                  {[
                    { title: "Aktifkan 2FA", icon: Lock, border: "border-secondary/20 font-bold glow-secondary text-secondary", desc: "Gunakan Autentikasi Dua Faktor (2FA) sebagai lapis keamanan ganda. Aplikasi autentikator seperti Google Authenticator sangat disarankan dibanding verifikasi SMS." },
                    { title: "Cek Privasi Akun", icon: User, border: "border-primary/20 text-primary", desc: "Tinjau pengaturan privasi secara berkala. Pastikan hanya teman tepercaya yang dapat melihat informasi pribadi, postingan, dan daftar kontak Anda." },
                    { title: "Gunakan Kata Sandi Kuat", icon: ShieldAlert, border: "border-tertiary/20 text-tertiary", desc: "Buat kata sandi unik untuk setiap akun dengan kombinasi huruf besar-kecil, angka, dan simbol. Lebih baik gunakan bantuan Password Manager." },
                    { title: "Waspada Aplikasi Pihak Ketiga", icon: MoreHorizontal, border: "border-error/20 text-error", desc: "Periksa dan cabut akses aplikasi pihak ketiga yang tidak lagi digunakan atau mencurigakan di bagian pengaturan integrasi akun media sosial Anda." }
                  ].map((tip, idx) => {
                    const IconComp = tip.icon;
                    return (
                      <div key={idx} className="glass-card p-5 rounded-2xl flex flex-col gap-3 relative overflow-hidden">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-surface-container flex items-center justify-center border ${tip.border}`}>
                            <IconComp className="w-5 h-5" />
                          </div>
                          <h4 className="font-bold text-base text-on-background">{tip.title}</h4>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">{tip.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {subView === 'kabar-detail' && selectedArticle && (
              <motion.div
                key="kabar-detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Hero section */}
                <div className="relative w-full h-64 overflow-hidden bg-surface-container border-b border-white/5">
                  <img
                    className="w-full h-full object-cover opacity-60"
                    referrerPolicy="no-referrer"
                    alt={selectedArticle.title}
                    src={selectedArticle.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBT1iC5bIB3Tjy-vx-O5Cle-7wtbkYV3pu5YyH3YwDwgNgxcqCzeHyuKgZIGDDHpZhN27ExGAGYoBInF2atZxBIp6TQXmumIK-In7O_Ym8GV9RrNEb2iNJBpN3ylyPCyyotn6h_9oQyEwJvl3Ik0mWBxUgmArHkreulLEGnUMgUydMn93QcWYrE6hJE_WvY8yIc-W95j4Uu2yOyvomBtjNFmbWXzfJtpiM11zxDlr4J3R1SqJMk9JqTOHo9EiUECU74Y3eIEE4r8VR"}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "https://lh3.googleusercontent.com/aida-public/AB6AXuBT1iC5bIB3Tjy-vx-O5Cle-7wtbkYV3pu5YyH3YwDwgNgxcqCzeHyuKgZIGDDHpZhN27ExGAGYoBInF2atZxBIp6TQXmumIK-In7O_Ym8GV9RrNEb2iNJBpN3ylyPCyyotn6h_9oQyEwJvl3Ik0mWBxUgmArHkreulLEGnUMgUydMn93QcWYrE6hJE_WvY8yIc-W95j4Uu2yOyvomBtjNFmbWXzfJtpiM11zxDlr4J3R1SqJMk9JqTOHo9EiUECU74Y3eIEE4r8VR";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                  <div className="absolute bottom-4 left-5 right-5">
                    <span className="bg-secondary/20 text-secondary border border-secondary/35 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase inline-block mb-2">
                      {selectedArticle.category}
                    </span>
                    <h3 className="font-bold text-lg text-on-background leading-snug">
                      {selectedArticle.title}
                    </h3>
                  </div>
                </div>

                {/* Metadata */}
                <div className="px-5 flex items-center gap-3 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-secondary" /> {selectedArticle.source}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {selectedArticle.date}
                  </span>
                </div>

                {/* Content Paragraphs */}
                <div className="px-5 space-y-4 text-sm text-on-surface-variant leading-relaxed">
                  {Array.isArray(selectedArticle.content) ? (
                    selectedArticle.content.map((p, index) => (
                      <p key={index}>{p}</p>
                    ))
                  ) : typeof selectedArticle.content === "string" ? (
                    <p>{selectedArticle.content}</p>
                  ) : (
                    <p>Konten berita tidak tersedia.</p>
                  )}
                  <a 
                    href={selectedArticle.linkUrl || "https://govcsirt.bssn.go.id"} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-block mt-2 text-secondary font-bold hover:underline flex items-center gap-1 text-sm bg-white/5 py-2.5 px-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <span>🔗 Baca Selengkapnya di Portal Resmi {selectedArticle.source}</span>
                  </a>
                </div>

                {/* Interactive AI Verification Card inside Article */}
                <div className="px-5 pt-4">
                  <div className="glass-card p-5 rounded-2xl border-secondary/30 relative overflow-hidden">
                    <div className="absolute -right-5 -top-5 opacity-10">
                      <ShieldCheck className="w-24 h-24 text-secondary" />
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-secondary font-bold text-sm mb-1.5 flex items-center gap-2">
                        <Sparkles className="w-4.5 h-4.5" />
                        Validasi Cerdas AI
                      </h4>
                      <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                        Pastikan kebenaran berita ini. AI kami akan memindai isi berita untuk mengukur skor kredibilitas instan.
                      </p>
                      <button
                        onClick={() => {
                          setHoaxInput(selectedArticle.title);
                          setActiveTab('hoax');
                          setSubView(null);
                        }}
                        className="w-full bg-secondary hover:bg-secondary/90 text-background font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-sm shadow-[0_0_15px_rgba(0,212,170,0.2)]"
                      >
                        <ShieldAlert className="w-4.5 h-4.5 fill-background" />
                        Verifikasi Berita Ini dengan AI
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* MAIN NAVIGATION TABS */}
            {!subView && activeTab === 'kabar' && (
              <motion.div
                key="tab-kabar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-5 space-y-6 animate-fade-in"
              >
                {/* Section Title */}
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-on-background">Kabar Keamanan</h2>
                  <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                    Tetap waspada dengan berita terhangat dan edukasi keamanan siber terpercaya.
                  </p>
                </div>

                {/* Edukasi & Panduan Section (Screens 7 & 8 integration) */}
                <div className="space-y-3">
                  <span className="text-xs font-bold tracking-widest text-on-surface-variant uppercase block">PANDUAN UTAMA</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSubView('panduan-hoax')}
                      className="glass-card rounded-2xl p-4 text-left border border-white/5 hover:border-secondary/30 transition-all flex flex-col justify-between h-28 group"
                    >
                      <ShieldCheck className="w-8 h-8 text-secondary group-hover:scale-110 transition-transform" />
                      <div>
                        <h4 className="font-bold text-xs text-on-background leading-snug">Panduan Cek Hoax</h4>
                        <p className="text-[10px] text-on-surface-variant mt-1">4 langkah mudah</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setSubView('panduan-sosmed')}
                      className="glass-card rounded-2xl p-4 text-left border border-white/5 hover:border-secondary/30 transition-all flex flex-col justify-between h-28 group"
                    >
                      <Lock className="w-8 h-8 text-secondary group-hover:scale-110 transition-transform" />
                      <div>
                        <h4 className="font-bold text-xs text-on-background leading-snug">Keamanan Sosmed</h4>
                        <p className="text-[10px] text-on-surface-variant mt-1">Lindungi akun Anda</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* News feed */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">BERITA TERBARU (LIVE RSS)</span>
                    {isRssLoading && (
                      <span className="text-[10px] text-secondary flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-ping"></span>
                        Sinkronisasi...
                      </span>
                    )}
                  </div>

                  {isRssLoading && articles.length === 0 ? (
                    // Skeleton Loader for RSS Articles
                    [1, 2].map((idx) => (
                      <div key={idx} className="glass-card rounded-2xl overflow-hidden animate-pulse flex flex-col border border-white/5">
                        <div className="h-40 w-full bg-white/5"></div>
                        <div className="p-4 space-y-3">
                          <div className="h-4 bg-white/10 rounded w-5/6"></div>
                          <div className="h-4 bg-white/10 rounded w-1/2"></div>
                          <div className="flex justify-between">
                            <div className="h-3 bg-white/10 rounded w-12"></div>
                            <div className="h-3 bg-white/10 rounded w-16"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    Array.isArray(articles) && articles.map((article) => (
                      <div
                        key={article.id}
                        onClick={() => {
                          setSelectedArticleId(article.id);
                          setSubView('kabar-detail');
                        }}
                        className="glass-card rounded-2xl overflow-hidden cursor-pointer hover:border-white/10 hover:shadow-lg transition-all flex flex-col group border border-white/5 hover:border-secondary/20"
                      >
                        <div className="h-40 w-full relative bg-surface-container overflow-hidden">
                          <img
                            className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                            alt={article.title}
                            src={article.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBT1iC5bIB3Tjy-vx-O5Cle-7wtbkYV3pu5YyH3YwDwgNgxcqCzeHyuKgZIGDDHpZhN27ExGAGYoBInF2atZxBIp6TQXmumIK-In7O_Ym8GV9RrNEb2iNJBpN3ylyPCyyotn6h_9oQyEwJvl3Ik0mWBxUgmArHkreulLEGnUMgUydMn93QcWYrE6hJE_WvY8yIc-W95j4Uu2yOyvomBtjNFmbWXzfJtpiM11zxDlr4J3R1SqJMk9JqTOHo9EiUECU74Y3eIEE4r8VR"}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "https://lh3.googleusercontent.com/aida-public/AB6AXuBT1iC5bIB3Tjy-vx-O5Cle-7wtbkYV3pu5YyH3YwDwgNgxcqCzeHyuKgZIGDDHpZhN27ExGAGYoBInF2atZxBIp6TQXmumIK-In7O_Ym8GV9RrNEb2iNJBpN3ylyPCyyotn6h_9oQyEwJvl3Ik0mWBxUgmArHkreulLEGnUMgUydMn93QcWYrE6hJE_WvY8yIc-W95j4Uu2yOyvomBtjNFmbWXzfJtpiM11zxDlr4J3R1SqJMk9JqTOHo9EiUECU74Y3eIEE4r8VR";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent"></div>
                          <span className="absolute top-4 left-4 bg-secondary text-background font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
                            {article.category}
                          </span>
                          <span className="absolute bottom-4 right-4 text-[10px] bg-background/80 text-secondary border border-secondary/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                            <ExternalLink className="w-2.5 h-2.5" /> RSS Feed
                          </span>
                        </div>
                        <div className="p-4 space-y-2">
                          <h4 className="font-bold text-sm text-on-background line-clamp-2 leading-snug group-hover:text-secondary transition-colors">
                            {article.title}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1 border-t border-white/5">
                            <span className="font-semibold text-secondary">{article.source}</span>
                            <span>{article.date}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Feedback Suggestion Banner (Screen 6 integration) */}
                <div
                  onClick={() => setSubView('feedback')}
                  className="glass-card rounded-2xl p-4 border border-secondary/20 hover:border-secondary/50 cursor-pointer transition-all flex items-center justify-between relative overflow-hidden group"
                >
                  <div className="absolute -right-5 -bottom-5 w-20 h-20 bg-secondary/5 rounded-full blur-xl group-hover:bg-secondary/10 transition-colors"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-secondary">
                      <Star className="w-5 h-5 fill-secondary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-on-background">Kirim Masukan Anda</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">Bantu tingkatkan sistem JagaIN</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            )}

            {!subView && activeTab === 'hoax' && (
              <motion.div
                key="tab-hoax"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-5 space-y-6"
              >
                {/* Page Title Section */}
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-on-background flex items-center gap-2">
                    <ShieldAlert className="w-7 h-7 text-secondary" /> Cek Hoax
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                    Periksa kebenaran teks berita atau pesan berantai menggunakan AI verifikator kami.
                  </p>
                </div>

                {/* Input Area */}
                <div className="space-y-4">
                  <div className="glass-card rounded-2xl p-4 transition-all duration-300 focus-within:ring-2 focus-within:ring-secondary/20">
                    <textarea
                      value={hoaxInput}
                      onChange={(e) => setHoaxInput(e.target.value)}
                      className="w-full h-44 bg-transparent border-none focus:ring-0 text-sm text-on-surface placeholder:text-on-surface-variant/40 resize-none outline-none leading-relaxed"
                      placeholder="Paste teks berita di sini..."
                    />
                    
                    {hoaxInput && (
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => setHoaxInput("")}
                          className="text-xs text-on-surface-variant/60 hover:text-secondary"
                        >
                          Hapus Teks
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleAnalyzeHoax}
                    disabled={isHoaxLoading}
                    className="w-full bg-secondary text-background font-bold text-xs tracking-widest py-4 rounded-2xl flex justify-center items-center gap-2 glow-secondary active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isHoaxLoading ? (
                      <span className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Activity className="w-4.5 h-4.5" />
                        ANALISIS SEKARANG
                      </>
                    )}
                  </button>
                </div>

                {/* Recent Checks (Visual Depth) */}
                <section className="pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold tracking-widest text-secondary-fixed uppercase">CEK TERAKHIR</h3>
                    {hoaxHistory.length > 0 && (
                      <button onClick={handleClearHistory} className="text-[10px] text-on-surface-variant hover:text-secondary flex items-center gap-1">
                        <History className="w-3 h-3" /> Bersihkan
                      </button>
                    )}
                  </div>
                  
                  {hoaxHistory.length > 0 ? (
                    <div className="space-y-3">
                      {hoaxHistory.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => setHoaxInput(item.text)}
                          className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${item.isHoax ? 'bg-error' : 'bg-secondary'}`} />
                            <p className="text-xs text-on-surface truncate pr-2 leading-none">{item.text}</p>
                          </div>
                          <span className="text-[9px] text-on-surface-variant/60 whitespace-nowrap">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-on-surface-variant/40">Belum ada riwayat pengecekan.</div>
                  )}
                </section>
              </motion.div>
            )}

            {!subView && activeTab === 'link' && (
              <motion.div
                key="tab-link"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-5 space-y-6"
              >
                {/* Title & Subtitle */}
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-on-background flex items-center gap-2">
                    <Link2 className="w-7 h-7 text-secondary" /> Jaga Link
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                    Periksa keamanan link atau tautan mencurigakan sebelum Anda klik.
                  </p>
                </div>

                {/* Form Input URL */}
                <div className="glass-card p-5 rounded-2xl flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold tracking-widest text-on-surface-variant uppercase" htmlFor="url-input">
                      Masukkan URL
                    </label>
                    <div className="relative group">
                      <input
                        id="url-input"
                        type="text"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        className="w-full bg-surface-container-low border border-surface-container-high rounded-xl py-4 pl-4 pr-12 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all text-on-surface placeholder:opacity-45"
                        placeholder="https://secure-bank-login.com..."
                      />
                      <Link2 className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-5 h-5 group-focus-within:text-secondary" />
                    </div>
                  </div>

                  <button
                    onClick={() => handleCheckLink()}
                    disabled={isLinkLoading}
                    className="w-full bg-secondary text-background py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,212,170,0.15)] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isLinkLoading ? (
                      <span className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Link2 className="w-4.5 h-4.5" />
                        🔗 Periksa Link
                      </>
                    )}
                  </button>
                </div>

                {/* Scan Results Card if available */}
                {linkResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-5 rounded-2xl relative overflow-hidden"
                  >
                    <div className="absolute -right-4 -top-4 opacity-10">
                      <ShieldCheck className="w-28 h-28 text-secondary" />
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                        linkResult.isSafe ? 'bg-secondary/15 text-secondary border-secondary/35' : 'bg-error/15 text-error border-error/35'
                      }`}>
                        {linkResult.isSafe ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg ${linkResult.isSafe ? 'text-secondary' : 'text-error'}`}>
                          {linkResult.isSafe ? "✅ AMAN" : "❌ BAHAYA"}
                        </h3>
                        <p className="text-[10px] font-bold text-on-surface-variant tracking-wider uppercase">
                          Terverifikasi oleh JagaIN Engine
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">{linkResult.explanation}</p>

                    <div className="flex flex-col gap-2.5">
                      {[
                        { label: "Domain terdaftar", status: linkResult.registered },
                        { label: "SSL valid", status: linkResult.sslValid },
                        { label: "Tidak di blacklist", status: linkResult.notBlacklisted }
                      ].map((chk, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-highest/40">
                          <span className="text-xs font-semibold">{chk.label}</span>
                          {chk.status ? (
                            <Check className="w-4.5 h-4.5 text-secondary" />
                          ) : (
                            <span className="text-[10px] font-bold text-error uppercase">Gagal</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Search History */}
                <section className="space-y-3">
                  <h3 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">RIWAYAT PENCARIAN</h3>
                  <div className="space-y-3">
                    {linkHistory.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setLinkInput(item.url);
                          handleCheckLink(item.url);
                        }}
                        className="glass-card p-4 rounded-xl flex items-center justify-between border-l-4 border-l-secondary cursor-pointer hover:bg-white/5 transition-all"
                        style={{ borderLeftColor: item.isSafe ? "#00D4AA" : "#ff4757" }}
                      >
                        <div className="flex items-center gap-3 overflow-hidden pr-2">
                          <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
                            {item.isSafe ? <ShieldCheck className="w-4.5 h-4.5 text-secondary" /> : <AlertTriangle className="w-4.5 h-4.5 text-error" />}
                          </div>
                          <div className="truncate">
                            <p className="font-semibold text-sm truncate">{item.url}</p>
                            <p className="text-[10px] text-on-surface-variant/60">{item.time}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold shrink-0">{item.isSafe ? "✅" : "❌"}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* DATABASE REAL-TIME JAGAIN */}
                <section className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-secondary animate-pulse" /> DATABASE LIVE ANCAMAN
                      </h3>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">Real-time threat intelligence oleh komunitas.</p>
                    </div>
                    <span className="text-[10px] bg-secondary/10 border border-secondary/20 text-secondary px-2.5 py-0.5 rounded-full font-bold">
                      {dangerousLinks.length} Tautan
                    </span>
                  </div>

                  {isDbLoading && dangerousLinks.length === 0 ? (
                    <div className="text-center py-4 text-xs text-on-surface-variant/50">Memuat database ancaman...</div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                      {dangerousLinks.map((item) => (
                        <div
                          key={item.id}
                          className="glass-card p-4 rounded-xl border border-error/15 bg-error/5 flex flex-col gap-2 relative overflow-hidden"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <span className="bg-error/20 text-error border border-error/35 font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">
                                {item.category}
                              </span>
                              <p className="font-mono text-sm text-on-background mt-1.5 truncate font-bold text-error break-all">
                                {item.url}
                              </p>
                            </div>
                            
                            {/* Vote/Verify button */}
                            <button
                              onClick={() => handleVoteLink(item.url)}
                              className="bg-white/5 hover:bg-white/10 text-[10px] font-bold text-on-surface px-2.5 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all border border-white/10 shrink-0"
                              title="Konfirmasi bahwa link ini berbahaya"
                            >
                              👍 <span className="text-secondary font-bold">{item.votes}</span>
                            </button>
                          </div>

                          <p className="text-[11px] text-on-surface-variant leading-relaxed">
                            {item.reason}
                          </p>

                          <div className="text-[9px] text-on-surface-variant/50 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> Dilaporkan pada {item.reportedAt}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* LAPORKAN TAUTAN BARU FORM */}
                <section className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-secondary" /> LAPORKAN TAUTAN PENIPUAN
                  </h3>
                  
                  <div className="glass-card p-4 rounded-xl border border-white/5 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant/80 uppercase">URL Tautan Penipuan</label>
                      <input
                        type="text"
                        value={reportUrlInput}
                        onChange={(e) => setReportUrlInput(e.target.value)}
                        placeholder="contoh: kuota-gratis-2026.xyz"
                        className="w-full bg-surface-container-low border border-white/5 rounded-lg p-2.5 text-xs text-on-surface focus:border-secondary outline-none transition-all placeholder:opacity-30"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-on-surface-variant/80 uppercase">Kategori</label>
                        <select
                          value={reportCategoryInput}
                          onChange={(e) => setReportCategoryInput(e.target.value)}
                          className="w-full bg-surface-container-low border border-white/5 rounded-lg p-2.5 text-xs text-on-surface outline-none focus:border-secondary transition-all"
                        >
                          <option value="Phishing Perbankan">Phishing Perbankan</option>
                          <option value="Penipuan Berhadiah">Penipuan Berhadiah</option>
                          <option value="Phishing Media Sosial">Phishing Media Sosial</option>
                          <option value="Bantuan Sosial Palsu">Bantuan Sosial Palsu</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-on-surface-variant/80 uppercase">Alasan Singkat</label>
                        <input
                          type="text"
                          value={reportReasonInput}
                          onChange={(e) => setReportReasonInput(e.target.value)}
                          placeholder="Mengapa link ini berbahaya?"
                          className="w-full bg-surface-container-low border border-white/5 rounded-lg p-2.5 text-xs text-on-surface focus:border-secondary outline-none transition-all placeholder:opacity-30"
                        />
                      </div>
                    </div>

                    {reportSuccessMsg && (
                      <p className="text-[11px] font-bold text-secondary bg-secondary/10 border border-secondary/20 p-2 rounded-lg">
                        {reportSuccessMsg}
                      </p>
                    )}

                    <button
                      onClick={handleReportLink}
                      disabled={isReportSubmitting}
                      className="w-full bg-surface-container-high hover:bg-secondary hover:text-background text-on-surface py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      {isReportSubmitting ? (
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5" /> Laporkan Tautan
                        </>
                      )}
                    </button>
                  </div>
                </section>
              </motion.div>
            )}

            {!subView && activeTab === 'ai' && (
              <motion.div
                key="tab-ai"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col pt-1 bg-[#0a141e]/50"
              >
                {/* Welcome Message Panel */}
                <div className="flex flex-col items-center text-center px-5 mb-4 mt-2">
                  <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center mb-2.5 shadow-lg">
                    <Bot className="w-7 h-7 text-secondary" />
                  </div>
                  <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">KEAMANAN DIGITAL REAL-TIME</span>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed max-w-xs">
                    Saya asisten JagaIN. Tanyakan apa saja tentang tips keamanan siber, privasi digital, atau verifikasi link.
                  </p>
                </div>

                {/* Chat Canvas */}
                <div className="flex-1 space-y-4 px-5 pb-36">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${
                        msg.sender === 'user' ? 'bg-secondary/15 text-secondary' : 'bg-primary-container text-on-primary-container'
                      }`}>
                        {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>

                      <div className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                        msg.sender === 'user'
                          ? 'bg-secondary text-background font-medium rounded-br-none border-secondary/20'
                          : 'bg-primary-container text-on-primary-container rounded-bl-none border-white/5'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        
                        {/* Display phishing block alert embedded if provided */}
                        {msg.alert && (
                          <div className="mt-3 p-3 bg-[#0a141e]/70 rounded-xl border border-error/30 text-xs">
                            <div className="flex items-center gap-1.5 text-error font-bold mb-1">
                              <AlertTriangle className="w-4 h-4" />
                              {msg.alert.title}
                            </div>
                            <p className="text-on-surface-variant">{msg.alert.description}</p>
                            <div className="mt-2 text-error font-semibold uppercase">{msg.alert.action}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* AI Typing Indicator */}
                  {isAiTyping && (
                    <div className="flex items-start gap-3 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-primary-container flex-shrink-0 flex items-center justify-center mt-1">
                        <Bot className="w-4 h-4 text-secondary" />
                      </div>
                      <div className="bg-primary-container text-on-primary-container rounded-2xl rounded-bl-none p-3.5 flex items-center gap-1 border border-white/5">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Suggestions prompt helper */}
                {messages.length < 3 && (
                  <div className="px-5 pb-2 flex flex-col gap-2 absolute bottom-32 left-0 w-full z-10">
                    <span className="text-[10px] font-bold tracking-widest text-on-surface-variant/70 uppercase">PERTANYAAN POPULER</span>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                      {[
                        "Bagaimana cara aktifkan 2FA?",
                        "Apa ciri-ciri link phishing?",
                        "Cara buat kata sandi kuat"
                      ].map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendChat(prompt)}
                          className="glass-card py-2 px-3 rounded-full text-xs font-semibold whitespace-nowrap border border-white/5 hover:border-secondary/30 text-on-surface transition-all flex items-center gap-1"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-secondary" />
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Bar */}
                <div className="absolute bottom-16 left-0 w-full z-40 px-5 pb-4">
                  <div className="glass-card rounded-2xl p-2.5 flex items-center gap-2 shadow-2xl border border-white/10">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-on-surface placeholder:text-white/30 py-2 pl-2 outline-none"
                      placeholder="Tanya JagaIN AI tentang keamanan..."
                    />
                    <button
                      onClick={() => handleSendChat()}
                      className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-background hover:opacity-90 active:scale-90 transition-transform duration-100"
                    >
                      <Send className="w-4.5 h-4.5 fill-background" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* HOAX RESULT SHEET SLIDE-UP MODAL (Screen 1 Slide-up modal) */}
        <AnimatePresence>
          {isHoaxModalOpen && hoaxResult && (
            <div className="absolute inset-0 z-50 flex items-end">
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsHoaxModalOpen(false)}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              />
              
              {/* Modal Content */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="w-full glass-card rounded-t-[32px] p-6 pb-10 z-10 border-t border-white/10 relative overflow-hidden"
              >
                {/* Decorative glow dependent on Hoax state */}
                <div className={`absolute top-0 left-0 w-full h-1.5 ${hoaxResult.isHoax ? 'bg-error' : 'bg-secondary'}`} />
                
                <div className="w-12 h-1.5 bg-surface-container-highest rounded-full mx-auto mb-6"></div>
                
                <div className="flex flex-col items-center text-center">
                  
                  {/* Status Badge */}
                  <div className={`px-5 py-2 border rounded-full mb-5 flex items-center gap-1.5 ${
                    hoaxResult.isHoax 
                      ? 'bg-error/10 border-error/40 text-error'
                      : 'bg-secondary/10 border-secondary/40 text-secondary'
                  }`}>
                    {hoaxResult.isHoax ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span className="text-xs font-bold tracking-widest">{hoaxResult.badge}</span>
                  </div>

                  <h3 className="font-bold text-xl text-on-background mb-3">{hoaxResult.title}</h3>
                  
                  <p className="text-xs text-on-surface-variant leading-relaxed mb-6 max-h-40 overflow-y-auto pr-1">
                    {hoaxResult.explanation}
                  </p>

                  {/* Confidence Level Bar meter */}
                  <div className="w-full bg-surface-container-high rounded-full h-9 relative mb-8 overflow-hidden border border-white/5 flex items-center">
                    <span className="absolute left-4 z-10 text-[10px] font-bold tracking-widest text-background">
                      TINGKAT KEYAKINAN
                    </span>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${hoaxResult.confidence}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full flex justify-end items-center pr-3 ${hoaxResult.isHoax ? 'bg-error' : 'bg-secondary'}`}
                    >
                      <span className="font-bold text-xs text-background">{hoaxResult.confidence}%</span>
                    </motion.div>
                  </div>

                  {/* Actions */}
                  <div className="flex w-full gap-3">
                    <button
                      onClick={() => setIsHoaxModalOpen(false)}
                      className="flex-1 py-4 text-xs font-bold tracking-wider border border-white/10 rounded-2xl hover:bg-white/5 transition-colors text-on-surface"
                    >
                      TUTUP
                    </button>
                    
                    <button
                      onClick={() => {
                        alert("Terima kasih! Laporan Anda telah diteruskan ke kominfo & tim analis JagaIN.");
                        setIsHoaxModalOpen(false);
                      }}
                      className="flex-1 py-4 text-xs font-bold tracking-wider bg-secondary text-background rounded-2xl flex justify-center items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,212,170,0.15)]"
                    >
                      <Share2 className="w-4 h-4 fill-background" />
                      LAPORKAN
                    </button>
                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* BOTTOM NAVIGATION SHELL */}
        <nav className="absolute bottom-0 left-0 w-full z-40 bg-background/50 backdrop-blur-xl border-t border-white/5 flex justify-around items-center h-20 px-2 pb-safe shadow-[0_-4px_30px_rgba(0,0,0,0.4)]">
          {/* Kabar */}
          <button
            onClick={() => {
              setSubView(null);
              setActiveTab('kabar');
            }}
            className={`flex flex-col items-center justify-center pt-1 transition-all w-16 relative ${
              activeTab === 'kabar' && !subView ? 'text-secondary font-semibold' : 'text-on-surface-variant'
            }`}
          >
            <Newspaper className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Kabar</span>
            {activeTab === 'kabar' && !subView && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 bg-secondary rounded-full shadow-[0_0_8px_#00D4AA]" />
            )}
          </button>

          {/* Hoax */}
          <button
            onClick={() => {
              setSubView(null);
              setActiveTab('hoax');
            }}
            className={`flex flex-col items-center justify-center pt-1 transition-all w-16 relative ${
              activeTab === 'hoax' && !subView ? 'text-secondary font-semibold' : 'text-on-surface-variant'
            }`}
          >
            <ShieldAlert className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Hoax</span>
            {activeTab === 'hoax' && !subView && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 bg-secondary rounded-full shadow-[0_0_8px_#00D4AA]" />
            )}
          </button>

          {/* Link */}
          <button
            onClick={() => {
              setSubView(null);
              setActiveTab('link');
            }}
            className={`flex flex-col items-center justify-center pt-1 transition-all w-16 relative ${
              activeTab === 'link' && !subView ? 'text-secondary font-semibold' : 'text-on-surface-variant'
            }`}
          >
            <Link2 className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Link</span>
            {activeTab === 'link' && !subView && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 bg-secondary rounded-full shadow-[0_0_8px_#00D4AA]" />
            )}
          </button>

          {/* AI */}
          <button
            onClick={() => {
              setSubView(null);
              setActiveTab('ai');
            }}
            className={`flex flex-col items-center justify-center pt-1 transition-all w-16 relative ${
              activeTab === 'ai' && !subView ? 'text-secondary font-semibold' : 'text-on-surface-variant'
            }`}
          >
            <Bot className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold tracking-widest uppercase">AI</span>
            {activeTab === 'ai' && !subView && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 bg-secondary rounded-full shadow-[0_0_8px_#00D4AA]" />
            )}
          </button>
        </nav>

      </div>
    </div>
  );
}
