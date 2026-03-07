import React, { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Award, Edit2, GripVertical, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const emptyForm = {
  name: '',
  issuingOrganization: '',
  issueDate: '',
  verificationLink: '',
  category: 'AI/ML',
};

const CertificateManager = () => {
  const [certs, setCerts] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchCerts = useCallback(async () => {
    try {
      const { data } = await API.get('/data/certificates');
      setCerts(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load certificates');
    }
  }, []);

  useEffect(() => {
    fetchCerts();
  }, [fetchCerts]);

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(certs);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setCerts(items);

    try {
      await API.put('/data/reorder', { type: 'certificates', items });
    } catch (error) {
      toast.error('Reorder failed');
      fetchCerts();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingId) {
        await API.put(`/data/certificates/${editingId}`, formData);
        toast.success('Certificate updated');
      } else {
        await API.post('/data/certificates', formData);
        toast.success('Certificate added');
      }

      setFormData(emptyForm);
      setEditingId(null);
      setIsFormOpen(false);
      fetchCerts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    }
  };

  const startEdit = (cert) => {
    setFormData({
      name: cert.name || '',
      issuingOrganization: cert.issuingOrganization || '',
      issueDate: cert.issueDate ? cert.issueDate.split('T')[0] : '',
      verificationLink: cert.verificationLink || '',
      category: cert.category || 'AI/ML',
    });
    setEditingId(cert._id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this certificate?')) {
      return;
    }

    try {
      await API.delete(`/data/certificates/${id}`);
      toast.info('Certificate removed');
      fetchCerts();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-slate-100">
          <Award className="text-cyan-200" size={22} /> Certifications
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
        <form onSubmit={handleSubmit} className="glass-card mb-8 grid gap-4 border-white/10 p-6 md:grid-cols-2">
          <input
            placeholder="Certificate Name"
            className="col-span-2 rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            required
          />

          <input
            placeholder="Issuing Organization"
            className="rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
            value={formData.issuingOrganization}
            onChange={(event) => setFormData({ ...formData, issuingOrganization: event.target.value })}
            required
          />

          <select
            className="rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
            value={formData.category}
            onChange={(event) => setFormData({ ...formData, category: event.target.value })}
          >
            <option value="AI/ML">AI/ML</option>
            <option value="Kaggle">Kaggle</option>
            <option value="Research">Research</option>
            <option value="Professional">Professional</option>
            <option value="Others">Others</option>
          </select>

          <input
            type="date"
            className="rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
            value={formData.issueDate}
            onChange={(event) => setFormData({ ...formData, issueDate: event.target.value })}
            required
          />

          <input
            placeholder="Verification URL"
            className="rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
            value={formData.verificationLink}
            onChange={(event) => setFormData({ ...formData, verificationLink: event.target.value })}
          />

          <button className="col-span-2 rounded-lg border border-cyan-300/40 bg-cyan-300 py-3 text-sm font-bold uppercase tracking-wide text-slate-950">
            {editingId ? 'Update Certificate' : 'Add Certificate'}
          </button>
        </form>
      )}

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="certs-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="grid gap-4">
              {certs.map((cert, index) => (
                <Draggable key={cert._id} draggableId={cert._id} index={index}>
                  {(draggableProvided, snapshot) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      className={`glass-card flex items-center justify-between gap-3 border-white/10 p-5 ${
                        snapshot.isDragging ? 'border-cyan-300/60 bg-slate-900' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div {...draggableProvided.dragHandleProps} className="mt-1 cursor-grab text-slate-500 hover:text-slate-100">
                          <GripVertical size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-100">{cert.name}</p>
                          <p className="text-xs text-slate-400">
                            {cert.issuingOrganization} • {new Date(cert.issueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => startEdit(cert)} className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-cyan-200" type="button">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(cert._id)} className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-red-400" type="button">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}

              {certs.length === 0 && <p className="text-sm text-slate-400">No certificates added yet.</p>}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default CertificateManager;
