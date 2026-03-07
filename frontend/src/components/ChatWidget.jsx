import React, { useEffect, useMemo, useRef, useState } from 'react';
import API from '../api/axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Loader2, MessageSquare, Send, Sparkles, X } from 'lucide-react';

const MotionButton = motion.button;
const MotionDiv = motion.div;
const MAX_HISTORY_FOR_API = 8;

const QUICK_PROMPTS = [
  'What roles is Rizvi currently targeting?',
  'Summarize Rizvi for a recruiter in 4 lines.',
  'List his strongest full-stack projects.',
  'List his strongest AI/ML projects.',
  'How can I contact him?',
];

const initialMessage = {
  role: 'ai',
  text: "Hi, I'm Rizvi's portfolio assistant. Ask me about his software engineering and AI/ML profile.",
};

const cleanAssistantText = (text) => {
  if (!text) return '';

  return String(text)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([initialMessage]);

  const messagesEndRef = useRef(null);

  const visibleQuickPrompts = useMemo(() => QUICK_PROMPTS.slice(0, 4), []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendPrompt = async (rawPrompt) => {
    const prompt = rawPrompt.trim();
    if (!prompt || loading) {
      return;
    }

    const userMessage = { role: 'user', text: prompt };
    const nextMessages = [...messages, userMessage];
    const history = nextMessages.slice(-MAX_HISTORY_FOR_API).map((item) => ({
      role: item.role,
      text: item.text,
    }));

    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const { data } = await API.post('/data/chat', { prompt, history });
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: cleanAssistantText(data.reply) || 'No response available yet.' },
      ]);
    } catch (error) {
      const fallback = error.response?.data?.reply || 'The assistant is unavailable right now. Please try again.';
      setMessages((prev) => [...prev, { role: 'ai', text: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendPrompt(input);
  };

  const handleQuickPrompt = async (prompt) => {
    setIsOpen(true);
    await sendPrompt(prompt);
  };

  return (
    <div className="pointer-events-auto fixed bottom-5 right-5 z-[9999] flex flex-col items-end font-sans">
      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.24 }}
            className="mb-3 flex h-[520px] w-[330px] flex-col overflow-hidden rounded-2xl border border-cyan-200/20 bg-slate-950/95 shadow-[0_18px_60px_rgba(3,8,20,0.65)] md:w-[390px]"
          >
            <div className="flex items-center justify-between border-b border-cyan-200/20 bg-gradient-to-r from-cyan-300/15 to-amber-200/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-cyan-300/40 bg-cyan-300/20 p-2 text-cyan-200">
                  <Bot size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">Rizvi AI Assistant</p>
                  <p className="text-[11px] text-slate-400">Recruiter-ready profile support</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 transition hover:text-slate-100"
                type="button"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            <div className="border-b border-white/10 bg-slate-900/70 px-3 py-2">
              <div className="flex flex-wrap gap-2">
                {visibleQuickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleQuickPrompt(prompt)}
                    disabled={loading}
                    className="rounded-full border border-white/10 bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-200 disabled:opacity-60"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'rounded-tr-sm bg-cyan-300 text-slate-950'
                        : 'rounded-tl-sm border border-white/10 bg-slate-800/85 text-slate-200'
                    }`}
                  >
                    {message.role === 'ai' && (
                      <span className="mb-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-cyan-300/90">
                        <Sparkles size={10} /> AI
                      </span>
                    )}
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-800/70 px-3 py-1 text-xs text-slate-300">
                  <Loader2 size={12} className="animate-spin" />
                  Thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 border-t border-white/10 bg-slate-900/95 p-3">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about experience, projects, skills, or contact..."
                className="flex-1 rounded-xl border border-white/10 bg-slate-800/80 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-300/60"
                maxLength={1200}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="rounded-xl border border-cyan-300/40 bg-cyan-300 p-2 text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Send message"
              >
                <Send size={17} />
              </button>
            </form>
          </MotionDiv>
        )}
      </AnimatePresence>

      {!isOpen && (
        <div className="mb-2 max-w-[240px] rounded-xl border border-cyan-300/25 bg-slate-900/85 px-3 py-2 text-[11px] text-slate-300 shadow-lg">
          Ask about software engineering, AI/ML, projects, or hiring fit.
        </div>
      )}

      <MotionButton
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-full border border-cyan-300/45 bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 shadow-[0_8px_24px_rgba(34,211,238,0.25)]"
      >
        <MessageSquare size={18} />
        {isOpen ? 'Close' : 'Ask Rizvi AI'}
      </MotionButton>
    </div>
  );
};

export default ChatWidget;
