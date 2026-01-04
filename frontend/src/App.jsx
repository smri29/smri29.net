import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <div className="bg-dark-bg min-h-screen text-white selection:bg-neon-pink selection:text-white">
        {/* The Navbar stays visible across all pages */}
        <Navbar /> 
        
        <Routes>
          {/* Public Portfolio Route */}
          <Route path="/" element={<Home />} />
          
          {/* Admin Authentication Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Admin Dashboard Route */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>

        {/* Global Notification System */}
        <ToastContainer 
          position="bottom-right" 
          autoClose={3000} 
          theme="dark" 
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;