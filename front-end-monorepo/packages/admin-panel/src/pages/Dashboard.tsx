import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Offer {
  id: number;
  title: string;
  description: string;
  discountBadge?: string;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  displayOrder: number;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  activeOffers: number;
}

const Dashboard: React.FC = () => {
  const { logout, token } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [selectedOfferIds, setSelectedOfferIds] = useState<number[]>([]);
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'offers'>('dashboard');

  useEffect(() => {
    fetchOffers();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/v1/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("İstatistikler çekilemedi", err);
    }
  };

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5050/api/admin/offers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setOffers(data);
        } else {
          setOffers([]);
        }
      } else {
          if(response.status === 401) {
              logout();
          }
      }
    } catch (err) {
      console.error("Reklamlar çekilemedi", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingOffer(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append('isActive', 'true');
    formData.append('displayOrder', '1');
    
    try {
      let url = 'http://localhost:5050/api/admin/offers';
      let method = 'POST';

      if (editingOffer) {
        url = `http://localhost:5050/api/admin/offers/${editingOffer.id}`;
        method = 'PUT'; // API'nin Edit endpoint'i
      }

      const response = await fetch(url, {
        method: method,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (response.ok) {
        setIsModalOpen(false);
        setEditingOffer(null);
        fetchOffers();
      } else {
        alert("İşlem sırasında hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Bir hata oluştu.");
    }
  };

  const handleSelectOffer = (id: number) => {
    setSelectedOfferIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSendBulkEmail = async () => {
    if (selectedOfferIds.length === 0) return;
    
    setIsSendingMail(true);
    try {
      const response = await fetch('http://localhost:5050/api/admin/offers/send-bulk-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ offerIds: selectedOfferIds })
      });
      
      const data = await response.json();
      if (response.ok) {
        alert(data.message || "E-postalar başarıyla gönderildi.");
        setSelectedOfferIds([]); // Reset selection
      } else {
        alert(data.error || "Mail gönderimi başarısız.");
      }
    } catch (err) {
      console.error(err);
      alert("Mail gönderilirken bir hata oluştu.");
    } finally {
      setIsSendingMail(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h1>Admin Panel</h1>
        <nav>
          <a href="#" className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>📊 Dashboard</a>
          <a href="#" className={`nav-link ${activeTab === 'offers' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('offers'); }}>🛍️ Reklam (Offers)</a>
          <a href="#" className="nav-link">⚙️ Ayarlar</a>
          <button onClick={logout} className="nav-link" style={{marginTop: 'auto', color: '#ef4444', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', padding: '0.75rem 1rem'}}>
            🚪 Çıkış Yap
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* System Stats Section */}
        {activeTab === 'dashboard' && (
          stats ? (
            <div style={{
              display: 'flex', 
              gap: '20px', 
              marginBottom: '2rem',
              padding: '1rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #eee' }}>
                <h4 style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Toplam Kullanıcı</h4>
                <p style={{ margin: '5px 0 0', fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>{stats.totalUsers}</p>
              </div>
              <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid #eee' }}>
                <h4 style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Aktif Kullanıcı</h4>
                <p style={{ margin: '5px 0 0', fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{stats.activeUsers}</p>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <h4 style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Aktif Kampanya</h4>
                <p style={{ margin: '5px 0 0', fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{stats.activeOffers}</p>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              İstatistikler yükleniyor veya veri bulunamadı...
            </div>
          )
        )}

        {activeTab === 'offers' && (
          <>
            <div className="header-actions">
          <h2>Reklam Yönetimi</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-primary" 
              style={{ 
                backgroundColor: selectedOfferIds.length > 0 ? '#10b981' : '#9ca3af',
                cursor: selectedOfferIds.length > 0 ? 'pointer' : 'not-allowed'
              }} 
              onClick={handleSendBulkEmail}
              disabled={isSendingMail || selectedOfferIds.length === 0}
            >
              {isSendingMail ? 'Gönderiliyor...' : `Toplu Mail Gönder (${selectedOfferIds.length})`}
            </button>
            <button className="btn btn-primary" onClick={handleOpenCreate}>
              + Yeni Reklam Ekle
            </button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px', overflow: 'hidden', marginBottom: '2rem' }}>
            <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--primary-color)', animation: 'progress 1.5s infinite linear', transformOrigin: 'left' }} />
            <style>{`
              @keyframes progress {
                0% { transform: scaleX(0); }
                50% { transform: scaleX(0.5); }
                100% { transform: scaleX(1); }
              }
            `}</style>
          </div>
        ) : (
          <div className="offers-grid">
          {offers.map((offer) => (
            <div className="offer-card" key={offer.id} style={{ position: 'relative' }}>
              <input 
                type="checkbox" 
                checked={selectedOfferIds.includes(offer.id)}
                onChange={() => handleSelectOffer(offer.id)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  zIndex: 10
                }}
              />
              <img src={offer.imageUrl} alt={offer.title} className="offer-image" />
              <div className="offer-content">
                {offer.discountBadge && (
                  <span className="offer-badge">{offer.discountBadge}</span>
                )}
                <h3 className="offer-title">{offer.title}</h3>
                <p className="offer-desc">{offer.description}</p>
                <div className="offer-actions">
                  <button className="btn" style={{ background: '#f3f4f6' }} onClick={() => handleOpenEdit(offer)}>Düzenle</button>
                  <button className="btn btn-danger" onClick={async () => {
                    if (window.confirm("Bu reklamı silmek istediğinize emin misiniz?")) {
                      await fetch(`http://localhost:5050/api/admin/offers/${offer.id}`, { 
                          method: 'DELETE',
                          headers: {
                              'Authorization': `Bearer ${token}`
                          }
                      });
                      fetchOffers();
                    }
                  }}>Sil</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
          </>
        )}
      </main>

      {/* Add/Edit Offer Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
              {editingOffer ? 'Reklamı Düzenle' : 'Yeni Reklam Ekle'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Başlık</label>
                <input type="text" name="title" defaultValue={editingOffer?.title} className="form-input" placeholder="Örn: Kış İndirimi" required />
              </div>
              <div className="form-group">
                <label className="form-label">Açıklama</label>
                <textarea name="description" defaultValue={editingOffer?.description} className="form-textarea" rows={3} placeholder="Açıklama giriniz..." required></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Yönlendirme Linki (Target Url)</label>
                <input type="text" name="targetUrl" defaultValue={editingOffer?.targetUrl} className="form-input" placeholder="Örn: /category/kupa" required />
              </div>
              <div className="form-group">
                <label className="form-label">Resim (Dosya)</label>
                <input type="file" name="image" accept="image/*" className="form-input" required={!editingOffer} />
                {editingOffer && <small style={{color: '#6b7280'}}>Yeni resim seçmezseniz mevcut resim kullanılır.</small>}
              </div>
              <div className="form-group">
                <label className="form-label">Rozet (İsteğe bağlı)</label>
                <input type="text" name="discountBadge" defaultValue={editingOffer?.discountBadge} className="form-input" placeholder="Örn: %30 İndirim" />
              </div>
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)} style={{ background: '#f3f4f6' }}>
                  İptal
                </button>
                <button type="submit" className="btn btn-primary">{editingOffer ? 'Güncelle' : 'Kaydet'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
