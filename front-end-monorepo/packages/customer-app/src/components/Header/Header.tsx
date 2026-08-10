import React, { useEffect, useState, useRef } from 'react';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import imageCompression from 'browser-image-compression';
import { useNavigate } from 'react-router-dom';

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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleteOtp, setDeleteOtp] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const navigate = useNavigate();

  const userMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(userMenuRef, () => setShowUserMenu(false));
  useOnClickOutside(dropdownRef, () => setShowDropdown(false));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('profilePicUrl');
    navigate('/login');
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProfilePicUpload = async () => {
    if (!selectedFile) return;
    
    try {
      // Sıkıştırma ayarları (maks 800x800, 1MB)
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      
      console.log('Orjinal Dosya Boyutu:', selectedFile.size / 1024 / 1024, 'MB');
      const compressedFile = await imageCompression(selectedFile, options);
      console.log('Sıkıştırılmış Dosya Boyutu:', compressedFile.size / 1024 / 1024, 'MB');

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
        setSelectedFile(null); // Reset after upload
      }
    } catch (error) {
      console.error("Profil resmi yüklenemedi", error);
    }
  };

  const handleRequestDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(import.meta.env.VITE_API_URL + '/auth/request-delete-account', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (response.ok) {
        setDeleteStep(2);
      } else {
        const data = await response.json();
        alert(data.error || "İstek başarısız");
      }
    } catch (error) {
      console.error("Hesap silme isteği başarısız", error);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(import.meta.env.VITE_API_URL + '/auth/confirm-delete-account', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otp: deleteOtp })
      });
      
      if (response.ok) {
        alert("Hesabınız başarıyla silindi.");
        handleLogout();
      } else {
        const data = await response.json();
        alert(data.error || "Doğrulama başarısız");
      }
    } catch (error) {
      console.error("Hesap silme onayı başarısız", error);
    }
  };

  // Sayfa yüklendiğinde token'ı okuyup kullanıcı bilgilerini (isim, e-posta) state'e kaydediyoruz.
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

  return (
    <div style={styles.container}>
      <div ref={userMenuRef} style={{ ...styles.left, cursor: 'pointer', position: 'relative' }} onClick={() => setShowUserMenu(!showUserMenu)}>
        <img
          src={profilePicUrl || `https://ui-avatars.com/api/?name=${userInfo.name}&background=random`}
          alt="Profile"
          style={styles.avatar}
          onClick={(e) => { e.stopPropagation(); setShowProfileModal(true); }}
        />
        <div style={styles.userInfo}>
          <div style={styles.name}>{userInfo.name}</div>
          <div style={styles.email}>{userInfo.email}</div>
        </div>
        
        {showUserMenu && (
          <div style={styles.userDropdown}>
            <button style={styles.btnDeleteAccount} onClick={() => { setShowUserMenu(false); setShowDeleteAccountModal(true); setDeleteStep(1); setDeleteOtp(''); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Hesabı Sil
            </button>
            <button style={styles.btnLogout} onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Çıkış Yap
            </button>
          </div>
        )}
      </div>
      <div style={styles.right}>
        <button style={styles.iconBtnPurple} onClick={() => navigate('/campaigns')} title="Kampanyalar">
          {/* Badge/Award İkonu (Mor) */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9E77ED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
          </svg>
        </button>
        <div ref={dropdownRef} style={{ position: 'relative' }}>
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

      {/* Profile Picture Modal */}
      {showProfileModal && (
        <div style={styles.modalOverlay} onClick={() => { setShowProfileModal(false); setSelectedFile(null); }}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{marginTop: 0}}>Profil Resmini Değiştir</h3>
            <p style={{fontSize: '14px', color: 'var(--gray-500)'}}>JPEG veya PNG dosyası seçin (Maks. 5MB).</p>
            <input 
              type="file" 
              accept="image/png, image/jpeg" 
              onChange={handleFileSelect} 
              style={{marginTop: '10px'}}
            />
            
            <button 
              onClick={handleProfilePicUpload} 
              disabled={!selectedFile}
              style={{
                ...styles.btnAccept, 
                display: 'block', 
                marginTop: '20px', 
                width: '100%',
                opacity: selectedFile ? 1 : 0.5,
                cursor: selectedFile ? 'pointer' : 'not-allowed'
              }}
            >
              Yükle
            </button>
            <button onClick={() => { setShowProfileModal(false); setSelectedFile(null); }} style={{...styles.btnReject, display: 'block', marginTop: '10px', width: '100%'}}>
              İptal
            </button>
          </div>
        </div>
      )}
      
      {/* Account Deletion Modal */}
      {showDeleteAccountModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteAccountModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            {deleteStep === 1 ? (
              <>
                <h3 style={{marginTop: 0, color: '#D92D20'}}>Hesabı Sil</h3>
                <p style={{fontSize: '14px', color: 'var(--gray-500)'}}>
                  Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz. 
                  Devam ederseniz e-posta adresinize bir onay kodu (OTP) gönderilecektir.
                </p>
                <button 
                  onClick={handleRequestDeleteAccount} 
                  style={{...styles.btnReject, display: 'block', marginTop: '20px', width: '100%', backgroundColor: '#D92D20', color: 'var(--bg-main)', border: 'none'}}
                >
                  Onay Kodu Gönder
                </button>
                <button onClick={() => setShowDeleteAccountModal(false)} style={{...styles.btnReject, display: 'block', marginTop: '10px', width: '100%'}}>
                  İptal
                </button>
              </>
            ) : (
              <>
                <h3 style={{marginTop: 0}}>Onay Kodu (OTP)</h3>
                <p style={{fontSize: '14px', color: 'var(--gray-500)'}}>
                  E-posta adresinize gönderilen 6 haneli kodu girin.
                </p>
                <input 
                  type="text" 
                  value={deleteOtp}
                  onChange={e => setDeleteOtp(e.target.value)}
                  placeholder="6 Haneli Kod"
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginTop: '10px',
                    borderRadius: '6px',
                    border: '1px solid #D0D5DD',
                    boxSizing: 'border-box'
                  }}
                />
                <button 
                  onClick={handleConfirmDeleteAccount} 
                  disabled={deleteOtp.length !== 6}
                  style={{
                    ...styles.btnReject, 
                    display: 'block', 
                    marginTop: '20px', 
                    width: '100%', 
                    backgroundColor: '#D92D20', 
                    color: 'var(--bg-main)', 
                    border: 'none',
                    opacity: deleteOtp.length === 6 ? 1 : 0.5,
                    cursor: deleteOtp.length === 6 ? 'pointer' : 'not-allowed'
                  }}
                >
                  Kodu Onayla ve Hesabı Sil
                </button>
                <button onClick={() => setShowDeleteAccountModal(false)} style={{...styles.btnReject, display: 'block', marginTop: '10px', width: '100%'}}>
                  İptal
                </button>
              </>
            )}
          </div>
        </div>
      )}
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
    color: 'var(--gray-900)',
    fontFamily: 'Inter, sans-serif'
  },
  email: {
    fontSize: '12px',
    fontWeight: '400',
    lineHeight: '18px',
    color: 'var(--gray-500)',
    fontFamily: 'Inter, sans-serif'
  },
  right: {
    display: 'flex',
    gap: '8px'
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
    right: '0',
    width: '280px',
    backgroundColor: 'var(--bg-main)',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: '1px solid #EAECF0',
    zIndex: 1000,
    padding: '12px'
  },
  dropdownTitle: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    color: 'var(--gray-900)',
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
    border: '1px solid #EAECF0',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  userDropdown: {
    position: 'absolute' as const,
    top: '48px',
    left: '0',
    backgroundColor: 'var(--bg-main)',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: '1px solid #EAECF0',
    zIndex: 1000,
    minWidth: '150px',
    padding: '8px'
  },
  btnLogout: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: '#FEF3F2',
    color: '#D92D20',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  btnDeleteAccount: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: 'transparent',
    color: '#D92D20',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    marginBottom: '4px'
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
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  }
};
