import React, { useState } from 'react';
import { DISTRICTS, gameState } from '../core/GameState';
import { missionSystem } from '../missions/MissionSystem';
import { X, Navigation, Home, Wrench, ShoppingBag, Flag, ZoomIn, ZoomOut, Compass } from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

interface FullMapModalProps {
  playerPos: [number, number, number];
  onClose: () => void;
  onTeleport?: (x: number, z: number) => void;
}

export const FullMapModal: React.FC<FullMapModalProps> = ({ playerPos, onClose, onTeleport }) => {
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICTS[0]);
  const [zoom, setZoom] = useState(1);
  const activeObj = missionSystem.getActiveObjective();

  const handleDistrictClick = (d: typeof DISTRICTS[0]) => {
    setSelectedDistrict(d);
    soundEngine.playUI('click');
  };

  const handleFastTravel = () => {
    if (onTeleport) {
      const centerX = (selectedDistrict.bounds.minX + selectedDistrict.bounds.maxX) / 2;
      const centerZ = (selectedDistrict.bounds.minZ + selectedDistrict.bounds.maxZ) / 2;
      onTeleport(centerX, centerZ);
      soundEngine.playUI('open');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-['Inter',sans-serif]">
      <div className="relative w-full max-w-5xl h-[85vh] bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-black tracking-wider uppercase text-white font-['Chakra_Petch',sans-serif]">
              VANTA CITY • NAVIGATION MAP
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs font-mono text-zinc-400 mr-4">
              GPS: [{Math.round(playerPos[0])}, {Math.round(playerPos[2])}]
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

        {/* Main Content: Map Viewport + District Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Map Canvas / Grid Representation */}
          <div className="flex-1 relative bg-zinc-950 overflow-hidden flex items-center justify-center">
            {/* Zoom Controls */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 bg-zinc-900/90 border border-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setZoom(z => Math.min(1.8, z + 0.2))}
                className="p-2 text-zinc-300 hover:bg-zinc-800 rounded transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(z => Math.max(0.7, z - 0.2))}
                className="p-2 text-zinc-300 hover:bg-zinc-800 rounded transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>

            {/* 2D Schematic City Map */}
            <div 
              className="relative w-[600px] h-[600px] border border-zinc-800/80 rounded-xl transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            >
              {/* Render District Zones */}
              {DISTRICTS.map(dist => {
                // Map world bounds [-260 to 400] to container coords [0 to 600]
                const left = ((dist.bounds.minX + 260) / 660) * 100;
                const top = ((dist.bounds.minZ + 260) / 660) * 100;
                const width = ((dist.bounds.maxX - dist.bounds.minX) / 660) * 100;
                const height = ((dist.bounds.maxZ - dist.bounds.minZ) / 660) * 100;
                const isSelected = selectedDistrict.id === dist.id;

                return (
                  <div
                    key={dist.id}
                    onClick={() => handleDistrictClick(dist)}
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                      borderColor: dist.color,
                      backgroundColor: `${dist.color}${isSelected ? '33' : '15'}`
                    }}
                    className={`absolute border rounded-lg p-2 flex flex-col justify-between cursor-pointer transition hover:opacity-100 ${
                      isSelected ? 'ring-2 ring-white z-10' : 'opacity-80'
                    }`}
                  >
                    <span 
                      className="text-[11px] font-black uppercase tracking-wider font-['Chakra_Petch',sans-serif]"
                      style={{ color: dist.color }}
                    >
                      {dist.name}
                    </span>
                    <span className="text-[9px] text-zinc-400 uppercase font-mono">
                      {dist.theme}
                    </span>
                  </div>
                );
              })}

              {/* Water indicator on South */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-sky-950/60 border-t border-sky-800/40 flex items-center justify-center text-[10px] tracking-widest text-sky-400 font-mono">
                VANTA BAY & OCEAN WATERWAY
              </div>

              {/* Player Position Marker */}
              <div 
                className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 z-20"
                style={{
                  left: `${((playerPos[0] + 260) / 660) * 100}%`,
                  top: `${((playerPos[2] + 260) / 660) * 100}%`,
                }}
              >
                <div className="w-3.5 h-3.5 bg-cyan-400 rounded-full border-2 border-white shadow-lg shadow-cyan-400/80 animate-ping absolute inset-0" />
                <div className="w-3.5 h-3.5 bg-cyan-400 rounded-full border-2 border-white shadow-lg shadow-cyan-400/80 relative" />
              </div>

              {/* Active Mission Objective Marker */}
              {activeObj && activeObj.targetPos && (
                <div 
                  className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center"
                  style={{
                    left: `${((activeObj.targetPos[0] + 260) / 660) * 100}%`,
                    top: `${((activeObj.targetPos[2] + 260) / 660) * 100}%`,
                  }}
                >
                  <div className="w-4 h-4 bg-amber-400 rotate-45 border border-white shadow-lg shadow-amber-400/80 animate-bounce" />
                </div>
              )}

              {/* Safehouse Marker */}
              <div 
                className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 z-15"
                style={{
                  left: `${((-170 + 260) / 660) * 100}%`,
                  top: `${((80 + 260) / 660) * 100}%`,
                }}
                title="Safehouse"
              >
                <div className="w-3.5 h-3.5 bg-emerald-500 rounded-sm border border-white flex items-center justify-center">
                  <Home className="w-2.5 h-2.5 text-white" />
                </div>
              </div>

              {/* Garage Marker */}
              <div 
                className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 z-15"
                style={{
                  left: `${((-140 + 260) / 660) * 100}%`,
                  top: `${((70 + 260) / 660) * 100}%`,
                }}
                title="Riverside Garage"
              >
                <div className="w-3.5 h-3.5 bg-cyan-500 rounded-sm border border-white flex items-center justify-center">
                  <Wrench className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* District Sidebar Details */}
          <div className="w-80 border-l border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedDistrict.color }} />
                <h3 className="text-xl font-black text-white uppercase font-['Chakra_Petch',sans-serif]">
                  {selectedDistrict.name}
                </h3>
              </div>

              <div className="text-xs text-zinc-400 leading-relaxed">
                {selectedDistrict.description}
              </div>

              <div className="border-t border-zinc-800/80 pt-3 space-y-2">
                <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide">
                  District Landmarks:
                </div>
                <div className="space-y-1 text-xs text-zinc-400">
                  {selectedDistrict.id === 'riverside' && (
                    <>
                      <div>• Jayden's Safehouse</div>
                      <div>• Marcus's Riverside Garage</div>
                      <div>• Vanta Threads Clothier</div>
                    </>
                  )}
                  {selectedDistrict.id === 'downtown' && (
                    <>
                      <div>• Vanta Financial Tower</div>
                      <div>• Hotel Lux Commercial Plaza</div>
                    </>
                  )}
                  {selectedDistrict.id === 'industrial' && (
                    <>
                      <div>• Cargo Container Yard</div>
                      <div>• Dock 4 Loading Bay</div>
                    </>
                  )}
                  {selectedDistrict.id === 'east_market' && (
                    <>
                      <div>• Street Food Bazaar</div>
                      <div>• East Market Vendor Alley</div>
                    </>
                  )}
                  {selectedDistrict.id === 'harbor' && (
                    <>
                      <div>• Waterfront Promenade & Docks</div>
                    </>
                  )}
                  {selectedDistrict.id === 'hillside' && (
                    <>
                      <div>• Scenic Ridge Highway</div>
                    </>
                  )}
                  {selectedDistrict.id === 'old_quarter' && (
                    <>
                      <div>• Historic Brick Walkways</div>
                    </>
                  )}
                  {selectedDistrict.id === 'airport' && (
                    <>
                      <div>• Terminal Runways & Hangars</div>
                    </>
                  )}
                </div>
              </div>

              {/* Map Legend */}
              <div className="border-t border-zinc-800/80 pt-3 space-y-1.5 text-[11px] text-zinc-400">
                <div className="font-bold text-zinc-300 uppercase tracking-wide">Legend:</div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full" /> Player (Jayden)
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-amber-400 rotate-45" /> Active Mission Waypoint
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" /> Safehouse
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-cyan-500 rounded-sm" /> Garage
                </div>
              </div>
            </div>

            {/* Fast Travel / Waypoint Button */}
            <div className="pt-4 border-t border-zinc-800">
              <button
                onClick={handleFastTravel}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 cursor-pointer font-['Chakra_Petch',sans-serif]"
              >
                <Navigation className="w-4 h-4" />
                TRAVEL TO {selectedDistrict.name.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
