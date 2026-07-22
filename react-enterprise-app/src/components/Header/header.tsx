import React, { useEffect, useState } from 'react';

// JWT Token çözücü: Kullanıcının bilgilerini token'dan almak için kullanıyoruz.
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const Header = () => {
  const [userInfo, setUserInfo] = useState({ name: 'Misafir', email: '' }); 

  // Sayfa yüklendiğinde token'ı okuyup kullanıcı bilgilerini (isim, e-posta) state'e kaydediyoruz.
  useEffect(() => {
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
        <button style={styles.iconBtn}>
          {/* Bookmark İkonu */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
        </button>
        <button style={styles.iconBtn}>
          {/* Bildirim (Bell) İkonu */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </button>
      </div>
    </div>
  );
};

// Figma'daki net ölçüleri ve renkleri (Pixel-Perfect) buraya işliyoruz.
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px' // Figma'ya göre Header alt boşluğu
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px' // Figma'da Avatar ve Yazı grubu arası boşluk (Gap: 10px)
  },
  avatar: {
    width: '32px', // Figma: Fixed 32px
    height: '32px', // Figma: Fixed 32px
    borderRadius: '200px', // Figma: Radius 200px
    objectFit: 'cover' as const
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column' as const
  },
  name: {
    fontSize: '14px', // Figma: Text sm/Semibold
    fontWeight: '600',
    lineHeight: '20px',
    color: '#344054', // Figma: Gray/700 (#344054)
    fontFamily: 'Inter, sans-serif'
  },
  email: {
    fontSize: '12px', // Figma: Text xs/Regular
    fontWeight: '400',
    lineHeight: '18px',
    color: '#667085', // Figma: Gray/500 (#667085)
    fontFamily: 'Inter, sans-serif'
  },
  right: {
    display: 'flex',
    gap: '8px' // İkonlar arası tahmini boşluk
  },
  iconBtn: {
    background: '#F9FAFB', // Figma: Colors Gray/50 (#F9FAFB)
    border: '1px solid #EAECF0',
    borderRadius: '36px', // Figma: Radius 36px
    width: '32px', // Figma: Fixed 32px
    height: '32px', // Figma: Fixed 32px
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer'
  }
};
