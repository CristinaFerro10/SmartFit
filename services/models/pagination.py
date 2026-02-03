from pydantic import BaseModel
from typing import Generic, TypeVar, List

# Response model generico
T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    '''
    page: int
    page_size: int
    total_pages: int
    '''

# Classe base
class PaginationParams(BaseModel):
    page: int
    page_size: int

    def get_offset(self) -> int:
        return (self.page - 1) * self.page_size
