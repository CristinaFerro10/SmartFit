import { CustomerWarning } from './filtermodel';
import { Customer } from './types';

// Check if a date is in the current month
export function isCurrentMonth(date: Date): boolean {
  const today = new Date();
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}

// Get monthly activity counters for workout plans
export interface MonthlyActivityCounters {
  FirstCardNewCustomer: number; // First plan for new memberships
  FirstCardRenewed: number; // First plan after renewal
  UpdatesCard: number; // Subsequent plan changes
  TotalSession: number; // Individual training (PT) sessions
  TotalCards: number; // Total active plans + PT this month
  Month: number; // Month number (1-12)
}

export interface MonthPlan {
  month: number;
  name: string;
  isFuture: boolean;
  counters?: MonthlyActivityCounters;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

export function formatDateLong(date: Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function getStatusColor(status: CustomerWarning): string {
  switch (status) {
    case CustomerWarning.Expired:
      return 'text-red-600 bg-red-50 border-red-200';
    case CustomerWarning.Warning:
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case CustomerWarning.Ok:
      return 'text-green-600 bg-green-50 border-green-200';
    case CustomerWarning.Rescheduled:
      return 'text-blue-600 bg-blue-50 border-blue-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getStatusText(status: CustomerWarning): string {
  switch (status) {
    case CustomerWarning.Expired:
      return '🔴 Urgente';
    case CustomerWarning.Warning:
      return '🟡 Attenzione';
    case CustomerWarning.Ok:
      return '🟢 In Regola';
    case CustomerWarning.Rescheduled:
      return '⏸ RIPROGRAMMATA';
    default:
      return 'Sconosciuto';
  }
}

// Status chip components for Client Profile header
export function getStatusChipColors(status: CustomerWarning): {
  bg: string;
  text: string;
  dot: string;
} {
  switch (status) {
    case CustomerWarning.Expired:
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        dot: 'bg-red-500'
      };
    case CustomerWarning.Warning:
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        dot: 'bg-yellow-500'
      };
    case CustomerWarning.Ok:
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        dot: 'bg-green-500'
      };
    case CustomerWarning.Rescheduled:
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        dot: 'bg-blue-600'
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        dot: 'bg-gray-500'
      };
  }
}

export function getStatusChipLabel(status: CustomerWarning): string {
  switch (status) {
    case CustomerWarning.Expired:
      return 'Urgente';
    case CustomerWarning.Warning:
      return 'Attenzione';
    case CustomerWarning.Ok:
      return 'In Regola';
    case CustomerWarning.Rescheduled:
      return 'Riprogrammata';
    default:
      return 'Sconosciuto';
  }
}

// User-facing filter labels for Active Filters display
export function getFilterLabel(filterType: string, filterValue: string): string {
  // Status filters
  if (filterType === 'status' || filterType === 'quickFilter') {
    switch (filterValue) {
      case 'expired':
        return '🔴 Urgente';
      case 'warning':
        return '🟡 Attenzione';
      case 'ok':
        return '🟢 In regola';
      case 'rescheduled':
        return '⏸ Riprogrammata';
      case 'membershipExpiring':
        return 'Abbonamento in scadenza (30 giorni)';
      default:
        return filterValue;
    }
  }

  // Membership filters
  if (filterType === 'membership') {
    switch (filterValue) {
      case 'expiringSoon':
        return 'Abbonamento in scadenza (30 giorni)';
      default:
        return filterValue;
    }
  }

  return filterValue;
}

export function getExpirationText(client: Customer): string {
  if (client.Renewed) {
    return 'Scheda riprogrammata';
  }

  if (!client.DeadlineDays) {
    return 'Nessuna scheda attiva';
  }
  else if (client.DeadlineDays > 0) {
    return `Scade tra ${client.DeadlineDays} ${client.DeadlineDays === 1 ? 'giorno' : 'giorni'}`;
  } else if (client.DeadlineDays === 0) {
    return 'Scade oggi';
  } else {
    return `Scaduta da ${client.DeadlineDays * -1} ${client.DeadlineDays * -1 === 1 ? 'giorno' : 'giorni'}`;
  }
}