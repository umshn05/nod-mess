"""
Lokasyon (AVM/otopark) ile ilgili endpoint'ler.
"""
from math import atan2, cos, radians, sin, sqrt

from fastapi import APIRouter, HTTPException, Query

from app.db.mongo import get_database
from app.models.common import DeviceStatus
from app.models.device import Device
from app.models.location import Location, LocationAvailability, LocationWithDistance

router = APIRouter(prefix="/locations", tags=["locations"])


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """İki koordinat arasındaki kuş uçuşu mesafeyi kilometre cinsinden hesaplar."""
    R = 6371  # Dünya yarıçapı (km)
    d_lat = radians(lat2 - lat1)
    d_lng = radians(lng2 - lng1)
    a = sin(d_lat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lng / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


@router.get("/nearby", response_model=list[LocationWithDistance])
async def get_nearby_locations(
    lat: float = Query(..., description="Kullanıcının enlemi"),
    lng: float = Query(..., description="Kullanıcının boylamı"),
    radius_km: float = Query(10, description="Arama yarıçapı (km)"),
):
    """Kullanıcının konumuna yakın, belirtilen yarıçap içindeki aktif lokasyonları
    mesafeye göre sıralı şekilde döner."""
    db = get_database()
    cursor = db.locations.find({"status": "active"})
    locations = [Location(**doc) async for doc in cursor]

    result: list[LocationWithDistance] = []
    for loc in locations:
        distance = haversine_km(lat, lng, loc.lat, loc.lng)
        if distance <= radius_km:
            result.append(LocationWithDistance(**loc.model_dump(), distance_km=round(distance, 2)))

    result.sort(key=lambda l: l.distance_km)
    return result


@router.get("/{location_id}", response_model=Location)
async def get_location(location_id: str):
    """Tek bir lokasyonun detayını döner."""
    db = get_database()
    doc = await db.locations.find_one({"id": location_id})
    if doc is None:
        raise HTTPException(status_code=404, detail="Lokasyon bulunamadı")
    return Location(**doc)


@router.get("/{location_id}/availability", response_model=LocationAvailability)
async def get_location_availability(location_id: str):
    """Bir lokasyondaki toplam ve müsait cihaz sayısını döner."""
    db = get_database()
    location_doc = await db.locations.find_one({"id": location_id})
    if location_doc is None:
        raise HTTPException(status_code=404, detail="Lokasyon bulunamadı")

    total_devices = await db.devices.count_documents({"location_id": location_id})
    available_devices = await db.devices.count_documents(
        {"location_id": location_id, "status": DeviceStatus.AVAILABLE.value}
    )

    return LocationAvailability(
        location_id=location_id,
        total_devices=total_devices,
        available_devices=available_devices,
    )


@router.get("/{location_id}/devices", response_model=list[Device])
async def get_location_devices(location_id: str):
    """Bir lokasyondaki tüm cihazları (durumu ne olursa olsun) döner.
    Frontend, müsait olmayanları da gösterip devre dışı bırakarak listeler."""
    db = get_database()
    location_doc = await db.locations.find_one({"id": location_id})
    if location_doc is None:
        raise HTTPException(status_code=404, detail="Lokasyon bulunamadı")

    cursor = db.devices.find({"location_id": location_id})
    return [Device(**doc) async for doc in cursor]
