import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './StorefrontModal.css';

const THEMES = [
  { id: 'luxury', name: 'Luxury', desc: 'Gold & dark - premium feel' },
  { id: 'minimalist', name: 'Minimalist', desc: 'Clean & simple' },
  { id: 'vibrant', name: 'Vibrant', desc: 'Bold & colorful' },
  { id: 'contemporary', name: 'Contemporary', desc: 'Modern & fresh' }
];

export default function StorefrontModal({ orgId, proId, storefront, onClose, onSave }) {
  const [formData, setFormData] = useState({
    slug: '',
    theme: 'luxury',
    is_published: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (storefront) {
      setFormData({
        slug: storefront.slug,
        theme: storefront.theme,
        is_published: storefront.is_published
      });
    }
  }, [storefront]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (storefront) {
        // Update existing
        response = await api.patch(
          `/organizations/${orgId}/professionals/${proId}/storefront`,
          {
            theme: formData.theme,
            is_published: formData.is_published
          }
        );
      } else {
        // Create new
        response = await api.post(
          `/organizations/${orgId}/professionals/${proId}/storefront`,
          {
            slug: formData.slug,
            theme: formData.theme
          }
        );
      }

      onSave(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save storefront');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="storefront-modal-overlay" onClick={onClose}>
      <div className="storefront-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{storefront ? 'Edit Storefront' : 'Create Storefront'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="storefront-form">
          {/* Slug Field (Create Only) */}
          {!storefront && (
            <div className="form-group">
              <label>Storefront URL</label>
              <div className="slug-input-wrapper">
                <span className="slug-prefix">calandr.com/</span>
                <input
                  type="text"
                  placeholder="jane-skincare-london"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  pattern="[a-z0-9-]+"
                  title="Lowercase letters, numbers, and hyphens only"
                />
              </div>
              <p className="field-help">Choose a unique, memorable URL</p>
            </div>
          )}

          {/* Theme Selector */}
          <div className="form-group">
            <label>Theme</label>
            <div className="theme-grid">
              {THEMES.map((theme) => (
                <label key={theme.id} className={`theme-option ${formData.theme === theme.id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="theme"
                    value={theme.id}
                    checked={formData.theme === theme.id}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  />
                  <span className="theme-name">{theme.name}</span>
                  <span className="theme-desc">{theme.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Publish Toggle */}
          {storefront && (
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                />
                <span>Publish storefront to marketplace</span>
              </label>
            </div>
          )}

          {/* Error Message */}
          {error && <p className="error-message">{error}</p>}

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Saving...' : (storefront ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
