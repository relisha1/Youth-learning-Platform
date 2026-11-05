import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { partnerAPI } from '../services/api';
import '../styles/Pages.css';

// page for employers: post jobs, see applicants, see certified learners
const PartnerDashboard = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [openJob, setOpenJob] = useState(null);
  const [learners, setLearners] = useState([]);
  const [message, setMessage] = useState('');
  const emptyJob = { title: '', description: '', location: '', type: 'internship', skills: '', deadline: '', requiresCertificate: false };
  const [form, setForm] = useState(emptyJob);
  const [profile, setProfile] = useState({ companyName: '', website: '', about: '' });

  useEffect(() => {
    loadProfile();
    loadJobs();
    loadLearners();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await partnerAPI.getProfile();
      setProfile(res.data.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not load your company info');
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await partnerAPI.saveProfile(profile);
      setMessage('Company info saved');
    } catch (err) {
      setMessage('Could not save company info');
    }
  };

  const loadJobs = async () => {
    try {
      const res = await partnerAPI.getJobs();
      setJobs(res.data.data);
    } catch (err) {
      setMessage('Could not load your jobs');
    }
  };

  const loadLearners = async () => {
    try {
      const res = await partnerAPI.getLearners();
      setLearners(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      await partnerAPI.postJob(form);
      setForm(emptyJob);
      setMessage('Job posted');
      loadJobs();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not post the job');
    }
  };

  const handleClose = async (job) => {
    await partnerAPI.updateJob(job.id, { status: job.status === 'open' ? 'closed' : 'open' });
    loadJobs();
  };

  const handleDelete = async (job) => {
    if (!window.confirm('Delete this job?')) return;
    await partnerAPI.deleteJob(job.id);
    loadJobs();
  };

  const showApplicants = async (job) => {
    const res = await partnerAPI.getApplicants(job.id);
    setApplicants(res.data.data);
    setOpenJob(job);
  };

  const handleStatus = async (application, status) => {
    await partnerAPI.setStatus(application.id, status);
    showApplicants(openJob);
  };

  return (
    <div className="simple-page">
      <button onClick={() => navigate('/dashboard')}>← Back</button>
      <h1>Employer Page</h1>
      {message && <p className="note">{message}</p>}

      <h2>Your company</h2>
      <p>This is shown on your jobs. It must be filled before you post.</p>
      <form onSubmit={handleSaveProfile} className="simple-form">
        <input name="companyName" placeholder="Company name" value={profile.companyName} onChange={handleProfileChange} />
        <input name="website" placeholder="Website" value={profile.website} onChange={handleProfileChange} />
        <textarea name="about" placeholder="What does your company do?" value={profile.about} onChange={handleProfileChange} />
        <button type="submit">Save company info</button>
      </form>

      <h2>Post a job</h2>
      <form onSubmit={handlePost} className="simple-form">
        <input name="title" placeholder="Job title" value={form.title} onChange={handleChange} />
        <input name="location" placeholder="Location (default Kigali)" value={form.location} onChange={handleChange} />
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="internship">Internship</option>
          <option value="job">Job</option>
        </select>
        <input name="skills" placeholder="Skills you want (example: JavaScript, Python)" value={form.skills} onChange={handleChange} />
        <label>
          Last day to apply: <input type="date" name="deadline" value={form.deadline} onChange={handleChange} />
        </label>
        <label>
          <input type="checkbox" name="requiresCertificate" checked={form.requiresCertificate} onChange={handleChange} />
          {' '}Only learners with a certificate can apply
        </label>
        <textarea name="description" placeholder="What is the job about?" value={form.description} onChange={handleChange} />
        <button type="submit">Post job</button>
      </form>

      <h2>My jobs</h2>
      {jobs.length === 0 && <p>You have not posted any job yet.</p>}
      {jobs.map(job => (
        <div className="simple-card" key={job.id}>
          <h3>{job.title} ({job.status})</h3>
          <p>{job.applicants} applicants{job.deadline && ' · last day ' + job.deadline}</p>
          <button onClick={() => showApplicants(job)}>See applicants</button>{' '}
          <button onClick={() => handleClose(job)}>{job.status === 'open' ? 'Close' : 'Open again'}</button>{' '}
          <button onClick={() => handleDelete(job)}>Delete</button>
        </div>
      ))}

      {openJob && (
        <div>
          <h2>Applicants for {openJob.title}</h2>
          {applicants.length === 0 && <p>No applicants yet.</p>}
          {applicants.map(a => (
            <div className="simple-card" key={a.id}>
              <h3>{a.learnerName} ({a.status})</h3>
              <p>{a.message}</p>
              <p>Certificates: {a.certificates.length === 0 ? 'none' : a.certificates.map(c => c.tutorialTitle + ' (' + c.code + ')').join(', ')}</p>
              <button onClick={() => handleStatus(a, 'accepted')}>Accept</button>{' '}
              <button onClick={() => handleStatus(a, 'rejected')}>Reject</button>
            </div>
          ))}
        </div>
      )}

      <h2>Learners with certificates</h2>
      <p>You can check any code on the <a href="/verify">Verify page</a>.</p>
      {learners.length === 0 && <p>No learner has a certificate yet.</p>}
      {learners.map(l => (
        <div className="simple-card" key={l.id}>
          <h3>{l.name}</h3>
          <p>{l.certificates.map(c => c.tutorialTitle + ' (' + c.code + ')').join(', ')}</p>
        </div>
      ))}
    </div>
  );
};

export default PartnerDashboard;
