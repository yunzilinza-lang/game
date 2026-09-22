import React, { useState, useEffect } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './ui/HUD';
import { FullMapModal } from './ui/FullMapModal';
import { PauseMenuModal } from './ui/PauseMenuModal';
import { ShopModal } from './ui/ShopModal';
import { GarageModal } from './ui/GarageModal';
import { SafehouseModal } from './ui/SafehouseModal';
import { GymModal } from './ui/GymModal';
import { FoodModal } from './ui/FoodModal';
import { BarberTattooModal } from './ui/BarberTattooModal';
import { ArcadeModal } from './ui/ArcadeModal';
import { PropertyModal } from './ui/PropertyModal';
import { CharacterStatsModal } from './ui/CharacterStatsModal';
import { SettingsModal } from './ui/SettingsModal';
import { DialogueBox } from './ui/DialogueBox';
import { DebugPanel } from './ui/DebugPanel';
import { gameState } from './core/GameState';
import { soundEngine } from './audio/SoundEngine';
import { VehicleModel } from './types';
import { Play, RotateCcw, Compass, Car, Shield, Crosshair, Sparkles } from 'lucide-react';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeModal, setActiveModal] = useState<
    'none' | 'map' | 'pause' | 'shop' | 'garage' | 'safehouse' | 'gym' | 'food' | 'barber' | 'tattoo' | 'arcade' | 'property' | 'stats' | 'settings'
  >('none');
  const [showDebug, setShowDebug] = useState(false);
  const [fps, setFps] = useState(60);
  const [playerCoords, setPlayerCoords] = useState<[number, number, number]>([-160, 0, 80]);
  const [playerHeading, setPlayerHeading] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [npcCount, setNpcCount] = useState(0);
  const [, setRerender] = useState(0);

  // Subscribe to central game state changes and custom open-modal events
  useEffect(() => {
    const unsub = gameState.subscribe(() => {
      setRerender(n => n + 1);
    });

    const handleOpenModal = (e: any) => {
      if (e.detail) {
        setActiveModal(e.detail);
      }
    };

    window.addEventListener('open-modal', handleOpenModal);

    return () => {
      unsub();
      window.removeEventListener('open-modal', handleOpenModal);
    };
  }, []);

  const handleStartGame = () => {
    soundEngine.ensureAudio();
    soundEngine.playUI('open');
    setIsPlaying(true);
    gameState.showToast('WELCOME TO VANTA CITY', 'WASD Move • E Interact • Q Lock-On • M City Map', 'info');
  };

  const handleTeleport = (x: number, z: number) => {
    if ((window as any).__teleportPlayer) {
      (window as any).__teleportPlayer(x, z);
    }
  };

  const handleSpawnVehicle = (model: VehicleModel, color?: string) => {
    if ((window as any).__spawnPlayerVehicle) {
      (window as any).__spawnPlayerVehicle(model, color);
    }
  };

  const handleRespawn = () => {
    gameState.player.health = 100;
    gameState.player.armor = 25;
    gameState.player.money = Math.max(0, gameState.player.money - 100);
    gameState.clearHeat();
    handleTeleport(-170, 80); // Respawn outside safehouse
    soundEngine.playUI('complete');
    gameState.showToast('HOSPITAL DISCHARGE', 'Medical recovery fee -$100', 'warning');
    gameState.notify();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-950 font-['Inter',sans-serif] select-none">
      {/* 3D Canvas Rendering Layer */}
      <GameCanvas
        onOpenMap={() => setActiveModal('map')}
        onOpenPause={() => setActiveModal('pause')}
        onOpenShop={() => setActiveModal('shop')}
        onOpenGarage={() => setActiveModal('garage')}
        onOpenSafehouse={() => setActiveModal('safehouse')}
        onToggleDebug={() => setShowDebug(s => !s)}
        setFps={setFps}
        setPlayerCoords={setPlayerCoords}
        setPlayerHeading={setPlayerHeading}
        setVehicleCount={setVehicleCount}
        setNpcCount={setNpcCount}
      />

      {/* Main Gameplay HUD */}
      {isPlaying && gameState.player.health > 0 && (
        <HUD
          playerPos={playerCoords}
          playerHeading={playerHeading}
          onOpenMap={() => setActiveModal('map')}
          onOpenPause={() => setActiveModal('pause')}
          onToggleDebug={() => setShowDebug(s => !s)}
        />
      )}

      {/* Cinematic Dialogue Subtitles */}
      {isPlaying && <DialogueBox />}

      {/* Title Screen Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 z-50 bg-gradient-to-t from-zinc-950 via-zinc-950/85 to-zinc-900/70 backdrop-blur-sm flex flex-col items-center justify-between p-8 text-center text-white">
          <div className="pt-8">
            <div className="inline-flex items-center gap-2 bg-cyan-950/80 border border-cyan-500/40 rounded-full px-4 py-1.5 text-xs font-mono text-cyan-400 mb-4 shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              ORIGINAL OPEN-WORLD 3D ACTION IP
            </div>
            <h1 className="text-6xl sm:text-7xl font-black tracking-tight uppercase font-['Chakra_Petch',sans-serif] bg-gradient-to-r from-white via-zinc-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl">
              NEON DISTRICT
            </h1>
            <p className="text-sm sm:text-base font-bold text-zinc-300 tracking-widest uppercase font-['Chakra_Petch',sans-serif] mt-1">
              VANTA CITY • THIRD-PERSON OPEN WORLD
            </p>
          </div>

          {/* Center Play Card */}
          <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-3">
            <button
              onClick={handleStartGame}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black py-4 rounded-xl text-base tracking-wider uppercase transition shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer font-['Chakra_Petch',sans-serif]"
            >
              <Play className="w-5 h-5 fill-white" />
              START GAME
            </button>

            <button
              onClick={() => {
                gameState.loadGame();
                handleStartGame();
                gameState.showToast('SAVED PROGRESS LOADED', 'Welcome back to Vanta City', 'success');
              }}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer font-['Chakra_Petch',sans-serif]"
            >
              LOAD SAVED PROGRESS
            </button>

            <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400 flex justify-around font-mono">
              <span>WASD Move</span>
              <span>•</span>
              <span>E Interact</span>
              <span>•</span>
              <span>Q Target Lock</span>
              <span>•</span>
              <span>M City Map</span>
            </div>
          </div>

          {/* Footer Features */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono pb-2">
            <div className="flex items-center gap-1.5"><Car className="w-4 h-4 text-cyan-400" /> 8 Drivable Vehicles & Nitro</div>
            <div className="flex items-center gap-1.5"><Compass className="w-4 h-4 text-emerald-400" /> 8 City Districts & Landmarks</div>
            <div className="flex items-center gap-1.5"><Crosshair className="w-4 h-4 text-amber-400" /> Full RPG Stats & Body Morphing</div>
            <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-rose-400" /> 5-Star Police Heat & EMS Paramedics</div>
          </div>
        </div>
      )}

      {/* Wasted / Hospitalized Death Screen */}
      {isPlaying && gameState.player.health <= 0 && (
        <div className="absolute inset-0 z-50 bg-red-950/85 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 text-white animate-in fade-in duration-300">
          <h2 className="text-6xl font-black tracking-widest text-red-500 uppercase font-['Chakra_Petch',sans-serif] drop-shadow-2xl">
            WASTED
          </h2>
          <p className="text-sm font-mono text-zinc-300 mt-2 max-w-sm">
            Jayden collapsed from injuries. Emergency medical services dispatched and stabilized you to Riverside Safehouse.
          </p>
          <button
            onClick={handleRespawn}
            className="mt-6 bg-red-600 hover:bg-red-500 text-white font-black px-8 py-3.5 rounded-xl text-sm uppercase tracking-wider transition shadow-2xl shadow-red-600/50 cursor-pointer font-['Chakra_Petch',sans-serif]"
          >
            RESPAWN AT SAFEHOUSE (-$100)
          </button>
        </div>
      )}

      {/* Modals */}
      {activeModal === 'map' && (
        <FullMapModal
          playerPos={playerCoords}
          onClose={() => setActiveModal('none')}
          onTeleport={handleTeleport}
        />
      )}

      {activeModal === 'pause' && (
        <PauseMenuModal
          playerPos={playerCoords}
          onClose={() => setActiveModal('none')}
          onOpenMap={() => setActiveModal('map')}
        />
      )}

      {activeModal === 'shop' && (
        <ShopModal onClose={() => setActiveModal('none')} />
      )}

      {activeModal === 'garage' && (
        <GarageModal
          onClose={() => setActiveModal('none')}
          onSpawnVehicle={handleSpawnVehicle}
        />
      )}

      {activeModal === 'safehouse' && (
        <SafehouseModal
          playerPos={playerCoords}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'gym' && (
        <GymModal onClose={() => setActiveModal('none')} />
      )}

      {activeModal === 'food' && (
        <FoodModal onClose={() => setActiveModal('none')} />
      )}

      {activeModal === 'barber' && (
        <BarberTattooModal mode="barber" onClose={() => setActiveModal('none')} />
      )}

      {activeModal === 'tattoo' && (
        <BarberTattooModal mode="tattoo" onClose={() => setActiveModal('none')} />
      )}

      {activeModal === 'arcade' && (
        <ArcadeModal onClose={() => setActiveModal('none')} />
      )}

      {activeModal === 'property' && (
        <PropertyModal onClose={() => setActiveModal('none')} />
      )}

      {activeModal === 'stats' && (
        <CharacterStatsModal onClose={() => setActiveModal('none')} />
      )}

      {activeModal === 'settings' && (
        <SettingsModal onClose={() => setActiveModal('none')} />
      )}

      {/* F3 Developer Debug Panel */}
      {showDebug && (
        <DebugPanel
          fps={fps}
          playerPos={playerCoords}
          npcCount={npcCount}
          vehicleCount={vehicleCount}
          onClose={() => setShowDebug(false)}
          onTeleport={handleTeleport}
          onSpawnVehicle={handleSpawnVehicle}
        />
      )}
    </div>
  );
}
