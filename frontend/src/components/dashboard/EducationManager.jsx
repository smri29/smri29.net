import React, { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Edit2, GraduationCap, GripVertical, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const emptyForm = {
  degree: '',
  institution: '',
  grade: '',
  year: '',
};

const EducationManager = () => {
  const [education, setEducation] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchEducation = useCallback(async () => {
    try {
      const { data } = await API.get('/data/education');
      setEducation(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch education');
    }
  }, []);

  useEffect(() => {
    fetchEducation();
  }, [fetchEducation]);

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(education);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setEducation(items);

    try {
      await API.put('/data/reorder', { type: 'education', items });
    } catch (error) {
      toast.error('Reorder failed');
      fetchEducation();
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingId) {
        await API.put(`/data/education/${editingId}`, formData);
        toast.success('Education updated');
      } else {
        await API.post('/data/education', formData);
        toast.success('Education added');
      }

      resetForm();
      fetchEducation();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    }
  };

  const startEdit = (item) => {
    setFormData({
      degree: item.degree || '',
      institution: item.institution || '',
      grade: item.grade || '',
      year: item.year || '',
    });
    setEditingId(item._id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this education entry?')) {
      return;
    }

    try {
      await API.delete(`/data/education/${id}`);
      toast.info('Education removed');
      fetchEducation();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-slate-100">
          <GraduationCap className="text-cyan-200" size={22} /> Education
        </h2>

        <button
          onClick={() => {
            if (isFormOpen) {
              resetForm();
              return;
            }

            setFormData(emptyForm);
            setEditingId(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950"
          type="button"
        >
          {isFormOpen ? <X size={16} /> : <Plus size={16} />} {isFormOpen ? 'Close' : 'Add Education'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="glass-card mb-8 grid gap-4 border-white/10 p-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Degree</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 text-slate-100 outline-none focus:border-cyan-300/60"
              value={formData.degree}
              onChange={(event) => setFormData({ ...formData, degree: event.target.value })}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Institution</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 text-slate-100 outline-none focus:border-cyan-300/60"
              value={formData.institution}
              onChange={(event) => setFormData({ ...formData, institution: event.target.value })}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Grade</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 text-slate-100 outline-none focus:border-cyan-300/60"
              value={formData.grade}
              onChange={(event) => setFormData({ ...formData, grade: event.target.value })}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Year</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 text-slate-100 outline-none focus:border-cyan-300/60"
              value={formData.year}
              onChange={(event) => setFormData({ ...formData, year: event.target.value })}
              required
            />
          </div>

          <button className="md:col-span-2 rounded-lg border border-cyan-300/40 bg-cyan-300 py-3 text-sm font-bold uppercase tracking-wide text-slate-950">
            {editingId ? 'Update Education' : 'Save Education'}
          </button>
        </form>
      )}

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="education-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="grid gap-4 md:grid-cols-2">
              {education.map((item, index) => (
                <Draggable key={item._id} draggableId={item._id} index={index}>
                  {(draggableProvided, snapshot) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      className={`glass-card flex items-start gap-4 border-white/10 p-5 ${
                        snapshot.isDragging ? 'border-cyan-300/60 bg-slate-900' : ''
                      }`}
                    >
                      <div {...draggableProvided.dragHandleProps} className="mt-1 cursor-grab text-slate-500 hover:text-slate-100">
                        <GripVertical size={18} />
                      </div>

                      <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-slate-800/65 text-cyan-200">
                        <GraduationCap size={18} />
                      </div>

                      <div className="flex-1">
                        <p className="text-lg font-semibold text-slate-100">{item.degree}</p>
                        <p className="mt-1 text-sm text-cyan-200">{item.institution}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
                          {item.grade && (
                            <span className="rounded-full border border-white/10 bg-slate-800/70 px-3 py-1">
                              Grade: {item.grade}
                            </span>
                          )}
                          <span className="rounded-full border border-white/10 bg-slate-800/70 px-3 py-1">
                            Year: {item.year}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-cyan-200"
                          type="button"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-red-400"
                          type="button"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}

              {education.length === 0 && <p className="text-sm text-slate-400">No education entries added yet.</p>}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default EducationManager;
