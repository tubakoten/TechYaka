import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app, Base, get_db

# Test için ayrı bir in-memory DB kullanıyoruz — asıl DB'ye dokunmuyoruz
TEST_DB_URL = "sqlite:///./test_techyaka.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
Base.metadata.create_all(bind=test_engine)

client = TestClient(app)

# ---------------------------------------------------------
# TEST 1: Etkinlik listesi endpoint'i çalışıyor mu?
# ---------------------------------------------------------
def test_etkinlikleri_listele():
    response = client.get("/api/etkinlikler")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    print("✅ TEST 1 GEÇTI: /api/etkinlikler 200 döndü")

# ---------------------------------------------------------
# TEST 2: Geçersiz URL'de 400 hatası dönüyor mu?
# ---------------------------------------------------------
def test_gecersiz_url_400_doner():
    response = client.post("/api/otomatik-etkinlik-ekle", json={"url": "https://bu-site-kesinlikle-yoktur-12345.com"})
    assert response.status_code == 400
    print("✅ TEST 2 GEÇTI: Geçersiz URL'de 400 döndü")

# ---------------------------------------------------------
# TEST 3: Veritabanına kayıt yazılıyor mu?
# ---------------------------------------------------------
def test_db_kayit():
    db = TestingSessionLocal()
    from main import EtkinlikDB
    yeni = EtkinlikDB(
        title="Test Etkinliği",
        location="Kadıköy, İstanbul",
        coordinates=[40.9927, 29.0277],
        type="Meetup",
        date="01 Temmuz 2026",
        is_active=True,
        trust_score=0,
        source_url="https://test.com"
    )
    db.add(yeni)
    db.commit()
    db.refresh(yeni)

    kayit = db.query(EtkinlikDB).filter(EtkinlikDB.title == "Test Etkinliği").first()
    assert kayit is not None
    assert kayit.location == "Kadıköy, İstanbul"
    assert kayit.type == "Meetup"
    db.close()
    print("✅ TEST 3 GEÇTI: DB'ye kayıt yazıldı ve okundu")