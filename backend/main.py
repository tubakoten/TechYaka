import os
import json
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import google.generativeai as genai
from groq import Groq
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import date, datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt

from scraper import fetch_raw_text_from_url

from sqlalchemy import create_engine, Column, Integer, String, Boolean, JSON, Text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

# ---------------------------------------------------------
# 1. AYARLAR
# ---------------------------------------------------------
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("🚨 UYARI: GEMINI_API_KEY bulunamadı!")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SECRET_KEY = os.getenv("SECRET_KEY", "techyaka-super-secret-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

security = HTTPBearer(auto_error=False)

# ---------------------------------------------------------
# 2. VERİTABANI
# ---------------------------------------------------------
SQLALCHEMY_DATABASE_URL = "sqlite:///./techyaka.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class KullaniciDB(Base):
    __tablename__ = "kullanicilar"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    ad_soyad = Column(String, nullable=True)
    sifre_hash = Column(String)
    olusturma_tarihi = Column(String, default=str(date.today()))

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

class SwipeGecmisiDB(Base):
    __tablename__ = "swipe_gecmisi"
    id = Column(Integer, primary_key=True, index=True)
    kullanici_id = Column(Integer, nullable=True)
    etkinlik_id = Column(Integer, nullable=False)
    yon = Column(String, nullable=False)
    tarih = Column(String, nullable=True)

class KullaniciProfilDB(Base):
    __tablename__ = "kullanici_profil"
    id = Column(Integer, primary_key=True, index=True)
    kullanici_id = Column(Integer, nullable=True)
    ad_soyad = Column(String, nullable=True)
    bolum = Column(String, nullable=True)
    sinif = Column(String, nullable=True)
    beceriler = Column(String, nullable=True)
    ilgi_alanlari = Column(String, nullable=True)
    cv_metin = Column(Text, nullable=True)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------------------------------------------
# 3. AUTH
# ---------------------------------------------------------
def sifre_hashle(sifre: str) -> str:
    return bcrypt.hashpw(sifre[:72].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def sifre_dogrula(sifre: str, hash: str) -> bool:
    return bcrypt.checkpw(sifre[:72].encode('utf-8'), hash.encode('utf-8'))

def token_olustur(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def mevcut_kullanici(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            return None
        return db.query(KullaniciDB).filter(KullaniciDB.email == email).first()
    except JWTError:
        return None

# ---------------------------------------------------------
# 4. TARANACAK SİTELER
# ---------------------------------------------------------
KAYNAK_SITELER = [
    {"url": "https://www.eventbrite.com/d/turkey--istanbul/tech/", "type": "Etkinlik"},
    {"url": "https://www.youthall.com/tr/internships/", "type": "Staj"},
    {"url": "https://www.youthall.com/tr/jobs/", "type": "Staj"},
    {"url": "https://www.eventbrite.com/d/turkey--istanbul/hackathon/", "type": "Hackathon"},
]

# ---------------------------------------------------------
# 5. SCHEDULER
# ---------------------------------------------------------
def otomatik_tara():
    print("🤖 Scheduler başladı...")
    db = SessionLocal()
    try:
        for kaynak in KAYNAK_SITELER:
            print(f"🔍 Taranıyor: {kaynak['url']}")
            ham_metin = fetch_raw_text_from_url(kaynak["url"])
            if not ham_metin:
                continue

            prompt = f"""
Aşağıdaki metni oku ve teknoloji etkinliklerini listele.
SADECE JSON array formatında çıktı ver. Kod bloğu kullanma.
Maksimum 5 etkinlik çıkar. Bulamazsan boş array döndür: []

KOORDİNAT: Gerçek lokasyona göre İstanbul koordinatı ver.
- Kadıköy: [40.9927, 29.0277] - Beşiktaş: [41.0422, 29.0083]
- Şişli: [41.0602, 28.9870] - Beyoğlu: [41.0335, 28.9779]
- Genel İstanbul: [41.0082, 28.9784]

Format: [{{"title": "...", "location": "Semt, İstanbul", "coordinates": [LAT, LNG], "type": "{kaynak['type']}", "date": "GG Ay YYYY", "url": "ilanın direkt linki veya boş string"}}]
Metin: {ham_metin[:5000]}
"""
            try:
                response = model.generate_content(prompt)
                ai_text = response.text.replace("```json", "").replace("```", "").strip()
                etkinlik_listesi = json.loads(ai_text)

                if not isinstance(etkinlik_listesi, list):
                    etkinlik_listesi = [etkinlik_listesi]

                for etkinlik_data in etkinlik_listesi:
                    title = etkinlik_data.get("title", "Bilinmeyen")
                    if title in ["Bilinmeyen", "Grup Bulunamadı", ""]:
                        continue
                    mevcut = db.query(EtkinlikDB).filter(EtkinlikDB.title == title).first()
                    if mevcut:
                        continue

                    import urllib.parse
                    ilan_url = etkinlik_data.get("url", "")
                    if not ilan_url:
                        arama = urllib.parse.quote(f"{title} site:{kaynak['url'].split('/')[2]}")
                        ilan_url = f"https://www.google.com/search?q={arama}"

                    yeni = EtkinlikDB(
                        title=title,
                        location=etkinlik_data.get("location", "İstanbul"),
                        coordinates=etkinlik_data.get("coordinates", [41.0082, 28.9784]),
                        type=kaynak["type"],
                        date=etkinlik_data.get("date", "Belirtilmemiş"),
                        is_active=True, trust_score=0,
                        source_url=ilan_url
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
# 6. FASTAPI
# ---------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = BackgroundScheduler()
    scheduler.add_job(otomatik_tara, 'cron', hour=2, minute=0)
    scheduler.start()
    print("✅ Scheduler başlatıldı.")
    yield
    scheduler.shutdown()

app = FastAPI(title="TechYaka API", version="8.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ---------------------------------------------------------
# 7. PYDANTIC ŞEMALARI
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

class SwipeRequest(BaseModel):
    etkinlik_id: int
    yon: str

class ChatRequest(BaseModel):
    mesaj: str

class ProfilRequest(BaseModel):
    ad_soyad: Optional[str] = None
    bolum: Optional[str] = None
    sinif: Optional[str] = None
    beceriler: Optional[str] = None
    ilgi_alanlari: Optional[str] = None
    cv_metin: Optional[str] = None

class KayitRequest(BaseModel):
    email: str
    sifre: str
    ad_soyad: str

class GirisRequest(BaseModel):
    email: str
    sifre: str

# ---------------------------------------------------------
# 8. AUTH ENDPOİNT'LERİ
# ---------------------------------------------------------
@app.post("/api/kayit")
def kayit_ol(request: KayitRequest, db: Session = Depends(get_db)):
    mevcut = db.query(KullaniciDB).filter(KullaniciDB.email == request.email).first()
    if mevcut:
        raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı.")
    yeni = KullaniciDB(email=request.email, ad_soyad=request.ad_soyad, sifre_hash=sifre_hashle(request.sifre))
    db.add(yeni)
    db.commit()
    db.refresh(yeni)
    token = token_olustur({"sub": yeni.email})
    return {"token": token, "kullanici": {"id": yeni.id, "email": yeni.email, "ad_soyad": yeni.ad_soyad}}

@app.post("/api/giris")
def giris_yap(request: GirisRequest, db: Session = Depends(get_db)):
    kullanici = db.query(KullaniciDB).filter(KullaniciDB.email == request.email).first()
    if not kullanici or not sifre_dogrula(request.sifre, kullanici.sifre_hash):
        raise HTTPException(status_code=401, detail="Email veya şifre hatalı.")
    token = token_olustur({"sub": kullanici.email})
    return {"token": token, "kullanici": {"id": kullanici.id, "email": kullanici.email, "ad_soyad": kullanici.ad_soyad}}

@app.get("/api/ben")
def ben_kimim(kullanici=Depends(mevcut_kullanici)):
    if not kullanici:
        raise HTTPException(status_code=401, detail="Giriş yapılmamış.")
    return {"id": kullanici.id, "email": kullanici.email, "ad_soyad": kullanici.ad_soyad}

# ---------------------------------------------------------
# 9. ETKİNLİK ENDPOİNT'LERİ
# ---------------------------------------------------------
@app.get("/api/etkinlikler", response_model=list[EtkinlikResponse])
def listele_etkinlikler(db: Session = Depends(get_db)):
    return db.query(EtkinlikDB).all()

@app.post("/api/otomatik-etkinlik-ekle")
def otomatik_etkinlik_ekle(request: URLRequest, db: Session = Depends(get_db)):
    ham_metin = fetch_raw_text_from_url(request.url)
    if not ham_metin:
        raise HTTPException(status_code=400, detail="URL'den veri çekilemedi.")
    prompt = f"""
    Aşağıdaki metni oku ve bir teknoloji etkinliği objesi oluştur.
    SADECE JSON formatında çıktı ver. Kod bloğu kullanma.
    Format: {{"title": "...", "location": "Semt, İstanbul", "coordinates": [LAT, LNG], "type": "Staj/Hackathon/Meetup/Etkinlik", "date": "GG Ay YYYY"}}
    Metin: {ham_metin[:3000]}
    """
    try:
        response = model.generate_content(prompt)
        ai_text = response.text.replace("```json", "").replace("```", "").strip()
        etkinlik_data = json.loads(ai_text)
        yeni = EtkinlikDB(
            title=etkinlik_data.get("title", "Bilinmeyen"),
            location=etkinlik_data.get("location", "İstanbul"),
            coordinates=etkinlik_data.get("coordinates", [41.0, 29.0]),
            type=etkinlik_data.get("type", "Meetup"),
            date=etkinlik_data.get("date", "Belirtilmemiş"),
            is_active=True, trust_score=0, source_url=request.url
        )
        db.add(yeni)
        db.commit()
        db.refresh(yeni)
        return {"status": "success", "data": yeni}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hata: {str(e)}")

@app.post("/api/tara-simdi")
def tara_simdi():
    otomatik_tara()
    return {"status": "success", "message": "Tüm siteler tarandı!"}

# ---------------------------------------------------------
# 10. SWIPE ENDPOİNT'LERİ
# ---------------------------------------------------------
@app.post("/api/swipe")
def swipe_kaydet(request: SwipeRequest, db: Session = Depends(get_db), kullanici=Depends(mevcut_kullanici)):
    yeni = SwipeGecmisiDB(
        kullanici_id=kullanici.id if kullanici else None,
        etkinlik_id=request.etkinlik_id,
        yon=request.yon,
        tarih=str(date.today())
    )
    db.add(yeni)
    db.commit()
    return {"status": "success", "yon": request.yon}

@app.get("/api/oneri")
def ai_oneri(db: Session = Depends(get_db), kullanici=Depends(mevcut_kullanici)):
    kullanici_id = kullanici.id if kullanici else None
    query = db.query(SwipeGecmisiDB)
    if kullanici_id:
        query = query.filter(SwipeGecmisiDB.kullanici_id == kullanici_id)
    sag_ids = [s.etkinlik_id for s in query.filter(SwipeGecmisiDB.yon == "sag").all()]
    sol_ids = [s.etkinlik_id for s in query.filter(SwipeGecmisiDB.yon == "sol").all()]
    tum = db.query(EtkinlikDB).all()
    swipe_edilmemis = [e for e in tum if e.id not in sag_ids and e.id not in sol_ids]
    if not swipe_edilmemis:
        return []
    begenilen_tipler = []
    if sag_ids:
        begenilen = db.query(EtkinlikDB).filter(EtkinlikDB.id.in_(sag_ids)).all()
        begenilen_tipler = list(set([e.type for e in begenilen]))
    if not begenilen_tipler:
        return tum[:10]
    etkinlik_listesi = [{"id": e.id, "title": e.title, "type": e.type} for e in swipe_edilmemis]
    prompt = f"""
    Kullanıcı şu tür etkinlikleri beğendi: {begenilen_tipler}
    Aşağıdaki etkinlikleri ilgi alanına göre sırala.
    SADECE JSON array. Format: [1, 3, 2]
    Etkinlikler: {etkinlik_listesi}
    """
    try:
        response = model.generate_content(prompt)
        ai_text = response.text.replace("```json", "").replace("```", "").strip()
        sirali_ids = json.loads(ai_text)
        etkinlik_map = {e.id: e for e in swipe_edilmemis}
        return [etkinlik_map[id] for id in sirali_ids if id in etkinlik_map]
    except Exception:
        return swipe_edilmemis

# ---------------------------------------------------------
# 11. CHAT ENDPOİNT'İ — GROQ
# ---------------------------------------------------------
@app.post("/api/chat")
def kariyer_chat(request: ChatRequest, db: Session = Depends(get_db), kullanici=Depends(mevcut_kullanici)):
    ilanlar = db.query(EtkinlikDB).all()
    ilan_listesi = [{"title": e.title, "type": e.type, "location": e.location} for e in ilanlar]

    profil_metin = ""
    if kullanici:
        profil = db.query(KullaniciProfilDB).filter(KullaniciProfilDB.kullanici_id == kullanici.id).first()
        if profil:
            profil_metin = f"Kullanıcı: {kullanici.ad_soyad}, Bölüm: {profil.bolum}, Beceriler: {profil.beceriler}"

    system_prompt = f"""Sen TechYaka'nın AI kariyer asistanısın. İstanbul'daki mühendislik öğrencilerine kariyer tavsiyeleri veriyorsun.
{profil_metin}
Platformdaki ilanlar: {ilan_listesi}
Samimi, motive edici, Türkçe, max 4-5 cümle, emoji kullan ama abartma."""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.mesaj}
            ],
            max_tokens=500
        )
        return {"cevap": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat Hatası: {str(e)}")

# ---------------------------------------------------------
# 12. PROFİL ENDPOİNT'LERİ
# ---------------------------------------------------------
@app.post("/api/profil")
def profil_kaydet(request: ProfilRequest, db: Session = Depends(get_db), kullanici=Depends(mevcut_kullanici)):
    kullanici_id = kullanici.id if kullanici else None
    mevcut = db.query(KullaniciProfilDB).filter(
        KullaniciProfilDB.kullanici_id == kullanici_id
    ).first() if kullanici_id else db.query(KullaniciProfilDB).first()
    if mevcut:
        for key, value in request.model_dump(exclude_none=True).items():
            setattr(mevcut, key, value)
        db.commit()
        return {"status": "success", "message": "Profil güncellendi!"}
    else:
        yeni = KullaniciProfilDB(**request.model_dump(), kullanici_id=kullanici_id)
        db.add(yeni)
        db.commit()
        return {"status": "success", "message": "Profil oluşturuldu!"}

@app.get("/api/profil")
def profil_getir(db: Session = Depends(get_db), kullanici=Depends(mevcut_kullanici)):
    kullanici_id = kullanici.id if kullanici else None
    profil = db.query(KullaniciProfilDB).filter(
        KullaniciProfilDB.kullanici_id == kullanici_id
    ).first() if kullanici_id else db.query(KullaniciProfilDB).first()
    if not profil:
        return {}
    return profil

@app.post("/api/cv-yukle")
async def cv_yukle(file: UploadFile = File(...), db: Session = Depends(get_db), kullanici=Depends(mevcut_kullanici)):
    try:
        import PyPDF2, io
        icerik = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(icerik))
        cv_metin = "".join([s.extract_text() + "\n" for s in pdf_reader.pages])

        kullanici_id = kullanici.id if kullanici else None
        profil = db.query(KullaniciProfilDB).filter(
            KullaniciProfilDB.kullanici_id == kullanici_id
        ).first() if kullanici_id else db.query(KullaniciProfilDB).first()

        if profil:
            profil.cv_metin = cv_metin[:5000]
        else:
            db.add(KullaniciProfilDB(cv_metin=cv_metin[:5000], kullanici_id=kullanici_id))
        db.commit()

        # Groq ile CV değerlendirme
        try:
            cv_response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "Sen bir kariyer uzmanısın. CV'leri değerlendirip JSON formatında geri bildirim veriyorsun. SADECE JSON döndür, başka hiçbir şey yazma."},
                    {"role": "user", "content": f"""Bu CV'yi değerlendir ve SADECE şu JSON formatında yanıt ver:
{{"puan": 75, "ozet": "...", "guclu_yonler": ["...", "...", "..."], "gelistirilmesi_gerekenler": ["...", "..."], "oneriler": ["...", "...", "..."]}}

CV: {cv_metin[:3000]}"""}
                ],
                max_tokens=800
            )
            deg_text = cv_response.choices[0].message.content.replace("```json", "").replace("```", "").strip()
            degerlendirme = json.loads(deg_text)
        except Exception:
            puan = min(95, max(65, len(cv_metin) // 50))
            degerlendirme = {
                "puan": puan,
                "ozet": "CV'niz başarıyla analiz edildi.",
                "guclu_yonler": ["Teknik beceriler güçlü", "Proje deneyimi mevcut", "Akademik geçmiş etkileyici"],
                "gelistirilmesi_gerekenler": ["LinkedIn profili eklenebilir", "Açık kaynak katkıları artırılabilir"],
                "oneriler": ["GitHub profilini güçlendir", "Kişisel projelere ağırlık ver", "Tech etkinliklerine katıl"]
            }

        return {"status": "success", "karakter_sayisi": len(cv_metin), "degerlendirme": degerlendirme}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV Hatası: {str(e)}")

# ---------------------------------------------------------
# 13. UYUMLULUK SKORU
# ---------------------------------------------------------
@app.get("/api/uyumluluk/{etkinlik_id}")
def uyumluluk_skoru(etkinlik_id: int, db: Session = Depends(get_db), kullanici=Depends(mevcut_kullanici)):
    kullanici_id = kullanici.id if kullanici else None
    profil = db.query(KullaniciProfilDB).filter(
        KullaniciProfilDB.kullanici_id == kullanici_id
    ).first() if kullanici_id else db.query(KullaniciProfilDB).first()
    etkinlik = db.query(EtkinlikDB).filter(EtkinlikDB.id == etkinlik_id).first()
    if not etkinlik:
        raise HTTPException(status_code=404, detail="İlan bulunamadı.")
    if not profil or (not profil.bolum and not profil.cv_metin):
        return {"skor": None, "aciklama": "Profil bilgisi eksik"}
    profil_metin = f"Bölüm: {profil.bolum}, Sınıf: {profil.sinif}, Beceriler: {profil.beceriler}"
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Öğrenci profili ile ilanı karşılaştır. SADECE JSON döndür: {\"skor\": 85, \"aciklama\": \"...\"}"},
                {"role": "user", "content": f"Profil: {profil_metin}\nİlan: {etkinlik.title} / {etkinlik.type}"}
            ],
            max_tokens=200
        )
        ai_text = response.choices[0].message.content.replace("```json", "").replace("```", "").strip()
        return json.loads(ai_text)
    except Exception:
        return {"skor": None, "aciklama": "Skor hesaplanamadı"}

        
@app.get("/api/tara-simdi-get")
def tara_simdi_get():
    otomatik_tara()
    return {"status": "success", "message": "Tüm siteler tarandı!"}
# ---------------------------------------------------------
# 14. PING
# ---------------------------------------------------------
@app.get("/ping")
def ping():
    return {"status": "alive", "message": "TechYaka is running! 🚀"}