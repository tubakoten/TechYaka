import os
import json
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai

# Veritabanı için gerekli araçlar
from sqlalchemy import create_engine, Column, Integer, String, Boolean, JSON
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

# ---------------------------------------------------------
# 1. VERİTABANI KURULUMU (SQLite)
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

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------------------------------------------
# 2. FASTAPI VE YAPAY ZEKA KURULUMU
# ---------------------------------------------------------
app = FastAPI(title="TechYaka API", version="2.0.1 (Hardcoded API Key)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🚨 DİKKAT: Anahtarı test için doğrudan buraya yazdık!
genai.configure(api_key="AIzaSyDaY5VVgDMOZM6YKTOzHrcsCqh_TKy-8wY")
model = genai.GenerativeModel('gemini-2.5-flash')

class EtkinlikResponse(BaseModel):
    id: int
    title: str
    location: str
    coordinates: list[float]
    type: str
    date: str
    is_active: bool
    model_config = {"from_attributes": True}

# ---------------------------------------------------------
# 3. API ENDPOINT'LERİ (Otonom Sistem)
# ---------------------------------------------------------

@app.get("/api/etkinlikler", response_model=list[EtkinlikResponse])
def listele_etkinlikler(db: Session = Depends(get_db)):
    """Veritabanındaki tüm etkinlikleri çeker (React Frontend buraya bağlanıyor)."""
    return db.query(EtkinlikDB).all()

@app.get("/api/etkinlik-uret")
def uret_ve_kaydet(db: Session = Depends(get_db)):
    """Gemini AI ile ham metinden veri üretir ve OTOMATİK olarak veritabanına kaydeder."""
    try:
        ham_metin = "Gelecek hafta sonu Levent'te muazzam bir Python Backend Bootcamp var. Herkesi bekleriz. Lokasyon tam Levent Metro çıkışı. Son başvuru: 10 Temmuz 2026."
        
        prompt = f"""
        Aşağıdaki metni oku ve bir etkinlik objesi oluştur.
        ÖNEMLİ KURAL: SADECE JSON formatında çıktı ver. Kod bloğu (```json) kullanma, fazladan tek bir harf bile yazma.
        Format: {{ "title": "...", "location": "...", "coordinates": [41.0825, 29.0131], "type": "Workshop", "date": "..." }}
        Metin: {ham_metin}
        """
        
        # 1. Gemini'ye soruyu sor
        response = model.generate_content(prompt)
        
        # 2. Gemini'den gelen cevabı temizle (Bazen markdown ekleyebiliyor)
        ai_text = response.text.replace("```json", "").replace("```", "").strip()
        
        # 3. Metni gerçek bir JSON (Python Dictionary) objesine çevir
        etkinlik_data = json.loads(ai_text)
        
        # 4. Yapay zekanın ürettiği veriyi DOĞRUDAN SQLite Veritabanına yaz
        yeni_etkinlik = EtkinlikDB(
            title=etkinlik_data["title"],
            location=etkinlik_data["location"],
            coordinates=etkinlik_data["coordinates"],
            type=etkinlik_data["type"],
            date=etkinlik_data["date"],
            is_active=True
        )
        db.add(yeni_etkinlik)
        db.commit()
        db.refresh(yeni_etkinlik)
        
        return {
            "status": "success", 
            "message": "AI veriyi üretti ve başarıyla veritabanına kaydetti!", 
            "data": yeni_etkinlik
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Hatası: {str(e)}")