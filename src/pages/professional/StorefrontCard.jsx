import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import StorefrontModal from './StorefrontModal';
import './StorefrontCard.css';

export default function StorefrontCard({ orgId, proId, onStorefrontCreated }) {
  const [storefront, setStorefront] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadStorefront();
  }, [orgId, proId]);

  const loadStorefront = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/organizations/${orgId}/professionals/${proId}/storefront`);
      setStorefront(response.data);
    } catch (err) {
      // Storefront doesn't exist yet
      setStorefront(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStorefrontCreated = (newStorefront) => {
    setStorefront(newStorefront);
    setShowModal(false);
    if (onStorefrontCreated) {
      onStorefrontCreated(newStorefront);
    }
  };

  if (loading) {
    return <div className="storefront-card loading">Loading...</div>;
  }

  return (
    <>
      <div className="storefront-card">
        {!storefront ? (
          <div className="storefront-empty">
            <h3>Create Your Storefront</h3>
            <p>Build a stunning marketplace profile to showcase your services and accept bookings.</p>
            <button className="storefront-btn create-btn" onClick={() => setShowModal(true)}>
              + Create Storefront
            </button>
          </div>
        ) : (
          <div className="storefront-exists">
            <div className="storefront-header">
              <h3>Your Storefront</h3>
              <span className={`status-badge ${storefront.is_published ? 'published' : 'draft'}`}>
                {storefront.is_published ? 'Published' : 'Draft'}
              </span>
            </div>

            <div className="storefront-info">
              <p className="slug">
                <strong>URL:</strong> calandr.com/<span className="slug-value">{storefront.slug}</span>
              </p>
              <p className="theme">
                <strong>Theme:</strong> {storefront.theme.charAt(0).toUpperCase() + storefront.theme.slice(1)}
              </p>
            </div>

            <div className="storefront-actions">
              <button className="storefront-btn edit-btn" onClick={() => setShowModal(true)}>
                ✎ Edit Storefront
              </button>
              <button className="storefront-btn view-btn" onClick={() => window.open(`/storefronts/${storefront.slug}`, '_blank')}>
                👁 View Public Storefront
              </button>
              <button className="storefront-btn copy-btn" onClick={() => {
                navigator.clipboard.writeText(`calandr.com/${storefront.slug}`);
                alert('Storefront URL copied!');
              }}>
                🔗 Copy Link
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <StorefrontModal
          orgId={orgId}
          proId={proId}
          storefront={storefront}
          onClose={() => setShowModal(false)}
          onSave={handleStorefrontCreated}
        />
      )}
    </>
  );
}
