import React, { useCallback, useEffect, useState } from 'react';
import { BookOpenText, Briefcase, Cpu, GraduationCap, Heart, Plus, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const ICON_OPTIONS = [
  { value: 'education', label: 'Education', icon: GraduationCap },
  { value: 'research', label: 'Research', icon: BookOpenText },
  { value: 'leadership', label: 'Leadership', icon: Briefcase },
  { value: 'skills', label: 'Skills', icon: Cpu },
  { value: 'interests', label: 'Interests', icon: Heart },
  { value: 'highlight', label: 'Highlight', icon: Sparkles },
];

const emptyHighlight = () => ({
  id: crypto.randomUUID(),
  title: '',
  detail: '',
  iconKey: 'education',
});

const emptyState = {
  introLabel: 'Introduction',
  headingPrimary: '',
  headingAccent: '',
  description: '',
  highlights: [emptyHighlight(), emptyHighlight(), emptyHighlight()],
};

const IntroductionManager = () => {
  const [formData, setFormData] = useState(emptyState);
  const [loading, setLoading] = useState(true);

  const fetchIntroduction = useCallback(async () => {
    try {
      const { data } = await API.get('/data/introduction');
      setFormData({
        introLabel: data?.introLabel || 'Introduction',
        headingPrimary: data?.headingPrimary || '',
        headingAccent: data?.headingAccent || '',
        description: data?.description || '',
        highlights: Array.isArray(data?.highlights) && data.highlights.length > 0
          ? data.highlights.map((item) => ({
              id: item._id || crypto.randomUUID(),
              title: item.title || '',
              detail: item.detail || '',
              iconKey: item.iconKey || 'education',
            }))
          : [emptyHighlight(), emptyHighlight(), emptyHighlight()],
      });
    } catch (error) {
      toast.error('Failed to load introduction content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntroduction();
  }, [fetchIntroduction]);

  const updateHighlight = (id, key, value) => {
    setFormData((current) => ({
      ...current,
      highlights: current.highlights.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addHighlight = () => {
    setFormData((current) => ({
      ...current,
      highlights: [...current.highlights, emptyHighlight()],
    }));
  };

  const removeHighlight = (id) => {
    setFormData((current) => ({
      ...current,
      highlights:
        current.highlights.length > 1
          ? current.highlights.filter((item) => item.id !== id)
          : [emptyHighlight()],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      introLabel: formData.introLabel.trim(),
      headingPrimary: formData.headingPrimary.trim(),
      headingAccent: formData.headingAccent.trim(),
      description: formData.description.trim(),
      highlights: formData.highlights.map((item, index) => ({
        title: item.title.trim(),
        detail: item.detail.trim(),
        iconKey: item.iconKey,
        order: index,
      })),
    };

    try {
      await API.post('/data/introduction', payload);
      toast.success('Introduction updated');
      fetchIntroduction();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    }
  };

  return (
    <div>
      <div className="mb-7">
        <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-slate-100">
          <BookOpenText className="text-cyan-200" size={22} /> Introduction
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Manage the introductory heading, summary, and highlight cards shown in the About section.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card border-white/10 p-6 md:p-7">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Section Label</span>
            <input
              className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.introLabel}
              onChange={(event) => setFormData({ ...formData, introLabel: event.target.value })}
            />
          </label>

          <div className="hidden md:block" />

          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Heading Primary</span>
            <input
              className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.headingPrimary}
              onChange={(event) => setFormData({ ...formData, headingPrimary: event.target.value })}
              required
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Heading Accent</span>
            <input
              className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.headingAccent}
              onChange={(event) => setFormData({ ...formData, headingAccent: event.target.value })}
            />
          </label>

          <label className="md:col-span-2 grid gap-2 text-sm">
            <span className="text-slate-300">Description</span>
            <textarea
              className="h-32 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              required
            />
          </label>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-slate-100">Highlight Cards</h3>
            <button
              type="button"
              onClick={addHighlight}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15"
            >
              <Plus size={15} /> Add Card
            </button>
          </div>

          <div className="grid gap-4">
            {formData.highlights.map((item, index) => {
              const selectedOption = ICON_OPTIONS.find((option) => option.value === item.iconKey) || ICON_OPTIONS[0];
              const PreviewIcon = selectedOption.icon;

              return (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/35 p-4">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="inline-flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
                        <PreviewIcon size={18} />
                      </div>
                      <span className="text-sm font-semibold text-slate-200">Card {index + 1}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeHighlight(item.id)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-red-400"
                      aria-label="Remove highlight card"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[180px_1fr_1fr]">
                    <label className="grid gap-2 text-sm">
                      <span className="text-slate-300">Icon</span>
                      <select
                        className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
                        value={item.iconKey}
                        onChange={(event) => updateHighlight(item.id, 'iconKey', event.target.value)}
                      >
                        {ICON_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2 text-sm">
                      <span className="text-slate-300">Title</span>
                      <input
                        className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
                        value={item.title}
                        onChange={(event) => updateHighlight(item.id, 'title', event.target.value)}
                      />
                    </label>

                    <label className="grid gap-2 text-sm">
                      <span className="text-slate-300">Detail</span>
                      <input
                        className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
                        value={item.detail}
                        onChange={(event) => updateHighlight(item.id, 'detail', event.target.value)}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl border border-cyan-300/40 bg-cyan-300 py-3 text-sm font-bold uppercase tracking-wide text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Save Introduction
        </button>
      </form>
    </div>
  );
};

export default IntroductionManager;
