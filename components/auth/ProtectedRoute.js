import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useStore from '../../src/store/useStore';

// Higher-Order Component für geschützte Routen
export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Umleitung wenn nicht authentifiziert
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Nichts rendern während Prüfung
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return children;
}
