import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('adminName', data.name);
      toast.success(`Welcome back, ${data.name}`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass-card p-10 w-full max-w-md border-t-4 border-neon-pink">
        <h2 className="text-3xl font-bold mb-2">Admin <span className="text-neon-pink">Login</span></h2>
        <p className="text-gray-500 text-sm mb-8">Access the portfolio management console.</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-white/5 border border-white/10 p-3 rounded-lg outline-none focus:border-neon-pink transition-all"
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full bg-white/5 border border-white/10 p-3 rounded-lg outline-none focus:border-neon-pink transition-all"
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button className="w-full bg-neon-pink py-3 rounded-lg font-bold hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all mt-4">
            Authorize
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;