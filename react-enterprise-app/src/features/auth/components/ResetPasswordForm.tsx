import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const ResetPasswordForm = () => {
    const [password, setPassword] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5050/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });
            const data = await response.json();

            if (response.ok) {
                alert("Şifreniz başarıyla değiştirildi! Giriş yapabilirsiniz.");
                navigate('/login');
            } else {
                alert(data.error || "İşlem başarısız");
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (!token) {
        return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Geçersiz veya eksik sıfırlama kodu! Lütfen URL'yi kontrol edin.</div>;
    }

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
            <h2>Yeni Şifre Belirle</h2>
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Yeni Şifreniz" required style={{ padding: '10px' }}
                />
                <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Şifreyi Güncelle</button>
            </form>
        </div>
    );
};
