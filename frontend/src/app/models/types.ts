import { CustomerWarning } from "./filtermodel";

export interface Customer {
  IdWinC: number;
  Name: string;
  TrainingOperatorName: string;
  TrainingOperatorId: string;
  LastAccessDate?: Date;
  DeadlineDays?: number;
  IsMDSSub?: boolean; // MDS (Medicina dello Sport) client identification
  SubscriptionExpiring: boolean;
  Warning: CustomerWarning;
  Renewed?: boolean; // Temporary state for rescheduled plans
  CardIncluded: number;
  CardAvailable: number;
  CardsDone: number;
  DurationDays: number;
  DurationWeek: number;
  LastCardDateStart?: Date;
  LastCardDateEnd?: Date;
  CardDays?: number;
  SubscriptionType: string;
  SubscriptionDateStart?: Date;
  SubscriptionDateEnd?: Date;
  Description?: string;
  LastCardId?: number;
  CustomerSubscriptionId?: number;
  CanUndo?: boolean; // Indicates if the last action can be undone

  workoutPlansUsed: number; // How many plan changes have been used
  lastSubscriptionRenewal: Date; // When the subscription was last renewed
  lastActionType?: 'workout' | 'rescheduled'; // Type of the last action
  individualTraining?: IndividualTrainingWallet; // Individual training sessions
  workoutPlanHistory?: WorkoutPlanRecord[]; // Monthly tracking of workout plans
  firstMembershipDate?: Date; // When the client first joined
}

export interface ClientPreviousState {
  lastWorkoutPlanDate?: Date;
  workoutPlanDuration: number;
  assignedInstructor: string;
  workoutPlansUsed: number;
  renewed: boolean;
}

export interface IndividualTrainingWallet {
  totalSessions: number; // Total purchased sessions
  usedSessions: number; // Completed sessions
  sessions: IndividualTrainingSession[]; // Session history
  // lastSessionUndo removed - now a temporary local state, not persisted
  activePackage?: IndividualTrainingPackage; // Current active package
  packageHistory?: IndividualTrainingPackage[]; // Completed packages
  singleSessions?: IndividualTrainingSingleSession[]; // Standalone single sessions (not part of packages)
}

export interface IndividualTrainingSingleSession {
  id: string;
  purchaseDate: Date;
  completedDate?: Date; // undefined if not yet completed
  instructor?: string;
  isActive: boolean; // false if undone
  status: 'available' | 'completed' | 'undone';
}

export interface IndividualTrainingPackage {
  id: string;
  initialPackageSize: 5 | 10 | 20; // Starting package size
  purchaseDate: Date;
  totalSessions: number; // Initial + integrations
  usedSessions: number; // Sessions completed in this package
  status: 'active' | 'completed';
  integrations: PackageIntegration[]; // Upgrades/additions
  sessions: IndividualTrainingSession[]; // Sessions for this package
}

export interface PackageIntegration {
  id: string;
  date: Date;
  addedSessions: number; // Number of sessions added
  upgradeType: 'upgrade-10' | 'upgrade-20' | 'addition'; // Type of integration
  description: string; // e.g., "Upgrade da 5 a 10 sessioni"
}

export interface IndividualTrainingActive {
  Id: number;
  SessionNumber: number;
  DateStart: Date;
  TotalSession: number;
  IntegrationHistory?: IntegrationHistory[];
  SessionHistory?: SessionHistory[];
  RemainingSession: number;
}

export interface IntegrationHistory {
  DateStart: Date;
  SessionAdded: number;
}

export interface SessionHistory {
  CustomerPTId: number;
  DateStart: Date;
  TrainingOperatorName: string;
  Id: number;
  CustomerId: number;
  SessionNumber: number;
}

export interface IndividualTrainingSession {
  id: string;
  completedDate: Date;
  instructor: string;
  isActive: boolean; // false if undone
}

export interface WorkoutPlanRecord {
  id: string;
  createdDate: Date;
  instructor: string;
  planType: 'first-new' | 'first-renewal' | 'change'; // Classification for monthly counters
  isActive: boolean; // false if undone or rescheduled
}

export function getWorkoutPlansIncluded(subscriptionMonths: number): number {
  switch (subscriptionMonths) {
    case 1:
      return 1;
    case 3:
      return 2;
    case 12:
      return 5;
    default:
      return 1;
  }
}

export interface UserTokenPayload {
  name: string;
  role: ('ADM' | 'IST' | 'SGR')[];
  exp: number; // Scadenza timestamp
  sub?: string; // username utente (opzionale)
  id?: number; // ID utente (opzionale)
}

export interface AuthData {
  token: string;
  name: string;
  role: ('ADM' | 'IST' | 'SGR')[];
  id?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number; // Totale elementi disponibili (per paginazione)
}

export interface CountCustomer {
  expired: number;
  warning: number;
  rescheduled: number;
  renewed: number;
  ok: number;
}

export interface SessionPackageType {
  Id: number;
  SessionNumber: number;
  Description: string;
}

export interface IndividualTrainingHistory {
  SessionId: number;
  TrainingOperatorName: string;
  DateStart: Date;
  SessionNumber: number;
  CanUndo: boolean;
  CustomerPTId: number;
  PackageHistory: any[];
}

export interface CardMonthlyParams {
  months: number[] | null;
  year: number;
  isMDSSubscription?: boolean | null;
  includeNew?: boolean | null;
  includeUpdates?: boolean | null;
  includeRenewed?: boolean | null;
  includePT?: boolean | null;
}