import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const MentorStudents = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      // Get all mentorships for this mentor
      const response = await fetch('http://localhost:5000/api/mentorships?mentorId=' + user?.id, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load students');
      
      const data = await response.json();
      const mentorships = data.data || [];
      
      // Get student details for each mentorship
      const studentsData = [];
      for (const mentorship of mentorships) {
        const studentRes = await fetch(`http://localhost:5000/api/users/${mentorship.studentId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (studentRes.ok) {
          const studentData = await studentRes.json();
          studentsData.push({
            ...studentData.data,
            mentorshipId: mentorship.id,
            mentorshipStatus: mentorship.status,
            startDate: mentorship.startDate
          });
        }
      }
      
      setStudents(studentsData);
    } catch (err) {
      console.error('Error loading students:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>My Students</h1>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-main">
        <button onClick={handleBackToDashboard} className="btn-back" style={{ marginBottom: '20px', padding: '8px 16px', background: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          ← Back to Dashboard
        </button>

        {loading && <p>Loading students...</p>}
        {error && <p style={{ color: '#e74c3c' }}>Error: {error}</p>}
        
        {!loading && students.length === 0 && (
          <p style={{ fontSize: '1.1rem', color: '#7f8c8d' }}>No students assigned yet.</p>
        )}

        {!loading && students.length > 0 && (
          <div className="students-list">
            <h3>Your Mentees ({students.length})</h3>
            <div style={{ marginTop: '20px' }}>
              {students.map((student) => (
                <div key={student.id} style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  borderLeft: '4px solid #3498db'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{student.name}</h4>
                  <p style={{ margin: '5px 0', color: '#7f8c8d' }}>
                    <strong>Email:</strong> {student.email}
                  </p>
                  <p style={{ margin: '5px 0', color: '#7f8c8d' }}>
                    <strong>Phone:</strong> {student.phone || 'N/A'}
                  </p>
                  <p style={{ margin: '5px 0', color: '#7f8c8d' }}>
                    <strong>Status:</strong> <span style={{ background: '#d5f4e6', color: '#27ae60', padding: '4px 8px', borderRadius: '4px' }}>
                      {student.mentorshipStatus === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                  <p style={{ margin: '5px 0', color: '#7f8c8d' }}>
                    <strong>Started:</strong> {student.startDate ? new Date(student.startDate).toLocaleDateString() : 'N/A'}
                  </p>
                  <button style={{
                    marginTop: '10px',
                    padding: '6px 12px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}>
                    Send Feedback
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorStudents;
