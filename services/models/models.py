from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, field_serializer


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
    CardAvailable: int

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

class IdModel(BaseModel):
    IdWinC: int

class CardWarning(str, Enum):
    Expiring = 'expiring'
    Warning = 'warning'
    Rescheduled = 'rescheduled'
    Ok = 'ok'
