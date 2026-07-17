import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFetchRates } from '../hooks/useFetchRates';

export const CurrencyWidget = () => {
    const { t } = useTranslation();
    const { rates, loading, error } = useFetchRates();

    const widgetStyle: React.CSSProperties = {
        position: 'absolute',
        top: '20px',
        right: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        minWidth: '150px'
    };

    if (loading) {
        return <div style={widgetStyle}>{t('loading_rates', 'Kurlar yükleniyor...')}</div>;
    }

    if (error) {
        return <div style={widgetStyle}>{t('error_rates', 'Hata: ')} {error}</div>;
    }

    return (
        <div style={widgetStyle}>
            <h4 style={{ margin: '0 0 10px 0' }}>{t('currency_rates', 'Döviz Kurları (EUR)')}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {rates.map((rateObj, index) => (
                    <span key={index}>
                        {rateObj.quote === 'USD' ? '🇺🇸' : rateObj.quote === 'TRY' ? '🇹🇷' : ''} {rateObj.quote}: {rateObj.rate}
                    </span>
                ))}
            </div>
        </div>
    );
};
