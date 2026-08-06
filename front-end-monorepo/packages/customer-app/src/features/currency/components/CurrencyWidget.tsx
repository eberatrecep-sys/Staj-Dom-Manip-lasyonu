import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFetchRates } from '../hooks/useFetchRates';

const getFlag = (quote: string) => {
    if (quote === 'EUR') return '🇪🇺';
    const code = quote.substring(0, 2);
    const magicNumber = 127397;
    return String.fromCodePoint(code.charCodeAt(0) + magicNumber, code.charCodeAt(1) + magicNumber);
};

export const CurrencyWidget = () => {
    const { t } = useTranslation();
    const { rates, loading, error } = useFetchRates();

    const [showMenu, setShowMenu] = useState(false);
    const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);

    useEffect(() => {
        if (rates.length > 0 && selectedCurrencies.length === 0) {
            const saved = localStorage.getItem('currency_filter');
            if (saved) {
                let parsed = JSON.parse(saved);
                if (parsed.length > 6) {
                    parsed = parsed.slice(0, 6);
                    localStorage.setItem('currency_filter', JSON.stringify(parsed));
                }
                setSelectedCurrencies(parsed);
            } else {
                const defaults = ['USD', 'EUR', 'GBP'].filter(c => rates.some(r => r.quote === c));
                setSelectedCurrencies(defaults.length > 0 ? defaults : rates.slice(0, 3).map(r => r.quote));
            }
        }
    }, [rates]);

    const toggleCurrency = (quote: string) => {
        let newSelected;
        if (selectedCurrencies.includes(quote)) {
            newSelected = selectedCurrencies.filter(c => c !== quote);
        } else {
            if (selectedCurrencies.length >= 6) {
                alert('En fazla 6 adet para birimi seçebilirsiniz!');
                return;
            }
            newSelected = [...selectedCurrencies, quote];
        }

        setSelectedCurrencies(newSelected);
        localStorage.setItem('currency_filter', JSON.stringify(newSelected));
    };

    if (loading) return <div className="currency-banner">{t('loading_rates', 'Kurlar yükleniyor...')}</div>;
    if (error) return <div className="currency-banner">{t('error_rates', 'Hata: ')} {error}</div>;

    const visibleRates = rates.filter(r => selectedCurrencies.includes(r.quote));

    return (
        <div className="currency-banner">

            <div className="currency-header">
                <strong>{t('currency_rates', 'Döviz Kurları')}</strong>
                <button className="currency-settings-btn" onClick={() => setShowMenu(!showMenu)}>⚙️</button>

                {showMenu && (
                    <div className="currency-dropdown">
                        {rates.map(rateObj => (
                            <label key={rateObj.quote} className="currency-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={selectedCurrencies.includes(rateObj.quote)}
                                    onChange={() => toggleCurrency(rateObj.quote)}
                                />
                                {getFlag(rateObj.quote)} {rateObj.quote} {t('show', 'Göster')}
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div className="rates-container">
                {visibleRates.map((rateObj, index) => (
                    <span key={index} className="rate-item">
                        {getFlag(rateObj.quote)} 1 {rateObj.quote} = {rateObj.rate} TL
                    </span>
                ))}
            </div>
        </div>
    );
};
