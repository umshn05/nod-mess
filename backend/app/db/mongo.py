"""
MongoDB bağlantısı (Motor - async driver).

FastAPI uygulama başlarken bir kere bağlantı kurulur, kapanırken kapatılır
(bkz. main.py içindeki lifespan). Diğer modüller `get_database()` ile
bağlı veritabanı nesnesine erişir.
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import settings

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def connect_to_mongo() -> None:
    global _client, _db
    _client = AsyncIOMotorClient(settings.mongodb_uri)
    _db = _client[settings.mongodb_db_name]


def close_mongo_connection() -> None:
    global _client
    if _client is not None:
        _client.close()


def get_database() -> AsyncIOMotorDatabase:
    if _db is None:
        raise RuntimeError("MongoDB bağlantısı henüz kurulmadı (connect_to_mongo() çağrılmalı).")
    return _db
