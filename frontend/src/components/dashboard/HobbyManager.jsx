import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { Heart, Plus, Trash2, Edit2, X, GripVertical, Smile } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const HobbyManager = () => {
  const [hobbies, setHobbies] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', description: '', icon: ''
  });

  useEffect(() => { fetchHobbies(); }, []);

  const fetchHobbies = async () => {
    try {
      const { data } = await API.get('/data/hobbies');
      setHobbies(data);
    } catch (err) { toast.error("Failed to fetch hobbies"); }
  };

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(hobbies);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setHobbies(items);
    try {
      await API.put('/data/reorder', { type: 'hobbies', items });
    } catch (err) { console.error("Reorder failed"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/data/hobbies/${editingId}`, formData);
        toast.success("Hobby updated!");
      } else {
        await API.post('/data/hobbies', formData);
        toast.success("Hobby added!");
      }
      resetForm();
      fetchHobbies();
    } catch (err) { toast.error("Save failed"); }
  };

  const startEdit = (hobby) => {
    setFormData(hobby);
    setEditingId(hobby._id);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', icon: '' });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete this hobby?")) {
      await API.delete(`/data/hobbies/${id}`);
      fetchHobbies();
      toast.warn("Hobby removed");
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="text-neon-pink" /> Interests & <span className="text-neon-pink">Hobbies</span>
          </h2>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-neon-pink px-4 py-2 rounded-lg flex items-center gap-2 font-bold hover:bg-pink-600 transition-all"
        >
          {isFormOpen ? <X size={20}/> : <Plus size={20}/>} {isFormOpen ? 'Cancel' : 'Add Interest'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="glass-card p-6 mb-12 border-t-2 border-neon-pink grid md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <input className="w-full bg-white/5 border border-white/10 p-3 rounded focus:border-neon-pink outline-none text-center"
              placeholder="Icon (e.g. 📷)"
              value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} />
            <p className="text-[10px] text-gray-500 mt-1 text-center">Windows: Win + . | Mac: Cmd + Ctrl + Space</p>
          </div>
            
          <div className="md:col-span-3">
             <input className="w-full bg-white/5 border border-white/10 p-3 rounded focus:border-neon-pink outline-none mb-3"
              placeholder="Hobby Name (e.g. Photography)"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
             
             <input className="w-full bg-white/5 border border-white/10 p-3 rounded focus:border-neon-pink outline-none"
              placeholder="Short Description (e.g. Capturing urban landscapes)"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <button className="md:col-span-4 bg-neon-pink py-3 rounded-lg font-bold hover:shadow-lg transition-all">
            {editingId ? 'Update Hobby' : 'Save Hobby'}
          </button>
        </form>
      )}

      {/* DRAG AND DROP GRID */}
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="hobbies-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hobbies.map((hobby, index) => (
                <Draggable key={hobby._id} draggableId={hobby._id} index={index}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`glass-card p-5 flex items-center gap-4 group hover:border-neon-pink/30 ${snapshot.isDragging ? 'border-neon-pink bg-white/5' : ''}`}
                    >
                      <div {...provided.dragHandleProps} className="text-gray-500 hover:text-white cursor-grab">
                        <GripVertical size={20} />
                      </div>

                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl">
                         {hobby.icon || <Smile size={20}/>}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-bold">{hobby.name}</h4>
                        <p className="text-xs text-gray-400">{hobby.description}</p>
                      </div>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(hobby)} className="text-blue-400 hover:text-white"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(hobby._id)} className="text-red-400 hover:text-white"><Trash2 size={16}/></button>
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

export default HobbyManager;