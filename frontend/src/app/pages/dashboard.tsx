import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, X, ClipboardList } from 'lucide-react';
import { CountCustomer, Customer } from '../lib/types';
import { getFilterLabel, MonthlyActivityCounters } from '../lib/utils';
import { ClientCard } from '../components/client-card';
import { getCountCustomersIST, getCustomersIST } from '../services/customer-service';
import { CustomerOrderBy, CustomerWarning } from '../lib/filtermodel';
import { Loading } from '../components/ui/loading';
import { useAuthStore } from '../stores/authStore';
import { cardMonthlyCounters } from '../services/card-service';

const ITEMS_PER_PAGE = 12;

type MembershipFilter = 'all' | 'expiringSoon';
type ClientTypeFilter = 'all' | 'mds';

export function Dashboard() {
  const { getUser } = useAuthStore();
  const user = getUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [quickFilter, setQuickFilter] = useState<CustomerWarning | 'all'>('all');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [countCustomers, setCountCustomers] = useState<CountCustomer | undefined>(undefined);
  const [monthlyCounters, setMonthlyCounters] = useState<MonthlyActivityCounters | undefined>(undefined);
  const [instructors, setInstructors] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (user) setInstructors([{ id: user.id!, name: user.name! }]);
  }, []);

  // Advanced filters
  const [sortBy, setSortBy] = useState<CustomerOrderBy>(CustomerOrderBy.Default);
  const [instructorFilter, setInstructorFilter] = useState<number | 'all'>('all');
  const [membershipFilter, setMembershipFilter] = useState<MembershipFilter>('all');
  const [clientTypeFilter, setClientTypeFilter] = useState<ClientTypeFilter>('all');

  // GET - Carica users all'avvio
  useEffect(() => {
    fetchCountCustomers();
  }, [searchQuery, instructorFilter, membershipFilter, clientTypeFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, quickFilter, sortBy, searchQuery, instructorFilter, membershipFilter, clientTypeFilter]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, quickFilter, instructorFilter, membershipFilter, clientTypeFilter, sortBy]);

  // Paginate clients
  const totalPages = Math.ceil(totalCustomers / ITEMS_PER_PAGE);

  useEffect(() => {
    fetchMonthlyCounters();
  }, []);

  const fetchMonthlyCounters = async () => {
    try {
      const response = await cardMonthlyCounters([new Date().getMonth() + 1], new Date().getFullYear()); // Pass current month and flag to get monthly counters
      setMonthlyCounters(response ? response[0] : undefined);
    } catch (error) {
      console.error('Error fetching monthly counters:', error);
    }
  };

  const fetchCountCustomers = async () => {
    try {
      const response = await getCountCustomersIST({
        SubscriptionExpiring: membershipFilter === 'expiringSoon' ? true : undefined,
        IsMDSSubscription: clientTypeFilter === 'mds' ? true : undefined,
        CustomerName: searchQuery ? searchQuery : undefined,
      });
      setCountCustomers(response);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await getCustomersIST({
        page: currentPage,
        page_size: ITEMS_PER_PAGE,
        SubscriptionExpiring: membershipFilter === 'expiringSoon' ? true : undefined,
        OrderBy: sortBy === CustomerOrderBy.Default ? undefined : sortBy,
        IsMDSSubscription: clientTypeFilter === 'mds' ? true : undefined,
        CustomerName: searchQuery ? searchQuery : undefined,
        WarningType: quickFilter !== 'all' ? quickFilter as CustomerWarning : undefined,
      });
      setCustomers(response.items);
      setTotalCustomers(response.total);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeFiltersCount = [
    quickFilter !== 'all' ? 1 : 0,
    instructorFilter !== 'all' ? 1 : 0,
    membershipFilter !== 'all' ? 1 : 0,
    clientTypeFilter !== 'all' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearAllFilters = () => {
    setQuickFilter('all');
    setInstructorFilter('all');
    setMembershipFilter('all');
    setClientTypeFilter('all');
    setSortBy(CustomerOrderBy.Default);
    setSearchQuery('');
  };

  // Get current month name
  const currentMonthName = new Intl.DateTimeFormat('it-IT', { month: 'long' }).format(new Date());

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="px-4 mx-auto">
        {/* Status Summary Banners - Primary Operational Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <button
            onClick={() => setQuickFilter(quickFilter === CustomerWarning.Expired ? 'all' : CustomerWarning.Expired)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${quickFilter === CustomerWarning.Expired
              ? 'border-red-500 bg-red-50 shadow-md'
              : 'border-red-200 bg-white hover:bg-red-50'
              }`}
          >
            <div className="text-2xl mb-1">🔴</div>
            <div className="font-semibold text-gray-900">Urgente</div>
            <div className="text-2xl font-bold text-red-600">{countCustomers?.expired ?? 0}</div>
          </button>

          <button
            onClick={() => setQuickFilter(quickFilter === CustomerWarning.Warning ? 'all' : CustomerWarning.Warning)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${quickFilter === CustomerWarning.Warning
              ? 'border-yellow-500 bg-yellow-50 shadow-md'
              : 'border-yellow-200 bg-white hover:bg-yellow-50'
              }`}
          >
            <div className="text-2xl mb-1">🟡</div>
            <div className="font-semibold text-gray-900">Attenzione</div>
            <div className="text-2xl font-bold text-yellow-600">{countCustomers?.warning ?? 0}</div>
          </button>

          <button
            onClick={() => setQuickFilter(quickFilter === CustomerWarning.Ok ? 'all' : CustomerWarning.Ok)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${quickFilter === CustomerWarning.Ok
              ? 'border-green-500 bg-green-50 shadow-md'
              : 'border-green-200 bg-white hover:bg-green-50'
              }`}
          >
            <div className="text-2xl mb-1">🟢</div>
            <div className="font-semibold text-gray-900">In Regola</div>
            <div className="text-2xl font-bold text-green-600">{countCustomers?.ok ?? 0}</div>
          </button>

          <button
            onClick={() => setQuickFilter(quickFilter === CustomerWarning.Rescheduled ? 'all' : CustomerWarning.Rescheduled)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${quickFilter === CustomerWarning.Rescheduled
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-blue-200 bg-white hover:bg-blue-50'
              }`}
          >
            <div className="text-2xl mb-1">⏸</div>
            <div className="font-semibold text-gray-900">Riprogrammata</div>
            <div className="text-2xl font-bold text-blue-600">{countCustomers?.rescheduled ?? 0}</div>
          </button>
        </div>

        {/* Monthly Activity Counters - Only visible in main Dashboard view (no filters active) */}
        {monthlyCounters &&
          quickFilter === 'all' &&
          instructorFilter === 'all' &&
          membershipFilter === 'all' &&
          clientTypeFilter === 'all' && (
            <div className="mb-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ClipboardList className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900 capitalize">
                    Schede allenamento create a {currentMonthName}
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {/* First Plan - New Membership */}
                  <div className="bg-white rounded-lg p-3 border border-purple-100">
                    <div className="text-xs text-gray-600 mb-1">Prime schede</div>
                    <div className="text-xs text-gray-500 mb-2">(nuovi clienti)</div>
                    <div className="text-2xl font-bold text-purple-600">{monthlyCounters?.FirstCardNewCustomer}</div>
                  </div>

                  {/* First Plan - Renewal */}
                  <div className="bg-white rounded-lg p-3 border border-purple-100">
                    <div className="text-xs text-gray-600 mb-1">Prime schede</div>
                    <div className="text-xs text-gray-500 mb-2">(rinnovi)</div>
                    <div className="text-2xl font-bold text-purple-600">{monthlyCounters?.FirstCardRenewed}</div>
                  </div>

                  {/* Plan Changes */}
                  <div className="bg-white rounded-lg p-3 border border-purple-100">
                    <div className="text-xs text-gray-600 mb-1">Modifiche schede</div>
                    <div className="text-xs text-gray-500 mb-2">(progressioni)</div>
                    <div className="text-2xl font-bold text-purple-600">{monthlyCounters?.UpdatesCard}</div>
                  </div>

                  {/* Individual Training (PT) */}
                  <div className="bg-white rounded-lg p-3 border border-purple-100">
                    <div className="text-xs text-gray-600 mb-1">Allenamenti</div>
                    <div className="text-xs text-gray-500 mb-2">(individuali PT)</div>
                    <div className="text-2xl font-bold text-purple-600">{monthlyCounters?.IndividualTraining}</div>
                  </div>

                  {/* Total - Uniform styling with other counters */}
                  <div className="bg-white rounded-lg p-3 border border-purple-100">
                    <div className="text-xs text-gray-600 mb-1">Totale attività</div>
                    <div className="text-xs text-gray-500 mb-2">(questo mese)</div>
                    <div className="text-2xl font-bold text-purple-600">{monthlyCounters?.TotalCards}</div>
                  </div>
                </div>

                <p className="text-xs text-purple-700 mt-3">
                  I contatori si resettano automaticamente all'inizio di ogni mese.
                </p>
              </div>
            </div>
          )}

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cerca cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Order/Filter Button */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            {//TODO: qui metttere clienti totale istruttore?? 
              `${totalCustomers} clienti totali`}
          </p>

          <button
            onClick={() => setShowFilterPanel(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Ordina / Filtra
            {(activeFiltersCount > 0 || sortBy !== CustomerOrderBy.Default) && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {activeFiltersCount + (sortBy !== CustomerOrderBy.Default ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Active Filters Summary */}
        {(quickFilter !== 'all' || activeFiltersCount > 0 || searchQuery) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-blue-800 font-medium">Filtri attivi:</span>
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                    Ricerca
                  </span>
                )}
                {quickFilter !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                    {getFilterLabel('quickFilter', quickFilter)}
                  </span>
                )}
                {instructorFilter !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                    {getFilterLabel('instructor', instructors.find(i => i.id === instructorFilter)?.name || '')}
                  </span>
                )}
                {/* Show membershipFilter only if quickFilter is not 'membershipExpiring' to avoid duplication */}
                {membershipFilter !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                    {getFilterLabel('membership', membershipFilter)}
                  </span>
                )}
                {clientTypeFilter !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                    {getFilterLabel('clientType', clientTypeFilter)}
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

        {/* Client List */}
        {loading ? (
          <Loading message="Caricamento clienti..." />
        ) : (customers.length > 0 ? (
          <div className="space-y-3 mb-6">
            {customers.map((client) => (
              <ClientCard key={client.IdWinC} client={client} />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nessun cliente trovato</p>
          </div>
        ) : null)}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Precedente
            </button>

            <span className="text-sm text-gray-600">
              Pagina {currentPage} di {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Successiva
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center md:justify-center">
          <div className="bg-white w-full md:max-w-lg md:rounded-lg overflow-hidden max-h-[90vh] flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Ordina e Filtra</h2>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="overflow-y-auto p-4 space-y-6">
              {/* Sort Options */}
              <div>
                <h3 className="font-semibold mb-3">Ordina per</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      checked={sortBy === CustomerOrderBy.Default}
                      onChange={() => setSortBy(CustomerOrderBy.Default)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Urgenza (predefinito)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      checked={sortBy === CustomerOrderBy.LastCard}
                      onChange={() => setSortBy(CustomerOrderBy.LastCard)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Data ultima scheda</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      checked={sortBy === CustomerOrderBy.LastAccessDate}
                      onChange={() => setSortBy(CustomerOrderBy.LastAccessDate)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Data ultimo accesso</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      checked={sortBy === CustomerOrderBy.NameAsc}
                      onChange={() => setSortBy(CustomerOrderBy.NameAsc)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Nome (A-Z)</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              {/* Membership Filters */}
              <div>
                <h3 className="font-semibold mb-3">Filtri Abbonamento</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="membership"
                      checked={membershipFilter === 'all'}
                      onChange={() => setMembershipFilter('all')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Tutti gli abbonamenti</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="membership"
                      checked={membershipFilter === 'expiringSoon'}
                      onChange={() => setMembershipFilter('expiringSoon')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Abbonamento in scadenza (30 giorni)</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              {/* Instructor Filter */}
              <div>
                <h3 className="font-semibold mb-3">Filtra per istruttore</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="instructor"
                      checked={instructorFilter === 'all'}
                      onChange={() => setInstructorFilter('all')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Tutti gli istruttori</span>
                  </label>
                  {instructors.map((instructor) => (
                    <label key={instructor.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="instructor"
                        checked={instructorFilter === instructor.id}
                        onChange={() => setInstructorFilter(instructor.id!)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">{instructor.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              {/* Client Type Filter */}
              <div>
                <h3 className="font-semibold mb-3">Filtra per tipo di cliente</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="clientType"
                      checked={clientTypeFilter === 'all'}
                      onChange={() => setClientTypeFilter('all')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Tutti i tipi di cliente</span>
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
                onClick={() => {
                  setInstructorFilter('all');
                  setMembershipFilter('all');
                  setClientTypeFilter('all');
                  setSortBy(CustomerOrderBy.Default);
                }}
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
    </div>
  );
}