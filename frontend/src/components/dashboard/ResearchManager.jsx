import React, { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { CalendarDays, Edit2, GripVertical, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const emptyForm = {
  title: '',
  type: 'Journal',
  publicationName: '',
  publicationDay: '',
  publicationMonth: '',
  publicationYear: '',
  doiLink: '',
  authors: '',
};

const MONTH_OPTIONS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const YEAR_OPTIONS = Array.from({ length: 61 }, (_, index) => String(new Date().getFullYear() - index));

const formatPublicationDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

const getDaysInMonth = (year, month) => {
  if (!year || !month) {
    return 31;
  }

  return new Date(Number(year), Number(month), 0).getDate();
};

const toDateValue = (year, month, day) => {
  if (!year || !month || !day) {
    return '';
  }

  return `${year}-${month}-${day}`;
};

const splitDateValue = (value) => {
  if (!value) {
    return { day: '', month: '', year: '' };
  }

  const [year = '', month = '', day = ''] = String(value).slice(0, 10).split('-');
  return { day, month, year };
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

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

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

    const publicationDate = toDateValue(
      formData.publicationYear,
      formData.publicationMonth,
      formData.publicationDay
    );

    const payload = {
      title: formData.title.trim(),
      type: formData.type,
      publicationName: formData.publicationName.trim(),
      publicationDate,
      doiLink: formData.doiLink.trim(),
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

      resetForm();
      fetchPapers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    }
  };

  const startEdit = (paper) => {
    const publicationDateParts = splitDateValue(paper.publicationDate);

    setFormData({
      title: paper.title || '',
      type: paper.type || 'Journal',
      publicationName: paper.publicationName || '',
      publicationDay: publicationDateParts.day,
      publicationMonth: publicationDateParts.month,
      publicationYear: publicationDateParts.year,
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

  const publicationDayOptions = Array.from(
    { length: getDaysInMonth(formData.publicationYear, formData.publicationMonth) },
    (_, index) => String(index + 1).padStart(2, '0')
  );

  return (
    <div>
      <div className="mb-7 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-100">Research Publications</h2>
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
          {isFormOpen ? <X size={16} /> : <Plus size={16} />} {isFormOpen ? 'Close' : 'Add Publication'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="glass-card mb-8 border-white/10 p-6 md:p-7">
          <div className="mb-6 border-b border-white/10 pb-5">
            <h3 className="text-lg font-semibold text-slate-100">
              {editingId ? 'Edit Publication' : 'Add Publication'}
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2 grid gap-2 text-sm">
              <span className="text-slate-300">Title</span>
              <input
                className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 outline-none transition focus:border-cyan-300/60"
                value={formData.title}
                onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                required
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="text-slate-300">Publication Type</span>
              <select
                className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 outline-none transition focus:border-cyan-300/60"
                value={formData.type}
                onChange={(event) => setFormData({ ...formData, type: event.target.value })}
              >
                <option value="Journal">Journal</option>
                <option value="Conference">Conference</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="text-slate-300">Publication Name</span>
              <input
                className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 outline-none transition focus:border-cyan-300/60"
                value={formData.publicationName}
                onChange={(event) => setFormData({ ...formData, publicationName: event.target.value })}
                required
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="text-slate-300">Publication Date</span>
              <div className="grid grid-cols-3 gap-3">
                <select
                  className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 outline-none transition focus:border-cyan-300/60"
                  value={formData.publicationMonth}
                  onChange={(event) =>
                    setFormData((current) => {
                      const nextMonth = event.target.value;
                      const maxDays = getDaysInMonth(current.publicationYear, nextMonth);
                      const nextDay =
                        current.publicationDay && Number(current.publicationDay) > maxDays
                          ? String(maxDays).padStart(2, '0')
                          : current.publicationDay;

                      return {
                        ...current,
                        publicationMonth: nextMonth,
                        publicationDay: nextDay,
                      };
                    })
                  }
                  required
                >
                  <option value="">Month</option>
                  {MONTH_OPTIONS.map((month, index) => (
                    <option key={month} value={String(index + 1).padStart(2, '0')}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 outline-none transition focus:border-cyan-300/60"
                  value={formData.publicationDay}
                  onChange={(event) => setFormData({ ...formData, publicationDay: event.target.value })}
                  required
                >
                  <option value="">Day</option>
                  {publicationDayOptions.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 outline-none transition focus:border-cyan-300/60"
                  value={formData.publicationYear}
                  onChange={(event) =>
                    setFormData((current) => {
                      const nextYear = event.target.value;
                      const maxDays = getDaysInMonth(nextYear, current.publicationMonth);
                      const nextDay =
                        current.publicationDay && Number(current.publicationDay) > maxDays
                          ? String(maxDays).padStart(2, '0')
                          : current.publicationDay;

                      return {
                        ...current,
                        publicationYear: nextYear,
                        publicationDay: nextDay,
                      };
                    })
                  }
                  required
                >
                  <option value="">Year</option>
                  {YEAR_OPTIONS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="text-slate-300">DOI / URL</span>
              <input
                className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 outline-none transition focus:border-cyan-300/60"
                value={formData.doiLink}
                onChange={(event) => setFormData({ ...formData, doiLink: event.target.value })}
              />
            </label>

            <label className="md:col-span-2 grid gap-2 text-sm">
              <span className="text-slate-300">Authors</span>
              <input
                className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 outline-none transition focus:border-cyan-300/60"
                value={formData.authors}
                onChange={(event) => setFormData({ ...formData, authors: event.target.value })}
              />
            </label>
          </div>

          <button className="mt-6 w-full rounded-xl border border-cyan-300/40 bg-cyan-300 py-3 text-sm font-bold uppercase tracking-wide text-slate-950">
            {editingId ? 'Update Publication' : 'Save Publication'}
          </button>
        </form>
      )}

      <div className="glass-card overflow-hidden border-white/10">
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-xs uppercase text-slate-400">
                <th className="p-4">Publication</th>
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
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-cyan-200">
                                  <span>{paper.publicationName}</span>
                                  <span>({paper.type})</span>
                                </div>
                                {paper.publicationDate && (
                                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400">
                                    <CalendarDays size={12} /> {formatPublicationDate(paper.publicationDate)}
                                  </p>
                                )}
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
