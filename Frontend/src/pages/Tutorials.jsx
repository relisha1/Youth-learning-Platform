import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { learnerAPI, publicAPI } from '../services/api';
import '../styles/Tutorials.css';

const Tutorials = () => {
  const navigate = useNavigate();
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState('');
  const [projectLink, setProjectLink] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchTutorials();
    loadSubmissions();
  }, []);

  // the projects this student already sent
  const loadSubmissions = async () => {
    try {
      const res = await learnerAPI.getSubmissions();
      setSubmissions(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // latest submission for a tutorial (or nothing)
  const getSubmission = (tutorialId) => {
    const list = submissions.filter(s => s.tutorialId === tutorialId);
    return list[list.length - 1];
  };

  const handleSubmit = async (tutorial) => {
    try {
      await learnerAPI.submit(tutorial.id, projectLink, notes);
      setMessage('Your project was sent. The facilitator will check it and you will get your certificate if it is approved.');
      setProjectLink('');
      setNotes('');
      setSelectedTutorial(null);
      loadSubmissions();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  const fetchTutorials = async () => {
    try {
      const res = await publicAPI.getTutorials();
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
                {getSubmission(tutorial.id) && <p>Project: {getSubmission(tutorial.id).status}</p>}
                <h3>{tutorial.title}</h3>
                <p className="tutorial-category">{tutorial.path || tutorial.category}</p>
                <p className="tutorial-description">{tutorial.description}</p>
                <div className="tutorial-meta">
                  <span className="duration">⏱️ {tutorial.duration} min</span>
                  {tutorial.lessons && <span className="duration"> · 📖 {tutorial.lessons.length} lessons</span>}
                </div>
                {tutorial.skills && tutorial.skills.length > 0 && (
                  <p className="tutorial-skills">Skills: {tutorial.skills.join(', ')}</p>
                )}
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
              <h3>About this path</h3>
              <p>{selectedTutorial.content}</p>
            </div>

            {selectedTutorial.lessons && selectedTutorial.lessons.length > 0 && (
              <div className="content">
                <h3>Lessons</h3>
                {selectedTutorial.lessons.map((lesson, index) => (
                  <details key={index} className="lesson">
                    <summary>Lesson {index + 1}: {lesson.title}</summary>
                    <p>{lesson.content}</p>
                    {lesson.code && <pre className="lesson-code">{lesson.code}</pre>}
                  </details>
                ))}
              </div>
            )}

            <div className="content">
              <h3>Your project</h3>
              <p>{selectedTutorial.projectBrief}</p>
            </div>

            {selectedTutorial.rubric && selectedTutorial.rubric.length > 0 && (
              <div className="content">
                <h3>How the facilitator will check it</h3>
                <ul className="rubric-list">
                  {selectedTutorial.rubric.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedTutorial.skills && selectedTutorial.skills.length > 0 && (
              <div className="content">
                <h3>Skills your certificate will show</h3>
                <p>{selectedTutorial.skills.join(', ')}</p>
              </div>
            )}
            {(() => {
              const last = getSubmission(selectedTutorial.id);
              if (last && last.status === 'approved') {
                return <p>✅ Your project was approved. Check My Certificates.</p>;
              }
              if (last && last.status === 'pending') {
                return <p>⏳ Your project is waiting for the facilitator.</p>;
              }
              return (
                <div>
                  {last && last.status === 'rejected' && (
                    <p>❌ The facilitator asked for changes: {last.feedback}</p>
                  )}
                  <input
                    placeholder="Link to your project (GitHub)"
                    value={projectLink}
                    onChange={(e) => setProjectLink(e.target.value)}
                  />
                  <textarea
                    placeholder="Notes for the facilitator (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <button className="btn-enroll" onClick={() => handleSubmit(selectedTutorial)}>
                    Send project
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tutorials;
