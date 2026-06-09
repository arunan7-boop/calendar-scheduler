import React, { useState } from 'react';
import { COPY } from '../../../config/theme';
import './Step1.css';

export default function Step1({ data, onSave, onNext, onOrganizationSelect }) {
  const [formData, setFormData] = useState(data || {
    firstName: '',
    lastName: '',
    companyName: '',
    bio: '',
    workAddress: '',
    workPhone: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || !formData.companyName || !formData.workAddress) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Save to backend
      await onSave(1, formData);
      onNext();
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="step-container step-1">
      <h2>{COPY.onboarding.step1.title}</h2>
      <p className="step-description">{COPY.onboarding.step1.description}</p>

      <form className="onboarding-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">
              {COPY.onboarding.step1.inputs.firstName} *
            </label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">
              {COPY.onboarding.step1.inputs.lastName} *
            </label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="companyName">
            {COPY.onboarding.step1.inputs.companyName} *
          </label>
          <input
            id="companyName"
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Wellness Center"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">
            {COPY.onboarding.step1.inputs.bio}
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell clients about your experience and approach..."
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="workAddress">
            {COPY.onboarding.step1.inputs.workAddress} *
          </label>
          <input
            id="workAddress"
            type="text"
            name="workAddress"
            value={formData.workAddress}
            onChange={handleChange}
            placeholder="123 Main St, City, State"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="workPhone">
            {COPY.onboarding.step1.inputs.workPhone}
          </label>
          <input
            id="workPhone"
            type="tel"
            name="workPhone"
            value={formData.workPhone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.history.back()}
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
      </form>
    </div>
  );
}
