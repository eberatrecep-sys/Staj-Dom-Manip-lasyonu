import { ForgotPasswordForm } from './features/auth/components/ForgotPasswordForm';
import { ResetPasswordForm } from './features/auth/components/ResetPasswordForm';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ShoppingForm } from './features/shopping-list/components/ShoppingForm';
import { Dashboard } from './features/shopping-list/components/Dashboard';
import { LoginForm } from './features/auth/components/LoginForm';
import { RegisterForm } from './features/auth/components/RegisterForm';
import { AdminDashboard } from './features/admin/components/AdminDashboard';
import { ThemeProvider } from './context/ThemeContext';
import { useState, useEffect } from 'react';
import { CampaignsPage } from './features/campaigns/components/CampaignsPage';

function App() {
  const { t, i18n } = useTranslation();

  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  const userRole = localStorage.getItem('role');
  const [appTitle, setAppTitle] = useState('Yükleniyor...');

  useEffect(() => {
    fetch('http://localhost:5050/api/v1/settings/title')
      .then(res => res.json())
      .then(data => setAppTitle(data.title))
      .catch(() => setAppTitle('Alışveriş Uygulaması'));
  }, []);

  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isContentAdmin = userRole === 'CONTENT_ADMIN';
  const isCurrencyAdmin = userRole === 'CURRENCY_ADMIN';
  const isAdminOrSuper = isSuperAdmin || isContentAdmin || isCurrencyAdmin;

  const renderLayout = (children: React.ReactNode, title?: string) => (
    <div className="app-container">
      <div style={{ position: 'relative' }}>
        <main>
          {children}
        </main>
      </div>
    </div>
  );

  return (
    <ThemeProvider>
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

          <Route
            path="/campaigns"
            element={isAuthenticated ? <CampaignsPage /> : <Navigate to="/login" />}
          />

          <Route
            path="/admin"
            element={(isAuthenticated && isAdminOrSuper) ? renderLayout(<AdminDashboard />) : <Navigate to="/login" />}
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
