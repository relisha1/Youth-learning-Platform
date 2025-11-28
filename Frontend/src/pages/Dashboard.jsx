import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <h3>0</h3>
              <p>Courses Enrolled</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <h3>0%</h3>
              <p>Progress</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-info">
              <h3>0h</h3>
              <p>Learning Time</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <h3>0</h3>
              <p>Certificates</p>
            </div>
          </div>
        </div>

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
                  <h4>Internships</h4>
                  <p>Apply for tech internships</p>
                  <button className="btn-feature">Coming Soon</button>
                </div>

                <div className="feature-box">
                  <div className="feature-icon-large">📊</div>
                  <h4>My Progress</h4>
                  <p>Track your learning journey</p>
                  <button className="btn-feature">Coming Soon</button>
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
                  <h4>Post Internship</h4>
                  <p>Create new internship opportunities</p>
                  <button className="btn-feature">Coming Soon</button>
                </div>

                <div className="feature-box">
                  <div className="feature-icon-large">📋</div>
                  <h4>Applications</h4>
                  <p>Review student applications</p>
                  <button className="btn-feature">Coming Soon</button>
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
