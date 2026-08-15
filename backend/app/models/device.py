"""
Device (taşınabilir şarj cihazı) modeli.
"""
from pydantic import BaseModel

from app.models.common import ConnectorType, DeviceStatus


class Device(BaseModel):
    id: str
    location_id: str
    model: str
    power_class: str  # örn. "7kW", "22kW"
    connector_type: ConnectorType
    status: DeviceStatus = DeviceStatus.AVAILABLE
    hourly_fee: float
    daily_fee: float
    deposit: float
