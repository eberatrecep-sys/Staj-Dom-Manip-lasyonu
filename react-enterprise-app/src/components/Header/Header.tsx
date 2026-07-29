import React, { useEffect, useState } from 'react';

// JWT Token çözücü: Kullanıcının bilgilerini token'dan almak için kullanıyoruz.
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

export const Header = () => {
  const [userInfo, setUserInfo] = useState({ name: 'Misafir', email: '' });
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('http://localhost:5050/api/share/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data);
      }
    } catch (error) {
      console.error("Bekleyen istekler alınamadı", error);
    }
  };

  const handleAction = async (id: number, action: 'accept' | 'reject') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5050/api/share/${id}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setPendingRequests(prev => prev.filter(r => r.id !== id));
        // Note: Ideal would be to trigger a refetch of lists in Dashboard.
      }
    } catch (error) {
      console.error(`İstek ${action} edilemedi`, error);
    }
  };

  // Sayfa yüklendiğinde token'ı okuyup kullanıcı bilgilerini (isim, e-posta) state'e kaydediyoruz.
  useEffect(() => {
    fetchPendingRequests();
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        setUserInfo({
          name: decoded.name || decoded.username || decoded.sub || 'Kullanıcı',
          email: decoded.email || ''
        });
      }
    }
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <img
          src={`https://ui-avatars.com/api/?name=${userInfo.name}&background=random`}
          alt="Profile"
          style={styles.avatar}
        />
        <div style={styles.userInfo}>
          <div style={styles.name}>{userInfo.name}</div>
          <div style={styles.email}>{userInfo.email}</div>
        </div>
      </div>
      <div style={styles.right}>
        <button style={styles.iconBtnPurple}>
          {/* Badge/Award İkonu (Mor) */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9E77ED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
          </svg>
        </button>
        <div style={{ position: 'relative' }}>
          <button style={styles.iconBtnGray} onClick={() => setShowDropdown(!showDropdown)}>
            {/* Bildirim (Bell) İkonu (Gri) */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {pendingRequests.length > 0 && (
              <div style={styles.badge}>{pendingRequests.length}</div>
            )}
          </button>
          
          {showDropdown && pendingRequests.length > 0 && (
            <div style={styles.dropdown}>
              <h4 style={styles.dropdownTitle}>Gelen İstekler</h4>
              {pendingRequests.map(req => (
                <div key={req.id} style={styles.requestItem}>
                  <div style={styles.requestText}>
                    <strong>{req.senderName}</strong> seni <em>{req.listName}</em> listesine davet etti.
                  </div>
                  <div style={styles.requestActions}>
                    <button style={styles.btnAccept} onClick={() => handleAction(req.id, 'accept')}>Onayla</button>
                    <button style={styles.btnReject} onClick={() => handleAction(req.id, 'reject')}>İptal</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '200px',
    objectFit: 'cover' as const
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column' as const
  },
  name: {
    fontSize: '14px',
    fontWeight: '600',
    lineHeight: '20px',
    color: '#344054',
    fontFamily: 'Inter, sans-serif'
  },
  email: {
    fontSize: '12px',
    fontWeight: '400',
    lineHeight: '18px',
    color: '#667085',
    fontFamily: 'Inter, sans-serif'
  },
  right: {
    display: 'flex',
    gap: '8px'
  },
  iconBtnPurple: {
    background: '#F9F5FF',
    border: 'none',
    borderRadius: '36px',
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer'
  },
  iconBtnGray: {
    background: '#F9FAFB',
    border: '1px solid #EAECF0',
    borderRadius: '36px',
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer'
  },
  badge: {
    position: 'absolute' as const,
    top: '-4px',
    right: '-4px',
    backgroundColor: '#D92D20',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    width: '16px',
    height: '16px',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dropdown: {
    position: 'absolute' as const,
    top: '48px',
    right: '0',
    width: '280px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: '1px solid #EAECF0',
    zIndex: 1000,
    padding: '12px'
  },
  dropdownTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: '#344054',
    borderBottom: '1px solid #EAECF0',
    paddingBottom: '8px'
  },
  requestItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    padding: '8px 0',
    borderBottom: '1px solid #F3F4F6'
  },
  requestText: {
    fontSize: '12px',
    color: '#475467'
  },
  requestActions: {
    display: 'flex',
    gap: '8px'
  },
  btnAccept: {
    flex: 1,
    padding: '6px',
    backgroundColor: '#7F56D9',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  btnReject: {
    flex: 1,
    padding: '6px',
    backgroundColor: '#F9FAFB',
    color: '#344054',
    border: '1px solid #EAECF0',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer'
  }
};
