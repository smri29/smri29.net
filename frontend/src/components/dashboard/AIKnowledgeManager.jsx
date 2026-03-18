import React, { useCallback, useEffect, useState } from 'react';
import { Bot } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const emptyState = {
  assistantName: '',
  assistantSubtitle: '',
  primaryGoal: '',
  currentRole: '',
  location: '',
  opportunityFocus: '',
  contactEmail: '',
  portfolioUrl: '',
  linkedinUrl: '',
  githubUrl: '',
  kaggleUrl: '',
  facebookUrl: '',
  responseStyle: '',
  knowledgeBase: '',
  responseRules: '',
  additionalKnowledge: '',
  fallbackReply: '',
};

const AIKnowledgeManager = () => {
  const [formData, setFormData] = useState(emptyState);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await API.get('/data/ai-settings');
      setFormData({
        assistantName: data?.assistantName || '',
        assistantSubtitle: data?.assistantSubtitle || '',
        primaryGoal: data?.primaryGoal || '',
        currentRole: data?.currentRole || '',
        location: data?.location || '',
        opportunityFocus: data?.opportunityFocus || '',
        contactEmail: data?.contactEmail || '',
        portfolioUrl: data?.portfolioUrl || '',
        linkedinUrl: data?.linkedinUrl || '',
        githubUrl: data?.githubUrl || '',
        kaggleUrl: data?.kaggleUrl || '',
        facebookUrl: data?.facebookUrl || '',
        responseStyle: data?.responseStyle || '',
        knowledgeBase: data?.knowledgeBase || '',
        responseRules: data?.responseRules || '',
        additionalKnowledge: data?.additionalKnowledge || '',
        fallbackReply: data?.fallbackReply || '',
      });
    } catch (error) {
      toast.error('Failed to load AI knowledge settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await API.post('/data/ai-settings', formData);
      toast.success('AI knowledge updated');
      fetchSettings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    }
  };

  return (
    <div>
      <div className="mb-7">
        <h2 className="inline-flex items-center gap-2 text-2xl font-semibold text-slate-100">
          <Bot className="text-cyan-200" size={22} /> AI Knowledge
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Control the chatbot persona, full personal knowledge base, response behavior, and any extra facts not covered by the other admin sections.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card border-white/10 p-6 md:p-7">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Assistant Name</span>
            <input
              className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.assistantName}
              onChange={(event) => setFormData({ ...formData, assistantName: event.target.value })}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Assistant Subtitle</span>
            <input
              className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.assistantSubtitle}
              onChange={(event) => setFormData({ ...formData, assistantSubtitle: event.target.value })}
            />
          </label>

          <label className="md:col-span-2 grid gap-2 text-sm">
            <span className="text-slate-300">Primary Goal</span>
            <textarea
              className="h-24 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.primaryGoal}
              onChange={(event) => setFormData({ ...formData, primaryGoal: event.target.value })}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Current Role</span>
            <input
              className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.currentRole}
              onChange={(event) => setFormData({ ...formData, currentRole: event.target.value })}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Location</span>
            <input
              className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.location}
              onChange={(event) => setFormData({ ...formData, location: event.target.value })}
            />
          </label>

          <label className="md:col-span-2 grid gap-2 text-sm">
            <span className="text-slate-300">Opportunity Focus</span>
            <input
              className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.opportunityFocus}
              onChange={(event) => setFormData({ ...formData, opportunityFocus: event.target.value })}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Contact Email</span>
            <input
              className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.contactEmail}
              onChange={(event) => setFormData({ ...formData, contactEmail: event.target.value })}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Portfolio URL</span>
            <input
              className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.portfolioUrl}
              onChange={(event) => setFormData({ ...formData, portfolioUrl: event.target.value })}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">LinkedIn URL</span>
            <input
              className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.linkedinUrl}
              onChange={(event) => setFormData({ ...formData, linkedinUrl: event.target.value })}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">GitHub URL</span>
            <input
              className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.githubUrl}
              onChange={(event) => setFormData({ ...formData, githubUrl: event.target.value })}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Kaggle URL</span>
            <input
              className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.kaggleUrl}
              onChange={(event) => setFormData({ ...formData, kaggleUrl: event.target.value })}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Facebook URL</span>
            <input
              className="rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.facebookUrl}
              onChange={(event) => setFormData({ ...formData, facebookUrl: event.target.value })}
            />
          </label>

          <label className="md:col-span-2 grid gap-2 text-sm">
            <span className="text-slate-300">Response Style</span>
            <textarea
              className="h-28 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.responseStyle}
              onChange={(event) => setFormData({ ...formData, responseStyle: event.target.value })}
            />
          </label>

          <label className="md:col-span-2 grid gap-2 text-sm">
            <span className="text-slate-300">Core Knowledge Base</span>
            <textarea
              className="h-52 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.knowledgeBase}
              onChange={(event) => setFormData({ ...formData, knowledgeBase: event.target.value })}
            />
          </label>

          <label className="md:col-span-2 grid gap-2 text-sm">
            <span className="text-slate-300">Response Rules</span>
            <textarea
              className="h-32 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.responseRules}
              onChange={(event) => setFormData({ ...formData, responseRules: event.target.value })}
            />
          </label>

          <label className="md:col-span-2 grid gap-2 text-sm">
            <span className="text-slate-300">Supplemental Knowledge</span>
            <textarea
              className="h-32 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.additionalKnowledge}
              onChange={(event) => setFormData({ ...formData, additionalKnowledge: event.target.value })}
            />
          </label>

          <label className="md:col-span-2 grid gap-2 text-sm">
            <span className="text-slate-300">Fallback Reply</span>
            <textarea
              className="h-24 rounded-xl border border-white/10 bg-slate-900/50 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-300/60"
              value={formData.fallbackReply}
              onChange={(event) => setFormData({ ...formData, fallbackReply: event.target.value })}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl border border-cyan-300/40 bg-cyan-300 py-3 text-sm font-bold uppercase tracking-wide text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Save AI Knowledge
        </button>
      </form>
    </div>
  );
};

export default AIKnowledgeManager;
