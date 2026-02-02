from typing import List
from pydantic import BaseModel

class FilterValue(BaseModel):
    key: str
    keyLabel: str
    value: str
    valueLabel: str
    displayBadge: bool

class Item(BaseModel):
    value: str
    label: str
    active: bool
    filterValues: List[FilterValue]

class ItemsGroup(BaseModel):
    groupLabel: str
    groupKey: str
    items: List[Item]

class FilterOption(BaseModel):
    label: str
    value: str

class Filter(BaseModel):
    name: str
    key: str
    filterOptions: List[FilterOption]

class Data(BaseModel):
    headerLabel: str
    itemsGroups: List[ItemsGroup]
    filters: List[Filter]

class DomainResponse(BaseModel):
    data: Data
    responseMessages: List

