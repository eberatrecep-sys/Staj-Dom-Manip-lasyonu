import { useState, useEffect } from 'react';
export const useFetchRates = () => {
    const [rates, setRates] = useState<{ quote: string, rate: number }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5050/api/currency');
                const data = await response.json();

                const formattedRates = Object.keys(data.rates).map(key => ({
                    quote: key,
                    rate: data.rates[key]
                }));

                setRates(formattedRates);
            } catch {
                setError('Kurlar kendi sunucumuzdan alınırken hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        fetchRates();
    }, []);

    return { rates, loading, error };
};
