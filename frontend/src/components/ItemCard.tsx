import React from 'react';
import type { ItemPost } from '../types';
import { StatusBadge } from './StatusBadge';
import { getImageUrl } from '../utils/image';

interface ItemCardProps {
  item: ItemPost;
  onClick: () => void;
  variant?: 'grid' | 'list';
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onClick, variant = 'grid' }) => {
  const isGrid = variant === 'grid';

  if (!isGrid) {
    // List layout style (e.g. used in profile or activity log)
    return (
      <div
        onClick={onClick}
        style={{
          display: 'flex',
          gap: '16px',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: 'pointer',
          backgroundColor: 'var(--bg-card)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{ width: '100px', height: '100px', backgroundColor: 'var(--border)', flexShrink: 0, overflow: 'hidden' }}>
          {item.imageUrl ? (
            <img
              src={getImageUrl(item.imageUrl)}
              alt={item.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
              📦
            </div>
          )}
        </div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>{item.title}</h3>
            <StatusBadge status={item.status} />
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Reported on {new Date(item.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    );
  }

  // Grid card layout (default)
  return (
    <div
      onClick={onClick}
      className="card card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'pointer',
        padding: '0',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        backgroundColor: 'var(--bg-card)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        e.currentTarget.style.borderColor = 'var(--primary)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* Image Section */}
      <div style={{ height: '180px', backgroundColor: 'var(--border)', overflow: 'hidden', position: 'relative' }}>
        {item.imageUrl ? (
          <img
            src={getImageUrl(item.imageUrl)}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'var(--text-muted)' }}>
            📦
          </div>
        )}
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          <StatusBadge status={item.status} />
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.title}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '40px', lineHeight: '1.5' }}>
            {item.description}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '12px' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>📍 {item.lastKnownLocation}</span>
          <span style={{ color: 'var(--text-muted)' }}>🎨 {item.color}</span>
        </div>
      </div>
    </div>
  );
};
