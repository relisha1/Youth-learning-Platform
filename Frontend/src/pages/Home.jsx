import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

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
              Learn programming from scratch with our comprehensive tutorials in 
              English and Kinyarwanda. From HTML to React, we've got you covered!
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

      {/* Stats Section */}
      <section className="stats">
        <div className="stat">
          <h3>500+</h3>
          <p>Students Enrolled</p>
        </div>
        <div className="stat">
          <h3>50+</h3>
          <p>Expert Mentors</p>
        </div>
        <div className="stat">
          <h3>100+</h3>
          <p>Internships Posted</p>
        </div>
        <div className="stat">
          <h3>85%</h3>
          <p>Placement Rate</p>
        </div>
      </section>

      {/* Admin Link Section */}
      <section className="admin-link-section">
        <Link to="/admin" className="admin-link">
          Admin Panel →
        </Link>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Start Your Tech Journey?</h2>
        <p>Join thousands of Rwandan youth learning and growing together</p>
        {!isAuthenticated && (
          <Link to="/register" className="btn btn-primary btn-large">
            Get Started Now
          </Link>
        )}
      </section>
    </div>
  );
};

export default Home;
