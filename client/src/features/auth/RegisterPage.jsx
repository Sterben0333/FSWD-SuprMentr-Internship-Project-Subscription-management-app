import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { authAPI } from './authService';

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const getPasswordStrength = (pw) => {
  if (!pw) return { level: 0, label: '' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { level: 1, label: 'Weak' };
  if (score <= 3) return { level: 2, label: 'Medium' };
  return { level: 3, label: 'Strong' };
};

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const strength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateEmail = (email) => {
    const localPart = email.split('@')[0];
    if (!/^[a-zA-Z]/.test(localPart)) return 'Email must start with a letter.';
    if (localPart.length < 5) return 'Email username must be at least 5 characters.';
    if (/^\d+$/.test(localPart)) return 'Email username cannot be all numbers.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const emailError = validateEmail(formData.email);
    if (emailError) {
      setError(emailError);
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { data } = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      setAuth(data.data.user, data.data.token);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message;
      setError(msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Create Account</h2>

      {error && <div className="auth-error">⚠ {error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="register-name">Full Name</label>
          <input id="register-name" type="text" name="name" placeholder="John Doe"
            value={formData.name} onChange={handleChange} required autoComplete="name" />
        </div>

        <div className="input-group">
          <label htmlFor="register-email">Email</label>
          <input id="register-email" type="email" name="email" placeholder="you@example.com"
            value={formData.email} onChange={handleChange} required autoComplete="email" />
        </div>

        <div className="input-group">
          <label htmlFor="register-password">Password</label>
          <div className="password-wrapper">
            <input id="register-password" type={showPassword ? 'text' : 'password'}
              name="password" placeholder="Min 6 characters" value={formData.password}
              onChange={handleChange} required minLength={6} autoComplete="new-password" />
            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {formData.password && (
            <>
              <div className="password-strength">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`password-strength-bar${strength.level >= i ? ' filled' : ''}${strength.level === 2 && i <= 2 ? ' medium' : ''}${strength.level === 3 ? ' strong' : ''}`} />
                ))}
              </div>
              <span className="password-strength-label">{strength.label}</span>
            </>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="register-confirm">Confirm Password</label>
          <div className="password-wrapper">
            <input id="register-confirm" type={showConfirm ? 'text' : 'password'}
              name="confirmPassword" placeholder="Repeat password" value={formData.confirmPassword}
              onChange={handleChange} required minLength={6} autoComplete="new-password" />
            <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
          {loading ? (<><span className="spinner spinner-sm"></span> Creating account...</>) : 'Create Account'}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </div>
  );
};

export default RegisterPage;
