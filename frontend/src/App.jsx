import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AnalyticsTracker from './components/AnalyticsTracker';
import TurnstileGate from './components/TurnstileGate';
import API, { getAdminToken, setAdminToken } from './api/axios';

const Home = lazy(() => import('./pages/Home'));
const Certificates = lazy(() => import('./pages/Certificates'));
const Projects = lazy(() => import('./pages/Projects'));
const Publications = lazy(() => import('./pages/Publications'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

const RouteLoader = () => (
  <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0c1523] text-slate-200">
    <div className="pointer-events-none absolute inset-0 subtle-grid opacity-[0.14]" />
    <div className="pointer-events-none absolute -left-12 top-16 h-48 w-48 rounded-full bg-cyan-300/15 blur-[80px]" />
    <div className="pointer-events-none absolute -right-8 bottom-16 h-44 w-44 rounded-full bg-amber-200/10 blur-[80px]" />
    <div className="glass-card flex flex-col items-center gap-4 border-white/10 px-8 py-7">
      <div className="h-10 w-10 rounded-full border-2 border-slate-600 border-t-cyan-400 animate-spin" />
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Loading</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      if (!getAdminToken()) {
        if (active) {
          setStatus('unauthorized');
        }
        return;
      }

      try {
        await API.get('/auth/me');
        if (active) {
          setStatus('authorized');
        }
      } catch (error) {
        setAdminToken('');
        if (active) {
          setStatus('unauthorized');
        }
      }
    };

    verifySession();
    return () => {
      active = false;
    };
  }, []);

  if (status === 'checking') {
    return <RouteLoader />;
  }

  if (status !== 'authorized') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <TurnstileGate>
        <div className="min-h-screen selection:bg-cyan-300 selection:text-slate-950">
          <AnalyticsTracker />
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/certifications" element={<Certificates />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/publications" element={<Publications />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>

          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            theme="dark"
            pauseOnHover
          />
        </div>
      </TurnstileGate>
    </Router>
  );
}

export default App;
