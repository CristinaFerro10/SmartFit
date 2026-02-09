from typing import Annotated
from fastapi import HTTPException, status, Depends, APIRouter
from models.models import CustomerPTActiveModel, CustomerPTModel, PackageHistoryModel, SessionPTHistoryModel
from models.setmodels import PTRequest, PTUpgradeRequest, PTUpgrade, SessionPT, SessionPTRequest, CheckCustomerPTStatus, \
    DeleteSessionRequest
from routers.auth import get_current_user
from dotenv import load_dotenv
from database import supabase

load_dotenv()
user_dependency = Annotated[dict, Depends(get_current_user)]

router = APIRouter(
    prefix='/pt',
    tags=['pt']
)

@router.get('/package/active/{customer_id}', status_code=status.HTTP_200_OK)
async def get_active_package(user: user_dependency, customer_id: int):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')

    customerPTResponse = supabase.table('vw_ActiveCustomerPT')\
        .select('*')\
        .eq('CustomerId',customer_id)\
        .execute()

    if customerPTResponse.data and customerPTResponse.data[0]:
        customerPT = CustomerPTModel(**customerPTResponse.data[0])

        sessionHistory = supabase.table('vw_SessionPTHistory')\
            .select('*')\
            .eq('CustomerPTId',customerPT.Id)\
            .execute()

        integrationHistory = supabase.table('CustomerPTHistory')\
            .select('SessionAdded, DateStart')\
            .eq('CustomerPTId',customerPT.Id)\
            .execute()

        return CustomerPTActiveModel(
            DateStart=customerPT.DateStart,
            SessionHistory=[] if sessionHistory.data is None else sessionHistory.data,
            IntegrationHistory=[] if integrationHistory.data is None else integrationHistory.data,
            Id=customerPT.Id,
            SessionNumber=customerPT.SessionNumber
        )
    else:
        return None

@router.get('/package/history/{customer_id}', status_code=status.HTTP_200_OK)
async def get_history_packages(user: user_dependency, customer_id: int):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')

    lastSessionResponse = supabase.table('vw_SessionPTHistory')\
            .select('*')\
            .eq('CustomerId', customer_id)\
            .order('DateStart',desc=True)\
            .limit(1)\
            .execute()

    if lastSessionResponse.data and lastSessionResponse.data[0]:
        lastSession = SessionPTHistoryModel(**lastSessionResponse.data[0])
        customerPTResponse = supabase.table('vw_CompletedCustomerPT')\
            .select('*')\
            .eq('CustomerId', customer_id)\
            .execute()

        return PackageHistoryModel(
            SessionId=lastSession.Id,
            TrainingOperatorName=lastSession.TrainingOperatorName,
            SessionNumber=lastSession.SessionNumber,
            DateStart=lastSession.DateStart,
            PackageHistory=[] if customerPTResponse.data is None else customerPTResponse.data
        )
    else:
        return None

@router.post('/package/', status_code=status.HTTP_201_CREATED)
async def create_package_pt(user: user_dependency, params: PTRequest):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')

    result = supabase.table('CustomerPT')\
    .insert([
        params.model_dump()
    ]) \
    .execute()
     #result.data -> forse mi serve per aggiornare la scheda che visualizzo??

@router.put('/package/', status_code=status.HTTP_201_CREATED)
async def update_package_pt(user: user_dependency, params: PTUpgradeRequest):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')

    result = supabase.table('CustomerPTHistory')\
    .insert([
        PTUpgrade(
            DateStart=params.DateStart,
            TrainingOperatorId=user.get('id'),
            CustomerPTId=params.CustomerPTId,
            SessionAdded=params.SessionAdded
        ).model_dump()
    ]) \
    .execute()

    supabase.table('CustomerPT')\
    .update(
        {'SessionPTTypeId': params.SessionPTTypeId}
    )\
    .eq('Id', params.CustomerPTId)\
    .execute()
     #result.data -> forse mi serve per aggiornare la scheda che visualizzo??

@router.post('/session/', status_code=status.HTTP_201_CREATED)
async def create_session_pt(user: user_dependency, params: SessionPTRequest):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')

    result = supabase.table('SessionPT')\
    .insert([
        SessionPT(
            DateStart=params.DateStart,
            TrainingOperatorId=user.get('id'),
            CustomerPTId=params.CustomerPTId,
        ).model_dump()
    ]) \
    .execute()

    customerPTResponse = supabase.table('vw_ActiveCustomerPT')\
        .select('TotalSession','SessionNumber')\
        .eq('Id',params.CustomerPTId)\
        .execute()

    customerPT = CheckCustomerPTStatus(**customerPTResponse.data[0])

    if customerPT.TotalSession == customerPT.SessionNumber:
        supabase.table('CustomerPT')\
            .update({'Completed': True})\
            .eq('Id', customerPT.CustomerPTId)\
            .execute()
     #result.data -> forse mi serve per aggiornare la scheda che visualizzo??

@router.delete('/session/', status_code=status.HTTP_204_NO_CONTENT)
async def delete_session_pt(user: user_dependency, params: DeleteSessionRequest):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication Failed')

    supabase.table('SessionPT')\
        .delete()\
        .eq('Id', params.sessionPTId)\
        .execute()

    supabase.table('CustomerPT') \
        .update({'Completed': False}) \
        .eq('Id', params.CustomerPTId) \
        .execute()