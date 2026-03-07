import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('adminName', data.name);
      toast.success(`Welcome back, ${data.name}`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-md">
        <div className="glass-card border-cyan-300/25 p-8 md:p-10">
          <h1 className="font-serif text-3xl text-slate-100">
            Admin <span className="text-cyan-200">Access</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">Portfolio content management dashboard.</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <label className="grid gap-2 text-sm">
              <span className="text-slate-300">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-lg border border-white/10 bg-slate-900/60 px-4 py-3 outline-none transition focus:border-cyan-300/60"
                required
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="text-slate-300">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-lg border border-white/10 bg-slate-900/60 px-4 py-3 outline-none transition focus:border-cyan-300/60"
                required
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-cyan-300/40 bg-cyan-300 py-3 text-sm font-bold uppercase tracking-wider text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Authorizing...' : 'Authorize'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
