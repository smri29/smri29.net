import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
// REMOVE import Navbar from './components/Navbar'; <--- Delete this line
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <div className="bg-dark-bg min-h-screen text-white selection:bg-neon-pink selection:text-white">
        
        {/* REMOVE <Navbar /> from here */}
        
        <Routes>
          {/* Public Portfolio Route (Navbar lives inside Home.jsx) */}
          <Route path="/" element={<Home />} />
          
          {/* Admin Authentication Route (No Navbar) */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Admin Dashboard Route (Has Sidebar, No Navbar) */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>

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