import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import { authAPI } from '../auth/authService';
import './SettingsPage.css';

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Preferences state
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [budgetLimit, setBudgetLimit] = useState(user?.budgetLimit || '');

  // UI state
  const [saving, setSaving] = useState({});
  const [messages, setMessages] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const showMessage = (section, text, isError = false) => {
    setMessages((prev) => ({ ...prev, [section]: { text, isError } }));
    setTimeout(() => setMessages((prev) => ({ ...prev, [section]: null })), 4000);
  };

  // ——— Handlers ———

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving((prev) => ({ ...prev, profile: true }));
    try {
      const { data } = await authAPI.updateProfile({
        name: profileForm.name,
      });
      updateUser(data.data.user);
      showMessage('profile', 'Profile updated successfully!');
    } catch (err) {
      showMessage('profile', err.response?.data?.message || 'Update failed', true);
    } finally {
      setSaving((prev) => ({ ...prev, profile: false }));
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('password', 'Passwords do not match', true);
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showMessage('password', 'Password must be at least 6 characters', true);
      return;
    }
    setSaving((prev) => ({ ...prev, password: true }));
    try {
      await authAPI.updateProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showMessage('password', 'Password changed successfully!');
    } catch (err) {
      showMessage('password', err.response?.data?.message || 'Password change failed', true);
    } finally {
      setSaving((prev) => ({ ...prev, password: false }));
    }
  };

  const handlePreferencesUpdate = async () => {
    setSaving((prev) => ({ ...prev, preferences: true }));
    try {
      const { data } = await authAPI.updateProfile({
        currency,
        budgetLimit: budgetLimit ? Number(budgetLimit) : null,
      });
      updateUser(data.data.user);
      showMessage('preferences', 'Preferences saved!');
    } catch (err) {
      showMessage('preferences', err.response?.data?.message || 'Save failed', true);
    } finally {
      setSaving((prev) => ({ ...prev, preferences: false }));
    }
  };

  const handleDeleteAccount = async () => {
    setSaving((prev) => ({ ...prev, delete: true }));
    try {
      await authAPI.deleteAccount();
      logout();
      navigate('/login');
    } catch (err) {
      showMessage('delete', err.response?.data?.message || 'Failed to delete account', true);
    } finally {
      setSaving((prev) => ({ ...prev, delete: false }));
    }
  };

  const MessageBanner = ({ section }) => {
    const msg = messages[section];
    if (!msg) return null;
    return (
      <div className={`settings-msg ${msg.isError ? 'error' : 'success'} animate-fade-in`}>
        <span>{msg.isError ? '❌' : '✅'}</span>
        <span>{msg.text}</span>
      </div>
    );
  };

  return (
    <div className="settings-page animate-fade-in-up">
      <div className="settings-header">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-secondary text-sm">Manage your account and preferences</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* ——— Profile Section ——— */}
        <section className="glass-card settings-section">
          <div className="settings-section-header">
            <span className="settings-section-icon">👤</span>
            <div>
              <h3 className="font-semibold">Profile Information</h3>
              <p className="text-muted text-sm">Update your personal details</p>
            </div>
          </div>
          <MessageBanner section="profile" />
          <form onSubmit={handleProfileUpdate} className="settings-form">
            <div className="input-group">
              <label htmlFor="settings-name">Display Name</label>
              <input
                id="settings-name"
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="settings-email">Email Address</label>
              <input
                id="settings-email"
                type="email"
                value={profileForm.email}
                disabled
                className="input-disabled"
              />
              <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                Email cannot be changed
              </span>
            </div>
            <div className="settings-form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving.profile}>
                {saving.profile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </section>

        {/* ——— Appearance ——— */}
        <section className="glass-card settings-section">
          <div className="settings-section-header">
            <span className="settings-section-icon">🎨</span>
            <div>
              <h3 className="font-semibold">Appearance</h3>
              <p className="text-muted text-sm">Customize how SubTrackr looks</p>
            </div>
          </div>
          <div className="settings-form">
            <div className="settings-option">
              <div className="settings-option-info">
                <span className="font-medium">Theme</span>
                <span className="text-muted text-sm">Choose between light and dark mode</span>
              </div>
              <button
                className="theme-switch"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                <span className={`theme-switch-option ${theme === 'light' ? 'active' : ''}`}>
                  ☀️ Light
                </span>
                <span className={`theme-switch-option ${theme === 'dark' ? 'active' : ''}`}>
                  🌙 Dark
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ——— Preferences ——— */}
        <section className="glass-card settings-section">
          <div className="settings-section-header">
            <span className="settings-section-icon">💰</span>
            <div>
              <h3 className="font-semibold">Preferences</h3>
              <p className="text-muted text-sm">Currency and budget settings</p>
            </div>
          </div>
          <MessageBanner section="preferences" />
          <div className="settings-form">
            <div className="input-group">
              <label htmlFor="settings-currency">Currency</label>
              <select
                id="settings-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="INR">🇮🇳 INR — Indian Rupee (₹)</option>
                <option value="USD">🇺🇸 USD — US Dollar ($)</option>
              </select>
            </div>
            <div className="input-group">
              <label htmlFor="settings-budget">Monthly Budget Limit</label>
              <input
                id="settings-budget"
                type="number"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(e.target.value)}
                placeholder="e.g. 5000"
                min="0"
              />
              <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                Get notified when your monthly spending exceeds this limit
              </span>
            </div>
            <div className="settings-form-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePreferencesUpdate}
                disabled={saving.preferences}
              >
                {saving.preferences ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </section>

        {/* ——— Security ——— */}
        <section className="glass-card settings-section">
          <div className="settings-section-header">
            <span className="settings-section-icon">🔒</span>
            <div>
              <h3 className="font-semibold">Security</h3>
              <p className="text-muted text-sm">Manage your password</p>
            </div>
          </div>
          <MessageBanner section="password" />
          <form onSubmit={handlePasswordChange} className="settings-form">
            <div className="input-group">
              <label htmlFor="settings-current-pw">Current Password</label>
              <input
                id="settings-current-pw"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                placeholder="Enter current password"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="settings-new-pw">New Password</label>
              <input
                id="settings-new-pw"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
            </div>
            <div className="input-group">
              <label htmlFor="settings-confirm-pw">Confirm New Password</label>
              <input
                id="settings-confirm-pw"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                placeholder="Repeat new password"
                required
              />
            </div>
            <div className="settings-form-actions">
              <button type="submit" className="btn btn-secondary" disabled={saving.password}>
                {saving.password ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </section>

        {/* ——— Danger Zone ——— */}
        <section className="glass-card settings-section settings-danger">
          <div className="settings-section-header">
            <span className="settings-section-icon">⚠️</span>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--danger)' }}>Danger Zone</h3>
              <p className="text-muted text-sm">Irreversible actions</p>
            </div>
          </div>
          <div className="settings-form">
            <div className="settings-option">
              <div className="settings-option-info">
                <span className="font-medium">Delete Account</span>
                <span className="text-muted text-sm">
                  Permanently delete your account and all subscription data
                </span>
              </div>
              {!showDeleteConfirm ? (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </button>
              ) : (
                <div className="delete-confirm animate-fade-in">
                  <p className="text-sm" style={{ color: 'var(--danger)' }}>
                    Are you sure? This action cannot be undone.
                  </p>
                  <div className="flex gap-sm">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={handleDeleteAccount}
                      disabled={saving.delete}
                    >
                      {saving.delete ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
