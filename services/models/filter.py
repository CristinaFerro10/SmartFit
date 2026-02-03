from typing import Optional
from models.enumtype import CustomerWarning, CustomerOrderBy
from models.pagination import PaginationParams


class CustomerDashboardISTFilter(PaginationParams):
    CustomerName: Optional[str] = None
    TrainerOperatorId: Optional[int] = None
    WarningType: Optional[CustomerWarning] = None
    OrderBy: Optional[CustomerOrderBy] = None