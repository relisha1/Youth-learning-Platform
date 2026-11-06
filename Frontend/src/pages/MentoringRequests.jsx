import { useState, useEffect } from 'react';
import { mentorAPI } from '../services/api';
import PageLayout from '../components/PageLayout';

// facilitators answer students who asked for mentoring and edit the profile students see
const MentoringRequests = () => {
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState({ bio: '', skills: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const requestRes = await mentorAPI.getRequests();
      const profileRes = await mentorAPI.getProfile();
      setRequests(requestRes.data.data);
      setProfile(profileRes.data.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not load your page');
    }
  };

  const handleAnswer = async (request, status) => {
    try {
      await mentorAPI.answerRequest(request.id, status);
      setMessage(status === 'accepted' ? 'You are now the mentor of ' + request.studentName : 'Request declined');
      loadData();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await mentorAPI.saveProfile(profile);
      setMessage('Profile saved');
    } catch (err) {
      setMessage('Could not save your profile');
    }
  };

  const badgeClass = (status) => {
    if (status === 'accepted') return 'pg-badge pg-badge-green';
    if (status === 'declined') return 'pg-badge pg-badge-red';
    return 'pg-badge pg-badge-yellow';
  };

  return (
    <PageLayout title="Mentoring Requests" subtitle="Students who asked you to be their mentor">
      {message && <div className="pg-message">{message}</div>}

      <div className="pg-card">
        <h3>My profile</h3>
        <p className="pg-muted">Students see this when they look for a mentor.</p>
        <form onSubmit={handleSave} className="pg-form">
          <textarea name="bio" placeholder="Tell students about yourself" value={profile.bio} onChange={handleChange} />
          <input name="skills" placeholder="Your skills (example: JavaScript, Python)" value={profile.skills} onChange={handleChange} />
          <div><button className="pg-btn" type="submit">Save profile</button></div>
        </form>
      </div>

      <h3 className="pg-section-title">Requests</h3>
      {requests.length === 0 && <div className="pg-empty">No student has asked you yet.</div>}
      <div className="pg-grid">
        {requests.map(r => (
          <div className="pg-item" key={r.id}>
            <h4>{r.studentName}</h4>
            <span className={badgeClass(r.status)}>{r.status}</span>
            {r.message && <p>{r.message}</p>}
            {r.status === 'accepted' && <p>Email: {r.studentEmail}</p>}

            {r.status === 'pending' && (
              <div className="pg-buttons">
                <button className="pg-btn pg-btn-green" onClick={() => handleAnswer(r, 'accepted')}>Accept</button>
                <button className="pg-btn pg-btn-red" onClick={() => handleAnswer(r, 'declined')}>Decline</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </PageLayout>
  );
};

export default MentoringRequests;
