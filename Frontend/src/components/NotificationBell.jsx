import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../services/api';

// bell with the number of new notifications. It checks again every 30 seconds.
const NotificationBell = () => {
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const res = await notificationAPI.getAll();
        setUnread(res.data.unread);
      } catch (err) {
        // if it fails we just show no number
      }
    };

    loadCount();
    const timer = setInterval(loadCount, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <button
      className="pg-header-btn"
      style={{ position: 'relative' }}
      onClick={() => navigate('/notifications')}
      title="Notifications"
    >
      🔔
      {unread > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: '#e74c3c',
            color: 'white',
            borderRadius: '50%',
            minWidth: '22px',
            height: '22px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {unread}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
