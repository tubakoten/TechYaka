# TechYaka 🗺️
> İstanbul'daki mühendislik öğrencileri için AI destekli kariyer radar uygulaması.

**🌐 Canlı Demo:** [tech-yaka.vercel.app](https://tech-yaka.vercel.app)

---

## 🎯 Problem
İstanbul'daki mühendislik öğrencileri staj, hackathon ve tech etkinlik ilanlarını LinkedIn, WhatsApp grupları ve onlarca farklı sitede takip etmek zorunda kalıyor. Bu dağınık yapı fırsatların kaçırılmasına yol açıyor.

## 💡 Çözüm
TechYaka, tüm ilanları yapay zeka ile otomatik toplayıp interaktif bir harita üzerinde sunar. "Bugün yakınımda ne var?" sorusuna tek ekranda cevap verir.

---

## ✨ Özellikler

| Özellik | Açıklama |
|---------|----------|
| 🗺️ İnteraktif Harita | Lokasyon bazlı renkli pin sistemi |
| 🤖 AI İlan Toplama | Gemini ile otomatik scraping ve parsing |
| 💫 Swipe Sistemi | Tinder-style ilan keşfi |
| 🎯 Uyumluluk Skoru | CV bazlı AI eşleşme yüzdesi |
| 💬 Kariyer Chatbote CV puanlama ve analiz |
| 🔐 Auth Sistemi | JWT tabanlı kayıt/giriş |
| ⏰ Otomatik Güncelleme | Gece otomatik ilan taraması |

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** — REST API
- **SQLite + SQLAlchemy** — Veritabanı
- **APScheduler** — Zamanlanmış görevler
- **JWT + bcrypt** — Kimlik doğrulama

### AI & Scraping
- **Google Gemini 2.5 Flash** — İlan parsing, uyumluluk skoru, chatbot, CV değerlendirme
- **BeautifulSoup4** — Web scraping

### Frontend
- **React + Vite** — UI framework
- **Tailwind CSS** — Styling (Dark mode-first)
- **Framer Motion** — Swipe animasyonları
- **React Leaflet** — OpenStreetMap entegrasyonu

---

## 🤖 AI Kullanımı

Gemini 2.5 Flash 4 farklı yerde kullanıldı:

1. **İlan Parser** — Ham HTML → Yapılandırılmış JSON
2. **Uyumluluk Skoru** — CV + Profil × İlan = %85 uyumlu
3. **Kariyer Chatbotu** — Kişiselleştirilmiş kariyer tavsiyeleri
4. **CV Değerlendirici** — 0-100 puan + güçinstall -r requirements.txt
cp .env.example .env
# .env dosyasına GEMINI_API_KEY ekle
python3 -m uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Klasör Yapısı
TechYaka/

├── backend/          # FastAPI backend  

│   ├── main.py       # Ana uygulama

│   ├── scraper.py    # Web scraper

│   └── requirements.txt

├── frontend/         # React frontend

│   └── src/

│       └── App.jsx   # Ana bileşen

├── prodocs/          # Proje dokümanları

│   ├── PRD.md

│   ├── tech-stack.md

│   ├── Plan.md

│   ├── DesignSystem.md

│   └── Progress.md

├── .env.example

└── README.md

---

## 🚀 Deploy

- **Backend:** [Render](https://render.com) — `https://techyaka.onrender.com`
- **Frontend:** [Vercel](https://vercel.com) — `https://tech-yaka.vercel.app`

---

## 👤 Geliştirici

**Tuba Köten** — CPO & Full-Stack Developer  
Doğuş Üniversitesi, Bilgisayar Mühendisliği
