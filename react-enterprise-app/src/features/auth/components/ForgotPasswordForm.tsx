import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleForgot = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5050/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (response.ok) {
                alert("Şifre sıfırlama linki backend terminalinde oluşturuldu!");
            } else {
                alert(data.error || "İşlem başarısız");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
            <h2>Şifremi Unuttum</h2>
            <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="E-posta adresiniz" required style={{ padding: '10px' }}
                />
                <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Sıfırlama Kodu Gönder</button>
            </form>
            <p style={{ marginTop: '1rem' }}>
                <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Giriş Ekranına Dön</a>
            </p>
        </div>
    );
};
