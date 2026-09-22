import React from 'react';
import { gameState } from '../core/GameState';
import { Dumbbell, Activity, Flame, Zap, X } from 'lucide-react';

interface GymModalProps {
  onClose: () => void;
}

export const GymModal: React.FC<GymModalProps> = ({ onClose }) => {
  const player = gameState.player;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl text-white font-['Chakra_Petch',sans-serif]">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-zinc-900 to-zinc-900 p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide uppercase">Iron Core Fitness Gym</h2>
              <p className="text-xs text-zinc-400 font-sans">Build muscle mass, increase stamina endurance, and burn body fat</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Body Stats */}
        <div className="p-5 bg-zinc-950/60 border-b border-zinc-800 grid grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800">
            <div className="text-xs text-zinc-400">Muscle Mass</div>
            <div className="text-xl font-bold text-red-400">{Math.round(player.muscle)}%</div>
          </div>
          <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800">
            <div className="text-xs text-zinc-400">Body Fat</div>
            <div className="text-xl font-bold text-amber-400">{Math.round(player.bodyFat)}%</div>
          </div>
          <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800">
            <div className="text-xs text-zinc-400">Stamina Skill</div>
            <div className="text-xl font-bold text-cyan-400">{Math.round(player.staminaSkill)}%</div>
          </div>
          <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800">
            <div className="text-xs text-zinc-400">Current Energy</div>
            <div className="text-xl font-bold text-emerald-400">{Math.round(player.stamina)} / {Math.round(player.maxStamina)}</div>
          </div>
        </div>

        {/* Workout Stations */}
        <div className="p-5 grid grid-cols-2 gap-4">
          {/* Bench Press */}
          <div className="p-4 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl flex flex-col justify-between transition">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-base flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-red-400" />
                  Heavy Bench Press
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">-35 Stamina</span>
              </div>
              <p className="text-xs text-zinc-400 font-sans mb-4">+2.5 Muscle • -1.0% Body Fat • +1.5 Melee Power</p>
            </div>
            <button
              onClick={() => gameState.trainAtGym('weights')}
              disabled={player.stamina < 30}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 font-bold text-sm tracking-wider uppercase rounded-lg transition"
            >
              Start Set
            </button>
          </div>

          {/* Cardio Treadmill */}
          <div className="p-4 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl flex flex-col justify-between transition">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Cardio Treadmill
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">-35 Stamina</span>
              </div>
              <p className="text-xs text-zinc-400 font-sans mb-4">+3.0 Stamina Skill • -2.5% Body Fat • Higher Sprint Cap</p>
            </div>
            <button
              onClick={() => gameState.trainAtGym('treadmill')}
              disabled={player.stamina < 30}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 font-bold text-sm tracking-wider uppercase rounded-lg transition"
            >
              Run Interval
            </button>
          </div>

          {/* Heavy Bag Boxing */}
          <div className="p-4 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl flex flex-col justify-between transition">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Heavy Bag Boxing
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">-35 Stamina</span>
              </div>
              <p className="text-xs text-zinc-400 font-sans mb-4">+3.5 Melee Combat Skill • +1.2 Muscle • Unlock Combos</p>
            </div>
            <button
              onClick={() => gameState.trainAtGym('boxing')}
              disabled={player.stamina < 30}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 font-bold text-sm tracking-wider uppercase rounded-lg transition"
            >
              Box Combos
            </button>
          </div>

          {/* Spin Bike */}
          <div className="p-4 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl flex flex-col justify-between transition">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-base flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  Spin Bike Endurance
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-800">-35 Stamina</span>
              </div>
              <p className="text-xs text-zinc-400 font-sans mb-4">+4.0 Cycling Skill • +2.0 Stamina • -2.0% Fat</p>
            </div>
            <button
              onClick={() => gameState.trainAtGym('cycling')}
              disabled={player.stamina < 30}
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 font-bold text-sm tracking-wider uppercase rounded-lg transition"
            >
              Pedal Sprints
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold uppercase transition"
          >
            Leave Gym
          </button>
        </div>
      </div>
    </div>
  );
};
