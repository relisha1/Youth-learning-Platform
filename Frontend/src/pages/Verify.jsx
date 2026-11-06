import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { publicAPI } from '../services/api';
import PageLayout from '../components/PageLayout';

// anyone can type a certificate code here to see if it is real
const Verify = () => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  const checkCode = async (value) => {
    setResult(null);
    setError('');
    try {
      const res = await publicAPI.verify(value.trim());
      setResult(res.data.data);
    } catch (err) {
      setError('This code is not real. Please check it again.');
    }
  };

  // the QR code on a certificate opens this page with the code in the address
  useEffect(() => {
    const codeFromLink = searchParams.get('code');
    if (codeFromLink) {
      setCode(codeFromLink);
      checkCode(codeFromLink);
    }
  }, []);

  const handleCheck = (e) => {
    e.preventDefault();
    checkCode(code);
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
          <p><strong>Learning path:</strong> {result.tutorialTitle}</p>
          {result.skills && result.skills.length > 0 && (
            <p><strong>Skills shown:</strong> {result.skills.join(', ')}</p>
          )}
          {result.projectLink && (
            <p><strong>Project:</strong> <a href={result.projectLink} target="_blank" rel="noreferrer">{result.projectLink}</a></p>
          )}
          {result.issuedBy && <p><strong>Given by facilitator:</strong> {result.issuedBy}</p>}
          <p><strong>Date:</strong> {new Date(result.issuedAt).toLocaleDateString()}</p>
          <p><Link to={'/certificate/' + result.code}>View the certificate</Link></p>
        </div>
      )}
    </PageLayout>
  );
};

export default Verify;
