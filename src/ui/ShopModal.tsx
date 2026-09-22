import React, { useState } from 'react';
import { gameState } from '../core/GameState';
import { soundEngine } from '../audio/SoundEngine';
import { X, ShoppingBag, Heart, Shield, Sparkles, Check } from 'lucide-react';

interface ShopModalProps {
  onClose: () => void;
}

interface ShopItem {
  id: string;
  name: string;
  type: 'clothing' | 'supply';
  price: number;
  description: string;
  color?: string;
  clothingType?: 'jacket' | 'pants' | 'shoes';
  healAmount?: number;
  armorAmount?: number;
}

const SHOP_CATALOG: ShopItem[] = [
  // Supplies
  {
    id: 'medkit_standard',
    name: 'Emergency Medkit',
    type: 'supply',
    price: 80,
    description: 'Restores +50 Health instantly with sterilized field dressings.',
    healAmount: 50
  },
  {
    id: 'vest_tactical',
    name: 'Kevlar Ballistic Vest',
    type: 'supply',
    price: 150,
    description: 'Equips +60 Body Armor to absorb incoming ballistic damage.',
    armorAmount: 60
  },
  {
    id: 'ammo_box',
    name: 'Military Surplus Ammo Box',
    type: 'supply',
    price: 120,
    description: 'Fully replenishes Pistol and Shotgun ammunition reserves.'
  },
  // Clothing
  {
    id: 'jacket_urban_dark',
    name: 'Urban Tactical Jacket',
    type: 'clothing',
    price: 120,
    clothingType: 'jacket',
    color: '#1e293b',
    description: 'Weatherproof dark slate jacket with utility pockets.'
  },
  {
    id: 'jacket_neon_cyan',
    name: 'Cyber Neon Windbreaker',
    type: 'clothing',
    price: 240,
    clothingType: 'jacket',
    color: '#06b6d4',
    description: 'High-visibility electric cyan runner jacket.'
  },
  {
    id: 'jacket_crimson',
    name: 'East Syndicate Crimson Leather',
    type: 'clothing',
    price: 350,
    clothingType: 'jacket',
    color: '#991b1b',
    description: 'Bold red biker jacket with reinforced padded shoulders.'
  },
  {
    id: 'jacket_desert',
    name: 'Desert Camo Parka',
    type: 'clothing',
    price: 190,
    clothingType: 'jacket',
    color: '#78350f',
    description: 'Warm earth-toned fleece-lined street parka.'
  }
];

export const ShopModal: React.FC<ShopModalProps> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'clothing' | 'supply'>('all');

  const filteredItems = SHOP_CATALOG.filter(
    item => activeCategory === 'all' || item.type === activeCategory
  );

  const handleBuy = (item: ShopItem) => {
    if (!gameState.spendMoney(item.price)) return;

    if (item.healAmount || item.armorAmount) {
      gameState.healPlayer(item.healAmount || 0, item.armorAmount || 0);
      gameState.showToast(`PURCHASED ${item.name.toUpperCase()}`, 'Vitals replenished', 'success');
    } else if (item.id === 'ammo_box') {
      gameState.player.weapons.pistol.ammo = gameState.player.weapons.pistol.maxAmmo;
      gameState.player.weapons.shotgun.ammo = gameState.player.weapons.shotgun.maxAmmo;
      if (gameState.player.weapons.rifle.unlocked) {
        gameState.player.weapons.rifle.ammo = gameState.player.weapons.rifle.maxAmmo;
      }
      gameState.showToast('AMMO REFILLED', 'All weapons loaded to max capacity', 'success');
    } else if (item.type === 'clothing' && item.color) {
      if (item.clothingType === 'jacket') {
        gameState.player.jacketColor = item.color;
        window.dispatchEvent(new CustomEvent('update-wardrobe'));
      }
      gameState.showToast('OUTFIT EQUIPPED', item.name, 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-['Inter',sans-serif]">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-black text-white uppercase font-['Chakra_Petch',sans-serif]">
                VANTA COMMERCE & THREADS
              </h3>
              <p className="text-[11px] text-zinc-400">Riverside District Storefront</p>
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

        {/* Category Filters */}
        <div className="px-6 py-3 border-b border-zinc-800/80 flex gap-2 bg-zinc-950/40">
          {(['all', 'clothing', 'supply'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => {
                soundEngine.playUI('click');
                setActiveCategory(cat);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer font-['Chakra_Petch',sans-serif] ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog List */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-3">
          {filteredItems.map(item => {
            const isEquipped = item.clothingType === 'jacket' && gameState.player.jacketColor === item.color;

            return (
              <div
                key={item.id}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex items-center justify-between transition hover:border-zinc-700"
              >
                <div className="flex items-center gap-3">
                  {item.color ? (
                    <div
                      className="w-10 h-10 rounded-lg border border-white/20 shadow-inner flex items-center justify-center shrink-0"
                      style={{ backgroundColor: item.color }}
                    >
                      {isEquipped && <Check className="w-5 h-5 text-white" />}
                    </div>
                  ) : item.armorAmount ? (
                    <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5 text-cyan-400" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-red-950/80 border border-red-800 flex items-center justify-center shrink-0">
                      <Heart className="w-5 h-5 text-red-400" />
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-bold text-white font-['Chakra_Petch',sans-serif]">
                      {item.name}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    ${item.price}
                  </span>
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={gameState.player.money < item.price || isEquipped}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer font-['Chakra_Petch',sans-serif] ${
                      isEquipped
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        : gameState.player.money < item.price
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                    }`}
                  >
                    {isEquipped ? 'EQUIPPED' : 'PURCHASE'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
