import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { Award, Plus, Trash2, Edit2, X, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const CertificateManager = () => {
  const [certs, setCerts] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', issuingOrganization: '', issueDate: '', 
    verificationLink: '', category: 'AI/ML'
  });

  useEffect(() => { fetchCerts(); }, []);

  const fetchCerts = async () => {
    const { data } = await API.get('/data/certificates');
    setCerts(data);
  };

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(certs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setCerts(items);
    try {
      await API.put('/data/reorder', { type: 'certificates', items });
    } catch (err) { console.error("Reorder failed"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/data/certificates/${editingId}`, formData);
        toast.success("Certificate updated");
      } else {
        await API.post('/data/certificates', formData);
        toast.success("Certificate added");
      }
      resetForm();
      fetchCerts();
    } catch (err) { toast.error("Operation failed"); }
  };

  const startEdit = (cert) => {
    setFormData({ ...cert, issueDate: cert.issueDate.split('T')[0] });
    setEditingId(cert._id);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: '', issuingOrganization: '', issueDate: '', verificationLink: '', category: 'AI/ML' });
    setEditingId(null);
    setIsFormOpen(false);
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Award className="text-neon-pink" /> Certifications</h2>
        <button onClick={() => setIsFormOpen(!isFormOpen)} className="bg-neon-pink px-4 py-2 rounded-lg font-bold">
          {isFormOpen ? <X size={20}/> : <Plus size={20}/>}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="glass-card p-6 mb-8 grid md:grid-cols-2 gap-4">
          <input placeholder="Certificate Name" className="bg-white/5 border border-white/10 p-3 rounded col-span-2 outline-none focus:border-neon-pink"
            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          
          <input placeholder="Issuing Organization" className="bg-white/5 border border-white/10 p-3 rounded outline-none focus:border-neon-pink"
            value={formData.issuingOrganization} onChange={e => setFormData({...formData, issuingOrganization: e.target.value})} required />
          
          <select className="bg-white/5 border border-white/10 p-3 rounded"
            value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
            <option value="AI/ML">AI/ML</option>
            <option value="Kaggle">Kaggle</option>
            <option value="Research">Research</option>
            <option value="Professional">Professional</option>
          </select>

          <input type="date" className="bg-white/5 border border-white/10 p-3 rounded"
            value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} required />

          <input placeholder="Verification Link" className="bg-white/5 border border-white/10 p-3 rounded outline-none focus:border-neon-pink"
            value={formData.verificationLink} onChange={e => setFormData({...formData, verificationLink: e.target.value})} />

          <button className="bg-neon-pink py-3 rounded-lg font-bold col-span-2 mt-2">
            {editingId ? 'Update Certificate' : 'Add Certificate'}
          </button>
        </form>
      )}

      {/* DRAG AND DROP LIST */}
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="certs-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="grid gap-4">
              {certs.map((c, index) => (
                <Draggable key={c._id} draggableId={c._id} index={index}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`glass-card p-5 flex justify-between items-center ${snapshot.isDragging ? 'border-neon-pink bg-white/5' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                          {/* DRAG HANDLE */}
                          <div {...provided.dragHandleProps} className="text-gray-500 hover:text-white cursor-grab">
                            <GripVertical size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg">{c.name}</h4>
                            <p className="text-gray-500 text-sm">{c.issuingOrganization} • {new Date(c.issueDate).toLocaleDateString()}</p>
                          </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => startEdit(c)} className="p-2 text-gray-400 hover:text-white"><Edit2 size={16}/></button>
                        <button onClick={async () => { if(window.confirm('Delete?')) { await API.delete(`/data/certificates/${c._id}`); fetchCerts(); } }} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default CertificateManager;