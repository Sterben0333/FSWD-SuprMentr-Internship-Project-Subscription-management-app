import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { authAPI } from './authService';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
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
    <div className="auth-card animate-scale-in">
      <h2>Create Account</h2>

      {error && <div className="auth-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="register-name">Full Name</label>
          <input
            id="register-name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete="name"
          />
        </div>

        <div className="input-group">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>

        <div className="input-group">
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            name="password"
            placeholder="Min 6 characters"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        <div className="input-group">
          <label htmlFor="register-confirm">Confirm Password</label>
          <input
            id="register-confirm"
            type="password"
            name="confirmPassword"
            placeholder="Repeat password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner spinner-sm"></span>
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </div>
  );
};

export default RegisterPage;
