import { useState, useEffect } from 'react';

export const AdminDashboard = () => {
    const userRole = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    const [dbData, setDbData] = useState<{id: number, email: string, role: string}[]>([]);

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
            window.location.reload();
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

        <div style={{ width: '100%', padding: '20px' }}>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Mevcut Rolünüz: <strong>{userRole}</strong></p>

            <div style={containerStyle}>
                <div style={{ padding: '20px', border: '2px solid #4CAF50', borderRadius: '10px' }}>
                    <h3>📝 İçerik Yönetimi (Title)</h3>
                    <p>Anasayfadaki ana başlığı (h1) değiştirin:</p>
                    <input
                        type="text" placeholder="Yeni Başlık..."
                        value={titleInput} onChange={(e) => setTitleInput(e.target.value)}
                        style={{ padding: '8px', marginRight: '10px' }}
                    />
                    <button onClick={handleTitleChange} style={{ padding: '8px', cursor: 'pointer' }}>Güncelle</button>
                </div>

                <div style={{ padding: '20px', border: '2px solid #2196F3', borderRadius: '10px' }}>
                    <h3>💱 Döviz Paneli</h3>
                    <p>Sistemdeki kur dalgalanmalarını test edin:</p>
                    <button onClick={handleCurrencyTest} style={{ padding: '8px', cursor: 'pointer' }}>
                        Döviz Verilerini Güncelle (403 Testi)
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
