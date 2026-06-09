import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './ProfileEditModal.css';

const SELF_CARE_SERVICES = [
  'Massage Therapy', 'Yoga', 'Meditation', 'Facials', 'Hair Services',
  'Nail Care', 'Spa Treatments', 'Aromatherapy', 'Counseling', 'Coaching',
  'Personal Training', 'Pilates', 'Acupuncture', 'Reiki', 'Waxing',
  'Pedicure', 'Manicure', 'Sauna', 'Steam Room', 'Hot Stone Massage',
  'Thai Massage', 'Deep Tissue', 'Swedish Massage', 'Reflexology', 'Chiropody',
  'Beauty Treatments', 'Wellness Consultation'
];

export default function ProfileEditModal({ onClose, onSave }) {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load existing services on mount
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await api.get('/professionals/profile');
      const existingServices = response.data.services || [];
      setServices(existingServices);
    } catch (err) {
      console.error('Failed to load services:', err);
    }
  };

  const handleAddService = async () => {
    if (!selectedService || !price) {
      setError('Please select a service and enter a price');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await api.post('/professionals/services', {
        serviceId: `${selectedService}_${Date.now()}`,
        name: selectedService,
        durationMinutes: parseInt(duration),
        price: parseFloat(price)
      });

      setServices(response.data.services || []);
      setSelectedService('');
      setPrice('');
      setDuration(60);
      setSuccess('Service added!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add service');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveService = async (serviceId) => {
    setLoading(true);
    try {
      const response = await api.delete(`/professionals/services/${serviceId}`);
      setServices(response.data.services || []);
      setSuccess('Service removed!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove service');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onSave();
  };

  const usedServices = services.map(s => s.name);
  const availableServices = SELF_CARE_SERVICES.filter(s => !usedServices.includes(s));

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
            <h4>Your Services & Pricing</h4>
            
            {services.length === 0 ? (
              <p className="section-hint">No services added yet. Add your first service below.</p>
            ) : (
              <div className="services-list">
                {services.map(service => (
                  <div key={service.id} className="service-item">
                    <div className="service-info">
                      <div className="service-name">{service.name}</div>
                      <div className="service-details">
                        {service.durationMinutes && <span>${service.price?.toFixed(2) || '0.00'}</span>}
                        {service.durationMinutes && <span>{service.durationMinutes} min</span>}
                      </div>
                    </div>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveService(service.id)}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Service Form */}
          <div className="add-service-section">
            <h4>Add Service</h4>
            
            <div className="form-group">
              <label>Service Type</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                disabled={loading}
              >
                <option value="">Select a service...</option>
                {availableServices.map(svc => (
                  <option key={svc} value={svc}>{svc}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                  min="15"
                  max="480"
                  step="15"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Price ($)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleAddService}
              disabled={loading || !selectedService || !price}
            >
              {loading ? 'Adding...' : 'Add Service'}
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={services.length === 0}
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
