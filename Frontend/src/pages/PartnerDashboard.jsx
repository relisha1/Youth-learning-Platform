import { useState, useEffect } from 'react';
import { partnerAPI } from '../services/api';
import PageLayout from '../components/PageLayout';

// page for employers: post jobs, see applicants, see certified learners
const PartnerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [openJob, setOpenJob] = useState(null);
  const [allApps, setAllApps] = useState([]);
  const [search, setSearch] = useState('');
  const [posting, setPosting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [learners, setLearners] = useState([]);
  const [message, setMessage] = useState('');
  const emptyJob = { title: '', description: '', location: '', type: 'internship', skills: '', deadline: '', requiresCertificate: false };
  const [form, setForm] = useState(emptyJob);
  const [profile, setProfile] = useState({ companyName: '', website: '', about: '' });

  useEffect(() => {
    loadProfile();
    loadJobs();
    loadLearners();
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const res = await partnerAPI.getAllApplications();
      setAllApps(res.data.data);
    } catch (err) {
      setMessage('Could not load applications');
    }
    setLoaded(true);
  };

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
    setPosting(true);
    try {
      await partnerAPI.postJob(form);
      setForm(emptyJob);
      setMessage('Job posted');
      loadJobs();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not post the job');
    }
    setPosting(false);
    window.scrollTo(0, 0);
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

  // write a short message to a learner (they get a notification with my email)
  const handleContact = async (learner) => {
    const text = window.prompt('Write a short message to ' + learner.name);
    if (!text) return;
    try {
      const res = await partnerAPI.contactLearner(learner.id, text);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not send the message');
    }
  };

  // learners that match the search (name, skill or path)
  const shownLearners = learners.filter(l => {
    const words = search.trim().toLowerCase();
    if (!words) return true;
    const text = [l.name, l.skills.join(' '), l.certificates.map(c => c.tutorialTitle + ' ' + c.pathName).join(' ')].join(' ').toLowerCase();
    return text.includes(words);
  });

  const handleStatus = async (application, status) => {
    await partnerAPI.setStatus(application.id, status);
    loadApplications();
    if (openJob) showApplicants(openJob);
  };

  return (
    <PageLayout title="Employer Page" subtitle="Post jobs, read applications and find certified learners">
      {message && <div className="pg-message">{message}</div>}

      <h3 className="pg-section-title">Applications ({allApps.filter(a => a.status === 'pending').length} waiting)</h3>
      {!loaded && <div className="pg-empty">Loading...</div>}
      {loaded && allApps.length === 0 && <div className="pg-empty">No one has applied to your jobs yet. When a learner applies, it shows here.</div>}
      <div className="pg-grid">
        {allApps.map(a => (
          <div className="pg-item" key={a.id}>
            <h4>{a.learnerName}</h4>
            <p>Applied for: {a.jobTitle}</p>
            <span className={(a.status === 'accepted' || a.status === 'hired') ? 'pg-badge pg-badge-green' : a.status === 'rejected' ? 'pg-badge pg-badge-red' : 'pg-badge pg-badge-yellow'}>{a.status}</span>
            <p>{a.message}</p>
            <p>🏆 {a.certificates.length === 0 ? 'No certificates' : a.certificates.map(c => c.tutorialTitle + ' (' + c.code + ')').join(', ')}</p>
            <div className="pg-buttons">
              <button className="pg-btn pg-btn-green" onClick={() => handleStatus(a, 'accepted')}>Accept</button>
              <button className="pg-btn" onClick={() => handleStatus(a, 'hired')}>Mark as hired</button>
              <button className="pg-btn pg-btn-red" onClick={() => handleStatus(a, 'rejected')}>Reject</button>
            </div>
          </div>
        ))}
      </div>

      <div className="pg-two">
      <div className="pg-card">
        <h3>Your company</h3>
        <p className="pg-muted">This is shown on your jobs. Fill it before you post.</p>
        <form onSubmit={handleSaveProfile} className="pg-form">
          <input name="companyName" placeholder="Company name" value={profile.companyName} onChange={handleProfileChange} />
          <input name="website" placeholder="Website" value={profile.website} onChange={handleProfileChange} />
          <textarea name="about" placeholder="What does your company do?" value={profile.about} onChange={handleProfileChange} />
          <div><button className="pg-btn" type="submit">Save company info</button></div>
        </form>
      </div>

      <div className="pg-card">
        <h3>Post a job</h3>
        <form onSubmit={handlePost} className="pg-form">
          <input name="title" placeholder="Job title" value={form.title} onChange={handleChange} />
          <input name="location" placeholder="Location (default Kigali)" value={form.location} onChange={handleChange} />
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="internship">Internship</option>
            <option value="job">Job</option>
          </select>
          <input name="skills" placeholder="Skills you want (example: JavaScript, Python)" value={form.skills} onChange={handleChange} />
          <label>
            Last day to apply:
            <input type="date" name="deadline" value={form.deadline} onChange={handleChange} />
          </label>
          <label>
            <input type="checkbox" name="requiresCertificate" checked={form.requiresCertificate} onChange={handleChange} />
            Only learners with a certificate can apply
          </label>
          <textarea name="description" placeholder="What is the job about?" value={form.description} onChange={handleChange} />
          <div><button className="pg-btn" type="submit" disabled={posting}>{posting ? 'Posting...' : 'Post job'}</button></div>
        </form>
      </div>
      </div>

      <h3 className="pg-section-title">My jobs</h3>
      {jobs.length === 0 && <div className="pg-empty">You have not posted any job yet.</div>}
      <div className="pg-grid">
        {jobs.map(job => (
          <div className="pg-item" key={job.id}>
            <span className={job.status === 'open' ? 'pg-badge pg-badge-green' : 'pg-badge pg-badge-red'}>{job.status}</span>
            <h4>{job.title}</h4>
            <p>{job.applicants} applicants{job.deadline && ' · last day ' + job.deadline}</p>
            <div className="pg-buttons">
              <button className="pg-btn" onClick={() => showApplicants(job)}>See applicants</button>
              <button className="pg-btn pg-btn-light" onClick={() => handleClose(job)}>{job.status === 'open' ? 'Close' : 'Open again'}</button>
              <button className="pg-btn pg-btn-red" onClick={() => handleDelete(job)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {openJob && (
        <div>
          <h3 className="pg-section-title">Applicants for {openJob.title}</h3>
          {applicants.length === 0 && <div className="pg-empty">No applicants yet.</div>}
          <div className="pg-grid">
            {applicants.map(a => (
              <div className="pg-item" key={a.id}>
                <h4>{a.learnerName}</h4>
                <span className={(a.status === 'accepted' || a.status === 'hired') ? 'pg-badge pg-badge-green' : a.status === 'rejected' ? 'pg-badge pg-badge-red' : 'pg-badge pg-badge-yellow'}>{a.status}</span>
                <p>{a.message}</p>
                <p>🏆 {a.certificates.length === 0 ? 'No certificates' : a.certificates.map(c => c.tutorialTitle + ' (' + c.code + ')').join(', ')}</p>
                <div className="pg-buttons">
                  <button className="pg-btn pg-btn-green" onClick={() => handleStatus(a, 'accepted')}>Accept</button>
                  <button className="pg-btn" onClick={() => handleStatus(a, 'hired')}>Mark as hired</button>
                  <button className="pg-btn pg-btn-red" onClick={() => handleStatus(a, 'rejected')}>Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 className="pg-section-title">Learners with certificates</h3>
      <p className="pg-muted">Every certificate here was given by a facilitator after checking a real project. You can also check any code on the <a href="/verify">Verify page</a>.</p>
      <input className="pg-search" placeholder="Search by name, skill or path (example: C, Python)" value={search} onChange={(e) => setSearch(e.target.value)} />
      {learners.length === 0 && <div className="pg-empty">No learner has a certificate yet.</div>}
      {learners.length > 0 && shownLearners.length === 0 && <div className="pg-empty">No learner matches your search.</div>}
      <div className="pg-grid">
        {shownLearners.map(l => (
          <div className="pg-item" key={l.id}>
            <h4>{l.name}</h4>
            {l.bio && <p>{l.bio}</p>}
            {l.skills.length > 0 && <p>Skills: {l.skills.join(', ')}</p>}
            {l.certificates.map(c => (
              <p key={c.code}>
                🏆 {c.tutorialTitle} ({c.code})
                {c.projectLink && <> · <a href={c.projectLink} target="_blank" rel="noreferrer">see project</a></>}
              </p>
            ))}
            <div className="pg-buttons">
              <button className="pg-btn" onClick={() => handleContact(l)}>Contact</button>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
};

export default PartnerDashboard;
