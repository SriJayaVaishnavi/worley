import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { cn, renderBold } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface CopilotProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
}

export const Copilot: React.FC<CopilotProps> = ({ messages, onSendMessage, isTyping }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-worley-navy text-white rounded-2xl border border-worley-navy-mid shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-worley-navy-mid flex items-center justify-between bg-worley-navy/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-zinc-900" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight">Risk Pulse Copilot</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">Agentic AI Active</span>
            </div>
          </div>
        </div>
        <Sparkles className="w-4 h-4 text-zinc-500" />
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
            <Bot className="w-12 h-12 mb-4 text-zinc-600" />
            <p className="text-sm font-medium">Ask me about project risks, deltas, or mitigation strategies.</p>
            <div className="mt-4 grid grid-cols-1 gap-2 w-full max-w-xs">
              {['What are the top risks?', 'Explain the turbine delay', 'How can we mitigate impact?'].map(q => (
                <button 
                  key={q}
                  onClick={() => onSendMessage(q)}
                  className="text-[10px] font-bold uppercase tracking-wider p-2 border border-worley-navy-mid rounded-lg hover:bg-worley-navy-mid transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center",
                msg.role === 'user' ? "bg-worley-navy-mid" : "bg-zinc-100"
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-zinc-400" /> : <Bot className="w-4 h-4 text-zinc-900" />}
              </div>
              <div className={cn(
                "p-3 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user'
                  ? "bg-worley-navy-mid text-zinc-100 rounded-tr-none"
                  : "bg-zinc-100 text-zinc-900 rounded-tl-none"
              )}>
                {renderBold(msg.text)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 mr-auto"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-zinc-900 animate-spin" />
            </div>
            <div className="p-3 bg-zinc-100 text-zinc-900 rounded-2xl rounded-tl-none flex items-center gap-1">
              <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" />
              <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-worley-navy border-t border-worley-navy-mid">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Query risk insights..."
            className="w-full bg-worley-navy-mid border border-worley-navy-mid rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-worley-primary transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-center text-zinc-600 font-medium uppercase tracking-tighter">
          Powered by Groq • Agentic Reasoning Enabled
        </p>
      </form>
    </div>
  );
};
