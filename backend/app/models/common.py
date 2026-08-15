"""
Modeller arasında paylaşılan enum (sabit değer kümesi) tanımları.
"""
from enum import Enum


class LocationType(str, Enum):
    AVM = "avm"
    OTOPARK = "otopark"


class LocationStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class DeviceStatus(str, Enum):
    AVAILABLE = "available"
    RESERVED = "reserved"
    CHECKED_OUT = "checked_out"
    MAINTENANCE = "maintenance"


class ConnectorType(str, Enum):
    """Elektrikli araç şarj konnektör tipleri."""
    TYPE2 = "Type 2"
    CCS = "CCS"
    CHADEMO = "CHAdeMO"


class ReservationStatus(str, Enum):
    DRAFT = "DRAFT"
    RESERVED = "RESERVED"
    CHECKIN_PENDING = "CHECKIN_PENDING"
    ACTIVE = "ACTIVE"
    RETURN_PENDING = "RETURN_PENDING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"


class RentalStatus(str, Enum):
    ACTIVE = "ACTIVE"
    RETURN_PENDING = "RETURN_PENDING"
    COMPLETED = "COMPLETED"
