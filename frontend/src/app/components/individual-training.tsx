import { useState, useEffect } from 'react';
import { Users, Plus, CheckCircle, Undo, ChevronDown, ChevronUp, Package, X } from 'lucide-react';
import { Customer, IndividualTrainingActive, IndividualTrainingHistory, SessionPackageType } from '../lib/types';
import { formatDate } from '../lib/utils';
import { DateSelector } from './date-selector';
import { activePackageGet, completeSession, deleteLastSession, historyPackage, newPackage, sessionPackageTypeGet, upgradePackage } from '../services/pt-service';
import { LoadingContent } from './ui/loading';

interface IndividualTrainingProps {
  client: Customer;
}

export function IndividualTraining({ client }: IndividualTrainingProps) {
  const [showPurchaseMenu, setShowPurchaseMenu] = useState(false);
  const [showIntegrationMenu, setShowIntegrationMenu] = useState(false);
  const [showPackageHistory, setShowPackageHistory] = useState(false);
  const [showIntegrationsHistory, setShowIntegrationsHistory] = useState(false);
  const [showSessionHistory, setShowSessionHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [hasActivePackage, setHasActivePackage] = useState(false);
  const [activePT, setActivePT] = useState<IndividualTrainingActive | undefined>();
  const [packageHistory, setPackageHistory] = useState<IndividualTrainingHistory | undefined>();
  const [purchaseType, setPurchaseType] = useState<SessionPackageType[] | null>(null);
  const [pendingPurchaseType, setPendingPurchaseType] = useState<SessionPackageType | null>(null);
  const [pendingIntegration, setPendingIntegration] = useState<SessionPackageType | null>(null);
  const availableSessions = (activePT?.RemainingSession ?? 0) > 0;

  useEffect(() => {
    fetchSessionPTType();
    fetchPT();
  }, []);

  useEffect(() => {
    // TODO: mettere un first loading??
    fetchHistoryPackage();
  }, [activePT]);

  const fetchSessionPTType = async () => {
    try {
      const response = await sessionPackageTypeGet();
      setPurchaseType(response);
    } catch (error) {
      console.error('Error fetching session PT type:', error);
    }
  };

  const fetchPT = async () => {
    setLoading(true);
    try {
      const response = await activePackageGet(client.IdWinC);
      setActivePT(response ?? undefined);
      setHasActivePackage(!!response && response.RemainingSession > 0);
    } catch (error) {
      console.error('Error fetching active package:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPurchase = async () => {
    if (!pendingPurchaseType) return;

    setLoading(true);
    try {
      await newPackage({
        CustomerId: client.IdWinC,
        SessionPTTypeId: pendingPurchaseType.Id,
      });
      setPendingPurchaseType(null);
      setShowPurchaseMenu(false);
      await fetchPT();
    } catch (error) {
      console.error('Error creating package:', error);
    }
  };

  const handleCancelPurchase = () => {
    setPendingPurchaseType(null);
  };

  const handleConfirmIntegration = async () => {
    if (!pendingIntegration || !hasActivePackage) return;

    setLoading(true);
    try {
      await upgradePackage({
        CustomerPTId: activePT?.Id!,
        DateStart: selectedDate,
        SessionAdded: pendingIntegration.SessionNumber - (activePT?.SessionNumber ?? 0),
        SessionPTTypeId: pendingIntegration.Id,
      });
      setPendingIntegration(null);
      setShowIntegrationMenu(false);
      await fetchPT();
    } catch (error) {
      console.error('Error upgrading package:', error);
    }
  };

  const handleCancelIntegration = () => {
    setPendingIntegration(null);
  };

  const handleCompleteSession = async () => {
    if (!hasActivePackage || !availableSessions) return;

    setLoading(true);
    try {
      await completeSession({
        CustomerPTId: activePT?.Id!,
        DateStart: selectedDate,
      });
      setSelectedDate(new Date());
      await fetchPT();
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const fetchHistoryPackage = async () => {
    try {
      const response = await historyPackage(client.IdWinC);
      setPackageHistory(response ?? undefined);
    } catch (error) {
      console.error('Error fetching history package:', error);
    }
  };

  const handleUndoSession = async () => {
    setLoading(true);
    try {
      await deleteLastSession({
        CustomerPTId: packageHistory?.CustomerPTId!,
        SessionPTId: packageHistory?.SessionId!,
      });
      setSelectedDate(new Date());
      await fetchPT();
    } catch (error) {
      console.error('Error undoing session:', error);
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = activePT && activePT.SessionNumber > 0
    ? (activePT.TotalSession / activePT.SessionNumber) * 100
    : 0;

  // Get integration options
  const getIntegrationOptions = () => {
    if (!hasActivePackage || (activePT?.SessionNumber ?? 0) <= 1) return [];

    return purchaseType?.filter(type => type.SessionNumber > (activePT?.SessionNumber ?? 0))
  };

  const canShowIntegrationButton = hasActivePackage && (getIntegrationOptions()?.length ?? 0) > 0;

  return (loading ? (
    <LoadingContent message="Caricamento allenamenti individuali..." />
  ) : (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          Allenamento Individuale
        </h2>

        {/* Badge: only "Attivo" or "Nessun pacchetto attivo" - NO "Concluso" */}
        {(activePT && activePT.RemainingSession > 0) ? (
          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded font-medium">Attivo</span>
        ) : (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Nessun pacchetto attivo</span>
        )}
      </div>

      {/* Ultima sessione completata Box */}
      {packageHistory?.CanUndo && (
        <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Ultima sessione completata
              </p>
              <p className="text-xs text-gray-600">
                {formatDate(new Date(packageHistory.DateStart))} · Istruttore: {packageHistory.TrainingOperatorName}
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
      {activePT && activePT.RemainingSession > 0 && (
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
          {(activePT.IntegrationHistory?.length ?? 0) > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setShowIntegrationsHistory(!showIntegrationsHistory)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                {showIntegrationsHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Storico integrazioni ({activePT.IntegrationHistory?.length})
              </button>

              {showIntegrationsHistory && (
                <div className="mt-2 space-y-2">
                  {activePT.IntegrationHistory?.map((integration, index) => (
                    <div key={index} className="bg-white border border-gray-300 rounded p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Aggiunte {integration.SessionAdded} sessioni al pacchetto</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {formatDate(new Date(integration.DateStart))}
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
          {(activePT.SessionHistory?.length ?? 0) > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setShowSessionHistory(!showSessionHistory)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                {showSessionHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Storico sessioni del pacchetto ({activePT.SessionHistory?.length})
              </button>

              {showSessionHistory && (
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                  {activePT.SessionHistory?.map((session) => (
                    <div
                      key={session.Id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-300 rounded text-sm group"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {formatDate(new Date(session.DateStart))}
                        </p>
                        <p className="text-xs text-gray-600">
                          Istruttore: {session.TrainingOperatorName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
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
                {pendingPurchaseType.SessionNumber === 1
                  ? 'Stai per acquistare una sessione individuale singola.'
                  : `Stai per creare un pacchetto da ${pendingPurchaseType.SessionNumber} sessioni.`
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
                Aggiungi {pendingIntegration.SessionNumber - (activePT?.SessionNumber ?? 0)} sessioni al pacchetto
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
        {(hasActivePackage) && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleCompleteSession}
              disabled={!availableSessions}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${!availableSessions
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-[0.98] shadow-md'
                }`}
            >
              <CheckCircle className="w-5 h-5" />
              Segna sessione come completata
            </button>
            <DateSelector
              onDateSelect={setSelectedDate}
              disabled={!availableSessions}
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
                  {getIntegrationOptions()?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setPendingIntegration(option);
                        setShowIntegrationMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium">Integrazione a {option.SessionNumber} sessioni</span>
                      <span className="text-xs text-gray-500 block">Aggiungi {option.SessionNumber - (activePT?.SessionNumber ?? 0)} sessioni al pacchetto</span>
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
              {(packageHistory?.PackageHistory?.length ?? 0) > 0 ? 'Acquista pacchetto o sessione' : 'Acquista primo pacchetto o sessione'}
            </button>

            {/* Purchase Menu */}
            {showPurchaseMenu && purchaseType &&
              (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-10">
                  <div className="p-2 space-y-1">
                    {
                      purchaseType.map((type) => (
                        <button
                          key={type.Id}
                          onClick={() => {
                            setPendingPurchaseType(type);
                            setShowPurchaseMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                        >
                          <span className="font-medium">{type.SessionNumber === 1 ? 'Sessione singola' : `Pacchetto da ${type.SessionNumber} sessioni`}</span>
                          <span className="text-xs text-gray-500 block">{type.Description}</span>
                        </button>
                      ))
                    }
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
      {(packageHistory?.PackageHistory?.length ?? 0) > 0 && (
        <div>
          <button
            onClick={() => setShowPackageHistory(!showPackageHistory)}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium mb-2"
          >
            {showPackageHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Storico pacchetti completati ({packageHistory?.PackageHistory?.length ?? 0})
          </button>

          {showPackageHistory && (
            <div className="space-y-3">
              {/* Pacchetti completati */}
              {packageHistory?.PackageHistory?.map((pkg, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Pacchetto da {pkg.SessionNumber} sessioni
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatDate(new Date(pkg.DateStart))} · {pkg.SessionNumber} sessioni totali
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Completato
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No packages message */}
      {!hasActivePackage && (packageHistory?.PackageHistory?.length ?? 0) === 0 && (
        <div className="text-center py-6 text-gray-500 text-sm">
          <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>Nessun pacchetto o sessione singola</p>
          <p className="text-xs mt-1">Acquista un pacchetto o una sessione singola per iniziare</p>
        </div>
      )}
    </div>
  )
  );
}