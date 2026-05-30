import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { ItemListPage } from './components/ItemListPage';
import { CreateItemPage } from './components/CreateItemPage';
import { ItemDetailPage } from './components/ItemDetailPage';
import { apiService } from './api';
import type { AuthResponse, ItemPost, User } from './api';
import { theme } from './theme';
import './App.css';

type PageType = 'login' | 'register' | 'list' | 'create' | 'detail';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('login');
  const [user, setUser] = useState<User | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItemPost | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentPage('list');
    }
  }, []);

  const handleLoginSuccess = (auth: AuthResponse) => {
    setUser(auth.user);
    localStorage.setItem('user', JSON.stringify(auth.user));
    setCurrentPage('list');
  };

  const handleRegisterSuccess = (auth: AuthResponse) => {
    setUser(auth.user);
    localStorage.setItem('user', JSON.stringify(auth.user));
    setCurrentPage('list');
  };

  const handleLogout = () => {
    apiService.clearToken();
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('login');
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.light,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <div style={containerStyle}>
      {user && <Header onLogout={handleLogout} user={user} />}

      <div style={contentStyle}>
        {currentPage === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setCurrentPage('register')}
          />
        )}

        {currentPage === 'register' && (
          <RegisterPage
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setCurrentPage('login')}
          />
        )}

        {currentPage === 'list' && user && (
          <ItemListPage
            onSelectItem={(item) => {
              setSelectedItem(item);
              setCurrentPage('detail');
            }}
            onCreateNew={() => setCurrentPage('create')}
          />
        )}

        {currentPage === 'create' && user && (
          <CreateItemPage
            onItemCreated={() => setCurrentPage('list')}
            onCancel={() => setCurrentPage('list')}
          />
        )}

        {currentPage === 'detail' && selectedItem && user && (
          <ItemDetailPage
            item={selectedItem}
            onBack={() => setCurrentPage('list')}
            onDelete={() => setCurrentPage('list')}
            isOwner={selectedItem.createdByEmail === user.email}
          />
        )}
      </div>
    </div>
  );
}

export default App;
