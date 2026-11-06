import { useState, useEffect } from 'react';
import { mentorAPI } from '../services/api';
import PageLayout from '../components/PageLayout';

// page for facilitators: check the projects students sent
const FacilitatorDashboard = () => {
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

  const tabClass = (name) => (status === name ? 'pg-tab pg-tab-active' : 'pg-tab');

  return (
    <PageLayout title="Check Projects" subtitle="Open the project link, check the work, then approve it or ask for changes.">
      {message && <div className="pg-message">{message}</div>}

      <div className="pg-tabs">
        <button className={tabClass('pending')} onClick={() => setStatus('pending')}>Waiting</button>
        <button className={tabClass('approved')} onClick={() => setStatus('approved')}>Approved</button>
        <button className={tabClass('rejected')} onClick={() => setStatus('rejected')}>Sent back</button>
      </div>

      {submissions.length === 0 && <div className="pg-empty">Nothing here.</div>}

      <div className="pg-grid">
        {submissions.map(s => (
          <div className="pg-item" key={s.id}>
            <h4>{s.learnerName}</h4>
            <p><strong>{s.tutorialTitle}</strong></p>
            <p>Project: <a href={s.projectLink} target="_blank" rel="noreferrer">{s.projectLink}</a></p>
            {s.notes && <p>Notes: {s.notes}</p>}
            {s.rubric && s.rubric.length > 0 && s.status === 'pending' && (
              <div>
                <p><strong>Check that:</strong></p>
                <ul className="pg-list">
                  {s.rubric.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </div>
            )}
            {s.feedback && <p>Feedback: {s.feedback}</p>}

            {s.status === 'pending' && (
              <div>
                <textarea
                  className="pg-textarea"
                  placeholder="Feedback (needed if you send it back)"
                  value={feedback[s.id] || ''}
                  onChange={(e) => handleFeedback(s.id, e.target.value)}
                />
                <div className="pg-buttons">
                  <button className="pg-btn pg-btn-green" onClick={() => handleReview(s, 'approved')}>Approve</button>
                  <button className="pg-btn pg-btn-red" onClick={() => handleReview(s, 'rejected')}>Send back</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </PageLayout>
  );
};

export default FacilitatorDashboard;
