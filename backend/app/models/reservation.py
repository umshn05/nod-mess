"""
Reservation (rezervasyon) modeli.
"""
from datetime import datetime

from pydantic import BaseModel

from app.models.common import ReservationStatus


class TimeWindow(BaseModel):
    start_at: datetime
    end_at: datetime


class PriceSnapshot(BaseModel):
    """Rezervasyon anındaki tarife bilgisinin donmuş (snapshot) hali.

    Cihazın fiyatı ileride değişse bile, bu rezervasyona ait tutarlar
    rezervasyon anındaki değerlerle sabit kalır.
    """
    hourly_fee: float
    daily_fee: float
    deposit: float
    estimated_total: float


class Reservation(BaseModel):
    id: str
    user_id: str
    location_id: str
    device_id: str
    time_window: TimeWindow
    status: ReservationStatus = ReservationStatus.DRAFT
    price_snapshot: PriceSnapshot
    created_at: datetime
    # Ödeme onaylandıktan sonra üretilir; QR kodun içeriği bu token'dır.
    checkin_token: str | None = None


class ReservationCreate(BaseModel):
    """POST /reservations isteğinin gövdesi."""
    user_id: str
    location_id: str
    device_id: str
    time_window: TimeWindow
