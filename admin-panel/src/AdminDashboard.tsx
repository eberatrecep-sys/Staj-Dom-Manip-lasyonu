import { useState, useEffect } from 'react';

export const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
    const userRole = localStorage.getItem('adminRole');
    const token = localStorage.getItem('adminToken');
    const lastLogin = localStorage.getItem('adminLastLogin');

    const [dbData, setDbData] = useState<{id: number, email: string, role: string, lastLoginAt: string}[]>([]);
    const [titleInput, setTitleInput] = useState('');

    useEffect(() => {
        if (userRole === 'SUPER_ADMIN') {
            fetch('http://localhost:5050/api/admin/db-view', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => Array.isArray(data) ? setDbData(data) : null);
        }
    }, [userRole, token]);

    const handleRoleChange = async (targetUserId: number, newRole: string) => {
        const response = await fetch('http://localhost:5050/api/admin/role', {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUserId, newRole })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Rol güncellendi! Değişikliği görmek için giriş/çıkış yapılmalı.');
            window.location.reload();
        } else {
            alert(`HATA: ${data.error}`);
        }
    };

    const handleTitleChange = async () => {
        const response = await fetch('http://localhost:5050/api/settings/title', {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ newTitle: titleInput })
        });
        const data = await response.json();

        if (response.ok) {
            alert('Başlık başarıyla değiştirildi!');
        } else {
            alert(`HATA: ${data.error}`);
        }
    };

    const handleCurrencyTest = async () => {
        const response = await fetch('http://localhost:5050/api/settings/currency', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
            alert('Döviz güncellemesi başarılı!');
        } else {
            alert(`HATA: ${data.error}`);
        }
    };

    const isSuper = userRole === 'SUPER_ADMIN';
    const containerStyle = isSuper
        ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', alignItems: 'start' }
        : { display: 'flex', flexDirection: 'column' as const, gap: '20px' };

    return (
        <div style={{ width: '100%', padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{ margin: 0 }}>Admin Kontrol Paneli</h2>
                <button onClick={onLogout} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}>Çıkış Yap</button>
            </div>
            
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
                <p style={{ margin: '0 0 10px 0' }}>Mevcut Rolünüz: <strong>{userRole}</strong></p>
                {lastLogin && <p style={{ margin: 0, color: '#666' }}>Son Giriş Tarihiniz: <strong>{lastLogin}</strong></p>}
            </div>

            <div style={containerStyle}>
                <div style={{ padding: '20px', border: '2px solid #4CAF50', borderRadius: '10px' }}>
                    <h3>📝 İçerik Yönetimi (Title)</h3>
                    <p>Ana uygulamadaki ana başlığı (h1) değiştirin:</p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                        <input
                            type="text" placeholder="Yeni Başlık..."
                            value={titleInput} onChange={(e) => setTitleInput(e.target.value)}
                            style={{ padding: '8px', flex: 1, minWidth: '150px' }}
                        />
                        <button onClick={handleTitleChange} style={{ padding: '8px', cursor: 'pointer' }}>Güncelle</button>
                    </div>
                </div>

                <div style={{ padding: '20px', border: '2px solid #2196F3', borderRadius: '10px' }}>
                    <h3>💱 Döviz Paneli</h3>
                    <p>Sistemdeki kur dalgalanmalarını test edin:</p>
                    <button onClick={handleCurrencyTest} style={{ padding: '8px', cursor: 'pointer' }}>
                        Döviz Verilerini Güncelle
                    </button>
                </div>

                {
                    userRole === 'SUPER_ADMIN' && (
                        <div style={{ padding: '20px', border: '2px solid #f44336', borderRadius: '10px' }}>
                            <h3>🛡️ Yetki ve Kullanıcı Yönetimi</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {dbData.map((user) => (
                                    <div key={user.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                                        <strong>{user.email}</strong>
                                        {user.lastLoginAt && (
                                            <div style={{ fontSize: '13px', color: '#555', marginTop: '5px' }}>
                                                Son Giriş: {new Date(user.lastLoginAt).toLocaleString('tr-TR')}
                                            </div>
                                        )}
                                        <div style={{ marginTop: '10px' }}>
                                            <label>Yetki (Rol): </label>
                                            <select
                                                defaultValue={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                style={{ padding: '5px' }}
                                            >
                                                <option value="USER">USER</option>
                                                <option value="CURRENCY_ADMIN">CURRENCY_ADMIN</option>
                                                <option value="CONTENT_ADMIN">CONTENT_ADMIN</option>
                                                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
            </div>
        </div>
    );
};
