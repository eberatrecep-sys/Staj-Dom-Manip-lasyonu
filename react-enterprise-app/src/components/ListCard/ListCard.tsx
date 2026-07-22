import React from 'react';

// ListCard bileşenimiz: Figma'daki liste kartını temsil eder
interface ListCardProps {
  title: string;
  count: number;
}

export const ListCard = ({ title, count }: ListCardProps) => {
  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{title}</h3>
      <div style={styles.avatars}>
        <img src="https://i.pravatar.cc/100?img=1" style={styles.avatar} alt="P1" />
        <img src="https://i.pravatar.cc/100?img=2" style={{...styles.avatar, marginLeft: '-10px'}} alt="P2" />
        <div style={styles.moreAvatar}>+2</div>
      </div>
      <div style={styles.footer}>
        <div style={styles.footerItem}>
          <span>📋</span> List {count} Items
        </div>
        <div style={styles.footerItem}>
          <span>🏷️</span> Kitchen items
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
    gap: '12px'
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
