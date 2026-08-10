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
            const response = await fetch(import.meta.env.VITE_API_URL + '/auth/reset-password', {
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
        <div style={styles.container}>
            <div style={styles.glassCard}>
                <h2 style={styles.title}>Yeni Şifre Belirle</h2>
                <p style={styles.subtitle}>Hesabınız için yeni bir şifre girin.</p>
                <form onSubmit={handleReset} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <input
                            type="password" value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="Yeni Şifreniz" required style={styles.input}
                        />
                    </div>
                    <button type="submit" style={styles.button}>Şifreyi Güncelle</button>
                </form>
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
        backgroundColor: '#F9FAFB',
        fontFamily: "'Inter', sans-serif"
    },
    glassCard: {
        backgroundColor: '#FFFFFF',
        border: '1px solid #EAECF0',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0px 4px 6px -2px rgba(16, 24, 40, 0.03), 0px 12px 16px -4px rgba(16, 24, 40, 0.08)',
        textAlign: 'center' as const,
        color: '#101828'
    },
    title: {
        marginTop: 0,
        marginBottom: '8px',
        fontSize: '28px',
        fontWeight: '700',
        color: '#101828'
    },
    subtitle: {
        fontSize: '14px',
        marginBottom: '24px',
        color: '#667085'
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
        background: '#FFFFFF',
        color: '#101828',
        fontSize: '16px',
        outline: 'none',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box' as const,
        '::placeholder': {
            color: '#667085'
        }
    },
    button: {
        padding: '12px',
        borderRadius: '8px',
        border: 'none',
        background: '#7F56D9',
        color: '#fff',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '8px',
        transition: 'background 0.2s ease',
        boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
    }
};
