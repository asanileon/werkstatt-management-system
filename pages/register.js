import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../src/utils/hooks';
import { Wrench, Mail, Lock, User } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error: err } = useAuth();

  const [data, setData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Mechanic',
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(data);
      router.push('/dashboard');
    } catch (err) {
      console.error('register failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Wrench className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Werkstatt System</h2>
          <p className="mt-2 text-gray-600">Konto erstellen</p>
        </div>

        {/* registrierungs formular */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* name eingeben */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={data.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Ihr Name"
                />
              </div>
            </div>

            {/* email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={data.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="ihre@email.de"
                />
              </div>
            </div>

            {/* passwort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Passwort
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={data.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">mind. 6 zeichen</p>
            </div>

            {/* rolle auswählen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rolle
              </label>
              <select
                name="role"
                value={data.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Mechanic">Mechaniker</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

            {err && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {err}
              </div>
            )}

            {/* registrierungs button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrierung läuft...' : 'Registrieren'}
            </button>
          </form>

          {/* zurück zum login */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Bereits ein Konto?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Jetzt anmelden
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
