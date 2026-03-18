import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import {
  Award,
  Edit2,
  ExternalLink,
  GripVertical,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const CERT_CATEGORIES = ['AI/ML', 'Kaggle', 'Research', 'Professional', 'Others'];
const MAX_HOME_CERTIFICATES = 3;

const emptyForm = {
  name: '',
  issuingOrganization: '',
  issueDate: '',
  verificationLink: '',
  category: 'AI/ML',
  featuredOnHome: false,
};

const formatIssueDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
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

  const groupedCerts = useMemo(() => {
    return certs.reduce((acc, cert) => {
      const category = CERT_CATEGORIES.includes(cert.category) ? cert.category : 'Others';
      acc[category].push(cert);
      return acc;
    }, Object.fromEntries(CERT_CATEGORIES.map((category) => [category, []])));
  }, [certs]);

  const featuredCountByCategory = useMemo(() => {
    return certs.reduce((acc, cert) => {
      const category = CERT_CATEGORIES.includes(cert.category) ? cert.category : 'Others';
      acc[category] = (acc[category] || 0) + (cert.featuredOnHome ? 1 : 0);
      return acc;
    }, Object.fromEntries(CERT_CATEGORIES.map((category) => [category, 0])));
  }, [certs]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;

    const sourceCategory = result.source.droppableId.replace('certs-', '');
    const destinationCategory = result.destination.droppableId.replace('certs-', '');
    if (sourceCategory !== destinationCategory) {
      toast.error('Certificates can only be reordered within the same category');
      return;
    }

    const items = Array.from(groupedCerts[sourceCategory] || []);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    const reordered = certs.map((cert) => {
      if ((cert.category || 'Others') !== sourceCategory) {
        return cert;
      }

      return items.shift();
    });

    setCerts(reordered);

    try {
      await API.put('/data/reorder', { type: 'certificates', items: reordered });
    } catch (error) {
      toast.error('Reorder failed');
      fetchCerts();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      name: formData.name.trim(),
      issuingOrganization: formData.issuingOrganization.trim(),
      verificationLink: formData.verificationLink.trim(),
    };

    try {
      if (editingId) {
        await API.put(`/data/certificates/${editingId}`, payload);
        toast.success('Certificate updated');
      } else {
        await API.post('/data/certificates', payload);
        toast.success('Certificate added');
      }

      resetForm();
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
      featuredOnHome: Boolean(cert.featuredOnHome),
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

  const handleHomepageToggle = async (cert) => {
    const category = cert.category || 'Others';
    const nextValue = !cert.featuredOnHome;
    const featuredCount = featuredCountByCategory[category] || 0;

    if (nextValue && featuredCount >= MAX_HOME_CERTIFICATES) {
      toast.error(`Only ${MAX_HOME_CERTIFICATES} certificates in ${category} can be shown on the homepage`);
      return;
    }

    try {
      await API.put(`/data/certificates/${cert._id}`, {
        featuredOnHome: nextValue,
      });
      toast.success(nextValue ? 'Added to homepage' : 'Removed from homepage');
      fetchCerts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update homepage visibility');
    }
  };

  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-slate-100">
            <Award className="text-cyan-200" size={22} /> Certifications
          </h2>
          <p className="mt-1 text-sm text-slate-400">Select up to 3 certificates per category to show on the homepage.</p>
        </div>
        <button
          onClick={() => {
            if (isFormOpen && !editingId) {
              resetForm();
              return;
            }

            setIsFormOpen((prev) => !prev);
            if (isFormOpen && editingId) {
              resetForm();
            }
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950"
          type="button"
        >
          {isFormOpen ? <X size={16} /> : <Plus size={16} />} {isFormOpen ? 'Close' : 'Add'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="glass-card mb-8 grid gap-4 border-white/10 p-6 md:grid-cols-2">
          <input
            className="col-span-2 rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            required
          />

          <input
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
            {CERT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
            value={formData.issueDate}
            onChange={(event) => setFormData({ ...formData, issueDate: event.target.value })}
            required
          />

          <input
            className="rounded-lg border border-white/10 bg-slate-900/50 p-3 outline-none focus:border-cyan-300/60"
            value={formData.verificationLink}
            onChange={(event) => setFormData({ ...formData, verificationLink: event.target.value })}
          />

          <label className="col-span-2 flex items-center gap-3 rounded-lg border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={formData.featuredOnHome}
              onChange={(event) => setFormData({ ...formData, featuredOnHome: event.target.checked })}
              className="h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-300 focus:ring-cyan-300"
            />
            Show on homepage
          </label>

          <button className="col-span-2 rounded-lg border border-cyan-300/40 bg-cyan-300 py-3 text-sm font-bold uppercase tracking-wide text-slate-950">
            {editingId ? 'Update Certificate' : 'Add Certificate'}
          </button>
        </form>
      )}

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <div className="space-y-8">
          {CERT_CATEGORIES.map((category) => {
            const items = groupedCerts[category] || [];
            if (!items.length) return null;

            return (
              <section key={category}>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-100">{category}</h3>
                    <span className="rounded-full border border-white/10 bg-slate-900/50 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-200">
                      Homepage {featuredCountByCategory[category] || 0}/{MAX_HOME_CERTIFICATES}
                    </span>
                  </div>
                </div>

                <Droppable droppableId={`certs-${category}`}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="grid gap-4">
                      {items.map((cert, index) => (
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
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium text-slate-100">{cert.name}</p>
                                    {cert.featuredOnHome && (
                                      <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                                        Homepage
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-400">
                                    {cert.issuingOrganization} • {formatIssueDate(cert.issueDate)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleHomepageToggle(cert)}
                                  className={`rounded-md border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                                    cert.featuredOnHome
                                      ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-200 hover:bg-cyan-300/15'
                                      : 'border-white/10 text-slate-300 hover:border-cyan-300/35 hover:text-cyan-200'
                                  }`}
                                  type="button"
                                >
                                  <span className="inline-flex items-center gap-1.5">
                                    <ShieldCheck size={13} />
                                    {cert.featuredOnHome ? 'Selected' : 'Show'}
                                  </span>
                                </button>
                                {cert.verificationLink && (
                                  <a
                                    href={cert.verificationLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-md p-2 text-slate-400 transition hover:bg-white/10 hover:text-cyan-200"
                                    aria-label="Open verification link"
                                  >
                                    <ExternalLink size={16} />
                                  </a>
                                )}
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

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </section>
            );
          })}

          {certs.length === 0 && <p className="text-sm text-slate-400">No certificates added yet.</p>}
        </div>
      </DragDropContext>
    </div>
  );
};

export default CertificateManager;
