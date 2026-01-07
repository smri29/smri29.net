import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { Plus, Trash2, Edit2, X, Code2, Link as LinkIcon, Github } from 'lucide-react';

const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    projectName: '', description: '', techStack: '', 
    category: 'AI/ML', githubLink: '', liveLink: '', 
    role: 'Lead Developer', contributors: ''
  });

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/data/projects');
      setProjects(data);
    } catch (err) { toast.error("Could not fetch projects"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Convert comma-separated strings to Arrays
    const payload = { 
      ...formData, 
      techStack: formData.techStack.split(',').map(s => s.trim()),
      contributors: formData.contributors.split(',').map(c => c.trim())
    };

    try {
      if (editingId) {
        await API.put(`/data/data/projects/${editingId}`, payload);
        toast.success("Project updated!");
      } else {
        await API.post('/data/projects', payload);
        toast.success("Project launched!");
      }
      resetForm();
      fetchProjects();
    } catch (err) { toast.error("Error saving project"); }
  };

  const startEdit = (proj) => {
    setFormData({ 
      ...proj, 
      techStack: proj.techStack.join(', '),
      contributors: proj.contributors.join(', ')
    });
    setEditingId(proj._id);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({ projectName: '', description: '', techStack: '', category: 'AI/ML', githubLink: '', liveLink: '', role: 'Lead Developer', contributors: '' });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to remove this project?")) {
      await API.delete(`/data/projects/${id}`);
      fetchProjects();
      toast.warn("Project deleted");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Code2 className="text-neon-pink" /> Software <span className="text-neon-pink">Projects</span>
          </h2>
          <p className="text-gray-500 text-sm">Showcase your technical builds</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-neon-pink px-5 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-pink-600 transition-all"
        >
          {isFormOpen ? <X size={20}/> : <Plus size={20}/>} {isFormOpen ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="glass-card p-8 mb-12 border-t-2 border-neon-pink">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs uppercase text-gray-500 font-bold mb-2 block tracking-widest">Project Name</label>
              <input className="w-full bg-white/5 border border-white/10 p-3 rounded focus:border-neon-pink outline-none"
                value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} required />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="text-xs uppercase text-gray-500 font-bold mb-2 block tracking-widest">Category</label>
              <select className="w-full bg-white/5 border border-white/10 p-3 rounded focus:border-neon-pink outline-none"
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="AI/ML">AI/ML</option>
                <option value="MERN">MERN Stack</option>
                <option value="Flutter">Flutter</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-xs uppercase text-gray-500 font-bold mb-2 block tracking-widest">Description</label>
              <textarea className="w-full bg-white/5 border border-white/10 p-3 rounded h-32 focus:border-neon-pink outline-none"
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
            </div>

            <div>
              <label className="text-xs uppercase text-gray-500 font-bold mb-2 block tracking-widest text-neon-pink">Tech Stack (Comma Separated)</label>
              <input placeholder="React, Python, PyTorch..." className="w-full bg-white/5 border border-white/10 p-3 rounded focus:border-neon-pink outline-none"
                value={formData.techStack} onChange={e => setFormData({...formData, techStack: e.target.value})} required />
            </div>

            <div>
              <label className="text-xs uppercase text-gray-500 font-bold mb-2 block tracking-widest">Your Role</label>
              <input className="w-full bg-white/5 border border-white/10 p-3 rounded focus:border-neon-pink outline-none"
                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
            </div>

            <div>
              <label className="text-xs uppercase text-gray-500 font-bold mb-2 block tracking-widest flex items-center gap-1"><Github size={12}/> GitHub Link</label>
              <input className="w-full bg-white/5 border border-white/10 p-3 rounded focus:border-neon-pink outline-none"
                value={formData.githubLink} onChange={e => setFormData({...formData, githubLink: e.target.value})} />
            </div>

            <div>
              <label className="text-xs uppercase text-gray-500 font-bold mb-2 block tracking-widest flex items-center gap-1"><LinkIcon size={12}/> Live Demo</label>
              <input className="w-full bg-white/5 border border-white/10 p-3 rounded focus:border-neon-pink outline-none"
                value={formData.liveLink} onChange={e => setFormData({...formData, liveLink: e.target.value})} />
            </div>

            <div className="col-span-2">
              <label className="text-xs uppercase text-gray-500 font-bold mb-2 block tracking-widest">Contributors (Optional)</label>
              <input placeholder="Names separated by commas" className="w-full bg-white/5 border border-white/10 p-3 rounded focus:border-neon-pink outline-none"
                value={formData.contributors} onChange={e => setFormData({...formData, contributors: e.target.value})} />
            </div>
          </div>

          <button className="w-full mt-8 bg-neon-pink py-4 rounded-lg font-bold text-lg hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all">
            {editingId ? 'Update Project Details' : 'Publish Project'}
          </button>
        </form>
      )}

      {/* PROJECT LIST */}
      <div className="grid gap-4">
        {projects.map(p => (
          <div key={p._id} className="glass-card p-6 flex justify-between items-center group hover:border-neon-pink/30 transition-all">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold">{p.projectName}</h3>
                <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-gray-400 font-mono">{p.category}</span>
              </div>
              <p className="text-gray-500 text-sm mt-1 line-clamp-1 max-w-xl">{p.description}</p>
              <div className="flex gap-2 mt-3">
                {p.techStack.map(tag => (
                  <span key={tag} className="text-[10px] border border-white/5 bg-white/5 px-2 py-0.5 rounded text-neon-pink font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => startEdit(p)} className="p-2 hover:bg-white/10 rounded-full text-blue-400"><Edit2 size={18}/></button>
              <button onClick={() => handleDelete(p._id)} className="p-2 hover:bg-white/10 rounded-full text-red-400"><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
        {projects.length === 0 && <p className="text-center text-gray-600 py-10 italic">No projects added yet.</p>}
      </div>
    </div>
  );
};

export default ProjectManager;