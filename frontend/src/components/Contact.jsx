import React, { useState } from 'react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { Github, Linkedin, Mail, Send } from 'lucide-react';

const MotionSection = motion.section;
const MotionDiv = motion.div;

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
    <MotionSection
      id="contact"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      className="section-shell zone-blue px-6 py-24 md:px-8"
    >
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1.2fr]">
        <MotionDiv
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="glass-card card-sheen border-white/10 p-8"
        >
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
              className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/35 px-4 py-3 transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:text-cyan-200"
            >
              <Mail size={16} className="text-cyan-300" />
              smri29.ml@gmail.com
            </a>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.linkedin.com/in/smri29"
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-white/10 bg-slate-900/35 p-3 transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:text-cyan-200"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://github.com/smri29"
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-white/10 bg-slate-900/35 p-3 transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:text-cyan-200"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
            </div>
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.08 }}
          className="glass-card relative overflow-hidden border-white/10 p-8"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-cyan-300/10 via-white/0 to-amber-200/10" />
          <form onSubmit={handleSubmit} className="relative z-10 grid gap-4">
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm">
                <span className="text-slate-300">Name</span>
                <input
                  type="text"
                  className="rounded-2xl border border-white/10 bg-slate-900/55 px-4 py-3 outline-none transition focus:border-cyan-300/60 focus:bg-slate-900/75"
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
                  className="rounded-2xl border border-white/10 bg-slate-900/55 px-4 py-3 outline-none transition focus:border-cyan-300/60 focus:bg-slate-900/75"
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
                  className="rounded-2xl border border-white/10 bg-slate-900/55 px-4 py-3 outline-none transition focus:border-cyan-300/60 focus:bg-slate-900/75"
                  onChange={(event) => setForm({ ...form, message: event.target.value })}
                  value={form.message}
                  required
                  maxLength={3000}
                />
              </label>

              <button
                type="submit"
                disabled={sending}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/40 bg-cyan-300 px-4 py-3 text-sm font-bold uppercase tracking-wide text-slate-950 shadow-[0_16px_36px_rgba(34,211,238,0.14)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Send size={15} />
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </MotionDiv>
      </div>
    </MotionSection>
  );
};

export default Contact;
