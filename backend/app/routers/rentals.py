"""
Aktif kiralama durumu ve iade (return) endpoint'leri.
"""
import math
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.db.mongo import get_database
from app.models.common import DeviceStatus, RentalStatus, ReservationStatus
from app.models.rental import Rental, RentalStatusResponse, ReturnReceipt
from app.routers.reservations import calculate_estimated_total

router = APIRouter(prefix="/rentals", tags=["rentals"])


@router.get("/{rental_id}/status", response_model=RentalStatusResponse)
async def get_rental_status(rental_id: str):
    """Aktif bir kiralamanın canlı süresini ve o ana kadar oluşan tahmini
    ücretini hesaplar. Frontend bu endpoint'i periyodik olarak çağırarak
    sayaç ekranını günceller."""
    db = get_database()
    rental_doc = await db.rentals.find_one({"id": rental_id})
    if rental_doc is None:
        raise HTTPException(status_code=404, detail="Kiralama bulunamadı")
    rental = Rental(**rental_doc)

    reservation_doc = await db.reservations.find_one({"id": rental.reservation_id})
    hourly_fee = reservation_doc["price_snapshot"]["hourly_fee"]

    now = datetime.now(timezone.utc)
    start_at = rental.start_at if rental.start_at.tzinfo else rental.start_at.replace(tzinfo=timezone.utc)
    elapsed_seconds = max((now - start_at).total_seconds(), 0)
    current_cost = round(hourly_fee * (elapsed_seconds / 3600), 2)

    return RentalStatusResponse(
        rental_id=rental.id,
        device_id=rental.device_id,
        status=rental.status,
        start_at=rental.start_at,
        elapsed_seconds=elapsed_seconds,
        hourly_fee=hourly_fee,
        current_cost=current_cost,
    )


@router.post("/{rental_id}/return", response_model=ReturnReceipt)
async def return_rental(rental_id: str):
    """Cihazı iade eder (ACTIVE -> COMPLETED), süreye göre nihai ücreti
    hesaplar ve sahte bir makbuz döner."""
    db = get_database()
    rental_doc = await db.rentals.find_one({"id": rental_id})
    if rental_doc is None:
        raise HTTPException(status_code=404, detail="Kiralama bulunamadı")
    rental = Rental(**rental_doc)
    if rental.status != RentalStatus.ACTIVE:
        raise HTTPException(status_code=409, detail="Bu kiralama iade için uygun durumda değil")

    reservation_doc = await db.reservations.find_one({"id": rental.reservation_id})
    price_snapshot = reservation_doc["price_snapshot"]

    now = datetime.now(timezone.utc)
    start_at = rental.start_at if rental.start_at.tzinfo else rental.start_at.replace(tzinfo=timezone.utc)
    total_amount = calculate_estimated_total(
        price_snapshot["hourly_fee"], price_snapshot["daily_fee"], start_at, now
    )
    duration_minutes = round((now - start_at).total_seconds() / 60, 1)

    await db.rentals.update_one(
        {"id": rental_id},
        {"$set": {"return_at": now, "status": RentalStatus.COMPLETED.value}},
    )
    await db.reservations.update_one(
        {"id": rental.reservation_id}, {"$set": {"status": ReservationStatus.COMPLETED.value}}
    )
    await db.devices.update_one(
        {"id": rental.device_id}, {"$set": {"status": DeviceStatus.AVAILABLE.value}}
    )

    return ReturnReceipt(
        receipt_id=uuid.uuid4().hex,
        rental_id=rental.id,
        device_id=rental.device_id,
        start_at=rental.start_at,
        return_at=now,
        duration_minutes=duration_minutes,
        hourly_fee=price_snapshot["hourly_fee"],
        daily_fee=price_snapshot["daily_fee"],
        total_amount=total_amount,
        # MOCK: gerçek ödeme sisteminde depozito burada iade edilir; demo'da
        # otomatik olarak tamamının iade edildiği varsayılır.
        deposit_refunded=price_snapshot["deposit"],
    )
