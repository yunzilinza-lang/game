import React, { useEffect, useRef } from 'react';
import { gameState } from '../core/GameState';
import { missionSystem } from '../missions/MissionSystem';
import { soundEngine } from '../audio/SoundEngine';
import { 
  Shield, 
  Heart, 
  DollarSign, 
  Radio, 
  Crosshair, 
  Volume2, 
  VolumeX, 
  Navigation,
  Car,
  Zap,
  Activity,
  User,
  Building2,
  Settings,
  Target
} from 'lucide-react';

interface HUDProps {
  playerPos: [number, number, number];
  playerHeading: number;
  onOpenMap: () => void;
  onOpenPause: () => void;
  onToggleDebug: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  playerPos,
  playerHeading,
  onOpenMap,
  onOpenPause,
  onToggleDebug
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const curDistrict = gameState.getDistrictInfo(gameState.player.currentDistrict);
  const activeObj = missionSystem.getActiveObjective();
  const curWeapon = gameState.player.weapons[gameState.player.currentWeapon];
  const isMuted = soundEngine.getMuted();

  // Render Minimap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const center = width / 2;
    const radius = width / 2 - 4;
    const scale = 0.55; // pixels per world meter

    ctx.clearRect(0, 0, width, height);

    // Circular clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.clip();

    // Minimap Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Translate to player center and rotate to player heading
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(-playerHeading);

    // Draw Roads
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 14 * scale;

    const avenuesZ = [-180, -70, 70, 180, 300];
    const boulevardsX = [-180, -70, 70, 180, 300];

    // East-West avenues
    avenuesZ.forEach(z => {
      const relZ = (z - playerPos[2]) * scale;
      ctx.beginPath();
      ctx.moveTo(-300, relZ);
      ctx.lineTo(300, relZ);
      ctx.stroke();
    });

    // North-South boulevards
    boulevardsX.forEach(x => {
      const relX = (x - playerPos[0]) * scale;
      ctx.beginPath();
      ctx.moveTo(relX, -300);
      ctx.lineTo(relX, 300);
      ctx.stroke();
    });

    // Safehouse blip
    const shRelX = (-170 - playerPos[0]) * scale;
    const shRelZ = (80 - playerPos[2]) * scale;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(shRelX, shRelZ, 4, 0, Math.PI * 2);
    ctx.fill();

    // Garage blip
    const garRelX = (-135 - playerPos[0]) * scale;
    const garRelZ = (70 - playerPos[2]) * scale;
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(garRelX, garRelZ, 4, 0, Math.PI * 2);
    ctx.fill();

    // Gym blip
    const gymRelX = (-140 - playerPos[0]) * scale;
    const gymRelZ = (110 - playerPos[2]) * scale;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(gymRelX, gymRelZ, 4, 0, Math.PI * 2);
    ctx.fill();

    // Mission target marker on minimap
    if (activeObj && activeObj.targetPos) {
      const tX = (activeObj.targetPos[0] - playerPos[0]) * scale;
      const tZ = (activeObj.targetPos[2] - playerPos[2]) * scale;

      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(tX, tZ - 7);
      ctx.lineTo(tX + 7, tZ);
      ctx.lineTo(tX, tZ + 7);
      ctx.lineTo(tX - 7, tZ);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }

    ctx.restore();

    // Player Direction Arrow (fixed center)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(center, center - 7);
    ctx.lineTo(center + 5, center + 6);
    ctx.lineTo(center, center + 3);
    ctx.lineTo(center - 5, center + 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();

    // Outer Ring
    ctx.strokeStyle = gameState.heat > 0 ? (Date.now() % 400 < 200 ? '#ef4444' : '#3b82f6') : '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Compass North Indicator
    const northAngle = -playerHeading - Math.PI / 2;
    const nx = center + Math.cos(northAngle) * (radius - 8);
    const ny = center + Math.sin(northAngle) * (radius - 8);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', nx, ny);

  }, [playerPos, playerHeading, activeObj, gameState.heat]);

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden font-['Inter',sans-serif] text-white">
      {/* Top Bar: District & Quick Hubs */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-auto">
        {/* District & Location */}
        <div className="flex items-center gap-2">
          <div className="bg-zinc-900/90 backdrop-blur border border-zinc-700/70 rounded-lg px-3 py-1.5 flex items-center gap-2.5 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: curDistrict.color }}></span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-300 font-['Chakra_Petch',sans-serif]">
                {curDistrict.name}
              </div>
              <div className="text-[10px] text-zinc-400">
                VANTA CITY • {gameState.timeHour < 6 ? 'NIGHT' : gameState.timeHour < 12 ? 'MORNING' : gameState.timeHour < 18 ? 'AFTERNOON' : 'DUSK'} ({Math.floor(gameState.timeHour)}:{String(Math.floor((gameState.timeHour % 1) * 60)).padStart(2, '0')})
              </div>
            </div>
          </div>

          {/* Quick Hub Buttons */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-modal', { detail: 'stats' }))}
            className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/70 rounded-lg px-2.5 py-2 flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition shadow"
            title="Character RPG Stats"
          >
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline font-mono">RPG STATS</span>
          </button>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-modal', { detail: 'property' }))}
            className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/70 rounded-lg px-2.5 py-2 flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition shadow"
            title="Real Estate Commerce"
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline font-mono">REAL ESTATE</span>
          </button>

          <button
            onClick={onOpenMap}
            className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/70 rounded-lg px-2.5 py-2 flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition shadow"
            title="Open Full Map [M]"
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline font-mono">MAP [M]</span>
          </button>
        </div>

        {/* Right: Cash & Heat */}
        <div className="flex flex-col items-end gap-2">
          {/* Cash Counter */}
          <div className="bg-zinc-950/90 backdrop-blur border border-emerald-500/40 rounded-lg px-4 py-1.5 flex items-center gap-2 shadow-xl">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="text-xl font-black tracking-tight text-emerald-400 font-['JetBrains_Mono',monospace]">
              {gameState.player.money.toLocaleString()}
            </span>
          </div>

          {/* HEAT Meter (0 to 5 stars) */}
          <div className="bg-zinc-950/90 backdrop-blur border border-zinc-800 rounded-lg px-3 py-1.5 flex items-center gap-2.5 shadow-lg">
            <span className="text-[11px] font-black tracking-wider text-zinc-400 font-['Chakra_Petch',sans-serif]">
              HEAT
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((lvl) => {
                const active = gameState.heat >= lvl;
                return (
                  <div
                    key={lvl}
                    className={`w-3.5 h-4.5 rounded-xs transition-all ${
                      active
                        ? lvl <= 2
                          ? 'bg-amber-500 shadow-sm shadow-amber-500/50 animate-pulse'
                          : 'bg-red-600 shadow-sm shadow-red-600/60 animate-pulse'
                        : 'bg-zinc-800/80 border border-zinc-700/40'
                    }`}
                  />
                );
              })}
            </div>
            {gameState.policeSearching && (
              <span className="text-[10px] font-mono font-bold text-amber-400 animate-pulse">
                EVADING: {Math.max(0, 14 - Math.floor(gameState.searchTimer))}s
              </span>
            )}
          </div>

          {/* Quick Sound / Settings */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundEngine.toggleRadio();
                gameState.notify();
              }}
              className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/70 rounded-md px-2 py-1 flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <Radio className={`w-3 h-3 ${soundEngine.isRadioOn() ? 'text-amber-400 animate-spin' : 'text-zinc-400'}`} />
              <span className="font-mono text-[10px]">
                {soundEngine.isRadioOn() ? soundEngine.getCurrentStation().name : 'RADIO [R]'}
              </span>
            </button>

            <button
              onClick={() => {
                soundEngine.toggleMute();
                gameState.notify();
              }}
              className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/70 rounded-md p-1.5 cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-zinc-300" />}
            </button>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-modal', { detail: 'settings' }))}
              className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/70 rounded-md p-1.5 cursor-pointer"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5 text-zinc-300" />
            </button>

            <button
              onClick={onToggleDebug}
              className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/70 rounded-md px-1.5 py-1 text-[10px] font-mono cursor-pointer"
            >
              F3
            </button>
          </div>
        </div>
      </div>

      {/* Center Toast Banner */}
      {gameState.activeToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 max-w-md w-full px-4 text-center">
          <div className={`inline-block border px-5 py-2 rounded-lg backdrop-blur-md shadow-2xl transition-all ${
            gameState.activeToast.type === 'danger'
              ? 'bg-red-950/85 border-red-500/80 text-red-200'
              : gameState.activeToast.type === 'success'
              ? 'bg-emerald-950/85 border-emerald-500/80 text-emerald-200'
              : gameState.activeToast.type === 'warning'
              ? 'bg-amber-950/85 border-amber-500/80 text-amber-200'
              : 'bg-zinc-900/85 border-cyan-500/80 text-cyan-200'
          }`}>
            <div className="text-sm font-black tracking-wider uppercase font-['Chakra_Petch',sans-serif]">
              {gameState.activeToast.title}
            </div>
            <div className="text-xs text-zinc-300 font-medium mt-0.5">
              {gameState.activeToast.message}
            </div>
          </div>
        </div>
      )}

      {/* Active Mission Objective Tracker */}
      {activeObj && (
        <div className="absolute top-20 left-4 max-w-xs bg-zinc-950/85 backdrop-blur border-l-4 border-l-amber-500 border-zinc-800/80 rounded-r-lg p-2.5 shadow-xl pointer-events-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-['Chakra_Petch',sans-serif]">
            ACTIVE OBJECTIVE
          </div>
          <div className="text-xs font-semibold text-zinc-100 mt-0.5 leading-snug">
            {activeObj.text}
          </div>
        </div>
      )}

      {/* Target Lock Reticle Indicator */}
      {gameState.targetLockPos && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-16 h-16 border-2 border-red-500/80 rounded-full flex items-center justify-center animate-pulse">
            <Target className="w-8 h-8 text-red-500" />
          </div>
        </div>
      )}

      {/* Crosshair when on foot & no target lock */}
      {!gameState.player.inVehicle && !gameState.targetLockPos && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-80">
          <div className="relative w-5 h-5 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400" />
            <div className="absolute w-4 h-0.5 bg-cyan-400/50" />
            <div className="absolute h-4 w-0.5 bg-cyan-400/50" />
          </div>
        </div>
      )}

      {/* Bottom Bar: Minimap & Vitals */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
        {/* Left: Circular Minimap */}
        <div className="relative flex flex-col items-start gap-1">
          <div className="relative w-36 h-36 rounded-full shadow-2xl p-0.5 bg-zinc-950/80 backdrop-blur pointer-events-auto">
            <canvas ref={canvasRef} width={144} height={144} className="rounded-full w-full h-full" />
          </div>
          <div className="text-[10px] font-mono text-zinc-400 ml-2">
            VANTA GPS • X:{Math.round(playerPos[0])} Z:{Math.round(playerPos[2])}
          </div>
        </div>

        {/* Right: Health, Armor, Stamina, Nitro / Speedometer */}
        <div className="flex flex-col items-end gap-2.5">
          {/* In-Vehicle Speedometer & Nitro */}
          {gameState.player.inVehicle && (
            <div className="bg-zinc-950/90 backdrop-blur border border-zinc-800 rounded-xl px-4 py-2 flex items-center gap-3 shadow-2xl">
              <Car className="w-5 h-5 text-cyan-400" />
              <div className="text-right">
                <div className="text-2xl font-black text-cyan-400 font-['JetBrains_Mono',monospace] leading-none">
                  {gameState.vehicleSpeedKmH}
                </div>
                <div className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase">
                  KM / H
                </div>
              </div>

              {/* Nitro Gauge */}
              <div className="flex flex-col gap-1 items-end pl-2 border-l border-zinc-800">
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-400">
                  <Zap className="w-3 h-3 fill-cyan-400" />
                  NITRO
                </div>
                <div className="w-14 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-75 ${gameState.isNitroActive ? 'bg-cyan-300 shadow-sm shadow-cyan-400' : 'bg-cyan-500'}`}
                    style={{ width: `${gameState.nitroAmount}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Vitals Container */}
          <div className="bg-zinc-950/90 backdrop-blur border border-zinc-800/80 rounded-xl p-3 flex flex-col gap-2 min-w-56 shadow-2xl">
            {/* Health Bar */}
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500 fill-red-500 shrink-0" />
              <div className="flex-1 bg-zinc-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-150"
                  style={{ width: `${(gameState.player.health / gameState.player.maxHealth) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-red-400 w-7 text-right">
                {Math.round(gameState.player.health)}
              </span>
            </div>

            {/* Armor Bar */}
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400 fill-cyan-400/40 shrink-0" />
              <div className="flex-1 bg-zinc-900 rounded-full h-2 overflow-hidden p-0.5 border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full transition-all duration-150"
                  style={{ width: `${(gameState.player.armor / gameState.player.maxArmor) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400 w-7 text-right">
                {Math.round(gameState.player.armor)}
              </span>
            </div>

            {/* Stamina Bar */}
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex-1 bg-zinc-900 rounded-full h-1.5 overflow-hidden p-0.5 border border-zinc-800">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-75"
                  style={{ width: `${(gameState.player.stamina / gameState.player.maxStamina) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 w-7 text-right">
                {Math.round(gameState.player.stamina)}
              </span>
            </div>

            {/* Weapon & Ammo Card */}
            <div className="border-t border-zinc-800/80 pt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-zinc-200 font-['Chakra_Petch',sans-serif]">
                  {curWeapon?.name || 'Unarmed'}
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-amber-400">
                {curWeapon?.id === 'fists' ? '∞' : `${curWeapon?.magAmmo} / ${curWeapon?.ammo}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
