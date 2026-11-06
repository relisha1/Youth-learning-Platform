import { useState } from 'react';
import { Link } from 'react-router-dom';
import { partnerAPI } from '../services/api';
import { statusLabel, statusClass } from '../utils/status';

// one application, seen by the employer: status buttons, interview details, chat and feedback
const ApplicationCard = ({ a, onStatus, onChanged, onMessage }) => {
  const [note, setNote] = useState(a.interviewNote || '');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');

  const handleInterview = async () => {
    try {
      const res = await partnerAPI.setInterview(a.id, note);
      onMessage(res.data.message);
      onChanged();
    } catch (err) {
      onMessage(err.response?.data?.message || 'Could not save the interview details');
    }
  };

  const handleFeedback = async () => {
    try {
      const res = await partnerAPI.sendFeedback(a.id, rating, comment);
      onMessage(res.data.message);
      onChanged();
    } catch (err) {
      onMessage(err.response?.data?.message || 'Could not send the feedback');
    }
  };

  const open = a.status === 'accepted' || a.status === 'hired';

  return (
    <div className="pg-item">
      <h4>{a.learnerName}</h4>
      {a.jobTitle && <p>Applied for: {a.jobTitle}</p>}
      <span className={statusClass(a.status)}>{statusLabel(a.status)}</span>
      <p>{a.message}</p>
      <p>🏆 {a.certificates.length === 0 ? 'No certificates' : a.certificates.map(c => c.tutorialTitle + ' (' + c.code + ')').join(', ')}</p>

      <div className="pg-buttons">
        <button className="pg-btn pg-btn-green" onClick={() => onStatus(a, 'accepted')}>Shortlist</button>
        <button className="pg-btn" onClick={() => onStatus(a, 'hired')}>Mark as hired</button>
        <button className="pg-btn pg-btn-red" onClick={() => onStatus(a, 'rejected')}>Not selected</button>
      </div>

      {open && (
        <div className="app-extra">
          <Link className="pg-btn pg-btn-light" to={'/application-chat/' + a.id}>Open chat</Link>

          <label className="app-label">Interview (date, time, place or link)</label>
          <input className="pg-search" placeholder="Example: Monday 10:00, Kigali office" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} />
          <button className="pg-btn pg-btn-light" onClick={handleInterview}>Tell the learner</button>
        </div>
      )}

      {a.status === 'hired' && a.hireConfirmed !== true && (
        <p className="pg-muted">⏳ Waiting for {a.learnerName} to confirm the job.</p>
      )}

      {a.status === 'hired' && a.hireConfirmed === true && (
        <div className="app-extra">
          <p>✅ {a.learnerName} confirmed the job.</p>
          {a.feedback ? (
            <p>Your feedback: {a.feedback.rating}/5 {a.feedback.comment && '· ' + a.feedback.comment}</p>
          ) : (
            <>
              <label className="app-label">Was the learner ready for the work? (5 = very ready)</label>
              <select value={rating} onChange={(e) => setRating(e.target.value)}>
                <option value="5">5 - very ready</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1 - not ready</option>
              </select>
              <input className="pg-search" placeholder="A short comment (optional)" value={comment} maxLength={500} onChange={(e) => setComment(e.target.value)} />
              <button className="pg-btn" onClick={handleFeedback}>Send feedback</button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicationCard;
