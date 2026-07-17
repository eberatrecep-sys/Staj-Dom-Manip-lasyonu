import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CurrencyWidget } from './features/currency/components/CurrencyWidget';
import { ShoppingForm } from './features/shopping-list/components/ShoppingForm';

function App() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'shopping' | 'settings'>('shopping');

  const toggleTheme = () => {
    document.body.classList.toggle('dark-theme');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
      <CurrencyWidget />

      <nav id="navbar" style={{ width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            id="shoppingTabBtn" 
            tabIndex={0}
            className={`tab-btn ${activeTab === 'shopping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shopping')}
          >
            {t('shopping_list_tab', 'Alışveriş Listesi')}
          </button>
          <button 
            id="settingsTabBtn" 
            tabIndex={0}
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            {t('settings_tab', 'Ayarlar')}
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            tabIndex={0}
            className={`tab-btn ${i18n.language === 'tr' ? 'active' : ''}`} 
            style={{ padding: '8px 12px' }} 
            onClick={() => changeLanguage('tr')}
          >TR</button>
          <button 
            tabIndex={0}
            className={`tab-btn ${i18n.language === 'en' ? 'active' : ''}`} 
            style={{ padding: '8px 12px' }} 
            onClick={() => changeLanguage('en')}
          >EN</button>
        </div>
      </nav>

      <main>
        <h1>{t('title', 'Alışveriş Uygulaması')}</h1>

        <section id="shoppingSection" className={`tab-content ${activeTab === 'shopping' ? 'active' : ''}`}>
          <h2>{t('shopping_list_title', 'Alışveriş Listesi')}</h2>
          <ShoppingForm />
        </section>

        <section id="settingsSection" className={`tab-content ${activeTab === 'settings' ? 'active' : ''}`}>
          <h2>{t('settings_title', 'Ayarlar')}</h2>
          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', alignItems: 'center' }}>
            <button id="themeToggleBtn" onClick={toggleTheme}>
              {t('theme_toggle', 'Temayı Değiştir')}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
