from typing import List
from dateutil import parser
from fastapi import APIRouter, HTTPException
from postgrest import CountMethod
from fastapi import status
import os
from dotenv import load_dotenv
import httpx
from models.customerResponse import CustomerItem
from models.models import Subscription, Consultant, Customer, IdModel, CustomerRequest
from models.domainResponse import DomainResponse
from .auth_manager import auth_manager
from database import supabase

load_dotenv()
curling: str = os.getenv("WELLNESS_URL")
company: str = os.getenv("WELLNESS_COMPANY")
usr: str = os.getenv("USN")
psw: str = os.getenv("PSW")

router = APIRouter(
    prefix='/job',
    tags=['job']
)

# TODO: da decidere ogni quanto devono aggiornarsi, ogni MESE?
@router.post('/user', status_code=status.HTTP_204_NO_CONTENT)
async def create_users():
    token = await auth_manager.get_token(usr, psw)
    api_url = f"{curling}{company}/Analysis/consultant"
    async with httpx.AsyncClient() as client:
        response = await client.get(
            api_url,
            headers={"Authorization": f"Bearer {token}"}
        )

        if response.status_code == status.HTTP_200_OK:
            users_item = DomainResponse(**response.json())
            active_subs: List[dict] = []
            for group in users_item.data.itemsGroups:
                for item in group.items:
                    if item.active:
                        active_subs.append(
                            Consultant(
                                IdWinC=int(item.value),
                                Name=item.label.split(' ')[0],
                                Surname=item.label.split(' ')[1] if len(item.label.split(' ')) > 1 else ''
                            ).model_dump()
                        )

            if active_subs:
                result = supabase.table('User').upsert(
                    active_subs,
                    on_conflict='IdWinC',
                    count=CountMethod.exact
                ).execute()
                total_affected = len(result.data) if result.data else len(active_subs)
                print(f"Upsert completato: {total_affected} record processati")
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate credentials'
            )

# TODO: da decidere ogni quanto devono aggiornarsi, ogni GIORNO?
@router.post('/customer', status_code=status.HTTP_204_NO_CONTENT)
async def create_customers():
    token = await auth_manager.get_token(usr, psw)
    api_url = f"{curling}{company}/analysis/analysis_customers/search"
    # Timeout personalizzato
    timeout = httpx.Timeout(
        connect=10.0,  # Tempo per connettersi
        read=60.0,     # Tempo per leggere la risposta
        write=10.0,    # Tempo per scrivere
        pool=10.0      # Tempo per ottenere connessione dal pool
    )
    async with httpx.AsyncClient(timeout=timeout) as client:
        all_users: list[IdModel] = find_all_db_users_id()

        for user in all_users:
            response = await client.post(
                api_url,
                headers={"Authorization": f"Bearer {token}"},
                json={
                    # TODO: for IdWinC per ogni consulente? mi sa di si...
                    # e quelli senza consulente???
                        #"trainingReferenceOperatorIds": [8],
                        "mainReferenceOperatorIds": [user.IdWinC],
                        "customerStatus": 1,
                        "analysisClassName": "FliptonicAppDb.ViewModels.Analysis.Customers.CustomersStatsSearch",
                        "analysisResultMode": 0,
                        "exportCsv": False,
                        "analysisController": "Analysis_Customers"
                    }
            )
            await save_customer(response, user)

async def save_customer(response, user: IdModel):
    if response.status_code == status.HTTP_200_OK:
        all_customers: list[Customer] = find_all_db_customers()
        # se son clienti nuovi inserisco
        # se ce li ho già e hanno qualche campo diverso allora aggiorno solo i campi necessari
        to_create: List[dict] = []
        customers_item = CustomerItem(**response.json())
        print(f"init saving data for {user.IdWinC}: {len(customers_item.data.dataSet)}")
        for item in customers_item.data.dataSet:
            customer: Customer | None = next((c for c in all_customers if int(c.IdWinC) == item.customerId), None) if len(all_customers) > 0 else None
            if customer is None or((item.customerLastAccess and parser.parse(item.customerLastAccess).date() != customer.LastAccessDate) or (item.medicalCertificateValidity and parser.parse(item.medicalCertificateValidity).date() != customer.MedicalCertificateValidity)):
                to_create.append(
                    CustomerRequest(
                        Enabled=True,
                        IdWinC=item.customerId,
                        BirthDate=item.dateOfBirth,
                        LastAccessDate=item.customerLastAccess,
                        # TODO: se si aggiorna anche questo allora lascio senza if??
                        TrainingOperatorId= customer.TrainingOperatorId if customer is not None else (item.trainingReferenceOperatorId if item.trainingReferenceOperatorId is not None else 1),
                        Name=item.customerName,
                        MedicalCertificateValidity=item.medicalCertificateValidity
                    ).model_dump()
                )

        if to_create:
            result = supabase.table('Customer').upsert(
                to_create,
                on_conflict='IdWinC',
                count=CountMethod.exact
            ).execute()
            total_affected = len(result.data) if result.data else len(to_create)
            print(f"Upsert completato: {total_affected} record processati")

    else:
        # TODO: inviare mail al servicecff
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate credentials'
        )

# TODO: da decidere ogni quanto devono aggiornarsi, ogni MESE?
@router.post('/subscription', status_code=status.HTTP_204_NO_CONTENT)
async def create_subscriptions():
    token = await auth_manager.get_token(usr, psw)
    api_url = f"{curling}{company}/Analysis/packages"
    async with httpx.AsyncClient() as client:
        response = await client.get(api_url, headers={"Authorization": f"Bearer {token}"})

        if response.status_code == status.HTTP_200_OK:
            subscriptions_item = DomainResponse(**response.json())
            active_subs: List[dict] = []
            disactive_subs: List[Subscription] = []
            for group in subscriptions_item.data.itemsGroups:
                for item in group.items:
                    if item.active:
                        active_subs.append(
                            Subscription(
                                IdWinC=int(item.value),
                                Enabled=True,
                                Description=item.label,
                            ).model_dump()
                        )
                    else:
                        disactive_subs.append(
                            Subscription(
                                IdWinC=int(item.value),
                                Enabled=True,
                                Description=item.label,
                            )
                        )

            if active_subs:
                result = supabase.table('Subscription').upsert(
                    active_subs,
                    on_conflict='IdWinC',
                    count=CountMethod.exact
                ).execute()
                total_affected = len(result.data) if result.data else len(active_subs)
                print(f"Upsert completato: {total_affected} record processati")

            if disactive_subs:
                subs_db = supabase.table("Subscription") \
                    .select("IdWinC") \
                    .eq("Enabled", True) \
                    .execute()
                subscriptions: List[IdModel] = [IdModel(**item) for item in subs_db.data]
                db_active_ids = {sub.IdWinC for sub in subscriptions}
                external_disabled_ids = {sub.IdWinC for sub in disactive_subs}
                ids_to_disable = db_active_ids.intersection(external_disabled_ids)
                if ids_to_disable:
                    print(f"Disattivazione di {len(ids_to_disable)} subscription")

                    result = supabase.table("Subscription").update({
                        'Enabled': False,
                    }).in_('IdWinC', list(ids_to_disable)).execute()
                    print(f"Disattivate {len(result.data)} subscription")

            #TODO: riattivare record disabilitati se ora sono attivi
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate credentials'
            )

def find_all_db_users_id() ->  list[IdModel]:
    users_db = supabase.table("User") \
        .select("IdWinC") \
        .execute()
        # TODO: poi prendere solo gli attivi
        #.eq("Enabled", True) \

    return [IdModel(**item) for item in users_db.data]

def find_all_db_customers() ->  list[Customer]:
    customers_db = supabase.table("Customer") \
        .select("*") \
        .execute()

    return [Customer(**item) for item in customers_db.data]