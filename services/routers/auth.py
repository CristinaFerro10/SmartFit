from datetime import timedelta, timezone, datetime
from typing import Annotated
from fastapi import HTTPException, status, Depends, APIRouter
from database import supabase
from models.models import Token, Consultant
import os
from dotenv import load_dotenv
from .auth_manager import auth_manager
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/token")

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

async def get_user_by_username(username: str):
    # Query con filtri multipli
    users_db = supabase.table("User") \
        .select("*") \
        .eq("Enabled", True) \
        .eq("Email", username) \
        .execute()
    docs = [Consultant(**item) for item in users_db.data]

    if not docs:
        raise HTTPException(status_code=404, detail="Utente non trovato o non abilitato")
    # Assumendo che l'email sia unica, prendo il primo risultato
    return docs[0]

@router.post('/token', response_model=Token, status_code=status.HTTP_200_OK)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    # verificare se è presente nel mio db
    user = await get_user_by_username(form_data.username)
    # se c'è bene, faccio login qui
    await auth_manager.get_token(form_data.username, form_data.password)
    # generare token da utilizzare per tutte le api
    token = create_access_token(form_data.username, user.IdWinC, user.Role, timedelta(minutes=60))
    return {'access_token': token, 'token_type': 'Bearer'}

def create_access_token(username: str, user_id: int, role: list[str], expires_delta: timedelta):
    encode = {'sub': username, 'id': user_id, 'role': role}
    expires = datetime.now(timezone.utc) + expires_delta
    encode.update({'exp': expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get('sub')
        user_id: int = payload.get('id')
        user_role: str = payload.get('role')
        if username is None or user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail='Could not validate user')
        return {'username': username, 'id': user_id, 'role': user_role}
    except JWTError:
        raise HTTPException(status_code=401, detail='Could not validate credentials')