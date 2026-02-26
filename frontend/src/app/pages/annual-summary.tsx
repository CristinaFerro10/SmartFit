import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Filter, X } from 'lucide-react';
import { cardMonthlyCounters } from '../services/card-service';
import { Loading } from '../components/ui/loading';
import { MonthlyActivityCounters, MonthPlan } from '../lib/utils';

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

const YEAR_OPTIONS = [new Date().getFullYear() - 2, new Date().getFullYear() - 1, new Date().getFullYear()];

export function AnnualSummary() {
  const navigate = useNavigate();
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]); // Empty = all months
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()); // Default to current year
  const [selectedPlanTypes, setSelectedPlanTypes] = useState<PlanType[]>([]); // Empty = all types
  const [clientTypeFilter, setClientTypeFilter] = useState<ClientTypeFilter>('all');
  const [monthPlan, setMonthPlan] = useState<MonthPlan[] | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  const currentMonth = new Date().getMonth();
  // Helpers for "all" state
  const isAllMonthsSelected = selectedMonths.length === 0;
  const isAllPlanTypesSelected = selectedPlanTypes.length === 0;

  const getMonthPlan = (year: number = new Date().getFullYear(), monthlyCounters: MonthlyActivityCounters[] | undefined): MonthPlan[] => {
    const currentDateYear = new Date();
    const currentDateMonth = new Date();
    const monthToShow: MonthPlan[] = [];
    MONTH_NAMES.forEach((e, index) => {
      if (selectedMonths.length === 0 || selectedMonths.includes(index + 1)) {
        monthToShow.push(
          { month: index + 1, name: e, isFuture: year > currentDateYear.getFullYear() || (year === currentDateYear.getFullYear() && index > currentDateMonth.getMonth()), counters: monthlyCounters?.find(counter => counter.Month === index + 1) }
        );
      }
    });
    return monthToShow;
  }

  useEffect(() => {
    fetchMonthlyCounters();
  }, [selectedMonths, clientTypeFilter, currentMonth, isAllMonthsSelected, selectedPlanTypes, isAllPlanTypesSelected, selectedYear]);

  const fetchMonthlyCounters = async () => {
    setLoading(true);
    try {
      const response = await cardMonthlyCounters({
        months: selectedMonths,
        year: selectedYear,
        isMDSSubscription: clientTypeFilter ? clientTypeFilter === 'mds' : null,
        includeNew: selectedPlanTypes ? selectedPlanTypes.includes('firstPlanNew') : null,
        includeRenewed: selectedPlanTypes ? selectedPlanTypes.includes('firstPlanRenewal') : null,
        includeUpdates: selectedPlanTypes ? selectedPlanTypes.includes('planChanges') : null,
        includePT: selectedPlanTypes ? selectedPlanTypes.includes('individualTraining') : null,
      });
      setMonthPlan(getMonthPlan(selectedYear, response as MonthlyActivityCounters[] | undefined));
      // TODO: get totale
    } catch (error) {
      console.error('Error fetching monthly counters:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle month selection
  const toggleMonth = (monthIndex: number) => {
    setSelectedMonths(prev => {
      if (prev?.includes(monthIndex)) {
        return prev.filter(m => m !== monthIndex);
      } else {
        return [...(prev || []), monthIndex];
      }
    });
  };

  // Toggle plan type selection
  const togglePlanType = (planType: PlanType) => {
    setSelectedPlanTypes(prev => {
      if (prev?.includes(planType)) {
        return prev.filter(p => p !== planType);
      } else {
        return [...(prev || []), planType];
      }
    });
  };

  // Filter visibility for individual cards
  const isPlanTypeVisible = (type: PlanType) => {
    return isAllPlanTypesSelected || selectedPlanTypes?.includes(type);
  };

  const activeFiltersCount = [
    selectedYear !== new Date().getFullYear() ? 1 : 0,
    !isAllMonthsSelected ? 1 : 0,
    !isAllPlanTypesSelected ? 1 : 0,
    clientTypeFilter !== 'all' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearAllFilters = () => {
    setSelectedMonths([]);
    setSelectedPlanTypes([]);
    setClientTypeFilter('all');
  };

  // TODO: loading
  return (loading ? (
    <Loading message="Caricamento dati..." />
  ) : (
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
              <h1 className="text-2xl font-bold">Riepilogo Annuale {selectedYear}</h1>
              <p className="text-sm text-gray-600">Andamento mensile delle schede allenamento</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mx-auto">
        {/* Filter Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {isAllMonthsSelected
              ? 'Anno completo'
              : selectedMonths?.length === 1
                ? MONTH_NAMES[selectedMonths[0]]
                : `${selectedMonths?.length} mesi selezionati`}
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
                    {selectedMonths?.length === 1
                      ? MONTH_NAMES[selectedMonths[0]]
                      : `${selectedMonths?.length} mesi`}
                  </span>
                )}
                {!isAllPlanTypesSelected && selectedPlanTypes?.map(type => (
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
            Totali {isAllMonthsSelected ? `Anno ${selectedYear}` : selectedMonths?.length === 1 ? MONTH_NAMES[selectedMonths[0]] : `${selectedMonths?.length} mesi`}
          </h2>

          {/* Single row layout - matching Monthly Breakdown structure */}
          <div className="grid grid-cols-5 gap-3">
            {/* Prime schede (nuovi) */}
            {isPlanTypeVisible('firstPlanNew') && (
              <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                <div className="text-xs text-gray-600 mb-1">Prime schede</div>
                <div className="text-xs text-gray-500 mb-1.5">(nuovi)</div>
                <div className="text-3xl font-bold text-blue-600">0</div>
              </div>
            )}

            {/* Prime schede (rinnovi) */}
            {isPlanTypeVisible('firstPlanRenewal') && (
              <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                <div className="text-xs text-gray-600 mb-1">Prime schede</div>
                <div className="text-xs text-gray-500 mb-1.5">(rinnovi)</div>
                <div className="text-3xl font-bold text-blue-600">0</div>
              </div>
            )}

            {/* Modifiche schede */}
            {isPlanTypeVisible('planChanges') && (
              <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                <div className="text-xs text-gray-600 mb-1">Modifiche</div>
                <div className="text-xs text-gray-500 mb-1.5">(progressioni)</div>
                <div className="text-3xl font-bold text-blue-600">0</div>
              </div>
            )}

            {/* Allenamenti individuali (PT) */}
            {isPlanTypeVisible('individualTraining') && (
              <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                <div className="text-xs text-gray-600 mb-1">Allenamenti</div>
                <div className="text-xs text-gray-500 mb-1.5">(PT)</div>
                <div className="text-3xl font-bold text-blue-600">0</div>
              </div>
            )}

            {/* Totale (anno/mese) */}
            <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
              <div className="text-xs text-gray-600 mb-1">Totale</div>
              <div className="text-xs text-gray-500 mb-1.5">({isAllMonthsSelected ? 'anno' : selectedMonths?.length === 1 ? 'mese' : 'mesi'})</div>
              <div className="text-3xl font-bold text-blue-600">0</div>
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="font-semibold text-lg text-gray-900 mb-6">Dettaglio Mensile</h2>

          <div className="space-y-3">
            {monthPlan?.map((month, index) => {
              return (
                <div
                  key={index}
                  className={`${month.isFuture ? 'opacity-40' : ''
                    }`}
                >
                  {/* Month Name */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900 capitalize text-base min-w-[100px]">
                      {month.name}
                    </h3>
                    {month.isFuture && (
                      <span className="text-xs text-gray-500 font-normal italic">(dati non ancora disponibili)</span>
                    )}
                  </div>

                  {month.counters ? (
                    <div className="grid grid-cols-5 gap-3">
                      {/* Prime schede (nuovi) */}
                      {isPlanTypeVisible('firstPlanNew') && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-600 mb-1">Prime schede</div>
                          <div className="text-xs text-gray-500 mb-1.5">(nuovi)</div>
                          <div className="text-2xl font-bold text-gray-800">{month.counters.FirstCardNewCustomer ?? 0}</div>
                        </div>
                      )}

                      {/* Prime schede (rinnovi) */}
                      {isPlanTypeVisible('firstPlanRenewal') && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-600 mb-1">Prime schede</div>
                          <div className="text-xs text-gray-500 mb-1.5">(rinnovi)</div>
                          <div className="text-2xl font-bold text-gray-800">{month.counters.FirstCardRenewed ?? 0}</div>
                        </div>
                      )}

                      {/* Modifiche schede */}
                      {isPlanTypeVisible('planChanges') && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-600 mb-1">Modifiche</div>
                          <div className="text-xs text-gray-500 mb-1.5">(progressioni)</div>
                          <div className="text-2xl font-bold text-gray-800">{month.counters.UpdatesCard ?? 0}</div>
                        </div>
                      )}

                      {/* Allenamenti individuali (PT) */}
                      {isPlanTypeVisible('individualTraining') && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-600 mb-1">Allenamenti</div>
                          <div className="text-xs text-gray-500 mb-1.5">(PT)</div>
                          <div className="text-2xl font-bold text-gray-800">{month.counters.TotalSession ?? 0}</div>
                        </div>
                      )}

                      {/* Totale mese */}
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-1">Totale</div>
                        <div className="text-xs text-gray-500 mb-1.5">(mese)</div>
                        <div className="text-2xl font-bold text-gray-800">
                          {month.counters.TotalCards ?? 0}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic pl-2">Nessuna attività registrata</p>
                  )}

                  {/* Separator between months (except last) */}
                  {index < monthPlan.length - 1 && (
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
              {/* Year Filter */}
              <div>
                <h3 className="font-semibold mb-3">Anno di riferimento</h3>
                <div className="space-y-2">
                  {
                    YEAR_OPTIONS.map(year => (
                      <label className="flex items-center gap-3 cursor-pointer" key={year}>
                        <input
                          type="radio"
                          name="year"
                          checked={selectedYear === year}
                          onChange={() => setSelectedYear(year)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{year}</span>
                      </label>
                    ))
                  }
                </div>
              </div>

              {/* Month Filter */}
              <div>
                <h3 className="font-semibold mb-3">Periodo</h3>

                {/* Radio button pattern */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="monthFilter"
                      checked={selectedMonths.length === 0}
                      onChange={() => {
                        setSelectedMonths([]);
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium">Tutti i mesi</span>
                  </label>

                  {/* Months Grid - 3 columns x 4 rows */}
                  <div className="ml-7 grid grid-cols-3 gap-x-4 gap-y-2">
                    {MONTH_NAMES.map((monthName, monthIndex) => (
                      <label key={monthIndex} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-1 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedMonths !== null && selectedMonths?.includes(monthIndex + 1)}
                          onChange={() => toggleMonth(monthIndex + 1)}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={'text-sm text-gray-700'}>
                          {monthName}
                        </span>
                      </label>
                    ))}
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
                      checked={selectedPlanTypes.length === 0}
                      onChange={() => {
                        setSelectedPlanTypes([]);
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm font-medium">Tutti i tipi</span>
                  </label>

                  <div>
                    {/* Plan Types */}
                    <div className="ml-7 space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded px-1 py-1 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedPlanTypes?.includes('firstPlanNew')}
                          onChange={() => togglePlanType('firstPlanNew')}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={'text-sm text-gray-700'}>
                          Prima scheda (nuovo cliente)
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded px-1 py-1 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedPlanTypes?.includes('firstPlanRenewal')}
                          onChange={() => togglePlanType('firstPlanRenewal')}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={'text-sm text-gray-700'}>
                          Prima scheda (rinnovo)
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded px-1 py-1 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedPlanTypes?.includes('planChanges')}
                          onChange={() => togglePlanType('planChanges')}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={'text-sm text-gray-700'}>
                          Modifica scheda (progressioni)
                        </span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded px-1 py-1 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedPlanTypes?.includes('individualTraining')}
                          onChange={() => togglePlanType('individualTraining')}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={'text-sm text-gray-700'}>
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
      )
      }
    </div >
  )
  );
}