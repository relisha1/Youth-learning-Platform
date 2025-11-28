import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Tutorials.css';

const Tutorials = () => {
  const navigate = useNavigate();
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTutorial, setSelectedTutorial] = useState(null);

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/public/tutorials');
      setTutorials(Array.isArray(res.data.data) ? res.data.data : []);
      setError('');
    } catch (err) {
      setError('Failed to load tutorials');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return <div className="tutorials-container"><p>Loading tutorials...</p></div>;
  }

  return (
    <div className="tutorials-page">
      <header className="tutorials-header">
        <h1>Coding Tutorials</h1>
        <button onClick={handleBack} className="btn-back">← Back to Dashboard</button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="tutorials-container">
        {tutorials.length === 0 ? (
          <div className="no-tutorials">
            <p>No tutorials available yet.</p>
          </div>
        ) : (
          <div className="tutorials-grid">
            {tutorials.map(tutorial => (
              <div key={tutorial.id} className="tutorial-card">
                <div className="tutorial-level">{tutorial.level}</div>
                <h3>{tutorial.title}</h3>
                <p className="tutorial-category">{tutorial.category}</p>
                <p className="tutorial-description">{tutorial.description}</p>
                <div className="tutorial-meta">
                  <span className="duration">⏱️ {tutorial.duration} min</span>
                </div>
                <button 
                  className="btn-view"
                  onClick={() => setSelectedTutorial(tutorial)}
                >
                  View Tutorial
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTutorial && (
        <div className="modal-overlay" onClick={() => setSelectedTutorial(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="btn-close" onClick={() => setSelectedTutorial(null)}>×</button>
            <h2>{selectedTutorial.title}</h2>
            <div className="modal-meta">
              <span className="level">{selectedTutorial.level}</span>
              <span className="category">{selectedTutorial.category}</span>
              <span className="duration">⏱️ {selectedTutorial.duration} min</span>
            </div>
            <p className="description">{selectedTutorial.description}</p>
            <div className="content">
              <h3>Course Content</h3>
              <p>{selectedTutorial.content}</p>
            </div>
            <button className="btn-enroll">Start Learning</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tutorials;
