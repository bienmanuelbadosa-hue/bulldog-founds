import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ItemListPage } from './pages/ItemListPage';
import { CreateItemPage } from './pages/CreateItemPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import type { ItemPost } from './types';
import './App.css';

type PageType = 'login' | 'register' | 'list' | 'create' | 'detail' | 'profile';

function AppContent() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('list');
  const [selectedItem, setSelectedItem] = useState<ItemPost | null>(null);

  // SEO: Update page title and meta description dynamically based on the active page
  useEffect(() => {
    let title = 'Bulldog Founds — Lost & Found Hub';
    let metaDescription = 'The official Lost and Found bulletin board for National University Laguna campus community.';

    switch (currentPage) {
      case 'login':
        title = 'Login | Bulldog Founds';
        break;
      case 'register':
        title = 'Register | Bulldog Founds';
        break;
      case 'create':
        title = 'Report Item | Bulldog Founds';
        break;
      case 'detail':
        title = selectedItem ? `${selectedItem.title} | Bulldog Founds` : 'Item Details';
        break;
      case 'profile':
        title = 'My Profile | Bulldog Founds';
        break;
      default:
        title = 'Bulletin Board | Bulldog Founds';
    }

    document.title = title;
    
    const metaTag = document.querySelector('meta[name="description"]');
    if (metaTag) {
      metaTag.setAttribute('content', metaDescription);
    }
  }, [currentPage, selectedItem]);

  // Route protection logic
  const activePage = !isAuthenticated
    ? (currentPage === 'register' ? 'register' : 'login')
    : (currentPage === 'login' || currentPage === 'register' ? 'list' : currentPage);

  if (loading) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh', 
          backgroundColor: 'var(--bg-app)',
          color: 'var(--text-primary)'
        }}
      >
        <div style={{ fontSize: '3rem', animation: 'spin 1.5s linear infinite', display: 'inline-block', marginBottom: '16px' }}>🐾</div>
        <p style={{ fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Loading Bulldog Founds...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      {isAuthenticated && user && (
        <Header
          user={user}
          onLogout={logout}
          onGoToFeed={() => setCurrentPage('list')}
          onGoToProfile={() => setCurrentPage('profile')}
        />
      )}

      <main className="layout-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activePage === 'login' && (
          <LoginPage
            onLoginSuccess={() => setCurrentPage('list')}
            onSwitchToRegister={() => setCurrentPage('register')}
          />
        )}

        {activePage === 'register' && (
          <RegisterPage
            onRegisterSuccess={() => setCurrentPage('list')}
            onSwitchToLogin={() => setCurrentPage('login')}
          />
        )}

        {activePage === 'list' && (
          <ItemListPage
            onSelectItem={(item) => {
              setSelectedItem(item);
              setCurrentPage('detail');
            }}
            onCreateNew={() => setCurrentPage('create')}
            onGoToProfile={() => setCurrentPage('profile')}
          />
        )}

        {activePage === 'create' && (
          <CreateItemPage
            onItemCreated={() => setCurrentPage('list')}
            onCancel={() => setCurrentPage('list')}
          />
        )}

        {activePage === 'detail' && selectedItem && (
          <ItemDetailPage
            item={selectedItem}
            onBack={() => setCurrentPage('list')}
            onDelete={() => {
              setSelectedItem(null);
              setCurrentPage('list');
            }}
          />
        )}

        {activePage === 'profile' && (
          <ProfilePage
            onSelectItem={(item) => {
              setSelectedItem(item);
              setCurrentPage('detail');
            }}
            onBack={() => setCurrentPage('list')}
          />
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', fontSize: '0.85rem' }}>
        © {new Date().getFullYear()} National University Laguna. All rights reserved. • Bulldog Founds Lost & Found Hub
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
