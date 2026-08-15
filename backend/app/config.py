"""
Uygulama ayarları.

Bağlantı bilgileri (MongoDB URI, CORS origin vb.) .env dosyasından okunur.
Böylece hassas bilgiler (kullanıcı adı/şifre) koda gömülmez.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "nodmess"
    frontend_origin: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


# Ayarları tek bir yerden import edip kullanabilmek için hazır bir örnek (singleton)
settings = Settings()
