import { useState } from 'react';
import { publicAPI } from '../services/api';
import PageLayout from '../components/PageLayout';

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
    <PageLayout title="Check a Certificate" subtitle="Type the code from the learner's certificate">
      <div className="pg-card">
        <form onSubmit={handleCheck} className="pg-form">
          <input placeholder="Example: SB-4F9A2C" value={code} onChange={(e) => setCode(e.target.value)} />
          <button className="pg-btn" type="submit">Check</button>
        </form>
      </div>

      {error && <div className="pg-message">❌ {error}</div>}

      {result && (
        <div className="pg-card">
          <h3>✅ This certificate is real</h3>
          <p><strong>Name:</strong> {result.learnerName}</p>
          <p><strong>Tutorial:</strong> {result.tutorialTitle}</p>
          {result.issuedBy && <p><strong>Given by facilitator:</strong> {result.issuedBy}</p>}
          <p><strong>Date:</strong> {new Date(result.issuedAt).toLocaleDateString()}</p>
        </div>
      )}
    </PageLayout>
  );
};

export default Verify;
