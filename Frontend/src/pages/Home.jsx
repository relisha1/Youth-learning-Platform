import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);

  // real numbers from the database
  useEffect(() => {
    publicAPI.getStats().then(res => setStats(res.data.data)).catch(() => setStats(null));
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Youth Tech Hub</h1>
          <p className="tagline">
            Empowering Rwandan Youth Through Technology Education
          </p>
          <p className="description">
            Learn to code, connect with mentors, and launch your tech career with 
            hands-on training, expert guidance, and real internship opportunities.
          </p>
          
          {!isAuthenticated ? (
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary">
                Get Started Free
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
            </div>
          ) : (
            <div className="cta-buttons">
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>What We Offer</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Coding Tutorials</h3>
            <p>
              Learn programming from scratch with step by step lessons. Every path ends
              with a project that a facilitator checks before you get your certificate.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👨‍🏫</div>
            <h3>Expert Mentorship</h3>
            <p>
              Get paired with experienced tech professionals who will guide your 
              learning journey and help you build real-world projects.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Internship Opportunities</h3>
            <p>
              Access exclusive internship postings from top companies in Rwanda 
              and gain hands-on experience in the tech industry.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Earn Certificates</h3>
            <p>
              Complete courses and earn certificates to showcase your skills to 
              potential employers and boost your career prospects.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section - only shown when the numbers load */}
      {stats && (
        <section className="stats">
          <div className="stat">
            <h3>{stats.learners}</h3>
            <p>Learners</p>
          </div>
          <div className="stat">
            <h3>{stats.facilitators}</h3>
            <p>Facilitators</p>
          </div>
          <div className="stat">
            <h3>{stats.certificates}</h3>
            <p>Certificates issued</p>
          </div>
          <div className="stat">
            <h3>{stats.openJobs}</h3>
            <p>Open jobs</p>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Start Your Tech Journey?</h2>
        <p>Learn, build a project, get a certificate employers can trust</p>
        {!isAuthenticated && (
          <Link to="/register" className="btn btn-primary btn-large">
            Get Started Now
          </Link>
        )}
      </section>

      <footer className="home-footer">
        <Link to="/verify">Verify a certificate</Link>
        <Link to="/admin">Admin</Link>
      </footer>
    </div>
  );
};

export default Home;
