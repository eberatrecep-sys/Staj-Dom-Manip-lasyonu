import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../../../components/Header/Header';
import { TabBar } from '../../../components/TabBar/TabBar';
import { ListCard } from '../../../components/ListCard/ListCard';
import { ShoppingForm } from './ShoppingForm';
import { DesktopLayout } from '../../../components/DesktopLayout/DesktopLayout';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useDebounce } from '../../../hooks/useDebounce';
import { useOnClickOutside } from '../../../hooks/useOnClickOutside';
import emptyStateImg from '../../../assets/empty-state.png';
import arrowImg from '../../../assets/arrow.png';

interface ShoppingList {
    id: number;
    title: string;
    category: string;
    tag: string | null;
    items: any[];
    userId: number;
    isFavorite?: boolean;
}

const parseJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

export const Dashboard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [lists, setLists] = useState<ShoppingList[]>([]);
    
    // Masaüstünde URL'deki tab parametresi öncelikli olacak, yoksa state
    const urlTab = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(urlTab || 'Recents');
    
    // URL değiştiğinde aktif tab'ı güncelle (Desktop Sidebar geçişleri için)
    useEffect(() => {
        if (urlTab) setActiveTab(urlTab);
        else setActiveTab('Recents');
    }, [urlTab]);

    const isDesktop = useMediaQuery('(min-width: 1024px)');

    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    
    const debouncedSearch = useDebounce(searchQuery, 300);
    const searchRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(searchRef, () => setShowSuggestions(false));

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (debouncedSearch.length < 2) {
                setSuggestions([]);
                return;
            }
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${import.meta.env.VITE_API_URL}/shopping-list/suggestions?q=${debouncedSearch}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data);
                    setShowSuggestions(true);
                }
            } catch(e) { }
        };
        fetchSuggestions();
    }, [debouncedSearch]);

    const fetchLists = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(import.meta.env.VITE_API_URL + '/shopping-list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }
            const data = await response.json();
            if (response.ok) setLists(data);
        } catch (error) {
            console.error("Listeler çekilemedi", error);
        }
    };

    useEffect(() => {
        fetchLists();
    }, []);

    const handleCreateList = async () => {
        const title = "Grocery Shopping List";
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(import.meta.env.VITE_API_URL + '/shopping-list', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, category: activeTab })
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            const newList = await response.json();

            if (response.ok && newList.id) {
                if (isDesktop) {
                    setSelectedListId(newList.id.toString());
                    fetchLists();
                } else {
                    navigate(`/list/${newList.id}`);
                }
            } else {
                fetchLists();
            }
        } catch (error) {
            console.error("Liste oluşturulamadı", error);
        }
    };

    const handleToggleFavorite = async (listId: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Kart tıklamasını (navigasyon) engelle
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/shopping-list/${listId}/favorite`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                // Sadece UI'ı güncelle
                setLists(lists.map(list => list.id === listId ? { ...list, isFavorite: !list.isFavorite } : list));
            }
        } catch (error) {
            console.error("Favori durumu değiştirilemedi", error);
        }
    };

    const myUserId = localStorage.getItem('token') ? parseJwt(localStorage.getItem('token')!)?.userId : null;
    let filteredLists = lists;
    
    if (activeTab === 'Shared') {
        filteredLists = lists.filter(list => list.userId !== Number(myUserId));
    } else if (activeTab === 'Drafts') {
        // Mock filter for drafts
        filteredLists = lists.filter(list => list.category === 'Drafts' && list.userId === Number(myUserId));
    } else {
        filteredLists = lists.filter(list => list.category !== 'Drafts' && list.userId === Number(myUserId));
    }
        
    if (searchQuery) {
        filteredLists = filteredLists.filter(list => 
            list.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            list.items.some(item => item.itemName.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }

    const uniqueTags = Array.from(new Set(filteredLists.map(l => l.tag && l.tag !== 'General' ? l.tag : null).filter(Boolean))) as string[];

    if (selectedTag) {
        filteredLists = filteredLists.filter(list => list.tag === selectedTag);
    }

    const content = (
        <div style={{ maxWidth: isDesktop ? '100%' : '414px', margin: '0 auto', padding: isDesktop ? '0' : '16px', position: 'relative', minHeight: isDesktop ? 'auto' : '100vh', width: '100%' }} className={isDesktop ? "" : "dashboard-container"}>
            {!isDesktop && <Header />}
            {isDesktop && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1 style={{ margin: 0, fontSize: '24px' }}>
                        {activeTab === 'Shared' ? 'Paylaşılan Listeler' : activeTab === 'Drafts' ? 'Taslaklar' : 'Listelerim'}
                    </h1>
                    <button
                        onClick={handleCreateList}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: '#7F56D9',
                            border: 'none',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: 'pointer',
                            color: '#FFF',
                            fontSize: '20px',
                            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)'
                        }}
                        title="Yeni Liste Oluştur"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                    </button>
                </div>
            )}
            
            <div ref={searchRef} style={{ position: 'relative', marginBottom: '16px', maxWidth: isDesktop ? '600px' : '100%' }}>
                <input 
                    type="text" 
                    placeholder="Liste veya ürün ara (Örn: gy)" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--gray-200)', boxSizing: 'border-box', backgroundColor: 'var(--bg-main)', color: 'inherit' }}
                />
                {showSuggestions && suggestions.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--bg-main)', border: '1px solid var(--gray-200)', borderRadius: '8px', zIndex: 50, marginTop: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        {suggestions.map((sug, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => { setSearchQuery(sug); setShowSuggestions(false); }}
                                style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid var(--gray-200)' }}
                            >
                                {sug}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Tag Filters */}
            {uniqueTags.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px', flexWrap: isDesktop ? 'wrap' : 'nowrap' }}>
                    <button 
                        onClick={() => setSelectedTag(null)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '16px',
                            border: '1px solid var(--gray-200)',
                            backgroundColor: selectedTag === null ? 'var(--primary-700)' : 'transparent',
                            color: selectedTag === null ? 'white' : 'inherit',
                            cursor: 'pointer',
                            fontSize: '12px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        Tümü
                    </button>
                    {uniqueTags.map(tag => (
                        <button 
                            key={tag}
                            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '16px',
                                border: '1px solid var(--gray-200)',
                                backgroundColor: selectedTag === tag ? 'var(--primary-700)' : 'transparent',
                                color: selectedTag === tag ? 'white' : 'inherit',
                                cursor: 'pointer',
                                fontSize: '12px',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            )}

            {!isDesktop && lists.length > 0 && <TabBar activeTab={activeTab} onTabChange={setActiveTab} />}

            <div className={isDesktop ? "list-cards-grid desktop-grid" : "list-cards-grid"} style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '16px', marginTop: '24px', minHeight: isDesktop ? 'auto' : 'calc(100vh - 150px)', justifyContent: filteredLists.length === 0 ? 'center' : 'flex-start' }}>
                {filteredLists.length === 0 ? (
                    <div style={{
                        width: '361px',
                        height: '334px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        margin: '0 auto',
                        gap: '16px',
                        borderRadius: '24px',
                        border: '1px dashed var(--gray-200)',
                        padding: '24px',
                        boxSizing: 'border-box',
                        backgroundColor: 'var(--bg-main)',
                        position: 'relative',
                        zIndex: 10
                    }}>

                        <img
                            src={emptyStateImg}
                            alt="Start by creating list"
                            style={{ width: '250px', objectFit: 'contain' }}
                            onError={(e) => { e.currentTarget.src = 'https://cdni.iconscout.com/illustration/premium/thumb/folder-with-cross-mark-4279226-3561332.png' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', lineHeight: '30px', color: 'var(--gray-900)', fontFamily: 'Inter, sans-serif' }}>
                                Start by creating list
                            </h3>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '400', lineHeight: '20px', color: 'var(--gray-500)', fontFamily: 'Inter, sans-serif' }}>
                                Your smart shopping list will shown here. start by creating a new list
                            </p>
                        </div>
                    </div>
                ) : (
                    filteredLists.map((list) => {
                        const totalItems = list.items?.length || 0;
                        const completedItems = list.items?.filter(item => item.isCompleted).length || 0;
                        
                        // Öğelerden tüm resimleri düz bir dizi olarak (flat) topla
                        const allItemImages = list.items?.flatMap(item => 
                            item.images?.map((img: any) => img.imageUrl) || []
                        ) || [];

                        const handleClick = () => {
                            if (isDesktop) {
                                setSelectedListId(list.id.toString());
                            } else {
                                navigate(`/list/${list.id}`);
                            }
                        };

                        return (
                            <div key={list.id} onClick={handleClick} style={{ cursor: 'pointer', border: isDesktop && selectedListId === list.id.toString() ? '2px solid var(--primary-700)' : 'none', borderRadius: '24px' }}>
                                <ListCard
                                    title={list.title}
                                    count={totalItems}
                                    completedCount={completedItems}
                                    tag={(list.tag && list.tag !== 'General') ? list.tag : 'Add tag'}
                                    isFavorite={list.isFavorite}
                                    onToggleFavorite={(e) => handleToggleFavorite(list.id, e)}
                                    itemImages={allItemImages}
                                />
                            </div>
                        );
                    })
                )}
            </div>




        </div>
    );

    const splitPaneContent = (
        <div style={{ display: 'flex', width: '100%', flex: 1, overflow: 'hidden' }}>
            {/* Sol Panel: Listeler */}
            <div style={{ width: '400px', flexShrink: 0, borderRight: '1px solid var(--gray-200)', paddingRight: '24px', overflowY: 'auto', paddingBottom: '32px' }}>
                {content}
            </div>
            {/* Sağ Panel: Form/Detaylar */}
            <div style={{ flex: '1', paddingLeft: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)', borderRadius: '24px' }}>
                {selectedListId ? (
                    <ShoppingForm 
                        listId={selectedListId} 
                        embedded={true} 
                        onListDeleted={() => { 
                            setSelectedListId(null); 
                            fetchLists(); 
                        }}
                        onListUpdated={fetchLists}
                    />
                ) : (
                    <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', color: 'var(--gray-500)', flexDirection: 'column', gap: '16px' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray-200)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                        <p style={{ fontSize: '16px', fontWeight: '500' }}>Detayları görüntülemek için sol taraftan bir liste seçin</p>
                    </div>
                )}
            </div>
        </div>
    );

    return isDesktop ? <DesktopLayout>{splitPaneContent}</DesktopLayout> : content;
};
