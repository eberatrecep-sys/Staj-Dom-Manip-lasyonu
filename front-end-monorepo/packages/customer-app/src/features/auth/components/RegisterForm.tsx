import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const RegisterForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(import.meta.env.VITE_API_URL + '/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
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
        <div style={styles.container}>
            <div style={styles.glassCard}>
                <h2 style={styles.title}>Kayıt Ol</h2>
                <p style={styles.subtitle}>Aramıza katılmak için bilgilerinizi girin.</p>
                <form onSubmit={handleRegister} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <input
                            type="text" value={name} onChange={e => setName(e.target.value)}
                            placeholder="Ad Soyad" required style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <input
                            type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="E-posta" required style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <input
                            type="password" value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="Şifre" required style={styles.input}
                        />
                    </div>
                    <button type="submit" style={styles.button}>Kayıt Ol</button>
                </form>
                
                <div style={styles.footer}>
                    <span style={{ color: 'var(--gray-500)' }}>Zaten hesabın var mı?</span>
                    <a href="/login" style={styles.link} onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                        Giriş Yap
                    </a>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--gray-50)',
        fontFamily: "'Inter', sans-serif"
    },
    glassCard: {
        backgroundColor: 'var(--bg-main)',
        border: '1px solid #EAECF0',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)',
        textAlign: 'center' as const,
        color: 'var(--gray-900)'
    },
    title: {
        marginTop: 0,
        marginBottom: '8px',
        fontSize: '28px',
        fontWeight: '700',
        color: 'var(--gray-900)'
    },
    subtitle: {
        fontSize: '14px',
        marginBottom: '24px',
        color: 'var(--gray-500)'
    },
    form: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column' as const
    },
    input: {
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #D0D5DD',
        background: 'var(--bg-main)',
        color: 'var(--gray-900)',
        fontSize: '16px',
        outline: 'none',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box' as const,
        '::placeholder': {
            color: 'var(--gray-500)'
        }
    },
    button: {
        padding: '12px',
        borderRadius: '8px',
        border: 'none',
        background: 'var(--primary-700)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '8px',
        transition: 'background 0.2s ease',
        boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
    },
    footer: {
        marginTop: '24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '6px',
        fontSize: '14px'
    },
    link: {
        color: 'var(--primary-700)',
        textDecoration: 'none',
        fontWeight: '600',
        transition: 'color 0.2s'
    }
};
