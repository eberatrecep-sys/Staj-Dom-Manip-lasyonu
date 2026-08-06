import React from 'react';

// TabBar bileşenimiz: Figma'daki Recents, Draft, Shared geçişlerini sağlar
interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TabBar = ({ activeTab, onTabChange }: TabBarProps) => {
  const tabs = ['Recents', 'Draft', 'Shared'];

  return (
    <div style={styles.container}>
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          style={{
            ...styles.tab,
            ...(activeTab === tab ? styles.activeTab : {})
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    background: '#F3F4F6',
    borderRadius: '12px',
    padding: '4px',
    marginBottom: '24px'
  },
  tab: {
    flex: 1,
    padding: '8px 0',
    border: 'none',
    background: 'transparent',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7280',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  activeTab: {
    background: '#FFFFFF',
    color: '#111827',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }
};
