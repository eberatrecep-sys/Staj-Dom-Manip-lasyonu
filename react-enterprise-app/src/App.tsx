import { ForgotPasswordForm } from './features/auth/components/ForgotPasswordForm';
import { ResetPasswordForm } from './features/auth/components/ResetPasswordForm';
import { useTranslation } from 'react-i18next';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CurrencyWidget } from './features/currency/components/CurrencyWidget';
import { ShoppingForm } from './features/shopping-list/components/ShoppingForm';
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
    <>
      <CurrencyWidget />
      <nav id="navbar" style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'space-between', margin: '0 auto 20px auto' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            className="tab-btn"
            onClick={() => window.location.href = import.meta.env.BASE_URL + 'shopping-list'}
          >
            {t('home', 'Anasayfa')}
          </button>

          {isAuthenticated && <button className="tab-btn" onClick={handleLogout}>Çıkış Yap</button>}

          {isAdminOrSuper && (
            <button className="tab-btn active" onClick={() => window.location.href = import.meta.env.BASE_URL + 'admin'}>
              {isSuperAdmin ? 'Super Admin' : 'Admin Paneli'}
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className={`tab-btn ${i18n.language === 'tr' ? 'active' : ''}`} onClick={() => changeLanguage('tr')}>TR</button>
          <button className={`tab-btn ${i18n.language === 'en' ? 'active' : ''}`} onClick={() => changeLanguage('en')}>EN</button>
          <button className="tab-btn" onClick={toggleTheme}>{t('theme_toggle', 'Tema')}</button>
        </div>
      </nav>

      <main style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center' }}>{title || appTitle}</h1>
        <section className="tab-content active">
          {children}
        </section>
      </main>
    </>
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
          path="/admin"
          element={isAdminOrSuper ? renderLayout(<AdminDashboard />, isSuperAdmin ? "👑 Super Admin Paneli" : "🛠️ Admin Paneli") : <Navigate to="/shopping-list" />}
        />

        <Route
          path="/shopping-list"
          element={isAuthenticated ? renderLayout(<ShoppingForm />) : <Navigate to="/login" />}
        />

        <Route
          path="/shopping-list"
          element={isAuthenticated ? renderLayout(<ShoppingForm />) : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
