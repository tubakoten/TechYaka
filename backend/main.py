import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# Swagger ekranını daha havalı gösterecek API başlıkları
app = FastAPI(
    title="TechYaka API", 
    description="AI Destekli Mühendislik Etkinlik Radarı",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

# ---------------------------------------------------------
# VERİ ŞEMALARI (Pydantic) - Hocanın görmek isteyeceği kısım
# ---------------------------------------------------------
class Etkinlik(BaseModel):
    id: int
    title: str = Field(..., description="Etkinliğin tam adı")
    location: str = Field(..., description="Etkinliğin açık adresi veya ilçesi")
    coordinates: list[float] = Field(..., description="[Enlem, Boylam] formatında harita koordinatları")
    type: str = Field(..., description="Hackathon, Meetup, Staj vb.")
    date: str
    is_active: bool = True

# ---------------------------------------------------------
# API ENDPOINT'LERİ
# ---------------------------------------------------------

@app.get("/api/etkinlikler", response_model=list[Etkinlik])
async def listele_etkinlikler():
    """Veritabanı bağlanana kadar kullanılacak statik etkinlik listesi."""
    return [
        {
            "id": 1,
            "title": "AI & Future Hackathon",
            "location": "Beşiktaş, İstanbul",
            "coordinates": [41.0422, 29.0083],
            "type": "Hackathon",
            "date": "2026-06-15",
            "is_active": True
        },
        {
            "id": 2,
            "title": "React Native Bootcamp",
            "location": "Kadıköy, İstanbul",
            "coordinates": [40.9904, 29.0292],
            "type": "Workshop",
            "date": "2026-06-20",
            "is_active": True
        }
    ]

@app.get("/api/etkinlik-uret")
async def uret_etkinlik():
    """Gemini AI kullanarak ham metinden yapılandırılmış JSON üretir."""
    try:
        ham_metin = "Önümüzdeki Cumartesi Beşiktaş'ta harika bir React workshop'ı var. Katılım ücretsiz, kayıt olmayı unutmayın!"
        
        prompt = f"""
        Aşağıdaki metni oku ve bir etkinlik objesi oluştur. 
        Eğer tarih veya konum belirsizse mantıklı tahminler yürüt.
        Format: {{ "title": "...", "location": "...", "coordinates": [lat, lng], "type": "Workshop/Meetup/Staj" }}
        Metin: {ham_metin}
        """
        
        response = model.generate_content(prompt)
        return {"status": "success", "data": response.text}
        
    except Exception as e:
        # AI çökme ihtimaline karşı hata yakalama mekanizması
        raise HTTPException(status_code=500, detail=f"AI Veri İşleme Hatası: {str(e)}")