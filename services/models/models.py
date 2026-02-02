from datetime import datetime
from enum import Enum
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

class CustomerRequest(BaseModel):
    IdWinC: int
    Name: str
    BirthDate: str | None
    MedicalCertificateValidity: str | None
    LastAccessDate: str | None
    TrainingOperatorId: int | None
    Enabled: bool

class CustomerUpdateModel(BaseModel):
    IdWinC: int
    MedicalCertificateValidity: datetime | None
    LastAccessDate: datetime | None

class IdModel(BaseModel):
    IdWinC: int

class CardWarning(str, Enum):
    Expiring = 'expiring'
    Warning = 'warning'
    Ok = 'ok'