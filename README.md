# TechYaka - Geleceğin Kariyer Haritası 🗺️🚀

TechYaka, teknoloji ekosistemindeki genç yetenekleri doğru fırsatlarla (Hackathon, Meetup, Staj, Zirve) buluşturan, harita odaklı ve akıllı bir kariyer keşif platformudur.

## 📖 Projenin Amacı ve Vizyonu

Günümüzde öğrenciler ve yeni mezunlar; teknoloji etkinliklerini, staj ilanlarını veya hackathonları farklı farklı platformlardan takip etmek zorunda kalıyor. Bu durum hem fırsatların gözden kaçmasına hem de "Hangi etkinlik bana daha uygun?" karmaşasına yol açıyor.

**TechYaka**, bu karmaşayı bitirmek için tasarlandı. Kullanıcılarına sadece liste halinde bir ilan panosu değil, **lokasyon bazlı ve kişiselleştirilmiş bir deneyim** sunar. TechYaka ile:
- Yakınınızdaki teknoloji etkinliklerini harita üzerinde anında keşfedersiniz.
- Sizin seviyenize (Junior, Pro) ve ilgi alanınıza uygun fırsatları filtrelersiniz.
- Başvurularınızı tek bir noktadan yönetir ve kariyer adımlarınızı (Bekliyor, Olumlu, Red) kolayca takip edersiniz.

---

## 🎥 Proje Videosu (Demo)
https://youtu.be/h3Q3QGBW3F8?si=McktJ5vpTImVV6z8


## 📸 Ekran Görüntüleri
*Aşağıdaki görseller uygulamanın güncel arayüzünü temsil etmektedir.*

| Ana Ekran ve Harita |
|<img width="332" height="718" alt="Ekran Resmi 2026-05-06 00 13 38" src="https://github.com/user-attachments/assets/67748c72-c16d-42bd-ae0c-78d774bbb80a" />|<img width="332" height="718" alt="Ekran Resmi 2026-05-06 00 13 52" src="https://github.com/user-attachments/assets/9972a4fd-2af3-4eb2-adae-39bb4f0df100" />|
| *Lokasyon bazlı keşif ve yatay kaydırmalı kartlar.* |

| Başvuru Takibi (Tracking) | Profil ve Tema Ayarları |
|<img width="332" height="718" alt="Ekran Resmi 2026-05-06 00 14 01" src="https://github.com/user-attachments/assets/de692318-a07c-4524-bc6c-4d1bf4d68d16" />|<img width="332" height="718" alt="Ekran Resmi 2026-05-06 00 14 08" src="https://github.com/user-attachments/assets/f0603e4a-5ca4-4b16-ae7c-886f4c5b11e1" />|
| *Gerçek zamanlı başvuru durumu güncellemeleri.* | *Kişiselleştirilmiş ayarlar ve tema geçişi.* |

---

## ✨ Teknik Özellikler (Frontend MVP)

- **Harita Odaklı (Map-First) UX:** Leaflet.js altyapısıyla geliştirilmiş, mobil kullanıcı alışkanlıklarına uygun tam ekran harita deneyimi.
- **🌓 Dinamik Tema (Dark/Light Mode):** Sadece arayüz renklerinin değil, harita katmanlarının da (Voyager <-> Dark Matter) seçilen temaya göre otomatik olarak değiştiği akıllı yapı.
- **📱 Bottom-Sheet Mimarisi:** İlan detaylarının sayfa değiştirmeden, ekranın altından yumuşak bir animasyonla açıldığı native uygulama (SPA) hissi.
- **🔄 State Management & Etkileşim:** 
  - İlanlara özel "Kaydet" (Bookmark) işlevi.
  - Başvuru durumlarını (Bekliyor, Olumlu, Red) anlık olarak değiştirme ve istatistiklere yansıtma.
  - Kategori bazlı (Hackathon, Staj) anlık filtreleme.

---

## 🛠️ Kullanılan Teknolojiler

- **Framework:** React.js (Vite ile oluşturuldu)
- **Stil & Tasarım:** Tailwind CSS
- **Harita & Lokasyon:** React-Leaflet, CartoDB (Tiles)
- **İkonlar:** Özel tasarlanmış SVG Pinler ve Heroicons
- **Durum Yönetimi:** React Hooks (`useState`, `useEffect`)

---

## 💻 Kurulum ve Çalıştırma

Projeyi yerel makinenizde (localhost) çalıştırmak için aşağıdaki adımları izleyebilirsiniz:

1. Depoyu bilgisayarınıza klonlayın:
 ```
 git clone [https://github.com/KULLANICI_ADIN/techyaka.git](https://github.com/KULLANICI_ADIN/techyaka.git)
```
2. Frontend klasörüne gidin:
```
cd techyaka/frontend
```
3. Gerekli bağımlılıkları yükleyin:
```
npm install
```
4. Geliştirme sunucusunu başlatın:
```
npm run dev
```
   
Tarayıcınızda http://localhost:5173 adresine giderek uygulamayı görüntüleyin.
