import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { Cpu, Save, Trash2, Plus, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const SkillManager = () => {
  const [skillsData, setSkillsData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // Selected Object from DB
  const [currentSkills, setCurrentSkills] = useState('');
  
  // State for creating a new category
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => { fetchSkills(); }, []);

  const fetchSkills = async () => {
    try {
      const { data } = await API.get('/data/skills');
      setSkillsData(data);
      // Select the first category by default if none selected
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0]);
        setCurrentSkills(data[0].skillsList.join(', '));
      } else if (selectedCategory) {
        // Refresh the currently selected data
        const updated = data.find(d => d._id === selectedCategory._id);
        if (updated) setCurrentSkills(updated.skillsList.join(', '));
      }
    } catch (err) { console.error("Fetch error", err); }
  };

  // --- REORDER CATEGORIES ---
  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;
    
    const items = Array.from(skillsData);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSkillsData(items); // Update Sidebar instantly

    try {
      await API.put('/data/reorder', { type: 'skills', items });
    } catch (err) { 
      toast.error("Reorder failed"); 
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!selectedCategory && !newCategoryName) return;

    const categoryName = isAddingNew ? newCategoryName : selectedCategory.category;
    
    try {
      const payload = {
        category: categoryName,
        skillsList: currentSkills.split(',').map(s => s.trim()).filter(s => s !== '')
      };
      
      const { data } = await API.post('/data/skills', payload);
      toast.success(`${categoryName} updated!`);
      
      // Reset states
      setIsAddingNew(false);
      setNewCategoryName('');
      
      // If it was new, select it
      if (isAddingNew) {
         setSelectedCategory(data);
         // We need to re-fetch to get the full list including the new one
         await fetchSkills();
      } else {
         fetchSkills();
      }
    } catch (err) { toast.error("Failed to save"); }
  };

  const handleDeleteCategory = async (id) => {
    if(!window.confirm("Delete this entire category?")) return;
    try {
      await API.delete(`/data/skills/${id}`);
      const remaining = skillsData.filter(s => s._id !== id);
      setSkillsData(remaining);
      if (remaining.length > 0) {
        setSelectedCategory(remaining[0]);
        setCurrentSkills(remaining[0].skillsList.join(', '));
      } else {
        setSelectedCategory(null);
        setCurrentSkills('');
      }
      toast.info("Category removed");
    } catch (err) { toast.error("Delete failed"); }
  };

  const handleSelectCategory = (cat) => {
    setIsAddingNew(false);
    setSelectedCategory(cat);
    setCurrentSkills(cat.skillsList.join(', '));
  };

  const initAddNew = () => {
    setIsAddingNew(true);
    setSelectedCategory(null);
    setCurrentSkills('');
    setNewCategoryName('');
  };

  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-2"><Cpu className="text-neon-pink" /> Skill Matrix</h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* SIDEBAR: DRAGGABLE CATEGORIES */}
        <div className="md:col-span-1 space-y-3">
          <div className="flex justify-between items-center px-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Categories</label>
            <button onClick={initAddNew} className="text-xs flex items-center gap-1 text-neon-pink hover:text-white">
              <Plus size={14}/> New
            </button>
          </div>

          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="skills-sidebar">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {skillsData.map((cat, index) => (
                    <Draggable key={cat._id} draggableId={cat._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          onClick={() => handleSelectCategory(cat)}
                          className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all border border-transparent ${
                            selectedCategory?._id === cat._id && !isAddingNew
                              ? 'bg-white/10 text-neon-pink border-neon-pink/50' 
                              : 'text-gray-400 hover:bg-white/5 hover:text-white'
                          } ${snapshot.isDragging ? 'bg-[#1a1a1a] shadow-xl z-50' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div {...provided.dragHandleProps} className="text-gray-600 hover:text-white cursor-grab">
                              <GripVertical size={16} />
                            </div>
                            <span className="text-sm font-medium">{cat.category}</span>
                          </div>
                          
                          {/* Delete Button (Only shows on hover or selected) */}
                          {(selectedCategory?._id === cat._id) && (
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat._id); }} className="text-gray-600 hover:text-red-500">
                                <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          
          {/* "Adding New" State UI */}
          {isAddingNew && (
             <div className="px-4 py-3 rounded-lg bg-neon-pink/10 border border-neon-pink text-neon-pink text-sm font-bold flex items-center gap-2">
                <Plus size={16} /> Creating New...
             </div>
          )}
        </div>

        {/* MAIN CONTENT: EDITOR */}
        <div className="md:col-span-2">
          <div className="glass-card p-8 border-t-2 border-neon-pink min-h-[400px]">
            {isAddingNew ? (
               <div className="mb-6">
                 <label className="text-xs uppercase text-gray-500 font-bold mb-2 block">New Category Name</label>
                 <input 
                   autoFocus
                   className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-neon-pink"
                   placeholder="e.g. Cloud Computing"
                   value={newCategoryName}
                   onChange={(e) => setNewCategoryName(e.target.value)}
                 />
               </div>
            ) : selectedCategory ? (
               <h3 className="text-xl font-bold mb-4 flex justify-between">
                 Manage {selectedCategory.category}
               </h3>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <Cpu size={48} className="mb-4 opacity-20"/>
                  <p>Select a category to edit or create a new one.</p>
               </div>
            )}

            {(selectedCategory || isAddingNew) && (
              <>
                <p className="text-gray-500 text-sm mb-6">Enter skills separated by commas (e.g., Docker, Kubernetes, AWS)</p>
                <textarea
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl h-48 focus:border-neon-pink outline-none text-lg leading-relaxed font-mono"
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                  placeholder="Start typing skills..."
                />

                <button
                  onClick={handleSave}
                  className="w-full mt-6 bg-neon-pink py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-pink-600 transition-all shadow-lg"
                >
                  <Save size={20}/> {isAddingNew ? 'Create Category' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillManager;