import React from 'react';
import avatar1 from '../../assets/avatars/avatar1.png';
import avatar2 from '../../assets/avatars/avatar2.png';


interface ListCardProps {
  title: string;
  count: number;
  completedCount?: number;
  tag?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  itemImages?: string[];
}

export const ListCard = ({ title, count, completedCount = 0, tag = 'Kitchen items', isFavorite = false, onToggleFavorite, itemImages = [] }: ListCardProps) => {
  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <h3 style={styles.title}>{title}</h3>
        <button 
          style={isFavorite ? styles.heartBtnActive : styles.heartBtn} 
          onClick={onToggleFavorite}
          title="Favorilere Ekle"
        >
          <svg width="14" height="13" viewBox="0 0 24 24" fill={isFavorite ? "var(--primary-700)" : "none"} stroke={isFavorite ? "var(--primary-700)" : "var(--gray-200)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>
      <div style={styles.avatars}>
        {itemImages && itemImages.length > 0 ? (
          <>
            {itemImages.slice(0, 5).map((url, idx) => (
              <img key={idx} src={url} style={{ ...styles.avatar, marginLeft: idx > 0 ? '-10px' : '0' }} alt={`Item ${idx}`} />
            ))}
            {itemImages.length > 5 && (
              <div style={styles.moreAvatar}>+{itemImages.length - 5}</div>
            )}
            <button style={styles.addAvatar} onClick={(e) => { e.stopPropagation(); /* TODO: Open Share */ }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </>
        ) : (
          <>
            {/* Boşken avatar gösterme, sadece paylaş butonu da kaldırılabilir ama kalsın isteniyorsa diye: */}
          </>
        )}
      </div>
      <div style={styles.footer}>
        <div style={styles.footerItem}>
          <span>📋</span> List {completedCount}/{count} Items
        </div>
        <div style={styles.footerItem}>
          <span>🏷️</span> {tag}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: 'var(--bg-main)',
    borderRadius: '16px',
    padding: '16px',
    backgroundColor: 'transparent', color: 'inherit', border: '1px solid var(--gray-200)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    position: 'relative'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  heartBtn: {
    background: 'var(--gray-50)',
    border: 'none',
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer'
  },
  heartBtnActive: {
    background: 'var(--primary-50)',
    border: 'none',
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer'
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--gray-900)'
  },
  avatars: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '4px'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '2px solid white'
  },
  moreAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--primary-50)',
    color: 'var(--primary-700)',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '-10px',
    border: '2px solid var(--bg-main)',
    fontWeight: '600'
  },
  addAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'transparent',
    color: 'var(--gray-500)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '-10px',
    border: '1px dashed var(--gray-200)',
    cursor: 'pointer',
    backgroundColor: 'var(--bg-main)',
    zIndex: 10
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid var(--gray-200)',
    paddingTop: '12px',
    fontSize: '12px',
    color: 'var(--gray-500)'
  },
  footerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  }
};
