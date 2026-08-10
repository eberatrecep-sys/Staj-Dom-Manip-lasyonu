import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import imageCompression from 'browser-image-compression';

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

interface DesktopLayoutProps {
  children: React.ReactNode;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [userInfo, setUserInfo] = useState({ name: 'Kullanıcı', email: 'user@example.com' });
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(dropdownRef, () => setShowDropdown(false));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProfilePicUpload = async () => {
    if (!selectedFile) return;
    
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(selectedFile, options);
      const formData = new FormData();
      formData.append('file', compressedFile);
      
      const token = localStorage.getItem('token');
      const response = await fetch(import.meta.env.VITE_API_URL + '/auth/profile-picture', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfilePicUrl(data.url);
        localStorage.setItem('profilePicUrl', data.url);
        setShowProfileModal(false);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Profil resmi yüklenemedi", error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(import.meta.env.VITE_API_URL + '/share/pending', {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/share/${id}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setPendingRequests(prev => prev.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error(`İstek ${action} edilemedi`, error);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
    const token = localStorage.getItem('token');
    const savedPic = localStorage.getItem('profilePicUrl');
    if (savedPic) {
      setProfilePicUrl(savedPic);
    }
    
    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        setUserInfo({
          name: decoded.name || decoded.username || decoded.sub || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Kullanıcı',
          email: decoded.email || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || ''
        });
        if (decoded.profilePictureUrl && !savedPic) {
          setProfilePicUrl(decoded.profilePictureUrl);
          localStorage.setItem('profilePicUrl', decoded.profilePictureUrl);
        }
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('profilePicUrl');
    navigate('/login');
  };

  return (
    <div className={`desktop-layout-wrapper ${isDark ? 'dark-theme' : ''}`} style={styles.wrapper}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, backgroundColor: isDark ? '#1a1a1a' : 'var(--bg-main)', borderRight: isDark ? '1px solid #333' : '1px solid var(--gray-200)' }}>
        <div style={styles.profileArea}>
          <img 
            src={profilePicUrl || `https://ui-avatars.com/api/?name=${userInfo.name}&background=random`} 
            alt="User Profile" 
            style={{...styles.profileImage, cursor: 'pointer'}} 
            onClick={() => setShowProfileModal(true)}
          />
          <h3 style={{ ...styles.profileName, color: isDark ? '#fff' : 'var(--gray-900)' }}>{userInfo.name}</h3>
          <p style={{ ...styles.profileEmail, color: isDark ? '#a0a0a0' : 'var(--gray-500)' }}>{userInfo.email}</p>
          
          {/* Header Butonları (Sağ taraftan alınan ikonlar) */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', marginBottom: '8px' }}>
            <button style={styles.iconBtnPurple} onClick={() => navigate('/campaigns')} title="Kampanyalar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-700)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            </button>
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button style={styles.iconBtnGray} onClick={() => setShowDropdown(!showDropdown)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gray-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

          <div style={{ height: '1px', backgroundColor: isDark ? '#333' : 'var(--gray-200)', width: '100%', margin: '8px 0' }} />
        </div>
        
        <nav style={styles.nav}>
          <button style={{ ...styles.navItem, color: isDark ? '#ddd' : 'var(--gray-900)' }} onClick={() => navigate('/shopping-list')}>
            Listelerim
          </button>
          <button style={{ ...styles.navItem, color: isDark ? '#ddd' : 'var(--gray-900)' }} onClick={() => navigate('/shopping-list?tab=Shared')}>
            Paylaşılanlar
          </button>
          <button style={{ ...styles.navItem, color: isDark ? '#ddd' : 'var(--gray-900)' }} onClick={() => navigate('/shopping-list?tab=Drafts')}>
            Taslaklar
          </button>
        </nav>

        <div style={styles.footer}>
          <button onClick={toggleTheme} style={{ ...styles.themeToggle, backgroundColor: isDark ? '#333' : 'var(--gray-50)', color: isDark ? '#fff' : 'var(--gray-900)' }}>
            {isDark ? (
                <><svg width="18" height="18" style={{marginRight: '8px'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg> Açık Tema</>
            ) : (
                <><svg width="18" height="18" style={{marginRight: '8px'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg> Koyu Tema</>
            )}
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <svg width="18" height="18" style={{marginRight: '8px'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ ...styles.mainContent, backgroundColor: isDark ? '#121212' : 'var(--gray-50)', color: isDark ? '#fff' : 'var(--gray-900)' }}>
        {children}
      </main>

      {/* Profile Picture Modal */}
      {showProfileModal && (
        <div style={styles.modalOverlay} onClick={() => { setShowProfileModal(false); setSelectedFile(null); }}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{marginTop: 0, color: 'var(--gray-900)'}}>Profil Resmini Değiştir</h3>
            <p style={{fontSize: '14px', color: 'var(--gray-500)'}}>JPEG veya PNG dosyası seçin (Maks. 1MB).</p>
            <input 
              type="file" 
              accept="image/png, image/jpeg" 
              onChange={handleFileSelect} 
              style={{marginTop: '10px', color: 'var(--gray-900)'}}
            />
            
            <button 
              onClick={handleProfilePicUpload} 
              disabled={!selectedFile}
              style={{
                padding: '6px',
                backgroundColor: 'var(--primary-700)',
                color: 'var(--bg-main)',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                display: 'block', 
                marginTop: '20px', 
                width: '100%',
                opacity: selectedFile ? 1 : 0.5,
                cursor: selectedFile ? 'pointer' : 'not-allowed'
              }}
            >
              Yükle
            </button>
            <button 
              onClick={() => { setShowProfileModal(false); setSelectedFile(null); }} 
              style={{
                padding: '6px',
                backgroundColor: 'var(--gray-50)',
                color: 'var(--gray-900)',
                border: '1px solid var(--gray-200)',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'block', 
                marginTop: '10px', 
                width: '100%'
              }}
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    fontFamily: "'Inter', sans-serif"
  },
  sidebar: {
    width: '280px',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '24px',
    boxSizing: 'border-box' as const,
    transition: 'all 0.3s ease'
  },
  profileArea: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginBottom: '16px',
    padding: '0 16px'
  },
  profileImage: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    marginBottom: '12px'
  },
  profileName: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: '600'
  },
  profileEmail: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '400'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    flex: 1
  },
  navItem: {
    background: 'transparent',
    border: 'none',
    textAlign: 'left' as const,
    padding: '12px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'background 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  footer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    marginTop: 'auto'
  },
  themeToggle: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--gray-200)',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.3s ease'
  },
  logoutBtn: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#fef3f2',
    color: 'var(--gray-900)',
    cursor: 'pointer',
    fontWeight: '600',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  mainContent: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '32px',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column' as const
  },
  iconBtnPurple: {
    background: 'var(--primary-50)',
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
    background: 'var(--gray-50)',
    border: '1px solid var(--gray-200)',
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
    backgroundColor: 'var(--gray-900)',
    color: 'var(--bg-main)',
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
    left: '0',
    width: '240px',
    backgroundColor: 'var(--bg-main)',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    border: '1px solid var(--gray-200)',
    zIndex: 1000,
    padding: '12px',
    textAlign: 'left' as const
  },
  dropdownTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: 'var(--gray-900)',
    borderBottom: '1px solid var(--gray-200)',
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
    backgroundColor: 'var(--primary-700)',
    color: 'var(--bg-main)',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  btnReject: {
    flex: 1,
    padding: '6px',
    backgroundColor: 'var(--gray-50)',
    color: 'var(--gray-900)',
    border: '1px solid var(--gray-200)',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000
  },
  modalContent: {
    backgroundColor: 'var(--bg-main)',
    padding: '24px',
    borderRadius: '12px',
    width: '320px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    border: '1px solid var(--gray-200)'
  }
};
