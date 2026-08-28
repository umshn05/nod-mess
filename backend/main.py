"""
NOD MESS backend giriş noktası.

Çalıştırmak için:
    uvicorn main:app --reload
Swagger arayüzü: http://localhost:8000/docs
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.mongo import close_mongo_connection, connect_to_mongo
from app.routers import checkin, locations, rentals, reservations


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Uygulama ayağa kalkarken MongoDB'ye bağlan
    connect_to_mongo()
    yield
    # Uygulama kapanırken bağlantıyı temiz şekilde kapat
    close_mongo_connection()


app = FastAPI(
    title="NOD MESS API",
    description="Taşınabilir EV şarj cihazı kiralama platformu - demo/MVP backend",
    version="0.1.0",
    lifespan=lifespan,
)

# Frontend (localhost:5173) tarayıcıdan istek atabilsin diye CORS ayarı
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(locations.router)
app.include_router(reservations.router)
app.include_router(checkin.router)
app.include_router(rentals.router)


@app.get("/health", tags=["health"])
async def health_check():
    """Basit sağlık kontrolü - API ayakta mı?"""
    return {"status": "ok"}
