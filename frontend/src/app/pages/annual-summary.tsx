import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Trash2, Filter, X } from 'lucide-react';

// Mock data for current year (2026)
// In a real app, this would come from a database/API
const MOCK_YEAR_DATA = {
  year: 2026,
  months: [
    { month: 0, firstPlanNew: 5, firstPlanRenewal: 8, planChanges: 15, individualTraining: 12, firstPlanNewMDS: 2, firstPlanRenewalMDS: 3, planChangesMDS: 5, individualTrainingMDS: 4 },
    { month: 1, firstPlanNew: 6, firstPlanRenewal: 10, planChanges: 18, individualTraining: 15, firstPlanNewMDS: 2, firstPlanRenewalMDS: 4, planChangesMDS: 6, individualTrainingMDS: 5 },
    { month: 2, firstPlanNew: 4, firstPlanRenewal: 7, planChanges: 12, individualTraining: 9, firstPlanNewMDS: 1, firstPlanRenewalMDS: 2, planChangesMDS: 4, individualTrainingMDS: 3 },
    { month: 3, firstPlanNew: 7, firstPlanRenewal: 9, planChanges: 20, individualTraining: 14, firstPlanNewMDS: 3, firstPlanRenewalMDS: 3, planChangesMDS: 7, individualTrainingMDS: 5 },
    { month: 4, firstPlanNew: 5, firstPlanRenewal: 11, planChanges: 16, individualTraining: 11, firstPlanNewMDS: 2, firstPlanRenewalMDS: 4, planChangesMDS: 5, individualTrainingMDS: 4 },
    { month: 5, firstPlanNew: 6, firstPlanRenewal: 8, planChanges: 14, individualTraining: 10, firstPlanNewMDS: 2, firstPlanRenewalMDS: 3, planChangesMDS: 4, individualTrainingMDS: 3 },
    { month: 6, firstPlanNew: 4, firstPlanRenewal: 6, planChanges: 10, individualTraining: 7, firstPlanNewMDS: 1, firstPlanRenewalMDS: 2, planChangesMDS: 3, individualTrainingMDS: 2 },
    { month: 7, firstPlanNew: 3, firstPlanRenewal: 5, planChanges: 8, individualTraining: 6, firstPlanNewMDS: 1, firstPlanRenewalMDS: 1, planChangesMDS: 2, individualTrainingMDS: 2 },
    { month: 8, firstPlanNew: 0, firstPlanRenewal: 0, planChanges: 0, individualTraining: 0, firstPlanNewMDS: 0, firstPlanRenewalMDS: 0, planChangesMDS: 0, individualTrainingMDS: 0 }, // Future month
    { month: 9, firstPlanNew: 0, firstPlanRenewal: 0, planChanges: 0, individualTraining: 0, firstPlanNewMDS: 0, firstPlanRenewalMDS: 0, planChangesMDS: 0, individualTrainingMDS: 0 }, // Future month
    { month: 10, firstPlanNew: 0, firstPlanRenewal: 0, planChanges: 0, individualTraining: 0, firstPlanNewMDS: 0, firstPlanRenewalMDS: 0, planChangesMDS: 0, individualTrainingMDS: 0 }, // Future month
    { month: 11, firstPlanNew: 0, firstPlanRenewal: 0, planChanges: 0, individualTraining: 0, firstPlanNewMDS: 0, firstPlanRenewalMDS: 0, planChangesMDS: 0, individualTrainingMDS: 0 }, // Future month
  ]
};

type PlanType = 'firstPlanNew' | 'firstPlanRenewal' | 'planChanges' | 'individualTraining';
type ClientTypeFilter = 'all' | 'standard' | 'mds';

const MONTH_NAMES = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

const PLAN_TYPE_LABELS: Record<PlanType, string> = {
  firstPlanNew: 'Prime schede (nuovi)',
  firstPlanRenewal: 'Prime schede (rinnovi)',
  planChanges: 'Modifiche schede',
  individualTraining: 'Allenamenti individuali (PT)'
};

export function AnnualSummary() {
  const navigate = useNavigate();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Filter mode states
  const [monthFilterMode, setMonthFilterMode] = useState<'all' | 'custom'>('all');
  const [planTypeFilterMode, setPlanTypeFilterMode] = useState<'all' | 'custom'>('all');

  // Filters - Empty arrays mean "all" (default state)
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]); // Empty = all months
  const [selectedPlanTypes, setSelectedPlanTypes] = useState<PlanType[]>([]); // Empty = all types
  const [clientTypeFilter, setClientTypeFilter] = useState<ClientTypeFilter>('all');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-based (0 = January)

  // Check if we have previous year data that hasn't been reset
  const hasPreviousYearData = MOCK_YEAR_DATA.year < currentYear;

  // Helpers for "all" state
  const isAllMonthsSelected = selectedMonths.length === 0;
  const isAllPlanTypesSelected = selectedPlanTypes.length === 0;

  // Toggle month selection
  const toggleMonth = (monthIndex: number) => {
    setSelectedMonths(prev => {
      if (prev.includes(monthIndex)) {
        return prev.filter(m => m !== monthIndex);
      } else {
        return [...prev, monthIndex];
      }
    });
  };

  // Toggle all months
  const toggleAllMonths = () => {
    setSelectedMonths([]);
  };

  // Toggle plan type selection
  const togglePlanType = (planType: PlanType) => {
    setSelectedPlanTypes(prev => {
      if (prev.includes(planType)) {
        return prev.filter(p => p !== planType);
      } else {
        return [...prev, planType];
      }
    });
  };

  // Toggle all plan types
  const toggleAllPlanTypes = () => {
    setSelectedPlanTypes([]);
  };

  // Process data based on filters
  const processedData = useMemo(() => {
    let months = MOCK_YEAR_DATA.months.map((m) => {
      const date = new Date(MOCK_YEAR_DATA.year, m.month, 1);
      const monthName = new Intl.DateTimeFormat('it-IT', { month: 'long' }).format(date);

      // Apply client type filter
      let firstPlanNew = m.firstPlanNew;
      let firstPlanRenewal = m.firstPlanRenewal;
      let planChanges = m.planChanges;
      let individualTraining = m.individualTraining;

      if (clientTypeFilter === 'mds') {
        firstPlanNew = m.firstPlanNewMDS;
        firstPlanRenewal = m.firstPlanRenewalMDS;
        planChanges = m.planChangesMDS;
        individualTraining = m.individualTrainingMDS;
      } else if (clientTypeFilter === 'standard') {
        firstPlanNew = m.firstPlanNew - m.firstPlanNewMDS;
        firstPlanRenewal = m.firstPlanRenewal - m.firstPlanRenewalMDS;
        planChanges = m.planChanges - m.planChangesMDS;
        individualTraining = m.individualTraining - m.individualTrainingMDS;
      }

      const total = firstPlanNew + firstPlanRenewal + planChanges + individualTraining;

      return {
        month: m.month,
        monthName,
        firstPlanNew,
        firstPlanRenewal,
        planChanges,
        individualTraining,
        total,
        isFuture: m.month > currentMonth
      };
    });

    // Apply month filter
    if (!isAllMonthsSelected) {
      months = months.filter(m => selectedMonths.includes(m.month));
    }

    return months;
  }, [selectedMonths, clientTypeFilter, currentMonth, isAllMonthsSelected]);

  // Calculate totals with plan type filter applied
  const totals = useMemo(() => {
    return processedData.reduce((acc, month) => {
      // Apply plan type filter
      const firstPlanNew = isAllPlanTypesSelected || selectedPlanTypes.includes('firstPlanNew') ? month.firstPlanNew : 0;
      const firstPlanRenewal = isAllPlanTypesSelected || selectedPlanTypes.includes('firstPlanRenewal') ? month.firstPlanRenewal : 0;
      const planChanges = isAllPlanTypesSelected || selectedPlanTypes.includes('planChanges') ? month.planChanges : 0;
      const individualTraining = isAllPlanTypesSelected || selectedPlanTypes.includes('individualTraining') ? month.individualTraining : 0;

      return {
        firstPlanNew: acc.firstPlanNew + firstPlanNew,
        firstPlanRenewal: acc.firstPlanRenewal + firstPlanRenewal,
        planChanges: acc.planChanges + planChanges,
        individualTraining: acc.individualTraining + individualTraining,
        total: acc.total + firstPlanNew + firstPlanRenewal + planChanges + individualTraining
      };
    }, { firstPlanNew: 0, firstPlanRenewal: 0, planChanges: 0, individualTraining: 0, total: 0 });
  }, [processedData, selectedPlanTypes, isAllPlanTypesSelected]);

  // Filter visibility for individual cards
  const isPlanTypeVisible = (type: PlanType) => {
    return isAllPlanTypesSelected || selectedPlanTypes.includes(type);
  };

  const handleReset = () => {
    console.log('Resetting annual data...');
    setShowResetConfirm(false);
    alert('Dati annuali azzerati con successo');
  };

  const activeFiltersCount = [
    !isAllMonthsSelected ? 1 : 0,
    !isAllPlanTypesSelected ? 1 : 0,
    clientTypeFilter !== 'all' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearAllFilters = () => {
    setMonthFilterMode('all');
    setPlanTypeFilterMode('all');
    setSelectedMonths([]);
    setSelectedPlanTypes([]);
    setClientTypeFilter('all');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6 mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Torna alla dashboard</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">Riepilogo Annuale {MOCK_YEAR_DATA.year}</h1>
              <p className="text-sm text-gray-600">Andamento mensile delle schede allenamento</p>
            </div>
          </div>

          {/* Reset Button - Secondary Action */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-red-50 border border-gray-300 hover:border-red-300 rounded-lg transition-colors text-sm text-gray-700 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
            <span className="font-medium">Azzera dati annuali</span>
          </button>
        </div>
      </div>

      <div className="px-4 max-w-6xl mx-auto">
        {/* Previous Year Data Notice */}
        {hasPreviousYearData && (
          <div className="mb-6 bg-amber-50 border border-amber-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-amber-600 text-2xl">ℹ️</div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-1">Dati anno precedente ancora visibili</h3>
                <p className="text-sm text-amber-800">
                  Stai visualizzando i dati dell'anno {MOCK_YEAR_DATA.year}.
                  Puoi analizzare tranquillamente i dati dell'anno precedente e azzerarli quando sei pronto.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {isAllMonthsSelected
              ? 'Anno completo'
              : selectedMonths.length === 1
                ? MONTH_NAMES[selectedMonths[0]]
                : `${selectedMonths.length} mesi selezionati`}
            {clientTypeFilter !== 'all' && ` - Clienti ${clientTypeFilter === 'mds' ? 'MDS' : 'Standard'}`}
          </h2>

          <button
            onClick={() => setShowFilterPanel(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Filter className="w-4 h-4" />
            Filtra
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-blue-800 font-medium">Filtri attivi:</span>
                {!isAllMonthsSelected && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                    {selectedMonths.length === 1
                      ? MONTH_NAMES[selectedMonths[0]]
                      : `${selectedMonths.length} mesi`}
                  </span>
                )}
                {!isAllPlanTypesSelected && selectedPlanTypes.map(type => (
                  <span key={type} className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                    {PLAN_TYPE_LABELS[type]}
                  </span>
                ))}
                {clientTypeFilter !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                    Clienti {clientTypeFilter === 'mds' ? 'MDS' : 'Standard'}
                  </span>
                )}
              </div>
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap ml-3"
              >
                Rimuovi tutti
              </button>
            </div>
          </div>
        )}

        {/* Annual Totals Summary */}
        <div className="mb-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-6">
          <h2 className="font-semibold text-lg text-blue-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Totali {isAllMonthsSelected ? `Anno ${MOCK_YEAR_DATA.year}` : selectedMonths.length === 1 ? MONTH_NAMES[selectedMonths[0]] : `${selectedMonths.length} mesi`}
          </h2>

          {/* Single row layout - matching Monthly Breakdown structure */}
          <div className="grid grid-cols-5 gap-3">
            {/* Prime schede (nuovi) */}
            {isPlanTypeVisible('firstPlanNew') && (
              <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                <div className="text-xs text-gray-600 mb-1">Prime schede</div>
                <div className="text-xs text-gray-500 mb-1.5">(nuovi)</div>
                <div className="text-3xl font-bold text-blue-600">{totals.firstPlanNew}</div>
              </div>
            )}

            {/* Prime schede (rinnovi) */}
            {isPlanTypeVisible('firstPlanRenewal') && (
              <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                <div className="text-xs text-gray-600 mb-1">Prime schede</div>
                <div className="text-xs text-gray-500 mb-1.5">(rinnovi)</div>
                <div className="text-3xl font-bold text-blue-600">{totals.firstPlanRenewal}</div>
              </div>
            )}

            {/* Modifiche schede */}
            {isPlanTypeVisible('planChanges') && (
              <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                <div className="text-xs text-gray-600 mb-1">Modifiche</div>
                <div className="text-xs text-gray-500 mb-1.5">(progressioni)</div>
                <div className="text-3xl font-bold text-blue-600">{totals.planChanges}</div>
              </div>
            )}

            {/* Allenamenti individuali (PT) */}
            {isPlanTypeVisible('individualTraining') && (
              <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                <div className="text-xs text-gray-600 mb-1">Allenamenti</div>
                <div className="text-xs text-gray-500 mb-1.5">(PT)</div>
                <div className="text-3xl font-bold text-blue-600">{totals.individualTraining}</div>
              </div>
            )}

            {/* Totale (anno/mese) */}
            <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
              <div className="text-xs text-gray-600 mb-1">Totale</div>
              <div className="text-xs text-gray-500 mb-1.5">({isAllMonthsSelected ? 'anno' : selectedMonths.length === 1 ? 'mese' : 'mesi'})</div>
              <div className="text-3xl font-bold text-blue-600">{totals.total}</div>
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold text-lg text-gray-900 mb-6">Dettaglio Mensile</h2>

          <div className="space-y-3">
            {processedData.map((month, index) => {
              const hasData = month.total > 0;

              return (
                <div
                  key={index}
                  className={`${month.isFuture ? 'opacity-40' : ''
                    }`}
                >
                  {/* Month Name */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900 capitalize text-base min-w-[100px]">
                      {month.monthName}
                    </h3>
                    {month.isFuture && (
                      <span className="text-xs text-gray-500 font-normal italic">(dati non ancora disponibili)</span>
                    )}
                  </div>

                  {hasData ? (
                    <div className="grid grid-cols-5 gap-3">
                      {/* Prime schede (nuovi) */}
                      {isPlanTypeVisible('firstPlanNew') && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-600 mb-1">Prime schede</div>
                          <div className="text-xs text-gray-500 mb-1.5">(nuovi)</div>
                          <div className="text-2xl font-bold text-gray-800">{month.firstPlanNew}</div>
                        </div>
                      )}

                      {/* Prime schede (rinnovi) */}
                      {isPlanTypeVisible('firstPlanRenewal') && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-600 mb-1">Prime schede</div>
                          <div className="text-xs text-gray-500 mb-1.5">(rinnovi)</div>
                          <div className="text-2xl font-bold text-gray-800">{month.firstPlanRenewal}</div>
                        </div>
                      )}

                      {/* Modifiche schede */}
                      {isPlanTypeVisible('planChanges') && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-600 mb-1">Modifiche</div>
                          <div className="text-xs text-gray-500 mb-1.5">(progressioni)</div>
                          <div className="text-2xl font-bold text-gray-800">{month.planChanges}</div>
                        </div>
                      )}

                      {/* Allenamenti individuali (PT) */}
                      {isPlanTypeVisible('individualTraining') && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-600 mb-1">Allenamenti</div>
                          <div className="text-xs text-gray-500 mb-1.5">(PT)</div>
                          <div className="text-2xl font-bold text-gray-800">{month.individualTraining}</div>
                        </div>
                      )}

                      {/* Totale mese */}
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-1">Totale</div>
                        <div className="text-xs text-gray-500 mb-1.5">(mese)</div>
                        <div className="text-2xl font-bold text-gray-800">
                          {(isPlanTypeVisible('firstPlanNew') ? month.firstPlanNew : 0) +
                            (isPlanTypeVisible('firstPlanRenewal') ? month.firstPlanRenewal : 0) +
                            (isPlanTypeVisible('planChanges') ? month.planChanges : 0) +
                            (isPlanTypeVisible('individualTraining') ? month.individualTraining : 0)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic pl-2">Nessuna attività registrata</p>
                  )}

                  {/* Separator between months (except last) */}
                  {index < processedData.length - 1 && (
                    <div className="border-b border-gray-100 mt-3"></div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> I dati storici mostrano l'andamento mensile delle schede allenamento create.
            </p>
            <ul className="mt-3 text-xs text-gray-500 space-y-1 ml-4 list-disc">
              <li><strong>Prime schede (nuovi clienti):</strong> Schede create per clienti che iniziano per la prima volta</li>
              <li><strong>Prime schede (rinnovi):</strong> Schede create per clienti che rinnovano l'abbonamento</li>
              <li><strong>Modifiche schede (progressioni):</strong> Aggiornamenti e modifiche delle schede esistenti durante l'abbonamento</li>
              <li><strong>Allenamenti individuali (PT):</strong> Allenamenti personalizzati per clienti che richiedono un allenamento specifico</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center md:justify-center">
          <div className="bg-white w-full md:max-w-lg md:rounded-lg overflow-hidden max-h-[90vh] flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Filtra Riepilogo</h2>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="overflow-y-auto p-4 space-y-6">
              {/* Month Filter */}
              <div>
                <h3 className="font-semibold mb-3">Periodo</h3>

                {/* Radio button pattern */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="monthFilter"
                      checked={monthFilterMode === 'all'}
                      onChange={() => {
                        setMonthFilterMode('all');
                        setSelectedMonths([]);
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium">Tutti i mesi</span>
                  </label>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer mb-3">
                      <input
                        type="radio"
                        name="monthFilter"
                        checked={monthFilterMode === 'custom'}
                        onChange={() => setMonthFilterMode('custom')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm font-medium">Seleziona mesi</span>
                    </label>

                    {/* Months Grid - 3 columns x 4 rows */}
                    <div className="ml-7 grid grid-cols-3 gap-x-4 gap-y-2">
                      {[0, 1, 2, 3].map((monthIndex) => (
                        <label key={monthIndex} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-1 transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedMonths.includes(monthIndex)}
                            onChange={() => toggleMonth(monthIndex)}
                            disabled={monthFilterMode === 'all'}
                            className="w-4 h-4 text-blue-600 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <span className={`text-sm ${monthFilterMode === 'all' ? 'text-gray-400' : 'text-gray-700'}`}>
                            {MONTH_NAMES[monthIndex]}
                          </span>
                        </label>
                      ))}

                      {[4, 5, 6, 7].map((monthIndex) => (
                        <label key={monthIndex} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-1 transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedMonths.includes(monthIndex)}
                            onChange={() => toggleMonth(monthIndex)}
                            disabled={monthFilterMode === 'all'}
                            className="w-4 h-4 text-blue-600 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <span className={`text-sm ${monthFilterMode === 'all' ? 'text-gray-400' : 'text-gray-700'}`}>
                            {MONTH_NAMES[monthIndex]}
                          </span>
                        </label>
                      ))}

                      {[8, 9, 10, 11].map((monthIndex) => (
                        <label key={monthIndex} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-1 transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedMonths.includes(monthIndex)}
                            onChange={() => toggleMonth(monthIndex)}
                            disabled={monthFilterMode === 'all'}
                            className="w-4 h-4 text-blue-600 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <span className={`text-sm ${monthFilterMode === 'all' ? 'text-gray-400' : 'text-gray-700'}`}>
                            {MONTH_NAMES[monthIndex]}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              {/* Plan Type Filter */}
              <div>
                <h3 className="font-semibold mb-3">Tipo di scheda</h3>

                {/* Radio button pattern */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="planTypeFilter"
                      checked={planTypeFilterMode === 'all'}
                      onChange={() => {
                        setPlanTypeFilterMode('all');
                        setSelectedPlanTypes([]);
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium">Tutti i tipi</span>
                  </label>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer mb-3">
                      <input
                        type="radio"
                        name="planTypeFilter"
                        checked={planTypeFilterMode === 'custom'}
                        onChange={() => setPlanTypeFilterMode('custom')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm font-medium">Seleziona tipi</span>
                    </label>

                    {/* Plan Types */}
                    <div className="ml-7 space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded px-1 py-1 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedPlanTypes.includes('firstPlanNew')}
                          onChange={() => togglePlanType('firstPlanNew')}
                          disabled={planTypeFilterMode === 'all'}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={`text-sm ${planTypeFilterMode === 'all' ? 'text-gray-400' : 'text-gray-700'}`}>
                          Prima scheda (nuovo cliente)
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded px-1 py-1 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedPlanTypes.includes('firstPlanRenewal')}
                          onChange={() => togglePlanType('firstPlanRenewal')}
                          disabled={planTypeFilterMode === 'all'}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={`text-sm ${planTypeFilterMode === 'all' ? 'text-gray-400' : 'text-gray-700'}`}>
                          Prima scheda (rinnovo)
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded px-1 py-1 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedPlanTypes.includes('planChanges')}
                          onChange={() => togglePlanType('planChanges')}
                          disabled={planTypeFilterMode === 'all'}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={`text-sm ${planTypeFilterMode === 'all' ? 'text-gray-400' : 'text-gray-700'}`}>
                          Modifica scheda (progressioni)
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded px-1 py-1 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedPlanTypes.includes('individualTraining')}
                          onChange={() => togglePlanType('individualTraining')}
                          disabled={planTypeFilterMode === 'all'}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={`text-sm ${planTypeFilterMode === 'all' ? 'text-gray-400' : 'text-gray-700'}`}>
                          Allenamento individuale (PT)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              {/* Client Type Filter */}
              <div>
                <h3 className="font-semibold mb-3">Tipologia cliente</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="clientType"
                      checked={clientTypeFilter === 'all'}
                      onChange={() => setClientTypeFilter('all')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Tutti i clienti</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="clientType"
                      checked={clientTypeFilter === 'standard'}
                      onChange={() => setClientTypeFilter('standard')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Clienti Standard</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="clientType"
                      checked={clientTypeFilter === 'mds'}
                      onChange={() => setClientTypeFilter('mds')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Clienti MDS</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Panel Footer */}
            <div className="border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Ripristina
              </button>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Applica
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-red-600 text-3xl">⚠️</div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Conferma azzeramento dati annuali</h3>
                <p className="text-sm text-gray-600">
                  Questa azione azzererà <strong>tutti i dati dell'anno {MOCK_YEAR_DATA.year}</strong> in modo permanente.
                  I contatori verranno riportati a zero e non sarà possibile recuperare i dati.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Sei sicuro di voler procedere?
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Annulla
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Azzera dati
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}