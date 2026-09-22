import React, { useState } from 'react';
import { gameState } from '../core/GameState';
import { Scissors, Sparkles, X } from 'lucide-react';

interface BarberTattooModalProps {
  mode: 'barber' | 'tattoo';
  onClose: () => void;
}

export const BarberTattooModal: React.FC<BarberTattooModalProps> = ({ mode, onClose }) => {
  const player = gameState.player;
  const [hairColor, setHairColor] = useState(player.hairColor || '#1c1917');
  const [selectedStyle, setSelectedStyle] = useState(player.hairStyle || 'textured');

  const hairStyles = [
    { id: 'fade', name: 'Clean High Fade', price: 40 },
    { id: 'textured', name: 'Textured Street Crop', price: 50 },
    { id: 'short', name: 'Buzz Tactical Cut', price: 30 },
    { id: 'shaved', name: 'Clean Shaved', price: 25 },
    { id: 'dreads', name: 'Braided Dreads', price: 65 },
  ];

  const tattoos = [
    { id: 'tat_dragon', name: 'Iron Serpent Sleeve', location: 'Right Arm', price: 180 },
    { id: 'tat_vanta', name: 'Vanta City Skyline', location: 'Chest', price: 220 },
    { id: 'tat_tribal', name: 'Riverside Eagle', location: 'Back', price: 260 },
  ];

  const handleApplyHair = (style: any) => {
    if (gameState.spendMoney(style.price)) {
      gameState.player.hairStyle = style.id;
      gameState.player.hairColor = hairColor;
      gameState.showToast('NEW HAIR STYLE APPLIED', style.name, 'success');
      gameState.notify();
    }
  };

  const handleApplyTattoo = (tat: any) => {
    if (gameState.spendMoney(tat.price)) {
      if (!gameState.player.tattoos.includes(tat.id)) {
        gameState.player.tattoos.push(tat.id);
        gameState.showToast('TATTOO INKED', `${tat.name} on ${tat.location}`, 'success');
        gameState.notify();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl text-white font-['Chakra_Petch',sans-serif]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-zinc-900 to-zinc-900 p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide uppercase">
                {mode === 'barber' ? 'Fade & Blade Barbershop' : 'Vanta Ink Tattoo Studio'}
              </h2>
              <p className="text-xs text-zinc-400 font-sans">
                {mode === 'barber' ? 'Fresh hairstyles, modern fades & hair color' : 'Custom body art and faction sleeves'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-3">
          {mode === 'barber' ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-400 uppercase">Select Style</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Hair Dye:</span>
                  <input
                    type="color"
                    value={hairColor}
                    onChange={e => setHairColor(e.target.value)}
                    className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
                  />
                </div>
              </div>
              {hairStyles.map(s => (
                <div key={s.id} className="p-3.5 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl flex items-center justify-between transition">
                  <div>
                    <div className="font-bold text-sm">{s.name}</div>
                    <div className="text-xs text-zinc-400 font-sans">${s.price}</div>
                  </div>
                  <button
                    onClick={() => handleApplyHair(s)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 font-bold text-xs uppercase rounded-lg transition"
                  >
                    Cut & Style
                  </button>
                </div>
              ))}
            </>
          ) : (
            <>
              {tattoos.map(t => (
                <div key={t.id} className="p-3.5 bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl flex items-center justify-between transition">
                  <div>
                    <div className="font-bold text-sm">{t.name}</div>
                    <div className="text-xs text-zinc-400 font-sans">{t.location} • ${t.price}</div>
                  </div>
                  <button
                    onClick={() => handleApplyTattoo(t)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 font-bold text-xs uppercase rounded-lg transition"
                  >
                    Ink Tattoo
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold uppercase transition"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};
