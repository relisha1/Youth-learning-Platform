import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/PageLayout';

// chat between a student and the facilitator who accepted to mentor them
const Chat = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [mentoring, setMentoring] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const bottom = useRef(null);

  const load = async () => {
    try {
      const res = await chatAPI.get(id);
      setMentoring(res.data.data.mentoring);
      setMessages(res.data.data.messages);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not open this chat');
    }
  };

  // load now and then check for new messages every 5 seconds
  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [id]);

  // scroll down when a new message comes
  useEffect(() => {
    if (bottom.current) bottom.current.scrollIntoView();
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await chatAPI.send(id, text);
      setText('');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send the message');
    }
  };

  const handleFinish = async () => {
    if (!window.confirm('Finish this mentoring? Nobody can send messages after this.')) return;
    try {
      await chatAPI.finish(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const iAmFacilitator = mentoring && String(mentoring.mentorId) === String(user?.id);
  const otherName = mentoring ? (iAmFacilitator ? mentoring.studentName : mentoring.mentorName) : '';
  const backLink = iAmFacilitator ? '/mentoring' : '/find-mentor';
  const finished = mentoring && mentoring.status === 'finished';

  return (
    <PageLayout title={otherName ? 'Chat with ' + otherName : 'Chat'} subtitle="Mentoring conversation">
      <p><Link to={backLink}>← Back</Link></p>
      {error && <div className="pg-message">{error}</div>}

      {mentoring && (
        <div className="pg-card">
          <div className="chat-box">
            {messages.length === 0 && <div className="pg-empty">No messages yet. Say hello!</div>}
            {messages.map(m => {
              const mine = String(m.senderId) === String(user?.id);
              return (
                <div key={m.id} className={mine ? 'chat-row chat-mine' : 'chat-row'}>
                  <div className="chat-bubble">
                    <div className="chat-text">{m.text}</div>
                    <div className="chat-time">{m.senderName} · {new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
            <div ref={bottom}></div>
          </div>

          {finished ? (
            <p className="pg-muted">This mentoring is finished.</p>
          ) : (
            <form onSubmit={handleSend} className="chat-form">
              <input placeholder="Write a message" value={text} maxLength={1000} onChange={(e) => setText(e.target.value)} />
              <button className="pg-btn" type="submit">Send</button>
            </form>
          )}

          {iAmFacilitator && !finished && (
            <div className="chat-finish"><button className="pg-btn pg-btn-light" onClick={handleFinish}>Finish mentoring</button></div>
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default Chat;
