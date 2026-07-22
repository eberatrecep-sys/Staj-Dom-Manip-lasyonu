import { ForgotPasswordForm } from './features/auth/components/ForgotPasswordForm';
import { ResetPasswordForm } from './features/auth/components/ResetPasswordForm';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CurrencyWidget } from './features/currency/components/CurrencyWidget';
import { ShoppingForm } from './features/shopping-list/components/ShoppingForm';
import { Dashboard } from './features/shopping-list/components/Dashboard';
import { LoginForm } from './features/auth/components/LoginForm';
import { RegisterForm } from './features/auth/components/RegisterForm';
import { AdminDashboard } from './features/admin/components/AdminDashboard';
import { useState, useEffect } from 'react';

function App() {
  const { t, i18n } = useTranslation();

  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  const userRole = localStorage.getItem('role');
  const [appTitle, setAppTitle] = useState('Yükleniyor...');

  useEffect(() => {
    fetch('http://localhost:5050/api/settings/title')
      .then(res => res.json())
      .then(data => setAppTitle(data.title))
      .catch(() => setAppTitle('Alışveriş Uygulaması'));
  }, []);
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isContentAdmin = userRole === 'CONTENT_ADMIN';
  const isCurrencyAdmin = userRole === 'CURRENCY_ADMIN';
  const isAdminOrSuper = isSuperAdmin || isContentAdmin || isCurrencyAdmin;

  const toggleTheme = () => document.body.classList.toggle('dark-theme');
  const changeLanguage = (lng: string) => i18n.changeLanguage(lng);
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const renderLayout = (children: React.ReactNode, title?: string) => (
    <div className="app-container">
      {/* Sol Taraf: Mobil Uygulama Arayüzü */}
      <div style={{ position: 'relative' }}>
        <main>
          {children}
        </main>
      </div>
      
      {/* Sağ Taraf: Sadece Masaüstünde (1024px+) Görünecek CurrencyWidget */}
      <div style={{ display: 'none' }} className="desktop-widget">
        <CurrencyWidget />
      </div>
    </div>
  );

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Navigate to={isAuthenticated ? "/shopping-list" : "/login"} />} />

        <Route path="/login" element={renderLayout(<LoginForm />)} />
        <Route path="/register" element={renderLayout(<RegisterForm />)} />
        <Route path="/forgot-password" element={renderLayout(<ForgotPasswordForm />)} />
        <Route path="/reset-password" element={renderLayout(<ResetPasswordForm />)} />

        <Route
          path="/shopping-list"
          element={isAuthenticated ? renderLayout(<Dashboard />) : <Navigate to="/login" />}
        />
        
        <Route
          path="/list/:id"
          element={isAuthenticated ? renderLayout(<ShoppingForm />) : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
