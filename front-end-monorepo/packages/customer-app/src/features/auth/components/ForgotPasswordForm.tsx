import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ForgotPasswordForm = () => {
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();

    const handleForgot = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(import.meta.env.VITE_API_URL + '/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (response.ok) {
                alert("Şifre sıfırlama kodu (OTP) e-posta adresinize gönderildi!");
                setStep(2);
            } else {
                alert(data.error || "İşlem başarısız");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(import.meta.env.VITE_API_URL + '/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token: otp, newPassword })
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

    return (
        <div style={styles.container}>
            <div style={styles.glassCard}>
                <h2 style={styles.title}>{step === 1 ? 'Şifremi Unuttum' : 'Yeni Şifre Belirle'}</h2>
                <p style={styles.subtitle}>
                    {step === 1 ? 'E-posta adresinizi girin, sıfırlama kodu gönderelim.' : 'Lütfen e-posta adresinize gelen 6 haneli kodu ve yeni şifrenizi girin.'}
                </p>
                
                {step === 1 ? (
                    <form onSubmit={handleForgot} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <input
                                type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="E-posta adresiniz" required style={styles.input}
                            />
                        </div>
                        <button type="submit" style={styles.button}>Sıfırlama Kodu Gönder</button>
                    </form>
                ) : (
                    <form onSubmit={handleReset} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <input
                                type="text" value={otp} onChange={e => setOtp(e.target.value)}
                                placeholder="6 Haneli Onay Kodu (OTP)" required style={styles.input}
                                maxLength={6}
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <input
                                type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                placeholder="Yeni Şifreniz" required style={styles.input}
                            />
                        </div>
                        <button type="submit" style={styles.button}>Şifreyi Güncelle</button>
                    </form>
                )}
                
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
        backgroundColor: 'var(--gray-50)',
        fontFamily: "'Inter', sans-serif"
    },
    glassCard: {
        backgroundColor: 'var(--bg-main)',
        backgroundColor: 'transparent', color: 'inherit', border: '1px solid var(--gray-200)',
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
        backgroundColor: 'transparent', color: 'inherit', border: '1px solid var(--gray-200)',
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
