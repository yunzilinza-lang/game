import React, { useEffect } from 'react';
import { gameState } from '../core/GameState';
import { ChevronRight } from 'lucide-react';

export const DialogueBox: React.FC = () => {
  const line = gameState.currentDialogue ? gameState.currentDialogue[gameState.dialogueIndex] : null;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyE') {
        if (gameState.currentDialogue) {
          gameState.nextDialogue();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (!line) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-40 select-none font-['Inter',sans-serif]">
      <div className="bg-zinc-950/95 backdrop-blur-md border border-zinc-700/80 rounded-2xl p-4 shadow-2xl flex items-start gap-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white font-['Chakra_Petch',sans-serif] shrink-0 border border-white/20 shadow-md"
          style={{ backgroundColor: line.avatarColor || '#38bdf8' }}
        >
          {line.speaker.slice(0, 2).toUpperCase()}
        </div>

        {/* Text */}
        <div className="flex-1">
          <div className="text-xs font-black tracking-wider uppercase font-['Chakra_Petch',sans-serif]" style={{ color: line.avatarColor || '#38bdf8' }}>
            {line.speaker}
          </div>
          <p className="text-sm font-medium text-zinc-100 mt-1 leading-relaxed">
            "{line.text}"
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={() => gameState.nextDialogue()}
          className="self-end bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-3 py-1 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
        >
          <span>CONTINUE</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
