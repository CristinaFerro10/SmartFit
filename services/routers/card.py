from datetime import timedelta
from typing import Annotated
from fastapi import HTTPException, status, Depends, APIRouter
from fastapi.params import Query
from postgrest import CountMethod
from models.filter import MonthCounterFilter
from models.setmodels import CardRequest, CardInsert
from models.models import Card
from routers.auth import get_current_user
from dotenv import load_dotenv
from database import supabase

user_dependency = Annotated[dict, Depends(get_current_user)]
load_dotenv()

router = APIRouter(
    prefix='/card',
    tags=['card']
)

@router.get('/summary', status_code=status.HTTP_200_OK)
async def card_summary(user: user_dependency, params: MonthCounterFilter = Query()):
    try:
        return await get_query_cards_count(user, 'get_dashboard_summary', params)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get('/summary/total', status_code=status.HTTP_200_OK)
async def card_summary_total(user: user_dependency, params: MonthCounterFilter = Query()):
    return []

@router.post('/', status_code=status.HTTP_201_CREATED)
async def create_card(user: user_dependency,card: CardRequest):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication failed")
    try:
        supabase.table('Card')\
            .update({'Enabled': False})\
            .eq('Enabled', True)\
            .eq('CustomerId', card.CustomerId)\
            .execute()

        result = supabase.table('Card')\
        .insert([
            CardInsert(
                DateEnd=card.DateStart + timedelta(weeks=card.DurationWeek),
                CustomerId=card.CustomerId,
                CustomerSubscriptionId=card.CustomerSubscriptionId,
                TrainingOperatorId=user.get('id'),
                DurationWeek=card.DurationWeek,
                DateStart=card.DateStart
            ).model_dump()
        ]) \
        .execute()
     #result.data -> forse mi serve per aggiornare la scheda che visualizzo??
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put('/reschedule/{card_id}', status_code=status.HTTP_204_NO_CONTENT)
async def reschedule_card(user: user_dependency, card_id: int):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication failed")
    try:
        supabase.table('Card')\
            .update({'Rescheduled': True})\
            .eq('Id', card_id)\
            .execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put('/undo/{card_id}', status_code=status.HTTP_204_NO_CONTENT)
async def reschedule_card(user: user_dependency, card_id: int):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication failed")

    result = supabase.table('Card')\
        .select('*')\
        .eq('Id', card_id)\
        .execute()

    card = Card(**result.data[0])

    if card.Rescheduled:
        supabase.table('Card')\
            .update({'Rescheduled': False})\
            .eq('Id', card_id)\
            .execute()
    else:
        supabase.table('Card')\
            .delete()\
            .eq('Id', card_id)\
            .execute()

        old_card = supabase.table('Card') \
            .select('Id', count = CountMethod.exact) \
            .eq('CustomerId', card.CustomerId)\
            .eq('CustomerSubscriptionId', card.CustomerSubscriptionId)\
            .eq('Enabled', False)\
            .order('DateStart', desc=True)\
            .limit(1)\
            .execute()

        if old_card is not None and old_card.count > 0:
            supabase.table('Card')\
                .update({'Enabled': True})\
                .eq('Id', old_card.data[0].get('Id'))\
                .execute()

async def get_query_cards_count(user: user_dependency, table_name: str, params: MonthCounterFilter):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication failed")

    filter_map = [
        (params.includeNew, "FirstCardNewCustomer"),
        (params.includeRenewed, "FirstCardRenewed"),
        (params.includeUpdates, "UpdatesCard"),
        (params.includePT, "TotalSession"),
    ]

    active_columns = [col for flag, col in filter_map if flag]

    response = supabase.rpc(
        table_name,
        {
            "p_months": params.months,
            "p_year": params.year,
            "p_training_operator_id": user.get('id'),
            "p_is_mds": params.isMDSSubscription
        }
    ).execute()

    if active_columns:
        result = []
        for row in response.data:
            total = sum(row[col] for col in active_columns)
            result.append({**row, "TotalCards": total})
        return result
    else:
        return response.data
