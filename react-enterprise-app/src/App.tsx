import { useTranslation } from 'react-i18next';
import { CurrencyWidget } from './features/currency/components/CurrencyWidget';
import { ShoppingForm } from './features/shopping-list/components/ShoppingForm';
import './App.css';

function App() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #666', paddingBottom: '1rem' }}>
        <h2>{t('title')}</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => changeLanguage('tr')}>{t('lang_tr')}</button>
          <button onClick={() => changeLanguage('en')}>{t('lang_en')}</button>
        </div>
      </nav>
      
      <main>
        <ShoppingForm />
      </main>

      <CurrencyWidget />

    </div>
  );
}

export default App;
