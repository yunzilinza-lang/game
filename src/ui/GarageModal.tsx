import React, { useState } from 'react';
import { gameState } from '../core/GameState';
import { soundEngine } from '../audio/SoundEngine';
import { VEHICLE_CONFIGS } from '../vehicles/VehicleManager';
import { VehicleModel } from '../types';
import { X, Wrench, Car, Paintbrush, DollarSign, Check } from 'lucide-react';

interface GarageModalProps {
  onClose: () => void;
  onSpawnVehicle: (model: VehicleModel, color?: string) => void;
}

const PAINT_COLORS = [
  { name: 'Midnight Black', hex: '#09090b' },
  { name: 'Apex Red', hex: '#dc2626' },
  { name: 'Vanta Cyan', hex: '#06b6d4' },
  { name: 'Hyper Blue', hex: '#2563eb' },
  { name: 'Solar Yellow', hex: '#eab308' },
  { name: 'Racing Green', hex: '#16a34a' },
  { name: 'Silver Slate', hex: '#e2e8f0' },
  { name: 'Neon Purple', hex: '#9333ea' },
];

export const GarageModal: React.FC<GarageModalProps> = ({ onClose, onSpawnVehicle }) => {
  const [selectedModel, setSelectedModel] = useState<VehicleModel>('compact');
  const [selectedColor, setSelectedColor] = useState<string>('#2563eb');

  const curConfig = VEHICLE_CONFIGS[selectedModel];
  const isOwned = gameState.ownedVehicles.includes(selectedModel);

  const handleSpawn = () => {
    onSpawnVehicle(selectedModel, selectedColor);
    soundEngine.playUI('complete');
    gameState.showToast(`VEHICLE DEPLOYED`, `${curConfig.name} delivered to garage bay`, 'success');
    onClose();
  };

  const handleBuy = () => {
    if (!gameState.spendMoney(curConfig.price)) return;
    gameState.ownedVehicles.push(selectedModel);
    soundEngine.playUI('complete');
    gameState.showToast(`VEHICLE PURCHASED`, `Acquired ${curConfig.name}`, 'success');
    gameState.notify();
  };

  const handleRepair = () => {
    if (!gameState.spendMoney(50)) return;
    gameState.vehicleHealth = gameState.vehicleMaxHealth;
    soundEngine.playUI('cash');
    gameState.showToast('VEHICLE REPAIRED', 'Bodywork restored to 100% condition', 'success');
    gameState.notify();
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-['Inter',sans-serif]">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <Wrench className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-black text-white uppercase font-['Chakra_Petch',sans-serif]">
                RIVERSIDE CUSTOMS & GARAGE
              </h3>
              <p className="text-[11px] text-zinc-400">Vehicle Tuning, Spray Bay & Fleet Dispatch</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-black text-emerald-400 font-mono">
              Cash: ${gameState.player.money.toLocaleString()}
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
        </div>

        {/* Content: Vehicle selector grid + Specs & Paint */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Vehicle List */}
          <div className="w-1/2 p-5 border-r border-zinc-800 overflow-y-auto space-y-2.5">
            {Object.values(VEHICLE_CONFIGS).map(v => {
              const owned = gameState.ownedVehicles.includes(v.model);
              const isSelected = selectedModel === v.model;

              return (
                <div
                  key={v.model}
                  onClick={() => {
                    soundEngine.playUI('click');
                    setSelectedModel(v.model);
                  }}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    isSelected
                      ? 'bg-zinc-800 border-cyan-400 shadow-md'
                      : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Car className={`w-5 h-5 ${isSelected ? 'text-cyan-400' : 'text-zinc-500'}`} />
                    <div>
                      <h4 className="text-xs font-bold text-white font-['Chakra_Petch',sans-serif]">
                        {v.name}
                      </h4>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {v.maxSpeed} km/h • {v.maxHealth} HP
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs font-mono font-bold ${owned ? 'text-cyan-400' : 'text-emerald-400'}`}>
                    {owned ? 'OWNED' : `$${v.price}`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Vehicle Specs & Customization */}
          <div className="w-1/2 p-6 flex flex-col justify-between bg-zinc-950/40">
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-black text-white uppercase font-['Chakra_Petch',sans-serif]">
                  {curConfig.name}
                </h4>
                <div className="text-xs font-mono text-cyan-400 mt-0.5">
                  {isOwned ? 'READY TO DEPLOY' : `DEALERSHIP PRICE: $${curConfig.price}`}
                </div>
              </div>

              {/* Performance Stats */}
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>Top Speed:</span> <span className="font-mono text-white">{curConfig.maxSpeed} km/h</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-cyan-400 h-full" style={{ width: `${(curConfig.maxSpeed / 180) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>Acceleration:</span> <span className="font-mono text-white">{curConfig.acceleration} m/s²</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-400 h-full" style={{ width: `${(curConfig.acceleration / 60) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>Handling:</span> <span className="font-mono text-white">{curConfig.handling.toFixed(1)}x</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-400 h-full" style={{ width: `${(curConfig.handling / 3.0) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Spray Paint Palette */}
              <div className="space-y-2 border-t border-zinc-800 pt-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase">
                  <Paintbrush className="w-3.5 h-3.5 text-cyan-400" />
                  Spray Bay Finish:
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {PAINT_COLORS.map(p => (
                    <button
                      key={p.hex}
                      onClick={() => {
                        soundEngine.playUI('click');
                        setSelectedColor(p.hex);
                      }}
                      className={`h-8 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                        selectedColor === p.hex ? 'ring-2 ring-cyan-400 border-white' : 'border-zinc-700'
                      }`}
                      style={{ backgroundColor: p.hex }}
                      title={p.name}
                    >
                      {selectedColor === p.hex && <Check className="w-4 h-4 text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 border-t border-zinc-800 pt-4">
              {isOwned ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSpawn}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 cursor-pointer font-['Chakra_Petch',sans-serif]"
                  >
                    <Car className="w-4 h-4" />
                    SPAWN VEHICLE
                  </button>
                  <button
                    onClick={handleRepair}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold px-4 py-2.5 rounded-xl transition text-xs cursor-pointer"
                    title="Repair for $50"
                  >
                    REPAIR ($50)
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleBuy}
                  disabled={gameState.player.money < curConfig.price}
                  className={`w-full font-bold py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer font-['Chakra_Petch',sans-serif] ${
                    gameState.player.money < curConfig.price
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  PURCHASE VEHICLE (${curConfig.price})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
