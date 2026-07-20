import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const RegisterForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5050/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                alert("Başarıyla kayıt olundu! Şimdi giriş yapabilirsiniz.");
                navigate('/login');
            } else {
                alert(data.error || "Kayıt başarısız");
            }
        } catch (error) {
            console.error("Kayıt hatası:", error);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
            <h2>Kayıt Ol</h2>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="E-posta" required style={{ padding: '10px' }}
                />
                <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Şifre" required style={{ padding: '10px' }}
                />
                <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Kayıt Ol</button>
            </form>
            <p style={{ marginTop: '1rem' }}>
                Zaten hesabın var mı? <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Giriş Yap</a>
            </p>
        </div>
    );
};
