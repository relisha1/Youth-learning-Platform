import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { accountAPI } from '../services/api';
import '../styles/Auth.css';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== again) {
      setError('The two passwords are not the same');
      return;
    }
    setLoading(true);
    try {
      const res = await accountAPI.reset(token, password);
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>New password</h1>
          <p>Choose a new password for your account</p>
        </div>

        {!token && <div className="error-message">This link is not complete. Open the link from your email again.</div>}
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        {token && !message && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="password">New password</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
            </div>
            <div className="form-group">
              <label htmlFor="again">Write it again</label>
              <input type="password" id="again" value={again} onChange={(e) => setAgain(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Saving...' : 'Save new password'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p><Link to="/login">Go to login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
