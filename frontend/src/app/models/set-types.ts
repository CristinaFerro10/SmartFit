export interface CardRequest {
    CustomerId: number;
    CustomerSubscriptionId: number;
    DurationWeek: number;
    DateStart: Date;
}

export interface NewPackageRequest {
    CustomerId: number;
    SessionPTTypeId: number;
}

export interface CompleteSessionPackage {
    DateStart: Date;
    CustomerPTId: number;
}

export interface UpgradePackageRequest {
    CustomerPTId: number;
    DateStart: Date;
    SessionPTTypeId: number;
    SessionAdded: number;
}

export interface DeleteLastSessionPackage {
    CustomerPTId: number;
    SessionPTId: number;
}