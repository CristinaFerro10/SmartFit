import { useState, useRef, useEffect } from 'react';
import { Users, Plus, CheckCircle, Undo, ChevronDown, ChevronUp, Package, X } from 'lucide-react';
import { Customer, IndividualTrainingActive, IndividualTrainingPackage, IndividualTrainingSession, IndividualTrainingSingleSession, PackageIntegration } from '../lib/types';
import { formatDate } from '../lib/utils';
import { DateSelector } from './date-selector';
import { activePackageGet } from '../services/pt-service';

const INSTRUCTOR_NAME = 'Davide';

interface IndividualTrainingProps {
  client: Customer;
}

export function IndividualTraining({ client }: IndividualTrainingProps) {
  useEffect(() => {
    fetchPT();
  }, []);

  // Find the client
  const fetchPT = async () => {
    setLoading(true);
    try {
      const response = await activePackageGet(client.IdWinC);
      setActivePT(response[0]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const [showPurchaseMenu, setShowPurchaseMenu] = useState(false);
  const [showIntegrationMenu, setShowIntegrationMenu] = useState(false);
  const [showPackageHistory, setShowPackageHistory] = useState(false);
  const [showIntegrationsHistory, setShowIntegrationsHistory] = useState(false);
  const [showSessionHistory, setShowSessionHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [activePT, setActivePT] = useState<IndividualTrainingActive | undefined>()

  // Temporary undo state - only exists during current navigation session
  const [lastSessionUndo, setLastSessionUndo] = useState<IndividualTrainingSession | null>(null);

  // Confirmation states
  const [pendingPurchaseType, setPendingPurchaseType] = useState<'single' | 5 | 10 | 20 | null>(null);
  const [pendingIntegration, setPendingIntegration] = useState<{
    sessions: number;
    type: 'integration-10' | 'integration-20';
    description: string;
  } | null>(null);

  const training = client.individualTraining;
  const hasTraining = !!training;
  const activePackage = training?.activePackage;
  const hasActivePackage = !!activePackage;
  const packageHistory = training?.packageHistory || [];
  const singleSessions = training?.singleSessions || [];

  const availableSessions = hasActivePackage ? activePackage.totalSessions - activePackage.usedSessions : 0;
  const completedSessions = hasActivePackage ? activePackage.usedSessions : 0;
  const totalSessions = hasActivePackage ? activePackage.totalSessions : 0;

  const availableSingleSessions = singleSessions.filter(s => s.status === 'available').length;
  const completedSingleSessions = singleSessions.filter(s => s.status === 'completed').length;

  // canUndo now uses local state instead of persisted training.lastSessionUndo
  const canUndo = !!lastSessionUndo;

  // Get active package sessions sorted by date (most recent first)
  const activePackageSessions = hasActivePackage
    ? activePackage.sessions.filter(s => s.isActive).sort((a, b) => b.completedDate.getTime() - a.completedDate.getTime())
    : [];

  // Get completed single sessions sorted by date (most recent first)
  const completedSingles = singleSessions
    .filter(s => s.status === 'completed' && s.completedDate)
    .sort((a, b) => b.completedDate!.getTime() - a.completedDate!.getTime());

  // Combined session history
  const allSessions = [
    ...activePackageSessions.map(s => ({ ...s, type: 'package' as const })),
    ...completedSingles.map(s => ({
      id: s.id,
      completedDate: s.completedDate!,
      instructor: s.instructor!,
      isActive: s.isActive,
      type: 'single' as const
    })),
  ].sort((a, b) => b.completedDate.getTime() - a.completedDate.getTime());

  const handleConfirmPurchase = () => {
    if (!pendingPurchaseType) return;

    if (pendingPurchaseType === 'single') {
      // Create single session
      const newSingleSession: IndividualTrainingSingleSession = {
        id: `single-${client.IdWinC}-${Date.now()}`,
        purchaseDate: new Date(),
        isActive: true,
        status: 'available',
      };

      const updatedClient = {
        ...client,
        individualTraining: {
          totalSessions: (training?.totalSessions || 0) + 1,
          usedSessions: training?.usedSessions || 0,
          sessions: training?.sessions || [],
          activePackage: training?.activePackage,
          packageHistory: training?.packageHistory || [],
          singleSessions: [...singleSessions, newSingleSession],
        },
      };

      onUpdate(updatedClient);
    } else {
      // Create new package
      const packageSize = pendingPurchaseType as 5 | 10 | 20;
      const newPackage: IndividualTrainingPackage = {
        id: `pkg-${client.IdWinC}-${Date.now()}`,
        initialPackageSize: packageSize,
        purchaseDate: new Date(),
        totalSessions: packageSize,
        usedSessions: 0,
        status: 'active',
        integrations: [],
        sessions: [],
      };

      const updatedClient = {
        ...client,
        individualTraining: {
          totalSessions: (training?.totalSessions || 0) + packageSize,
          usedSessions: training?.usedSessions || 0,
          sessions: training?.sessions || [],
          activePackage: newPackage,
          packageHistory: training?.packageHistory || [],
          singleSessions: training?.singleSessions || [],
        },
      };

      onUpdate(updatedClient);
    }

    setPendingPurchaseType(null);
    setShowPurchaseMenu(false);
  };

  const handleCancelPurchase = () => {
    setPendingPurchaseType(null);
  };

  const handleConfirmIntegration = () => {
    if (!pendingIntegration || !hasActivePackage || !training) return;

    const newIntegration: PackageIntegration = {
      id: `int-${client.IdWinC}-${Date.now()}`,
      date: new Date(),
      addedSessions: pendingIntegration.sessions,
      upgradeType: pendingIntegration.type === 'integration-10' ? 'upgrade-10' : 'upgrade-20',
      description: pendingIntegration.description,
    };

    const updatedPackage: IndividualTrainingPackage = {
      ...activePackage,
      totalSessions: activePackage.totalSessions + pendingIntegration.sessions,
      integrations: [...activePackage.integrations, newIntegration],
    };

    const updatedClient = {
      ...client,
      individualTraining: {
        ...training,
        totalSessions: training.totalSessions + pendingIntegration.sessions,
        activePackage: updatedPackage,
      },
    };

    onUpdate(updatedClient);
    setPendingIntegration(null);
    setShowIntegrationMenu(false);
  };

  const handleCancelIntegration = () => {
    setPendingIntegration(null);
  };

  const handleCompleteSession = () => {
    if (!training) return;

    // Check if we have an available single session
    if (availableSingleSessions > 0) {
      const availableSingle = singleSessions.find(s => s.status === 'available');
      if (availableSingle) {
        const updatedSingleSession: IndividualTrainingSingleSession = {
          ...availableSingle,
          completedDate: selectedDate,
          instructor: INSTRUCTOR_NAME,
          status: 'completed',
        };

        const updatedSingleSessions = singleSessions.map(s =>
          s.id === availableSingle.id ? updatedSingleSession : s
        );

        // Create a session entry for temporary undo (local state only)
        const sessionForUndo: IndividualTrainingSession = {
          id: availableSingle.id,
          completedDate: selectedDate,
          instructor: INSTRUCTOR_NAME,
          isActive: true,
        };

        // Set temporary undo state (not persisted)
        setLastSessionUndo(sessionForUndo);

        const updatedClient = {
          ...client,
          individualTraining: {
            ...training,
            usedSessions: training.usedSessions + 1,
            sessions: [...training.sessions, sessionForUndo],
            // lastSessionUndo removed - no longer persisted
            singleSessions: updatedSingleSessions,
          },
        };

        onUpdate(updatedClient);
        // Reset date to today after completing session
        setSelectedDate(new Date());
        return;
      }
    }

    // Otherwise use package session
    if (!hasActivePackage || availableSessions === 0) return;

    const newSession: IndividualTrainingSession = {
      id: `it-${client.IdWinC}-${Date.now()}`,
      completedDate: selectedDate,
      instructor: INSTRUCTOR_NAME,
      isActive: true,
    };

    const updatedSessions = [...activePackage.sessions, newSession];
    const newUsedSessions = activePackage.usedSessions + 1;
    const isPackageCompleted = newUsedSessions >= activePackage.totalSessions;

    const updatedPackage: IndividualTrainingPackage = {
      ...activePackage,
      usedSessions: newUsedSessions,
      sessions: updatedSessions,
      status: isPackageCompleted ? 'completed' : 'active',
    };

    // Set temporary undo state (not persisted)
    setLastSessionUndo(newSession);

    const updatedClient = {
      ...client,
      individualTraining: {
        ...training,
        usedSessions: training.usedSessions + 1,
        sessions: [...training.sessions, newSession],
        // lastSessionUndo removed - no longer persisted
        activePackage: isPackageCompleted ? undefined : updatedPackage,
        packageHistory: isPackageCompleted
          ? [...(training.packageHistory || []), updatedPackage]
          : training.packageHistory,
      },
    };

    onUpdate(updatedClient);
    // Reset date to today after completing session
    setSelectedDate(new Date());
  };

  const handleUndoSession = () => {
    if (!training || !lastSessionUndo) return;

    const sessionToUndo = lastSessionUndo;

    // Clear temporary undo state
    setLastSessionUndo(null);

    // Check if it's a single session
    const singleSessionIndex = singleSessions.findIndex(s => s.id === sessionToUndo.id);
    if (singleSessionIndex !== -1) {
      const updatedSingleSessions = singleSessions.map(s =>
        s.id === sessionToUndo.id
          ? { ...s, completedDate: undefined, instructor: undefined, status: 'available' as const }
          : s
      );

      const updatedGlobalSessions = training.sessions.map(s =>
        s.id === sessionToUndo.id ? { ...s, isActive: false } : s
      );

      const updatedClient = {
        ...client,
        individualTraining: {
          ...training,
          usedSessions: Math.max(0, training.usedSessions - 1),
          sessions: updatedGlobalSessions,
          // lastSessionUndo removed - no longer persisted
          singleSessions: updatedSingleSessions,
        },
      };

      onUpdate(updatedClient);
      return;
    }

    // Otherwise it's a package session
    let targetPackage = activePackage;
    let isInHistory = false;

    if (!targetPackage || !targetPackage.sessions.find(s => s.id === sessionToUndo.id)) {
      const lastHistoryPackage = packageHistory[packageHistory.length - 1];
      if (lastHistoryPackage && lastHistoryPackage.sessions.find(s => s.id === sessionToUndo.id)) {
        targetPackage = lastHistoryPackage;
        isInHistory = true;
      }
    }

    if (!targetPackage) return;

    const updatedPackageSessions = targetPackage.sessions.map(s =>
      s.id === sessionToUndo.id ? { ...s, isActive: false } : s
    );

    const updatedGlobalSessions = training.sessions.map(s =>
      s.id === sessionToUndo.id ? { ...s, isActive: false } : s
    );

    const updatedPackage: IndividualTrainingPackage = {
      ...targetPackage,
      usedSessions: Math.max(0, targetPackage.usedSessions - 1),
      sessions: updatedPackageSessions,
      status: 'active',
    };

    let updatedClient;

    if (isInHistory) {
      const updatedHistory = packageHistory.filter(p => p.id !== targetPackage.id);
      updatedClient = {
        ...client,
        individualTraining: {
          ...training,
          usedSessions: Math.max(0, training.usedSessions - 1),
          sessions: updatedGlobalSessions,
          // lastSessionUndo removed - no longer persisted
          activePackage: updatedPackage,
          packageHistory: updatedHistory,
        },
      };
    } else {
      updatedClient = {
        ...client,
        individualTraining: {
          ...training,
          usedSessions: Math.max(0, training.usedSessions - 1),
          sessions: updatedGlobalSessions,
          // lastSessionUndo removed - no longer persisted
          activePackage: updatedPackage,
        },
      };
    }

    onUpdate(updatedClient);
  };

  // Delete individual session from history
  const handleDeleteSession = (sessionId: string) => {
    if (!training) return;

    // Check if it's a single session
    const singleSessionIndex = singleSessions.findIndex(s => s.id === sessionId && s.status === 'completed');
    if (singleSessionIndex !== -1) {
      // Remove completed single session
      const updatedSingleSessions = singleSessions.filter(s => s.id !== sessionId);
      const updatedGlobalSessions = training.sessions.map(s =>
        s.id === sessionId ? { ...s, isActive: false } : s
      );

      const updatedClient = {
        ...client,
        individualTraining: {
          ...training,
          usedSessions: Math.max(0, training.usedSessions - 1),
          sessions: updatedGlobalSessions,
          singleSessions: updatedSingleSessions,
        },
      };

      onUpdate(updatedClient);
      return;
    }

    // Otherwise it's a package session - find which package
    let targetPackage = activePackage;
    let isInHistory = false;

    if (!targetPackage || !targetPackage.sessions.find(s => s.id === sessionId)) {
      const historyPackage = packageHistory.find(pkg =>
        pkg.sessions.find(s => s.id === sessionId)
      );
      if (historyPackage) {
        targetPackage = historyPackage;
        isInHistory = true;
      }
    }

    if (!targetPackage) return;

    // Remove session from package
    const updatedPackageSessions = targetPackage.sessions.map(s =>
      s.id === sessionId ? { ...s, isActive: false } : s
    );

    const updatedGlobalSessions = training.sessions.map(s =>
      s.id === sessionId ? { ...s, isActive: false } : s
    );

    const activeSessions = updatedPackageSessions.filter(s => s.isActive).length;
    const newUsedSessions = activeSessions;
    const wasCompleted = targetPackage.status === 'completed';
    const isNowActive = newUsedSessions < targetPackage.totalSessions;

    const updatedPackage: IndividualTrainingPackage = {
      ...targetPackage,
      usedSessions: newUsedSessions,
      sessions: updatedPackageSessions,
      status: isNowActive ? 'active' : 'completed',
    };

    let updatedClient;

    if (isInHistory && wasCompleted && isNowActive) {
      // Restore package to active from history
      const updatedHistory = packageHistory.filter(p => p.id !== targetPackage.id);
      updatedClient = {
        ...client,
        individualTraining: {
          ...training,
          usedSessions: Math.max(0, training.usedSessions - 1),
          sessions: updatedGlobalSessions,
          activePackage: updatedPackage,
          packageHistory: updatedHistory,
        },
      };
    } else if (isInHistory) {
      // Just update in history
      const updatedHistory = packageHistory.map(p =>
        p.id === targetPackage.id ? updatedPackage : p
      );
      updatedClient = {
        ...client,
        individualTraining: {
          ...training,
          usedSessions: Math.max(0, training.usedSessions - 1),
          sessions: updatedGlobalSessions,
          packageHistory: updatedHistory,
        },
      };
    } else {
      // Update active package
      updatedClient = {
        ...client,
        individualTraining: {
          ...training,
          usedSessions: Math.max(0, training.usedSessions - 1),
          sessions: updatedGlobalSessions,
          activePackage: updatedPackage,
        },
      };
    }

    onUpdate(updatedClient);
  };

  const progressPercentage = activePT && activePT.SessionNumber > 0
    ? (activePT.TotalSession / activePT.SessionNumber) * 100
    : 0;

  const remainingSessions = hasActivePackage ? totalSessions - completedSessions : 0;

  // Get integration options
  const getIntegrationOptions = () => {
    if (!hasActivePackage) return [];

    const currentSize = activePackage.initialPackageSize;
    const currentTotal = activePackage.totalSessions;
    const options = [];

    // Pacchetto 5 → può integrare a 10 o 20
    if (currentSize === 5) {
      if (currentTotal < 10) {
        options.push({
          sessions: 10 - currentTotal,
          type: 'integration-10' as const,
          label: 'Integrazione a 10 sessioni',
          description: `Aggiungi ${10 - currentTotal} sessioni al pacchetto`,
        });
      }
      if (currentTotal < 20) {
        options.push({
          sessions: 20 - currentTotal,
          type: 'integration-20' as const,
          label: 'Integrazione a 20 sessioni',
          description: `Aggiungi ${20 - currentTotal} sessioni al pacchetto`,
        });
      }
    }

    // Pacchetto 10 → può integrare solo a 20
    if (currentSize === 10 && currentTotal < 20) {
      options.push({
        sessions: 20 - currentTotal,
        type: 'integration-20' as const,
        label: 'Integrazione a 20 sessioni',
        description: `Aggiungi ${20 - currentTotal} sessioni al pacchetto`,
      });
    }

    // Pacchetto 20 → nessuna integrazione disponibile
    // (non aggiungiamo nulla)

    return options;
  };

  const canShowIntegrationButton = hasActivePackage && getIntegrationOptions().length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          Allenamento Individuale
        </h2>

        {/* Badge: only "Attivo" or "Nessun pacchetto attivo" - NO "Concluso" */}
        {(hasActivePackage || availableSingleSessions > 0) ? (
          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded font-medium">Attivo</span>
        ) : (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Nessun pacchetto attivo</span>
        )}
      </div>

      {/* Ultima sessione completata Box */}
      {canUndo && (
        <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Ultima sessione completata
              </p>
              <p className="text-xs text-gray-600">
                {formatDate(lastSessionUndo.completedDate)} · Istruttore: {lastSessionUndo.instructor}
              </p>
            </div>
            <button
              onClick={handleUndoSession}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-colors bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200"
            >
              <Undo className="w-4 h-4" />
              Annulla ultima sessione
            </button>
          </div>
        </div>
      )}

      {/* Active Package Info */}
      {activePT && activePT.SessionNumber > 1 && (
        <div className="mb-4 bg-gray-50 border border-gray-300 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-3">
            <Package className="w-5 h-5 text-gray-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Pacchetto PT attivo {activePT.SessionNumber === 1 && (' - Sessione singola')}</h3>
              <p className="text-sm text-gray-700">
                Totale sessioni: <strong>{activePT.SessionNumber}</strong> · Completate: <strong>{activePT.TotalSession}</strong> · Rimanenti: <strong>{activePT.RemainingSession}</strong>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Data acquisto: {formatDate(new Date(activePT.DateStart))}
              </p>
            </div>
          </div>

          {/* Progress Bar with Progressive Colors */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all ${progressPercentage <= 60
                  ? 'bg-green-500'
                  : progressPercentage <= 90
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                  }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Integrations History Toggle */}
          {activePackage.integrations.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setShowIntegrationsHistory(!showIntegrationsHistory)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                {showIntegrationsHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Storico integrazioni ({activePackage.integrations.length})
              </button>

              {showIntegrationsHistory && (
                <div className="mt-2 space-y-2">
                  {activePackage.integrations.map((integration) => (
                    <div key={integration.id} className="bg-white border border-gray-300 rounded p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{integration.description}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {formatDate(integration.date)} · +{integration.addedSessions} sessioni
                          </p>
                        </div>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          Integrazione
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Session History for Active Package */}
          {activePackageSessions.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setShowSessionHistory(!showSessionHistory)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                {showSessionHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Storico sessioni del pacchetto ({activePackageSessions.length})
              </button>

              {showSessionHistory && (
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                  {activePackageSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-300 rounded text-sm group"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {formatDate(session.completedDate)}
                        </p>
                        <p className="text-xs text-gray-600">
                          Istruttore: {session.instructor}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                          title="Annulla sessione"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pending Purchase Confirmation */}
      {pendingPurchaseType && (
        <div className="mb-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900 mb-1">
                ⚠️ Conferma operazione
              </p>
              <p className="text-sm text-yellow-800">
                {pendingPurchaseType === 'single'
                  ? 'Stai per acquistare una sessione individuale singola.'
                  : `Stai per creare un pacchetto da ${pendingPurchaseType} sessioni.`
                }
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmPurchase}
                className="px-3 py-2 rounded-lg font-medium text-sm bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Conferma
              </button>
              <button
                onClick={handleCancelPurchase}
                className="px-3 py-2 rounded-lg font-medium text-sm bg-gray-600 text-white hover:bg-gray-700 transition-colors"
              >
                Annulla operazione
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Integration Confirmation */}
      {pendingIntegration && (
        <div className="mb-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-900 mb-1">
                ⚠️ Conferma integrazione
              </p>
              <p className="text-sm text-yellow-800">
                {pendingIntegration.description} (+{pendingIntegration.sessions} sessioni)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmIntegration}
                className="px-3 py-2 rounded-lg font-medium text-sm bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Conferma
              </button>
              <button
                onClick={handleCancelIntegration}
                className="px-3 py-2 rounded-lg font-medium text-sm bg-gray-600 text-white hover:bg-gray-700 transition-colors"
              >
                Annulla operazione
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 mb-4">
        {/* Complete Session Button */}
        {(hasActivePackage || availableSingleSessions > 0) && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleCompleteSession}
              disabled={availableSessions === 0 && availableSingleSessions === 0}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${availableSessions === 0 && availableSingleSessions === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-[0.98] shadow-md'
                }`}
            >
              <CheckCircle className="w-5 h-5" />
              Segna sessione come completata
            </button>
            <DateSelector
              onDateSelect={setSelectedDate}
              disabled={availableSessions === 0 && availableSingleSessions === 0}
            />
          </div>
        )}

        {/* Add Integration Button (only for active package with available integrations) */}
        {canShowIntegrationButton && (
          <div className="relative">
            <button
              onClick={() => setShowIntegrationMenu(!showIntegrationMenu)}
              className="w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 border-2 border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100"
            >
              <Plus className="w-5 h-5" />
              Aggiungi integrazione al pacchetto
            </button>

            {/* Integration Menu */}
            {showIntegrationMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-10">
                <div className="p-2 space-y-1">
                  {getIntegrationOptions().map((option, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setPendingIntegration(option);
                        setShowIntegrationMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-gray-500 block">{option.description}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowIntegrationMenu(false)}
                  className="w-full px-4 py-2 border-t border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
              </div>
            )}
          </div>
        )}

        {/* Purchase Button (only when no active package) */}
        {!hasActivePackage && (
          <div className="relative">
            <button
              onClick={() => setShowPurchaseMenu(!showPurchaseMenu)}
              className="w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              <Plus className="w-5 h-5" />
              {packageHistory.length > 0 ? 'Acquista pacchetto o sessione' : 'Acquista primo pacchetto o sessione'}
            </button>

            {/* Purchase Menu */}
            {showPurchaseMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-10">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setPendingPurchaseType('single');
                      setShowPurchaseMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium">Sessione singola</span>
                    <span className="text-xs text-gray-500 block">Non collegata a pacchetti</span>
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() => {
                      setPendingPurchaseType(5);
                      setShowPurchaseMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium">Pacchetto da 5 sessioni</span>
                    <span className="text-xs text-gray-500 block">Pacchetto piccolo</span>
                  </button>
                  <button
                    onClick={() => {
                      setPendingPurchaseType(10);
                      setShowPurchaseMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium">Pacchetto da 10 sessioni</span>
                    <span className="text-xs text-gray-500 block">Pacchetto medio</span>
                  </button>
                  <button
                    onClick={() => {
                      setPendingPurchaseType(20);
                      setShowPurchaseMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium">Pacchetto da 20 sessioni</span>
                    <span className="text-xs text-gray-500 block">Pacchetto grande</span>
                  </button>
                </div>
                <button
                  onClick={() => setShowPurchaseMenu(false)}
                  className="w-full px-4 py-2 border-t border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Storico pacchetti completati */}
      {(packageHistory.length > 0 || completedSingles.length > 0) && (
        <div>
          <button
            onClick={() => setShowPackageHistory(!showPackageHistory)}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium mb-2"
          >
            {showPackageHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Storico pacchetti completati ({packageHistory.length + (completedSingles.length > 0 ? 1 : 0)})
          </button>

          {showPackageHistory && (
            <div className="space-y-3">
              {/* Pacchetti completati */}
              {packageHistory.map((pkg) => (
                <div key={pkg.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Pacchetto da {pkg.initialPackageSize} sessioni
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatDate(pkg.purchaseDate)} · {pkg.totalSessions} sessioni totali
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Completato
                    </span>
                  </div>

                  {pkg.integrations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <p className="text-xs font-medium text-gray-700 mb-1">Integrazioni:</p>
                      {pkg.integrations.map((int) => (
                        <p key={int.id} className="text-xs text-gray-600">
                          • {int.description} ({formatDate(int.date)})
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <p className="text-xs text-gray-600">
                      {pkg.sessions.filter(s => s.isActive).length} sessioni completate
                    </p>
                  </div>
                </div>
              ))}

              {/* Sessioni singole completate */}
              {completedSingles.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Sessioni singole
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Sessioni acquistate separatamente, non collegate a pacchetti
                      </p>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                      {completedSingles.length} completate
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                    {completedSingles.map((single) => (
                      <div key={single.id} className="flex items-center justify-between p-2 bg-white border border-gray-300 rounded text-sm group">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {formatDate(single.completedDate!)}
                          </p>
                          <p className="text-xs text-gray-600">
                            Istruttore: {single.instructor}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteSession(single.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                            title="Annulla sessione"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* No packages message */}
      {!hasActivePackage && availableSingleSessions === 0 && packageHistory.length === 0 && (
        <div className="text-center py-6 text-gray-500 text-sm">
          <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>Nessun pacchetto o sessione singola</p>
          <p className="text-xs mt-1">Acquista un pacchetto o una sessione singola per iniziare</p>
        </div>
      )}
    </div>
  );
}