from typing import Optional

from pydantic import BaseModel

from models.enumtype import CustomerWarning, CustomerOrderBy
from models.pagination import PaginationParams

class CustomerDashboardISTFilter(BaseModel):
    CustomerName: Optional[str] = None
    TrainerOperatorId: Optional[int] = None
    SubscriptionExpiring: Optional[bool] = None
    IsMDSSubscription: Optional[bool] = None

class CustomerDashboardISTFilterPaginated(PaginationParams, CustomerDashboardISTFilter):
    WarningType: Optional[CustomerWarning] = None
    OrderBy: Optional[CustomerOrderBy] = None

class MonthCounterFilter(BaseModel):
    months: Optional[list[int]] = None
    year: int