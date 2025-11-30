import { useRouter } from 'next/router';
import Link from 'next/link';
import useStore from '../../store/useStore';
import { LogOut, Wrench, User, Settings } from 'lucide-react';

export default function Layout({ children }) {
  const router = useRouter();
  const { user, isAuth, logout } = useStore((s) => ({
    user: s.user,
    isAuth: s.isAuthenticated,
    logout: s.logout
  }));
  // TODO: später responsive header vereinfachen

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (router.pathname === '/login' || router.pathname === '/register') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="items-center h-16 flex justify-between">
            <div className="cursor-pointer flex items-center" onClick={() => router.push('/dashboard')}>
              <Wrench className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">Werkstatt System</span>
            </div>

            {isAuth && (
              <div className="space-x-4 items-center flex">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-gray-500 capitalize">{user?.role}</p>
                  </div>
                </div>

                {(user?.role === 'manager' || user?.role === 'Manager') && (
                  <Link href="/settings" className="px-3 py-2 hover:bg-gray-100 text-sm font-medium rounded-md flex items-center space-x-1 transition-colors text-gray-700">
                    <Settings className="h-4 w-4" />
                    <span>Einstellungen</span>
                  </Link>
                )}

                <button onClick={handleLogout} className="px-3 py-2 transition-colors text-sm font-medium rounded-md flex items-center space-x-1 text-gray-700 hover:bg-gray-100">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>

      <footer className="mt-auto bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-center text-gray-500">© 2025 Werkstatt Management System</p>
        </div>
      </footer>
    </div>
  );
}