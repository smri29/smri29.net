import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { Mail, Calendar, User, Trash2 } from 'lucide-react';

const MessageInbox = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMsgs = async () => {
      const { data } = await API.get('/data/messages');
      setMessages(data);
    };
    fetchMsgs();
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-2"><Mail className="text-neon-pink" /> Recruiter Inquiries</h2>
      <div className="space-y-4">
        {messages.map(msg => (
          <div key={msg._id} className="glass-card p-6 group relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neon-pink/20 flex items-center justify-center text-neon-pink uppercase font-bold text-xl">
                  {msg.name[0]}
                </div>
                <div>
                  <h4 className="font-bold flex items-center gap-2 underline decoration-neon-pink/30">{msg.name}</h4>
                  <p className="text-xs text-gray-500">{msg.email}</p>
                </div>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <Calendar size={12}/> {new Date(msg.createdAt).toLocaleString()}
              </div>
            </div>
            <p className="text-gray-300 bg-white/5 p-4 rounded-lg text-sm italic border-l-2 border-white/10">"{msg.message}"</p>
          </div>
        ))}
        {messages.length === 0 && <p className="text-center text-gray-600 py-20 italic">No messages yet.</p>}
      </div>
    </div>
  );
};

export default MessageInbox;