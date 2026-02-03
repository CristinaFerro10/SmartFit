from datetime import datetime
from pydantic import BaseModel, field_serializer, Field

class CustomerRequest(BaseModel):
    IdWinC: int
    Name: str
    BirthDate: str | None
    MedicalCertificateValidity: str | None
    LastAccessDate: str | None
    TrainingOperatorId: int | None
    Enabled: bool

class CardRequest(BaseModel):
    CustomerId: int
    CustomerSubscriptionId: int
    Rescheduled: bool
    DurationWeek: int = Field(gt=1)

class CardInsert(BaseModel):
    DateEnd: datetime
    CustomerId: int
    CustomerSubscriptionId: int
    TrainingOperatorId: int
    DurationWeek: int = Field(gt=1)

    # Serializza automaticamente datetime in ISO string
    @field_serializer('DateEnd')
    def serialize_datetime(self, dt: datetime | None, _info):
        return dt.isoformat() if dt else None