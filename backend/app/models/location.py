"""
Location (lokasyon) modeli: AVM / otopark gibi cihazların bulunduğu noktalar.
"""
from pydantic import BaseModel, Field

from app.models.common import LocationStatus, LocationType


class Location(BaseModel):
    id: str
    name: str
    type: LocationType
    lat: float
    lng: float
    address: str
    working_hours: str
    status: LocationStatus = LocationStatus.ACTIVE


class LocationWithDistance(Location):
    """/locations/nearby yanıtında kullanıcıya olan mesafeyi (km) de döneriz."""
    distance_km: float = Field(..., description="Kullanıcı konumuna kuş uçuşu mesafe (km)")


class LocationAvailability(BaseModel):
    """Bir lokasyondaki cihazların müsaitlik özetini döner."""
    location_id: str
    total_devices: int
    available_devices: int
