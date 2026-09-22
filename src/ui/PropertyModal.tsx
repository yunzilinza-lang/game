import React from 'react';
import { gameState } from '../core/GameState';
import { Building2, DollarSign, CheckCircle2, X } from 'lucide-react';

interface PropertyModalProps {
  onClose: () => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({ onClose }) => {
  const properties = gameState.properties;
  const player = gameState.player;

  const handleBuy = (prop: any) => {
    if (gameState.spendMoney(prop.price)) {
      prop.owned = true;
      gameState.showToast('PROPERTY ACQUIRED', prop.name, 'success');
      gameState.notify();
    }
  };

  const handleCollectIncome = () => {
    let totalIncome = 0;
    properties.forEach(p => {
      if (p.owned) totalIncome += p.dailyIncome;
    });

    if (totalIncome > 0) {
      gameState.addMoney(totalIncome);
      gameState.showToast('COMMERCIAL INCOME COLLECTED', `+$${totalIncome} received`, 'success');
    } else {
      gameState.showToast('NO REVENUE READY', 'Acquire commercial hubs for daily cashflow', 'warning');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl text-white font-['Chakra_Petch',sans-serif]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-900 p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide uppercase">Vanta Real Estate & Commerce</h2>
              <p className="text-xs text-zinc-400 font-sans">Acquire safehouses, garages, and passive revenue hubs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Property List */}
        <div className="p-5 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
          {properties.map(p => (
            <div
              key={p.id}
              className={`p-4 rounded-xl border transition flex items-center justify-between ${
                p.owned ? 'bg-zinc-800/40 border-emerald-500/40' : 'bg-zinc-800/80 border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base">{p.name}</h3>
                  {p.owned && (
                    <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      OWNED
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 font-sans mt-1">{p.description}</p>
                {p.dailyIncome > 0 && (
                  <p className="text-xs text-emerald-400 mt-1 font-bold">Daily Income: +${p.dailyIncome} / cycle</p>
                )}
              </div>

              <div>
                {p.owned ? (
                  <span className="text-xs text-zinc-400 font-bold uppercase">Asset In Hand</span>
                ) : (
                  <button
                    onClick={() => handleBuy(p)}
                    disabled={player.money < p.price}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 font-bold text-xs uppercase tracking-wider rounded-lg transition"
                  >
                    Buy ${p.price}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-between items-center">
          <button
            onClick={handleCollectIncome}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs uppercase flex items-center gap-2 transition"
          >
            <DollarSign className="w-4 h-4" />
            Collect Daily Revenues
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold uppercase transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
