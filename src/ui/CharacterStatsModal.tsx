import React from 'react';
import { gameState } from '../core/GameState';
import { User, Shield, Crosshair, Car, Award, Flame, Zap, Heart, Activity, X } from 'lucide-react';

interface CharacterStatsModalProps {
  onClose: () => void;
}

export const CharacterStatsModal: React.FC<CharacterStatsModalProps> = ({ onClose }) => {
  const p = gameState.player;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl text-white font-['Chakra_Petch',sans-serif]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-zinc-900 to-zinc-900 p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide uppercase">Character RPG Progression</h2>
              <p className="text-xs text-zinc-400 font-sans">Vanta City Street Reputation & Attributes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Tabs Grid */}
        <div className="p-6 grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
          {/* 1. Body & Vitality */}
          <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-xl">
            <h3 className="text-sm font-bold text-red-400 uppercase flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4" />
              Body & Physical Fitness
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Muscle Mass</span>
                  <span className="font-bold text-red-400">{Math.round(p.muscle)}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${p.muscle}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Body Fat</span>
                  <span className="font-bold text-amber-400">{Math.round(p.bodyFat)}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${p.bodyFat}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Stamina Endurance</span>
                  <span className="font-bold text-cyan-400">{Math.round(p.staminaSkill)}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500" style={{ width: `${p.staminaSkill}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Lung Capacity</span>
                  <span className="font-bold text-blue-400">{Math.round(p.lungCapacitySkill)}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${p.lungCapacitySkill}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Weapon Skills */}
          <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-xl">
            <h3 className="text-sm font-bold text-amber-400 uppercase flex items-center gap-2 mb-3">
              <Crosshair className="w-4 h-4" />
              Firearm & Melee Weapon Skills
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Handgun Proficiency</span>
                  <span className="font-bold text-amber-400">{Math.round(p.pistolSkill)}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${p.pistolSkill}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Shotgun Handling</span>
                  <span className="font-bold text-amber-400">{Math.round(p.shotgunSkill)}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${p.shotgunSkill}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Tactical Rifle Precision</span>
                  <span className="font-bold text-amber-400">{Math.round(p.rifleSkill)}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${p.rifleSkill}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Melee Combat (Boxing)</span>
                  <span className="font-bold text-red-400">{Math.round(p.meleeSkill)}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${p.meleeSkill}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Vehicle Handling */}
          <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-xl">
            <h3 className="text-sm font-bold text-blue-400 uppercase flex items-center gap-2 mb-3">
              <Car className="w-4 h-4" />
              Vehicle Mastery
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Car Driving & Drift</span>
                  <span className="font-bold text-blue-400">{Math.round(p.carSkill)}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${p.carSkill}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Motorcycle Agility</span>
                  <span className="font-bold text-blue-400">{Math.round(p.motorcycleSkill)}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${p.motorcycleSkill}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">BMX Cycling</span>
                  <span className="font-bold text-blue-400">{Math.round(p.bicycleSkill)}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${p.bicycleSkill}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Social & Reputation */}
          <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-xl">
            <h3 className="text-sm font-bold text-emerald-400 uppercase flex items-center gap-2 mb-3">
              <Award className="w-4 h-4" />
              Social & Faction Standing
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Street Respect</span>
                  <span className="font-bold text-emerald-400">{Math.round(p.respect)}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${p.respect}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Charisma & Influence</span>
                  <span className="font-bold text-purple-400">{Math.round(p.charisma)}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${p.charisma}%` }} />
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex justify-between text-xs text-zinc-400">
                <span>Enemies Defeated: <strong className="text-white">{p.stats.enemiesDefeated}</strong></span>
                <span>Graffiti Tagged: <strong className="text-white">{p.stats.graffitiTagged} / 100</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold uppercase transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
