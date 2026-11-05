import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicAPI, learnerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Pages.css';

// list of open jobs, students can apply
const Jobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await publicAPI.getJobs();
        setJobs(res.data.data.filter(job => job.status !== 'closed'));
      } catch (err) {
        setMessage('Could not load jobs');
      }
    };
    loadJobs();
  }, []);

  const handleApply = async (job) => {
    const text = window.prompt('Write a short message to ' + job.company);
    if (text === null) return;
    try {
      await learnerAPI.apply(job.id, text);
      setMessage('You applied for ' + job.title);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not apply');
    }
  };

  return (
    <div className="simple-page">
      <button onClick={() => navigate('/dashboard')}>← Back</button>
      <h1>Jobs and Internships</h1>
      {message && <p className="note">{message}</p>}

      {jobs.length === 0 && <p>No jobs yet.</p>}

      {jobs.map(job => (
        <div className="simple-card" key={job.id}>
          <h3>{job.title}</h3>
          <p><strong>{job.company}</strong> · {job.location} · {job.type}</p>
          <p>{job.description}</p>
          {user?.role === 'student' && (
            <button onClick={() => handleApply(job)}>Apply</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default Jobs;
