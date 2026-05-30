import React, { useState } from 'react';
import { apiService } from '../api';
import type { ItemPost } from '../api';
import { theme } from '../theme';

interface ItemDetailProps {
  item: ItemPost;
  onBack: () => void;
  onDelete: () => void;
  isOwner: boolean;
}

export const ItemDetailPage: React.FC<ItemDetailProps> = ({ item, onBack, onDelete, isOwner }) => {
  const [status, setStatus] = useState(item.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleStatusChange = async (newStatus: 'UNRESOLVED' | 'PENDING_CLAIM' | 'RESOLVED') => {
    setLoading(true);
    setError('');
    try {
      await apiService.updateItemStatus(item.id, newStatus);
      setStatus(newStatus);
      setSuccess('Status updated successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setLoading(true);
    try {
      await apiService.deleteItem(item.id);
      onDelete();
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '900px',
    margin: '20px auto',
    padding: '20px',
  };

  const backButtonStyle: React.CSSProperties = {
    backgroundColor: theme.border,
    color: theme.textDark,
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '20px',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: theme.white,
    borderRadius: '8px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    maxHeight: '500px',
    objectFit: 'cover',
  };

  const contentStyle: React.CSSProperties = {
    padding: '30px',
  };

  const titleStyle: React.CSSProperties = {
    color: theme.primary,
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '15px',
  };

  const metaStyle: React.CSSProperties = {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    marginBottom: '20px',
    paddingBottom: '20px',
    borderBottom: `1px solid ${theme.border}`,
  };

  const metaItemStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 'bold',
    color: theme.textLight,
    fontSize: '12px',
    textTransform: 'uppercase',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '16px',
    color: theme.textDark,
  };

  const descriptionStyle: React.CSSProperties = {
    marginBottom: '20px',
    lineHeight: '1.6',
    color: theme.textDark,
  };

  const statusBadgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    backgroundColor: status === 'RESOLVED' ? '#d4edda' : status === 'PENDING_CLAIM' ? '#fff3cd' : '#f8f9fa',
    color: status === 'RESOLVED' ? '#155724' : status === 'PENDING_CLAIM' ? '#856404' : '#212529',
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    marginTop: '30px',
  };

  const deleteButtonStyle: React.CSSProperties = {
    backgroundColor: theme.error,
    color: theme.white,
    padding: '12px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontWeight: 'bold',
    opacity: loading ? 0.6 : 1,
  };

  const selectStyle: React.CSSProperties = {
    padding: '10px',
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    backgroundColor: theme.white,
    cursor: loading ? 'not-allowed' : 'pointer',
  };

  return (
    <div style={containerStyle}>
      <button onClick={onBack} style={backButtonStyle}>← Back to List</button>

      {error && <div style={{ color: theme.error, backgroundColor: '#f8d7da', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}
      {success && <div style={{ color: theme.success, backgroundColor: '#d4edda', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{success}</div>}

      <div style={cardStyle}>
        {item.imageUrl && <img src={item.imageUrl} alt={item.title} style={imageStyle} />}

        <div style={contentStyle}>
          <h1 style={titleStyle}>{item.title}</h1>

          <div style={metaStyle}>
            <div style={metaItemStyle}>
              <span style={labelStyle}>Status</span>
              <span style={statusBadgeStyle}>{status}</span>
            </div>
            <div style={metaItemStyle}>
              <span style={labelStyle}>Color</span>
              <span style={valueStyle}>🎨 {item.color}</span>
            </div>
            <div style={metaItemStyle}>
              <span style={labelStyle}>Posted By</span>
              <span style={valueStyle}>{item.createdByName}</span>
            </div>
            <div style={metaItemStyle}>
              <span style={labelStyle}>Posted Date</span>
              <span style={valueStyle}>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <h3 style={{ color: theme.primary, marginBottom: '10px' }}>Description</h3>
          <p style={descriptionStyle}>{item.description}</p>

          <h3 style={{ color: theme.primary, marginBottom: '10px' }}>Locations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <p style={labelStyle}>Last Known Location</p>
              <p style={valueStyle}>{item.lastKnownLocation}</p>
            </div>
            <div>
              <p style={labelStyle}>Claim Location</p>
              <p style={valueStyle}>{item.claimLocation}</p>
            </div>
          </div>

          {item.additionalDetails && (
            <>
              <h3 style={{ color: theme.primary, marginBottom: '10px' }}>Additional Details</h3>
              <p style={descriptionStyle}>{item.additionalDetails}</p>
            </>
          )}

          {isOwner && (
            <div style={buttonGroupStyle}>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as 'UNRESOLVED' | 'PENDING_CLAIM' | 'RESOLVED')}
                style={selectStyle}
                disabled={loading}
              >
                <option value="UNRESOLVED">Mark as Unresolved</option>
                <option value="PENDING_CLAIM">Mark as Pending Claim</option>
                <option value="RESOLVED">Mark as Resolved</option>
              </select>
              <button onClick={handleDelete} style={deleteButtonStyle} disabled={loading}>
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
