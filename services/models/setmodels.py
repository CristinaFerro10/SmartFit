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
    DateStart: datetime
    DurationWeek: int = Field(gt=1)

class SubscriptionRequest(BaseModel):
    IdWinC: int
    Description: str
    Enabled: bool

class CustomerSubscriptionRequest(BaseModel):
    IdWinC: int
    CreatedAt: str
    StartDate: str
    EndDate: str
    CustomerId: int
    SubscriptionId: int
    Renewed: bool

class CardInsert(BaseModel):
    DateEnd: datetime
    DateStart: datetime
    CustomerId: int
    CustomerSubscriptionId: int
    TrainingOperatorId: int
    DurationWeek: int = Field(gt=1)

    # Serializza automaticamente datetime in ISO string
    @field_serializer('DateEnd')
    def serialize_date_end(self, dt: datetime | None, _info):
        return dt.isoformat() if dt else None
    @field_serializer('DateStart')
    def serialize_date_start(self, dt: datetime | None, _info):
        return dt.isoformat() if dt else None

class PTRequest(BaseModel):
    DateStart: datetime = Field(default_factory=datetime.now)
    CustomerId: int
    SessionPTTypeId: int= Field(gt=0)

    @field_serializer('DateStart')
    def serialize_datetime(self, dt: datetime | None, _info):
        return dt.isoformat() if dt else None

class PTUpgradeRequest(BaseModel):
    CustomerPTId: int
    DateStart: datetime
    SessionPTTypeId: int= Field(gt=0)
    SessionAdded: int

class PTUpgrade(BaseModel):
    CustomerPTId: int
    DateStart: datetime
    SessionAdded: int
    TrainingOperatorId: int

    @field_serializer('DateStart')
    def serialize_datetime(self, dt: datetime | None, _info):
        return dt.isoformat() if dt else None

class SessionPTRequest(BaseModel):
    CustomerPTId: int
    DateStart: datetime

class SessionPT(BaseModel):
    CustomerPTId: int
    DateStart: datetime
    TrainingOperatorId: int

    @field_serializer('DateStart')
    def serialize_datetime(self, dt: datetime | None, _info):
        return dt.isoformat() if dt else None

class CheckCustomerPTStatus(BaseModel):
    Id: int
    TotalSession: int
    SessionNumber: int

class DeleteSessionRequest(BaseModel):
    CustomerPTId: int
    SessionPTId: int

class CustomerDescriptionRequest(BaseModel):
    Description: str
    CustomerId: int