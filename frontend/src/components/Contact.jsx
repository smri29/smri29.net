import React, { useState } from 'react';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { Mail, Linkedin, Github } from 'lucide-react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/data/contact', form);
      toast.success("Thank you! I will get back to you shortly.");
      setForm({ name: '', email: '', message: '' });
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-4xl font-bold mb-6">Let's <span className="text-neon-pink">Connect</span></h2>
          <p className="text-gray-400 mb-8">
            I am currently open to Internships, Research Assistant roles, or Junior Developer positions. 
            Whether you have a question or just want to say hi, my inbox is always open.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-gray-300">
              <Mail className="text-neon-pink" size={20} />
              <span>smri29.ml@gmail.com</span>
            </div>
            <div className="flex gap-4 pt-4">
               <a href="https://linkedin.com" className="p-3 glass-card hover:text-neon-pink transition-all"><Linkedin size={20}/></a>
               <a href="https://github.com" className="p-3 glass-card hover:text-neon-pink transition-all"><Github size={20}/></a>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-4">
          <input 
            type="text" placeholder="Name" 
            className="w-full bg-white/5 border border-white/10 p-3 rounded-lg outline-none focus:border-neon-pink"
            onChange={e => setForm({...form, name: e.target.value})} value={form.name} required
          />
          <input 
            type="email" placeholder="Email" 
            className="w-full bg-white/5 border border-white/10 p-3 rounded-lg outline-none focus:border-neon-pink"
            onChange={e => setForm({...form, email: e.target.value})} value={form.email} required
          />
          <textarea 
            placeholder="Message" rows="5" 
            className="w-full bg-white/5 border border-white/10 p-3 rounded-lg outline-none focus:border-neon-pink"
            onChange={e => setForm({...form, message: e.target.value})} value={form.message} required
          ></textarea>
          <button className="w-full bg-neon-pink py-3 rounded-lg font-bold hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all">
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;