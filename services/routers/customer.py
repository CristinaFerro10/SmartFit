from typing import Annotated
from fastapi import HTTPException, status, Depends, APIRouter, Query

from models.enumtype import Role
from models.filter import CustomerDashboardISTFilter
from routers.auth import get_current_user
from database import supabase

user_dependency = Annotated[dict, Depends(get_current_user)]

router = APIRouter(
    prefix='/customer',
    tags=['customer']
)

#user: user_dependency,, response_model=PaginatedResponse[Customer]
#   if user is None:
#       raise HTTPException(status_code=401, detail='Authentication Failed')
'''
    page: int = Query(1, ge=1, description="Numero pagina"),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: Optional[str] = Query(None),
    sort_order: Optional[SortOrder] = Query(None),
'''
@router.get("/dashboard/", status_code=status.HTTP_200_OK)
async def list_users(
    filters: CustomerDashboardISTFilter = Query()
):
    #"vw_DashboardSecretary" if user.get('role').includes(Role.Secretary) else "vw_DashboardConsultant"
    query = supabase.table("vw_DashboardConsultant").select('*')

    if filters.CustomerName is not None:
        query.ilike('Name', f'%{filters.CustomerName}%')

    if filters.TrainerOperatorId is not None:
        query.eq('TrainingOperatorId', filters.TrainerOperatorId)
    #elif filters.CustomerName is None:
    #    query.eq('TrainingOperatorId', user.get('id'))

    if filters.WarningType is not None:
        query.eq('Warning', filters.WarningType.value)

    #urgenza -> default
    #data ultima scheda
    #data ultimo accesso
    #nome a-z
    #query.order('LastAccessDate',desc=True,nullsfirst=False)
    result = query.execute()
    return result.data
    # Esegui paginazione
    # count all status

#user: user_dependency,, response_model=PaginatedResponse[Customer]
#   if user is None:
#       raise HTTPException(status_code=401, detail='Authentication Failed')
@router.get("/detail/", status_code=status.HTTP_200_OK)
async def detail_user_for_consultant(customer: int = Query(gt=1)):
    # "vw_DetailCustomer_Secretary" if user.get('role').includes(Role.Secretary) else "vw_DetailCustomer_Consultant"
    result = supabase.table("vw_DetailCustomer_Consultant")\
        .select('*')\
        .eq('IdWinC', customer)\
        .execute()

    return result.data
