import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { accountAPI } from '../services/api';
import '../styles/Auth.css';

// opened from the link in the confirmation email
const VerifyEmail = () => {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('Checking your link...');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setFailed(true);
      setMessage('This link is not complete');
      return;
    }
    accountAPI.verify(token)
      .then(res => setMessage(res.data.message))
      .catch(err => {
        setFailed(true);
        setMessage(err.response?.data?.message || 'Something went wrong');
      });
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Email check</h1>
        </div>
        <div className={failed ? 'error-message' : 'success-message'}>{message}</div>
        <div className="auth-footer">
          <p><Link to="/dashboard">Go to my dashboard</Link></p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
