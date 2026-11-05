import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mentorAPI } from '../services/api';
import '../styles/Pages.css';

// page for facilitators: check the projects students sent
const FacilitatorDashboard = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('pending');
  const [submissions, setSubmissions] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, [status]);

  const loadSubmissions = async () => {
    try {
      const res = await mentorAPI.getSubmissions(status);
      setSubmissions(res.data.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not load projects');
    }
  };

  const handleReview = async (submission, newStatus) => {
    try {
      await mentorAPI.review(submission.id, newStatus, feedback[submission.id]);
      setMessage(newStatus === 'approved' ? 'Approved. The certificate was given.' : 'Sent back to the student.');
      loadSubmissions();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleFeedback = (id, text) => {
    setFeedback({ ...feedback, [id]: text });
  };

  return (
    <div className="simple-page">
      <button onClick={() => navigate('/dashboard')}>← Back</button>
      <h1>Facilitator Page</h1>
      <p>Open the project link, check the work, then approve it or ask for changes.</p>
      {message && <p className="note">{message}</p>}

      <button onClick={() => setStatus('pending')}>Waiting</button>{' '}
      <button onClick={() => setStatus('approved')}>Approved</button>{' '}
      <button onClick={() => setStatus('rejected')}>Sent back</button>

      {submissions.length === 0 && <p>Nothing here.</p>}

      {submissions.map(s => (
        <div className="simple-card" key={s.id}>
          <h3>{s.learnerName} - {s.tutorialTitle}</h3>
          <p>Project: <a href={s.projectLink} target="_blank" rel="noreferrer">{s.projectLink}</a></p>
          {s.notes && <p>Notes: {s.notes}</p>}
          {s.feedback && <p>Feedback: {s.feedback}</p>}

          {s.status === 'pending' && (
            <div>
              <textarea
                placeholder="Feedback (needed if you send it back)"
                value={feedback[s.id] || ''}
                onChange={(e) => handleFeedback(s.id, e.target.value)}
              />
              <button onClick={() => handleReview(s, 'approved')}>Approve</button>{' '}
              <button onClick={() => handleReview(s, 'rejected')}>Send back</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FacilitatorDashboard;
