"""
Rental (aktif kiralama) modeli.

Not: Bu modelin endpoint'leri (GET /rentals/{id}/status, POST /rentals/{id}/return)
bir sonraki aşamada eklenecek.
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
