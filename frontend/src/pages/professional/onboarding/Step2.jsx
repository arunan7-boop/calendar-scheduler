import React, { useState, useEffect } from 'react';
import { COPY } from '../../config/theme';
import './Step2.css';

const SELF_CARE_SERVICES = [
  'Massage Therapy', 'Yoga', 'Meditation', 'Facials', 'Hair Services',
  'Nail Care', 'Spa Treatments', 'Aromatherapy', 'Counseling', 'Coaching',
  'Personal Training', 'Pilates', 'Acupuncture', 'Reiki', 'Waxing',
  'Pedicure', 'Manicure', 'Sauna', 'Steam Room', 'Hot Stone Massage',
  'Thai Massage', 'Deep Tissue', 'Swedish Massage', 'Reflexology', 'Chiropody',
  'Beauty Treatments', 'Wellness Consultation'
];

export default function Step2({ data, onSave, onNext, onBack }) {
  const [selectedServices, setSelectedServices] = useState(data?.selected || []);
  const [customServices, setCustomServices] = useState(data?.custom || []);
  const [newCustomService, setNewCustomService] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleService = (service) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const addCustomService = () => {
    if (newCustomService.trim()) {
      setCustomServices(prev => [...prev, newCustomService.trim()]);
      setNewCustomService('');
    }
  };

  const removeCustomService = (index) => {
    setCustomServices(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (selectedServices.length === 0 && customServices.length === 0) {
      setError('Please select or add at least one service');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = {
        selected: selectedServices,
        custom: customServices,
        all: [...selectedServices, ...customServices]
      };
      await onSave(2, formData);
      onNext();
    } catch (err) {
      setError(err.message || 'Failed to save services');
    } finally {
      setLoading(false);
    }
  };

  const totalSelected = selectedServices.length + customServices.length;

  return (
    <div className="step-container step-2">
      <h2>{COPY.onboarding.step2.title}</h2>
      <p className="step-description">{COPY.onboarding.step2.description}</p>

      <div className="services-list">
        {SELF_CARE_SERVICES.map(service => (
          <label key={service} className="service-checkbox">
            <input
              type="checkbox"
              checked={selectedServices.includes(service)}
              onChange={() => toggleService(service)}
            />
            <span className={selectedServices.includes(service) ? 'selected' : ''}>
              {service}
            </span>
          </label>
        ))}
      </div>

      <div className="custom-services-section">
        <h3>{COPY.onboarding.step2.addCustom}</h3>
        <div className="custom-input-group">
          <input
            type="text"
            value={newCustomService}
            onChange={(e) => setNewCustomService(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomService()}
            placeholder={COPY.onboarding.step2.placeholder}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addCustomService}
          >
            Add
          </button>
        </div>

        {customServices.length > 0 && (
          <div className="custom-services-added">
            {customServices.map((service, idx) => (
              <div key={idx} className="custom-service-tag">
                <span>{service}</span>
                <button
                  type="button"
                  onClick={() => removeCustomService(idx)}
                  className="remove-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="service-count">
        Selected: <strong>{totalSelected}</strong> service{totalSelected !== 1 ? 's' : ''}
      </p>

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
          {loading ? 'Saving...' : COPY.buttons.save}
        </button>
      </div>
    </div>
  );
}
