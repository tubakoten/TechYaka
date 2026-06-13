# TechYaka — Tech Stack ve AI Kullanımı

## Backend
- **FastAPI (Python):** Hızlı API geliştirme, otomatik dokümantasyon
- **SQLite + SQLAlchemy:** MVP için lightweight veritabanı
- **APScheduler:** Her gece 02:00'de otomatik scraping
- **JWT (python-jose) + bcrypt:** Güvenli kullanıcı auth

## AI Entegrasyonu
- **Google Gemini 2.5 Flash:** 3 farklı amaçla kullanıldı:
  1. **İlan Parser:** Ham HTML metnini → yapılandırılmış JSON'a dönüştürür
  2. **Uyumluluk Skoru:** Kullanıcı CV'si + profili ile ilan eşleşmesini 0-100 skorlar
  3. **Kariyer Chatbotu:** Anlık kariyer soruları için conversational AI

## Frontend
- **React + Vite:** Modern, hızlı frontend
- **Tailwind CSS:** Dark mode-first tasarım sistemi
- **Framer Motion:** Swipe animasyonları
- **React Leaflet:** OpenStreetMap entegrasyonu

## Scraping
- **BeautifulSoup4 + Requests:** Ham HTML çekme
- **Gemini AI:** Çekilen metni parse etme (regex yerine AI)

## AI Karar Gerekçeleri
Geleneksel scraping + regex yerine Gemini kullanma kararı:
- Farklı site yapılarına uyum sağlama
- Koordinat çıkarımı (semt adından lat/lng)
- Kategori sınıflandırması
