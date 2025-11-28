import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tutorials from './pages/Tutorials';
import AdminDashboard from './pages/AdminDashboard';
import Diagnostic from './pages/Diagnostic';
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
            <Route path="/diagnostic" element={<Diagnostic />} />
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
