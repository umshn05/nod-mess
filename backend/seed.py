"""
Veritabanını örnek (demo) verilerle doldurmak için seed script.

Çalıştırmak için:
    python seed.py

Var olan locations/devices koleksiyonlarını temizleyip yeniden oluşturur.
"""
import asyncio
import uuid

from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings

# Demo amaçlı 5 lokasyon (İstanbul'dan gerçekçi koordinatlar)
LOCATIONS = [
    {
        "name": "Kanyon AVM Otoparkı",
        "type": "avm",
        "lat": 41.0779,
        "lng": 29.0102,
        "address": "Büyükdere Cad. No:185, Levent, İstanbul",
        "working_hours": "10:00-22:00",
        "status": "active",
    },
    {
        "name": "İstinye Park Otoparkı",
        "type": "avm",
        "lat": 41.1097,
        "lng": 29.0278,
        "address": "İstinye Bayırı Cad. No:73, Sarıyer, İstanbul",
        "working_hours": "10:00-22:00",
        "status": "active",
    },
    {
        "name": "Zorlu Center Otoparkı",
        "type": "avm",
        "lat": 41.0670,
        "lng": 29.0173,
        "address": "Levazım, Koru Sk. No:2, Beşiktaş, İstanbul",
        "working_hours": "09:00-23:00",
        "status": "active",
    },
    {
        "name": "Beşiktaş Sahil Otoparkı",
        "type": "otopark",
        "lat": 41.0422,
        "lng": 29.0061,
        "address": "Sahil Yolu Cad., Beşiktaş, İstanbul",
        "working_hours": "00:00-23:59",
        "status": "active",
    },
    {
        "name": "Kadıköy Meydan Otoparkı",
        "type": "otopark",
        "lat": 40.9905,
        "lng": 29.0244,
        "address": "Söğütlüçeşme Cad., Kadıköy, İstanbul",
        "working_hours": "07:00-01:00",
        "status": "active",
    },
    {
        "name": "Amasya Merkez Otoparkı",
        "type": "otopark",
        "lat": 40.6499,
        "lng": 35.8353,
        "address": "Atatürk Cad., Merkez, Amasya",
        "working_hours": "07:00-23:00",
        "status": "active",
    },
    # Aşağıdaki lokasyonlar, Türkiye'nin farklı coğrafi bölgelerini temsil eder;
    # demo hangi şehirden açılırsa açılsın yakında bir sonuç çıksın diye eklendi.
    {
        "name": "Kocaeli İzmit Merkez Otoparkı",
        "type": "otopark",
        "lat": 40.7654,
        "lng": 29.9408,
        "address": "Cumhuriyet Cad., İzmit, Kocaeli",
        "working_hours": "07:00-23:00",
        "status": "active",
    },
    {
        "name": "İzmir Alsancak Otoparkı",
        "type": "otopark",
        "lat": 38.4237,
        "lng": 27.1428,
        "address": "Kıbrıs Şehitleri Cad., Alsancak, İzmir",
        "working_hours": "07:00-24:00",
        "status": "active",
    },
    {
        "name": "Antalya Konyaaltı Otoparkı",
        "type": "otopark",
        "lat": 36.8563,
        "lng": 30.6624,
        "address": "Atatürk Bulvarı, Konyaaltı, Antalya",
        "working_hours": "08:00-24:00",
        "status": "active",
    },
    {
        "name": "Ankara Kızılay AVM Otoparkı",
        "type": "avm",
        "lat": 39.9208,
        "lng": 32.8541,
        "address": "Atatürk Bulvarı, Kızılay, Ankara",
        "working_hours": "10:00-22:00",
        "status": "active",
    },
    {
        "name": "Erzurum Merkez Otoparkı",
        "type": "otopark",
        "lat": 39.9000,
        "lng": 41.2700,
        "address": "Cumhuriyet Cad., Yakutiye, Erzurum",
        "working_hours": "07:00-23:00",
        "status": "active",
    },
    {
        "name": "Diyarbakır Merkez Otoparkı",
        "type": "otopark",
        "lat": 37.9144,
        "lng": 40.2306,
        "address": "Gazi Cad., Sur, Diyarbakır",
        "working_hours": "07:00-23:00",
        "status": "active",
    },
]

# Her lokasyona eklenecek cihaz şablonları (2-3 adet/lokasyon)
DEVICE_TEMPLATES = [
    {
        "model": "NOD PowerBank EV-7",
        "power_class": "7kW",
        "connector_type": "Type 2",
        "status": "available",
        "hourly_fee": 45.0,
        "daily_fee": 350.0,
        "deposit": 500.0,
    },
    {
        "model": "NOD PowerBank EV-22",
        "power_class": "22kW",
        "connector_type": "Type 2",
        "status": "available",
        "hourly_fee": 75.0,
        "daily_fee": 550.0,
        "deposit": 750.0,
    },
    {
        "model": "NOD PowerBank EV-50 Fast",
        "power_class": "50kW",
        "connector_type": "CCS",
        "status": "available",
        "hourly_fee": 120.0,
        "daily_fee": 850.0,
        "deposit": 1000.0,
    },
]


async def seed():
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.mongodb_db_name]

    # Önce mevcut verileri temizle (tekrar tekrar çalıştırılabilir olsun diye)
    await db.locations.delete_many({})
    await db.devices.delete_many({})

    for i, location_data in enumerate(LOCATIONS):
        location_id = str(uuid.uuid4())
        await db.locations.insert_one({"id": location_id, **location_data})

        # Her lokasyona 2 veya 3 cihaz ata (dönüşümlü olarak)
        device_count = 2 if i % 2 == 0 else 3
        for template in DEVICE_TEMPLATES[:device_count]:
            device_id = str(uuid.uuid4())
            await db.devices.insert_one({
                "id": device_id,
                "location_id": location_id,
                **template,
            })

    print(f"{len(LOCATIONS)} lokasyon ve ilgili cihazlar başarıyla eklendi.")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
