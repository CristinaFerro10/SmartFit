import { Customer } from './types';

// Helper function to get a date X days ago
function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// Helper function to get a date X days in the future
function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

// Helper function to generate unique ID
function generateId(): string {
  return `wp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const mockClients: Customer[] = [
  {
    IdWinC: '1',
    Name: 'Marco Rossi',
    TrainingOperatorName: 'Davide',
    LastCardDateStart: daysAgo(45), // 45 days ago
    DurationDays: 30, // 30 day plan
    SubscriptionType: 'Premium',
    SubscriptionDateEnd: daysFromNow(60),
    subscriptionMonths: 3,
    LastAccessDate: daysAgo(2),
    Description: 'Problemi al ginocchio sinistro',
    workoutPlansUsed: 1,
    lastSubscriptionRenewal: daysAgo(30),
    firstMembershipDate: daysAgo(400), // Long-time client
    workoutPlanHistory: [
      {
        id: generateId(),
        createdDate: daysAgo(400),
        instructor: 'Davide',
        planType: 'first-new',
        isActive: true,
      },
      {
        id: generateId(),
        createdDate: daysAgo(45),
        instructor: 'Davide',
        planType: 'change',
        isActive: true,
      },
    ],
    individualTraining: {
      totalSessions: 10,
      usedSessions: 3,
      sessions: [
        {
          id: 'it-1-1',
          completedDate: daysAgo(20),
          instructor: 'Davide',
          isActive: true,
        },
        {
          id: 'it-1-2',
          completedDate: daysAgo(13),
          instructor: 'Davide',
          isActive: true,
        },
        {
          id: 'it-1-3',
          completedDate: daysAgo(5),
          instructor: 'Davide',
          isActive: true,
        },
      ],
    },
  },
  {
    IdWinC: '2',
    Name: 'Laura Bianchi',
    TrainingOperatorName: 'Davide',
    LastCardDateStart: daysAgo(10),
    DurationDays: 45,
    SubscriptionType: 'Base',
    SubscriptionDateEnd: daysFromNow(30),
    subscriptionMonths: 1,
    LastAccessDate: daysAgo(1),
    workoutPlansUsed: 0,
    lastSubscriptionRenewal: daysAgo(15),
    firstMembershipDate: daysAgo(15), // New client
    workoutPlanHistory: [
      {
        id: generateId(),
        createdDate: daysAgo(10),
        instructor: 'Davide',
        planType: 'first-new',
        isActive: true,
      },
    ],
  },
  {
    IdWinC: '3',
    Name: 'Giuseppe Verdi',
    TrainingOperatorName: 'Davide',
    LastCardDateStart: daysAgo(25),
    DurationDays: 28,
    SubscriptionType: 'Base',
    SubscriptionDateEnd: daysFromNow(90),
    subscriptionMonths: 3,
    LastAccessDate: daysAgo(3),
    workoutPlansUsed: 0,
    lastSubscriptionRenewal: daysAgo(60),
    firstMembershipDate: daysAgo(180),
    IsMDSSub: true, // MDS client
    workoutPlanHistory: [
      {
        id: generateId(),
        createdDate: daysAgo(180),
        instructor: 'Davide',
        planType: 'first-new',
        isActive: true,
      },
      {
        id: generateId(),
        createdDate: daysAgo(60),
        instructor: 'Davide',
        planType: 'first-renewal',
        isActive: true,
      },
    ],
  },
  {
    IdWinC: '4',
    Name: 'Anna Ferrari',
    TrainingOperatorName: 'Davide',
    LastCardDateStart: daysAgo(5),
    DurationDays: 60,
    SubscriptionType: 'Premium',
    SubscriptionDateEnd: daysFromNow(120),
    subscriptionMonths: 12,
    LastAccessDate: daysAgo(1),
    workoutPlansUsed: 1,
    lastSubscriptionRenewal: daysAgo(60),
    firstMembershipDate: daysAgo(100), // Long-time client
    workoutPlanHistory: [
      {
        id: generateId(),
        createdDate: daysAgo(100),
        instructor: 'Davide',
        planType: 'first-new',
        isActive: true,
      },
      {
        id: generateId(),
        createdDate: daysAgo(5),
        instructor: 'Davide',
        planType: 'change',
        isActive: true,
      },
    ],
  },
  {
    IdWinC: '5',
    Name: 'Luca Romano',
    TrainingOperatorName: 'Davide',
    LastCardDateStart: daysAgo(60),
    DurationDays: 30,
    SubscriptionType: 'Base',
    SubscriptionDateEnd: daysFromNow(15),
    subscriptionMonths: 1,
    LastAccessDate: daysAgo(10),
    accessFrequency: 1,
    Description: 'A rischio abbandono',
    workoutPlansUsed: 1,
    lastSubscriptionRenewal: daysAgo(20),
    firstMembershipDate: daysAgo(100), // Long-time client
    workoutPlanHistory: [
      {
        id: generateId(),
        createdDate: daysAgo(100),
        instructor: 'Davide',
        planType: 'first-new',
        isActive: true,
      },
      {
        id: generateId(),
        createdDate: daysAgo(60),
        instructor: 'Davide',
        planType: 'change',
        isActive: true,
      },
    ],
  },
  {
    IdWinC: '6',
    Name: 'Francesca Marino',
    TrainingOperatorName: 'Davide',
    LastCardDateStart: daysAgo(20),
    DurationDays: 30,
    SubscriptionType: 'Base',
    SubscriptionDateEnd: daysFromNow(45),
    subscriptionMonths: 3,
    LastAccessDate: daysAgo(3),
    accessFrequency: 3,
    workoutPlansUsed: 0,
    lastSubscriptionRenewal: daysAgo(25),
    firstMembershipDate: daysAgo(50), // Long-time client
    workoutPlanHistory: [
      {
        id: generateId(),
        createdDate: daysAgo(50),
        instructor: 'Davide',
        planType: 'first-new',
        isActive: true,
      },
      {
        id: generateId(),
        createdDate: daysAgo(20),
        instructor: 'Davide',
        planType: 'change',
        isActive: true,
      },
    ],
  },
  {
    IdWinC: '7',
    Name: 'Roberto Colombo',
    TrainingOperatorName: 'Davide',
    LastCardDateStart: daysAgo(3),
    DurationDays: 45,
    SubscriptionType: 'Premium',
    SubscriptionDateEnd: daysFromNow(150),
    subscriptionMonths: 12,
    LastAccessDate: daysAgo(1),
    accessFrequency: 4,
    workoutPlansUsed: 0,
    lastSubscriptionRenewal: daysAgo(10),
    firstMembershipDate: daysAgo(300), // Long-time client
    workoutPlanHistory: [
      {
        id: generateId(),
        createdDate: daysAgo(300),
        instructor: 'Davide',
        planType: 'first-new',
        isActive: true,
      },
      {
        id: generateId(),
        createdDate: daysAgo(3),
        instructor: 'Davide',
        planType: 'change',
        isActive: true,
      },
    ],
  },
  {
    IdWinC: '8',
    Name: 'Sofia Esposito',
    TrainingOperatorName: 'Davide',
    LastCardDateStart: daysAgo(35),
    DurationDays: 30,
    SubscriptionType: 'Base',
    SubscriptionDateEnd: daysFromNow(20),
    subscriptionMonths: 1,
    LastAccessDate: daysAgo(4),
    accessFrequency: 2,
    workoutPlansUsed: 1,
    lastSubscriptionRenewal: daysAgo(10),
    firstMembershipDate: daysAgo(100), // Long-time client
    IsMDSSub: true, // MDS client
    workoutPlanHistory: [
      {
        id: generateId(),
        createdDate: daysAgo(100),
        instructor: 'Davide',
        planType: 'first-new',
        isActive: true,
      },
      {
        id: generateId(),
        createdDate: daysAgo(35),
        instructor: 'Davide',
        planType: 'change',
        isActive: true,
      },
    ],
  },
  {
    IdWinC: '9',
    Name: 'Andrea Ricci',
    TrainingOperatorName: 'Davide',
    LastCardDateStart: daysAgo(15),
    DurationDays: 30,
    SubscriptionType: 'Premium',
    SubscriptionDateEnd: daysFromNow(100),
    subscriptionMonths: 3,
    LastAccessDate: daysAgo(2),
    accessFrequency: 4,
    workoutPlansUsed: 1,
    lastSubscriptionRenewal: daysAgo(30),
    firstMembershipDate: daysAgo(200), // Long-time client
    workoutPlanHistory: [
      {
        id: generateId(),
        createdDate: daysAgo(200),
        instructor: 'Davide',
        planType: 'first-new',
        isActive: true,
      },
      {
        id: generateId(),
        createdDate: daysAgo(15),
        instructor: 'Davide',
        planType: 'change',
        isActive: true,
      },
    ],
  },
  {
    IdWinC: '10',
    Name: 'Chiara Gallo',
    TrainingOperatorName: 'Davide',
    LastCardDateStart: daysAgo(55),
    DurationDays: 30,
    SubscriptionType: 'Base',
    SubscriptionDateEnd: daysFromNow(10),
    subscriptionMonths: 1,
    LastAccessDate: daysAgo(12),
    accessFrequency: 1,
    Description: 'Non risponde ai messaggi',
    workoutPlansUsed: 1,
    lastSubscriptionRenewal: daysAgo(20),
    firstMembershipDate: daysAgo(150), // Long-time client
    workoutPlanHistory: [
      {
        id: generateId(),
        createdDate: daysAgo(150),
        instructor: 'Davide',
        planType: 'first-new',
        isActive: true,
      },
      {
        id: generateId(),
        createdDate: daysAgo(55),
        instructor: 'Davide',
        planType: 'change',
        isActive: true,
      },
    ],
  },
  {
    IdWinC: '11',
    Name: 'Matteo Costa',
    TrainingOperatorName: 'Davide',
    LastCardDateStart: daysAgo(7),
    DurationDays: 60,
    SubscriptionType: 'Premium',
    SubscriptionDateEnd: daysFromNow(200),
    subscriptionMonths: 12,
    LastAccessDate: daysAgo(1),
    accessFrequency: 5,
    workoutPlansUsed: 0,
    lastSubscriptionRenewal: daysAgo(30),
    firstMembershipDate: daysAgo(250), // Long-time client
    workoutPlanHistory: [
      {
        id: generateId(),
        createdDate: daysAgo(250),
        instructor: 'Davide',
        planType: 'first-new',
        isActive: true,
      },
      {
        id: generateId(),
        createdDate: daysAgo(7),
        instructor: 'Davide',
        planType: 'change',
        isActive: true,
      },
    ],
  },
  {
    IdWinC: '12',
    Name: 'Elena Fontana',
    TrainingOperatorName: 'Davide',
    LastCardDateStart: daysAgo(40),
    DurationDays: 30,
    SubscriptionType: 'Base',
    SubscriptionDateEnd: daysFromNow(50),
    subscriptionMonths: 3,
    LastAccessDate: daysAgo(5),
    accessFrequency: 2,
    workoutPlansUsed: 2,
    lastSubscriptionRenewal: daysAgo(60),
    firstMembershipDate: daysAgo(100), // Long-time client
    workoutPlanHistory: [
      {
        id: generateId(),
        createdDate: daysAgo(100),
        instructor: 'Davide',
        planType: 'first-new',
        isActive: true,
      },
      {
        id: generateId(),
        createdDate: daysAgo(40),
        instructor: 'Davide',
        planType: 'change',
        isActive: true,
      },
    ],
  },
  {
    IdWinC: '13',
    Name: 'Paolo Conti',
    TrainingOperatorName: 'Davide',
    LastCardDateStart: daysAgo(25),
    DurationDays: 45,
    SubscriptionType: 'Premium',
    SubscriptionDateEnd: daysFromNow(80),
    subscriptionMonths: 12,
    LastAccessDate: daysAgo(2),
    accessFrequency: 3,
    workoutPlansUsed: 1,
    lastSubscriptionRenewal: daysAgo(100),
    firstMembershipDate: daysAgo(300), // Long-time client
    workoutPlanHistory: [
      {
        id: generateId(),
        createdDate: daysAgo(300),
        instructor: 'Davide',
        planType: 'first-new',
        isActive: true,
      },
      {
        id: generateId(),
        createdDate: daysAgo(25),
        instructor: 'Davide',
        planType: 'change',
        isActive: true,
      },
    ],
  },
  {
    IdWinC: '14',
    Name: 'Giulia Mancini',
    TrainingOperatorName: 'Davide',
    LastCardDateStart: daysAgo(1),
    DurationDays: 30,
    SubscriptionType: 'Base',
    SubscriptionDateEnd: daysFromNow(40),
    subscriptionMonths: 1,
    LastAccessDate: daysAgo(1),
    accessFrequency: 4,
    workoutPlansUsed: 0,
    lastSubscriptionRenewal: daysAgo(5),
    firstMembershipDate: daysAgo(50), // Long-time client
    workoutPlanHistory: [
      {
        id: generateId(),
        createdDate: daysAgo(50),
        instructor: 'Davide',
        planType: 'first-new',
        isActive: true,
      },
      {
        id: generateId(),
        createdDate: daysAgo(1),
        instructor: 'Davide',
        planType: 'change',
        isActive: true,
      },
    ],
  },
  {
    IdWinC: '15',
    Name: 'Davide Rizzo',
    TrainingOperatorName: 'Davide',
    LastCardDateStart: daysAgo(65),
    DurationDays: 30,
    SubscriptionType: 'Premium',
    SubscriptionDateEnd: daysFromNow(5),
    subscriptionMonths: 12,
    LastAccessDate: daysAgo(15),
    accessFrequency: 1,
    Description: 'Urgente: da contattare',
    workoutPlansUsed: 4,
    lastSubscriptionRenewal: daysAgo(200),
    firstMembershipDate: daysAgo(400), // Long-time client
    workoutPlanHistory: [
      {
        id: generateId(),
        createdDate: daysAgo(400),
        instructor: 'Davide',
        planType: 'first-new',
        isActive: true,
      },
      {
        id: generateId(),
        createdDate: daysAgo(65),
        instructor: 'Davide',
        planType: 'change',
        isActive: true,
      },
    ],
  },
  // Clients with workout plans created THIS MONTH (for monthly counter testing)
  {
    IdWinC: '16',
    Name: 'Simone Bassi',
    TrainingOperatorName: 'Davide',
    LastCardDateStart: daysAgo(3),
    DurationDays: 30,
    SubscriptionType: 'Base',
    SubscriptionDateEnd: daysFromNow(35),
    subscriptionMonths: 1,
    LastAccessDate: daysAgo(1),
    accessFrequency: 4,
    workoutPlansUsed: 0,
    lastSubscriptionRenewal: daysAgo(3),
    firstMembershipDate: daysAgo(3), // Brand new client
    workoutPlanHistory: [
      {
        id: generateId(),
        createdDate: daysAgo(3), // This month - first plan for new membership
        instructor: 'Davide',
        planType: 'first-new',
        isActive: true,
      },
    ],
  },
  {
    IdWinC: '17',
    Name: 'Valentina Serra',
    TrainingOperatorName: 'Davide',
    LastCardDateStart: daysAgo(8),
    DurationDays: 45,
    SubscriptionType: 'Premium',
    SubscriptionDateEnd: daysFromNow(110),
    subscriptionMonths: 12,
    LastAccessDate: daysAgo(2),
    accessFrequency: 5,
    workoutPlansUsed: 0,
    lastSubscriptionRenewal: daysAgo(8),
    firstMembershipDate: daysAgo(200), // Renewal
    IsMDSSub: true, // MDS client
    workoutPlanHistory: [
      {
        id: generateId(),
        createdDate: daysAgo(200),
        instructor: 'Davide',
        planType: 'first-new',
        isActive: true,
      },
      {
        id: generateId(),
        createdDate: daysAgo(8), // This month - first plan after renewal
        instructor: 'Davide',
        planType: 'first-renewal',
        isActive: true,
      },
    ],
  },
  {
    IdWinC: '18',
    Name: 'Federico Moretti',
    TrainingOperatorName: 'Davide',
    LastCardDateStart: daysAgo(12),
    DurationDays: 30,
    SubscriptionType: 'Premium',
    SubscriptionDateEnd: daysFromNow(70),
    subscriptionMonths: 3,
    LastAccessDate: daysAgo(1),
    accessFrequency: 4,
    workoutPlansUsed: 2,
    lastSubscriptionRenewal: daysAgo(60),
    firstMembershipDate: daysAgo(180), // Long-time client
    workoutPlanHistory: [
      {
        id: generateId(),
        createdDate: daysAgo(180),
        instructor: 'Davide',
        planType: 'first-new',
        isActive: true,
      },
      {
        id: generateId(),
        createdDate: daysAgo(100),
        instructor: 'Davide',
        planType: 'change',
        isActive: true,
      },
      {
        id: generateId(),
        createdDate: daysAgo(12), // This month - plan change
        instructor: 'Davide',
        planType: 'change',
        isActive: true,
      },
    ],
  },
  {
    IdWinC: '19',
    Name: 'Alessia Santoro',
    TrainingOperatorName: 'Davide',
    LastCardDateStart: daysAgo(5),
    DurationDays: 60,
    SubscriptionType: 'Premium',
    SubscriptionDateEnd: daysFromNow(180),
    subscriptionMonths: 12,
    LastAccessDate: daysAgo(1),
    accessFrequency: 5,
    workoutPlansUsed: 1,
    lastSubscriptionRenewal: daysAgo(50),
    firstMembershipDate: daysAgo(300), // Long-time client
    workoutPlanHistory: [
      {
        id: generateId(),
        createdDate: daysAgo(300),
        instructor: 'Davide',
        planType: 'first-new',
        isActive: true,
      },
      {
        id: generateId(),
        createdDate: daysAgo(150),
        instructor: 'Davide',
        planType: 'change',
        isActive: true,
      },
      {
        id: generateId(),
        createdDate: daysAgo(5), // This month - plan change
        instructor: 'Davide',
        planType: 'change',
        isActive: true,
      },
    ],
  },
  {
    IdWinC: '20',
    Name: 'Lorenzo Pellegrini',
    TrainingOperatorName: 'Davide',
    LastCardDateStart: daysAgo(15),
    DurationDays: 30,
    SubscriptionType: 'Base',
    SubscriptionDateEnd: daysFromNow(25),
    subscriptionMonths: 1,
    LastAccessDate: daysAgo(3),
    accessFrequency: 3,
    workoutPlansUsed: 0,
    lastSubscriptionRenewal: daysAgo(15),
    firstMembershipDate: daysAgo(15), // Brand new client
    workoutPlanHistory: [
      {
        id: generateId(),
        createdDate: daysAgo(15), // This month - first plan for new membership
        instructor: 'Davide',
        planType: 'first-new',
        isActive: true,
      },
    ],
  },
];