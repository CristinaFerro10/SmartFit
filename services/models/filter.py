from typing import Optional
from pydantic import BaseModel
from models.enumtype import CardWarning

class CustomerDashboardISTFilter(BaseModel):
    CustomerName: Optional[str] = None
    TrainerOperatorId: Optional[int] = None
    WarningType: Optional[CardWarning] = None