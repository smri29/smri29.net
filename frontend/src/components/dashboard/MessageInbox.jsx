import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, Mail, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const MessageInbox = () => {
  const [messages, setMessages] = useState([]);

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await API.get('/data/messages');
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load inbox');
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) {
      return;
    }

    try {
      await API.delete(`/data/messages/${id}`);
      toast.success('Message deleted');
      setMessages((prev) => prev.filter((message) => message._id !== id));
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <h2 className="mb-7 inline-flex items-center gap-2 text-2xl font-semibold text-slate-100">
        <Mail className="text-cyan-200" size={22} /> Recruiter Inquiries
      </h2>

      <div className="space-y-4">
        {messages.map((message) => (
          <article key={message._id} className="glass-card border-white/10 p-5">
            <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full border border-cyan-300/40 bg-cyan-300/15 text-lg font-bold uppercase text-cyan-200">
                  {message.name?.[0] || '?'}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">{message.name}</h3>
                  <p className="text-xs text-slate-400">{message.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <Calendar size={12} /> {new Date(message.createdAt).toLocaleString()}
                </div>
                <button
                  onClick={() => deleteMessage(message._id)}
                  className="rounded-md p-2 text-slate-400 transition hover:bg-white/10 hover:text-red-400"
                  type="button"
                  aria-label="Delete message"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p className="rounded-lg border border-white/10 bg-slate-900/60 p-4 text-sm leading-relaxed text-slate-300">
              {message.message}
            </p>
          </article>
        ))}

        {messages.length === 0 && <p className="py-16 text-center text-sm text-slate-400">No messages yet.</p>}
      </div>
    </div>
  );
};

export default MessageInbox;
