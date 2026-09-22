import React from 'react';
import { gameState, DISTRICTS } from '../core/GameState';
import { missionSystem } from '../missions/MissionSystem';
import { soundEngine } from '../audio/SoundEngine';
import { VehicleModel } from '../types';
import { X, Terminal, Shield, Zap, DollarSign, Car, Flame } from 'lucide-react';

interface DebugPanelProps {
  fps: number;
  playerPos: [number, number, number];
  npcCount: number;
  vehicleCount: number;
  onClose: () => void;
  onTeleport: (x: number, z: number) => void;
  onSpawnVehicle: (model: VehicleModel) => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  fps,
  playerPos,
  npcCount,
  vehicleCount,
  onClose,
  onTeleport,
  onSpawnVehicle
}) => {
  const activeObj = missionSystem.getActiveObjective();

  return (
    <div className="fixed top-14 right-4 z-50 w-80 bg-zinc-950/95 backdrop-blur-md border border-cyan-500/50 rounded-xl p-4 shadow-2xl font-mono text-xs text-zinc-300 select-none">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Terminal className="w-4 h-4" />
          <span>F3 DEV METRICS</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded cursor-pointer text-zinc-400">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1.5 text-[11px] mb-3">
        <div className="flex justify-between">
          <span className="text-zinc-500">FPS:</span>
          <span className={fps >= 50 ? 'text-emerald-400' : 'text-amber-400'}>{fps}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">COORDS:</span>
          <span>X:{playerPos[0].toFixed(1)} Y:{playerPos[1].toFixed(1)} Z:{playerPos[2].toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">DISTRICT:</span>
          <span className="text-cyan-400 uppercase">{gameState.player.currentDistrict}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">ACTIVE HEAT:</span>
          <span className="text-rose-400 font-bold">{gameState.heat} / 5</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">MISSION:</span>
          <span className="truncate max-w-[150px] text-amber-400">
            {missionSystem.activeMission ? missionSystem.activeMission.title : 'None'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">OBJECTS:</span>
          <span>{vehicleCount} cars, {npcCount} NPCs</span>
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-2 space-y-1.5">
        <div className="text-[10px] uppercase font-bold text-zinc-400">Quick Cheats:</div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => gameState.addMoney(1000)}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 p-1.5 rounded text-[10px] text-emerald-400 flex items-center justify-center gap-1 cursor-pointer"
          >
            <DollarSign className="w-3 h-3" /> +$1,000
          </button>
          <button
            onClick={() => gameState.healPlayer(100, 100)}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 p-1.5 rounded text-[10px] text-cyan-400 flex items-center justify-center gap-1 cursor-pointer"
          >
            <Shield className="w-3 h-3" /> God Vitals
          </button>
          <button
            onClick={() => gameState.clearHeat()}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 p-1.5 rounded text-[10px] text-blue-400 flex items-center justify-center gap-1 cursor-pointer"
          >
            <Zap className="w-3 h-3" /> Clear Heat
          </button>
          <button
            onClick={() => gameState.increaseHeat(1)}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 p-1.5 rounded text-[10px] text-rose-400 flex items-center justify-center gap-1 cursor-pointer"
          >
            <Flame className="w-3 h-3" /> Heat +1
          </button>
        </div>

        <div className="text-[10px] uppercase font-bold text-zinc-400 mt-2">Spawn Vehicles:</div>
        <div className="grid grid-cols-3 gap-1">
          {(['sports', 'pickup', 'motorcycle'] as const).map(m => (
            <button
              key={m}
              onClick={() => onSpawnVehicle(m)}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 p-1 rounded text-[9px] text-zinc-300 uppercase cursor-pointer"
            >
              {m}
            </button>
          ))}
        </div>

        <div className="text-[10px] uppercase font-bold text-zinc-400 mt-2">Teleport District:</div>
        <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto">
          {DISTRICTS.map(d => (
            <button
              key={d.id}
              onClick={() => {
                const cx = (d.bounds.minX + d.bounds.maxX) / 2;
                const cz = (d.bounds.minZ + d.bounds.maxZ) / 2;
                onTeleport(cx, cz);
              }}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-1 rounded text-[9px] text-zinc-300 truncate text-left cursor-pointer"
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
