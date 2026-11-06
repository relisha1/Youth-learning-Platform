import { useState, useEffect } from 'react';
import { learnerAPI } from '../services/api';
import PageLayout from '../components/PageLayout';

// students look at the facilitators and ask one to be their mentor
const FindMentor = () => {
  const [mentors, setMentors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [askingId, setAskingId] = useState(null);
  const [text, setText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const mentorRes = await learnerAPI.getMentors();
      const requestRes = await learnerAPI.getMentorships();
      setMentors(mentorRes.data.data);
      setRequests(requestRes.data.data);
    } catch (err) {
      setMessage('Could not load mentors');
    }
  };

  const handleAsk = async (mentor) => {
    try {
      await learnerAPI.askMentor(mentor.id, text);
      setMessage('Your request was sent to ' + mentor.name);
      setAskingId(null);
      setText('');
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not send the request');
    }
  };

  // colour of the little status label
  const badgeClass = (status) => {
    if (status === 'accepted') return 'pg-badge pg-badge-green';
    if (status === 'declined') return 'pg-badge pg-badge-red';
    return 'pg-badge pg-badge-yellow';
  };

  return (
    <PageLayout title="Find a Mentor" subtitle="Ask a facilitator to guide you">
      {message && <div className="pg-message">{message}</div>}

      <h3 className="pg-section-title">Facilitators</h3>
      {mentors.length === 0 && <div className="pg-empty">There are no facilitators yet.</div>}
      <div className="pg-grid">
        {mentors.map(mentor => (
          <div className="pg-item" key={mentor.id}>
            <h4>👨‍🏫 {mentor.name}</h4>
            <p>{mentor.bio || 'This facilitator has not written a bio yet.'}</p>
            {mentor.skills && <p>Skills: {mentor.skills}</p>}

            {askingId !== mentor.id && (
              <div className="pg-buttons">
                <button className="pg-btn" onClick={() => setAskingId(mentor.id)}>Ask for mentoring</button>
              </div>
            )}

            {askingId === mentor.id && (
              <div>
                <textarea
                  className="pg-textarea"
                  placeholder="Tell the facilitator what you want help with"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="pg-buttons">
                  <button className="pg-btn pg-btn-green" onClick={() => handleAsk(mentor)}>Send request</button>
                  <button className="pg-btn pg-btn-light" onClick={() => setAskingId(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <h3 className="pg-section-title">My requests</h3>
      {requests.length === 0 && <div className="pg-empty">You have not asked any facilitator yet.</div>}
      <div className="pg-grid">
        {requests.map(r => (
          <div className="pg-item" key={r.id}>
            <h4>{r.mentorName}</h4>
            <span className={badgeClass(r.status)}>{r.status}</span>
            {r.message && <p>Your message: {r.message}</p>}
            {r.status === 'accepted' && <p>✅ You can write to your mentor at {r.mentorEmail}</p>}
          </div>
        ))}
      </div>
    </PageLayout>
  );
};

export default FindMentor;
