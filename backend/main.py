import os
import json
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler

from scraper import fetch_raw_text_from_url

from sqlalchemy import create_engine, Column, Integer, String, Boolean, JSON
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

# ---------------------------------------------------------
# 1. GÜVENLİK VE YAPAY ZEKA AYARLARI
# ---------------------------------------------------------
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("🚨 UYARI: GEMINI_API_KEY .env dosyasında bulunamadı!")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

# ---------------------------------------------------------
# 2. VERİTABANI KURULUMU
# ---------------------------------------------------------
SQLALCHEMY_DATABASE_URL = "sqlite:///./techyaka.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class EtkinlikDB(Base):
    __tablename__ = "etkinlikler"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    location = Column(String)
    coordinates = Column(JSON)
    type = Column(String)
    date = Column(String)
    is_active = Column(Boolean, default=True)
    trust_score = Column(Integer, default=0)
    source_url = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------------------------------------------
# 3. TARANACAK SİTELER
# ---------------------------------------------------------
KAYNAK_SITELER = [
    {"url": "https://kommunity.com/events", "type": "Meetup"},
    {"url": "https://www.eventbrite.com/d/turkey--istanbul/tech/", "type": "Etkinlik"},
    {"url": "https://www.youthall.com/tr/internships/", "type": "Staj"},
]

# ---------------------------------------------------------
# 4. SCHEDULER FONKSİYONU
# ---------------------------------------------------------
def otomatik_tara():
    print("🤖 Scheduler başladı — siteler taranıyor...")
    db = SessionLocal()
    try:
        for kaynak in KAYNAK_SITELER:
            print(f"🔍 Taraniyor: {kaynak['url']}")
            ham_metin = fetch_raw_text_from_url(kaynak["url"])

            if not ham_metin:
                print(f"⚠️ Veri çekilemedi: {kaynak['url']}")
                continue

            prompt = prompt = f"""
Aşağıdaki metni oku ve bir teknoloji etkinliği objesi oluştur.
ÖNEMLİ KURAL: SADECE JSON formatında çıktı ver. Kod bloğu (```json) kullanma, fazladan tek bir harf bile yazma.

KOORDİNAT KURALI: Etkinliğin gerçek lokasyonuna göre İstanbul koordinatı ver.
Örnek koordinatlar:
- Kadıköy: [40.9927, 29.0277]
- Beşiktaş: [41.0422, 29.0083]
- Şişli: [41.0602, 28.9870]
- Beyoğlu: [41.0335, 28.9779]
- Üsküdar: [41.0231, 29.0152]
- Ataşehir: [40.9923, 29.1244]
- Maslak: [41.1082, 29.0195]
- Topkapı: [41.0133, 28.9219]
- Genel İstanbul: [41.0082, 28.9784]

Format: {{"title": "...", "location": "Semt, İstanbul", "coordinates": [LAT, LNG], "type": "Staj/Hackathon/Meetup/Etkinlik", "date": "GG Ay YYYY"}}
Metin: {ham_metin[:3000]}
"""
            try:
                response = model.generate_content(prompt)
                ai_text = response.text.replace("```json", "").replace("```", "").strip()
                etkinlik_data = json.loads(ai_text)

                # Aynı URL'den mükerrer kayıt engelle
                mevcut = db.query(EtkinlikDB).filter(EtkinlikDB.source_url == kaynak["url"]).first()
                if mevcut:
                    print(f"⏭️ Zaten var, atlandı: {kaynak['url']}")
                    continue

                yeni = EtkinlikDB(
                    title=etkinlik_data.get("title", "Bilinmeyen Başlık"),
                    location=etkinlik_data.get("location", "İstanbul"),
                    coordinates=etkinlik_data.get("coordinates", [41.0825, 29.0131]),
                    type=kaynak["type"],
                    date=etkinlik_data.get("date", "Belirtilmemiş"),
                    is_active=True,
                    trust_score=0,
                    source_url=kaynak["url"]
                )
                db.add(yeni)
                db.commit()
                print(f"✅ Kaydedildi: {yeni.title}")

            except Exception as e:
                print(f"❌ Hata ({kaynak['url']}): {str(e)}")
                continue
    finally:
        db.close()

# ---------------------------------------------------------
# 5. FASTAPI BAŞLANGIÇ / KAPATMA
# ---------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = BackgroundScheduler()
    scheduler.add_job(otomatik_tara, 'cron', hour=2, minute=0)
    scheduler.start()
    print("✅ Scheduler başlatıldı — her gece 02:00'de çalışacak.")
    yield
    scheduler.shutdown()
    print("🛑 Scheduler durduruldu.")

app = FastAPI(title="TechYaka API", version="5.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# 6. PYDANTIC ŞEMALARI
# ---------------------------------------------------------
class EtkinlikResponse(BaseModel):
    id: int
    title: str
    location: str | None = None
    coordinates: list[float]
    type: str
    date: str | None = None
    is_active: bool
    trust_score: int
    source_url: str | None = None
    model_config = {"from_attributes": True}

class URLRequest(BaseModel):
    url: str

# ---------------------------------------------------------
# 7. ENDPOINT'LER
# ---------------------------------------------------------
@app.get("/api/etkinlikler", response_model=list[EtkinlikResponse])
def listele_etkinlikler(db: Session = Depends(get_db)):
    return db.query(EtkinlikDB).all()

@app.post("/api/otomatik-etkinlik-ekle")
def otomatik_etkinlik_ekle(request: URLRequest, db: Session = Depends(get_db)):
    ham_metin = fetch_raw_text_from_url(request.url)

    if not ham_metin:
        raise HTTPException(status_code=400, detail="URL'den veri çekilemedi.")

    prompt = prompt = f"""
Aşağıdaki metni oku ve bir teknoloji etkinliği objesi oluştur.
ÖNEMLİ KURAL: SADECE JSON formatında çıktı ver. Kod bloğu (```json) kullanma, fazladan tek bir harf bile yazma.

KOORDİNAT KURALI: Etkinliğin gerçek lokasyonuna göre İstanbul koordinatı ver.
Örnek koordinatlar:
- Kadıköy: [40.9927, 29.0277]
- Beşiktaş: [41.0422, 29.0083]
- Şişli: [41.0602, 28.9870]
- Beyoğlu: [41.0335, 28.9779]
- Üsküdar: [41.0231, 29.0152]
- Ataşehir: [40.9923, 29.1244]
- Maslak: [41.1082, 29.0195]
- Topkapı: [41.0133, 28.9219]
- Genel İstanbul: [41.0082, 28.9784]

Format: {{"title": "...", "location": "Semt, İstanbul", "coordinates": [LAT, LNG], "type": "Staj/Hackathon/Meetup/Etkinlik", "date": "GG Ay YYYY"}}
Metin: {ham_metin[:3000]}
"""

    try:
        response = model.generate_content(prompt)
        ai_text = response.text.replace("```json", "").replace("```", "").strip()
        etkinlik_data = json.loads(ai_text)

        yeni_etkinlik = EtkinlikDB(
            title=etkinlik_data.get("title", "Bilinmeyen Başlık"),
            location=etkinlik_data.get("location", "İstanbul"),
            coordinates=etkinlik_data.get("coordinates", [41.0, 29.0]),
            type=etkinlik_data.get("type", "Meetup"),
            date=etkinlik_data.get("date", "Belirtilmemiş"),
            is_active=True,
            trust_score=0,
            source_url=request.url
        )

        db.add(yeni_etkinlik)
        db.commit()
        db.refresh(yeni_etkinlik)

        return {
            "status": "success",
            "message": "AI veriyi başarıyla okudu ve veritabanına kaydetti!",
            "data": yeni_etkinlik
        }

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI İşleme Hatası: Gemini geçerli JSON döndüremedi.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sistem Hatası: {str(e)}")

# ✅ YENİ: Scheduler'ı manuel tetikleme endpoint'i (test için)
@app.post("/api/tara-simdi")
def tara_simdi():
    """Scheduler'ı beklemeden manuel tetikler — test için."""
    otomatik_tara()
    return {"status": "success", "message": "Tüm siteler tarandı!"}