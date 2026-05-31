import React, { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ItemListPage } from '../pages/ItemListPage';
import { CreateItemPage } from '../pages/CreateItemPage';
import { ItemDetailPage } from '../pages/ItemDetailPage';
import { ProfilePage } from '../pages/ProfilePage';
import { MainLayout } from '../layouts/MainLayout';
import type { ItemPost } from '../types';

type PageType = 'login' | 'register' | 'list' | 'create' | 'detail' | 'profile';

// Navigation context — exposes go-to callbacks to sibling components (e.g. MainLayout/Header)
interface NavigationContextValue {
  goToFeed: () => void;
  goToProfile: () => void;
}

export const NavigationContext = createContext<NavigationContextValue>({
  goToFeed: () => { },
  goToProfile: () => { },
});

export const useNavigation = () => useContext(NavigationContext);

/**
 * AppRoutes — centralises all page navigation and route protection logic.
 *
 * Responsibilities:
 * - Manage the current page state
 * - Protect authenticated routes (redirect unauthenticated users to login)
 * - Update document title dynamically for SEO on each navigation
 * - Pass navigation callbacks down to pages
 * - Expose navigation via NavigationContext for Header integration
 */
export const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('list');
  const [selectedItem, setSelectedItem] = useState<ItemPost | null>(null);

  // SEO: Update page title dynamically based on the active page
  useEffect(() => {
    const titles: Record<PageType, string> = {
      login: 'Login | Bulldog Founds',
      register: 'Register | Bulldog Founds',
      create: 'Report Item | Bulldog Founds',
      detail: selectedItem
        ? `${selectedItem.title} | Bulldog Founds`
        : 'Item Details | Bulldog Founds',
      profile: 'My Profile | Bulldog Founds',
      list: 'Bulletin Board | Bulldog Founds',
    };
    document.title = titles[currentPage] ?? 'Bulldog Founds — Lost & Found Hub';

    const metaTag = document.querySelector('meta[name="description"]');
    if (metaTag) {
      metaTag.setAttribute(
        'content',
        'The official Lost and Found bulletin board for National University Laguna campus community.'
      );
    }
  }, [currentPage, selectedItem]);

  // Route protection: unauthenticated users only see login or register
  const activePage = !isAuthenticated
    ? currentPage === 'register'
      ? 'register'
      : 'login'
    : currentPage === 'login' || currentPage === 'register'
      ? 'list'
      : currentPage;

  const navigationValue: NavigationContextValue = {
    goToFeed: () => setCurrentPage('list'),
    goToProfile: () => setCurrentPage('profile'),
  };

  return (
    <NavigationContext.Provider value={navigationValue}>
      <MainLayout>
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
      </MainLayout>
    </NavigationContext.Provider>
  );
};
