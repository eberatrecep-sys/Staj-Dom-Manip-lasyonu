import { useState, useEffect } from 'react';
import { DefaultService } from '../../../api/generated';
import type { Rate } from '../../../api/generated/models/Rate';

export const useFetchRates = () => {
    const [rates, setRates] = useState<Rate[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await DefaultService.getRates(
                    undefined,
                    undefined,
                    undefined,
                    'TRY',
                    'USD,EUR'
                );
                
                setRates(response);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message || 'Kurlar alınırken bir hata oluştu.');
                } else {
                    setError('Kurlar alınırken bilinmeyen bir hata oluştu.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRates();
    }, []);

    return { rates, loading, error };
};
