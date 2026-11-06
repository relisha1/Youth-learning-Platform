import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import '../styles/Pages.css';

// same header as the dashboard, used by the jobs, certificate, employer and facilitator pages
const PageLayout = ({ title, subtitle, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="pg">
      <header className="pg-header">
        <div className="pg-header-content">
          <h1>Youth Tech Hub</h1>
          <div className="pg-header-buttons">
            {user ? (
              <>
                <NotificationBell />
                <button className="pg-header-btn" onClick={() => navigate('/dashboard')}>← Dashboard</button>
                <button className="pg-header-btn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link className="pg-header-btn" to="/">Home</Link>
                <Link className="pg-header-btn" to="/login">Login</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pg-main">
        <section className="pg-title-card">
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </section>
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
