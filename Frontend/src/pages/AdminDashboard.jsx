import { useState, useEffect } from 'react';
import axios from 'axios';
import * as adminAPI from '../services/adminAPI';
import '../styles/AdminDashboard.css';

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
  const [newTutorial, setNewTutorial] = useState({ title: '', description: '', category: '', level: 'beginner' });
  const [newInternship, setNewInternship] = useState({ title: '', description: '', company: '', duration: '' });

  // Helper: fetch dev token from backend (dev-only)
  const fetchDevToken = async () => {
    if (!(import.meta.env && import.meta.env.DEV)) return null;
    try {
      const resp = await axios.get('http://localhost:5000/dev/admin-token');
      const token = resp?.data?.data?.token;
      const devUser = resp?.data?.data?.user || null;
      if (token) {
        localStorage.setItem('token', token);
        setIsLoggedIn(true);
        if (devUser) setUser(devUser);
        return token;
      }
      return null;
    } catch (err) {
      console.debug('Dev token fetch failed', err?.message);
      return null;
    }
  };

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

  // loadData with a single retry using dev token on 401/403 (dev only)
  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      await fetchAllData();
    } catch (err) {
      console.error('Failed to load data:', err);
      const status = err?.response?.status;
      // If unauthorized or forbidden in dev, try to fetch a fresh dev token once and retry
      if ((status === 401 || status === 403) && import.meta.env && import.meta.env.DEV) {
        const token = await fetchDevToken();
        if (token) {
          try {
            await fetchAllData();
            setLoadError('');
            return;
          } catch (err2) {
            console.error('Retry after dev-token failed:', err2);
            setLoadError(err2?.response?.data?.message || err2?.message || 'Failed to load admin data after retry');
            return;
          }
        }
      }

      setLoadError(err?.response?.data?.message || err?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      loadData();
      return;
    }

    // In development, if no token present, fetch a dev admin token from backend to make testing easier
    if (import.meta.env && import.meta.env.DEV) {
      (async () => {
        const token = await fetchDevToken();
        if (token) {
          // small delay to allow auth header to be picked up by adminAPI
          setTimeout(() => loadData(), 100);
        }
      })();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: loginEmail,
        password: loginPassword
      });

      const { token, user: userData } = response.data.data;
      localStorage.setItem('token', token);
      setUser(userData);
      setIsLoggedIn(true);
      setLoginEmail('');
      setLoginPassword('');
      loadData();
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setUsers([]);
    setTutorials([]);
    setInternships([]);
    setApplications([]);
    setStats(null);
  };

  const fetchDevTokenAndReload = async () => {
    const token = await fetchDevToken();
    if (token) {
      await loadData();
    } else {
      setLoadError('Failed to fetch dev admin token');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      loadData();
    } catch (err) {
      alert('Failed to delete user');
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
    try {
      await adminAPI.createTutorial(newTutorial);
      setNewTutorial({ title: '', description: '', category: '', level: 'beginner' });
      loadData();
    } catch (err) {
      alert('Failed to add tutorial');
    }
  };

  const handleAddInternship = async () => {
    if (!newInternship.title || !newInternship.company) {
      alert('Please fill all fields');
      return;
    }
    try {
      await adminAPI.createInternship(newInternship);
      setNewInternship({ title: '', description: '', company: '', duration: '' });
      loadData();
    } catch (err) {
      alert('Failed to add internship');
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
      </div>

      <div className="admin-content">
        {loading && <div className="loading">Loading...</div>}

        {activeTab === 'dashboard' && !loading && (
          <div className="tab-content">
            <h2>Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats?.totalUsers || 0}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats?.totalTutorials || 0}</div>
                <div className="stat-label">Tutorials</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats?.totalInternships || 0}</div>
                <div className="stat-label">Internships</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats?.totalApplications || 0}</div>
                <div className="stat-label">Applications</div>
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
                {import.meta.env && import.meta.env.DEV && (
                  <button className="refresh-btn" style={{ marginLeft: '12px' }} onClick={() => fetchDevTokenAndReload()}>Use Dev Admin Token</button>
                )}
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
                      <td><span className={`role-badge ${user.role || ''}`}>{(user.role || '').toUpperCase()}</span></td>
                      <td><span className={`status ${user.isActive ? 'active' : 'inactive'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div className="actions">
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
                    <th>User</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td>{app.userId}</td>
                      <td>{app.type}</td>
                      <td>{app.status}</td>
                      <td>
                        <select value={app.status} onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)} className="status-select">
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
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
      </div>
    </div>
  );
};

export default AdminDashboard;
