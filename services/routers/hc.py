from fastapi import status, APIRouter

router = APIRouter(
    prefix='/hc',
    tags=['hc']
)

@router.get('/', status_code=status.HTTP_200_OK)
async def health_check():
    return 'ALIVE'