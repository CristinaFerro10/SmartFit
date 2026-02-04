from typing import Any, List, Optional
from pydantic import BaseModel

class DataSetItem(BaseModel):
    rowId: str | None
    activeCustomerBlock: bool | None
    authorizationId: int | None
    start: str | None
    end: str | None
    start_String: str | None
    end_String: str | None
    activityTypeId: int | None
    activityCategory: str | None
    activityTypeName: str | None
    saleId: int | None
    saleProductId: int | None
    saleProductName: str | None
    salePackageId: int | None
    salePackageName: str | None
    saleDate: str | None
    productDescription: str | None
    saleProductBasePrice: float  | None
    renewable: bool | None
    automaticRenewal: bool | None
    renewed: bool | None
    canceledRenew: bool | None
    cancellationDate: Any | None
    converted: bool | None
    mainReferenceOperator: Any | None
    trainingReferenceOperator: Any | None
    lastAccess: str | None
    maxActivityDate: str | None
    accessCount: Any | None
    performedAccesses: int | None
    remainingAccesses: Any | None
    renewalSalePackageName: str | None
    renewalDateSalePackageName: str | None
    customerStatusId: int | None
    customerStatus: str | None
    address: str | None
    civic: str | None
    postalCode: str | None
    city: Any | None
    address_City: Any | None
    address_City2: Any | None
    address_Province: Any | None
    address_ProvinceCode: Any | None
    accessQuantity_PastReservationsWithoutAccessDone: Any | None
    accessQuantity_FutureReservationsWithoutAccessDone: int | None
    accessCount_Value: float | None
    performedAccesses_Value: float | None
    remainingAccesses_Value: float | None
    accessQuantity_PastReservationsWithoutAccessDone_Value: float | None
    customerId: int | None
    customerName: str | None
    lastName: str | None
    firstName: str | None
    dateOfBirth: str | None
    dateofBirth_Text: str | None
    age: int | None
    dataProcessing_Marketing_Allow: bool | None
    dataProcessing_Marketing_ExpiryDate: str | None
    dataProcessing_Service_Allow: bool | None
    dataProcessing_Service_ExpiryDate: str | None
    mobileNumber: str | None
    mobileNumberUnreachable: bool | None
    communicationBlockSMS: bool | None
    communicationBlockSMSNotes: Any | None
    phoneNumber: Any | None
    userPhoneNumber: str | None
    email: str | None
    emailUnreachable: bool | None
    communicationBlockEmail: bool | None
    mainOperatorName: str | None
    mainReferenceOperatorId: int | None
    trainingOperatorName: str | None
    trainingReferenceOperatorId: int | None
    customerLastAccess: str | None

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

class SalesResponse(BaseModel):
    data: Data
    responseMessages: List
