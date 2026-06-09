import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getTheme } from '../../../config/theme';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import api from '../../../utils/api';
import './OnboardingWizard.css';

export default function OnboardingWizard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const org_id_param = searchParams.get('org_id');
  const [organizationId, setOrganizationId] = useState(null);
  const [theme, setTheme] = useState(getTheme('default'));
  const [currentStep, setCurrentStep] = useState(1);
  const [professional, setProfessional] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Initialize wizard - verify token OR load org directly
  useEffect(() => {
    const initWizard = async () => {
      try {
        let orgId = org_id_param; // Direct onboarding (already authenticated)

        // If invite token, verify it first
        if (token) {
          // Determine API URL (same logic as api.js)
          const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost';
          const apiBase = isLocal 
            ? '/api'
            : 'https://calendar-scheduler-production.up.railway.app/api';

          // Verify token
          const response = await fetch(`${apiBase}/organizations/invite/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });

          if (!response.ok) {
            throw new Error('Invalid or expired invite token');
          }

          const data = await response.json();
          orgId = data.organization.id;
        }

        if (!orgId) {
          setError('No organization specified. Invalid or missing invite token.');
          setLoading(false);
          return;
        }

        setOrganizationId(orgId);

        // Load organization theme
        const orgResponse = await api.get(`/organizations/${orgId}`);
        setTheme(getTheme(orgResponse.data.theme_id));

        // Load existing progress if resuming
        const me = await api.get('/auth/me');
        setProfessional({
          userId: me.data.id,
          user_type: me.data.user_type,
          professional_id: me.data.professional_id
        });

        // Get onboarding progress
        const progressResponse = await api.get(`/organizations/${orgId}/onboarding/${me.data.professional_id}`);
        setProgress(progressResponse.data);
        setCurrentStep(progressResponse.data.current_step || 1);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    initWizard();
  }, [token, org_id_param]);

  const handleSaveStep = async (step, data) => {
    try {
      if (!professional) {
        throw new Error('Professional not loaded');
      }

      await api.post(`/organizations/${organizationId}/onboarding/save`, {
        professional_id: professional.professional_id,
        organization_id: organizationId,
        current_step: step,
        step_data: data,
        token // Include token for validation
      });

      setProgress(prev => ({
        ...prev,
        current_step: step,
        [`step_${step}_data`]: data
      }));
    } catch (err) {
      throw new Error(err.response?.data?.error || err.message);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding complete
      navigate('/professional/dashboard');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) {
    return (
      <div className="wizard-loading">
        <div className="spinner"></div>
        <p>Loading onboarding wizard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wizard-error">
        <div className="error-box">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/auth/login')} className="btn btn-primary">
            Go back to login
          </button>
        </div>
      </div>
    );
  }

  const stepData = progress[`step_${currentStep}_data`] || null;

  return (
    <div className="onboarding-wizard">
      <style>{generateThemeCSS(theme)}</style>

      <div className="wizard-container">
        <div className="wizard-header">
          <div className="wizard-badge">
            <div className="badge-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span>Onboarding: Setup Profile</span>
          </div>
          <div className="progress-indicator">
            {[1, 2, 3, 4].map(step => {
              const labels = ['Active', 'Work', 'Expertise', 'Finalize'];
              return (
                <div
                  key={step}
                  className={`progress-step ${step === currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}
                >
                  <span className="step-number">{step}</span>
                  <span className="step-label">{labels[step - 1]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="wizard-content">
          {currentStep === 1 && (
            <Step1
              data={stepData}
              onSave={handleSaveStep}
              onNext={handleNextStep}
            />
          )}
          {currentStep === 2 && (
            <Step2
              data={stepData}
              onSave={handleSaveStep}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          )}
          {currentStep === 3 && (
            <Step3
              data={stepData}
              onSave={handleSaveStep}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          )}
          {currentStep === 4 && (
            <Step4
              data={stepData}
              onSave={handleSaveStep}
              onNext={handleNextStep}
              onBack={handlePreviousStep}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to generate CSS from theme
function generateThemeCSS(theme) {
  if (!theme) return '';
  
  return `
    :root {
      --color-primary: ${theme.colors.primary};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};
      --color-text: ${theme.colors.text};
      --color-text-light: ${theme.colors.textLight};
      --color-border: ${theme.colors.border};
      --font-family: ${theme.fonts?.family || "'Roboto', sans-serif"};
    }
  `;
}
