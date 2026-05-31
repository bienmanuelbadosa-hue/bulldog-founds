import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { itemService } from '../services/itemService';
import type { ItemPost } from '../types';

interface ProfilePageProps {
  onSelectItem: (item: ItemPost) => void;
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onSelectItem, onBack }) => {
  const { user, logout } = useAuth();
  const [items, setItems] = useState<ItemPost[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserItems();
  }, [page]);

  const fetchUserItems = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await itemService.getUserItems(page, 5);
      setItems(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch personal posts');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:8080${url}`;
  };

  const statusBadgeStyle = (status: string): React.CSSProperties => {
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
    return {
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '700',
      backgroundColor: bg,
      color: color,
      textTransform: 'uppercase',
    };
  };

  if (!user) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Please log in to view your profile.</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }} className="animate-fade-in-up">
      {/* Back button */}
      <button
        onClick={onBack}
        className="btn-outline"
        style={{ marginBottom: '20px', padding: '10px 18px', borderRadius: '10px' }}
      >
        ← Back to Bulletin
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
        {/* Profile Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 52, 120, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                color: 'var(--primary)',
                fontWeight: 700,
              }}
            >
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.8rem' }}>
                  {user.firstName} {user.lastName}
                </h2>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    textTransform: 'uppercase',
                  }}
                >
                  {user.role}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{user.email}</p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Microsoft Teams Link</h3>
            {user.teamsLink ? (
              <a
                href={user.teamsLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--success)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                🔗 Teams Link Connected (Click to test link)
              </a>
            ) : (
              <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                No Teams link configured. Users will chat with you via direct email search.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '10px' }}>
            <button onClick={logout} className="btn-danger" style={{ padding: '10px 24px' }}>
              🚪 Log Out Session
            </button>
          </div>
        </div>

        {/* User's Reported Items */}
        <div className="card">
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>My Reported Items</h2>
          <p style={{ marginBottom: '20px' }}>Manage the loss/found status or delete posts you have published.</p>

          {error && (
            <div
              className="animate-fade-in"
              style={{
                color: 'var(--error)',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderLeft: '4px solid var(--error)',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '15px',
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading my posts...
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📦</p>
              <p>You haven't reported any lost or found items yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    backgroundColor: 'var(--bg-app)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ width: '100px', height: '100px', backgroundColor: 'var(--border)', flexShrink: 0 }}>
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
                      <h3 style={{ fontSize: '1.15rem' }}>{item.title}</h3>
                      <span style={statusBadgeStyle(item.status)}>{item.status}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Reported on {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                  <button
                    className="btn-outline"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    Prev
                  </button>
                  <button
                    className="btn-outline"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
