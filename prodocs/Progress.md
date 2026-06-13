# TechYaka — Geliştirme Günlüğü

## Tamamlanan İşler

### Backend
- FastAPI + SQLite + SQLAlchemy kurulumu
- Gemini 2.5 Flash entegrasyonu
- Web scraper (BeautifulSoup4)
- APScheduler ile gece 02:00 otomatik tarama
- JWT auth sistemi (kayıt/giriş/token)
- Swipe geçmişi kaydı
- AI öneri motoru (swipe bazlı)
- CV PDF yükleme + metin çıkarma
- AI uyumluluk skoru endpoint
- Kariyer chatbotu endpoint
- PyTest test katmanı (3/3 geçti)

### Frontend
- React + Vite + Tailwind kurulumu
- React Leaflet harita entegrasyonu
- Renk kodlu dinamik pin sistemi
- Tinder-style swipe (Framer Motion)
- Floating AI chatbot
- Profil + CV yükleme formu
- Uyumluluk rozeti
- JWT auth ekranı (giriş/kayıt)
- Vitest test katmanı (2/2 geçti)

## Aşılan Teknik Engeller
- Gemini API key sızıntısı → .gitignore + yeni proje
- `CONSUMER_SUSPENDED` hatası → yeni Google Cloud projesi
- SQLite şema uyumsuzluğu → ALTER TABLE migration
- bcrypt/passlib versiyonu → direkt bcrypt kütüphanesi
- f-string içi dict hatası → liste önceden oluşturuldu

## Alınan Kararlar
- LinkedIn scraping → bot koruması nedeniyle atlandı
- SQLite → MVP için yeterli, V2'de PostgreSQL
- Gemini AI parser → regex yerine daha esnek
