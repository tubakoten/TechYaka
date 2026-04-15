# 🚀 TechYaka - Product Requirement Document (PRD)

**"İstanbul'un mühendislik rotası: İki yaka, tek platform."**

## 📌 Proje Özeti
**Proje Kodu:** TY-IST-2026  
**Vizyon:** İstanbul’daki teknik üniversite öğrencilerinin kariyer fırsatlarını (staj, hackathon, meetup) şehir lojistiğiyle birleştirerek, "gürültüden arındırılmış" canlı bir teknoloji haritası üzerinden sunmak.

---

## 1. Stratejik Vizyon ve Konumlandırma
TechYaka, sadece bir ilan toplama sitesi değil; İstanbul'un iki yakasında koşturan mühendis adayları için bir **mobil kariyer asistanıdır.** * **Kuzey Yıldızı Metriği (North Star):** Harita üzerinden "Başvur" butonuna tıklanma oranı (CTR).
* **Temel Değer Önerisi:** %100 AI-Kürate edilmiş veri, lokasyon bazlı filtreleme ve topluluk doğrulaması.

---

## 2. Kullanıcı Hikayeleri (User Stories)

| ID | Kullanıcı Hikayesi | Kabul Kriterleri (AC) |
| :--- | :--- | :--- |
| **US.01** | Bir öğrenci olarak, etkinlikleri İstanbul haritası üzerinde yaka bazlı görmek istiyorum. | Harita ikonları kategoriye göre ayrışmalı ve yaka seçimi (Avrupa/Anadolu) yapılabilmelidir. |
| **US.02** | Bir kullanıcı olarak, başvuru bitimine 24 saatten az kalanları kırmızı sayaçla görmek istiyorum. | "Aciliyet" algoritması son 24 saatte görsel uyarı (red pulse) vermelidir. |
| **US.03** | Bir kullanıcı olarak, resmi başvuru formuna tek tıkla gitmek istiyorum. | `Deep Link` yapısı ile uygulama içi tarayıcıda doğrudan başvuru sayfası açılmalıdır. |

---

## 3. Fonksiyonel Gereksinimler (Deep Dive)

### 3.1. AI Veri Hattı (The AI Pipeline)
* **Veri Toplama:** LinkedIn, Meetup ve kariyer sayfalarından FastAPI tabanlı scraper'lar ile ham veri çekilir.
* **Gemini Entegrasyonu:** Ham metin Gemini API'ye gönderilerek; `başlık`, `şirket`, `koordinat`, `son_tarih` ve `yaka` (Avrupa/Anadolu) bilgileri parse edilir.
* **Veri Onayı:** AI tarafından üretilen veriler, admin panelinde "Taslak" olarak bekler; doğrulandıktan sonra haritaya düşer.

### 3.2. Kullanıcı Etkileşimi (Community Pulse)
* **Onay Mekanizması:** Kullanıcılar "İlan hala güncel mi?" sorusuna Evet/Hayır cevabı verebilir.
* **Doğruluk Skoru:** Çok sayıda "Hayır" alan ilanlar otomatik olarak incelemeye alınır ve haritada şeffaf (low opacity) görünür.

---

## 4. Teknik Mimari (Tech Stack)

* **Frontend:** Vite + React + TypeScript + TailwindCSS.
* **Harita Kütüphanesi:** React Leaflet (OpenStreetMap tabanlı).
* **Backend:** FastAPI (Python 3.12+).
* **Database:** PostgreSQL + PostGIS (Coğrafi sorgular için).
* **AI Engine:** Google Gemini API.
* **Deployment:** Vercel (Frontend) & Railway (Backend).

---

## 5. Yol Haritası (Roadmap)
* **Faz 1 (MVP):** Scraper + Gemini API + Temel Harita Görünümü.
* **Faz 2 (Engage):** Takvime ekleme, kategori filtreleri ve push bildirimleri.
* **Faz 3 (Scale):** Şirket panelleri ve "Yaka bazlı" yetenek analiz raporları.

---

> *Bu döküman TechYaka projesinin teknik anayasasıdır. Her sprint bu dökümana sadık kalarak planlanır.*