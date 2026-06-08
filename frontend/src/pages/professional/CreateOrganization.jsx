import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { THEMES } from '../../config/theme';
import './CreateOrganization.css';

export default function CreateOrganization() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    organization_name: '',
    theme_id: 'default'
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.organization_name.trim()) {
      setError('Organization name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/organizations/create', {
        organization_name: formData.organization_name,
        theme_id: formData.theme_id
      });

      // Redirect to onboarding wizard
      navigate(`/professional/onboard?org_id=${response.data.organization.id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  const themeList = Object.entries(THEMES).map(([id, theme]) => ({
    id,
    name: theme.name,
    color: theme.colors.primary
  }));

  return (
    <div className="create-org-container">
      <div className="create-org-card">
        <h1>Create Your Professional Organization</h1>
        <p className="intro-text">
          Set up your practice and manage your team on Calendr
        </p>

        <form onSubmit={handleSubmit} className="create-org-form">
          <div className="form-group">
            <label htmlFor="organization_name">Organization Name *</label>
            <input
              id="organization_name"
              type="text"
              name="organization_name"
              value={formData.organization_name}
              onChange={handleChange}
              placeholder="e.g., Zen Wellness Center"
              maxLength={255}
              required
            />
            <small>This is the name clients will see</small>
          </div>

          <div className="form-group">
            <label>Choose a Theme</label>
            <p className="theme-description">
              You can change this anytime. Pick one that reflects your brand.
            </p>
            <div className="theme-grid">
              {themeList.map(theme => (
                <label key={theme.id} className="theme-option">
                  <input
                    type="radio"
                    name="theme_id"
                    value={theme.id}
                    checked={formData.theme_id === theme.id}
                    onChange={handleChange}
                  />
                  <div
                    className="theme-preview"
                    style={{ borderColor: theme.color }}
                  >
                    <div
                      className="theme-color"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span>{theme.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? 'Creating Organization...' : 'Create Organization'}
          </button>

          <p className="form-hint">
            Next, you'll complete your professional profile and set up services, working hours, and photos.
          </p>
        </form>

        <div className="help-section">
          <h3>What is an organization?</h3>
          <ul>
            <li><strong>Branding:</strong> Customize colors, fonts, and messaging</li>
            <li><strong>Team:</strong> Invite other professionals to join</li>
            <li><strong>Shared Settings:</strong> Optionally share hours and services with teammates</li>
            <li><strong>Client Portal:</strong> All bookings managed through your organization</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
