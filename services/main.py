from fastapi import FastAPI
from routers import auth, user, jobhelper, customer, card, personal_training

app = FastAPI()

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(jobhelper.router)
app.include_router(customer.router)
app.include_router(card.router)
app.include_router(personal_training.router)
