# TechYaka 🗺️
> İstanbul'daki mühendislik öğrencileri için AI destekli kariyer radar uygulaması.

## 🚀 Nedir?
TechYaka, İstanbul'daki staj, hackathon ve tech meetup ilanlarını yapay zeka ile otomatik toplayıp interaktif bir harita üzerinde sunan mobil-first bir web uygulamasıdır.

## ✨ Özellikler
- 🗺️ İnteraktif harita ile lokasyon bazlı ilanlar
- 🤖 Gemini AI ile otomatik ilan toplama ve parsing
- 💫 Tinder-style swipe sistemi
- 🎯 CV bazlı AI uyumluluk skoru
- 💬 Kariyer AI chatbotu
- 🔐 JWT tabanlı kullanıcı sistemi
- ⏰ Gece otomatik scraping (APScheduler)

## 🛠️ Tech Stack
- **Backend:** FastAPI, SQLite, SQLAlchemy, APScheduler
- **AI:** Google Gemini 2.5 Flash
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion
- **Harita:** React Leaflet, OpenStreetMap

## 🏃 Kurulum

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# .env dosyasına GEMINI_API_KEY ekle
python3 -m uvicorn main:app --reload
```

### Frontend
``� Klasör Yapısı
