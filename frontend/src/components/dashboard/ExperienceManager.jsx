import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { Briefcase, Plus, Trash2, Edit2, X, GripVertical, MapPin, Calendar } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const ExperienceManager = () => {
  const [experiences, setExperiences] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    role: '', company: '', duration: '', location: '', description: ''
  });

  useEffect(() => { fetchExperience(); }, []);

  const fetchExperience = async () => {
    try {
      const { data } = await API.get('/data/experience');
      setExperiences(data);
    } catch (err) { toast.error("Failed to fetch experience"); }
  };

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(experiences);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setExperiences(items);
    try {
      await API.put('/data/reorder', { type: 'experience', items });
    } catch (err) { console.error("Reorder failed"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/data/experience/${editingId}`, formData);
        toast.success("Experience updated!");
      } else {
        await API.post('/data/experience', formData);
        toast.success("Job added!");
      }
      resetForm();
      fetchExperience();
    } catch (err) { toast.error("Save failed"); }
  };

  const startEdit = (job) => {
    setFormData(job);
    setEditingId(job._id);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({ role: '', company: '', duration: '', location: '', description: '' });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete this job?")) {
      await API.delete(`/data/experience/${id}`);
      fetchExperience();
      toast.warn("Job removed");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="text-neon-pink" /> Work <span className="text-neon-pink">Experience</span>
          </h2>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-neon-pink px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-pink-600 transition-all"
        >
          {isFormOpen ? <X size={20}/> : <Plus size={20}/>} {isFormOpen ? 'Cancel' : 'Add Job'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="glass-card p-8 mb-12 border-t-2 border-neon-pink grid md:grid-cols-2 gap-6">
          <input className="w-full bg-white/5 border border-white/10 p-3 rounded focus:border-neon-pink outline-none"
            placeholder="Job Role (e.g. Software Engineer)"
            value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required />
            
          <input className="w-full bg-white/5 border border-white/10 p-3 rounded focus:border-neon-pink outline-none"
            placeholder="Company Name"
            value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} required />

          <input className="w-full bg-white/5 border border-white/10 p-3 rounded focus:border-neon-pink outline-none"
            placeholder="Duration (e.g. Jan 2024 - Present)"
            value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} required />

          <input className="w-full bg-white/5 border border-white/10 p-3 rounded focus:border-neon-pink outline-none"
            placeholder="Location (e.g. Remote / Dhaka)"
            value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />

          <textarea className="w-full bg-white/5 border border-white/10 p-3 rounded h-32 focus:border-neon-pink outline-none col-span-2"
            placeholder="Description of responsibilities..."
            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />

          <button className="col-span-2 bg-neon-pink py-3 rounded-lg font-bold hover:shadow-lg transition-all">
            {editingId ? 'Update Experience' : 'Save Experience'}
          </button>
        </form>
      )}

      {/* DRAG AND DROP LIST */}
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="experience-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {experiences.map((job, index) => (
                <Draggable key={job._id} draggableId={job._id} index={index}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`glass-card p-6 flex gap-4 group ${snapshot.isDragging ? 'border-neon-pink bg-white/5' : ''}`}
                    >
                      <div {...provided.dragHandleProps} className="text-gray-500 hover:text-white cursor-grab pt-1">
                        <GripVertical size={20} />
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold">{job.role}</h3>
                            <p className="text-neon-pink font-medium">{job.company}</p>
                          </div>
                          <div className="text-right text-xs text-gray-500 space-y-1">
                            <div className="flex items-center justify-end gap-1"><Calendar size={12}/> {job.duration}</div>
                            <div className="flex items-center justify-end gap-1"><MapPin size={12}/> {job.location}</div>
                          </div>
                        </div>
                        <p className="mt-3 text-gray-400 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
                      </div>

                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(job)} className="p-2 text-blue-400 hover:bg-white/10 rounded"><Edit2 size={18}/></button>
                        <button onClick={() => handleDelete(job._id)} className="p-2 text-red-400 hover:bg-white/10 rounded"><Trash2 size={18}/></button>
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

export default ExperienceManager;