import React, { useState } from 'react';
import { apiService } from '../api';
import { theme } from '../theme';

interface CreateItemProps {
  onItemCreated: () => void;
  onCancel: () => void;
}

export const CreateItemPage: React.FC<CreateItemProps> = ({ onItemCreated, onCancel }) => {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  const [lastKnownLocation, setLastKnownLocation] = useState('');
  const [claimLocation, setClaimLocation] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiService.createItem(
        {
          title,
          color,
          description,
          lastKnownLocation,
          claimLocation,
          additionalDetails,
        },
        imageFile || undefined
      );
      setSuccess('Item created successfully!');
      setTimeout(() => {
        onItemCreated();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '600px',
    margin: '20px auto',
    padding: '30px',
    backgroundColor: theme.white,
    borderRadius: '8px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
  };

  const titleStyle: React.CSSProperties = {
    color: theme.primary,
    marginBottom: '20px',
    fontSize: '24px',
    fontWeight: 'bold',
  };

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  };

  const inputStyle: React.CSSProperties = {
    padding: '12px',
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical',
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  };

  const submitButtonStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: theme.primary,
    color: theme.white,
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    opacity: loading ? 0.6 : 1,
  };

  const cancelButtonStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: theme.border,
    color: theme.textDark,
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
  };

  const imageUploadStyle: React.CSSProperties = {
    border: `2px dashed ${theme.primary}`,
    borderRadius: '4px',
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#f0f4f8',
  };

  const imagePreviewStyle: React.CSSProperties = {
    maxWidth: '100%',
    maxHeight: '300px',
    marginTop: '10px',
    borderRadius: '4px',
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Report Lost/Found Item</h2>

      {error && <div style={{ color: theme.error, backgroundColor: '#f8d7da', padding: '12px', borderRadius: '4px' }}>{error}</div>}
      {success && <div style={{ color: theme.success, backgroundColor: '#d4edda', padding: '12px', borderRadius: '4px' }}>{success}</div>}

      <form style={formStyle} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Item Title (e.g., Lost Keys)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
          maxLength={255}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          required
          minLength={2}
          maxLength={100}
          style={inputStyle}
        />

        <textarea
          placeholder="Description (10-2000 characters)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          minLength={10}
          maxLength={2000}
          style={textareaStyle}
        />

        <input
          type="text"
          placeholder="Last Known Location"
          value={lastKnownLocation}
          onChange={(e) => setLastKnownLocation(e.target.value)}
          required
          minLength={3}
          maxLength={255}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Claim Location (where to pick up)"
          value={claimLocation}
          onChange={(e) => setClaimLocation(e.target.value)}
          required
          minLength={3}
          maxLength={255}
          style={inputStyle}
        />

        <textarea
          placeholder="Additional Details (Optional)"
          value={additionalDetails}
          onChange={(e) => setAdditionalDetails(e.target.value)}
          maxLength={2000}
          style={textareaStyle}
        />

        <label style={imageUploadStyle}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
          <div>
            📷 Click to upload image (JPEG, PNG, GIF, WebP - Max 5MB)
          </div>
        </label>

        {imagePreview && (
          <img src={imagePreview} alt="Preview" style={imagePreviewStyle} />
        )}

        <div style={buttonGroupStyle}>
          <button type="submit" style={submitButtonStyle} disabled={loading}>
            {loading ? 'Creating...' : 'Create Post'}
          </button>
          <button type="button" onClick={onCancel} style={cancelButtonStyle} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
