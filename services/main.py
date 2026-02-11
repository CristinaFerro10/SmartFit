from fastapi import FastAPI
from routers import auth, user, jobhelper, customer, card, personal_training
from fastapi.middleware.cors import CORSMiddleware

#UVI per dipendenze al posto di PIP
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
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
app.include_router(user.router)
app.include_router(jobhelper.router)
app.include_router(customer.router)
app.include_router(card.router)
app.include_router(personal_training.router)
