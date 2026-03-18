import React, { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import {
  Briefcase,
  Building2,
  Calendar,
  Edit2,
  GripVertical,
  MapPin,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const emptyForm = {
  companyName: '',
  jobTitle: '',
  currentlyWorking: false,
  startMonth: '',
  startYear: '',
  endMonth: '',
  endYear: '',
  location: '',
  description: '',
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

const formatMonthLabel = (value) => {
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

const getExperienceRange = (experience) => {
  const startLabel = formatMonthLabel(experience.startDate);
  const endLabel = experience.currentlyWorking ? 'Present' : formatMonthLabel(experience.endDate);

  if (startLabel) {
    return endLabel ? `${startLabel} - ${endLabel}` : startLabel;
  }

  return experience.duration || 'Dates not added yet';
};

const toMonthValue = (year, month) => {
  if (!year || !month) {
    return '';
  }

  return `${year}-${month}`;
};

const splitMonthValue = (value) => {
  if (!value) {
    return { month: '', year: '' };
  }

  const [year = '', month = ''] = String(value).slice(0, 7).split('-');
  return { month, year };
};

const ExperienceManager = () => {
  const [experiences, setExperiences] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchExperience = useCallback(async () => {
    try {
      const { data } = await API.get('/data/experience');
      setExperiences(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch experience entries');
    }
  }, []);

  useEffect(() => {
    fetchExperience();
  }, [fetchExperience]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(experiences);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setExperiences(items);

    try {
      await API.put('/data/reorder', { type: 'experience', items });
    } catch (error) {
      toast.error('Reorder failed');
      fetchExperience();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const startDate = toMonthValue(formData.startYear, formData.startMonth);
    const endDate = formData.currentlyWorking ? '' : toMonthValue(formData.endYear, formData.endMonth);

    if (!formData.companyName.trim() || !formData.jobTitle.trim() || !startDate) {
      toast.error('Company name, job title, and start date are required');
      return;
    }

    if (!formData.currentlyWorking && !endDate) {
      toast.error('End date is required unless this is your current role');
      return;
    }

    if (endDate && startDate && endDate < startDate) {
      toast.error('End date cannot be earlier than start date');
      return;
    }

    const payload = {
      companyName: formData.companyName.trim(),
      jobTitle: formData.jobTitle.trim(),
      currentlyWorking: formData.currentlyWorking,
      startDate,
      endDate,
      location: formData.location.trim(),
      description: formData.description.trim(),
    };

    try {
      if (editingId) {
        await API.put(`/data/experience/${editingId}`, payload);
        toast.success('Experience updated');
      } else {
        await API.post('/data/experience', payload);
        toast.success('Experience added');
      }

      resetForm();
      fetchExperience();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    }
  };

  const startEdit = (experience) => {
    const startParts = splitMonthValue(experience.startDate);
    const endParts = splitMonthValue(experience.endDate);

    setFormData({
      companyName: experience.companyName || experience.company || '',
      jobTitle: experience.jobTitle || experience.role || '',
      currentlyWorking: Boolean(experience.currentlyWorking),
      startMonth: startParts.month,
      startYear: startParts.year,
      endMonth: endParts.month,
      endYear: endParts.year,
      location: experience.location || '',
      description: experience.description || '',
    });
    setEditingId(experience._id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this experience entry?')) {
      return;
    }

    try {
      await API.delete(`/data/experience/${id}`);
      toast.info('Experience removed');
      fetchExperience();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-slate-100">
            <Briefcase className="text-cyan-200" size={22} /> Work Experience
          </h2>
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
          {isFormOpen ? <X size={16} /> : <Plus size={16} />}
          {isFormOpen ? 'Close' : 'Add Experience'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="glass-card mb-8 border-white/10 p-6 md:p-7">
          <div className="mb-6 border-b border-white/10 pb-5">
            <h3 className="text-lg font-semibold text-slate-100">
              {editingId ? 'Edit Experience' : 'Add Experience'}
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="text-slate-300">Company Name</span>
              <input
                className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 outline-none transition focus:border-cyan-300/60"
                value={formData.companyName}
                onChange={(event) => setFormData({ ...formData, companyName: event.target.value })}
                required
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="text-slate-300">Job Title</span>
              <input
                className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 outline-none transition focus:border-cyan-300/60"
                value={formData.jobTitle}
                onChange={(event) => setFormData({ ...formData, jobTitle: event.target.value })}
                required
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="text-slate-300">Start Date</span>
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 outline-none transition focus:border-cyan-300/60"
                  value={formData.startMonth}
                  onChange={(event) => setFormData({ ...formData, startMonth: event.target.value })}
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
                  value={formData.startYear}
                  onChange={(event) => setFormData({ ...formData, startYear: event.target.value })}
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
              <span className="text-slate-300">End Date</span>
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 outline-none transition disabled:cursor-not-allowed disabled:opacity-50 focus:border-cyan-300/60"
                  value={formData.endMonth}
                  onChange={(event) => setFormData({ ...formData, endMonth: event.target.value })}
                  disabled={formData.currentlyWorking}
                  required={!formData.currentlyWorking}
                >
                  <option value="">Month</option>
                  {MONTH_OPTIONS.map((month, index) => (
                    <option key={month} value={String(index + 1).padStart(2, '0')}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 outline-none transition disabled:cursor-not-allowed disabled:opacity-50 focus:border-cyan-300/60"
                  value={formData.endYear}
                  onChange={(event) => setFormData({ ...formData, endYear: event.target.value })}
                  disabled={formData.currentlyWorking}
                  required={!formData.currentlyWorking}
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
              <span className="text-slate-300">Location</span>
              <input
                className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 outline-none transition focus:border-cyan-300/60"
                value={formData.location}
                onChange={(event) => setFormData({ ...formData, location: event.target.value })}
              />
            </label>

            <div className="grid content-end">
              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={formData.currentlyWorking}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      currentlyWorking: event.target.checked,
                      endMonth: event.target.checked ? '' : formData.endMonth,
                      endYear: event.target.checked ? '' : formData.endYear,
                    })
                  }
                  className="h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-300 focus:ring-cyan-300"
                />
                Currently work here
              </label>
            </div>

            <label className="md:col-span-2 grid gap-2 text-sm">
              <span className="text-slate-300">Description (Optional)</span>
              <textarea
                className="h-32 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 outline-none transition focus:border-cyan-300/60"
                value={formData.description}
                onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              />
            </label>
          </div>

          <button className="mt-6 w-full rounded-xl border border-cyan-300/40 bg-cyan-300 py-3 text-sm font-bold uppercase tracking-wide text-slate-950 transition hover:brightness-105">
            {editingId ? 'Update Experience' : 'Save Experience'}
          </button>
        </form>
      )}

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="experience-list">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {experiences.map((experience, index) => (
                <Draggable key={experience._id} draggableId={experience._id} index={index}>
                  {(draggableProvided, snapshot) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      className={`glass-card flex gap-4 border-white/10 p-5 md:p-6 ${
                        snapshot.isDragging ? 'border-cyan-300/60 bg-slate-900' : ''
                      }`}
                    >
                      <div {...draggableProvided.dragHandleProps} className="cursor-grab pt-1 text-slate-500 hover:text-slate-100">
                        <GripVertical size={18} />
                      </div>

                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                        <Building2 size={20} />
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold text-slate-100">
                                {experience.jobTitle || experience.role}
                              </h3>
                              {experience.currentlyWorking && (
                                <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-cyan-200">
                              {experience.companyName || experience.company}
                            </p>
                          </div>

                          <div className="space-y-1 text-xs text-slate-400 md:text-right">
                            <p className="inline-flex items-center gap-1 md:justify-end">
                              <Calendar size={12} /> {getExperienceRange(experience)}
                            </p>
                            {experience.location && (
                              <p className="inline-flex items-center gap-1 md:justify-end">
                                <MapPin size={12} /> {experience.location}
                              </p>
                            )}
                          </div>
                        </div>

                        {experience.description && (
                          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-300">
                            {experience.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => startEdit(experience)}
                          className="rounded-md p-2 text-slate-400 transition hover:bg-white/10 hover:text-cyan-200"
                          type="button"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(experience._id)}
                          className="rounded-md p-2 text-slate-400 transition hover:bg-white/10 hover:text-red-400"
                          type="button"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}

              {experiences.length === 0 && (
                <div className="glass-card border border-dashed border-white/10 p-8 text-center">
                  <p className="text-sm text-slate-300">No experience entries yet.</p>
                  <p className="mt-1 text-xs text-slate-500">Add your first role with company, title, dates, and location.</p>
                </div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ExperienceManager;
