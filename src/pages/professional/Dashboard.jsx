import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../utils/api';
import ProfileEditModal from './ProfileEditModal';
import './Dashboard.css';

export default function ProfessionalDashboard() {
  const { user, logout } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitingError, setInvitingError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', description: '' });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);

  // Load organizations on mount
  useEffect(() => {
    const loadOrgs = async () => {
      try {
        const response = await api.get('/organizations/my-organizations');
        setOrganizations(response.data);
        if (response.data.length > 0) {
          setSelectedOrg(response.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load organizations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrgs();
  }, []);

  // Load invites when org changes
  useEffect(() => {
    const loadInvites = async () => {
      if (!selectedOrg) return;

      try {
        // This endpoint should return invites for the selected org
        // For now, we'll just clear them since the endpoint doesn't exist yet
        setInvites([]);
      } catch (err) {
        console.error('Failed to load invites:', err);
      }
    };

    loadInvites();
  }, [selectedOrg]);

  const handleGenerateInvite = async (e) => {
    e.preventDefault();
    
    if (!inviteEmail.trim()) {
      setInvitingError('Email is required');
      return;
    }

    setInvitingError('');
    setInviteSuccess('');

    try {
      const response = await api.post(`/organizations/${selectedOrg}/invite`, {
        email: inviteEmail
      });

      setInviteSuccess(`Invite sent to ${inviteEmail}`);
      setInviteEmail('');
      setShowInviteForm(false);

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
      description: currentOrg.description || ''
    });
    setEditError('');
    setShowEditModal(true);
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
      const response = await api.patch(`/organizations/${selectedOrg}`, {
        name: editFormData.name,
        description: editFormData.description
      });

      // Update local organizations list
      setOrganizations(prev => prev.map(o => 
        o.id === selectedOrg 
          ? { ...o, ...response.data.organization }
          : o
      ));

      setShowEditModal(false);
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

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
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
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Professional Dashboard</h1>
          <div className="user-menu">
            <span>{user?.email}</span>
            <button className="btn-logout" onClick={logout}>Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Organization Selector */}
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

        {/* Main Content */}
        {currentOrg && (
          <div className="dashboard-content">
            {/* Organization Header */}
            <div className="org-header">
              <div className="org-info">
                <h2>{currentOrg.name}</h2>
                <p>{currentOrg.description || 'No description'}</p>
              </div>
              <button className="btn btn-secondary" onClick={handleEditOrgClick}>Edit Organization</button>
            </div>

            {/* Tabs */}
            <div className="dashboard-tabs">
              <div className="tab-content">
                <div className="content-section">
                  <div className="section-header">
                    <h3>Team Members</h3>
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => setShowInviteForm(!showInviteForm)}
                    >
                      {showInviteForm ? 'Cancel' : 'Invite Professional'}
                    </button>
                  </div>

                  {showInviteForm && (
                    <form className="invite-form" onSubmit={handleGenerateInvite}>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="professional@example.com"
                        required
                      />
                      <button type="submit" className="btn btn-primary">
                        Send Invite
                      </button>
                    </form>
                  )}

                  {invitingError && (
                    <div className="error-message">{invitingError}</div>
                  )}

                  {inviteSuccess && (
                    <div className="success-message">{inviteSuccess}</div>
                  )}

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
                    Invite other professionals to join your team.
                  </p>
                </div>

                {/* Placeholder sections */}
                <div className="content-section">
                  <h3>Profile</h3>
                  <p>Complete your professional profile, services, and working hours.</p>
                  <button 
                    onClick={handleEditProfileClick}
                    className="btn btn-secondary btn-small"
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="content-section">
                  <h3>Bookings</h3>
                  <p>View and manage client bookings.</p>
                  <button className="btn btn-secondary btn-small" disabled>
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Organization Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
          onClose={() => setShowProfileEditModal(false)}
          onSave={() => setShowProfileEditModal(false)}
        />
      )}
    </div>
  );
}
