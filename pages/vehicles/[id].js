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
import { useVehicles } from '../../utils/hooks';
import { generateServicePDF } from '../../utils/pdfGenerator';
import useStore from '../../store/useStore';

function VehicleDetailContent() {
  const logout = useStore((state) => state.logout);
  const router = useRouter();
  const { id } = router.query;

  const [v, setV] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showSvc, setShowSvc] = useState(false);
  const [editIdx, setEditIdx] = useState(null);

  const { updateVehicleData, addService, loading, error: err } = useVehicles();

  // fahrzeug daten holen
  useEffect(() => {
    if (id) {
      fetchVehicle();
    }
  }, [id]);

  const fetchVehicle = async () => {
    if (!id) return;
    
    const token = useStore.getState().token;
    if (!token) {
      console.error('kein token!');
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          logout();
          router.push('/login');
          return;
        }
        throw new Error('laden fehlgeschlagen');
      }
      
      const json = await res.json();
      setV(json.vehicle);
    } catch (e) {
      console.error('load failed:', e);
    }
  };

  const handleUpdate = async (data) => {
    try {
      const updated = await updateVehicleData(id, data);
      setV(updated);
      setShowEdit(false);
    } catch (e) {
      console.error('update failed:', e);
    }
  };

  const handleAddService = async (data) => {
    try {
      if (editIdx !== null) {
        const history = [...v.serviceHistory];
        history[editIdx] = data;
        const updated = await updateVehicleData(id, { ...v, serviceHistory: history });
        setV(updated);
        setEditIdx(null);
      } else {
        const updated = await addService(id, data);
        setV(updated);
      }
      setShowSvc(false);
    } catch (e) {
      console.error('service failed:', e);
    }
  };

  const handleEdit = (idx) => {
    const sorted = [...v.serviceHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    const realIdx = v.serviceHistory.findIndex((s) => s === sorted[idx]);
    setEditIdx(realIdx);
    setShowSvc(true);
  };

  const handleDelete = async (idx) => {
    if (!window.confirm('wirklich löschen?')) return;

    try {
      const sorted = [...v.serviceHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
      const realIdx = v.serviceHistory.findIndex((s) => s === sorted[idx]);
      const history = v.serviceHistory.filter((_, i) => i !== realIdx);
      const updated = await updateVehicleData(id, { ...v, serviceHistory: history });
      setV(updated);
    } catch (e) {
      console.error('delete failed:', e);
    }
  };

  const handlePDF = () => {
    if (v) generateServicePDF(v, v.serviceHistory);
  };

  const formatDate = (date) => {
    if (!date) return 'nicht gesetzt';
    return new Date(date).toLocaleDateString('de-DE');
  };

  if (!v) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const tuvStatus = getTuvStatus(v.nextTuvDate);
  const svcStatus = getServiceStatus(v.currentKm, v.lastServiceKm);

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
              onClick={() => setShowEdit(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Bearbeiten</span>
            </button>

            <button
              onClick={handlePDF}
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
                  {v.licensePlate}
                </h1>
                <p className="text-lg text-gray-600">
                  {v.make} {v.model} ({v.year})
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <StatusBadge type="tuv" status={tuvStatus} />
              <StatusBadge type="service" status={svcStatus} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Besitzer</h3>
              <p className="text-lg font-semibold text-gray-900">{v.ownerName}</p>
              {v.ownerPhone && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Phone className="h-4 w-4 mr-1" />
                  {v.ownerPhone}
                </div>
              )}
              {v.ownerEmail && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  {v.ownerEmail}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Kilometerstand</h3>
              <div className="flex items-center">
                <Gauge className="h-5 w-5 mr-2 text-primary" />
                <p className="text-lg font-semibold text-gray-900">
                  {v.currentKm.toLocaleString('de-DE')} km
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">TÜV</h3>
              <div className="space-y-1">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">Letzter:</span>
                  <span className="ml-2 font-medium">{formatDate(v.lastTuvDate)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">Nächster:</span>
                  <span className="ml-2 font-medium">{formatDate(v.nextTuvDate)}</span>
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
              onClick={() => setShowSvc(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>neuer service</span>
            </button>
          </div>

          {v.serviceHistory && v.serviceHistory.length > 0 ? (
            <div className="space-y-4">
              {v.serviceHistory
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((svc, idx) => {
                  const total = svc.partsCost + svc.laborHours * svc.laborRate;
                  return (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatDate(svc.date)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {svc.km.toLocaleString('de-DE')} km
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {svc.isTuv && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              TÜV
                            </span>
                          )}
                          <button
                            onClick={() => handleEdit(idx)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Service bearbeiten"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(idx)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Service löschen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-800 mb-3">{svc.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Material:</span>
                          <span className="ml-2 font-medium">
                            {svc.partsCost.toFixed(2)} €
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Arbeit:</span>
                          <span className="ml-2 font-medium">
                            {svc.laborHours}h × {svc.laborRate} € ={' '}
                            {(svc.laborHours * svc.laborRate).toFixed(2)} €
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Gesamt:</span>
                          <span className="ml-2 font-bold text-primary">
                            {total.toFixed(2)} €
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

        {err && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {err}
          </div>
        )}

        {showEdit && (
          <VehicleForm
            vehicle={v}
            onSubmit={handleUpdate}
            onCancel={() => setShowEdit(false)}
            loading={loading}
          />
        )}

        {showSvc && (
          <ServiceForm
            vehicleId={id}
            currentKm={v.currentKm}
            service={editIdx !== null ? v.serviceHistory[editIdx] : null}
            onSubmit={handleAddService}
            onCancel={() => {
              setShowSvc(false);
              setEditIdx(null);
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
