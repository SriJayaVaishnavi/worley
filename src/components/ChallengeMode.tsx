import React, { useState } from 'react';
import { Swords, Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, renderBold } from '../lib/utils';

interface ChallengeModeProps {
  onChallenge: (challenge: string) => Promise<string>;
  riskTitle: string;
}

interface ChallengeExchange {
  challenge: string;
  response: string;
}

const QUICK_CHALLENGES = [
  "I think the vendor will catch up",
  "The SPI data might be stale",
  "We have buffer in the schedule",
  "This delay is within tolerance",
];

export const ChallengeMode: React.FC<ChallengeModeProps> = ({ onChallenge, riskTitle }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState('');
  const [exchanges, setExchanges] = useState<ChallengeExchange[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChallenge = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setInput('');

    try {
      const response = await onChallenge(text);
      setExchanges(prev => [...prev, { challenge: text, response }]);
    } catch {
      setExchanges(prev => [...prev, {
        challenge: text,
        response: "Unable to process challenge. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleChallenge(input);
  };

  return (
    <div className="rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full p-4 flex items-center justify-between transition-colors",
          isOpen ? "bg-worley-navy text-white" : "bg-white text-worley-navy hover:bg-zinc-50"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            isOpen ? "bg-white/10" : "bg-amber-100"
          )}>
            <Swords className={cn("w-4 h-4", isOpen ? "text-amber-400" : "text-amber-600")} />
          </div>
          <div className="text-left">
            <span className="text-sm font-bold block">Challenge the AI</span>
            <span className={cn("text-[10px] font-bold uppercase tracking-widest", isOpen ? "text-zinc-400" : "text-zinc-400")}>
              Challenge Discipline — Dispute this risk assessment
            </span>
          </div>
        </div>
        <span className={cn("text-[10px] font-bold uppercase tracking-widest", isOpen ? "text-zinc-400" : "text-zinc-400")}>
          {isOpen ? 'Close' : 'Open'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 space-y-4">
              {/* Quick challenge buttons */}
              {exchanges.length === 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">
                    Quick Challenges
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_CHALLENGES.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleChallenge(q)}
                        disabled={isLoading}
                        className="p-2 text-left text-xs bg-white border border-zinc-200 rounded-lg hover:border-zinc-400 transition-colors disabled:opacity-50"
                      >
                        "{q}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Exchange history */}
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {exchanges.map((ex, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex gap-2 justify-end">
                      <div className="p-3 bg-worley-navy-mid text-white rounded-xl rounded-tr-none max-w-[80%]">
                        <p className="text-xs">{ex.challenge}</p>
                      </div>
                      <div className="w-7 h-7 bg-zinc-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 text-zinc-600" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3.5 h-3.5 text-amber-700" />
                      </div>
                      <div className="p-3 bg-white border border-zinc-200 rounded-xl rounded-tl-none max-w-[80%]">
                        <p className="text-xs text-zinc-800 leading-relaxed">{renderBold(ex.response)}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Loader2 className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                    </div>
                    <div className="p-3 bg-white border border-zinc-200 rounded-xl rounded-tl-none">
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" />
                        <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Challenge this risk assessment..."
                  disabled={isLoading}
                  className="w-full bg-white border border-zinc-200 rounded-xl py-3 pl-4 pr-12 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-300 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-worley-navy rounded-lg flex items-center justify-center text-white disabled:opacity-30 hover:bg-worley-navy-mid transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
