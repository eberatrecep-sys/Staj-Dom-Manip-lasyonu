import React, { useEffect, useState } from 'react';
import { Header } from '../../../components/Header/Header';
import { DesktopLayout } from '../../../components/DesktopLayout/DesktopLayout';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

interface Offer {
  id: number;
  title: string;
  description: string;
  discountBadge?: string;
  imageUrl: string;
  targetUrl: string;
}

export const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/offers`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setCampaigns(data);
          }
        }
      } catch (err) {
        console.error('Kampanyalar yüklenemedi', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const content = (
    <div style={styles.pageContainer}>
      {!isDesktop && <Header />}
      
      <div style={styles.content}>
        <h1 style={styles.pageTitle}>Aktif Kampanyalar</h1>
        <p style={styles.pageSubtitle}>Size özel en güncel fırsatları kaçırmayın!</p>

        {loading ? (
          <div style={styles.loading}>Kampanyalar yükleniyor...</div>
        ) : campaigns.length === 0 ? (
          <div style={styles.empty}>Şu anda aktif bir kampanya bulunmuyor.</div>
        ) : (
          <div style={styles.grid}>
            {campaigns.map((campaign) => (
              <div key={campaign.id} style={styles.card} onClick={() => window.open(campaign.targetUrl, '_blank')}>
                <div style={styles.imageContainer}>
                  <img src={campaign.imageUrl} alt={campaign.title} style={styles.image} />
                  {campaign.discountBadge && (
                    <span style={styles.badge}>{campaign.discountBadge}</span>
                  )}
                </div>
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle}>{campaign.title}</h3>
                  <p style={styles.cardDesc}>{campaign.description}</p>
                  <button style={styles.cardBtn}>Fırsatı Gör</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return isDesktop ? <DesktopLayout>{content}</DesktopLayout> : content;
};

const styles = {
  pageContainer: {
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  content: {
    marginTop: '32px'
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '8px'
  },
  pageSubtitle: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '32px'
  },
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#6b7280'
  },
  empty: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#6b7280',
    background: '#f9fafb',
    borderRadius: '12px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    display: 'flex',
    flexDirection: 'column' as const
  },
  imageContainer: {
    position: 'relative' as const,
    width: '100%',
    height: '200px'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  },
  badge: {
    position: 'absolute' as const,
    top: '12px',
    left: '12px',
    backgroundColor: '#fef08a',
    color: '#854d0e',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  cardContent: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '8px',
    marginTop: 0
  },
  cardDesc: {
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.5',
    marginBottom: '20px',
    flex: 1
  },
  cardBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#7F56D9',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '14px',
    cursor: 'pointer'
  }
};
