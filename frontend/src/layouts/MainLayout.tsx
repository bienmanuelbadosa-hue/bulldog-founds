import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '../routes/AppRoutes';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * MainLayout — wraps all page content with the app shell:
 * - Sticky Header (navigation + theme toggle)
 * - Main content area (children from AppRoutes)
 * - Footer
 *
 * Navigation callbacks are sourced from NavigationContext (owned by AppRoutes)
 * so MainLayout does not need to receive them as props.
 * The Header is only rendered when the user is authenticated.
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { goToFeed, goToProfile } = useNavigation();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
      }}
    >
      {isAuthenticated && user && (
        <Header
          user={user}
          onLogout={logout}
          onGoToFeed={goToFeed}
          onGoToProfile={goToProfile}
        />
      )}

      <main
        className="layout-container"
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        {children}
      </main>

      <Footer />
    </div>
  );
};
