import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import ProfileEditModal from './ProfileEditModal';
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
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reqLoading, setReqLoading] = useState(false);
  
  // Left sidebar invite states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [invitingError, setInvitingError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  
  // Edit Org Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', description: '', logo: null, images: [] });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [proProfile, setProProfile] = useState(null);

  // Load organizations on mount
  useEffect(() => {
    loadOrgsAndProfile();
  }, []);

  const loadOrgsAndProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/organizations/my-organizations');
      setOrganizations(response.data);
      if (response.data.length > 0) {
        setSelectedOrg(response.data[0].id);
      }

      // Fetch professional profile to get services list
      const profileResponse = await api.get('/professionals/profile');
      setProProfile(profileResponse.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Setup global request interceptor spinner logic
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

      // Add to local list
      setInvites(prev => [...prev, {
        id: response.data.token,
        email: inviteEmail,
        created_at: new Date(),
        expires_at: response.data.expires_at,
        status: 'active'
      }]);
    } catch (err) {
      setInvitingError(err.response?.data?.error || err.message);
    }
  };

  const handleEditOrgClick = () => {
    if (!currentOrg) return;
    setEditFormData({
      name: currentOrg.name || '',
      description: currentOrg.description || '',
      logo: currentOrg.logo_url ? { data: currentOrg.logo_url } : null,
      images: currentOrg.images ? currentOrg.images.map((img, i) => ({ id: i, data: img.data || img })) : []
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditFormData(prev => ({
          ...prev,
          logo: { id: Date.now(), data: event.target.result, name: file.name }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 6 - editFormData.images.length;

    if (files.length > remaining) {
      setEditError(`Max 6 images. You can add ${remaining} more.`);
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditFormData(prev => ({
          ...prev,
          images: [...prev.images, { id: Date.now() + Math.random(), data: event.target.result }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveLogo = () => {
    setEditFormData(prev => ({ ...prev, logo: null }));
  };

  const handleRemoveImage = (id) => {
    setEditFormData(prev => ({ ...prev, images: prev.images.filter(img => img.id !== id) }));
  };

  const handleSaveOrgEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) {
      setEditError('Organization name is required');
      return;
    }

    setEditLoading(true);
    setEditError('');

    try {
      // Step 4 Save endpoint handles logo & images base64 payload updating
      if (proProfile?.id) {
        await api.post(`/organizations/${selectedOrg}/onboarding/save`, {
          professional_id: proProfile.id,
          organization_id: selectedOrg,
          current_step: 4,
          step_data: {
            logo: editFormData.logo ? editFormData.logo.data : null,
            images: editFormData.images.map(img => img.data)
          }
        });
      }

      const response = await api.patch(`/organizations/${selectedOrg}`, {
        name: editFormData.name,
        description: editFormData.description
      });

      // Update local organizations list
      setOrganizations(prev => prev.map(o => 
        o.id === selectedOrg 
          ? { 
              ...o, 
              ...response.data.organization, 
              logo_url: editFormData.logo ? editFormData.logo.data : null,
              images: editFormData.images.map(img => img.data)
            }
          : o
      ));

      setShowEditModal(false);
      loadOrgsAndProfile();
    } catch (err) {
      setEditError(err.response?.data?.error || err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditProfileClick = () => {
    setShowProfileEditModal(true);
  };

  const currentOrg = organizations.find(o => o.id === selectedOrg);
  const currencySymbol = currentOrg ? (CURRENCY_SYMBOLS[currentOrg.currency] || '$') : '$';

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="req-spinner-ring"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!organizations || organizations.length === 0) {
    return (
      <div className="dashboard-empty">
        <h2>No organizations yet</h2>
        <p>Create one to get started</p>
        <a href="/org/create" className="btn btn-primary">Create Organization</a>
      </div>
    );
  }

  return (
    <div className="professional-dashboard">
      {/* Global Request Progress Spinner Indicator */}
      {reqLoading && (
        <div className="global-req-spinner-overlay">
          <div className="req-spinner-ring"></div>
        </div>
      )}

      <header className="dashboard-header">
        <div className="header-content">
          <h1>{currentOrg ? `${currentOrg.name} Dashboard` : 'Professional Dashboard'}</h1>
          <div className="user-menu">
            <span>{user?.email}</span>
            <button className="btn-logout" onClick={logout}>Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Left Navigation and Sidebar */}
        <div className="sidebar-nav-container">
          <div className="org-selector">
            <h2>Organizations</h2>
            <div className="org-list">
              {organizations.map(org => (
                <button
                  key={org.id}
                  className={`org-item ${selectedOrg === org.id ? 'active' : ''}`}
                  onClick={() => setSelectedOrg(org.id)}
                >
                  <div className="org-name">{org.name}</div>
                  <div className="org-role">Owner</div>
                </button>
              ))}
            </div>
            <a 
              href="/org/create" 
              className="btn btn-secondary btn-small"
              style={{ display: organizations.length === 0 ? 'block' : 'none' }}
            >
              Create Organization
            </a>
          </div>

          {/* Sidebar Invite CTA Form */}
          {currentOrg && (
            <div className="sidebar-invite-card">
              <h3>Invite Professional</h3>
              <form onSubmit={handleGenerateInvite} className="sidebar-invite-form">
                <input
                  type="text"
                  value={inviteFirstName}
                  onChange={(e) => setInviteFirstName(e.target.value)}
                  placeholder="First Name"
                  required
                />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                />
                <button type="submit" className="btn btn-primary btn-small">
                  Send Invite
                </button>
              </form>

              {invitingError && (
                <div className="sidebar-invite-error">{invitingError}</div>
              )}
              {inviteSuccess && (
                <div className="sidebar-invite-success">{inviteSuccess}</div>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        {currentOrg && (
          <div className="dashboard-content">
            {/* Organization Header */}
            <div className="org-header">
              <div className="org-info-container">
                {currentOrg.logo_url && (
                  <img src={currentOrg.logo_url} alt="Logo" className="org-profile-logo" />
                )}
                <div className="org-info">
                  <h2>{currentOrg.name}</h2>
                  <p>{currentOrg.description || 'No description'}</p>
                </div>
              </div>
              <button className="btn btn-secondary" onClick={handleEditOrgClick}>Edit Organization</button>
            </div>

            {/* Dashboard Workspace */}
            <div className="dashboard-workspace-grid">
              {/* Left Column: Management Tools */}
              <div className="dashboard-column-left">
                {/* Services, Variants, and Prices summary card */}
                <div className="content-section services-summary-card">
                  <div className="section-header">
                    <h3>Services & Pricing</h3>
                    <button 
                      onClick={handleEditProfileClick}
                      className="btn btn-secondary btn-small"
                    >
                      Edit Profile
                    </button>
                  </div>
                  
                  {proProfile?.services && proProfile.services.length > 0 ? (
                    <div className="dashboard-services-summary-list">
                      {proProfile.services.map(svc => (
                        <div key={svc.id} className="summary-service-row">
                          <h4 className="summary-service-name">{svc.name}</h4>
                          {svc.variants && svc.variants.length > 0 ? (
                            <div className="summary-variants-grid">
                              {svc.variants.map(v => (
                                <div key={v.id} className="summary-variant-item">
                                  <div className="v-label">{v.name}</div>
                                  <div className="v-price">{currencySymbol}{v.price?.toFixed(2)} / {v.duration} min</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="summary-no-variants">No variants added yet. Add price tiers in profile.</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="summary-empty-text">No service profiles configured. Hit "Edit Profile" to get started.</p>
                  )}
                </div>

                {/* Team Members List */}
                <div className="content-section">
                  <h3>Team Members</h3>
                  
                  {/* Pending Invites */}
                  {invites.length > 0 && (
                    <div className="invites-list">
                      <h4>Pending Invites</h4>
                      {invites.map(invite => (
                        <div key={invite.id} className="invite-item">
                          <span>{invite.email}</span>
                          <small>
                            Expires {new Date(invite.expires_at).toLocaleDateString()}
                          </small>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="section-hint">
                    Team invites can be triggered directly using the sidebar form inputs.
                  </p>
                </div>
              </div>

              {/* Right Column: Bookings Preview */}
              <div className="dashboard-column-right">
                <div className="content-section">
                  <h3>Bookings Schedule</h3>
                  <p>View and manage client bookings on the interactive calendar.</p>
                  <button className="btn btn-secondary btn-small" disabled>
                    Interactive Calendar View
                  </button>
                </div>

                {/* Organization Gallery Carousel Images */}
                {currentOrg.images && currentOrg.images.length > 0 && (
                  <div className="content-section org-gallery-card">
                    <h3>Gallery Images</h3>
                    <div className="dashboard-gallery-row">
                      {currentOrg.images.map((imgUrl, i) => (
                        <img key={i} src={imgUrl.data || imgUrl} alt={`Gallery item ${i + 1}`} className="gallery-thumb" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Organization Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content edit-org-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Organization</h3>
            {editError && <div className="error-message">{editError}</div>}
            
            <form onSubmit={handleSaveOrgEdit} className="edit-org-form">
              <div className="form-group">
                <label>Organization Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                />
              </div>

              {/* Logo uploads (max 2 logos) */}
              <div className="form-group">
                <label>Upload Logo (max 2)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                {editFormData.logo && (
                  <div className="logo-preview-list">
                    <div className="preview-logo-item">
                      <img src={editFormData.logo.data} alt="Logo" />
                      <button type="button" className="remove-preview-btn" onClick={handleRemoveLogo}>×</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Gallery image uploads (max 6 images) */}
              <div className="form-group">
                <label>Gallery Images (max 6)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImagesUpload}
                  disabled={editFormData.images.length >= 6}
                />
                <div className="images-preview-list">
                  {editFormData.images.map(img => (
                    <div key={img.id} className="preview-gallery-item">
                      <img src={img.data} alt="Gallery item" />
                      <button type="button" className="remove-preview-btn" onClick={() => handleRemoveImage(img.id)}>×</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-buttons">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showProfileEditModal && (
        <ProfileEditModal 
          orgId={selectedOrg}
          onClose={() => {
            setShowProfileEditModal(false);
            loadOrgsAndProfile();
          }}
          onSave={() => {
            setShowProfileEditModal(false);
            loadOrgsAndProfile();
          }}
        />
      )}
    </div>
  );
}
