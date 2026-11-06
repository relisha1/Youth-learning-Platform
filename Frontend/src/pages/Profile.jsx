import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, accountAPI } from '../services/api';
import PageLayout from '../components/PageLayout';

// every user can change their name, phone, bio, skills and password here
const Profile = () => {
  const { user, updateProfile } = useAuth();
  const skillsText = Array.isArray(user?.skills) ? user.skills.join(', ') : (user?.skills || '');
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    skills: skillsText
  });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // get the newest info (for example if the email was confirmed meanwhile)
  useEffect(() => {
    updateProfile({});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile(form);
    setMessage(result.success ? 'Profile saved' : result.error);
    setSaving(false);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    try {
      await authAPI.changePassword(passwords);
      setPasswords({ oldPassword: '', newPassword: '' });
      setMessage('Password changed');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not change the password');
    }
  };

  const handleResend = async () => {
    try {
      const res = await accountAPI.resend();
      setMessage(res.data.message);
    } catch (err) {
      setMessage('Could not send the link');
    }
  };

  return (
    <PageLayout title="My Profile" subtitle={'Signed in as ' + (user?.email || '')}>
      {message && <div className="pg-message">{message}</div>}

      {user?.emailVerified === false && (
        <div className="pg-card">
          <h3>Confirm your email</h3>
          <p className="pg-muted">We sent a link to {user.email}. Open it to confirm that this email is yours.</p>
          <button className="pg-btn pg-btn-light" onClick={handleResend}>Send the link again</button>
        </div>
      )}

      <div className="pg-card">
        <h3>My details</h3>
        <p className="pg-muted">Your phone number is used for SMS messages (example: 0788123456).</p>
        <form onSubmit={handleSave} className="pg-form">
          <input name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
          <input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} />
          <input name="skills" placeholder="Your skills (example: C, Python)" value={form.skills} onChange={handleChange} />
          <textarea name="bio" placeholder="A few words about you" value={form.bio} onChange={handleChange} />
          <div><button className="pg-btn" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></div>
        </form>
      </div>

      <div className="pg-card">
        <h3>Change password</h3>
        <form onSubmit={handlePassword} className="pg-form">
          <input type="password" placeholder="Old password" value={passwords.oldPassword} onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })} required />
          <input type="password" placeholder="New password (6 letters or more)" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required />
          <div><button className="pg-btn" type="submit">Change password</button></div>
        </form>
      </div>
    </PageLayout>
  );
};

export default Profile;
