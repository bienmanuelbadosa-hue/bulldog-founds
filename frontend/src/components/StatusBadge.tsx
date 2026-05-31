import React from 'react';

interface StatusBadgeProps {
  status: 'UNRESOLVED' | 'PENDING_CLAIM' | 'RESOLVED' | string;
  style?: React.CSSProperties;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, style }) => {
  let bg = 'rgba(148, 163, 184, 0.15)';
  let color = 'var(--text-secondary)';

  if (status === 'RESOLVED') {
    bg = 'rgba(16, 185, 129, 0.15)';
    color = 'var(--success)';
  } else if (status === 'PENDING_CLAIM') {
    bg = 'rgba(245, 158, 11, 0.15)';
    color = 'var(--warning)';
  } else if (status === 'UNRESOLVED') {
    bg = 'rgba(59, 130, 246, 0.15)';
    color = 'var(--info)';
  }

  const badgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: bg,
    color: color,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    boxShadow: 'var(--shadow-sm)',
    backdropFilter: 'blur(4px)',
    border: `1px solid ${color}33`,
    ...style,
  };

  return <span style={badgeStyle}>{status.replace('_', ' ')}</span>;
};
