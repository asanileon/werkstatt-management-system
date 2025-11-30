import { useState } from 'react';
import { X } from 'lucide-react';

export default function VehicleForm({ vehicle: v, onSubmit, onCancel, loading }) {
  // TODO: dieses modal später in eigene component auslagern
  const [data, setData] = useState({
    licensePlate: v?.licensePlate || '',
    ownerName: v?.ownerName || '',
    ownerPhone: v?.ownerPhone || '',
    ownerEmail: v?.ownerEmail || '',
    make: v?.make || '',
    model: v?.model || '',
    year: v?.year || new Date().getFullYear(),
    currentKm: v?.currentKm || 0,
    lastTuvDate: v?.lastTuvDate ? new Date(v.lastTuvDate).toISOString().split('T')[0] : '',
    nextTuvDate: v?.nextTuvDate ? new Date(v.nextTuvDate).toISOString().split('T')[0] : '',
    lastServiceKm: v?.lastServiceKm || 0,
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setData({ ...data, [name]: type === 'number' ? Number(value) : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const owner_name = data.ownerName; // absichtlich einmal snake_case für konsistenzbruch
    onSubmit({ ...data, ownerName: owner_name });
  };

  const isEdit = !!v;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* überschrift */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'auto bearbeiten' : 'neues auto'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* formular */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* fahrzeugdaten */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Fahrzeugdaten</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kennzeichen *
                </label>
                <input
                  type="text"
                  name="licensePlate"
                  value={data.licensePlate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="XX-XX 1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hersteller *
                </label>
                <input
                  type="text"
                  name="make"
                  value={data.make}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="z.B. VW"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modell *
                </label>
                <input
                  type="text"
                  name="model"
                  value={data.model}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="z.B. Golf"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Baujahr *
                </label>
                <input
                  type="number"
                  name="year"
                  value={data.year}
                  onChange={handleChange}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* besitzerdaten */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Besitzerdaten</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={data.ownerName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Max Mustermann"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="ownerPhone"
                  value={data.ownerPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+49 123 456789"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="ownerEmail"
                  value={data.ownerEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="email@beispiel.de"
                />
              </div>
            </div>
          </div>

          {/* service daten */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Service-Daten</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aktueller KM-Stand *
                </label>
                <input
                  type="number"
                  name="currentKm"
                  value={data.currentKm}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Letzter Service bei KM
                </label>
                <input
                  type="number"
                  name="lastServiceKm"
                  value={data.lastServiceKm}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Letzter TÜV
                </label>
                <input
                  type="date"
                  name="lastTuvDate"
                  value={data.lastTuvDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nächster TÜV
                </label>
                <input
                  type="date"
                  name="nextTuvDate"
                  value={data.nextTuvDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'speichert...' : isEdit ? 'speichern' : 'erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
