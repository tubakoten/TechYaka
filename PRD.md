# 🛠️ TechYaka - PRD (Product Requirement Document)

## 1. Teknik Mimari (Tech Stack)
* **Frontend:** Vite + React + TypeScript.
* **Backend:** FastAPI (Python).
* **Database:** PostgreSQL + PostGIS (Coğrafi sorgular için).
* **AI:** Gemini 1.5 Flash API.

## 2. Veri Modeli (Database Schema)
```sql
CREATE TABLE opportunities (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    side ENUM('Avrupa', 'Anadolu'),
    coordinates GEOMETRY(Point, 4326),
    deadline TIMESTAMP,
    category VARCHAR(50)
);