import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

interface ListItem {
    id: number;
    itemName: string;
    amount: number;
}

export const ShoppingForm = () => {
    const { t } = useTranslation();
    const [items, setItems] = useState<ListItem[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editAmount, setEditAmount] = useState<number | ''>('');

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

    const fetchItems = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5050/api/shopping-list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setItems(data);
        } catch (error) {
            console.error("Liste çekilemedi", error);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const onSubmit = async (data: FormData) => {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:5050/api/shopping-list', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ itemName: data.productName, amount: data.quantity })
        });

        fetchItems();
        reset();
        setTimeout(() => setFocus('productName'), 0);
    };

    const removeItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const startEdit = (item: ListItem) => {
        setEditingId(item.id);
        setEditName(item.itemName);
        setEditAmount(item.amount);
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const saveEdit = async (id: number) => {
        if (!editName.trim() || editAmount === '' || editAmount <= 0) return;

        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5050/api/shopping-list/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ itemName: editName, amount: Number(editAmount) })
        });

        setEditingId(null);
        fetchItems();
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
        <>
            <div id="errorContainer" className="error-message" aria-live="assertive">
                {errorMessage}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="input-container">
                    <label htmlFor="itemInput" className="sr-only">{t('product_name', 'Ürün Adı')}</label>
                    <input
                        type="text" id="itemInput" placeholder={t('product_placeholder', 'Ürün adı giriniz...')}
                        className={errors.productName ? 'error-border' : ''}
                        {...register('productName')}
                    />

                    <label htmlFor="itemQuantity" className="sr-only">{t('quantity', 'Adet')}</label>
                    <input
                        type="number" id="itemQuantity" placeholder={t('quantity_placeholder', 'Adet')} min="1"
                        className={errors.quantity ? 'error-border' : ''}
                        onKeyDown={(e) => {
                            if (['e', 'E', '+', '-', '.', ','].includes(e.key)) e.preventDefault();
                        }}
                        {...register('quantity', { valueAsNumber: true })}
                    />
                </div>
                <button type="submit" id="addButton">{t('add_button', 'Ekle')}</button>
            </form>

            <div className="list-header">
                <span className="header-name">{t('product_name', 'Ürün Adı')}</span>
                <span className="header-quantity">{t('quantity', 'Adet')}</span>
                <span className="header-action">{t('action', 'İşlem')}</span>
            </div>
            <ul id="itemList">
                {items.map((item) => (
                    <li key={item.id}>
                        {editingId === item.id ? (
                            <>
                                <span className="item-name">
                                    <input
                                        type="text"
                                        className="edit-input"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                    />
                                </span>
                                <span className="item-quantity">
                                    <input
                                        type="number"
                                        className="edit-input"
                                        style={{ width: '70px', display: 'inline-block' }}
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(Number(e.target.value))}
                                        min="1"
                                    /> adet
                                </span>
                                <span className="item-action">
                                    <button className="kaydet-butonu" onClick={() => saveEdit(item.id)}>{t('save_button', 'Kaydet')}</button>
                                    <button className="iptal-butonu" onClick={cancelEdit}>{t('cancel_button', 'İptal')}</button>
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="item-name">{item.itemName}</span>
                                <span className="item-quantity">{item.amount} {t('pieces', 'adet')}</span>
                                <span className="item-action">
                                    <button className="duzenle-butonu" onClick={() => startEdit(item)}>{t('edit_button', 'Düzenle')}</button>
                                    <button className="sil-butonu" onClick={() => removeItem(item.id)}>
                                        {t('delete_button', 'Sil')}
                                    </button>
                                </span>
                            </>
                        )}
                    </li>
                ))}
            </ul>

        </>
    );
};
