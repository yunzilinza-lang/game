import React from 'react';
import { gameState } from '../core/GameState';
import { soundEngine } from '../audio/SoundEngine';
import { X, Home, Moon, Save, Sliders, Shirt, BarChart3 } from 'lucide-react';

interface SafehouseModalProps {
  playerPos: [number, number, number];
  onClose: () => void;
}

export const SafehouseModal: React.FC<SafehouseModalProps> = ({ playerPos, onClose }) => {
  const handleRest = () => {
    gameState.advanceTime(8); // Advance 8 hours
    gameState.healPlayer(100, 50); // Fully restore health and some armor
    soundEngine.playUI('complete');
    gameState.showToast('RESTED & RECOVERED', 'Time advanced • Health fully restored', 'success');
    onClose();
  };

  const handleSave = () => {
    gameState.saveGame(playerPos);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-['Inter',sans-serif]">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <Home className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-black text-white uppercase font-['Chakra_Petch',sans-serif]">
                JAYDEN’S SAFEHOUSE
              </h3>
              <p className="text-[11px] text-zinc-400">Riverside Haven • Operations Hub</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playUI('click');
              onClose();
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 space-y-3">
          <button
            onClick={handleRest}
            className="w-full bg-zinc-950 border border-zinc-800 hover:border-emerald-500 rounded-xl p-4 flex items-center gap-3 transition text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Moon className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif]">
                REST & RECOVER
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Sleep for 8 hours to advance the day/night cycle and fully replenish health.
              </p>
            </div>
          </button>

          <button
            onClick={handleSave}
            className="w-full bg-zinc-950 border border-zinc-800 hover:border-cyan-500 rounded-xl p-4 flex items-center gap-3 transition text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Save className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif]">
                SAVE CAREER PROGRESS
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Commit current inventory, vehicles, and district status to browser storage.
              </p>
            </div>
          </button>

          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase mb-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Career Summary
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
              <div>Missions Completed: <span className="font-mono text-white">{gameState.player.stats.missionsCompleted}</span></div>
              <div>Police Escaped: <span className="font-mono text-white">{gameState.player.stats.policeEscaped}</span></div>
              <div>Bankroll: <span className="font-mono text-emerald-400">${gameState.player.money}</span></div>
              <div>Reputation: <span className="font-mono text-cyan-400">{gameState.player.reputation} / 100</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
