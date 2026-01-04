import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { Mail, Trash2, LogOut, User, PlusCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [messages, setMessages] = useState([]);
  const [newProject, setNewProject] = useState({ 
    title: '', description: '', category: 'Research Paper', subCategory: '', liveLink: '', repoLink: '' 
  });
  const navigate = useNavigate();
  const adminName = localStorage.getItem('adminName');

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const { data } = await API.get('/data/messages');
      setMessages(data);
    } catch (err) {
      toast.error("Session expired.");
      navigate('/login');
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await API.post('/data/projects', newProject);
      toast.success("Entry added to portfolio!");
      setNewProject({ title: '', description: '', category: 'Research Paper', subCategory: '', liveLink: '', repoLink: '' });
    } catch (err) {
      toast.error("Failed to upload.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-6 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold flex items-center gap-3"><User className="text-neon-pink" /> Dashboard</h1>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="text-gray-400 hover:text-red-500 flex items-center gap-2">
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="glass-card p-8 mb-12 border-l-4 border-neon-pink">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><PlusCircle size={20} className="text-neon-pink" /> Add Portfolio Item</h2>
          <form onSubmit={handleAddProject} className="grid md:grid-cols-2 gap-4">
            <input type="text" placeholder="Title" className="bg-white/5 p-3 rounded border border-white/10 outline-none focus:border-neon-pink" 
              value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} required />
            
            <div className="grid grid-cols-2 gap-2">
              <select className="bg-white/5 p-3 rounded border border-white/10 outline-none focus:border-neon-pink text-gray-400" 
                value={newProject.category} onChange={e => setNewProject({...newProject, category: e.target.value})}>
                <option value="Research Paper">Research Paper</option>
                <option value="Development">Development</option>
                <option value="Certification">Certification</option>
              </select>
              <input type="text" placeholder="Sub-Cat (e.g. AI/ML)" className="bg-white/5 p-3 rounded border border-white/10 outline-none focus:border-neon-pink" 
                value={newProject.subCategory} onChange={e => setNewProject({...newProject, subCategory: e.target.value})} required />
            </div>

            <textarea placeholder="Description" className="bg-white/5 p-3 rounded border border-white/10 outline-none focus:border-neon-pink md:col-span-2 h-24" 
              value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} required />
            
            <input type="text" placeholder="Live/Paper Link" className="bg-white/5 p-3 rounded border border-white/10 outline-none focus:border-neon-pink" 
              value={newProject.liveLink} onChange={e => setNewProject({...newProject, liveLink: e.target.value})} />
            
            <input type="text" placeholder="Repo Link" className="bg-white/5 p-3 rounded border border-white/10 outline-none focus:border-neon-pink" 
              value={newProject.repoLink} onChange={e => setNewProject({...newProject, repoLink: e.target.value})} />
            
            <button className="bg-neon-pink font-bold py-3 rounded-lg md:col-span-2 hover:bg-pink-600 transition-colors">Post to Portfolio</button>
          </form>
        </div>

        {/* Inquiry Table (Same as before) */}
        <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-white/5"><h3 className="font-bold">Inquiry Inbox ({messages.length})</h3></div>
            <table className="w-full text-left">
                <thead><tr className="text-gray-500 text-xs border-b border-white/5"><th className="p-6">Sender</th><th className="p-6">Message</th></tr></thead>
                <tbody>{messages.map(m => <tr key={m._id} className="border-b border-white/5"><td className="p-6 font-bold">{m.name}</td><td className="p-6 text-gray-400">{m.message}</td></tr>)}</tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;