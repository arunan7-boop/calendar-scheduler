import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import ProfileEditModal from './ProfileEditModal';
import StorefrontCard from './StorefrontCard';
import './Dashboard.css';

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: '$',
  AUD: '$',
  INR: '₹'
};

export default function ProfessionalDashboard() {
  const { user, logout } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedOrgData, setSelectedOrgData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reqLoading, setReqLoading] = useState(false);
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [invitingError, setInvitingError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [proProfile, setProProfile] = useState(null);

  useEffect(() => {
    loadOrgsAndProfile();
  }, []);

  const loadOrgsAndProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/organizations/my-organizations');
      setOrganizations(response.data);
      if (response.data.length > 0) {
        setSelectedOrg(prev => {
          if (prev && response.data.some(o => o.id === prev)) {
            return prev;
          }
          return response.data[0].id;
        });
        setSelectedOrgData(response.data[0]);
      }

      const profileResponse = await api.get('/professionals/profile');
      setProProfile(profileResponse.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const reqInterceptor = api.interceptors.request.use((config) => {
      setReqLoading(true);
      return config;
    }, (error) => {
      setReqLoading(false);
      return Promise.reject(error);
    });

    const resInterceptor = api.interceptors.response.use((response) => {
      setReqLoading(false);
      return response;
    }, (error) => {
      setReqLoading(false);
      return Promise.reject(error);
    });

    return () => {
      api.interceptors.request.eject(reqInterceptor);
      api.interceptors.response.eject(resInterceptor);
    };
  }, []);

  const handleGenerateInvite = async (e) => {
    e.preventDefault();
    
    if (!inviteEmail.trim() || !inviteFirstName.trim()) {
      setInvitingError('First name and email are required');
      return;
    }

    setInvitingError('');
    setInviteSuccess('');

    try {
      const response = await api.post(`/organizations/${selectedOrg}/invite`, {
        email: inviteEmail,
        firstName: inviteFirstName
      });

      setInviteSuccess(`Invite sent to ${inviteFirstName}!`);
      setInviteEmail('');
      setInviteFirstName('');
    } catch (err) {
      setInvitingError(err.response?.data?.error || err.message);
    }
  };

  const handleLogout = async () => {
    try {
      logout();
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  const currentOrg = selectedOrgData;
  const currencySymbol = currentOrg?.currency ? CURRENCY_SYMBOLS[currentOrg.currency] : '£';

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="header-right">
          <span className="user-email">{user?.email}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="dashboard-sidebar">
          <div className="sidebar-org-card">
            <h3>{currentOrg?.name}</h3>
            <span className="org-role">Owner</span>
          </div>

          <div className="sidebar-invite-card">
            <h4>Send Invite</h4>
            <form onSubmit={handleGenerateInvite}>
              <input type="text" placeholder="First Name" value={inviteFirstName} onChange={(e) => setInviteFirstName(e.target.value)} />
              <input type="email" placeholder="Email Address" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
              {invitingError && <p className="error-text">{invitingError}</p>}
              {inviteSuccess && <p className="success-text">{inviteSuccess}</p>}
              <button type="submit" className="invite-btn">Send Invite</button>
            </form>
          </div>

          <StorefrontCard orgId={selectedOrg} proId={proProfile?.id} onStorefrontCreated={() => {}} />
        </aside>

        <main className="dashboard-main">
          <div className="org-header-card">
            <div className="org-header-left">
              {currentOrg?.logo_url && <img src={currentOrg.logo_url} alt="Org Logo" className="org-logo" />}
              <div className="org-info">
                <h2>{currentOrg?.name}</h2>
                <p>{currentOrg?.description}</p>
              </div>
            </div>
            <button className="edit-org-btn" onClick={() => setShowProfileEditModal(true)}>Edit Organization</button>
          </div>

          <div className="services-section">
            <h3>Services & Pricing</h3>
            <div className="services-list">
              {proProfile?.services && proProfile.services.length > 0 ? (
                proProfile.services.map((service) => (
                  <div key={service.id} className="service-container">
                    <div className="service-row-header">
                      <span className="service-name">{service.name}</span>
                    </div>
                    {service.variants && service.variants.length > 0 ? (
                      <div className="variants-container">
                        {service.variants.map((variant) => (
                          <div key={variant.id} className="variant-row">
                            <span className="variant-name">{variant.name}</span>
                            <span className="variant-price-duration">
                              {currencySymbol}{parseFloat(variant.price || 0).toFixed(2)} / {variant.duration_minutes}m
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-variants">No variants</div>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-services">No services yet</p>
              )}
            </div>

            <button className="update-services-btn" onClick={() => setShowProfileEditModal(true)}>
              Update Services
            </button>
          </div>

          <div className="calendar-gallery-grid">
            <div className="calendar-card">
              <p>View and manage client bookings on the interactive calendar.</p>
              <button className="calendar-btn">Interactive Calendar View</button>
            </div>

            <div className="gallery-card">
              <h4>Gallery</h4>
              <div className="gallery-grid">
                {currentOrg?.images && currentOrg.images.length > 0 ? (
                  currentOrg.images.map((img, idx) => (
                    <div key={idx} className="gallery-item">
                      {img.data ? <img src={img.data} alt={`Gallery ${idx}`} /> : <div className="gallery-placeholder" />}
                    </div>
                  ))
                ) : (
                  <p className="no-gallery">No gallery images</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {showProfileEditModal && (
        <ProfileEditModal onClose={() => setShowProfileEditModal(false)} orgId={selectedOrg} onSave={loadOrgsAndProfile} />
      )}
    </div>
  );
}
