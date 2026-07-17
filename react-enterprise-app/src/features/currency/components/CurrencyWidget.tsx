import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFetchRates } from '../hooks/useFetchRates';

export const CurrencyWidget = () => {
    const { t } = useTranslation();
    const { rates, loading, error } = useFetchRates();

    if (loading) {
        return <div className="currency-banner">{t('loading_rates', 'Kurlar yükleniyor...')}</div>;
    }

    if (error) {
        return <div className="currency-banner">{t('error_rates', 'Hata: ')} {error}</div>;
    }

    return (
        <div className="currency-banner">
            <strong>{t('currency_rates', 'Döviz Kurları')}</strong>
            <div className="rates-container">
                {rates.map((rateObj, index) => (
                    <span key={index} className="rate-item">
                        {rateObj.quote === 'USD' ? '🇺🇸 1 USD' : rateObj.quote === 'EUR' ? '🇪🇺 1 EUR' : `1 ${rateObj.quote}`} = {(1 / rateObj.rate).toFixed(2)} TL
                    </span>
                ))}
            </div>
        </div>
    );
};
