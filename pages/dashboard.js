import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Layout from '../components/layout/Layout';
import VehicleCard from '../components/dashboard/VehicleCard';
import VehicleForm from '../components/vehicles/VehicleForm';
import useStore from '../src/store/useStore';
import { useVehicles } from '../src/utils/hooks';

function DashboardContent() {
  const vehicles = useStore((state) => state.vehicles);
  const {
    fetchVehicles,
    createVehicle,
    deleteVehicle,
    loading,
    error,
  } = useVehicles();

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // fahrzeuge laden wenn seite öffnet
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // suche durchführen
  const filteredVehicles = vehicles.filter((vehicle) => {
    const search = searchTerm.toLowerCase();
    return (
      vehicle.licensePlate.toLowerCase().includes(search) ||
      vehicle.ownerName.toLowerCase().includes(search) ||
      vehicle.make.toLowerCase().includes(search) ||
      vehicle.model.toLowerCase().includes(search)
    );
  });

  const handleCreateVehicle = async (vehicleData) => {
    try {
      await createVehicle(vehicleData);
      setShowForm(false);
    } catch (err) {
      // fehler wird vom hook behandelt
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      await deleteVehicle(vehicleId);
    } catch (err) {
      // fehler vom hook
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* kopfzeile */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              {vehicles.length} Fahrzeug{vehicles.length !== 1 ? 'e' : ''} registriert
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Neues Fahrzeug</span>
          </button>
        </div>

        {/* suchfeld */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="suche nach kennzeichen, besitzer, marke..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* fehler meldung wenn was nicht klappt */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* loading spinner */}
        {loading && vehicles.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* liste der fahrzeuge */}
            {filteredVehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle._id}
                    vehicle={vehicle}
                    onDelete={handleDeleteVehicle}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchTerm
                    ? 'nix gefunden...'
                    : 'noch keine autos da'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 text-primary hover:underline"
                  >
                    erstes auto hinzufügen
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* neues fahrzeug formular */}
        {showForm && (
          <VehicleForm
            onSubmit={handleCreateVehicle}
            onCancel={() => setShowForm(false)}
            loading={loading}
          />
        )}
      </div>
    </Layout>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
