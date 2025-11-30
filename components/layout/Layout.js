import { useRouter } from 'next/router';
import Link from 'next/link';  // ← FEHLTE!
import useStore from '../../src/store/useStore';
import { LogOut, Wrench, User, Settings } from 'lucide-react';  // ← Settings Icon hinzugefügt

export default function Layout({ children }) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // kein layout für login/register
  if (router.pathname === '/login' || router.pathname === '/register') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* logo */}
            <div
              className="flex items-center cursor-pointer"
              onClick={() => router.push('/dashboard')}
            >
              <Wrench className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                Werkstatt System
              </span>
            </div>

            {/* user menü */}
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>

                {/* einstellungen nur für manager */}
                {(user?.role === 'manager' || user?.role === 'Manager') && (
                  <Link
                    href="/settings"
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Einstellungen</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* hauptinhalt */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* fußzeile */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2025 Werkstatt Management System
          </p>
        </div>
      </footer>
    </div>
  );
}