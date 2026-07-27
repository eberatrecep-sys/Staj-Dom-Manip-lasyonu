import React, { useState } from 'react';

export const LoginForm = ({ onLogin }: { onLogin: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminRole', data.role);
                if (data.lastLoginAt) {
                    localStorage.setItem('adminLastLogin', new Date(data.lastLoginAt).toLocaleString('tr-TR'));
                }
                onLogin();
            } else {
                alert(data.error || "Giriş başarısız");
            }
        } catch (error) {
            console.error("Giriş hatası:", error);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Admin Girişi</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Admin E-posta" required style={{ padding: '10px' }}
                />
                <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Şifre" required style={{ padding: '10px' }}
                />
                <button type="submit" style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px' }}>Giriş Yap</button>
            </form>
        </div>
    );
};
