from datetime import timedelta
from typing import Annotated, Optional
from fastapi import HTTPException, status, Depends, APIRouter
from fastapi.params import Query
from postgrest import CountMethod

from models.filter import MonthCounterFilter
from models.setmodels import CardRequest, CardInsert
from models.models import Card, CardSummary
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
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication failed")

    query = supabase.table('vw_SummaryCardByMonth')\
        .select('*', count=CountMethod.exact)\
        .eq('Year', params.year)\
        .eq('TrainingOperatorId', user.get('id'))

    if params.months:
        query.in_('Month', params.months)

    result = query.execute()

    #TODO: prendere anche i pt
    #TODO: mettere show column e popolare colonne con numero o con 0 in base a quello che si mostra
    return [CardSummary(**item) for item in result.data] if result.count > 0 else None

@router.post('/', status_code=status.HTTP_201_CREATED)
async def create_card(user: user_dependency,card: CardRequest):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication failed")

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

@router.put('/reschedule/{card_id}', status_code=status.HTTP_204_NO_CONTENT)
async def reschedule_card(user: user_dependency, card_id: int):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication failed")

    supabase.table('Card')\
        .update({'Rescheduled': True})\
        .eq('Id', card_id)\
        .execute()

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