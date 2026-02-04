from typing import Annotated
from fastapi import HTTPException, status, Depends, APIRouter, Query
from postgrest import CountMethod
from models.enumtype import Role, CustomerOrderBy
from models.filter import CustomerDashboardISTFilter
from models.pagination import PaginatedResponse
from routers.auth import get_current_user
from database import supabase
from dotenv import load_dotenv

load_dotenv()
user_dependency = Annotated[dict, Depends(get_current_user)]

router = APIRouter(
    prefix='/customer',
    tags=['customer']
)

#user: user_dependency,
#   if user is None:
#       raise HTTPException(status_code=401, detail='Authentication Failed')
@router.get("/dashboard/", status_code=status.HTTP_200_OK, response_model=PaginatedResponse[dict])
async def list_users(
    filters: CustomerDashboardISTFilter = Query()
):
    #"vw_DashboardSecretary" if user.get('role').includes(Role.Secretary) else "vw_DashboardConsultant"
    query = supabase.table("vw_DashboardConsultant").select('*', count=CountMethod.exact)

    if filters.CustomerName is not None:
        query.ilike('Name', f'%{filters.CustomerName}%')

    if filters.TrainerOperatorId is not None:
        query.eq('TrainingOperatorId', filters.TrainerOperatorId)
    #elif filters.CustomerName is None:
    #    query.eq('TrainingOperatorId', user.get('id'))

    if filters.WarningType is not None:
        query.eq('Warning', filters.WarningType.value)

    if filters.OrderBy is None or filters.OrderBy == CustomerOrderBy.Default.value:
        query.order('Warning', desc=True)
    elif filters.OrderBy == CustomerOrderBy.NameAsc.value:
        query.order('Name', desc=False, nullsfirst=False)
    elif filters.OrderBy == CustomerOrderBy.NameDesc.value:
        query.order('Name', desc=True, nullsfirst=False)
    elif filters.OrderBy == CustomerOrderBy.LastAccessDate.value:
        query.order('LastAccessDate', desc=True, nullsfirst=False)
    elif filters.OrderBy == CustomerOrderBy.LastCard.value:
        query.order('StartDate', desc=True, nullsfirst=False)

    # TODO count all status -> in base anche ai filtri!!!
    # faccio left join qui? trasformo la mia enum in vista?
    result = query\
        .offset(filters.get_offset())\
        .limit(filters.page_size)\
        .execute()

    return PaginatedResponse[dict](
        items=result.data,
        total=result.count,
    )

@router.get("/detail/", status_code=status.HTTP_200_OK)
async def detail_user(user: user_dependency, customer: int = Query(gt=1)):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')
    view: str = "vw_DetailCustomer_Secretary" if user.get('role').includes(Role.Secretary) else "vw_DetailCustomer_Consultant"
    print(view)
    result = supabase.table(view)\
        .select('*')\
        .eq('IdWinC', customer)\
        .execute()

    return result.data
