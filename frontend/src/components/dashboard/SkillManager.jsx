import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import {
  Check,
  Cpu,
  GripVertical,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const emptyDraft = {
  category: '',
  skillsList: [],
};

const SkillManager = () => {
  const [skillsData, setSkillsData] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [editingSkillIndex, setEditingSkillIndex] = useState(null);
  const [editingSkillValue, setEditingSkillValue] = useState('');

  const fetchSkills = useCallback(async () => {
    try {
      const { data } = await API.get('/data/skills');
      const list = Array.isArray(data) ? data : [];
      setSkillsData(list);

      if (!list.length) {
        setSelectedCategoryId(null);
        setDraft(emptyDraft);
        return;
      }

      const activeId = selectedCategoryId && list.some((item) => item._id === selectedCategoryId)
        ? selectedCategoryId
        : list[0]._id;
      const activeCategory = list.find((item) => item._id === activeId);
      if (!isAddingNew && activeCategory) {
        setSelectedCategoryId(activeId);
        setDraft({
          category: activeCategory.category || '',
          skillsList: Array.isArray(activeCategory.skillsList) ? activeCategory.skillsList : [],
        });
      }
    } catch (error) {
      toast.error('Failed to load skills');
    }
  }, [isAddingNew, selectedCategoryId]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const selectedCategory = useMemo(
    () => skillsData.find((item) => item._id === selectedCategoryId) || null,
    [selectedCategoryId, skillsData]
  );

  const resetSkillEditor = () => {
    setNewSkill('');
    setEditingSkillIndex(null);
    setEditingSkillValue('');
  };

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

  const handleSelectCategory = (category) => {
    setIsAddingNew(false);
    setSelectedCategoryId(category._id);
    setDraft({
      category: category.category || '',
      skillsList: Array.isArray(category.skillsList) ? category.skillsList : [],
    });
    resetSkillEditor();
  };

  const initAddNew = () => {
    setIsAddingNew(true);
    setSelectedCategoryId(null);
    setDraft(emptyDraft);
    resetSkillEditor();
  };

  const handleAddSkill = () => {
    const normalized = newSkill.trim();
    if (!normalized) {
      return;
    }

    if (draft.skillsList.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
      toast.error('This skill already exists in the category');
      return;
    }

    setDraft((current) => ({
      ...current,
      skillsList: [...current.skillsList, normalized],
    }));
    setNewSkill('');
  };

  const handleDeleteSkill = (indexToDelete) => {
    setDraft((current) => ({
      ...current,
      skillsList: current.skillsList.filter((_, index) => index !== indexToDelete),
    }));

    if (editingSkillIndex === indexToDelete) {
      resetSkillEditor();
    }
  };

  const startSkillEdit = (skill, index) => {
    setEditingSkillIndex(index);
    setEditingSkillValue(skill);
  };

  const applySkillEdit = () => {
    const normalized = editingSkillValue.trim();
    if (editingSkillIndex === null || !normalized) {
      return;
    }

    if (
      draft.skillsList.some(
        (item, index) => index !== editingSkillIndex && item.toLowerCase() === normalized.toLowerCase()
      )
    ) {
      toast.error('This skill already exists in the category');
      return;
    }

    setDraft((current) => ({
      ...current,
      skillsList: current.skillsList.map((item, index) =>
        index === editingSkillIndex ? normalized : item
      ),
    }));
    resetSkillEditor();
  };

  const handleSave = async () => {
    const categoryName = draft.category.trim();
    if (!categoryName) {
      toast.error('Category name is required');
      return;
    }

    if (!draft.skillsList.length) {
      toast.error('Add at least one skill');
      return;
    }

    try {
      const payload = {
        ...(selectedCategory ? { id: selectedCategory._id } : {}),
        category: categoryName,
        skillsList: draft.skillsList,
      };

      const { data } = await API.post('/data/skills', payload);
      toast.success(`${categoryName} saved`);
      setIsAddingNew(false);
      setSelectedCategoryId(data._id);
      resetSkillEditor();
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
      setSelectedCategoryId(null);
      setDraft(emptyDraft);
      await fetchSkills();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const canManage = isAddingNew || Boolean(selectedCategory);

  return (
    <div>
      <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-slate-100">
            <Cpu className="text-cyan-200" size={22} /> Skill Matrix
          </h2>
          <p className="mt-1 text-sm text-slate-400">Organize each category with clean, individual skill items.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-3">
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
                        <button
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          onClick={() => handleSelectCategory(category)}
                          type="button"
                          className={`w-full rounded-xl border p-4 text-left transition ${
                            selectedCategoryId === category._id && !isAddingNew
                              ? 'border-cyan-300/45 bg-cyan-300/15 text-cyan-100'
                              : 'border-white/10 bg-slate-800/45 text-slate-300 hover:border-white/20'
                          } ${snapshot.isDragging ? 'bg-slate-800' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2">
                              <div {...draggableProvided.dragHandleProps} className="cursor-grab pt-0.5 text-slate-500 hover:text-slate-100">
                                <GripVertical size={15} />
                              </div>
                              <div>
                                <p className="font-medium">{category.category}</p>
                                <p className="mt-1 text-xs text-slate-400">
                                  {(category.skillsList || []).length} skill{(category.skillsList || []).length === 1 ? '' : 's'}
                                </p>
                              </div>
                            </div>

                            {selectedCategoryId === category._id && !isAddingNew && (
                              <span className="rounded-full border border-white/10 bg-slate-900/45 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-200">
                                Active
                              </span>
                            )}
                          </div>
                        </button>
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

        <div className="min-w-0 glass-card border-white/10 p-6 md:p-7">
          {canManage ? (
            <>
              <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
                <div className="w-full max-w-xl">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
                    Category Name
                  </label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-slate-900/55 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
                    value={draft.category}
                    onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                  />
                </div>

                {!isAddingNew && selectedCategory && (
                  <button
                    onClick={() => handleDeleteCategory(selectedCategory._id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm text-slate-300 transition hover:border-red-400/35 hover:text-red-300"
                    type="button"
                  >
                    <Trash2 size={15} /> Delete Category
                  </button>
                )}
              </div>

              <div className="grid gap-4 2xl:grid-cols-[320px_minmax(0,1fr)]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-800/45 p-4">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
                      Add Skill
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 rounded-xl border border-white/10 bg-slate-900/55 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
                        value={newSkill}
                        onChange={(event) => setNewSkill(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            handleAddSkill();
                          }
                        }}
                      />
                      <button
                        onClick={handleAddSkill}
                        type="button"
                        className="rounded-xl border border-cyan-300/40 bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:brightness-105"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {editingSkillIndex !== null && (
                    <div className="rounded-2xl border border-white/10 bg-slate-800/45 p-4">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
                        Edit Skill
                      </label>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 rounded-xl border border-white/10 bg-slate-900/55 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60"
                          value={editingSkillValue}
                          onChange={(event) => setEditingSkillValue(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              applySkillEdit();
                            }
                          }}
                        />
                        <button
                          onClick={applySkillEdit}
                          type="button"
                          className="rounded-xl border border-cyan-300/40 bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={resetSkillEditor}
                          type="button"
                          className="rounded-xl border border-white/10 px-4 py-3 text-slate-300 transition hover:border-white/20"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="min-w-0 rounded-2xl border border-white/10 bg-slate-800/35 p-4">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Skills</p>
                      <h3 className="mt-1 text-xl font-semibold text-slate-100">
                        {draft.category || 'New Category'}
                      </h3>
                    </div>
                    <span className="rounded-full border border-white/10 bg-slate-900/45 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-200">
                      {draft.skillsList.length} Items
                    </span>
                  </div>

                  {draft.skillsList.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {draft.skillsList.map((skill, index) => (
                        <div
                          key={`${skill}-${index}`}
                          className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/55 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-300/30"
                        >
                          <span>{skill}</span>
                          <button
                            onClick={() => startSkillEdit(skill, index)}
                            type="button"
                            className="text-slate-500 transition hover:text-cyan-200"
                            aria-label={`Edit ${skill}`}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteSkill(index)}
                            type="button"
                            className="text-slate-500 transition hover:text-red-400"
                            aria-label={`Delete ${skill}`}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No skills added yet.</p>
                  )}
                </div>
              </div>

              <button
                onClick={handleSave}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-300 py-3 text-sm font-bold uppercase tracking-wide text-slate-950"
                type="button"
              >
                <Save size={16} /> {isAddingNew ? 'Create Category' : 'Save Changes'}
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-400">Select a category or create a new one.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillManager;
