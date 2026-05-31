import React from 'react';

/**
 * Footer component — shared across all authenticated pages.
 * Renders the copyright bar at the bottom of the layout.
 */
export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        textAlign: 'center',
        padding: '24px 10px',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border)',
        fontSize: '0.85rem',
      }}
    >
      © {new Date().getFullYear()} National University Laguna. All rights reserved.{' '}
      • Bulldog Founds Lost &amp; Found Hub
    </footer>
  );
};
