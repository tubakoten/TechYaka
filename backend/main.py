from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="TechYaka API")

# İleride veritabanından gelecek olan model yapımız
class Event(BaseModel):
    id: int
    title: str
    location: str
    date: str
    category: str

# Şimdilik Gemini API bağlayana kadar mock (sahte) veriler sunuyoruz
mock_events = [
    {"id": 1, "title": "React JS ile Frontend'e Giriş", "location": "Beşiktaş", "date": "2026-04-25", "category": "Meetup"},
    {"id": 2, "title": "Fintech Hackathon 2026", "location": "Maslak", "date": "2026-05-10", "category": "Hackathon"},
    {"id": 3, "title": "Yapay Zeka ve Veri Bilimi Stajı", "location": "Kadıköy", "date": "2026-06-01", "category": "Staj"}
]

@app.get("/")
def read_root():
    return {"message": "TechYaka Backend API başarıyla çalışıyor!"}

@app.get("/api/etkinlikler", response_model=List[Event])
def get_events():
    """Tüm etkinlikleri döner."""
    return mock_events