import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import PageLayout from '../components/PageLayout';

// list of notifications. When you open this page they are marked as read.
const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await notificationAPI.getAll();
        setNotifications(res.data.data);
        await notificationAPI.markAllRead();
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  return (
    <PageLayout title="Notifications" subtitle="What happened on your account">
      {notifications.length === 0 && <div className="pg-empty">You have no notifications yet.</div>}

      <div className="pg-grid">
        {notifications.map(n => (
          <div className="pg-item" key={n.id}>
            {!n.read && <span className="pg-badge pg-badge-yellow">new</span>}
            <h4>{n.title}</h4>
            <p>{n.message}</p>
            <p className="pg-muted">{new Date(n.createdAt).toLocaleString()}</p>
            {n.link && (
              <div className="pg-buttons">
                <button className="pg-btn pg-btn-light" onClick={() => navigate(n.link)}>Open</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </PageLayout>
  );
};

export default Notifications;
