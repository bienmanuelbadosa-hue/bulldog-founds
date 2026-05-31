import React, { useState, useEffect } from 'react';
import { itemService } from '../services/itemService';
import type { ItemPost, PaginatedResponse } from '../types';

interface ItemListProps {
  onSelectItem: (item: ItemPost) => void;
  onCreateNew: () => void;
  onGoToProfile: () => void;
}

export const ItemListPage: React.FC<ItemListProps> = ({ onSelectItem, onCreateNew, onGoToProfile }) => {
  const [items, setItems] = useState<ItemPost[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, [page, filterStatus]);

  const fetchItems = async (keywordOverride?: string) => {
    setLoading(true);
    setError('');
    const kw = keywordOverride !== undefined ? keywordOverride : searchKeyword;
    try {
      let response: PaginatedResponse<ItemPost>;

      if (kw) {
        response = await itemService.searchItems(kw, page, 8);
      } else if (filterStatus) {
        response = await itemService.filterByStatus(filterStatus, page, 8);
      } else {
        response = await itemService.getItems(page, 8);
      }

      setItems(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchItems();
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
    setPage(0);
    fetchItems('');
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
      letterSpacing: '0.02em',
    };
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '10px 20px 40px 20px',
    width: '100%',
  };

  const searchContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    marginBottom: '30px',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const searchFormStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    flex: 1,
    maxWidth: '700px',
    minWidth: '280px',
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '40px',
  };

  const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    cursor: 'pointer',
    padding: '0',
    overflow: 'hidden',
  };

  return (
    <div style={containerStyle} className="animate-fade-in">
      {/* Banner / Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '6px' }}>Bulletin Board</h2>
          <p>Browse reported lost and found items at National University Laguna.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onGoToProfile} className="btn-outline" style={{ padding: '12px 20px' }}>
            👤 My Profile
          </button>
          <button onClick={onCreateNew} className="btn-secondary" style={{ padding: '12px 20px' }}>
            ➕ Report Item
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={searchContainerStyle}>
        <form style={searchFormStyle} onSubmit={handleSearchSubmit}>
          <div style={{ flex: 2, position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by title..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ paddingRight: '40px' }}
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  fontSize: '1rem',
                  padding: '0',
                  color: 'var(--text-secondary)',
                }}
              >
                ✕
              </button>
            )}
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Statuses</option>
              <option value="UNRESOLVED">Unresolved</option>
              <option value="PENDING_CLAIM">Pending Claim</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>
      </div>

      {error && (
        <div
          className="animate-fade-in"
          style={{
            color: 'var(--error)',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            borderLeft: '4px solid var(--error)',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '25px',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2.5rem', animation: 'spin 1.5s linear infinite', display: 'inline-block', marginBottom: '16px' }}>⏳</div>
          <p style={{ fontWeight: 600 }}>Loading bulletin board items...</p>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '16px' }}>🔍</span>
          <h3 style={{ marginBottom: '6px' }}>No Items Found</h3>
          <p>Try searching for a different keyword or adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div style={gridStyle}>
            {items.map((item) => (
              <div
                key={item.id}
                className="card card-hover"
                style={cardStyle}
                onClick={() => onSelectItem(item)}
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
                    <span style={statusBadgeStyle(item.status)}>{item.status}</span>
                  </div>
                </div>

                {/* Content Section */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '40px', lineHeight: '1.5' }}>
                      {item.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>📍 {item.lastKnownLocation}</span>
                    <span style={{ color: 'var(--text-muted)' }}>🎨 {item.color}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
              <button
                className="btn-outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{ padding: '8px 16px', borderRadius: '8px' }}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={i === page ? 'btn-primary' : 'btn-outline'}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    minWidth: '40px',
                    boxShadow: i === page ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="btn-outline"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                style={{ padding: '8px 16px', borderRadius: '8px' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
