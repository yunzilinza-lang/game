import React, { useState } from 'react';
import { gameState } from '../core/GameState';
import { Settings, Volume2, Sliders, Gamepad2, Eye, X } from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [settings, setSettings] = useState({ ...gameState.settings });

  const handleChange = (key: keyof typeof settings, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    gameState.settings = updated;
    if (key === 'soundVolume') {
      soundEngine.setMasterVolume(value);
    }
  };

  const handleSave = () => {
    gameState.saveGame();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl text-white font-['Chakra_Petch',sans-serif]">
        {/* Header */}
        <div className="bg-gradient-to-r from-zinc-800 via-zinc-900 to-zinc-900 p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-700/40 border border-zinc-600/40 flex items-center justify-center text-zinc-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide uppercase">Game & Controls Settings</h2>
              <p className="text-xs text-zinc-400 font-sans">Camera sensitivity, input modes, keybindings & audio</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto font-sans">
          {/* Controls & Camera */}
          <div>
            <h3 className="text-sm font-bold text-cyan-400 uppercase font-['Chakra_Petch'] mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Camera & Input Controls
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>Mouse Look Sensitivity</span>
                  <span className="font-bold text-cyan-400">{settings.mouseSensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={settings.mouseSensitivity}
                  onChange={e => handleChange('mouseSensitivity', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>Default Camera Distance</span>
                  <span className="font-bold text-cyan-400">{settings.cameraDistance.toFixed(1)}m</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="8.5"
                  step="0.2"
                  value={settings.cameraDistance}
                  onChange={e => handleChange('cameraDistance', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center justify-between p-3 bg-zinc-800/60 rounded-xl border border-zinc-700 cursor-pointer">
                  <span className="text-xs text-zinc-300">Invert Y Axis</span>
                  <input
                    type="checkbox"
                    checked={settings.invertY}
                    onChange={e => handleChange('invertY', e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-zinc-800/60 rounded-xl border border-zinc-700 cursor-pointer">
                  <span className="text-xs text-zinc-300">Shift Lock Camera</span>
                  <input
                    type="checkbox"
                    checked={settings.shiftLock}
                    onChange={e => handleChange('shiftLock', e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Audio */}
          <div className="pt-4 border-t border-zinc-800">
            <h3 className="text-sm font-bold text-amber-400 uppercase font-['Chakra_Petch'] mb-4 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Audio & Sound Effects
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-zinc-300 mb-1">
                  <span>Master SFX Volume</span>
                  <span className="font-bold text-amber-400">{Math.round(settings.soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={e => handleChange('soundVolume', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end gap-3 font-['Chakra_Petch']">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold uppercase transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold uppercase transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
