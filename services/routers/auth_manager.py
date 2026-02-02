from datetime import datetime, timedelta
from typing import Optional
import httpx
import os
from dotenv import load_dotenv
from fastapi import HTTPException, status

load_dotenv()

class ExternalAPIAuth:
    def __init__(self):
        self.token: Optional[str] = None
        self.token_expiry: Optional[datetime] = None
        self.api_url = os.getenv("WELLNESS_URL")

    async def get_token(self, username: str, password: str) -> str:
        # Se il token è valido, riutilizzalo
        if self.token and self.token_expiry and datetime.now() < self.token_expiry:
            return self.token

        print("login to do")
        # Altrimenti fai il login
        return await self._login(username, password)

    async def _login(self, username: str, password: str) -> str:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.api_url}/login",
                json={"username": username, "password": password}
            )
            if response.status_code == status.HTTP_200_OK:
                data = response.json()

                self.token = data.get('data').get('token')
                # Imposta scadenza (es. 1 ora)
                self.token_expiry = datetime.now() + timedelta(hours=1)

                return self.token
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate credentials'
                )

# Singleton instance
auth_manager = ExternalAPIAuth()