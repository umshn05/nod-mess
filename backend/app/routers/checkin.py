"""
QR check-in doğrulama endpoint'i.

# MOCK: Gerçek bir kiosk/dolap açma mekanizması yok; QR kodun okutulması,
kullanıcının ekrandaki kodu "taratmasını" simüle eden bu endpoint'in
çağrılmasıyla temsil ediliyor.
"""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db.mongo import get_database
from app.models.common import DeviceStatus, ReservationStatus
from app.models.rental import Rental

router = APIRouter(prefix="/checkin", tags=["checkin"])


class CheckinValidateRequest(BaseModel):
    checkin_token: str


@router.post("/validate", response_model=Rental)
async def validate_checkin(payload: CheckinValidateRequest):
    """Check-in token'ını doğrular, rezervasyonu ACTIVE'e taşır ve bir Rental oluşturur."""
    db = get_database()

    reservation_doc = await db.reservations.find_one({"checkin_token": payload.checkin_token})
    if reservation_doc is None:
        raise HTTPException(status_code=404, detail="Geçersiz QR kod")
    if reservation_doc["status"] != ReservationStatus.CHECKIN_PENDING.value:
        raise HTTPException(status_code=409, detail="Bu rezervasyon check-in için uygun durumda değil")

    now = datetime.now(timezone.utc)
    rental = Rental(
        id=str(uuid.uuid4()),
        reservation_id=reservation_doc["id"],
        device_id=reservation_doc["device_id"],
        start_at=now,
    )

    await db.rentals.insert_one(rental.model_dump())
    await db.reservations.update_one(
        {"id": reservation_doc["id"]}, {"$set": {"status": ReservationStatus.ACTIVE.value}}
    )
    await db.devices.update_one(
        {"id": reservation_doc["device_id"]}, {"$set": {"status": DeviceStatus.CHECKED_OUT.value}}
    )

    return rental
