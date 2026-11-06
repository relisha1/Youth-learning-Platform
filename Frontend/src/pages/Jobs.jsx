import { useState, useEffect } from 'react';
import { publicAPI, learnerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/PageLayout';

// list of open jobs, students can apply
const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState('');
  const [applyingTo, setApplyingTo] = useState(null);
  const [text, setText] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const res = await publicAPI.getJobs();
      setJobs(res.data.data.filter(job => job.status !== 'closed'));
    } catch (err) {
      setMessage('Could not load jobs');
    }
  };

  const handleApply = async (job) => {
    try {
      await learnerAPI.apply(job.id, text);
      setMessage('You applied for ' + job.title);
      setApplyingTo(null);
      setText('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not apply');
    }
  };

  return (
    <PageLayout title="Jobs and Internships" subtitle="Open positions from employers">
      {message && <div className="pg-message">{message}</div>}

      {jobs.length === 0 && <div className="pg-empty">No jobs yet.</div>}

      <div className="pg-grid">
        {jobs.map(job => (
          <div className="pg-item" key={job.id}>
            <span className="pg-badge">{job.type}</span>
            <h4>{job.title}</h4>
            <p><strong>{job.company}</strong> · {job.location}</p>
            <p>{job.description}</p>
            {job.skills && <p>Skills: {job.skills}</p>}
            {job.deadline && <p>Last day to apply: {job.deadline}</p>}
            {job.requiresCertificate && <p>🏆 You need at least one certificate to apply.</p>}

            {user?.role === 'student' && applyingTo !== job.id && (
              <div className="pg-buttons">
                <button className="pg-btn" onClick={() => setApplyingTo(job.id)}>Apply</button>
              </div>
            )}

            {applyingTo === job.id && (
              <div>
                <textarea
                  className="pg-textarea"
                  placeholder={'Write a short message to ' + job.company}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="pg-buttons">
                  <button className="pg-btn pg-btn-green" onClick={() => handleApply(job)}>Send application</button>
                  <button className="pg-btn pg-btn-light" onClick={() => setApplyingTo(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </PageLayout>
  );
};

export default Jobs;
