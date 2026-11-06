import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { learnerAPI } from '../services/api';
import { statusLabel, statusClass } from '../utils/status';
import PageLayout from '../components/PageLayout';

// shows the learner's certificates, projects and the jobs they applied for
const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const certRes = await learnerAPI.getCertificates();
        const appRes = await learnerAPI.getApplications();
        const subRes = await learnerAPI.getSubmissions();
        setCertificates(certRes.data.data);
        setApplications(appRes.data.data);
        setSubmissions(subRes.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  // the student says if they really got the job
  const handleConfirm = async (application, yes) => {
    try {
      const res = await learnerAPI.confirmHire(application.id, yes);
      setMessage(res.data.message);
      const appRes = await learnerAPI.getApplications();
      setApplications(appRes.data.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  // colour of the little status label
  const badgeClass = (status) => {
    if (status === 'approved' || status === 'accepted' || status === 'hired') return 'pg-badge pg-badge-green';
    if (status === 'rejected') return 'pg-badge pg-badge-red';
    return 'pg-badge pg-badge-yellow';
  };

  return (
    <PageLayout title="My Certificates" subtitle="Give the code to an employer. They can check it on the Verify page.">
      {message && <div className="pg-message">{message}</div>}

      <h3 className="pg-section-title">🏆 Certificates</h3>
      {certificates.length === 0 && (
        <div className="pg-empty">You have no certificates yet. Send a project and the facilitator will check it.</div>
      )}
      <div className="pg-grid">
        {certificates.map(c => (
          <div className="pg-item" key={c.id}>
            <h4>{c.tutorialTitle}</h4>
            <p>Code: <span className="pg-code">{c.code}</span></p>
            <p>Date: {new Date(c.issuedAt).toLocaleDateString()}</p>
            {c.issuedBy && <p>Approved by facilitator {c.issuedBy}</p>}
            {c.skills && c.skills.length > 0 && <p>Skills: {c.skills.join(', ')}</p>}
            <div className="pg-buttons">
              <Link className="pg-btn" to={'/certificate/' + c.code}>View and print</Link>
            </div>
          </div>
        ))}
      </div>

      <h3 className="pg-section-title">📁 My Projects</h3>
      {submissions.length === 0 && <div className="pg-empty">You have not sent any project yet.</div>}
      <div className="pg-grid">
        {submissions.map(s => (
          <div className="pg-item" key={s.id}>
            <h4>{s.tutorialTitle}</h4>
            <span className={badgeClass(s.status)}>{s.status}</span>
            {s.feedback && <p>Facilitator says: {s.feedback}</p>}
          </div>
        ))}
      </div>

      <h3 className="pg-section-title">💼 My Applications</h3>
      {applications.length === 0 && <div className="pg-empty">You have not applied for any job yet.</div>}
      <div className="pg-grid">
        {applications.map(a => (
          <div className="pg-item" key={a.id}>
            <h4>{a.jobTitle}</h4>
            <p>{a.company}</p>
            <span className={statusClass(a.status)}>{statusLabel(a.status)}</span>
            {a.interviewNote && <p>📅 Interview: {a.interviewNote}</p>}

            {(a.status === 'accepted' || a.status === 'hired') && (
              <div className="pg-buttons">
                <Link className="pg-btn pg-btn-light" to={'/application-chat/' + a.id}>Chat with the employer</Link>
              </div>
            )}

            {a.status === 'hired' && a.hireConfirmed !== true && (
              <div className="app-extra">
                <p><strong>Did you get this job?</strong></p>
                <div className="pg-buttons">
                  <button className="pg-btn pg-btn-green" onClick={() => handleConfirm(a, true)}>Yes, I got it</button>
                  <button className="pg-btn pg-btn-red" onClick={() => handleConfirm(a, false)}>No</button>
                </div>
              </div>
            )}
            {a.status === 'hired' && a.hireConfirmed === true && <p>✅ You confirmed this job. Congratulations!</p>}
          </div>
        ))}
      </div>
    </PageLayout>
  );
};

export default MyCertificates;
