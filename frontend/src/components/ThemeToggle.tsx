import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="no-invert"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        background: theme === 'light' ? '#111827' : '#f3f4f6',
        color: theme === 'light' ? '#ffffff' : '#111827',
        border: 'none',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        fontSize: '24px',
        transition: 'transform 0.2s',
      }}
      aria-label="Toggle Theme"
      title="Toggle Theme"
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};
