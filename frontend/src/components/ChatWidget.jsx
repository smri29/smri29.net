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
  text: "Hi, I'm RAI, Rizvi's personalized AI. Ask anything about Rizvi.",
};

const cleanAssistantText = (text) => {
  if (!text) return '';

  return String(text)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '- ')
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
            className="mb-3 flex h-[520px] w-[330px] flex-col overflow-hidden rounded-2xl border border-emerald-200/20 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.16),_rgba(18,24,38,0.97)_40%,_rgba(8,13,24,0.98)_100%)] shadow-[0_18px_60px_rgba(7,14,28,0.56)] md:w-[390px]"
          >
            <div className="flex items-center justify-between border-b border-emerald-200/15 bg-gradient-to-r from-emerald-300/20 via-teal-300/10 to-cyan-300/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-emerald-300/35 bg-emerald-300/15 p-2 text-emerald-200">
                  <Bot size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">RAI</p>
                  <p className="text-[11px] text-slate-400">Rizvi&apos;s personalized AI</p>
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

            <div className="border-b border-white/10 bg-slate-900/35 px-3 py-2 backdrop-blur-sm">
              <div className="flex flex-wrap gap-2">
                {visibleQuickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleQuickPrompt(prompt)}
                    disabled={loading}
                    className="rounded-full border border-white/10 bg-slate-900/55 px-2.5 py-1 text-[11px] text-slate-300 transition hover:border-emerald-300/40 hover:text-emerald-200 disabled:opacity-60"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,rgba(8,14,24,0.1),rgba(6,11,20,0.34))] p-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'rounded-tr-sm bg-emerald-300 text-slate-950'
                        : 'rounded-tl-sm border border-emerald-200/12 bg-slate-900/70 text-slate-200 backdrop-blur-sm'
                    }`}
                  >
                    {message.role === 'ai' && (
                      <span className="mb-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-emerald-300/90">
                        <Sparkles size={10} /> RAI
                      </span>
                    )}
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-xs text-slate-300">
                  <Loader2 size={12} className="animate-spin" />
                  Thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 border-t border-white/10 bg-slate-950/60 p-3 backdrop-blur-sm">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask anything about Rizvi..."
                className="flex-1 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-300/60"
                maxLength={1200}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="rounded-xl border border-emerald-300/40 bg-emerald-300 p-2 text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Send message"
              >
                <Send size={17} />
              </button>
            </form>
          </MotionDiv>
        )}
      </AnimatePresence>

      {!isOpen && (
        <div className="mb-2 max-w-[240px] rounded-xl border border-emerald-300/25 bg-slate-900/80 px-3 py-2 text-[11px] text-slate-300 shadow-lg backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300/40">
          Ask anything about Rizvi.
        </div>
      )}

      <MotionButton
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-full border border-emerald-300/45 bg-emerald-300 px-4 py-3 text-sm font-bold text-slate-950 shadow-[0_8px_24px_rgba(74,222,128,0.25)]"
      >
        <MessageSquare size={18} />
        {isOpen ? 'Close' : 'Ask RAI'}
      </MotionButton>
    </div>
  );
};

export default ChatWidget;
