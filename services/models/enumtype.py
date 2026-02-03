from enum import Enum

class CustomerWarning(str, Enum):
    Expired = 'expired'
    Warning = 'warning'
    Rescheduled = 'rescheduled'
    Renewed = 'renewed'
    Ok = 'ok'

class CustomerOrderBy(str, Enum):
    Default = 'default'
    NameAsc = 'name_asc'
    NameDesc = 'name_desc'
    LastAccessDate = 'last_access_date'
    LastCard = 'last_card'

class Role(str, Enum):
    Secretary = 'SGR'
    Consultant = 'IST'
    Admin = 'ADM'