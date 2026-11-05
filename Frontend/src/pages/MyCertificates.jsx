import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { learnerAPI } from '../services/api';
import '../styles/Pages.css';

// shows the learner's certificates and the jobs they applied for
const MyCertificates = () => {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const certRes = await learnerAPI.getCertificates();
        const appRes = await learnerAPI.getApplications();
        setCertificates(certRes.data.data);
        setApplications(appRes.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  return (
    <div className="simple-page">
      <button onClick={() => navigate('/dashboard')}>← Back</button>
      <h1>My Certificates</h1>
      <p>Give the code to an employer. They can check it on the Verify page.</p>

      {certificates.length === 0 && <p>You have no certificates yet. Finish a tutorial to get one.</p>}
      {certificates.map(c => (
        <div className="simple-card" key={c.id}>
          <h3>{c.tutorialTitle}</h3>
          <p>Code: <strong>{c.code}</strong></p>
          <p>Date: {new Date(c.issuedAt).toLocaleDateString()}</p>
        </div>
      ))}

      <h2>My Applications</h2>
      {applications.length === 0 && <p>You have not applied for any job yet.</p>}
      {applications.map(a => (
        <div className="simple-card" key={a.id}>
          <h3>{a.jobTitle}</h3>
          <p>{a.company} · Status: {a.status}</p>
        </div>
      ))}
    </div>
  );
};

export default MyCertificates;
