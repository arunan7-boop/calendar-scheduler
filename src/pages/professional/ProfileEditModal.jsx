
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './ProfileEditModal.css';

// Build: 2026-06-09 20:15 UTC - Redesigned Modal

const SELF_CARE_SERVICES = [
  'Massage Therapy', 'Yoga', 'Meditation', 'Facials', 'Hair Services',
  'Nail Care', 'Spa Treatments', 'Aromatherapy', 'Counseling', 'Coaching',
  'Personal Training', 'Pilates', 'Acupuncture', 'Reiki', 'Waxing',
  'Pedicure', 'Manicure', 'Sauna', 'Steam Room', 'Hot Stone Massage',
  'Thai Massage', 'Deep Tissue', 'Swedish Massage', 'Reflexology', 'Chiropody',
  'Beauty Treatments', 'Wellness Consultation'
];

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: '$',
  AUD: '$',
  INR: '₹'
};

export default function ProfileEditModal({ orgId, onClose, onSave }) {
  const [services, setServices] = useState([]);
  const [allowedServices, setAllowedServices] = useState(SELF_CARE_SERVICES);
  const [selectedServiceName, setSelectedServiceName] = useState('');
  const [expandedService, setExpandedService] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);
  const [currency, setCurrency] = useState('USD');
  
  const [variantForm, setVariantForm] = useState({
    name: '',
    price: '',
    duration: 60,
    description: '',
    photos: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadServicesAndOrg();
  }, []);

  const loadServicesAndOrg = async () => {
    try {
      const response = await api.get('/professionals/profile');
      const existingServices = response.data.services || [];
      setServices(existingServices);

      // Attempt to load organization settings for currency
      if (orgId) {
        try {
          const orgRes = await api.get(`/organizations/${orgId}`);
          if (orgRes.data && orgRes.data.currency) {
            setCurrency(orgRes.data.currency);
          }
        } catch (err) {
          console.error('Failed to load organization details:', err);
        }

        if (response.data.id) {
          try {
            const progressRes = await api.get(`/organizations/${orgId}/onboarding/${response.data.id}`);
            if (progressRes.data && progressRes.data.step_2_data) {
              const step2 = progressRes.data.step_2_data;
              const checked = step2.all || step2.selected || [];
              if (checked.length > 0) {
                setAllowedServices(checked);
              }
            }
          } catch (err) {
            console.error('Failed to load onboarding services:', err);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    }
  };

  const handleAddService = () => {
    if (!selectedServiceName) {
      setError('Please select a service');
      return;
    }

    // Check if service already exists
    if (services.some(s => s.name === selectedServiceName)) {
      setError('This service is already added');
      return;
    }

    const newService = {
      id: `${selectedServiceName.toLowerCase().replace(/\s+/g, '-')}_${Date.now()}`,
      name: selectedServiceName,
      variants: []
    };

    setServices([...services, newService]);
    setSelectedServiceName('');
    setSuccess('Service added! Now add variants with pricing.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAddVariant = async () => {
    if (!expandedService || !variantForm.name || !variantForm.price) {
      setError('Please fill in variant name and price');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const variant = {
        id: `${expandedService.id}_${variantForm.name.toLowerCase().replace(/\s+/g, '-')}_${Date.now()}`,
        name: variantForm.name,
        price: parseFloat(variantForm.price),
        duration: parseInt(variantForm.duration),
        description: variantForm.description,
        photos: variantForm.photos
      };

      const updatedServices = services.map(s => {
        if (s.id === expandedService.id) {
          return {
            ...s,
            variants: [...(s.variants || []), variant]
          };
        }
        return s;
      });

      setServices(updatedServices);
      
      // Save to backend
      await api.patch('/professionals/profile', {
        services: updatedServices
      });

      resetVariantForm();
      setExpandedService(updatedServices.find(s => s.id === expandedService.id));
      setSuccess('Variant added!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add variant');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVariant = async (serviceId, variantId) => {
    if (!window.confirm('Remove this variant?')) return;

    setLoading(true);
    try {
      const updatedServices = services.map(s => {
        if (s.id === serviceId) {
          return {
            ...s,
            variants: s.variants.filter(v => v.id !== variantId)
          };
        }
        return s;
      });

      setServices(updatedServices);
      await api.patch('/professionals/profile', { services: updatedServices });
      
      setExpandedService(updatedServices.find(s => s.id === serviceId));
      setSuccess('Variant removed!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove variant');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveService = async (serviceId) => {
    if (!window.confirm('Remove this service and all its variants?')) return;

    setLoading(true);
    try {
      const updatedServices = services.filter(s => s.id !== serviceId);
      setServices(updatedServices);
      await api.patch('/professionals/profile', { services: updatedServices });
      
      setExpandedService(null);
      setSuccess('Service removed!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove service');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (services.length === 0) {
      setError('Please add at least one service variant');
      return;
    }

    setLoading(true);
    try {
      await api.patch('/professionals/profile', { services });
      setSuccess('Profile saved successfully!');
      setTimeout(() => {
        onSave();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 3 - variantForm.photos.length;

    if (files.length > remaining) {
      setError(`You can add max ${remaining} more photo(s) per variant`);
      return;
    }

    setError('');
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setVariantForm(prev => ({
          ...prev,
          photos: [...prev.photos, event.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index) => {
    setVariantForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const resetVariantForm = () => {
    setVariantForm({
      name: '',
      price: '',
      duration: 60,
      description: '',
      photos: []
    });
    setEditingVariant(null);
  };

  const usedServices = services.map(s => s.name);
  const availableServices = allowedServices.filter(s => !usedServices.includes(s));
  const currentSymbol = CURRENCY_SYMBOLS[currency] || '$';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Professional Profile</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Services List */}
          <div className="services-section">
            <h4>Services & Pricing</h4>
            
            {services.length === 0 ? (
              <p className="section-hint">No services added yet.</p>
            ) : (
              <div className="services-list">
                {services.map(service => (
                  <div key={service.id} className="service-card">
                    <div className="service-header">
                      <h5>{service.name}</h5>
                      <div className="service-actions">
                        <button
                          className="btn-expand"
                          onClick={() => setExpandedService(expandedService?.id === service.id ? null : service)}
                        >
                          {expandedService?.id === service.id ? '▼' : '▶'} 
                          {(service.variants || []).length} variant{(service.variants || []).length !== 1 ? 's' : ''}
                        </button>
                        <button
                          className="btn-remove-service"
                          onClick={() => handleRemoveService(service.id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {expandedService?.id === service.id && (
                      <div className="service-variants">
                        {(service.variants || []).length === 0 ? (
                          <p className="section-hint">No variants yet. Add one below.</p>
                        ) : (
                          <div className="variants-list">
                            {service.variants.map(variant => (
                              <div key={variant.id} className="variant-item">
                                <div className="variant-main">
                                  <div className="variant-name">{variant.name}</div>
                                  <div className="variant-meta">
                                    <span className="price">{currentSymbol}{variant.price?.toFixed(2)}</span>
                                    <span className="duration">{variant.duration} min</span>
                                  </div>
                                  {variant.description && (
                                    <div className="variant-description">{variant.description}</div>
                                  )}
                                  {variant.photos && variant.photos.length > 0 && (
                                    <div className="variant-photos">
                                      {variant.photos.map((photo, idx) => (
                                        <img key={idx} src={photo} alt={`${variant.name} ${idx + 1}`} />
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="variant-actions">
                                  <button
                                    className="btn-remove-variant"
                                    onClick={() => handleRemoveVariant(service.id, variant.id)}
                                    disabled={loading}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Variant Form */}
                        <div className="add-variant-box">
                          <h6>Add Variant to {service.name}</h6>
                          
                          <div className="variant-form-layout">
                            {/* Left Column: Form Inputs */}
                            <div className="variant-form-fields">
                              <div className="form-group">
                                <label>Variant Name *</label>
                                <input
                                  type="text"
                                  placeholder="e.g., Swedish Massage, Deep Tissue"
                                  value={variantForm.name}
                                  onChange={(e) => setVariantForm({...variantForm, name: e.target.value})}
                                  disabled={loading}
                                />
                              </div>

                              <div className="form-row">
                                <div className="form-group">
                                  <label>Price ({currentSymbol}) *</label>
                                  <input
                                    type="number"
                                    placeholder="0.00"
                                    value={variantForm.price}
                                    onChange={(e) => setVariantForm({...variantForm, price: e.target.value})}
                                    min="0"
                                    step="0.01"
                                    disabled={loading}
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Duration (min)</label>
                                  <input
                                    type="number"
                                    value={variantForm.duration}
                                    onChange={(e) => setVariantForm({...variantForm, duration: parseInt(e.target.value)})}
                                    min="15"
                                    max="480"
                                    step="15"
                                    disabled={loading}
                                  />
                                </div>
                              </div>

                              <div className="form-group">
                                <label>Description</label>
                                <textarea
                                  placeholder="Describe this variant..."
                                  value={variantForm.description}
                                  onChange={(e) => setVariantForm({...variantForm, description: e.target.value})}
                                  rows="2"
                                  disabled={loading}
                                />
                              </div>

                              <div className="form-group">
                                <label>Photos (up to 3)</label>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={handlePhotoUpload}
                                  disabled={loading || variantForm.photos.length >= 3}
                                />
                                {variantForm.photos.length > 0 && (
                                  <div className="photo-preview">
                                    {variantForm.photos.map((photo, idx) => (
                                      <div key={idx} className="photo-item">
                                        <img src={photo} alt={`Preview ${idx + 1}`} />
                                        <button
                                          type="button"
                                          onClick={() => handleRemovePhoto(idx)}
                                          className="photo-remove"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right Column: Actions side panel (centered vertically) */}
                            <div className="variant-form-actions">
                              <button
                                type="button"
                                className="btn btn-primary btn-add-variant"
                                onClick={handleAddVariant}
                                disabled={loading || !variantForm.name || !variantForm.price}
                              >
                                {loading ? 'Adding...' : 'Add Variant'}
                              </button>
                              
                              <button
                                type="button"
                                className="btn btn-secondary btn-delete-variant-form"
                                onClick={resetVariantForm}
                                disabled={loading}
                              >
                                Delete Variant
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Service */}
          {availableServices.length > 0 && (
            <div className="add-service-section">
              <h4>Add Service</h4>
              <div className="form-group">
                <label>Service Type</label>
                <select
                  value={selectedServiceName}
                  onChange={(e) => setSelectedServiceName(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select a service...</option>
                  {availableServices.map(svc => (
                    <option key={svc} value={svc}>{svc}</option>
                  ))}
                </select>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleAddService}
                disabled={loading || !selectedServiceName}
              >
                Add Service
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={loading || services.length === 0}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
