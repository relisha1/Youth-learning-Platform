import { useState } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../services/api';
import '../styles/Pages.css';

// anyone can type a certificate code here to see if it is real
const Verify = () => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    setResult(null);
    setError('');
    try {
      const res = await publicAPI.verify(code.trim());
      setResult(res.data.data);
    } catch (err) {
      setError('This code is not real. Please check it again.');
    }
  };

  return (
    <div className="simple-page">
      <Link to="/">← Home</Link>
      <h1>Check a Certificate</h1>
      <form onSubmit={handleCheck} className="simple-form">
        <input placeholder="Example: SB-4F9A2C" value={code} onChange={(e) => setCode(e.target.value)} />
        <button type="submit">Check</button>
      </form>

      {error && <p className="note">{error}</p>}
      {result && (
        <div className="simple-card">
          <h3>✅ This certificate is real</h3>
          <p>Name: {result.learnerName}</p>
          <p>Tutorial: {result.tutorialTitle}</p>
          <p>Date: {new Date(result.issuedAt).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
};

export default Verify;
