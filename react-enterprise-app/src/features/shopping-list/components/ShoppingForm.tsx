import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Header } from '../../components/Header/Header';
import { ListCard } from '../../components/ListCard/ListCard';

interface ListItem {
    id: number;
    itemName: string;
    amount: number;
    isCompleted: boolean;
}

export const ShoppingForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [listName, setListName] = useState('');
    const [items, setItems] = useState<ListItem[]>([]);

    const schema = z.object({
        productName: z.string().min(1, { message: t('errors.product_required', 'Ürün adı boş olamaz.') as string }),
        quantity: z.number({ message: t('errors.quantity_required', 'Adet alanı boş olamaz.') as string })
            .int({ message: t('errors.quantity_integer', 'Adet tam sayı olmalıdır.') as string })
            .positive({ message: t('errors.quantity_positive', 'Adet değeri 0 veya negatif olamaz.') as string })
    });

    type FormData = z.infer<typeof schema>;

    const { register, handleSubmit, reset, setFocus, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    const fetchListDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5050/api/shopping-list/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setListName(data.title);
                setItems(data.items || []);
            }
        } catch (error) {
            console.error("Liste detayları çekilemedi", error);
        }
    };

    useEffect(() => {
        fetchListDetails();
    }, [id]);

    const onSubmit = async (data: FormData) => {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5050/api/shopping-list/${id}/items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ itemName: data.productName, amount: data.quantity })
        });

        fetchListDetails();
        reset();
        setTimeout(() => setFocus('productName'), 0);
    };

    const toggleCompletion = async (item: ListItem) => {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5050/api/shopping-list/${id}/items/${item.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...item, isCompleted: !item.isCompleted })
        });
        fetchListDetails();
    };

    const deleteList = async () => {
        if (!window.confirm("Bu listeyi silmek istediğinize emin misiniz?")) return;
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5050/api/shopping-list/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        navigate('/shopping-list');
    };

    let errorMessage = '';
    if (errors.productName?.type === 'too_small' || errors.quantity?.type === 'invalid_type') {
        errorMessage = t('errors.both_required', 'Lütfen hem ürün adını hem de adet bilgisini giriniz.');
    } else if (errors.quantity?.message) {
        errorMessage = errors.quantity.message;
    } else if (errors.productName?.message) {
        errorMessage = errors.productName.message;
    }

    return (
        <div style={{ maxWidth: '414px', margin: '0 auto', padding: '16px', position: 'relative', minHeight: '100vh' }}>
            <Header />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#667085' }}>
                    ← Geri
                </button>
                <h2 style={{ fontSize: '20px', color: '#101828', margin: 0 }}>{listName}</h2>
                <button onClick={deleteList} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'red' }}>
                    Sil
                </button>
            </div>

            <div id="errorContainer" style={{ color: 'red', marginBottom: '12px' }} aria-live="assertive">
                {errorMessage}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <input
                    type="text" 
                    placeholder={t('product_placeholder', 'Ürün...')}
                    style={{ flex: 2, padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                    {...register('productName')}
                />
                <input
                    type="number" 
                    placeholder="Adet" min="1"
                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                    {...register('quantity', { valueAsNumber: true })}
                />
                <button type="submit" style={{ background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '8px', padding: '0 16px', fontWeight: 'bold' }}>+</button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {items.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '32px', color: '#667085' }}>
                        Bu listede henüz ürün yok.
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input 
                                type="checkbox" 
                                checked={item.isCompleted} 
                                onChange={() => toggleCompletion(item)}
                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                            <div style={{ flex: 1, textDecoration: item.isCompleted ? 'line-through' : 'none', color: item.isCompleted ? '#D1D5DB' : '#101828' }}>
                                <ListCard 
                                    title={item.itemName} 
                                    count={item.amount} 
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
