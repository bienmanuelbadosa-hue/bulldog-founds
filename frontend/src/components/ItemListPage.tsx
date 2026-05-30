import React, { useState, useEffect } from 'react';
import { apiService } from '../api';
import type { ItemPost, PaginatedResponse } from '../api';
import { theme } from '../theme';

interface ItemListProps {
  onSelectItem: (item: ItemPost) => void;
  onCreateNew: () => void;
}

export const ItemListPage: React.FC<ItemListProps> = ({ onSelectItem, onCreateNew }) => {
  const [items, setItems] = useState<ItemPost[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, [page, searchKeyword, filterStatus]);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      let response: PaginatedResponse<ItemPost>;

      if (searchKeyword) {
        response = await apiService.searchItems(searchKeyword, page, 10);
      } else if (filterStatus) {
        response = await apiService.filterByStatus(filterStatus, page, 10);
      } else {
        response = await apiService.getItems(page, 10);
      }

      setItems(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  };

  const searchBarStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    minWidth: '200px',
    padding: '10px',
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: theme.primary,
    color: theme.white,
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  };

  const createButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: theme.secondary,
    color: theme.primary,
  };

  const itemGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  };

  const itemCardStyle: React.CSSProperties = {
    backgroundColor: theme.white,
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.3s, box-shadow 0.3s',
  };

  const paginationStyle: React.CSSProperties = {
    display: 'flex',
    gap: '5px',
    justifyContent: 'center',
    marginTop: '20px',
  };

  const pageButtonStyle: React.CSSProperties = {
    padding: '8px 12px',
    backgroundColor: theme.white,
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const activePageStyle: React.CSSProperties = {
    ...pageButtonStyle,
    backgroundColor: theme.primary,
    color: theme.white,
    borderColor: theme.primary,
  };

  const statusBadgeStyle = (status: string): React.CSSProperties => ({
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    backgroundColor: status === 'RESOLVED' ? '#d4edda' : status === 'PENDING_CLAIM' ? '#fff3cd' : '#f8f9fa',
    color: status === 'RESOLVED' ? '#155724' : status === 'PENDING_CLAIM' ? '#856404' : '#212529',
  });

  return (
    <div style={containerStyle}>
      <div style={{ ...searchBarStyle, marginBottom: '30px' }}>
        <form style={searchBarStyle} onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={inputStyle}
          />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={inputStyle}>
            <option value="">All Statuses</option>
            <option value="UNRESOLVED">Unresolved</option>
            <option value="PENDING_CLAIM">Pending Claim</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          <button type="submit" style={buttonStyle}>
            Search
          </button>
        </form>
        <button onClick={onCreateNew} style={createButtonStyle}>
          + New Post
        </button>
      </div>

      {error && <div style={{ color: theme.error, backgroundColor: '#f8d7da', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: theme.textLight }}>Loading items...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: theme.textLight }}>No items found</div>
      ) : (
        <>
          <div style={itemGridStyle}>
            {items.map((item) => (
              <div
                key={item.id}
                style={itemCardStyle}
                onClick={() => onSelectItem(item)}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                )}
                <div style={{ padding: '15px' }}>
                  <h3 style={{ marginBottom: '8px', color: theme.primary }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: theme.textLight, marginBottom: '10px' }}>
                    {item.description.substring(0, 80)}...
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={statusBadgeStyle(item.status)}>{item.status}</span>
                    <span style={{ fontSize: '12px', color: theme.textLight }}>🎨 {item.color}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={paginationStyle}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  style={i === page ? activePageStyle : pageButtonStyle}
                  onClick={() => setPage(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
