import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { learnerAPI } from '../services/api';
import '../styles/Tutorials.css';

const Tutorials = () => {
  const navigate = useNavigate();
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [finishedIds, setFinishedIds] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTutorials();
    loadProgress();
  }, []);

  // which tutorials did this user already finish
  const loadProgress = async () => {
    try {
      const res = await learnerAPI.getProgress();
      setFinishedIds(res.data.data.map(p => p.tutorialId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinish = async (tutorial) => {
    try {
      const res = await learnerAPI.complete(tutorial.id);
      setFinishedIds([...finishedIds, tutorial.id]);
      setMessage('Well done! Your certificate code is ' + res.data.data.code);
      setSelectedTutorial(null);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

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
      {message && <div className="success-message">{message}</div>}

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
                {finishedIds.includes(tutorial.id) && <p>✅ Finished</p>}
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
            {finishedIds.includes(selectedTutorial.id) ? (
              <p>✅ You finished this tutorial</p>
            ) : (
              <button className="btn-enroll" onClick={() => handleFinish(selectedTutorial)}>
                I finished this tutorial
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tutorials;
