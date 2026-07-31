import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleForgot = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5050/api/v1/auth/forgot-password', {
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
        <div style={styles.container}>
            <div style={styles.glassCard}>
                <h2 style={styles.title}>Şifremi Unuttum</h2>
                <p style={styles.subtitle}>E-posta adresinizi girin, sıfırlama linki gönderelim.</p>
                <form onSubmit={handleForgot} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <input
                            type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="E-posta adresiniz" required style={styles.input}
                        />
                    </div>
                    <button type="submit" style={styles.button}>Sıfırlama Kodu Gönder</button>
                </form>
                
                <div style={styles.footer}>
                    <a href="/login" style={styles.link} onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                        Giriş Ekranına Dön
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
        color: '#7F56D9',
        textDecoration: 'none',
        fontWeight: '600',
        transition: 'color 0.2s'
    }
};
