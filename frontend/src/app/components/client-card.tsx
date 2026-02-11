import { Customer } from '../lib/types';
import { getExpirationText, formatDate } from '../lib/utils';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClientStore } from '../stores/useClientStore';
import { CustomerWarning } from '../lib/filtermodel';

interface ClientCardProps {
  client: Customer;
}

export function ClientCard({ client }: ClientCardProps) {
  const expirationText = getExpirationText(client);
  const navigate = useNavigate();
  const setSelectedClientId = useClientStore(state => state.setSelectedClientId);

  // Pastel background colors based on status
  const getBackgroundColor = () => {
    switch (client.Warning) {
      case CustomerWarning.Ok:
        return 'bg-green-50';
      case CustomerWarning.Warning:
        return 'bg-yellow-50';
      case CustomerWarning.Expired:
        return 'bg-red-50';
      case CustomerWarning.Rescheduled:
        return 'bg-gray-50';
    }
  };

  const handleClientClick = (id: number) => {
    setSelectedClientId(id);
    navigate('/client');
  };

  return (
    <div
      onClick={() => handleClientClick(client.IdWinC)}
      className={`block ${getBackgroundColor()} rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-gray-900">{client.Name}</h3>
              {client.IsMDSSub && (
                <span className="inline-flex items-center text-xs px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full border border-cyan-300 font-semibold">
                  MDS
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1.5 text-sm">
            {client.Warning === CustomerWarning.Rescheduled ? (
              <div className="text-gray-600 italic">
                In attesa di attivazione del programma
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="font-medium">Scheda:</span>
                  <span>{expirationText}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">Ultimo accesso:</span>
                  <span>{client.LastAccessDate ? formatDate(new Date(client.LastAccessDate)) : 'N/A'}</span>
                </div>
                {client.SubscriptionExpiring && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center text-xs px-2 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded">
                      Abbonamento in scadenza
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <ChevronRight className="text-gray-400 w-5 h-5 flex-shrink-0" />
      </div>
    </div>
  );
}