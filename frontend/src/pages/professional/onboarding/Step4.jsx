import React, { useState } from 'react';
import { COPY } from '../../config/theme';
import './Step4.css';

export default function Step4({ data, onSave, onNext, onBack }) {
  const [images, setImages] = useState(data?.images || []);
  const [logo, setLogo] = useState(data?.logo || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 6 - images.length;

    if (files.length > remaining) {
      setError(`You can only add ${remaining} more image${remaining !== 1 ? 's' : ''}`);
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          data: event.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo({
          id: Date.now(),
          data: event.target.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const removeLogo = () => {
    setLogo(null);
  };

  const reorderImages = (fromIdx, toIdx) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIdx, 1);
    newImages.splice(toIdx, 0, removed);
    setImages(newImages);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      const formData = {
        images: images.map((img, idx) => ({
          position: idx + 1,
          data: img.data
        })),
        logo: logo ? logo.data : null
      };

      await onSave(4, formData);
      onNext();
    } catch (err) {
      setError(err.message || 'Failed to save images');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="step-container step-4">
      <h2>{COPY.onboarding.step4.title}</h2>
      <p className="step-description">{COPY.onboarding.step4.description}</p>

      {/* Photo Gallery */}
      <div className="media-section">
        <h3>{COPY.onboarding.step4.uploadPhotos}</h3>
        
        <div className="upload-area">
          <label className="upload-box">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={images.length >= 6}
              style={{ display: 'none' }}
            />
            <div className="upload-content">
              <span className="upload-icon">📸</span>
              <p>{COPY.onboarding.step4.dragDrop}</p>
              <small>{images.length}/6 images</small>
            </div>
          </label>
        </div>

        {images.length > 0 && (
          <div className="gallery-preview">
            {images.map((img, idx) => (
              <div key={img.id} className="gallery-item">
                <img src={img.data} alt={`Gallery ${idx + 1}`} />
                <div className="gallery-controls">
                  <span className="position">{idx + 1}</span>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeImage(img.id)}
                  >
                    ✕
                  </button>
                  {idx > 0 && (
                    <button
                      type="button"
                      className="move-btn"
                      onClick={() => reorderImages(idx, idx - 1)}
                      title="Move left"
                    >
                      ←
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      className="move-btn"
                      onClick={() => reorderImages(idx, idx + 1)}
                      title="Move right"
                    >
                      →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logo Upload */}
      <div className="media-section">
        <h3>{COPY.onboarding.step4.uploadLogo}</h3>
        
        <div className="upload-area">
          <label className="upload-box small">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              style={{ display: 'none' }}
            />
            <div className="upload-content">
              <span className="upload-icon">🎨</span>
              <p>Upload logo</p>
            </div>
          </label>
        </div>

        {logo && (
          <div className="logo-preview">
            <img src={logo.data} alt="Logo preview" />
            <button
              type="button"
              className="remove-btn"
              onClick={removeLogo}
            >
              Remove logo
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBack}
        >
          {COPY.buttons.back}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? 'Completing...' : COPY.buttons.complete}
        </button>
      </div>
    </div>
  );
}
