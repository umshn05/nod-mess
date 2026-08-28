"""
Rezervasyon oluşturma ve mock ödeme onayı ile ilgili endpoint'ler.
"""
import math
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.db.mongo import get_database
from app.models.common import DeviceStatus, ReservationStatus
from app.models.reservation import PriceSnapshot, Reservation, ReservationCreate

router = APIRouter(prefix="/reservations", tags=["reservations"])


def calculate_estimated_total(hourly_fee: float, daily_fee: float, start_at: datetime, end_at: datetime) -> float:
    """Seçilen zaman aralığına göre tahmini ücreti hesaplar.

    24 saat ve üzeri süren rezervasyonlarda günlük tarife, altındakilerde
    saatlik tarife (başlanan saat tam ücretlendirilir) kullanılır.
    """
    total_hours = max((end_at - start_at).total_seconds() / 3600, 1)
    if total_hours >= 24:
        return daily_fee * math.ceil(total_hours / 24)
    return hourly_fee * math.ceil(total_hours)


@router.post("", response_model=Reservation)
async def create_reservation(payload: ReservationCreate):
    """Yeni bir rezervasyon oluşturur (DRAFT -> RESERVED) ve cihazı rezerve eder."""
    db = get_database()

    device_doc = await db.devices.find_one({"id": payload.device_id, "location_id": payload.location_id})
    if device_doc is None:
        raise HTTPException(status_code=404, detail="Cihaz bulunamadı")
    if device_doc["status"] != DeviceStatus.AVAILABLE.value:
        raise HTTPException(status_code=409, detail="Cihaz şu anda müsait değil")

    estimated_total = calculate_estimated_total(
        device_doc["hourly_fee"],
        device_doc["daily_fee"],
        payload.time_window.start_at,
        payload.time_window.end_at,
    )

    reservation = Reservation(
        id=str(uuid.uuid4()),
        user_id=payload.user_id,
        location_id=payload.location_id,
        device_id=payload.device_id,
        time_window=payload.time_window,
        status=ReservationStatus.RESERVED,
        price_snapshot=PriceSnapshot(
            hourly_fee=device_doc["hourly_fee"],
            daily_fee=device_doc["daily_fee"],
            deposit=device_doc["deposit"],
            estimated_total=estimated_total,
        ),
        created_at=datetime.now(timezone.utc),
    )

    await db.reservations.insert_one(reservation.model_dump())
    await db.devices.update_one(
        {"id": payload.device_id}, {"$set": {"status": DeviceStatus.RESERVED.value}}
    )

    return reservation


@router.get("/{reservation_id}", response_model=Reservation)
async def get_reservation(reservation_id: str):
    """Bir rezervasyonun güncel durumunu döner."""
    db = get_database()
    doc = await db.reservations.find_one({"id": reservation_id})
    if doc is None:
        raise HTTPException(status_code=404, detail="Rezervasyon bulunamadı")
    return Reservation(**doc)


@router.post("/{reservation_id}/confirm-payment", response_model=Reservation)
async def confirm_payment(reservation_id: str):
    """# MOCK: Gerçek bir ödeme sağlayıcısı entegrasyonu yok, kart tahsilatı
    otomatik olarak başarılı sayılır. Rezervasyonu check-in için hazırlar ve
    QR kodda kullanılacak check-in token'ını üretir."""
    db = get_database()
    doc = await db.reservations.find_one({"id": reservation_id})
    if doc is None:
        raise HTTPException(status_code=404, detail="Rezervasyon bulunamadı")

    reservation = Reservation(**doc)
    if reservation.status != ReservationStatus.RESERVED:
        raise HTTPException(status_code=409, detail="Rezervasyon ödeme onayı için uygun durumda değil")

    checkin_token = uuid.uuid4().hex
    await db.reservations.update_one(
        {"id": reservation_id},
        {"$set": {"status": ReservationStatus.CHECKIN_PENDING.value, "checkin_token": checkin_token}},
    )

    reservation.status = ReservationStatus.CHECKIN_PENDING
    reservation.checkin_token = checkin_token
    return reservation
