from enum import Enum

class CardWarning(str, Enum):
    Expiring = 'expiring'
    Warning = 'warning'
    Rescheduled = 'rescheduled'
    Ok = 'ok'

class Role(str, Enum):
    Secretary = 'SGR'
    Consultant = 'IST'
    Admin = 'ADM'