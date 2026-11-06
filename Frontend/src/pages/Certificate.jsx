import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { publicAPI } from '../services/api';
import QrCode from '../components/QrCode';
import '../styles/Certificate.css';

// a certificate that can be printed or saved as PDF. The QR code opens the check page.
const Certificate = () => {
  const { code } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCertificate = async () => {
      try {
        const res = await publicAPI.verify(code);
        setCertificate(res.data.data);
      } catch (err) {
        setError('This certificate was not found.');
      }
    };
    loadCertificate();
  }, [code]);

  const verifyUrl = window.location.origin + '/verify?code=' + code;

  if (error) {
    return (
      <div className="cert-page">
        <p className="cert-error">{error}</p>
        <Link to="/verify">Check another code</Link>
      </div>
    );
  }

  if (!certificate) {
    return <div className="cert-page"><p>Loading...</p></div>;
  }

  return (
    <div className="cert-page">
      <div className="cert-buttons no-print">
        <Link to="/" className="cert-btn cert-btn-light">← Home</Link>
        <button className="cert-btn" onClick={() => window.print()}>Print or save as PDF</button>
      </div>

      <div className="cert-paper">
        <div className="cert-inner">
          <p className="cert-brand">Youth Tech Hub</p>
          <h1>Certificate of Completion</h1>
          <p className="cert-small">This certifies that</p>
          <h2 className="cert-name">{certificate.learnerName}</h2>
          <p className="cert-small">completed the learning path</p>
          <h3 className="cert-path">{certificate.tutorialTitle}</h3>
          <p className="cert-small">
            and built a project that was checked and approved by a facilitator.
          </p>

          {certificate.skills && certificate.skills.length > 0 && (
            <div className="cert-skills">
              <p className="cert-small">Skills shown in the project</p>
              <div>
                {certificate.skills.map(skill => (
                  <span key={skill} className="cert-skill">{skill}</span>
                ))}
              </div>
            </div>
          )}

          <div className="cert-footer">
            <div className="cert-details">
              <p><strong>Approved by:</strong> {certificate.issuedBy || 'A facilitator'}</p>
              <p><strong>Date:</strong> {new Date(certificate.issuedAt).toLocaleDateString()}</p>
              <p><strong>Certificate code:</strong> <span className="cert-code">{certificate.code}</span></p>
              <p className="cert-check">Check it at<br />{verifyUrl}</p>
            </div>
            <div className="cert-qr">
              <QrCode text={verifyUrl} size={130} />
              <p>Scan to check</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
