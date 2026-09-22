import React, { useEffect, useRef, useState } from 'react';
import { gameState } from '../core/GameState';
import { Gamepad2, Trophy, Zap, X } from 'lucide-react';

interface ArcadeModalProps {
  onClose: () => void;
}

export const ArcadeModal: React.FC<ArcadeModalProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let playerX = canvas.width / 2;
    const playerY = canvas.height - 40;
    let bullets: Array<{ x: number; y: number }> = [];
    let asteroids: Array<{ x: number; y: number; speed: number; size: number }> = [];
    let currentScore = 0;
    let animId: number;

    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      if (e.code === 'Space') {
        bullets.push({ x: playerX, y: playerY - 10 });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let lastSpawn = 0;

    const loop = (time: number) => {
      // Clear
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield background
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 20; i++) {
        const sx = (Math.sin(time * 0.001 + i) * 0.5 + 0.5) * canvas.width;
        const sy = (time * 0.05 * (i % 3 + 1) + i * 20) % canvas.height;
        ctx.fillRect(sx, sy, 2, 2);
      }

      // Player Movement
      if (keys['ArrowLeft'] || keys['KeyA']) playerX = Math.max(20, playerX - 5);
      if (keys['ArrowRight'] || keys['KeyD']) playerX = Math.min(canvas.width - 20, playerX + 5);

      // Draw Player Ship
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.moveTo(playerX, playerY - 16);
      ctx.lineTo(playerX - 14, playerY + 14);
      ctx.lineTo(playerX + 14, playerY + 14);
      ctx.closePath();
      ctx.fill();

      // Bullets
      ctx.fillStyle = '#fef08a';
      for (let b = bullets.length - 1; b >= 0; b--) {
        bullets[b].y -= 9;
        ctx.fillRect(bullets[b].x - 2, bullets[b].y, 4, 10);
        if (bullets[b].y < 0) bullets.splice(b, 1);
      }

      // Asteroids Spawning
      if (time - lastSpawn > 650) {
        asteroids.push({
          x: Math.random() * (canvas.width - 40) + 20,
          y: -20,
          speed: 2.2 + Math.random() * 2.5,
          size: 14 + Math.random() * 10
        });
        lastSpawn = time;
      }

      // Asteroids Update & Collision
      ctx.fillStyle = '#ef4444';
      for (let a = asteroids.length - 1; a >= 0; a--) {
        const ast = asteroids[a];
        ast.y += ast.speed;

        ctx.beginPath();
        ctx.arc(ast.x, ast.y, ast.size, 0, Math.PI * 2);
        ctx.fill();

        // Check bullet hit
        for (let b = bullets.length - 1; b >= 0; b--) {
          const dx = ast.x - bullets[b].x;
          const dy = ast.y - bullets[b].y;
          if (Math.hypot(dx, dy) < ast.size) {
            bullets.splice(b, 1);
            asteroids.splice(a, 1);
            currentScore += 100;
            setScore(currentScore);
            break;
          }
        }

        // Check player collision
        if (Math.hypot(ast.x - playerX, ast.y - playerY) < ast.size + 12) {
          setGameOver(true);
          const reward = Math.floor(currentScore / 10);
          if (reward > 0) {
            gameState.addMoney(reward);
            gameState.showToast('ARCADE HIGH SCORE', `+$${reward} token payout!`, 'success');
          }
          return;
        }

        if (ast.y > canvas.height + 20) {
          asteroids.splice(a, 1);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, gameOver]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl text-white font-['Chakra_Petch',sans-serif]">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-950 via-zinc-900 to-zinc-900 p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-600/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wide uppercase">Retro Arcade: STAR RUNNER 84</h2>
              <p className="text-xs text-zinc-400 font-sans">Arrow Keys Move • Spacebar Fire</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="p-5 flex flex-col items-center justify-center bg-zinc-950 relative">
          <canvas
            ref={canvasRef}
            width={480}
            height={340}
            className="border-2 border-pink-500/40 rounded-xl shadow-[0_0_25px_rgba(236,72,153,0.2)] bg-black"
          />

          {!gameStarted && (
            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center">
              <Trophy className="w-12 h-12 text-pink-400 mb-3 animate-bounce" />
              <h3 className="text-2xl font-bold text-pink-400 tracking-wider mb-2">STAR RUNNER 84</h3>
              <p className="text-xs text-zinc-400 mb-4">Blast asteroids and earn cash multipliers</p>
              <button
                onClick={() => {
                  setScore(0);
                  setGameOver(false);
                  setGameStarted(true);
                }}
                className="px-6 py-2.5 bg-pink-600 hover:bg-pink-500 font-bold uppercase tracking-wider rounded-lg transition"
              >
                Insert Coin ($5)
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center">
              <h3 className="text-3xl font-bold text-red-500 mb-2">GAME OVER</h3>
              <p className="text-lg font-bold text-amber-400 mb-4">Final Score: {score}</p>
              <button
                onClick={() => {
                  setScore(0);
                  setGameOver(false);
                  setGameStarted(true);
                }}
                className="px-6 py-2.5 bg-pink-600 hover:bg-pink-500 font-bold uppercase tracking-wider rounded-lg transition"
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-between items-center">
          <div className="text-sm font-bold text-amber-400">Score: {score}</div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold uppercase transition"
          >
            Exit Arcade
          </button>
        </div>
      </div>
    </div>
  );
};
