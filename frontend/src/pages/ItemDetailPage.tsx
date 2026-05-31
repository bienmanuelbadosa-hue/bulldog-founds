import React, { useState } from 'react';
import { itemService } from '../services/itemService';
import type { ItemPost } from '../types';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { getImageUrl } from '../utils/image';

interface ItemDetailProps {
  item: ItemPost;
  onBack: () => void;
  onDelete: () => void;
}

export const ItemDetailPage: React.FC<ItemDetailProps> = ({ item, onBack, onDelete }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState(item.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isOwner = user?.email === item.createdByEmail;

  const handleStatusChange = async (newStatus: 'UNRESOLVED' | 'PENDING_CLAIM' | 'RESOLVED') => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await itemService.updateItemStatus(item.id, newStatus);
      setStatus(newStatus);
      setSuccess('Status updated successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    setLoading(true);
    setError('');
    try {
      await itemService.deleteItem(item.id);
      onDelete();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete item post');
      setLoading(false);
    }
  };



  // Generate Teams chat URL fallback using Microsoft Teams deep link API if custom teamsLink is not specified
  const teamsChatUrl = item.createdByTeamsLink || `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(item.createdByEmail)}`;

  const pageContainerStyle: React.CSSProperties = {
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%',
  };

  const detailGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
  };

  return (
    <div style={pageContainerStyle} className="animate-fade-in-up">
      <button
        onClick={onBack}
        className="btn-outline"
        style={{ marginBottom: '20px', padding: '10px 18px', borderRadius: '10px' }}
      >
        ← Back to Bulletin
      </button>

      {error && (
        <div
          className="animate-fade-in"
          style={{
            color: 'var(--error)',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            borderLeft: '4px solid var(--error)',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="animate-fade-in"
          style={{
            color: 'var(--success)',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            borderLeft: '4px solid var(--success)',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.9rem',
          }}
        >
          {success}
        </div>
      )}

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={detailGridStyle}>
          {/* Left Column: Image or Placeholder */}
          <div style={{ backgroundColor: 'var(--border)', minHeight: '300px', display: 'flex', position: 'relative' }}>
            {item.imageUrl ? (
              <img
                src={getImageUrl(item.imageUrl)}
                alt={item.title}
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '400px',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  color: 'var(--text-muted)',
                  fontSize: '4rem',
                  padding: '60px 20px',
                }}
              >
                📦
                <span style={{ fontSize: '1rem', marginTop: '12px', fontWeight: 600 }}>No Image Provided</span>
              </div>
            )}
            <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
              <StatusBadge status={status} style={{ padding: '6px 14px', fontSize: '0.85rem' }} />
            </div>
          </div>

          {/* Right Column: Description & Actions */}
          <div style={{ padding: '40px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                🎨 COLOR: {item.color} • 📅 POSTED: {new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </div>
              <h1 style={{ fontSize: '2.2rem', marginBottom: '20px' }}>{item.title}</h1>

              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</h3>
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '1rem' }}>{item.description}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', padding: '20px', backgroundColor: 'var(--bg-app)', borderRadius: '16px' }}>
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Last Known Location</h4>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>📍 {item.lastKnownLocation}</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Pickup Location</h4>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>🏢 {item.claimLocation}</p>
                </div>
              </div>

              {item.additionalDetails && (
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Additional Notes</h3>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{item.additionalDetails}</p>
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginBottom: '30px' }}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Reporter Contact</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>👤</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.createdByName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.createdByEmail}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ marginTop: '20px' }}>
              {isOwner ? (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: '0' }}>
                    <select
                      value={status}
                      onChange={(e) => handleStatusChange(e.target.value as 'UNRESOLVED' | 'PENDING_CLAIM' | 'RESOLVED')}
                      disabled={loading}
                      style={{ padding: '12px' }}
                    >
                      <option value="UNRESOLVED">Mark as Unresolved</option>
                      <option value="PENDING_CLAIM">Mark as Pending Claim</option>
                      <option value="RESOLVED">Mark as Resolved</option>
                    </select>
                  </div>
                  <button
                    onClick={handleDelete}
                    className="btn-danger"
                    style={{ flexShrink: 0, padding: '12px 20px' }}
                    disabled={loading}
                  >
                    🗑️ Delete Post
                  </button>
                </div>
              ) : (
                <a
                  href={teamsChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    width: '100%',
                    textDecoration: 'none',
                    textAlign: 'center',
                    padding: '14px',
                  }}
                >
                  💬 Contact Poster on Microsoft Teams
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
