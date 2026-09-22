import React, { useState } from 'react';
import { gameState } from '../core/GameState';
import { missionSystem } from '../missions/MissionSystem';
import { soundEngine } from '../audio/SoundEngine';
import { VEHICLE_CONFIGS } from '../vehicles/VehicleManager';
import { 
  X, 
  Play, 
  User, 
  FileText, 
  Car, 
  Radio, 
  Sliders, 
  Save, 
  RotateCcw,
  Keyboard,
  ShieldAlert
} from 'lucide-react';

interface PauseMenuModalProps {
  playerPos: [number, number, number];
  onClose: () => void;
  onOpenMap: () => void;
}

type TabType = 'resume' | 'missions' | 'character' | 'vehicles' | 'radio' | 'controls' | 'save';

export const PauseMenuModal: React.FC<PauseMenuModalProps> = ({ playerPos, onClose, onOpenMap }) => {
  const [activeTab, setActiveTab] = useState<TabType>('missions');

  const handleResume = () => {
    soundEngine.playUI('click');
    onClose();
  };

  const handleSave = () => {
    gameState.saveGame(playerPos);
  };

  const handleLoad = () => {
    if (gameState.loadGame()) {
      soundEngine.playUI('complete');
      gameState.showToast('SAVE LOADED', 'Restored previous game state', 'success');
      onClose();
    } else {
      gameState.showToast('NO SAVE FOUND', 'No saved data in browser storage', 'warning');
    }
  };

  const handleRestart = () => {
    if (window.confirm('Reset progress and start a new game?')) {
      gameState.resetProgress();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/92 backdrop-blur-lg flex items-center justify-center p-4 select-none font-['Inter',sans-serif]">
      <div className="relative w-full max-w-4xl h-[80vh] bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-white tracking-wider uppercase font-['Chakra_Petch',sans-serif]">
              NEON DISTRICT <span className="text-cyan-400 font-normal text-sm font-mono">• PAUSED</span>
            </span>
          </div>
          <button
            onClick={handleResume}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout: Navigation Sidebar + Tab Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-56 border-r border-zinc-800 bg-zinc-950/50 p-4 flex flex-col justify-between">
            <div className="space-y-1">
              <button
                onClick={handleResume}
                className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 text-zinc-300 hover:bg-zinc-800 cursor-pointer"
              >
                <Play className="w-4 h-4 text-emerald-400" />
                RESUME GAME
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenMap();
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 text-zinc-300 hover:bg-zinc-800 cursor-pointer"
              >
                <Car className="w-4 h-4 text-cyan-400" />
                FULL CITY MAP
              </button>

              <button
                onClick={() => {
                  soundEngine.playUI('click');
                  setActiveTab('missions');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'missions' ? 'bg-zinc-800 text-white border-l-2 border-cyan-400' : 'text-zinc-400 hover:bg-zinc-850'
                }`}
              >
                <FileText className="w-4 h-4 text-amber-400" />
                MISSIONS
              </button>

              <button
                onClick={() => {
                  soundEngine.playUI('click');
                  setActiveTab('character');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'character' ? 'bg-zinc-800 text-white border-l-2 border-cyan-400' : 'text-zinc-400 hover:bg-zinc-850'
                }`}
              >
                <User className="w-4 h-4 text-indigo-400" />
                JAYDEN CROSS
              </button>

              <button
                onClick={() => {
                  soundEngine.playUI('click');
                  setActiveTab('vehicles');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'vehicles' ? 'bg-zinc-800 text-white border-l-2 border-cyan-400' : 'text-zinc-400 hover:bg-zinc-850'
                }`}
              >
                <Car className="w-4 h-4 text-rose-400" />
                VEHICLE FLEET
              </button>

              <button
                onClick={() => {
                  soundEngine.playUI('click');
                  setActiveTab('radio');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'radio' ? 'bg-zinc-800 text-white border-l-2 border-cyan-400' : 'text-zinc-400 hover:bg-zinc-850'
                }`}
              >
                <Radio className="w-4 h-4 text-yellow-400" />
                RADIO STATIONS
              </button>

              <button
                onClick={() => {
                  soundEngine.playUI('click');
                  setActiveTab('controls');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'controls' ? 'bg-zinc-800 text-white border-l-2 border-cyan-400' : 'text-zinc-400 hover:bg-zinc-850'
                }`}
              >
                <Keyboard className="w-4 h-4 text-teal-400" />
                CONTROLS GUIDE
              </button>

              <button
                onClick={() => {
                  soundEngine.playUI('click');
                  setActiveTab('save');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'save' ? 'bg-zinc-800 text-white border-l-2 border-cyan-400' : 'text-zinc-400 hover:bg-zinc-850'
                }`}
              >
                <Save className="w-4 h-4 text-emerald-400" />
                SAVE / LOAD
              </button>
            </div>

            <div className="pt-4 border-t border-zinc-800/80">
              <button
                onClick={handleRestart}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-950/40 transition flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                NEW GAME
              </button>
            </div>
          </div>

          {/* Main Tab View */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* MISSIONS TAB */}
            {activeTab === 'missions' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider font-['Chakra_Petch',sans-serif]">
                  VANTA CITY MISSIONS & CONTRACTS
                </h3>
                <div className="space-y-3">
                  {missionSystem.missions.map(m => {
                    const isCompleted = m.status === 'completed';
                    const isActive = m.status === 'active';
                    const isLocked = m.status === 'locked';

                    return (
                      <div
                        key={m.id}
                        className={`border rounded-xl p-4 transition ${
                          isActive
                            ? 'bg-zinc-800/80 border-amber-500/80 shadow-lg'
                            : isCompleted
                            ? 'bg-zinc-950/40 border-emerald-800/60 opacity-80'
                            : isLocked
                            ? 'bg-zinc-950/20 border-zinc-800/40 opacity-50'
                            : 'bg-zinc-900 border-zinc-800'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-zinc-400">GIVER: {m.giver.toUpperCase()}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                isCompleted
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : isActive
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                                  : isLocked
                                  ? 'bg-zinc-800 text-zinc-500'
                                  : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                              }`}>
                                {m.status}
                              </span>
                            </div>
                            <h4 className="text-base font-black text-white mt-1 font-['Chakra_Petch',sans-serif]">
                              {m.title}
                            </h4>
                            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                              {m.description}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-black text-emerald-400 font-mono">
                              +${m.rewardMoney}
                            </div>
                            <div className="text-[10px] font-mono text-cyan-400">
                              +{m.rewardRep} REP
                            </div>
                          </div>
                        </div>

                        {/* Objectives list if active */}
                        {isActive && (
                          <div className="mt-3 border-t border-zinc-800/80 pt-2 space-y-1">
                            <div className="text-[10px] font-bold text-zinc-400 uppercase">Objectives:</div>
                            {m.objectives.map((obj, i) => (
                              <div
                                key={obj.id}
                                className={`text-xs flex items-center gap-2 ${
                                  obj.completed
                                    ? 'line-through text-zinc-500'
                                    : i === m.currentObjectiveIndex
                                    ? 'text-amber-400 font-semibold'
                                    : 'text-zinc-400'
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                {obj.text}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Start button if available */}
                        {m.status === 'available' && (
                          <div className="mt-3 border-t border-zinc-800 pt-3">
                            <button
                              onClick={() => {
                                missionSystem.startMission(m.id);
                                onClose();
                              }}
                              className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg cursor-pointer transition font-['Chakra_Petch',sans-serif]"
                            >
                              START MISSION
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CHARACTER TAB */}
            {activeTab === 'character' && (
              <div className="space-y-5">
                <div className="flex items-center gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-600 to-indigo-800 flex items-center justify-center font-black text-2xl text-white font-['Chakra_Petch',sans-serif]">
                    JC
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase font-['Chakra_Petch',sans-serif]">
                      {gameState.player.name}
                    </h3>
                    <div className="text-xs text-zinc-400">
                      Age 24 • Returning Riverside Resident • Street Operator
                    </div>
                    <div className="text-xs font-mono text-cyan-400 mt-1">
                      Reputation Level: {gameState.player.reputation} / 100
                    </div>
                  </div>
                </div>

                {/* Character Statistics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Cash on Hand</div>
                    <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                      ${gameState.player.money.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Missions Completed</div>
                    <div className="text-lg font-black text-zinc-200 font-mono mt-0.5">
                      {gameState.player.stats.missionsCompleted}
                    </div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Police Escaped</div>
                    <div className="text-lg font-black text-cyan-400 font-mono mt-0.5">
                      {gameState.player.stats.policeEscaped}
                    </div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Hostiles Defeated</div>
                    <div className="text-lg font-black text-rose-400 font-mono mt-0.5">
                      {gameState.player.stats.enemiesDefeated}
                    </div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Distance Traveled</div>
                    <div className="text-lg font-black text-zinc-200 font-mono mt-0.5">
                      {gameState.player.stats.distanceTraveledKm.toFixed(1)} km
                    </div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                    <div className="text-[10px] uppercase font-bold text-zinc-400">Top Speed</div>
                    <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                      {gameState.player.stats.maxSpeedKmH} km/h
                    </div>
                  </div>
                </div>

                {/* Weapons Loadout */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
                    Weapons Armory:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(gameState.player.weapons).map(w => (
                      <div
                        key={w.id}
                        className={`p-3 rounded-lg border flex items-center justify-between ${
                          w.unlocked ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-950/40 border-zinc-800/40 opacity-40'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{w.name}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            DMG: {w.damage} • RNG: {w.range}m
                          </div>
                        </div>
                        <div className="text-xs font-mono font-bold text-amber-400">
                          {w.unlocked ? `${w.ammo} rds` : 'LOCKED'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VEHICLES TAB */}
            {activeTab === 'vehicles' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider font-['Chakra_Petch',sans-serif]">
                  VANTA MOTOR CATALOG
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.values(VEHICLE_CONFIGS).map(v => {
                    const owned = gameState.ownedVehicles.includes(v.model);
                    return (
                      <div
                        key={v.model}
                        className={`p-4 rounded-xl border flex flex-col justify-between ${
                          owned ? 'bg-zinc-950 border-zinc-700' : 'bg-zinc-950/40 border-zinc-800/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif]">
                              {v.name}
                            </h4>
                            <span className="text-xs font-mono font-bold" style={{ color: v.color }}>
                              {owned ? 'OWNED' : `$${v.price}`}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1 text-xs text-zinc-400">
                            <div className="flex justify-between">
                              <span>Top Speed:</span> <span className="font-mono text-zinc-200">{v.maxSpeed} km/h</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Acceleration:</span> <span className="font-mono text-zinc-200">{v.acceleration} m/s²</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Handling:</span> <span className="font-mono text-zinc-200">{v.handling.toFixed(1)}x</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Durability:</span> <span className="font-mono text-zinc-200">{v.maxHealth} HP</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RADIO TAB */}
            {activeTab === 'radio' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider font-['Chakra_Petch',sans-serif]">
                  VANTA CITY IN-CAR RADIO
                </h3>
                <div className="space-y-2.5">
                  {soundEngine.stations.map((st, i) => {
                    const isCur = soundEngine.getCurrentStation().id === st.id && soundEngine.isRadioOn();
                    return (
                      <div
                        key={st.id}
                        onClick={() => {
                          if (soundEngine.getCurrentStation().id !== st.id) {
                            soundEngine.nextStation();
                          }
                          soundEngine.startRadio();
                          gameState.notify();
                        }}
                        className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          isCur
                            ? 'bg-zinc-800/90 border-amber-500 shadow-lg'
                            : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Radio className={`w-5 h-5 ${isCur ? 'text-amber-400 animate-pulse' : 'text-zinc-500'}`} />
                          <div>
                            <div className="text-sm font-black text-white font-['Chakra_Petch',sans-serif]">
                              {st.name} • {st.freq} FM
                            </div>
                            <div className="text-xs text-zinc-400">{st.genre}</div>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {isCur ? 'NOW PLAYING' : 'TUNE IN'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-zinc-800">
                  <button
                    onClick={() => {
                      soundEngine.toggleRadio();
                      gameState.notify();
                    }}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 rounded-xl transition text-xs cursor-pointer font-['Chakra_Petch',sans-serif]"
                  >
                    {soundEngine.isRadioOn() ? 'TURN OFF RADIO' : 'TURN ON RADIO'}
                  </button>
                </div>
              </div>
            )}

            {/* CONTROLS GUIDE TAB */}
            {activeTab === 'controls' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider font-['Chakra_Petch',sans-serif]">
                  GAME CONTROLS REFERENCE
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <span className="font-bold text-cyan-400 font-mono">W, A, S, D</span>
                    <p className="text-zinc-400 mt-1">Move Jayden / Steer & Accelerate Vehicle</p>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <span className="font-bold text-cyan-400 font-mono">SHIFT</span>
                    <p className="text-zinc-400 mt-1">Sprint on foot</p>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <span className="font-bold text-cyan-400 font-mono">SPACE</span>
                    <p className="text-zinc-400 mt-1">Jump on foot / Handbrake drift in car</p>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <span className="font-bold text-cyan-400 font-mono">E</span>
                    <p className="text-zinc-400 mt-1">Interact / Enter & Exit Vehicle / Talk</p>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <span className="font-bold text-cyan-400 font-mono">MOUSE</span>
                    <p className="text-zinc-400 mt-1">Camera Look & Aim</p>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <span className="font-bold text-cyan-400 font-mono">LEFT CLICK</span>
                    <p className="text-zinc-400 mt-1">Attack / Punch / Fire Weapon</p>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <span className="font-bold text-cyan-400 font-mono">RIGHT CLICK</span>
                    <p className="text-zinc-400 mt-1">Aim Mode (Zoomed over-the-shoulder)</p>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <span className="font-bold text-cyan-400 font-mono">1, 2, 3, 4</span>
                    <p className="text-zinc-400 mt-1">Switch Weapons (Fists, Pistol, Shotgun, Rifle)</p>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <span className="font-bold text-cyan-400 font-mono">M</span>
                    <p className="text-zinc-400 mt-1">Open Full City Map & Navigation</p>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <span className="font-bold text-cyan-400 font-mono">R</span>
                    <p className="text-zinc-400 mt-1">Toggle In-Car Radio Station</p>
                  </div>
                </div>
              </div>
            )}

            {/* SAVE / LOAD TAB */}
            {activeTab === 'save' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-wider font-['Chakra_Petch',sans-serif]">
                  GAME PROGRESS PERSISTENCE
                </h3>
                <p className="text-xs text-zinc-400">
                  Save your position, inventory, mission completions, vehicle ownership, and stats to your browser's persistent storage.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer font-['Chakra_Petch',sans-serif]"
                  >
                    <Save className="w-4 h-4" />
                    SAVE PROGRESS NOW
                  </button>
                  <button
                    onClick={handleLoad}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer font-['Chakra_Petch',sans-serif]"
                  >
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    LOAD SAVED STATE
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
