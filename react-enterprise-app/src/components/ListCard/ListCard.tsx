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
          <svg width="14" height="13" viewBox="0 0 24 24" fill={isFavorite ? "#9E77ED" : "none"} stroke={isFavorite ? "#9E77ED" : "#D0D5DD"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          </>
        ) : (
          <>
            <img src={avatar2} style={styles.avatar} alt="P1" />
            <img src={avatar1} style={{ ...styles.avatar, marginLeft: '-10px' }} alt="P2" />
            <div style={styles.moreAvatar}>+2</div>
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
    background: 'var(--card-bg)',
    borderRadius: 'var(--radius-card)',
    padding: '16px',
    border: '1px solid #E5E7EB',
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
    background: '#F9FAFB',
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
    background: '#F4EBFF',
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
    color: '#344054'
  },
  avatars: {
    display: 'flex',
    alignItems: 'center'
  },
  avatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2px solid white'
  },
  moreAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#F3E8FF',
    color: '#7F56D9',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '-10px',
    border: '2px solid white',
    fontWeight: '600'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid #F3F4F6',
    paddingTop: '12px',
    fontSize: '12px',
    color: '#667085'
  },
  footerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  }
};
