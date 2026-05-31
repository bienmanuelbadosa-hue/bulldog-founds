import { useAuth } from './hooks/useAuth';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { LoadingSpinner } from './components/LoadingSpinner';
import './App.css';

/**
 * AppContent — resolves auth state and renders the app shell.
 *
 * Thin by design:
 * - Auth loading state → LoadingSpinner
 * - Page navigation & layout shell → AppRoutes
 */
function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return <AppRoutes />;
}

/**
 * App — root component.
 * Wraps the entire application in AuthProvider so useAuth is available everywhere.
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
