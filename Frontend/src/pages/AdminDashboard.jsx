import { useState, useEffect } from 'react';
import axios from 'axios';
import * as adminAPI from '../services/adminAPI';
import { API_URL } from '../config';
import '../styles/AdminDashboard.css';

// one item per line
const splitLines = (text) => text.split('\n').map(line => line.trim()).filter(line => line);

// lessons are written like this: the first line is the title, then the text. A blank line starts the next lesson.
const parseLessons = (text) => {
  return text.split(/\n\s*\n/).map(block => {
    const lines = block.trim().split('\n');
    return { title: lines[0].trim(), content: lines.slice(1).join(' ').trim() };
  }).filter(lesson => lesson.title);
};

const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [report, setReport] = useState(null);
  const [newTutorial, setNewTutorial] = useState({ title: '', description: '', category: '', content: '', projectBrief: '', lessonsText: '', rubricText: '', skillsText: '', level: 'beginner' });
  const [newInternship, setNewInternship] = useState({ title: '', description: '', company: '', duration: '' });

  // Helper: fetch all admin data in parallel
  const fetchAllData = async () => {
    const [statsRes, usersRes, tutorialsRes, internshipsRes, applicationsRes] = await Promise.all([
      adminAPI.getAdminStats(),
      adminAPI.getUsers(),
      adminAPI.getTutorials(),
      adminAPI.getInternships(),
      adminAPI.getApplications()
    ]);

    setStats(statsRes.data.data || {});
    setUsers(usersRes.data.data || []);
    setTutorials(tutorialsRes.data.data || []);
    setInternships(internshipsRes.data.data || []);
    setApplications(applicationsRes.data.data || []);
  };

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      await fetchAllData();
    } catch (err) {
      console.error('Failed to load data:', err);
      let msg = err?.response?.data?.message || err?.message || 'Failed to load admin data';
      if (msg === 'Network Error') msg = 'Network Error: cannot reach the server. Is the backend running?';
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
      loadData();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await axios.post(API_URL + '/auth/login', {
        email: loginEmail,
        password: loginPassword
      });

      const { token, user: userData } = response.data.data;
      if (userData.role !== 'admin') {
        setLoginError('This page is for admins only');
        return;
      }
      localStorage.setItem('adminToken', token);
      setUser(userData);
      setIsLoggedIn(true);
      setLoginEmail('');
      setLoginPassword('');
      loadData();
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed');
    }
  };

  // the report is loaded when its tab is opened
  useEffect(() => {
    if (activeTab !== 'report' || !isLoggedIn) return;
    const loadReport = async () => {
      try {
        const res = await adminAPI.getReport();
        setReport(res.data.data);
      } catch (err) {
        setLoadError(err.response?.data?.message || 'Could not load the report');
      }
    };
    loadReport();
  }, [activeTab, isLoggedIn]);

  // downloads the report as a CSV file for Excel
  const handleDownloadReport = async () => {
    try {
      const res = await adminAPI.getReportCsv();
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pilot-report.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not download the report');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setUser(null);
    setUsers([]);
    setTutorials([]);
    setInternships([]);
    setApplications([]);
    setStats(null);
  };

  const handleApprove = async (user) => {
    try {
      await adminAPI.approveUser(user.id, user.approved === false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not change approval');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteTutorial = async (id) => {
    if (!window.confirm('Delete this tutorial?')) return;
    try {
      await adminAPI.deleteTutorial(id);
      loadData();
    } catch (err) {
      alert('Failed to delete tutorial');
    }
  };

  const handleDeleteInternship = async (id) => {
    if (!window.confirm('Delete this internship?')) return;
    try {
      await adminAPI.deleteInternship(id);
      loadData();
    } catch (err) {
      alert('Failed to delete internship');
    }
  };

  const handleAddTutorial = async () => {
    if (!newTutorial.title || !newTutorial.description) {
      alert('Please fill all fields');
        return;
    }
      if (!newTutorial.category) {
        alert('Please select a category');
        return;
      }
      try {
        await adminAPI.createTutorial({
          ...newTutorial,
          lessons: parseLessons(newTutorial.lessonsText),
          rubric: splitLines(newTutorial.rubricText),
          skills: newTutorial.skillsText.split(',').map(x => x.trim()).filter(x => x)
        });
        setNewTutorial({ title: '', description: '', category: '', content: '', projectBrief: '', lessonsText: '', rubricText: '', skillsText: '', level: 'beginner' });
        await loadData();
        alert('Tutorial added successfully!');
      } catch (err) {
        const errorMsg = err?.response?.data?.message || err?.message || 'Failed to add tutorial';
        alert('Error: ' + errorMsg);
        console.error('Tutorial creation error:', err);
      }
  };

  const handleAddInternship = async () => {
    if (!newInternship.title || !newInternship.company) {
      alert('Please fill all fields');
        return;
    }
      if (!newInternship.description) {
        alert('Please provide a description');
        return;
      }
      try {
        await adminAPI.createInternship(newInternship);
        setNewInternship({ title: '', description: '', company: '', duration: '' });
        await loadData();
        alert('Internship added successfully!');
      } catch (err) {
        const errorMsg = err?.response?.data?.message || err?.message || 'Failed to add internship';
        alert('Error: ' + errorMsg);
        console.error('Internship creation error:', err);
      }
  };

  const handleUpdateApplicationStatus = async (id, newStatus) => {
    try {
      await adminAPI.updateApplicationStatus(id, { status: newStatus });
      loadData();
    } catch (err) {
      console.error('Failed to update application status:', err);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <h1>Admin Dashboard</h1>
          <p>Please login to continue</p>
          {loginError && <div className="error-message">{loginError}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@youthtech.com"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            
            <button type="submit" className="btn-login">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
          <p>Welcome to the control panel</p>
        </div>
        <div className="header-right">
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>
        <button className={activeTab === 'tutorials' ? 'active' : ''} onClick={() => setActiveTab('tutorials')}>Tutorials</button>
        <button className={activeTab === 'internships' ? 'active' : ''} onClick={() => setActiveTab('internships')}>Internships</button>
        <button className={activeTab === 'applications' ? 'active' : ''} onClick={() => setActiveTab('applications')}>Applications</button>
        <button className={activeTab === 'report' ? 'active' : ''} onClick={() => setActiveTab('report')}>Report</button>
      </div>

      <div className="admin-content">
        {loading && <div className="loading">Loading...</div>}

        {activeTab === 'dashboard' && !loading && (
          <div className="tab-content">
            <h2>Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card" onClick={() => setActiveTab('users')}>
                <div className="stat-value">{stats?.totalUsers || 0}</div>
                <div className="stat-label">Total Users →</div>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('tutorials')}>
                <div className="stat-value">{stats?.totalTutorials || 0}</div>
                <div className="stat-label">Tutorials →</div>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('internships')}>
                <div className="stat-value">{stats?.totalInternships || 0}</div>
                <div className="stat-label">Internships →</div>
              </div>
              <div className="stat-card" onClick={() => setActiveTab('applications')}>
                <div className="stat-value">{stats?.totalApplications || 0}</div>
                <div className="stat-label">Applications →</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && !loading && (
          <div className="tab-content">
            <h2>Users ({users.length})</h2>
            {loadError && (
              <div className="error-message" style={{ marginBottom: '12px' }}>
                {loadError}
                <button className="refresh-btn" style={{ marginLeft: '12px' }} onClick={() => loadData()}>Refresh</button>
              </div>
            )}

            {users.length === 0 ? (
              <p>No users found</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td><span className={`role-badge ${user.role || ''}`}>{user.role === 'mentor' ? 'FACILITATOR' : user.role === 'partner' ? 'EMPLOYER' : (user.role || '').toUpperCase()}</span></td>
                      <td><span className={`status ${user.isActive ? 'active' : 'inactive'}`}>{user.isActive ? 'Active' : 'Inactive'}</span>{user.approved === false && ' (waiting for approval)'}</td>
                      <td>
                        <div className="actions">
                          {(user.role === 'mentor' || user.role === 'partner') && (
                            <button className="refresh-btn" onClick={() => handleApprove(user)}>
                              {user.approved === false ? 'Approve' : 'Remove approval'}
                            </button>
                          )}
                          <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'tutorials' && !loading && (
          <div className="tab-content">
            <h2>Tutorials ({tutorials.length})</h2>
            <div className="form-section">
              <h3>Add New Tutorial</h3>
              <input type="text" placeholder="Title" value={newTutorial.title} onChange={(e) => setNewTutorial({...newTutorial, title: e.target.value})} className="form-input" />
              <textarea placeholder="Description" value={newTutorial.description} onChange={(e) => setNewTutorial({...newTutorial, description: e.target.value})} className="form-input" />
              <textarea placeholder="Lesson content" value={newTutorial.content} onChange={(e) => setNewTutorial({...newTutorial, content: e.target.value})} className="form-input" />
              <textarea placeholder={"Lessons. First line = lesson title, next lines = the text.\nLeave a blank line between lessons."} value={newTutorial.lessonsText} onChange={(e) => setNewTutorial({...newTutorial, lessonsText: e.target.value})} className="form-input" rows="6" />
              <textarea placeholder="Project the student must do (the facilitator will check it)" value={newTutorial.projectBrief} onChange={(e) => setNewTutorial({...newTutorial, projectBrief: e.target.value})} className="form-input" />
              <textarea placeholder="Checklist for the facilitator (one point per line)" value={newTutorial.rubricText} onChange={(e) => setNewTutorial({...newTutorial, rubricText: e.target.value})} className="form-input" />
              <input type="text" placeholder="Skills the certificate shows (separate with commas)" value={newTutorial.skillsText} onChange={(e) => setNewTutorial({...newTutorial, skillsText: e.target.value})} className="form-input" />
              <input type="text" placeholder="Category" value={newTutorial.category} onChange={(e) => setNewTutorial({...newTutorial, category: e.target.value})} className="form-input" />
              <select value={newTutorial.level} onChange={(e) => setNewTutorial({...newTutorial, level: e.target.value})} className="form-input">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button onClick={handleAddTutorial} className="submit-btn">Add Tutorial</button>
            </div>
            {tutorials.length === 0 ? (
              <p>No tutorials found</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Level</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tutorials.map((tutorial) => (
                    <tr key={tutorial.id}>
                      <td>{tutorial.title}</td>
                      <td>{tutorial.category}</td>
                      <td>{tutorial.level}</td>
                      <td>
                        <button className="delete-btn" onClick={() => handleDeleteTutorial(tutorial.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'internships' && !loading && (
          <div className="tab-content">
            <h2>Internships ({internships.length})</h2>
            <div className="form-section">
              <h3>Add New Internship</h3>
              <input type="text" placeholder="Title" value={newInternship.title} onChange={(e) => setNewInternship({...newInternship, title: e.target.value})} className="form-input" />
              <input type="text" placeholder="Company" value={newInternship.company} onChange={(e) => setNewInternship({...newInternship, company: e.target.value})} className="form-input" />
              <textarea placeholder="Description" value={newInternship.description} onChange={(e) => setNewInternship({...newInternship, description: e.target.value})} className="form-input" />
              <input type="text" placeholder="Duration" value={newInternship.duration} onChange={(e) => setNewInternship({...newInternship, duration: e.target.value})} className="form-input" />
              <button onClick={handleAddInternship} className="submit-btn">Add Internship</button>
            </div>
            {internships.length === 0 ? (
              <p>No internships found</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Duration</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {internships.map((internship) => (
                    <tr key={internship.id}>
                      <td>{internship.title}</td>
                      <td>{internship.company}</td>
                      <td>{internship.duration}</td>
                      <td>
                        <button className="delete-btn" onClick={() => handleDeleteInternship(internship.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'applications' && !loading && (
          <div className="tab-content">
            <h2>Applications ({applications.length})</h2>
            {applications.length === 0 ? (
              <p>No applications found</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Learner</th>
                    <th>Job</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td>{app.learnerName || app.userId}</td>
                      <td>{(internships.find(job => job.id === app.internshipId) || {}).title || '-'}</td>
                      <td>{app.status}</td>
                      <td>
                        <select value={app.status} onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)} className="status-select">
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'report' && (
          <div className="tab-content">
            <h2>Pilot report</h2>
            {!report ? (
              <p>Loading the report...</p>
            ) : (
              <div>
                <p>Numbers made on {new Date(report.generatedAt).toLocaleString()}</p>
                <button className="refresh-btn" onClick={handleDownloadReport}>Download as CSV (Excel)</button>

                <h3 style={{ marginTop: '24px' }}>People</h3>
                <div className="stats-grid">
                  <div className="stat-card"><div className="stat-value">{report.people.learners}</div><div className="stat-label">Learners</div></div>
                  <div className="stat-card"><div className="stat-value">{report.people.learnersWhoSentAProject}</div><div className="stat-label">Sent a project</div></div>
                  <div className="stat-card"><div className="stat-value">{report.people.learnersWithCertificate}</div><div className="stat-label">Have a certificate</div></div>
                  <div className="stat-card"><div className="stat-value">{report.people.facilitators}</div><div className="stat-label">Facilitators</div></div>
                  <div className="stat-card"><div className="stat-value">{report.people.employers}</div><div className="stat-label">Employers</div></div>
                </div>

                <h3>Projects and certificates</h3>
                <div className="stats-grid">
                  <div className="stat-card"><div className="stat-value">{report.projects.sent}</div><div className="stat-label">Projects sent</div></div>
                  <div className="stat-card"><div className="stat-value">{report.projects.approved}</div><div className="stat-label">Approved</div></div>
                  <div className="stat-card"><div className="stat-value">{report.projects.approvalRatePercent}%</div><div className="stat-label">Approval rate</div></div>
                  <div className="stat-card"><div className="stat-value">{report.projects.averageDaysToCheck}</div><div className="stat-label">Days to check (average)</div></div>
                  <div className="stat-card"><div className="stat-value">{report.certificatesIssued}</div><div className="stat-label">Certificates</div></div>
                </div>

                <h3>Jobs</h3>
                <div className="stats-grid">
                  <div className="stat-card"><div className="stat-value">{report.jobs.posted}</div><div className="stat-label">Jobs posted</div></div>
                  <div className="stat-card"><div className="stat-value">{report.jobs.applications}</div><div className="stat-label">Applications</div></div>
                  <div className="stat-card"><div className="stat-value">{report.jobs.applicantsWithCertificate}</div><div className="stat-label">Applicants with a certificate</div></div>
                  <div className="stat-card"><div className="stat-value">{report.jobs.accepted}</div><div className="stat-label">Accepted by employers</div></div>
                  <div className="stat-card"><div className="stat-value">{report.jobs.acceptedPercent}%</div><div className="stat-label">Accepted rate</div></div>
                </div>

                <h3>Mentoring</h3>
                <p>{report.mentoring.requests} requests: {report.mentoring.accepted} accepted, {report.mentoring.declined} declined, {report.mentoring.waiting} waiting.</p>

                <h3>Learning paths</h3>
                <table className="admin-table">
                  <thead>
                    <tr><th>Path</th><th>Sent</th><th>Approved</th><th>Sent back</th><th>Waiting</th><th>Certificates</th></tr>
                  </thead>
                  <tbody>
                    {report.paths.map(p => (
                      <tr key={p.title}>
                        <td>{p.title}</td><td>{p.sent}</td><td>{p.approved}</td><td>{p.sentBack}</td><td>{p.waiting}</td><td>{p.certificates}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h3 style={{ marginTop: '24px' }}>Jobs</h3>
                {report.jobList.length === 0 ? <p>No jobs yet.</p> : (
                  <table className="admin-table">
                    <thead>
                      <tr><th>Job</th><th>Company</th><th>Applications</th><th>Accepted</th></tr>
                    </thead>
                    <tbody>
                      {report.jobList.map((j, i) => (
                        <tr key={i}><td>{j.title}</td><td>{j.company}</td><td>{j.applications}</td><td>{j.accepted}</td></tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <h3 style={{ marginTop: '24px' }}>Last weeks</h3>
                {report.weeks.length === 0 ? <p>No activity yet.</p> : (
                  <table className="admin-table">
                    <thead>
                      <tr><th>Week starting</th><th>New learners</th><th>Projects sent</th><th>Certificates</th><th>Applications</th></tr>
                    </thead>
                    <tbody>
                      {report.weeks.map(w => (
                        <tr key={w.week}><td>{w.week}</td><td>{w.newLearners}</td><td>{w.projectsSent}</td><td>{w.certificates}</td><td>{w.applications}</td></tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
