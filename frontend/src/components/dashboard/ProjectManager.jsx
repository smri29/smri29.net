import React, { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Code2, Edit2, Github, GripVertical, Link as LinkIcon, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const emptyForm = {
  projectName: '',
  description: '',
  techStack: '',
  category: 'AI/ML',
  githubLink: '',
  liveLink: '',
  role: 'Lead Developer',
  contributors: '',
};

const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchProjects = useCallback(async () => {
    try {
      const { data } = await API.get('/data/projects');
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Could not fetch projects');
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(projects);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setProjects(items);

    try {
      await API.put('/data/reorder', { type: 'projects', items });
    } catch (error) {
      toast.error('Reorder failed');
      fetchProjects();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      techStack: formData.techStack
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      contributors: formData.contributors
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      if (editingId) {
        await API.put(`/data/projects/${editingId}`, payload);
        toast.success('Project updated');
      } else {
        await API.post('/data/projects', payload);
        toast.success('Project created');
      }

      setFormData(emptyForm);
      setEditingId(null);
      setIsFormOpen(false);
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save project');
    }
  };

  const startEdit = (project) => {
    setFormData({
      projectName: project.projectName || '',
      description: project.description || '',
      techStack: Array.isArray(project.techStack) ? project.techStack.join(', ') : '',
      category: project.category || 'AI/ML',
      githubLink: project.githubLink || '',
      liveLink: project.liveLink || '',
      role: project.role || 'Lead Developer',
      contributors: Array.isArray(project.contributors) ? project.contributors.join(', ') : '',
    });
    setEditingId(project._id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) {
      return;
    }

    try {
      await API.delete(`/data/projects/${id}`);
      toast.info('Project removed');
      fetchProjects();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-slate-100">
            <Code2 className="text-cyan-200" size={22} /> Projects
          </h2>
          <p className="mt-1 text-sm text-slate-400">Manage your technical project showcase.</p>
        </div>

        <button
          onClick={() => setIsFormOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950"
          type="button"
        >
          {isFormOpen ? <X size={16} /> : <Plus size={16} />} {isFormOpen ? 'Close' : 'New Project'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="glass-card mb-8 grid gap-4 border-white/10 p-6 md:grid-cols-2">
          <div className="md:col-span-1">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Project Name</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
              value={formData.projectName}
              onChange={(event) => setFormData({ ...formData, projectName: event.target.value })}
              required
            />
          </div>

          <div className="md:col-span-1">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Category</label>
            <select
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
              value={formData.category}
              onChange={(event) => setFormData({ ...formData, category: event.target.value })}
            >
              <option value="AI/ML">AI/ML</option>
              <option value="MERN">MERN</option>
              <option value="Flutter">Flutter</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Description</label>
            <textarea
              className="h-28 w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Tech Stack</label>
            <input
              placeholder="React, Node.js, MongoDB"
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
              value={formData.techStack}
              onChange={(event) => setFormData({ ...formData, techStack: event.target.value })}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Role</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
              value={formData.role}
              onChange={(event) => setFormData({ ...formData, role: event.target.value })}
            />
          </div>

          <div>
            <label className="mb-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-400">
              <Github size={12} /> GitHub URL
            </label>
            <input
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
              value={formData.githubLink}
              onChange={(event) => setFormData({ ...formData, githubLink: event.target.value })}
            />
          </div>

          <div>
            <label className="mb-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-400">
              <LinkIcon size={12} /> Live URL
            </label>
            <input
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
              value={formData.liveLink}
              onChange={(event) => setFormData({ ...formData, liveLink: event.target.value })}
            />
          </div>

          <div className="col-span-2">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Contributors</label>
            <input
              placeholder="Name 1, Name 2"
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
              value={formData.contributors}
              onChange={(event) => setFormData({ ...formData, contributors: event.target.value })}
            />
          </div>

          <button className="col-span-2 rounded-lg border border-cyan-300/40 bg-cyan-300 py-3 text-sm font-bold uppercase tracking-wide text-slate-950">
            {editingId ? 'Update Project' : 'Publish Project'}
          </button>
        </form>
      )}

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="projects-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="grid gap-4">
              {projects.map((project, index) => (
                <Draggable key={project._id} draggableId={project._id} index={index}>
                  {(draggableProvided, snapshot) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      className={`glass-card flex items-center justify-between gap-3 border-white/10 p-5 ${
                        snapshot.isDragging ? 'border-cyan-300/60 bg-slate-900' : ''
                      }`}
                    >
                      <div className="flex flex-1 items-start gap-3">
                        <div {...draggableProvided.dragHandleProps} className="mt-1 cursor-grab text-slate-500 hover:text-slate-100">
                          <GripVertical size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-100">{project.projectName}</h3>
                            <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-cyan-200">{project.category}</span>
                          </div>
                          <p className="line-clamp-1 text-sm text-slate-400">{project.description}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {(project.techStack || []).map((tag, idx) => (
                              <span key={`${tag}-${idx}`} className="rounded-full border border-white/10 bg-slate-800/70 px-2 py-0.5 text-[10px] text-slate-300">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => startEdit(project)} className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-cyan-200" type="button">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(project._id)} className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-red-400" type="button">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}

              {projects.length === 0 && <p className="text-sm text-slate-400">No projects added yet.</p>}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ProjectManager;
