import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Home = lazy(() => import('./pages/Home'));
const Certificates = lazy(() => import('./pages/Certificates'));
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
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen selection:bg-cyan-300 selection:text-slate-950">
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/certifications" element={<Certificates />} />
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
    </Router>
  );
}

export default App;
