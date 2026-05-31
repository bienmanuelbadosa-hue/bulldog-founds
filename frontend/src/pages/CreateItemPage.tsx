import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { itemService } from '../services/itemService';
import { zodResolver } from '../utils/zodResolver';

const itemSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(255, 'Title cannot exceed 255 characters'),
  color: z
    .string()
    .min(2, 'Color must be at least 2 characters long')
    .max(100, 'Color cannot exceed 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(2000, 'Description cannot exceed 2000 characters'),
  lastKnownLocation: z
    .string()
    .min(3, 'Last known location must be at least 3 characters long')
    .max(255, 'Last known location cannot exceed 255 characters'),
  claimLocation: z
    .string()
    .min(3, 'Claim location must be at least 3 characters long')
    .max(255, 'Claim location cannot exceed 255 characters'),
  additionalDetails: z
    .string()
    .max(2000, 'Additional details cannot exceed 2000 characters')
    .optional()
    .or(z.literal('')),
});

type ItemFields = z.infer<typeof itemSchema>;

interface CreateItemProps {
  onItemCreated: () => void;
  onCancel: () => void;
}

export const CreateItemPage: React.FC<CreateItemProps> = ({ onItemCreated, onCancel }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemFields>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: '',
      color: '',
      description: '',
      lastKnownLocation: '',
      claimLocation: '',
      additionalDetails: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setServerError('File size exceeds the 5MB limit.');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setServerError('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
        return;
      }

      setServerError('');
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ItemFields) => {
    setServerError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    try {
      await itemService.createItem(data, imageFile || undefined);
      setSuccessMessage('Item post created successfully!');
      setTimeout(() => {
        onItemCreated();
      }, 1500);
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || err.message || 'Failed to create item post. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageContainerStyle: React.CSSProperties = {
    maxWidth: '750px',
    margin: '20px auto',
    width: '100%',
  };

  const dropzoneStyle: React.CSSProperties = {
    border: '2px dashed var(--border)',
    borderRadius: '16px',
    padding: '30px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: 'var(--bg-app)',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  };

  return (
    <div style={pageContainerStyle} className="animate-fade-in-up">
      <div className="card">
        <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Report Lost/Found Item</h2>
        <p style={{ marginBottom: '24px' }}>Fill in the details below to publish a post to the bulletin feed.</p>

        {serverError && (
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
              fontWeight: 500,
            }}
          >
            {serverError}
          </div>
        )}

        {successMessage && (
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
              fontWeight: 500,
            }}
          >
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Item Title</label>
            <input
              id="title"
              type="text"
              placeholder="e.g., Black Leather Wallet"
              className={errors.title ? 'input-error' : ''}
              {...register('title')}
            />
            {errors.title && <span className="error-text">{errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="color">Dominant Color</label>
            <input
              id="color"
              type="text"
              placeholder="e.g., Black, Silver, Gold"
              className={errors.color ? 'input-error' : ''}
              {...register('color')}
            />
            {errors.color && <span className="error-text">{errors.color.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Detailed Description</label>
            <textarea
              id="description"
              placeholder="Provide a detailed description of the item to help users identify it..."
              rows={4}
              className={errors.description ? 'input-error' : ''}
              {...register('description')}
            />
            {errors.description && <span className="error-text">{errors.description.message}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="lastKnownLocation">Last Known Location</label>
              <input
                id="lastKnownLocation"
                type="text"
                placeholder="e.g., 3rd Floor IT Lab"
                className={errors.lastKnownLocation ? 'input-error' : ''}
                {...register('lastKnownLocation')}
              />
              {errors.lastKnownLocation && <span className="error-text">{errors.lastKnownLocation.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="claimLocation">Claim/Pickup Location</label>
              <input
                id="claimLocation"
                type="text"
                placeholder="e.g., Student Services Desk"
                className={errors.claimLocation ? 'input-error' : ''}
                {...register('claimLocation')}
              />
              {errors.claimLocation && <span className="error-text">{errors.claimLocation.message}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="additionalDetails">Additional Details (Optional)</label>
            <textarea
              id="additionalDetails"
              placeholder="Any other helpful guidelines or contact notes..."
              rows={2}
              className={errors.additionalDetails ? 'input-error' : ''}
              {...register('additionalDetails')}
            />
            {errors.additionalDetails && <span className="error-text">{errors.additionalDetails.message}</span>}
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label className="form-label">Item Image (Optional)</label>
            <label style={dropzoneStyle} onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')} onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <span style={{ fontSize: '32px' }}>📷</span>
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Upload Item Photo</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>JPEG, PNG, GIF, or WebP up to 5MB</span>
            </label>

            {imagePreview && (
              <div style={{ marginTop: '16px', position: 'relative', textAlign: 'center' }}>
                <img
                  src={imagePreview}
                  alt="Upload Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--border)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                  }}
                  className="btn-danger"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 2, padding: '14px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Post...' : 'Publish Post'}
            </button>
            <button
              type="button"
              className="btn-outline"
              style={{ flex: 1, padding: '14px' }}
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
