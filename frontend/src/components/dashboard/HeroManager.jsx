import React, { useCallback, useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const emptyState = {
  availabilityText: '',
  roleTitles: '',
  summary: '',
};

const HeroManager = () => {
  const [formData, setFormData] = useState(emptyState);
  const [loading, setLoading] = useState(true);

  const fetchHero = useCallback(async () => {
    try {
      const { data } = await API.get('/data/hero');
      setFormData({
        availabilityText: data?.availabilityText || '',
        roleTitles: Array.isArray(data?.roleTitles) ? data.roleTitles.join(', ') : '',
        summary: data?.summary || '',
      });
    } catch (error) {
      toast.error('Failed to load hero content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHero();
  }, [fetchHero]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await API.post('/data/hero', {
        availabilityText: formData.availabilityText.trim(),
        roleTitles: formData.roleTitles
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        summary: formData.summary.trim(),
      });
      toast.success('Hero content updated');
      fetchHero();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    }
  };

  return (
    <div>
      <div className="mb-7">
        <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-slate-100">
          <Sparkles className="text-cyan-200" size={22} /> Hero Section
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Manage the hero badge, rotating role titles, and the summary shown beside the profile image.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card border-white/10 p-6 md:p-7">
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Availability Badge</span>
            <input
              className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.availabilityText}
              onChange={(event) => setFormData({ ...formData, availabilityText: event.target.value })}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Role Titles</span>
            <input
              className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.roleTitles}
              onChange={(event) => setFormData({ ...formData, roleTitles: event.target.value })}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Summary</span>
            <textarea
              className="h-36 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.summary}
              onChange={(event) => setFormData({ ...formData, summary: event.target.value })}
              required
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl border border-cyan-300/40 bg-cyan-300 py-3 text-sm font-bold uppercase tracking-wide text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Save Hero Content
        </button>
      </form>
    </div>
  );
};

export default HeroManager;
