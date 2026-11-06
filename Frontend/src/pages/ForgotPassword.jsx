import { useState } from 'react';
import { Link } from 'react-router-dom';
import { accountAPI } from '../services/api';
import '../styles/Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await accountAPI.forgot(email);
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send the link. Try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot password</h1>
          <p>Write your email and we send you a link to choose a new password</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send the link'}
          </button>
        </form>

        <div className="auth-footer">
          <p><Link to="/login">Back to login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
