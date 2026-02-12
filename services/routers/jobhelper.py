from typing import List
from dateutil import parser
from fastapi import APIRouter, HTTPException
from postgrest import CountMethod
from fastapi import status
import os
from dotenv import load_dotenv
import httpx
from models.customerResponse import CustomerItem
from models.models import Subscription, Consultant, Customer, IdModel
from models.salesResponse import SalesResponse
from models.setmodels import CustomerRequest, CustomerSubscriptionRequest, SubscriptionRequest
from models.domainResponse import DomainResponse
from .auth_manager import auth_manager
from database import supabase
from collections import Counter
import json

load_dotenv()
curling: str = os.getenv("WELLNESS_URL")
company: str = os.getenv("WELLNESS_COMPANY")
usr: str = os.getenv("USN")
psw: str = os.getenv("PSW")
activity_sales: list[int]=json.loads(os.getenv("ACTIVITY_SALES", "[]"))
days_range:int = int(os.getenv("DAYS_RANGE"))
# Timeout personalizzato
timeout = httpx.Timeout(
    connect=10.0,  # Tempo per connettersi
    read=60.0,  # Tempo per leggere la risposta
    write=10.0,  # Tempo per scrivere
    pool=10.0  # Tempo per ottenere connessione dal pool
)
router = APIRouter(
    prefix='/job',
    tags=['job']
)

# TODO: prevedere eliminazione delle cose vecchie non più usate che caricano il db per nulla???
# si da un anno a sta parte le schede, quando un abbonamento non ha schede attive elimino
# personal training? ogni quanto?

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
    async with httpx.AsyncClient(timeout=timeout) as client:
        all_users: list[IdModel] = await find_all_db_users_id()

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
        all_customers: list[Customer] = await find_all_db_customers()
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
            to_create: List[dict] = []
            for group in subscriptions_item.data.itemsGroups:
                for item in group.items:
                    to_create.append(
                        SubscriptionRequest(
                            IdWinC=int(item.value),
                            Enabled=item.active,
                            Description=item.label,
                        ).model_dump()
                    )

            if to_create:
                result = supabase.table('Subscription').upsert(
                    to_create,
                    on_conflict='IdWinC',
                    count=CountMethod.exact
                ).execute()
                total_affected = len(result.data) if result.data else len(to_create)
                print(f"Upsert completato: {total_affected} record processati")
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate credentials'
            )

# TODO: da decidere ogni quanto devono aggiornarsi, ogni GIORNO?
''' analysis_sales
                "saleDate_range_start": "2025-01-01T00:00:00",
                "saleDate_range_end": "2025-02-28T00:00:00",
                "salePurposeIds": [0],
                "activityTypeIds": activity_sales,
                "subscriptionPeriodEnd_range_start": "2026-02-04",
'''
@router.post('/customer/subscription', status_code=status.HTTP_204_NO_CONTENT)
async def create_customer_subscription():
    token = await auth_manager.get_token(usr, psw)
    api_url = f"{curling}{company}/analysis/analysis_authorizations/search"
    async with httpx.AsyncClient(timeout=timeout) as client:
        days = 0
        while days < 450:
            response = await client.post(
                api_url,
                headers={"Authorization": f"Bearer {token}"},
                json={
                    "activityTypeIds": activity_sales,
                    "authEnd_range_start_days_delta": days,
                    "authEnd_range_end_days_delta": 450,
                    "analysisClassName": "FliptonicAppDb.ViewModels.Analysis.Authorizations.AuthorizationExpirationStatsSearch",
                    "analysisResultMode": 0,
                    "customerStatus": 1,
                    "excludeAccessCountAuthorizations": False,
                    "includeAuthorizationsWithoutExpirationDate": False,
                    "exportCsv": False,
                    "analysisController": "Analysis_Authorizations"
                }
            )

            if response.status_code == status.HTTP_200_OK:
                sales_item = SalesResponse(**response.json())
                to_create: list[dict] = []
                subscriptions = await find_all_db_subscriptions()

                for item in sales_item.data.dataSet:
                    subscription: Subscription | None = next((c for c in subscriptions if c.Description == item.renewalSalePackageName or c.Description == item.salePackageName),
                                                     None) if len(subscriptions) > 0 else None
                    #todo: capire come fare a prendere con main operator a null
                    if subscription and item.mainReferenceOperatorId:
                        to_create.append(
                            CustomerSubscriptionRequest(
                                CustomerId= item.customerId,
                                IdWinC=item.saleId,
                                CreatedAt=item.saleDate,
                                EndDate=item.end,
                                StartDate=item.start,
                                SubscriptionId=subscription.IdWinC,
                                Renewed=item.renewed,
                            ).model_dump()
                        )
                    else:
                        print(f'sub name: {item.renewalSalePackageName} sale pkg name: {item.salePackageName}')

                ids = [item.get("IdWinC") for item in to_create]
                print(f"Duplicates days{days}: {[id for id, count in Counter(ids).items() if count > 1]}")

                if to_create:
                    result = supabase.table('CustomerSubscription').upsert(
                        to_create,
                        on_conflict='IdWinC',
                        count=CountMethod.exact
                    ).execute()
                    total_affected = len(result.data) if result.data else len(to_create)
                    print(f"Upsert completato: {total_affected} record processati")
                    days += days_range
            else:
                print(response.status_code)
                print(response.json())
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate credentials'
                )

async def find_all_db_users_id() ->  list[IdModel]:
    users_db = supabase.table("User") \
        .select("IdWinC") \
        .execute()
        # TODO: poi prendere solo gli attivi
        #.eq("Enabled", True) \

    return [IdModel(**item) for item in users_db.data]

async def find_all_db_customers() ->  list[Customer]:
    customers_db = supabase.table("Customer") \
        .select("*") \
        .execute()

    return [Customer(**item) for item in customers_db.data]

async def find_all_db_subscriptions() ->  list[Subscription]:
    subscriptions_db = supabase.table("Subscription") \
        .select("*") \
        .eq('ValidAsSubscription', True)\
        .execute()

    return [Subscription(**item) for item in subscriptions_db.data]