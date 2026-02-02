from typing import Any, List, Optional
from pydantic import BaseModel

class DataSetItem(BaseModel):
    rowId: str | None
    birthPlace: str | None
    taxCode: str | None
    genderId: int | None
    gender: int | None
    genderString: str | None
    registerDate: str | None
    categoryName: Any | None
    importantcategorynamE_1: str | None
    importantcategorynamE_2: str | None
    importantcategorynamE_3: str | None
    importantcategorynamE_4: str | None
    importantcategorynamE_5: str | None
    cid: Any | None
    originName: Optional[str]
    cityName: Optional[str]
    address: Optional[str]
    civic: Optional[str]
    postalCode: Optional[str]
    city: Optional[str]
    province: Any | None
    region: Any | None
    completeAddress: str | None
    cityAddress: Optional[str]
    provinceName: Optional[str]
    medicalCertificateValidity: Optional[str]
    cardsNumber: int | None
    customerStatusId: int | None
    customerStatus: str | None
    customerSubscriptionStatusId: Optional[int]
    customerSubscriptionStatus: str |None
    customerAppStatusId: Optional[int]
    customerAppStatus: str | None
    blockId: Any | None
    blocked: str | None
    isMobileNumberUnreachable: str | None
    isCommunicationBlockSMS: str | None
    communicationBlockSMSNotes: Any | None
    isEmailUnreachable: str | None
    isCommunicationBlockEmail: str | None
    communicationBlockEmailNotes: Any | None
    lastReadCredit: Optional[float]
    lastReadVirtualCredit: Optional[float]
    asiCardState: int |None
    asiCardStateString: str |None
    asiCardNumber: Optional[str]
    asiCardExpiryDate: Optional[str]
    accessesCount: Any | None
    dailyPresences: Any | None
    refererCustomerId: Any | None
    refererCustomerName: Any | None
    customerId: int | None
    customerName: str | None
    lastName: str | None
    firstName: str | None
    dateOfBirth: str | None
    dateofBirth_Text: str | None
    age: int | None
    dataProcessing_Marketing_Allow: bool | None
    dataProcessing_Marketing_ExpiryDate: Optional[str]
    dataProcessing_Service_Allow: bool | None
    dataProcessing_Service_ExpiryDate: Optional[str]
    mobileNumber: str | None
    mobileNumberUnreachable: bool | None
    communicationBlockSMS: bool | None
    phoneNumber: Optional[str]
    userPhoneNumber: str | None
    email: str | None
    emailUnreachable: bool | None
    communicationBlockEmail: bool | None
    mainOperatorName: str | None
    mainReferenceOperatorId: int | None
    trainingOperatorName: str | None
    trainingReferenceOperatorId: int | None
    customerLastAccess: Optional[str]

class Column(BaseModel):
    field: str
    title: str
    headerName: str
    type: Optional[str]
    naturalType: Any
    columnStyle: str

class Data(BaseModel):
    dataSet: List[DataSetItem]
    columns: List[Column]
    columnGroupingModel: List
    charts: List
    hasMore: bool

class CustomerItem(BaseModel):
    data: Data
    responseMessages: List
