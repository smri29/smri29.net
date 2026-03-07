import React, { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Briefcase, Calendar, Edit2, GripVertical, MapPin, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const emptyForm = {
  role: '',
  company: '',
  duration: '',
  location: '',
  description: '',
};

const ExperienceManager = () => {
  const [experiences, setExperiences] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchExperience = useCallback(async () => {
    try {
      const { data } = await API.get('/data/experience');
      setExperiences(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch experience entries');
    }
  }, []);

  useEffect(() => {
    fetchExperience();
  }, [fetchExperience]);

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(experiences);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setExperiences(items);

    try {
      await API.put('/data/reorder', { type: 'experience', items });
    } catch (error) {
      toast.error('Reorder failed');
      fetchExperience();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingId) {
        await API.put(`/data/experience/${editingId}`, formData);
        toast.success('Experience updated');
      } else {
        await API.post('/data/experience', formData);
        toast.success('Experience added');
      }

      setFormData(emptyForm);
      setEditingId(null);
      setIsFormOpen(false);
      fetchExperience();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    }
  };

  const startEdit = (experience) => {
    setFormData({
      role: experience.role || '',
      company: experience.company || '',
      duration: experience.duration || '',
      location: experience.location || '',
      description: experience.description || '',
    });
    setEditingId(experience._id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this experience entry?')) {
      return;
    }

    try {
      await API.delete(`/data/experience/${id}`);
      toast.info('Experience removed');
      fetchExperience();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-slate-100">
          <Briefcase className="text-cyan-200" size={22} /> Work Experience
        </h2>

        <button
          onClick={() => setIsFormOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950"
          type="button"
        >
          {isFormOpen ? <X size={16} /> : <Plus size={16} />} {isFormOpen ? 'Close' : 'Add Role'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="glass-card mb-8 grid gap-4 border-white/10 p-6 md:grid-cols-2">
          <input
            className="rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
            placeholder="Job Role"
            value={formData.role}
            onChange={(event) => setFormData({ ...formData, role: event.target.value })}
            required
          />

          <input
            className="rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
            placeholder="Company"
            value={formData.company}
            onChange={(event) => setFormData({ ...formData, company: event.target.value })}
            required
          />

          <input
            className="rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
            placeholder="Duration"
            value={formData.duration}
            onChange={(event) => setFormData({ ...formData, duration: event.target.value })}
            required
          />

          <input
            className="rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
            placeholder="Location"
            value={formData.location}
            onChange={(event) => setFormData({ ...formData, location: event.target.value })}
          />

          <textarea
            className="col-span-2 h-32 rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
            placeholder="Role summary"
            value={formData.description}
            onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            required
          />

          <button className="col-span-2 rounded-lg border border-cyan-300/40 bg-cyan-300 py-3 text-sm font-bold uppercase tracking-wide text-slate-950">
            {editingId ? 'Update Experience' : 'Save Experience'}
          </button>
        </form>
      )}

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="experience-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {experiences.map((experience, index) => (
                <Draggable key={experience._id} draggableId={experience._id} index={index}>
                  {(draggableProvided, snapshot) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      className={`glass-card flex gap-4 border-white/10 p-5 ${
                        snapshot.isDragging ? 'border-cyan-300/60 bg-slate-900' : ''
                      }`}
                    >
                      <div {...draggableProvided.dragHandleProps} className="cursor-grab pt-1 text-slate-500 hover:text-slate-100">
                        <GripVertical size={18} />
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-100">{experience.role}</h3>
                            <p className="text-sm text-cyan-200">{experience.company}</p>
                          </div>
                          <div className="space-y-1 text-xs text-slate-400 md:text-right">
                            <p className="inline-flex items-center gap-1 md:justify-end">
                              <Calendar size={12} /> {experience.duration}
                            </p>
                            {experience.location && (
                              <p className="inline-flex items-center gap-1 md:justify-end">
                                <MapPin size={12} /> {experience.location}
                              </p>
                            )}
                          </div>
                        </div>

                        <p className="mt-3 whitespace-pre-line text-sm text-slate-300">{experience.description}</p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button onClick={() => startEdit(experience)} className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-cyan-200" type="button">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(experience._id)} className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-red-400" type="button">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}

              {experiences.length === 0 && <p className="text-sm text-slate-400">No experience entries yet.</p>}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ExperienceManager;
