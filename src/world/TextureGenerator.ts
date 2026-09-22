import * as THREE from 'three';

export class TextureGenerator {
  private static cache: Map<string, THREE.CanvasTexture> = new Map();

  // Create Road Texture with Asphalt noise, double yellow center line, white shoulder lines, dashed lane dividers
  public static createRoadTexture(width: number = 512, height: number = 512): THREE.CanvasTexture {
    const key = `road_${width}_${height}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Dark asphalt base
    ctx.fillStyle = '#22252a';
    ctx.fillRect(0, 0, width, height);

    // Subtle asphalt grain noise
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 16;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // White outer solid shoulder lines (left & right)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(35, 0);
    ctx.lineTo(35, height);
    ctx.moveTo(width - 35, 0);
    ctx.lineTo(width - 35, height);
    ctx.stroke();

    // Double solid yellow center line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 6, 0);
    ctx.lineTo(width / 2 - 6, height);
    ctx.moveTo(width / 2 + 6, 0);
    ctx.lineTo(width / 2 + 6, height);
    ctx.stroke();

    // White dashed lane dividers (mid-lanes)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 5;
    ctx.setLineDash([32, 28]);
    ctx.beginPath();
    ctx.moveTo(width * 0.25, 0);
    ctx.lineTo(width * 0.25, height);
    ctx.moveTo(width * 0.75, 0);
    ctx.lineTo(width * 0.75, height);
    ctx.stroke();
    ctx.setLineDash([]);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  // Crosswalk (Zebra crossing)
  public static createCrosswalkTexture(): THREE.CanvasTexture {
    const key = 'crosswalk';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#22252a';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = '#f8fafc';
    const stripes = 6;
    const stripeWidth = 256 / (stripes * 2);
    for (let i = 0; i < stripes; i++) {
      ctx.fillRect(i * stripeWidth * 2 + 10, 15, stripeWidth, 226);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  // Sidewalk concrete paving grid
  public static createSidewalkTexture(): THREE.CanvasTexture {
    const key = 'sidewalk';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Concrete light grey
    ctx.fillStyle = '#78716c';
    ctx.fillRect(0, 0, 256, 256);

    // Subtle grain
    const imgData = ctx.getImageData(0, 0, 256, 256);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 12;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // Tile seams
    ctx.strokeStyle = '#44403c';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, 124, 124);
    ctx.strokeRect(128, 4, 124, 124);
    ctx.strokeRect(4, 128, 124, 124);
    ctx.strokeRect(128, 128, 124, 124);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  // Modern Skyscraper Facade (Glass + Lit Window grid)
  public static createSkyscraperFacadeTexture(style: 'cyan' | 'amber' | 'blue' = 'cyan'): THREE.CanvasTexture {
    const key = `skyscraper_${style}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Dark glass facade background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 512);

    // Steel framework mullions
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;

    const cols = 8;
    const rows = 16;
    const cellW = 512 / cols;
    const cellH = 512 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellW + 4;
        const y = r * cellH + 4;
        const w = cellW - 8;
        const h = cellH - 8;

        const isLit = Math.random() > 0.4;
        if (isLit) {
          if (style === 'cyan') {
            ctx.fillStyle = Math.random() > 0.5 ? '#38bdf8' : '#e0f2fe';
          } else if (style === 'amber') {
            ctx.fillStyle = Math.random() > 0.4 ? '#fef08a' : '#fed7aa';
          } else {
            ctx.fillStyle = Math.random() > 0.5 ? '#60a5fa' : '#93c5fd';
          }
        } else {
          ctx.fillStyle = '#090d16'; // unlit window reflection
        }

        ctx.fillRect(x, y, w, h);

        // Window frame
        ctx.strokeRect(x, y, w, h);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  // Historic Brick Facade with Framed Windows
  public static createBrickFacadeTexture(): THREE.CanvasTexture {
    const key = 'brick_facade';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Brick reddish-brown base
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(0, 0, 512, 512);

    // Brick mortar lines
    ctx.strokeStyle = '#d6d3d1';
    ctx.lineWidth = 2;
    const brickH = 16;
    const brickW = 36;
    for (let y = 0; y < 512; y += brickH) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();

      const offset = (y / brickH) % 2 === 0 ? 0 : brickW / 2;
      for (let x = offset; x < 512; x += brickW) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + brickH);
        ctx.stroke();
      }
    }

    // Windows with stone lintels and sills
    const cols = 4;
    const rows = 6;
    const winW = 60;
    const winH = 50;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = c * (512 / cols) + 34;
        const cy = r * (512 / rows) + 20;

        // Stone Lintel
        ctx.fillStyle = '#e7e5e4';
        ctx.fillRect(cx - 4, cy - 6, winW + 8, 6);

        // Window glass
        ctx.fillStyle = Math.random() > 0.35 ? '#fed7aa' : '#1c1917';
        ctx.fillRect(cx, cy, winW, winH);

        // Window pane dividers
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + winW / 2, cy);
        ctx.lineTo(cx + winW / 2, cy + winH);
        ctx.moveTo(cx, cy + winH / 2);
        ctx.lineTo(cx + winW, cy + winH / 2);
        ctx.stroke();

        // Stone sill
        ctx.fillStyle = '#d6d3d1';
        ctx.fillRect(cx - 6, cy + winH, winW + 12, 5);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  // Billboard Graphic Banner Texture
  public static createNeonBillboardTexture(text: string, sub: string, bgColor: string, accentColor: string): THREE.CanvasTexture {
    const key = `billboard_${text}_${sub}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 512, 256);

    // Glowing border frame
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 12;
    ctx.strokeRect(10, 10, 492, 236);

    // Inner subtle glow border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 472, 216);

    // Main Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 105);

    // Subtitle
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(sub.toUpperCase(), 256, 175);

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }
}
