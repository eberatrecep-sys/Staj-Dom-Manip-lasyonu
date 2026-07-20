import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginForm = () => {
        const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5050/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok && data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                window.location.href = import.meta.env.BASE_URL + 'shopping-list';
            } else {
                alert(data.error || "Giriş başarısız");
            }
        } catch (error) {
            console.error("Giriş hatası:", error);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
            <h2>Giriş Yap</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="E-posta" required style={{ padding: '10px' }}
                />
                <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Şifre" required style={{ padding: '10px' }}
                />
                <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Giriş Yap</button>
            </form>
            <p style={{ marginTop: '1rem', fontSize: '14px' }}>
                <a href="/forgot-password" onClick={(e) => { e.preventDefault(); navigate('/forgot-password'); }}>Şifremi Unuttum</a>
            </p>

            <p style={{ marginTop: '1rem' }}>
                Hesabın yok mu? <a href="/register" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Kayıt Ol</a>
            </p>
        </div>
    );
};
