import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import avatar1 from '../../../assets/avatars/avatar1.png';
import avatar2 from '../../../assets/avatars/avatar2.png';
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAddItemPopupOpen, setIsAddItemPopupOpen] = useState(false);
    const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ListItem | null>(null);
    const [tagName, setTagName] = useState('');
    const [isTagEditing, setIsTagEditing] = useState(false);

    const closePopup = () => {
        setIsAddItemPopupOpen(false);
        setEditingItem(null);
        reset({ productName: '', quantity: undefined as any });
    };

    const openAddPopup = () => {
        setEditingItem(null);
        reset({ productName: '', quantity: undefined as any });
        setIsAddItemPopupOpen(true);
    };

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
                if (data.tag && data.tag !== 'General') setTagName(data.tag);
            }
        } catch (error) {
            console.error("Liste detayları çekilemedi", error);
        }
    };

    const handleTagUpdate = async (newTag: string) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5050/api/shopping-list/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tag: newTag })
            });
        } catch (error) {
            console.error("Tag güncellenemedi", error);
        }
    };

    useEffect(() => {
        fetchListDetails();
    }, [id]);

    useEffect(() => {
        const handleClick = () => {
            if (isMenuOpen) {
                setIsMenuOpen(false);
            }
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [isMenuOpen]);

    const onSubmit = async (data: FormData) => {
        const token = localStorage.getItem('token');
        if (editingItem) {
            await fetch(`http://localhost:5050/api/shopping-list/${id}/items/${editingItem.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...editingItem, itemName: data.productName, amount: data.quantity })
            });
        } else {
            await fetch(`http://localhost:5050/api/shopping-list/${id}/items`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ itemName: data.productName, amount: data.quantity })
            });
        }

        fetchListDetails();
        closePopup();
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

    const handleMenuAction = async (action: string) => {
        const token = localStorage.getItem('token');
        setIsMenuOpen(false);

        if (action === 'delete') {
            deleteList();
        } else if (action === 'share') {
            navigate(`/share/${id}`);
        } else if (action === 'copy') {
            try {
                const response = await fetch('http://localhost:5050/api/shopping-list', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ title: `${listName} (Copy)`, category: 'Recents' })
                });
                if (response.ok) navigate('/');
            } catch (error) {
                console.error("List could not be copied", error);
            }
        } else if (action === 'clear') {
            const completedItems = items.filter((item) => item.isCompleted);
            for (const item of completedItems) {
                try {
                    await fetch(`http://localhost:5050/api/shopping-list/${id}/items/${item.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } catch (error) {
                    console.error("Item could not be deleted", error);
                }
            }
            fetchListDetails();
        } else if (action === 'connect') {
            console.log("Connect to store clicked");
        }
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
            {/* Üst Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={() => navigate(-1)} style={{ background: '#F9F5FF', border: 'none', borderRadius: '32px', width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9E77ED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>

                {/* Centered Avatar Group */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        width: '92px',
                        height: '32px',
                        cursor: 'pointer'
                    }}
                    onClick={() => setIsSharePopupOpen(true)}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img
                            src={avatar2}
                            alt="avatar"
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '16px',
                                border: '1.5px solid #FFFFFF',
                                zIndex: 1,
                                boxSizing: 'border-box'
                            }}
                        />
                        <img
                            src={avatar1}
                            alt="avatar"
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '16px',
                                border: '1.5px solid #FFFFFF',
                                marginLeft: '-8px',
                                zIndex: 2,
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <button style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '16px',
                        border: '1px dashed #D0D5DD',
                        background: '#FFFFFF',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        padding: 0,
                        boxSizing: 'border-box'
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>

                {/* Right menu button */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        style={{ background: '#F9F5FF', border: 'none', borderRadius: '32px', width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9E77ED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                    </button>

                    {isMenuOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '40px',
                            right: '0',
                            width: '209px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '32px',
                            padding: '24px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            boxShadow: '0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)',
                            zIndex: 1000,
                            boxSizing: 'border-box'
                        }}>
                            {[
                                { label: 'Connect to Store', action: 'connect' },
                                { label: 'Clear Checked Items', action: 'clear' },
                                { label: 'Copy List', action: 'copy' },
                                { label: 'Delete', action: 'delete' }
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    style={{
                                        padding: '4px 8px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        lineHeight: '24px',
                                        color: '#344054',
                                        fontFamily: 'Inter, sans-serif',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMenuAction(item.action);
                                    }}
                                >
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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
                        <input
                            type="text"
                            value={tagName}
                            onChange={(e) => setTagName(e.target.value)}
                            onFocus={() => setIsTagEditing(true)}
                            onBlur={() => setTimeout(() => setIsTagEditing(false), 200)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleTagUpdate(tagName);
                                    (e.target as HTMLInputElement).blur();
                                    setIsTagEditing(false);
                                }
                            }}
                            placeholder="Add tag"
                            style={{
                                border: 'none',
                                background: 'transparent',
                                color: '#667085',
                                fontSize: '14px',
                                fontFamily: 'Inter, sans-serif',
                                outline: 'none',
                                width: `${Math.max(70, (tagName.length || 7) * 8)}px`,
                                padding: 0
                            }}
                        />
                        {isTagEditing && (
                            <button
                                onClick={() => {
                                    handleTagUpdate(tagName);
                                    setIsTagEditing(false);
                                }}
                                style={{
                                    background: '#7F56D9',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    padding: 0,
                                    flexShrink: 0
                                }}
                            >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>



            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center' }}>
                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px', width: '361px' }}>
                    {items.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', textAlign: 'center' }}>
                            <div style={{ width: '48px', height: '48px', background: '#F9F5FF', borderRadius: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7F56D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#101828' }}>No items yet</h3>
                            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#667085', maxWidth: '240px' }}>
                                Add items to your shopping list to keep track of what you need to buy.
                            </p>
                        </div>
                    ) : (
                        items.map(item => {
                            const isChecked = item.isCompleted;
                            return (
                                <div key={item.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    height: '52px',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    border: isChecked ? '1px solid #D6BBFB' : '1px solid #EAECF0',
                                    backgroundColor: isChecked ? '#F9F5FF' : '#FCFCFD',
                                    boxSizing: 'border-box'
                                }}>
                                    <div
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, cursor: 'pointer' }}
                                        onClick={() => {
                                            setEditingItem(item);
                                            reset({ productName: item.itemName, quantity: item.amount });
                                            setIsAddItemPopupOpen(true);
                                        }}
                                    >
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleCompletion(item);
                                            }}
                                            style={{
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '4px',
                                                border: isChecked ? '1px solid #7F56D9' : '1px solid #D0D5DD',
                                                backgroundColor: isChecked ? '#F9F5FF' : '#FFFFFF',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {isChecked && (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7F56D9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            )}
                                        </div>
                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            lineHeight: '20px',
                                            color: isChecked ? '#7F56D9' : '#344054',
                                            fontFamily: 'Inter, sans-serif',
                                            textDecoration: isChecked ? 'line-through' : 'none'
                                        }}>
                                            {item.itemName}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    <button
                        onClick={openAddPopup}
                        style={{
                            width: '361px',
                            height: '52px',
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
                            gap: '8px',
                            fontFamily: 'Inter, sans-serif'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Add new Item
                    </button>
                </div>
            </div>

            {/* New Item Popup Overlay */}
            {isAddItemPopupOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(16, 24, 40, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        width: '361px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '32px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        boxShadow: '0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)',
                        boxSizing: 'border-box'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '32px' }}>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', lineHeight: '32px', fontFamily: 'Inter, sans-serif', color: '#101828' }}>
                                {editingItem ? 'Edit Item' : 'Add New Item'}
                            </h2>
                            <button onClick={closePopup} style={{
                                width: '32px', height: '32px', borderRadius: '32px', background: '#F9F5FF', border: 'none',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', padding: '8px'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7F56D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '500', lineHeight: '20px', color: '#344054', fontFamily: 'Inter, sans-serif' }}>Item name</label>
                                <input
                                    type="text"
                                    placeholder="Butter"
                                    {...register('productName')}
                                    style={{ width: '100%', height: '44px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D0D5DD', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
                                />
                                {errors.productName && <span style={{ color: 'red', fontSize: '12px' }}>{errors.productName.message}</span>}
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '150.5px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: '500', lineHeight: '20px', color: '#344054', fontFamily: 'Inter, sans-serif' }}>Quantity</label>
                                    <input
                                        type="number"
                                        placeholder={editingItem ? "9999" : ""}
                                        {...register('quantity', { valueAsNumber: true })}
                                        style={{ width: '100%', height: '44px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D0D5DD', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
                                    />
                                    {errors.quantity && <span style={{ color: 'red', fontSize: '12px' }}>{errors.quantity.message}</span>}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '150.5px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: '500', lineHeight: '20px', color: '#344054', fontFamily: 'Inter, sans-serif' }}>Unit</label>
                                    <input
                                        type="text"
                                        placeholder={editingItem ? "9999" : ""}
                                        style={{ width: '100%', height: '44px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D0D5DD', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '500', lineHeight: '20px', color: '#344054', fontFamily: 'Inter, sans-serif' }}>Price</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#667085', fontFamily: 'Inter, sans-serif', fontSize: '16px' }}>₹</span>
                                    <input
                                        type="text"
                                        placeholder={editingItem ? "99999" : ""}
                                        style={{ width: '100%', height: '44px', padding: '10px 14px 10px 32px', borderRadius: '8px', border: '1px solid #D0D5DD', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', fontSize: '16px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '500', lineHeight: '20px', color: '#344054', fontFamily: 'Inter, sans-serif' }}>Description</label>
                                <textarea
                                    placeholder="Enter a description..."
                                    style={{ width: '100%', height: '81px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D0D5DD', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#667085', resize: 'none' }}
                                />
                            </div>

                            <button type="submit" style={{
                                width: '100%',
                                height: '52px',
                                padding: '16px',
                                background: '#7F56D9',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                fontFamily: 'Inter, sans-serif',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginTop: '8px'
                            }}>
                                Save
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isSharePopupOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        width: '361px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        boxShadow: '0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)',
                        boxSizing: 'border-box'
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '32px' }}>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', lineHeight: '32px', fontFamily: 'Inter, sans-serif', color: '#344054' }}>
                                Share
                            </h2>
                            <button onClick={() => setIsSharePopupOpen(false)} style={{
                                width: '32px', height: '32px', borderRadius: '32px', background: '#F9F5FF', border: 'none',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', padding: '8px'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7F56D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Email Input */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            height: '44px',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #D0D5DD',
                            boxSizing: 'border-box',
                            gap: '8px'
                        }}>
                            <input
                                type="text"
                                placeholder="Email"
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    background: 'transparent',
                                    flexGrow: 1,
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '16px',
                                    color: '#667085',
                                    padding: 0
                                }}
                            />
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                                color: '#667085', fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, sans-serif'
                            }}>
                                <span>Edit</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                        </div>

                        {/* Invite List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#667085', fontFamily: 'Inter, sans-serif' }}>Invite</h3>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <img src={avatar2} alt="Anjali Arora" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#344054', fontFamily: 'Inter, sans-serif' }}>Anjali Arora</span>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: '500', color: '#667085', fontFamily: 'Inter, sans-serif' }}>Owner</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <img src={avatar1} alt="Shiya Singh" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#344054', fontFamily: 'Inter, sans-serif' }}>Shiya Singh</span>
                                </div>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
                                    color: '#667085', fontSize: '14px', fontWeight: '500', fontFamily: 'Inter, sans-serif'
                                }}>
                                    <span>Edit</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};
