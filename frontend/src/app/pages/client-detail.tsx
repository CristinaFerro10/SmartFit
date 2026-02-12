import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Calendar, CreditCard, Undo, FileText, ClipboardList } from 'lucide-react';
import { Customer } from '../lib/types';
import {
  formatDate,
  getExpirationText,
  getStatusChipColors,
  getStatusChipLabel
} from '../lib/utils';
import { IndividualTraining } from '../components/individual-training';
import { DateSelector } from '../components/date-selector';
import { useClientStore } from '../stores/useClientStore';
import { getCustomersDetailIST, updateDescription } from '../services/customer-service';
import Loading from '../components/ui/loading';
import { newCard, rescheduleCard } from '../services/card-service';
import { CustomerWarning } from '../lib/filtermodel';

const DURATION_OPTIONS = [
  { label: '2', weeks: 2, days: 14 },
  { label: '4', weeks: 4, days: 28 },
  { label: '6', weeks: 6, days: 42 },
  { label: '8', weeks: 8, days: 56 },
  { label: '10', weeks: 10, days: 70 },
  { label: '12', weeks: 12, days: 84 },
];

export function ClientDetail() {
  const id = useClientStore(state => state.selectedClientId);

  if (!id) {
    return <div>Nessun client selezionato</div>;
  }

  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  // Find the client
  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const response = await getCustomersDetailIST(id);
      const clientResp = response.map((c: Customer) => {
        c.SubscriptionDateStart = c.SubscriptionDateStart ? new Date(c.SubscriptionDateStart) : undefined;
        c.SubscriptionDateEnd = c.SubscriptionDateEnd ? new Date(c.SubscriptionDateEnd) : undefined;
        c.LastCardDateStart = c.LastCardDateStart ? new Date(c.LastCardDateStart) : undefined;
        c.LastCardDateEnd = c.LastCardDateEnd ? new Date(c.LastCardDateEnd) : undefined;
        return c;
      });
      setClient(clientResp[0]);
      setDescription(clientResp[0]?.Description || '');
      setSelectedDuration(clientResp[0]?.DurationDays || 28);
      if (clientResp[0]?.LastCardDateStart?.toDateString() == new Date().toDateString()) {
        setUpdatedToday(true);
        setSelectedDate(new Date());
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const [client, setClient] = useState<Customer | undefined>();
  const [description, setDescription] = useState('');
  const [updatedToday, setUpdatedToday] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(28); // Default 4 weeks
  const [isCustom, setIsCustom] = useState(false);
  const [customWeeks, setCustomWeeks] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);

  // Check if undo is available from persistent state
  const canUndo = !!client?.LastCardId; // Undo available if there's a last card action to revert

  if (!client) {
    if (loading) {
      return <Loading message="Caricamento dati..." />;
    }
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Cliente non trovato</p>
          <button
            onClick={() => navigate('/trainer-dashboard')}
            className="text-blue-600 hover:underline"
          >
            Torna alla dashboard
          </button>
        </div>
      </div>
    );
  }

  const expirationText = getExpirationText(client);
  const statusChipColors = getStatusChipColors(client.Warning);
  const statusChipLabel = getStatusChipLabel(client.Warning);

  // Workout plans tracking
  const plansPercentage = (client.CardsDone / client.CardIncluded) * 100;

  const handleDurationClick = (days: number) => {
    setIsCustom(false);
    setSelectedDuration(days);
    setCustomWeeks('');
  };

  const handlePersonalizzaClick = () => {
    setIsCustom(true);
    setSelectedDuration(0);
  };

  const handleCustomWeeksChange = (value: string) => {
    setCustomWeeks(value);
    const weeks = parseInt(value);
    if (!isNaN(weeks) && weeks > 0) {
      setSelectedDuration(weeks * 7);
    } else {
      setSelectedDuration(0);
    }
  };

  const handleUpdateWorkoutPlan = () => {
    if (selectedDuration === 0 || client.CardAvailable === 0) return; // Don't allow update without valid duration or plans

    setCard();
  };

  const setCard = async () => {
    setLoading(true);
    try {
      await newCard({
        CustomerId: client.IdWinC,
        CustomerSubscriptionId: client.CustomerSubscriptionId!,
        DurationWeek: selectedDuration / 7,
        DateStart: selectedDate
      });
      await fetchCustomer();
    } catch (error) {
      console.error('Error creating new card:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRiprogrammata = () => {
    setRescheduled();
  };

  const setRescheduled = async () => {
    setLoading(true);
    try {
      await rescheduleCard(client.LastCardId!);
      await fetchCustomer();
    } catch (error) {
      console.error('Error rescheduling card:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = () => {
    if (!client.LastCardId) return;

    // Restore previous state
    // const restoredClient: Customer = {
    //   ...client,
    //   LastCardDateStart: client.previousState.lastWorkoutPlanDate,
    //   DurationDays: client.previousState.workoutPlanDuration,
    //   TrainingOperatorName: client.previousState.assignedInstructor,
    //   workoutPlansUsed: client.previousState.workoutPlansUsed,
    //   Renewed: client.previousState.renewed,
    //   previousState: undefined, // Clear undo state after using it
    //   lastActionType: undefined,
    // };

    // setClient(restoredClient);
    // mockClients[clientIndex] = restoredClient;
    setUpdatedToday(false);
  };

  const handleSaveDescription = async () => {
    saveDescription();
  };

  const saveDescription = async () => {
    setLoading(true);
    try {
      await updateDescription(id, description);
      await fetchCustomer(); // Refresh client data after update
    } catch (error) {
      console.error('Error updating description:', error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toDateString();
  const isUpdatedToday = client.LastCardDateStart && (new Date(client.LastCardDateStart).toDateString() === today || updatedToday);
  const canUpdatePlan = !isUpdatedToday && selectedDuration > 0 && client.CardAvailable > 0;

  return (loading ? (
    <Loading message="Caricamento dati..." />
  ) : (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 mb-6">
        <button
          onClick={() => navigate('/trainer-dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Torna ai clienti</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{client.Name}</h1>
          {/* MDS Badge */}
          {client.IsMDSSub && (
            <span
              className="inline-flex items-center text-xs px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full border border-cyan-300 font-semibold"
              title="Medicina dello Sport - Cliente proveniente da percorsi ospedalieri o medico-sportivi"
            >
              MDS
            </span>
          )}
          {/* Unified Status Chip */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusChipColors.bg}`}>
            <span className={`w-2 h-2 rounded-full ${statusChipColors.dot}`}></span>
            <span className={`text-sm font-medium ${statusChipColors.text}`}>
              {statusChipLabel}
            </span>
          </span>
        </div>

        <p className="text-sm text-gray-600">
          Istruttore: {client.TrainingOperatorName}
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="px-4 mx-auto">
        {/* Persistent Undo Alert - Full width above columns */}
        {canUndo && (
          <div className={`rounded-lg border-2 p-4 mb-6 ${client?.Warning !== CustomerWarning.Rescheduled
            ? 'bg-green-50 border-green-300'
            : 'bg-blue-50 border-blue-300'
            }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 ${client?.Warning !== CustomerWarning.Rescheduled ? 'text-green-800' : 'text-blue-800'
                  }`}>
                  {client?.Warning !== CustomerWarning.Rescheduled && `Ultima azione: Scheda di allenamento aggiornata il ${client.LastCardDateStart ? formatDate(client.LastCardDateStart) : 'N/A'}`}
                  {client?.Warning == CustomerWarning.Rescheduled && 'Ultima azione: Scheda riprogrammata'}
                </p>
                <p className={`text-xs ${client?.Warning !== CustomerWarning.Rescheduled ? 'text-green-600' : 'text-blue-600'
                  }`}>
                  Puoi annullare questa azione in qualsiasi momento
                </p>
              </div>
              <button
                onClick={handleUndo}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${client?.Warning !== CustomerWarning.Rescheduled
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                <Undo className="w-4 h-4" />
                Annulla
              </button>
            </div>
          </div>
        )}

        {/* Grid Layout: 65% / 35% */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          <div className="lg:col-span-4 space-y-6">
            {/* Aggiornamento Scheda Allenamento Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-lg mb-4">Aggiornamento Scheda Allenamento</h2>

              {/* Duration Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Durata scheda (settimane)
                </label>

                {/* Grid layout - 4 columns */}
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {/* First 4 options - Row 1 */}
                  {DURATION_OPTIONS.slice(0, 4).map((option) => (
                    <button
                      key={option.label}
                      onClick={() => handleDurationClick(option.days)}
                      disabled={isUpdatedToday}
                      className={`p-3 rounded-lg border-2 font-semibold transition-all ${selectedDuration === option.days && !isCustom
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        } ${isUpdatedToday ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {option.label}
                    </button>
                  ))}

                  {/* Last 2 options - Row 2, first 2 columns */}
                  {DURATION_OPTIONS.slice(4, 6).map((option) => (
                    <button
                      key={option.label}
                      onClick={() => handleDurationClick(option.days)}
                      disabled={isUpdatedToday}
                      className={`p-3 rounded-lg border-2 font-semibold transition-all ${selectedDuration === option.days && !isCustom
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        } ${isUpdatedToday ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {option.label}
                    </button>
                  ))}

                  {/* Personalizza Button - Row 2, spans 2 columns */}
                  <button
                    onClick={handlePersonalizzaClick}
                    disabled={isUpdatedToday}
                    className={`col-span-2 p-3 rounded-lg border-2 font-semibold transition-all ${isCustom
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      } ${isUpdatedToday ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    PERSONALIZZA
                  </button>
                </div>

                {/* Custom Input */}
                {isCustom && (
                  <div className="mt-3">
                    <input
                      type="number"
                      value={customWeeks}
                      onChange={(e) => handleCustomWeeksChange(e.target.value)}
                      placeholder="Inserisci numero di settimane"
                      min="1"
                      disabled={isUpdatedToday}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Seleziona la durata reale del programma assegnato
                </p>
              </div>

              {/* Primary Action Button with Date Selector */}
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={handleUpdateWorkoutPlan}
                  disabled={!canUpdatePlan}
                  className={`flex-1 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${isUpdatedToday
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : !canUpdatePlan
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-md'
                    }`}
                >
                  <Check className="w-6 h-6" />
                  {isUpdatedToday
                    ? `✓ Scheda aggiornata il ${client.LastCardDateStart ? formatDate(client.LastCardDateStart) : 'N/A'}`
                    : 'Scheda Allenamento Fatta Oggi'}
                </button>
                <DateSelector
                  onDateSelect={setSelectedDate}
                  disabled={!canUpdatePlan}
                />
              </div>

              {/* Disabled state message */}
              {client.CardAvailable === 0 && !isUpdatedToday && (
                <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-700 font-medium">
                    ⚠️ Nessun cambio scheda disponibile con l'abbonamento attivo
                  </p>
                </div>
              )}

              {/* Secondary Action Button - Riprogrammata */}
              {!isUpdatedToday && !client.Renewed && (
                <div className="w-full flex flex-col gap-2">
                  <button
                    onClick={handleRiprogrammata}
                    disabled={client.CardAvailable === 0 || client.CardsDone === 0}
                    className="w-full py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    ⏸ Scheda riprogrammata
                  </button>

                  {/* Messaggio di errore sotto il pulsante */}
                  {(client.CardAvailable === 0 || client.CardsDone === 0) && (
                    <p className="text-[11px] text-red-500 font-medium px-1 flex items-center gap-1">
                      <span>⚠</span>
                      {client.CardAvailable === 0
                        ? "Nessuna scheda disponibile nel piano del cliente."
                        : "È necessario completare almeno una scheda per riprogrammare."}
                    </p>
                  )}
                </div>
              )}

              {/* Success message for today's update */}
              {isUpdatedToday && !canUndo && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">
                    ✓ Scheda allenamento aggiornata correttamente
                  </p>
                </div>
              )}

              {/* Info message for rescheduled state */}
              {client.Renewed && !canUndo && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">
                    ⏸ Cliente in stato RIPROGRAMMATA - In attesa di attivazione del programma
                  </p>
                </div>
              )}
            </div>

            <div></div>
            {/* Individual Training TODO*/}
            {/* <IndividualTraining
              client={client}
              onUpdate={(updatedClient) => {
                setClient(updatedClient);
                mockClients[clientIndex] = updatedClient;
              }}
            /> */}
          </div>

          {/* RIGHT COLUMN - CONTEXT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Schede incluse nell'abbonamento */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-gray-600" />
                Schede incluse nell'abbonamento
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Totali:</span>
                  <span className="font-semibold">{client.CardIncluded}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Utilizzate:</span>
                  <span className="font-semibold">{client.CardsDone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Disponibili:</span>
                  <span className={`font-semibold ${client.CardAvailable === 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {client.CardAvailable}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all ${plansPercentage >= 100 ? 'bg-red-500' : plansPercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(plansPercentage, 100)}%` }}
                />
              </div>

              {client.CardAvailable === 0 && (
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ Schede esaurite - Consigliare rinnovo abbonamento
                </p>
              )}
            </div>

            {/* Workout Plan Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                Scheda Allenamento
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Durata scheda:</span>
                  <span className="font-medium">{client.DurationDays ? `${client.DurationDays} giorni (${client.DurationWeek} settimane)` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ultima scheda:</span>
                  <span className="font-medium">{client.LastCardDateStart ? formatDate(client.LastCardDateStart) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giorni trascorsi:</span>
                  <span className="font-medium">{client.CardDays ? `${client.CardDays} giorni` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Scadenza scheda:</span>
                  <span className="font-medium">{client.LastCardDateEnd ? formatDate(client.LastCardDateEnd) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stato scadenza:</span>
                  <span className="font-medium">{expirationText}</span>
                </div>
              </div>
            </div>

            {/* Subscription Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-600" />
                Abbonamento
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo di abbonamento:</span>
                  <span className="font-medium">{client.SubscriptionType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inizio abbonamento:</span>
                  <span className="font-medium">{client.SubscriptionDateStart ? formatDate(client.SubscriptionDateStart) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fine abbonamento:</span>
                  <span className="font-medium">{client.SubscriptionDateEnd ? formatDate(client.SubscriptionDateEnd) : 'N/A'}</span>
                </div>
              </div>

              {/* Expiring Soon Alert */}
              {client.SubscriptionExpiring && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-700 font-medium">
                    ⚠️ Abbonamento in scadenza - Consigliare rinnovo
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Note rapide
              </h2>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Aggiungi note (infortuni, preferenze, promemoria...)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />

              {description !== client.Description && (
                <button
                  onClick={handleSaveDescription}
                  className="mt-3 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Salva note
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  );
}