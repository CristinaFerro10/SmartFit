export interface CustomerDashboardFilter {
    page?: number;
    page_size?: number;
    CustomerName?: string;
    TrainerOperatorId?: number;
    WarningType?: CustomerWarning;
    OrderBy?: CustomerOrderBy;
    SubscriptionExpiring?: boolean;
    IsMDSSubscription?: boolean;
}

export enum CustomerWarning {
    Expired = 'expired',
    Warning = 'warning',
    Rescheduled = 'rescheduled',
    Renewed = 'renewed',
    Ok = 'ok'
}

export enum CustomerOrderBy {
    Default = 'default',
    NameAsc = 'name_asc',
    NameDesc = 'name_desc',
    LastAccessDate = 'last_access_date',
    LastCard = 'last_card'
}