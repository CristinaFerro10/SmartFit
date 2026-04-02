from fastapi import FastAPI
from routers import auth, jobhelper, customer, card, personal_training, hc
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

ORIGIN = os.getenv("ALLOW_ORIGIN")

#UVI per dipendenze al posto di PIP
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        ORIGIN,
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
    ],
    expose_headers=["*"],
)

app.include_router(auth.router)
app.include_router(jobhelper.router)
app.include_router(customer.router)
app.include_router(card.router)
app.include_router(personal_training.router)
app.include_router(hc.router)
