import { useRouter } from 'next/router';
import { Car, Calendar, Gauge, Trash2 } from 'lucide-react';
import StatusBadge, { getTuvStatus, getServiceStatus } from './StatusBadge';
import useStore from '../../src/store/useStore';

export default function VehicleCard({ vehicle, onDelete }) {
  const router = useRouter();
  const user = useStore((state) => state.user);

  const tuvStatus = getTuvStatus(vehicle.nextTuvDate);
  const serviceStatus = getServiceStatus(vehicle.currentKm, vehicle.lastServiceKm);

  const formatDate = (date) => {
    if (!date) return 'nicht gesetzt';
    return new Date(date).toLocaleDateString('de-DE');
  };

  const handleCardClick = () => {
    router.push(`/vehicles/${vehicle._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // verhindert dass man zur detail seite geht
    if (window.confirm('wirklich löschen?')) {
      onDelete(vehicle._id);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
      onClick={handleCardClick}
    >
      <div className="p-6">
        {/* kopfzeile */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {vehicle.licensePlate}
              </h3>
              <p className="text-sm text-gray-600">
                {vehicle.make} {vehicle.model}
              </p>
            </div>
          </div>

          {/* löschen button nur für manager */}
          {user?.role === 'Manager' && (
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="löschen"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* besitzer info */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">Besitzer</p>
          <p className="text-sm font-medium text-gray-900">{vehicle.ownerName}</p>
        </div>

        {/* details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Gauge className="h-4 w-4 mr-2" />
            <span>{vehicle.currentKm.toLocaleString('de-DE')} km</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>nächster tüv: {formatDate(vehicle.nextTuvDate)}</span>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2">
          <StatusBadge type="tuv" status={tuvStatus} />
          <StatusBadge type="service" status={serviceStatus} />
        </div>
      </div>
    </div>
  );
}
