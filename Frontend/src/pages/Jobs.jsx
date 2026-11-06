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
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [onlyOpenToAll, setOnlyOpenToAll] = useState(false);
  const [appliedIds, setAppliedIds] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [sending, setSending] = useState(false);

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

    // the jobs this student already applied for
    if (user?.role === 'student') {
      try {
        const res = await learnerAPI.getApplications();
        setAppliedIds(res.data.data.map(a => a.internshipId));
      } catch (err) {
        setAppliedIds([]);
      }
    }
    setLoaded(true);
  };

  // jobs that match the search box and the filters
  const shownJobs = jobs.filter(job => {
    const words = search.trim().toLowerCase();
    const text = [job.title, job.company, job.location, job.skills, job.description].join(' ').toLowerCase();
    if (words && !text.includes(words)) return false;
    if (type !== 'all' && job.type !== type) return false;
    if (onlyOpenToAll && job.requiresCertificate) return false;
    return true;
  });

  const handleApply = async (job) => {
    setSending(true);
    try {
      await learnerAPI.apply(job.id, text);
      setMessage('You applied for ' + job.title);
      setAppliedIds([...appliedIds, job.id]);
      setApplyingTo(null);
      setText('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not apply');
    }
    setSending(false);
  };

  return (
    <PageLayout title="Jobs and Internships" subtitle="Open positions from employers">
      {message && <div className="pg-message">{message}</div>}

      <div className="pg-filters">
        <input className="pg-search" placeholder="Search by title, company, skill or place" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">All types</option>
          <option value="internship">Internships</option>
          <option value="job">Jobs</option>
        </select>
        <label>
          <input type="checkbox" checked={onlyOpenToAll} onChange={(e) => setOnlyOpenToAll(e.target.checked)} />
          {' '}No certificate needed
        </label>
      </div>

      {!loaded && <div className="pg-empty">Loading jobs...</div>}
      {loaded && jobs.length === 0 && <div className="pg-empty">No jobs yet.</div>}
      {jobs.length > 0 && shownJobs.length === 0 && <div className="pg-empty">No job matches your search.</div>}

      <div className="pg-grid">
        {shownJobs.map(job => (
          <div className="pg-item" key={job.id}>
            <span className="pg-badge">{job.type}</span>
            <h4>{job.title}</h4>
            <p><strong>{job.company}</strong> · {job.location}</p>
            <p>{job.description}</p>
            {job.skills && <p>Skills: {job.skills}</p>}
            {job.deadline && <p>Last day to apply: {job.deadline}</p>}
            {job.requiresCertificate && <p>🏆 You need at least one certificate to apply.</p>}

            {user?.role === 'student' && appliedIds.includes(job.id) && (
              <span className="pg-badge pg-badge-green">✔ You applied</span>
            )}

            {user?.role === 'student' && !appliedIds.includes(job.id) && applyingTo !== job.id && (
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
                  <button className="pg-btn pg-btn-green" onClick={() => handleApply(job)} disabled={sending}>{sending ? 'Sending...' : 'Send application'}</button>
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
