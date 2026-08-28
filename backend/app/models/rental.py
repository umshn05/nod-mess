"""
Rental (aktif kiralama) modeli.
"""
from datetime import datetime

from pydantic import BaseModel

from app.models.common import RentalStatus


class Rental(BaseModel):
    id: str
    reservation_id: str
    device_id: str
    start_at: datetime
    return_at: datetime | None = None
    status: RentalStatus = RentalStatus.ACTIVE


class RentalStatusResponse(BaseModel):
    """GET /rentals/{id}/status yanıtı: canlı süre/ücret sayacı için."""
    rental_id: str
    device_id: str
    status: RentalStatus
    start_at: datetime
    elapsed_seconds: float
    hourly_fee: float
    current_cost: float


class ReturnReceipt(BaseModel):
    """POST /rentals/{id}/return yanıtı: iade sonrası ücret kırılımı ve sahte makbuz."""
    receipt_id: str
    rental_id: str
    device_id: str
    start_at: datetime
    return_at: datetime
    duration_minutes: float
    hourly_fee: float
    daily_fee: float
    total_amount: float
    deposit_refunded: float
