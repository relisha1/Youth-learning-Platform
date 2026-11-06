import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tutorials from './pages/Tutorials';
import AdminDashboard from './pages/AdminDashboard';
import Jobs from './pages/Jobs';
import MyCertificates from './pages/MyCertificates';
import PartnerDashboard from './pages/PartnerDashboard';
import Verify from './pages/Verify';
import Certificate from './pages/Certificate';
import Notifications from './pages/Notifications';
import FindMentor from './pages/FindMentor';
import MentoringRequests from './pages/MentoringRequests';
import FacilitatorDashboard from './pages/FacilitatorDashboard';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/certificate/:code" element={<Certificate />} />
            <Route path="/jobs" element={<PrivateRoute><Jobs /></PrivateRoute>} />
            <Route path="/my-certificates" element={<PrivateRoute><MyCertificates /></PrivateRoute>} />
            <Route path="/facilitator" element={<PrivateRoute><FacilitatorDashboard /></PrivateRoute>} />
            <Route path="/find-mentor" element={<PrivateRoute><FindMentor /></PrivateRoute>} />
            <Route path="/mentoring" element={<PrivateRoute><MentoringRequests /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/chat/:id" element={<PrivateRoute><Chat /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
            <Route path="/partner" element={<PrivateRoute><PartnerDashboard /></PrivateRoute>} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/tutorials" 
              element={
                <PrivateRoute>
                  <Tutorials />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={<AdminDashboard />}
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
