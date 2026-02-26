from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class User(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class Subscription(BaseModel):
    IdWinC: int
    Description: str
    Enabled: bool
    CardAvailable: Optional[int] = None

class Consultant(BaseModel):
    IdWinC: int
    Email: Optional[str] = None
    Name: str
    Surname: str
    Role: Optional[list[str]] = None
    Enabled: Optional[bool] = False

class Customer(BaseModel):
    IdWinC: int
    Name: str
    BirthDate: datetime | None
    MedicalCertificateValidity: datetime | None
    LastAccessDate: datetime | None
    TrainingOperatorId: int | None
    Enabled: bool

class Card(BaseModel):
    Id: int
    Rescheduled: bool
    Enabled: bool
    Uploaded: bool
    CustomerId: int
    TrainingOperatorId: int
    DateStart: datetime
    DateEnd: datetime
    CustomerSubscriptionId: int
    DurationWeek: int

class IdModel(BaseModel):
    IdWinC: int

class CustomerPTModel(BaseModel):
    Id: int
    SessionNumber: int
    DateStart: datetime
    TotalSession: int

class CustomerPTActiveModel(CustomerPTModel):
    IntegrationHistory: list[dict]
    SessionHistory: list[dict]
    RemainingSession: int

class PackageHistoryModel(BaseModel):
    SessionId: int
    TrainingOperatorName: str
    DateStart: datetime
    SessionNumber: int
    CanUndo: bool
    CustomerPTId: int
    PackageHistory: list[dict]

class SessionPTHistoryModel(BaseModel):
    CustomerPTId: int
    DateStart: datetime
    TrainingOperatorName: str
    Id: int
    CustomerId: int
    SessionNumber: int
    CanUndo: bool

class CardSummary(BaseModel):
    TrainingOperatorId: int
    FirstCardNewCustomer: int
    FirstCardRenewed: int
    UpdatesCard: int
    TotalCards: int
    Month: int