import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { learnerAPI, publicAPI } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [finished, setFinished] = useState(0);
  const [totalTutorials, setTotalTutorials] = useState(0);
  const [certCount, setCertCount] = useState(0);
  const [appCount, setAppCount] = useState(0);

  // get the numbers for the student stats
  useEffect(() => {
    if (user?.role !== 'student') return;
    const loadStats = async () => {
      try {
        const progress = await learnerAPI.getProgress();
        const certs = await learnerAPI.getCertificates();
        const apps = await learnerAPI.getApplications();
        const all = await publicAPI.getTutorials();
        setFinished(progress.data.data.length);
        setCertCount(certs.data.data.length);
        setAppCount(apps.data.data.length);
        setTotalTutorials(all.data.data.length);
      } catch (err) {
        console.error(err);
      }
    };
    loadStats();
  }, [user]);

  const percent = totalTutorials > 0 ? Math.round((finished / totalTutorials) * 100) : 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBrowseTutorials = () => {
    navigate('/tutorials');
  };

  const getRoleDisplay = (role) => {
    const roles = {
      student: 'Student',
      mentor: 'Mentor',
      admin: 'Administrator',
      partner: 'Internship Partner'
    };
    return roles[role] || role;
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Youth Tech Hub</h1>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h2>Welcome back, {user?.name}! 👋</h2>
          <p className="user-role">Role: {getRoleDisplay(user?.role)}</p>
        </section>

        {/* Quick Stats */}
        {user?.role === 'student' && (
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <h3>{finished}</h3>
              <p>Tutorials Finished</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <h3>{percent}%</h3>
              <p>Progress</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-info">
              <h3>{appCount}</h3>
              <p>Jobs Applied</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <h3>{certCount}</h3>
              <p>Certificates</p>
            </div>
          </div>
        </div>
        )}

        {/* Features Grid */}
        <div className="features-section">
          <h3>What would you like to do?</h3>
          
          <div className="feature-grid">
            {user?.role === 'student' && (
              <>
                <div className="feature-box">
                  <div className="feature-icon-large">📖</div>
                  <h4>Browse Tutorials</h4>
                  <p>Start learning with our coding tutorials</p>
                  <button className="btn-feature" onClick={handleBrowseTutorials}>Browse Now</button>
                </div>

                <div className="feature-box">
                  <div className="feature-icon-large">👨‍🏫</div>
                  <h4>Find a Mentor</h4>
                  <p>Connect with expert mentors</p>
                  <button className="btn-feature">Coming Soon</button>
                </div>

                <div className="feature-box">
                  <div className="feature-icon-large">💼</div>
                  <h4>Jobs</h4>
                  <p>Look at jobs from employers and apply</p>
                  <button className="btn-feature" onClick={() => navigate('/jobs')}>See Jobs</button>
                </div>

                <div className="feature-box">
                  <div className="feature-icon-large">📊</div>
                  <h4>My Certificates</h4>
                  <p>See your certificates and your applications</p>
                  <button className="btn-feature" onClick={() => navigate('/my-certificates')}>Open</button>
                </div>
              </>
            )}

            {user?.role === 'mentor' && (
              <>
                <div className="feature-box">
                  <div className="feature-icon-large">👥</div>
                  <h4>My Students</h4>
                  <p>View and manage your mentees</p>
                  <button className="btn-feature">Coming Soon</button>
                </div>

                <div className="feature-box">
                  <div className="feature-icon-large">📝</div>
                  <h4>Feedback</h4>
                  <p>Provide feedback to students</p>
                  <button className="btn-feature">Coming Soon</button>
                </div>
              </>
            )}

            {user?.role === 'partner' && (
              <>
                <div className="feature-box">
                  <div className="feature-icon-large">📢</div>
                  <h4>Post a Job</h4>
                  <p>Post jobs and read applications from certified learners</p>
                  <button className="btn-feature" onClick={() => navigate('/partner')}>Open</button>
                </div>

                <div className="feature-box">
                  <div className="feature-icon-large">📋</div>
                  <h4>Check a Certificate</h4>
                  <p>Make sure a certificate code is real</p>
                  <button className="btn-feature" onClick={() => navigate('/verify')}>Check</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="user-info-section">
          <h3>Your Profile</h3>
          <div className="user-info-card">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Phone:</strong> {user?.phone || 'Not provided'}</p>
            <p><strong>Language:</strong> {user?.language === 'en' ? 'English' : 'Kinyarwanda'}</p>
            <p><strong>Member since:</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
