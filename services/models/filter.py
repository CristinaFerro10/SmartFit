from typing import Optional

from pydantic import BaseModel, Field

from models.models import CardWarning


class CustomerDashboardISTFilter(BaseModel):
    CustomerName: Optional[str] = None
    TrainerOperatorId: Optional[int] = None
    WarningType: Optional[CardWarning] = None