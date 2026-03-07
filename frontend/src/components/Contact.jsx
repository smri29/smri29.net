import React, { useState } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { Github, Linkedin, Mail, Send } from 'lucide-react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);

    try {
      await API.post('/data/contact', form);
      toast.success('Thanks for reaching out. I will respond shortly.');
      setForm({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="px-6 py-24 md:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="glass-card border-white/10 p-8">
          <h2 className="section-title font-serif text-4xl">
            Let&apos;s <span className="text-cyan-200">Connect</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            I am open to AI/ML internships, research collaboration, and full-stack engineering opportunities.
            Share your idea or role details and I will follow up.
          </p>

          <div className="mt-8 space-y-4 text-sm text-slate-300">
            <a
              href="mailto:smri29.ml@gmail.com"
              className="inline-flex items-center gap-3 rounded-lg border border-white/10 px-4 py-3 transition hover:border-cyan-300/40 hover:text-cyan-200"
            >
              <Mail size={16} className="text-cyan-300" />
              smri29.ml@gmail.com
            </a>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.linkedin.com/in/smri29"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-white/10 p-3 transition hover:border-cyan-300/40 hover:text-cyan-200"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://github.com/smri29"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-white/10 p-3 transition hover:border-cyan-300/40 hover:text-cyan-200"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-card border-white/10 p-8">
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm">
              <span className="text-slate-300">Name</span>
              <input
                type="text"
                className="rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 outline-none transition focus:border-cyan-300/60"
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                value={form.name}
                required
                maxLength={120}
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="text-slate-300">Email</span>
              <input
                type="email"
                className="rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 outline-none transition focus:border-cyan-300/60"
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                value={form.email}
                required
                maxLength={160}
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="text-slate-300">Message</span>
              <textarea
                rows="6"
                className="rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 outline-none transition focus:border-cyan-300/60"
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                value={form.message}
                required
                maxLength={3000}
              />
            </label>

            <button
              type="submit"
              disabled={sending}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-300 px-4 py-3 text-sm font-bold uppercase tracking-wide text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Send size={15} />
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
