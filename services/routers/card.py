from datetime import datetime, timezone, timedelta
from typing import Annotated
from fastapi import HTTPException, status, Depends, APIRouter
from models.setmodels import CardRequest, CardInsert
from routers.auth import get_current_user
import os
from dotenv import load_dotenv
from database import supabase

user_dependency = Annotated[dict, Depends(get_current_user)]
load_dotenv()
exp_day: int = int(os.getenv("CARDS_EXPIRING_DAYS"))
wrn_day: int = int(os.getenv("CARDS_WARNING_DAYS"))

router = APIRouter(
    prefix='/card',
    tags=['card']
)

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
            DateEnd=datetime.now(timezone.utc) + timedelta(weeks=card.DurationWeek),
            CustomerId=card.CustomerId,
            CustomerSubscriptionId=card.CustomerSubscriptionId,
            TrainingOperatorId=user.get('id'),
            DurationWeek=card.DurationWeek,
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