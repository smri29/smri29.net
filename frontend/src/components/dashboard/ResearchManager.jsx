import React, { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Edit2, GripVertical, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const emptyForm = {
  title: '',
  abstract: '',
  type: 'Journal',
  publicationName: '',
  publicationDate: '',
  doiLink: '',
  authors: '',
};

const ResearchManager = () => {
  const [papers, setPapers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const fetchPapers = useCallback(async () => {
    try {
      const { data } = await API.get('/data/research');
      setPapers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load research entries');
    }
  }, []);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(papers);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setPapers(items);

    try {
      await API.put('/data/reorder', { type: 'research', items });
    } catch (error) {
      toast.error('Reorder failed');
      fetchPapers();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      authors: formData.authors
        .split(',')
        .map((author) => author.trim())
        .filter(Boolean),
    };

    try {
      if (editingId) {
        await API.put(`/data/research/${editingId}`, payload);
        toast.success('Publication updated');
      } else {
        await API.post('/data/research', payload);
        toast.success('Publication added');
      }

      setFormData(emptyForm);
      setEditingId(null);
      setIsFormOpen(false);
      fetchPapers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    }
  };

  const startEdit = (paper) => {
    setFormData({
      title: paper.title || '',
      abstract: paper.abstract || '',
      type: paper.type || 'Journal',
      publicationName: paper.publicationName || '',
      publicationDate: paper.publicationDate ? paper.publicationDate.split('T')[0] : '',
      doiLink: paper.doiLink || '',
      authors: Array.isArray(paper.authors) ? paper.authors.join(', ') : '',
    });
    setEditingId(paper._id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this publication?')) {
      return;
    }

    try {
      await API.delete(`/data/research/${id}`);
      toast.info('Publication removed');
      fetchPapers();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-100">Research Publications</h2>
        <button
          onClick={() => setIsFormOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950"
          type="button"
        >
          {isFormOpen ? <X size={16} /> : <Plus size={16} />} {isFormOpen ? 'Close' : 'Add Paper'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="glass-card mb-8 grid gap-4 border-white/10 p-6 md:grid-cols-2">
          <input
            placeholder="Title"
            className="col-span-2 rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
            value={formData.title}
            onChange={(event) => setFormData({ ...formData, title: event.target.value })}
            required
          />

          <textarea
            placeholder="Abstract"
            className="col-span-2 h-32 rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
            value={formData.abstract}
            onChange={(event) => setFormData({ ...formData, abstract: event.target.value })}
            required
          />

          <select
            className="rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
            value={formData.type}
            onChange={(event) => setFormData({ ...formData, type: event.target.value })}
          >
            <option value="Journal">Journal</option>
            <option value="Conference">Conference</option>
          </select>

          <input
            placeholder="Journal/Conference Name"
            className="rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
            value={formData.publicationName}
            onChange={(event) => setFormData({ ...formData, publicationName: event.target.value })}
            required
          />

          <input
            type="date"
            className="rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
            value={formData.publicationDate}
            onChange={(event) => setFormData({ ...formData, publicationDate: event.target.value })}
            required
          />

          <input
            placeholder="DOI / URL"
            className="rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
            value={formData.doiLink}
            onChange={(event) => setFormData({ ...formData, doiLink: event.target.value })}
          />

          <input
            placeholder="Authors (comma separated)"
            className="col-span-2 rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
            value={formData.authors}
            onChange={(event) => setFormData({ ...formData, authors: event.target.value })}
          />

          <button className="col-span-2 rounded-lg border border-cyan-300/40 bg-cyan-300 py-3 text-sm font-bold uppercase tracking-wide text-slate-950">
            {editingId ? 'Update Publication' : 'Save Publication'}
          </button>
        </form>
      )}

      <div className="glass-card overflow-hidden border-white/10">
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-xs uppercase text-slate-400">
                <th className="p-4">Paper</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <Droppable droppableId="research-list">
              {(provided) => (
                <tbody ref={provided.innerRef} {...provided.droppableProps}>
                  {papers.map((paper, index) => (
                    <Draggable key={paper._id} draggableId={paper._id} index={index}>
                      {(draggableProvided, snapshot) => (
                        <tr
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                          className={`border-t border-white/5 ${snapshot.isDragging ? 'bg-white/5' : ''}`}
                        >
                          <td className="p-4">
                            <div className="flex items-start gap-3">
                              <div
                                {...draggableProvided.dragHandleProps}
                                className="mt-1 cursor-grab text-slate-500 hover:text-slate-200"
                              >
                                <GripVertical size={18} />
                              </div>
                              <div>
                                <p className="font-medium text-slate-100">{paper.title}</p>
                                <p className="text-xs text-cyan-200">
                                  {paper.publicationName} ({paper.type})
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-3">
                              <button onClick={() => startEdit(paper)} className="text-slate-400 hover:text-cyan-200" type="button">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => handleDelete(paper._id)} className="text-slate-400 hover:text-red-400" type="button">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}

                  {papers.length === 0 && (
                    <tr>
                      <td colSpan={2} className="p-6 text-center text-sm text-slate-400">
                        No publications added yet.
                      </td>
                    </tr>
                  )}

                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </table>
        </DragDropContext>
      </div>
    </div>
  );
};

export default ResearchManager;
