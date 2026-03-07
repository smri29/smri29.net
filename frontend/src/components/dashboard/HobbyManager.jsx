import React, { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Edit2, GripVertical, Heart, Plus, Smile, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const emptyForm = {
  name: '',
  description: '',
  icon: '',
};

const HobbyManager = () => {
  const [hobbies, setHobbies] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchHobbies = useCallback(async () => {
    try {
      const { data } = await API.get('/data/hobbies');
      setHobbies(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch hobbies');
    }
  }, []);

  useEffect(() => {
    fetchHobbies();
  }, [fetchHobbies]);

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(hobbies);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setHobbies(items);

    try {
      await API.put('/data/reorder', { type: 'hobbies', items });
    } catch (error) {
      toast.error('Reorder failed');
      fetchHobbies();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingId) {
        await API.put(`/data/hobbies/${editingId}`, formData);
        toast.success('Hobby updated');
      } else {
        await API.post('/data/hobbies', formData);
        toast.success('Hobby added');
      }

      setFormData(emptyForm);
      setEditingId(null);
      setIsFormOpen(false);
      fetchHobbies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    }
  };

  const startEdit = (hobby) => {
    setFormData({
      name: hobby.name || '',
      description: hobby.description || '',
      icon: hobby.icon || '',
    });
    setEditingId(hobby._id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this hobby?')) {
      return;
    }

    try {
      await API.delete(`/data/hobbies/${id}`);
      toast.info('Hobby removed');
      fetchHobbies();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-slate-100">
          <Heart className="text-cyan-200" size={22} /> Interests and Hobbies
        </h2>

        <button
          onClick={() => setIsFormOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950"
          type="button"
        >
          {isFormOpen ? <X size={16} /> : <Plus size={16} />} {isFormOpen ? 'Close' : 'Add'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="glass-card mb-8 grid gap-4 border-white/10 p-6 md:grid-cols-4">
          <div className="md:col-span-1">
            <input
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 text-center outline-none focus:border-cyan-300/60"
              placeholder="Icon"
              value={formData.icon}
              onChange={(event) => setFormData({ ...formData, icon: event.target.value })}
              maxLength={16}
            />
            <p className="mt-1 text-center text-[10px] text-slate-500">Emoji or short symbol</p>
          </div>

          <div className="space-y-3 md:col-span-3">
            <input
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
              placeholder="Hobby Name"
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              required
            />

            <input
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
              placeholder="Short Description"
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            />
          </div>

          <button className="md:col-span-4 rounded-lg border border-cyan-300/40 bg-cyan-300 py-3 text-sm font-bold uppercase tracking-wide text-slate-950">
            {editingId ? 'Update Hobby' : 'Save Hobby'}
          </button>
        </form>
      )}

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="hobbies-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {hobbies.map((hobby, index) => (
                <Draggable key={hobby._id} draggableId={hobby._id} index={index}>
                  {(draggableProvided, snapshot) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      className={`glass-card flex items-center gap-4 border-white/10 p-4 ${
                        snapshot.isDragging ? 'border-cyan-300/60 bg-slate-900' : ''
                      }`}
                    >
                      <div {...draggableProvided.dragHandleProps} className="cursor-grab text-slate-500 hover:text-slate-100">
                        <GripVertical size={18} />
                      </div>

                      <div className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-slate-800/70 text-xl text-cyan-200">
                        {hobby.icon || <Smile size={18} />}
                      </div>

                      <div className="flex-1">
                        <p className="font-medium text-slate-100">{hobby.name}</p>
                        <p className="text-xs text-slate-400">{hobby.description}</p>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => startEdit(hobby)} className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-cyan-200" type="button">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(hobby._id)} className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-red-400" type="button">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}

              {hobbies.length === 0 && <p className="text-sm text-slate-400">No hobbies added yet.</p>}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default HobbyManager;
