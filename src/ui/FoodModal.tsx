import React from 'react';
import { gameState } from '../core/GameState';
import { Utensils, Heart, Sparkles, X } from 'lucide-react';

interface FoodModalProps {
  onClose: () => void;
}

export const FoodModal: React.FC<FoodModalProps> = ({ onClose }) => {
  const player = gameState.player;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl text-white font-['Chakra_Petch',sans-serif]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950 via-zinc-900 to-zinc-900 p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide uppercase">Bun & Blaze Grill</h2>
              <p className="text-xs text-zinc-400 font-sans">Fresh burgers, protein feasts, and nutrition</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Health & Hunger */}
        <div className="p-4 bg-zinc-950/60 border-b border-zinc-800 grid grid-cols-3 gap-3 text-center">
          <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
            <div className="text-xs text-zinc-400">Health</div>
            <div className="text-lg font-bold text-red-400">{Math.round(player.health)} / {player.maxHealth}</div>
          </div>
          <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
            <div className="text-xs text-zinc-400">Hunger Satisfied</div>
            <div className="text-lg font-bold text-amber-400">{Math.round(player.hunger)}%</div>
          </div>
          <div className="p-2.5 bg-zinc-900 rounded-xl border border-zinc-800">
            <div className="text-xs text-zinc-400">Cash Available</div>
            <div className="text-lg font-bold text-emerald-400">${player.money}</div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-5 flex flex-col gap-3">
          {/* Light Snack */}
          <div className="p-3.5 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl flex items-center justify-between transition">
            <div>
              <div className="font-bold text-sm">Crispy Chicken Slider & Fries</div>
              <div className="text-xs text-zinc-400 font-sans">+20 Health • Light Snack</div>
            </div>
            <button
              onClick={() => gameState.eatFood('light', 15)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 font-bold text-xs uppercase rounded-lg transition"
            >
              Order $15
            </button>
          </div>

          {/* Full Meal */}
          <div className="p-3.5 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl flex items-center justify-between transition">
            <div>
              <div className="font-bold text-sm">Double Blaze Angus Combo</div>
              <div className="text-xs text-zinc-400 font-sans">+50 Health • Full Meal • +1.2% Body Fat</div>
            </div>
            <button
              onClick={() => gameState.eatFood('normal', 35)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 font-bold text-xs uppercase rounded-lg transition"
            >
              Order $35
            </button>
          </div>

          {/* Heavy Feast */}
          <div className="p-3.5 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl flex items-center justify-between transition">
            <div>
              <div className="font-bold text-sm">Mega Tower Feast Platter</div>
              <div className="text-xs text-zinc-400 font-sans">+100 Health (Max Restore) • Heavy Calories</div>
            </div>
            <button
              onClick={() => gameState.eatFood('heavy', 65)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 font-bold text-xs uppercase rounded-lg transition"
            >
              Order $65
            </button>
          </div>

          {/* High Protein Meal */}
          <div className="p-3.5 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl flex items-center justify-between transition">
            <div>
              <div className="font-bold text-sm flex items-center gap-1.5 text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                Grilled Chicken Breast & Protein Shake
              </div>
              <div className="text-xs text-zinc-400 font-sans">+60 Health • +1.5 Muscle Mass • Low Fat</div>
            </div>
            <button
              onClick={() => gameState.eatFood('protein', 45)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs uppercase rounded-lg transition"
            >
              Order $45
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold uppercase transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
