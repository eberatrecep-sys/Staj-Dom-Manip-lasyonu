import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Header } from '../../../components/Header/Header';
import { ListCard } from '../../../components/ListCard/ListCard';

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
            {/* Özelleştirilmiş Detay Sayfası Üst Barı */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} style={{ background: '#F9F5FF', border: 'none', borderRadius: '32px', width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9E77ED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                </button>
                
                {/* Avatar Group Placeholder */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src="https://i.pravatar.cc/100?img=1" alt="Avatar 1" style={{ width: '32px', height: '32px', borderRadius: '16px', border: '2px solid white', zIndex: 3 }} />
                    <img src="https://i.pravatar.cc/100?img=2" alt="Avatar 2" style={{ width: '32px', height: '32px', borderRadius: '16px', border: '2px solid white', marginLeft: '-12px', zIndex: 2 }} />
                    <div style={{ width: '32px', height: '32px', borderRadius: '16px', border: '1px dashed #EAECF0', display: 'flex', justifyContent: 'center', alignItems: 'center', marginLeft: '-12px', zIndex: 1, backgroundColor: 'white' }}>
                        <span style={{ color: '#9E77ED', fontSize: '18px' }}>+</span>
                    </div>
                </div>

                <button onClick={deleteList} style={{ background: '#F9F5FF', border: 'none', borderRadius: '32px', width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9E77ED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                </button>
            </div>

            {/* Liste Başlığı ve İstatistikler */}
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', lineHeight: '32px', color: '#344054', margin: '0 0 16px 0', fontFamily: 'Inter, sans-serif' }}>
                    {listName || 'Grocery Shopping List'}
                </h2>
                <div style={{ display: 'flex', width: '100%', height: '20px', justifyContent: 'space-between', alignItems: 'center', color: '#667085', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '20px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                        <span>List {items.filter(i => i.isCompleted).length}/{items.length} Completed</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '20px', cursor: 'pointer' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                        <span>Add tag</span>
                    </div>
                </div>
            </div>



            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center' }}>
                {items.length === 0 ? (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '361px', height: '243px', justifyContent: 'center', gap: '12px', marginTop: '32px' }}>
                            <img src="/clipboard.png" alt="Clipboard" style={{ width: '56px', height: '56px' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', width: '361px', height: '70px', justifyContent: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#101828', fontFamily: 'Inter, sans-serif' }}>
                                    Add items to your list
                                </h3>
                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '400', lineHeight: '20px', color: '#667085', fontFamily: 'Inter, sans-serif' }}>
                                    Your smart shopping list will shown here. start by creating a new list
                                </p>
                            </div>
                        </div>
                        <button style={{ 
                            width: '361px',
                            padding: '16px', 
                            background: '#7F56D9', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px', 
                            fontSize: '16px', 
                            fontWeight: '500', 
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Add new Item
                        </button>
                    </>
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
