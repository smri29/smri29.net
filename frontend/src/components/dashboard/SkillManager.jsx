import React, { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Cpu, GripVertical, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const SkillManager = () => {
  const [skillsData, setSkillsData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentSkills, setCurrentSkills] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const fetchSkills = useCallback(async () => {
    try {
      const { data } = await API.get('/data/skills');
      const list = Array.isArray(data) ? data : [];
      setSkillsData(list);

      if (!list.length) {
        setSelectedCategory(null);
        setCurrentSkills('');
        return;
      }

      if (!selectedCategory) {
        setSelectedCategory(list[0]);
        setCurrentSkills((list[0].skillsList || []).join(', '));
        return;
      }

      const updated = list.find((item) => item._id === selectedCategory._id);
      if (updated) {
        setSelectedCategory(updated);
        setCurrentSkills((updated.skillsList || []).join(', '));
      }
    } catch (error) {
      toast.error('Failed to load skills');
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(skillsData);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setSkillsData(items);

    try {
      await API.put('/data/reorder', { type: 'skills', items });
    } catch (error) {
      toast.error('Reorder failed');
      fetchSkills();
    }
  };

  const handleSave = async () => {
    const categoryName = isAddingNew ? newCategoryName.trim() : selectedCategory?.category;
    if (!categoryName) {
      toast.error('Category name is required');
      return;
    }

    try {
      const payload = {
        category: categoryName,
        skillsList: currentSkills
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const { data } = await API.post('/data/skills', payload);
      toast.success(`${categoryName} saved`);
      setIsAddingNew(false);
      setNewCategoryName('');
      setSelectedCategory(data);
      await fetchSkills();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save skills');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) {
      return;
    }

    try {
      await API.delete(`/data/skills/${id}`);
      toast.info('Category deleted');
      await fetchSkills();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleSelectCategory = (category) => {
    setIsAddingNew(false);
    setSelectedCategory(category);
    setCurrentSkills((category.skillsList || []).join(', '));
  };

  const initAddNew = () => {
    setIsAddingNew(true);
    setSelectedCategory(null);
    setCurrentSkills('');
    setNewCategoryName('');
  };

  return (
    <div>
      <h2 className="mb-7 inline-flex items-center gap-2 text-2xl font-semibold text-slate-100">
        <Cpu className="text-cyan-200" size={22} /> Skill Matrix
      </h2>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Categories</span>
            <button onClick={initAddNew} className="inline-flex items-center gap-1 text-xs text-cyan-200" type="button">
              <Plus size={13} /> New
            </button>
          </div>

          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="skills-sidebar">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {skillsData.map((category, index) => (
                    <Draggable key={category._id} draggableId={category._id} index={index}>
                      {(draggableProvided, snapshot) => (
                        <div
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          onClick={() => handleSelectCategory(category)}
                          className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition ${
                            selectedCategory?._id === category._id && !isAddingNew
                              ? 'border-cyan-300/45 bg-cyan-300/15 text-cyan-100'
                              : 'border-white/10 bg-slate-900/50 text-slate-300 hover:border-white/20'
                          } ${snapshot.isDragging ? 'bg-slate-900' : ''}`}
                        >
                          <div className="flex items-center gap-2">
                            <div {...draggableProvided.dragHandleProps} className="cursor-grab text-slate-500 hover:text-slate-100">
                              <GripVertical size={15} />
                            </div>
                            <span>{category.category}</span>
                          </div>

                          {selectedCategory?._id === category._id && (
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteCategory(category._id);
                              }}
                              className="text-slate-500 hover:text-red-400"
                              type="button"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {skillsData.length === 0 && <p className="text-sm text-slate-400">No skill categories yet.</p>}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="md:col-span-2">
          <div className="glass-card border-white/10 p-6">
            {isAddingNew ? (
              <div className="mb-4">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">New Category Name</label>
                <input
                  autoFocus
                  className="w-full rounded-lg border border-white/10 bg-slate-900/60 p-3 outline-none focus:border-cyan-300/60"
                  placeholder="Cloud, MLOps, etc"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                />
              </div>
            ) : selectedCategory ? (
              <h3 className="mb-4 text-xl font-semibold text-slate-100">Manage {selectedCategory.category}</h3>
            ) : (
              <p className="mb-4 text-sm text-slate-400">Select a category or create a new one.</p>
            )}

            {(selectedCategory || isAddingNew) && (
              <>
                <p className="mb-3 text-xs text-slate-400">Use commas to separate skills (Docker, AWS, FastAPI).</p>
                <textarea
                  className="h-48 w-full rounded-xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-100 outline-none focus:border-cyan-300/60"
                  value={currentSkills}
                  onChange={(event) => setCurrentSkills(event.target.value)}
                  placeholder="Add skills here..."
                />

                <button
                  onClick={handleSave}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-300 py-3 text-sm font-bold uppercase tracking-wide text-slate-950"
                  type="button"
                >
                  <Save size={16} /> {isAddingNew ? 'Create Category' : 'Save Changes'}
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
