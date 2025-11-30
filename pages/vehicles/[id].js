import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  Edit,
  Plus,
  FileText,
  Car,
  Calendar,
  Gauge,
  Phone,
  Mail,
  Trash2,
} from 'lucide-react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import Layout from '../../components/layout/Layout';
import VehicleForm from '../../components/vehicles/VehicleForm';
import ServiceForm from '../../components/vehicles/ServiceForm';
import StatusBadge, {
  getTuvStatus,
  getServiceStatus,
} from '../../components/dashboard/StatusBadge';
import { useVehicles } from '../../src/utils/hooks';
import { generateServicePDF } from '../../src/utils/pdfGenerator';
import useStore from '../../src/store/useStore';

function VehicleDetailContent() {
  const logout = useStore((state) => state.logout);
  const router = useRouter();
  const { id } = router.query;

  const [vehicle, setVehicle] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editServiceIndex, setEditServiceIndex] = useState(null);

  const { updateVehicleData, addService, loading, error } = useVehicles();

  // fahrzeug daten holen
  useEffect(() => {
    if (id) {
      fetchVehicle();
    }
  }, [id]);

  const fetchVehicle = async () => {
    if (!id) return;
    
    const currentToken = useStore.getState().token;
    
    if (!currentToken) {
      console.error('kein token!');
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          router.push('/login');
          return;
        }
        throw new Error('laden fehlgeschlagen');
      }
      
      const data = await response.json();
      setVehicle(data.vehicle);
    } catch (err) {
      console.error('fehler:', err);
      setError(err.message);
    }
  };

  const handleUpdateVehicle = async (vehicleData) => {
    try {
      const updated = await updateVehicleData(id, vehicleData);
      setVehicle(updated);
      setShowEditForm(false);
    } catch (err) {
      // fehler vom hook
    }
  };

  const handleAddService = async (serviceData) => {
    try {
      if (editingService !== null) {
        // service bearbeiten
        const updatedHistory = [...vehicle.serviceHistory];
        updatedHistory[editingService] = serviceData;
        
        const updatedVehicle = {
          ...vehicle,
          serviceHistory: updatedHistory,
        };
        
        const updated = await updateVehicleData(id, updatedVehicle);
        setVehicle(updated);
        setShowServiceForm(false);
        setEditingService(null);
      } else {
        // neuen service hinzufügen
        const updated = await addService(id, serviceData);
        setVehicle(updated);
        setShowServiceForm(false);
      }
    } catch (err) {
      // fehler vom hook
    }
  };

  const handleEditService = (index) => {
    const sortedHistory = [...vehicle.serviceHistory].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    const originalIndex = vehicle.serviceHistory.findIndex(
      (s) => s === sortedHistory[index]
    );
    setEditingService(originalIndex);
    setEditServiceIndex(index);
    setShowServiceForm(true);
  };

  const handleDeleteService = async (index) => {
    if (!window.confirm('wirklich löschen?')) {
      return;
    }

    try {
      const sortedHistory = [...vehicle.serviceHistory].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      const originalIndex = vehicle.serviceHistory.findIndex(
        (s) => s === sortedHistory[index]
      );

      const updatedHistory = vehicle.serviceHistory.filter(
        (_, i) => i !== originalIndex
      );

      const updatedVehicle = {
        ...vehicle,
        serviceHistory: updatedHistory,
      };

      const updated = await updateVehicleData(id, updatedVehicle);
      setVehicle(updated);
    } catch (err) {
      console.error('löschen fehlgeschlagen:', err);
    }
  };

  const handleGeneratePDF = () => {
    if (vehicle) {
      generateServicePDF(vehicle, vehicle.serviceHistory);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'nicht gesetzt';
    return new Date(date).toLocaleDateString('de-DE');
  };

  if (!vehicle) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const tuvStatus = getTuvStatus(vehicle.nextTuvDate);
  const serviceStatus = getServiceStatus(vehicle.currentKm, vehicle.lastServiceKm);

  return (
    <Layout>
      <div className="space-y-6">
        {/* kopfbereich */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Zurück</span>
          </button>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowEditForm(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Bearbeiten</span>
            </button>

            <button
              onClick={handleGeneratePDF}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>PDF Export</span>
            </button>
          </div>
        </div>

        {/* fahrzeug infos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-4 rounded-lg">
                <Car className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {vehicle.licensePlate}
                </h1>
                <p className="text-lg text-gray-600">
                  {vehicle.make} {vehicle.model} ({vehicle.year})
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <StatusBadge type="tuv" status={tuvStatus} />
              <StatusBadge type="service" status={serviceStatus} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* besitzer */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Besitzer</h3>
              <p className="text-lg font-semibold text-gray-900">{vehicle.ownerName}</p>
              {vehicle.ownerPhone && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Phone className="h-4 w-4 mr-1" />
                  {vehicle.ownerPhone}
                </div>
              )}
              {vehicle.ownerEmail && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  {vehicle.ownerEmail}
                </div>
              )}
            </div>

            {/* km stand */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Kilometerstand</h3>
              <div className="flex items-center">
                <Gauge className="h-5 w-5 mr-2 text-primary" />
                <p className="text-lg font-semibold text-gray-900">
                  {vehicle.currentKm.toLocaleString('de-DE')} km
                </p>
              </div>
            </div>

            {/* tüv */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">TÜV</h3>
              <div className="space-y-1">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">Letzter:</span>
                  <span className="ml-2 font-medium">{formatDate(vehicle.lastTuvDate)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">Nächster:</span>
                  <span className="ml-2 font-medium">{formatDate(vehicle.nextTuvDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* service historie */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Service Historie</h2>
            <button
              onClick={() => setShowServiceForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>neuer service</span>
            </button>
          </div>

          {vehicle.serviceHistory && vehicle.serviceHistory.length > 0 ? (
            <div className="space-y-4">
              {vehicle.serviceHistory
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((service, index) => {
                  const totalCost = service.partsCost + service.laborHours * service.laborRate;
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatDate(service.date)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {service.km.toLocaleString('de-DE')} km
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {service.isTuv && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              TÜV
                            </span>
                          )}
                          <button
                            onClick={() => handleEditService(index)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Service bearbeiten"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Service löschen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-800 mb-3">{service.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Material:</span>
                          <span className="ml-2 font-medium">
                            {service.partsCost.toFixed(2)} €
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Arbeit:</span>
                          <span className="ml-2 font-medium">
                            {service.laborHours}h × {service.laborRate} € ={' '}
                            {(service.laborHours * service.laborRate).toFixed(2)} €
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Gesamt:</span>
                          <span className="ml-2 font-bold text-primary">
                            {totalCost.toFixed(2)} €
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              noch keine services eingetragen
            </div>
          )}
        </div>

        {/* fehler anzeige */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* formulare */}
        {showEditForm && (
          <VehicleForm
            vehicle={vehicle}
            onSubmit={handleUpdateVehicle}
            onCancel={() => setShowEditForm(false)}
            loading={loading}
          />
        )}

        {showServiceForm && (
          <ServiceForm
            vehicleId={id}
            currentKm={vehicle.currentKm}
            service={editingService !== null ? vehicle.serviceHistory[editingService] : null}
            onSubmit={handleAddService}
            onCancel={() => {
              setShowServiceForm(false);
              setEditingService(null);
            }}
            loading={loading}
          />
        )}
      </div>
    </Layout>
  );
}

export default function VehicleDetail() {
  return (
    <ProtectedRoute>
      <VehicleDetailContent />
    </ProtectedRoute>
  );
}
