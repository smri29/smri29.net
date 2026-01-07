import React, { useState, useRef, useEffect } from 'react';
import API from '../api/axios';
import { MessageSquare, Send, X, Bot, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi there! I'm Rizvi's AI. Curious about his research or skills? Ask away!" }
  ]);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      // Sending request to backend
      const { data } = await API.post('/data/chat', { prompt: userMsg });
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (error) {
      console.error("Chat Error Details:", error); // Check Console (F12) for exact error
      
      let errorMsg = "I can't reach the server right now.";
      if (error.response) {
        errorMsg = `Server Error: ${error.response.status}. Check backend terminal.`;
      } else if (error.request) {
        errorMsg = "Network Error. Ensure Backend is running on port 5000.";
      }

      setMessages(prev => [...prev, { role: 'ai', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-auto font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[320px] md:w-[380px] h-[500px] flex flex-col overflow-hidden shadow-2xl rounded-2xl bg-[#0a0a0a] border border-white/10"
          >
            {/* Header with Gradient */}
            <div className="p-4 bg-gradient-to-r from-neon-pink/20 to-purple-600/20 border-b border-white/10 flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-neon-pink to-purple-600 rounded-lg shadow-lg">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Rizvi AI</h3>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {m.role === 'ai' && (
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            <Sparkles size={14} className="text-neon-pink"/>
                        </div>
                    )}
                    <div className={`p-3 text-sm rounded-2xl leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-gradient-to-r from-neon-pink to-pink-600 text-white rounded-tr-none shadow-lg shadow-neon-pink/20' 
                        : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/10'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start pl-11">
                  <div className="bg-white/5 px-4 py-2 rounded-full flex gap-2 items-center text-xs text-gray-400 border border-white/5">
                    <Loader2 size={12} className="animate-spin" /> Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/40 backdrop-blur-md flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about my research..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-neon-pink/50 transition-colors text-white placeholder:text-gray-500"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || loading}
                className="p-2 bg-white/10 rounded-xl text-neon-pink hover:bg-neon-pink hover:text-white disabled:opacity-50 transition-all"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button - Updated Text & Gradient */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-3 bg-gradient-to-r from-neon-pink to-purple-600 text-white px-5 py-3 rounded-full shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all z-50 border border-white/20"
      >
        <span className="font-bold text-sm tracking-wide">Hi! Ask Me!</span>
        {isOpen ? <X size={20} /> : <MessageSquare size={20} fill="currentColor" />}
      </motion.button>
    </div>
  );
};

export default ChatWidget;