import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ServiceForm({ vehicleId, currentKm, service: svc, onSubmit, onCancel, loading }) {
  const [data, setData] = useState({
    date: new Date().toISOString().split('T')[0],
    km: currentKm || 0,
    description: '',
    partsCost: 0,
    laborHours: 0,
    laborRate: 80,
    isTuv: false,
  });

  useEffect(() => {
    if (svc) {
      setData({
        date: svc.date ? new Date(svc.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        km: svc.km || currentKm || 0,
        description: svc.description || '',
        partsCost: svc.partsCost || 0,
        laborHours: svc.laborHours || 0,
        laborRate: svc.laborRate || 80,
        isTuv: svc.isTuv || false,
      });
    }
  }, [svc, currentKm]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData({
      ...data,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(data);
  };

  const total = data.partsCost + data.laborHours * data.laborRate;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {svc ? 'service bearbeiten' : 'neuer service'}
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
          {/* basis daten */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datum *
              </label>
              <input
                type="date"
                name="date"
                value={data.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kilometerstand *
              </label>
              <input
                type="number"
                name="km"
                value={data.km}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* beschreibung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beschreibung *
            </label>
            <textarea
              name="description"
              value={data.description}
              onChange={handleChange}
              required
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="was wurde gemacht? z.b. ölwechsel, bremsen, tüv..."
            />
          </div>

          {/* kosten */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kosten</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Materialkosten (€)
                </label>
                <input
                  type="number"
                  name="partsCost"
                  value={data.partsCost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arbeitsstunden
                </label>
                <input
                  type="number"
                  name="laborHours"
                  value={data.laborHours}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stundensatz (€)
                </label>
                <input
                  type="number"
                  name="laborRate"
                  value={data.laborRate}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">gesamt</p>
              <p className="text-2xl font-bold text-primary">
                {total.toFixed(2)} €
              </p>
            </div>
          </div>

          {/* tüv checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isTuv"
              name="isTuv"
              checked={data.isTuv}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="isTuv" className="ml-2 text-sm text-gray-700">
              war tüv dabei (nächster tüv wird dann +2 jahre gesetzt)
            </label>
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
              {loading ? 'speichert...' : svc ? 'speichern' : 'hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
