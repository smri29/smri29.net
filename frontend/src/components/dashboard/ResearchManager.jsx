import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

const ResearchManager = () => {
  const [papers, setPapers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', abstract: '', type: 'Journal', publicationName: '', 
    publicationDate: '', doiLink: '', authors: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchPapers(); }, []);

  const fetchPapers = async () => {
    const { data } = await API.get('/data/research');
    setPapers(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, authors: formData.authors.split(',').map(a => a.trim()) };
    try {
      if (editingId) {
        await API.put(`/data/research/${editingId}`, payload);
        toast.success("Paper updated!");
      } else {
        await API.post('/data/research', payload);
        toast.success("Paper added!");
      }
      resetForm();
      fetchPapers();
    } catch (err) { toast.error("Action failed"); }
  };

  const resetForm = () => {
    setFormData({ title: '', abstract: '', type: 'Journal', publicationName: '', publicationDate: '', doiLink: '', authors: '' });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const startEdit = (paper) => {
    setFormData({ ...paper, authors: paper.authors.join(', '), publicationDate: paper.publicationDate.split('T')[0] });
    setEditingId(paper._id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete this paper?")) {
      await API.delete(`/data/research/${id}`);
      fetchPapers();
      toast.info("Paper removed");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Research <span className="text-neon-pink">Publications</span></h2>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-neon-pink px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:scale-105 transition-transform"
        >
          {isFormOpen ? <X /> : <Plus />} {isFormOpen ? 'Close' : 'Add Paper'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="glass-card p-8 mb-12 grid md:grid-cols-2 gap-6 animate-in fade-in zoom-in duration-300">
          <input placeholder="Title" className="bg-white/5 border border-white/10 p-3 rounded col-span-2 outline-none focus:border-neon-pink"
            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          
          <textarea placeholder="Abstract" className="bg-white/5 border border-white/10 p-3 rounded col-span-2 h-32"
            value={formData.abstract} onChange={e => setFormData({...formData, abstract: e.target.value})} required />
          
          <select className="bg-white/5 border border-white/10 p-3 rounded"
            value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
            <option value="Journal">Journal</option>
            <option value="Conference">Conference</option>
          </select>

          <input placeholder="Journal/Conference Name" className="bg-white/5 border border-white/10 p-3 rounded"
            value={formData.publicationName} onChange={e => setFormData({...formData, publicationName: e.target.value})} required />

          <input type="date" className="bg-white/5 border border-white/10 p-3 rounded"
            value={formData.publicationDate} onChange={e => setFormData({...formData, publicationDate: e.target.value})} required />

          <input placeholder="DOI / URL Link" className="bg-white/5 border border-white/10 p-3 rounded"
            value={formData.doiLink} onChange={e => setFormData({...formData, doiLink: e.target.value})} />

          <input placeholder="Authors (comma separated)" className="bg-white/5 border border-white/10 p-3 rounded col-span-2"
            value={formData.authors} onChange={e => setFormData({...formData, authors: e.target.value})} />

          <button className="bg-neon-pink py-3 rounded-lg font-bold col-span-2">{editingId ? 'Update Publication' : 'Save Publication'}</button>
        </form>
      )}

      {/* Table of Research Papers */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-xs uppercase"><th className="p-6">Paper</th><th className="p-6 text-center">Actions</th></tr>
          </thead>
          <tbody>
            {papers.map(p => (
              <tr key={p._id} className="border-b border-white/5">
                <td className="p-6">
                  <div className="font-bold">{p.title}</div>
                  <div className="text-xs text-neon-pink">{p.publicationName} ({p.type})</div>
                </td>
                <td className="p-6 flex justify-center gap-4">
                  <button onClick={() => startEdit(p)} className="text-gray-400 hover:text-white"><Edit2 size={18}/></button>
                  <button onClick={() => handleDelete(p._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResearchManager;