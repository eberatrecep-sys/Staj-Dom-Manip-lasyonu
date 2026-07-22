import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header/Header';
import { TabBar } from '../../components/TabBar/TabBar';
import { ListCard } from '../../components/ListCard/ListCard';

interface ShoppingList {
    id: number;
    title: string;
    category: string;
    tag: string | null;
    items: any[];
}

export const Dashboard = () => {
    const navigate = useNavigate();
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [activeTab, setActiveTab] = useState('Recents');

    const fetchLists = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5050/api/shopping-list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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
        const title = prompt("Yeni liste adını girin:", "My Shopping List");
        if (!title) return;

        const token = localStorage.getItem('token');
        await fetch('http://localhost:5050/api/shopping-list', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, category: activeTab, tag: 'General' })
        });
        fetchLists();
    };

    const filteredLists = lists.filter(list => list.category === activeTab);

    return (
        <div style={{ maxWidth: '414px', margin: '0 auto', padding: '16px', position: 'relative', minHeight: '100vh' }}>
            <Header />
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                {filteredLists.length === 0 ? (
                    // Boş Durum (Empty State)
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '32px' }}>
                        <img 
                            src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-2130356-1800917.png" 
                            alt="Empty" 
                            style={{ width: '200px', marginBottom: '24px' }} 
                        />
                        <div style={{ width: '313px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', lineHeight: '30px', color: '#101828', fontFamily: 'Inter, sans-serif' }}>
                                Start by creating list
                            </h3>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: '400', lineHeight: '20px', color: '#667085', fontFamily: 'Inter, sans-serif' }}>
                                Your smart shopping list will shown here. start by creating a new list
                            </p>
                        </div>
                    </div>
                ) : (
                    filteredLists.map((list) => {
                        const totalItems = list.items?.length || 0;
                        const completedItems = list.items?.filter(item => item.isCompleted).length || 0;
                        
                        return (
                            <div key={list.id} onClick={() => navigate(`/list/${list.id}`)} style={{ cursor: 'pointer' }}>
                                <ListCard 
                                    title={list.title} 
                                    count={totalItems}
                                    completedCount={completedItems}
                                    tag={list.tag || 'General'}
                                />
                            </div>
                        );
                    })
                )}
            </div>

            {/* Sağ Alt "+" Butonu (FAB) */}
            <button 
                onClick={handleCreateList}
                style={{
                    position: 'fixed',
                    bottom: '32px',
                    right: 'calc(50% - 207px + 16px)', 
                    width: '64px',
                    height: '64px',
                    borderRadius: '48px',
                    backgroundColor: '#F9F5FF',
                    border: 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    boxShadow: '0px 2px 4px -2px rgba(16, 24, 40, 0.06), 0px 4px 8px -2px rgba(16, 24, 40, 0.10)',
                    color: '#7F56D9',
                    fontSize: '24px'
                }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
        </div>
    );
};
