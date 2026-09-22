import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CityBuilder } from '../world/CityBuilder';
import { SkyEnvironment } from '../world/SkyEnvironment';
import { VehicleManager } from '../vehicles/VehicleManager';
import { NPCManager } from '../npc/NPCManager';
import { PlayerController } from '../player/PlayerController';
import { gameState } from '../core/GameState';
import { missionSystem } from '../missions/MissionSystem';
import { soundEngine } from '../audio/SoundEngine';
import { VehicleModel } from '../types';

interface GameCanvasProps {
  onOpenMap: () => void;
  onOpenPause: () => void;
  onOpenShop: () => void;
  onOpenGarage: () => void;
  onOpenSafehouse: () => void;
  onToggleDebug: () => void;
  setFps: (fps: number) => void;
  setPlayerCoords: (coords: [number, number, number]) => void;
  setPlayerHeading: (h: number) => void;
  setVehicleCount: (c: number) => void;
  setNpcCount: (c: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  onOpenMap,
  onOpenPause,
  onOpenShop,
  onOpenGarage,
  onOpenSafehouse,
  onToggleDebug,
  setFps,
  setPlayerCoords,
  setPlayerHeading,
  setVehicleCount,
  setNpcCount
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // References to game systems
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerRef = useRef<PlayerController | null>(null);
  const vehicleMgrRef = useRef<VehicleManager | null>(null);
  const npcMgrRef = useRef<NPCManager | null>(null);
  const cityRef = useRef<CityBuilder | null>(null);
  const skyEnvRef = useRef<SkyEnvironment | null>(null);

  // Dynamic lights
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // 3D Mission Marker Beacon
  const missionMarkerRef = useRef<THREE.Group | null>(null);

  // Rain particles
  const rainGeoRef = useRef<THREE.BufferGeometry | null>(null);
  const rainMeshRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Renderer Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x38bdf8); // vibrant daylight sky blue base
    scene.fog = new THREE.FogExp2(0xfde68a, 0.0022); // soft warm atmospheric haze

    const camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.1, 1200);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. High-Visibility Sunlight & Environmental Fill Lighting
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.65);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x78350f, 0.95);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const sunLight = new THREE.DirectionalLight(0xfbbf24, 1.6);
    sunLight.position.set(180, 240, 120);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 500;
    const shadowSize = 140;
    sunLight.shadow.camera.left = -shadowSize;
    sunLight.shadow.camera.right = shadowSize;
    sunLight.shadow.camera.top = shadowSize;
    sunLight.shadow.camera.bottom = -shadowSize;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // 3. Stylized Sky Environment (Gradient Sky Dome, Sun Flare, Clouds, Stars)
    const skyEnv = new SkyEnvironment(scene);
    skyEnvRef.current = skyEnv;

    // 4. Build Detailed City Architecture & World
    const city = new CityBuilder();
    cityRef.current = city;
    city.buildCity(scene);

    // 5. Vehicle System
    const vehicleMgr = new VehicleManager(scene, city);
    vehicleMgrRef.current = vehicleMgr;

    // 6. NPC System
    const npcMgr = new NPCManager(scene, city);
    npcMgrRef.current = npcMgr;

    // 7. Player Controller
    const player = new PlayerController(camera, city, vehicleMgr, npcMgr);
    playerRef.current = player;
    scene.add(player.mesh);

    // 8. Mission Objective 3D Waypoint Beacon
    const markerGroup = new THREE.Group();
    // Glowing diamond
    const diamondGeo = new THREE.OctahedronGeometry(1.4, 0);
    const diamondMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: false });
    const diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);
    diamondMesh.position.y = 3.0;
    markerGroup.add(diamondMesh);

    // Vertical light beam
    const beamGeo = new THREE.CylinderGeometry(0.35, 0.35, 50, 8, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.y = 25;
    markerGroup.add(beamMesh);

    // Ground target ring
    const ringGeo = new THREE.RingGeometry(1.8, 2.4, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.12;
    markerGroup.add(ringMesh);

    scene.add(markerGroup);
    missionMarkerRef.current = markerGroup;

    // 9. Rain Particle System
    const rainCount = 2000;
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 90;
      rainPositions[i * 3 + 1] = Math.random() * 40;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 90;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    rainGeoRef.current = rainGeo;

    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.22,
      transparent: true,
      opacity: 0.7
    });
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    rainPoints.visible = false;
    scene.add(rainPoints);
    rainMeshRef.current = rainPoints;

    // 10. Input Handling & Pointer Lock Camera
    let isMouseDown = false;
    let rightMouseDown = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      soundEngine.ensureAudio();

      if (e.code === 'KeyM') {
        onOpenMap();
        return;
      }
      if (e.code === 'Escape') {
        onOpenPause();
        return;
      }
      if (e.code === 'F3') {
        onToggleDebug();
        return;
      }
      if (e.code === 'KeyR') {
        soundEngine.toggleRadio();
        gameState.notify();
        return;
      }
      if (e.code === 'KeyE') {
        player.interact();
      }
      if (e.code === 'KeyQ') {
        player.toggleTargetLock();
      }

      // Weapons 1, 2, 3, 4, 5, 6
      if (e.code === 'Digit1') player.switchWeapon('fists');
      if (e.code === 'Digit2') player.switchWeapon('pistol');
      if (e.code === 'Digit3') player.switchWeapon('shotgun');
      if (e.code === 'Digit4') player.switchWeapon('rifle');
      if (e.code === 'Digit5') player.switchWeapon('dual_pistols');
      if (e.code === 'Digit6') player.switchWeapon('spray_can');

      player.keys[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      player.keys[e.code] = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      soundEngine.ensureAudio();

      if (e.button === 0) { // Left click: Attack / Shoot
        isMouseDown = true;
        player.attack();
      } else if (e.button === 1) { // Middle click: Toggle Lock-On Target
        e.preventDefault();
        player.toggleTargetLock();
      } else if (e.button === 2) { // Right click: Aim
        rightMouseDown = true;
        player.isAiming = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) isMouseDown = false;
      if (e.button === 2) {
        rightMouseDown = false;
        player.isAiming = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Responsive orbital mouse look with custom sensitivity
      const sens = (gameState.settings.mouseSensitivity || 1.0) * 0.0035;
      const invert = gameState.settings.invertY ? -1 : 1;
      player.camYaw -= e.movementX * sens;
      player.camPitch = THREE.MathUtils.clamp(
        player.camPitch + e.movementY * sens * invert,
        -0.35,
        0.85
      );
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('contextmenu', handleContextMenu);

    // Wardrobe update event listener
    const handleWardrobe = () => {
      player.updateWardrobe();
      player.updateBodyMorph();
    };
    window.addEventListener('update-wardrobe', handleWardrobe);

    // Emergency Ambulance dispatch listener
    const handleAmbulanceDispatch = (e: any) => {
      if (e.detail && vehicleMgr) {
        vehicleMgr.dispatchAmbulance(e.detail);
      }
    };
    window.addEventListener('emergency-ambulance', handleAmbulanceDispatch);

    // Modal triggers from landmarks
    const handleOpenModal = (e: any) => {
      const type = e.detail;
      if (type === 'safehouse') onOpenSafehouse();
      else if (type === 'garage') onOpenGarage();
      else if (type === 'shop') onOpenShop();
    };
    window.addEventListener('open-modal', handleOpenModal);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 11. Main Game Animation Loop
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();
    let animId: number;

    const gameLoop = (now: number) => {
      animId = requestAnimationFrame(gameLoop);

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // FPS calculation
      frameCount++;
      if (now - lastFpsUpdate >= 500) {
        const currentFps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
        setFps(currentFps);
        frameCount = 0;
        lastFpsUpdate = now;
      }

      // Update Player
      player.update(dt);
      setPlayerCoords([player.mesh.position.x, player.mesh.position.y, player.mesh.position.z]);
      setPlayerHeading(player.heading);

      // Update Vehicles
      vehicleMgr.update(dt, player.mesh.position, gameState.heat);
      setVehicleCount(vehicleMgr.vehicles.length);

      // Update NPCs
      npcMgr.update(dt, player.mesh.position, player.gunfireEvent);
      setNpcCount(npcMgr.npcs.length);

      // Advance Time of Day gradually (1 in-game hour every ~90 real seconds)
      gameState.advanceTime(dt * 0.012);
      const timeHour = gameState.timeHour;

      // Update Sky Dome, Clouds, Sun/Moon trajectory, and atmospheric lighting
      skyEnv.update(dt, player.mesh.position);
      skyEnv.updateTime(timeHour, sunLight, hemiLight, scene);

      // Update Streetlights & Neons for current time
      city.updateLightsForTime(timeHour);

      // Update 3D Mission Waypoint Marker
      const activeObj = missionSystem.getActiveObjective();
      if (activeObj && activeObj.targetPos && markerGroup) {
        markerGroup.visible = true;
        markerGroup.position.set(activeObj.targetPos[0], activeObj.targetPos[1], activeObj.targetPos[2]);
        diamondMesh.rotation.y += dt * 2.5;
      } else if (markerGroup) {
        markerGroup.visible = false;
      }

      // Rain animation
      if (rainPoints && rainGeo) {
        if (gameState.weather === 'rain') {
          rainPoints.visible = true;
          rainPoints.position.set(player.mesh.position.x, 0, player.mesh.position.z);
          const posArr = rainGeo.attributes.position.array as Float32Array;
          for (let i = 1; i < posArr.length; i += 3) {
            posArr[i] -= dt * 38;
            if (posArr[i] < 0) posArr[i] = 40;
          }
          rainGeo.attributes.position.needsUpdate = true;
        } else {
          rainPoints.visible = false;
        }
      }

      // Heat / Police evasion logic
      if (gameState.heat > 0) {
        let hasLos = false;
        for (const v of vehicleMgr.vehicles) {
          if (v.isPolice && v.mesh.position.distanceTo(player.mesh.position) < 50) {
            hasLos = true;
            break;
          }
        }
        gameState.updateEvadeTick(dt, hasLos);
      }

      // Render Three.js Scene
      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('update-wardrobe', handleWardrobe);
      window.removeEventListener('emergency-ambulance', handleAmbulanceDispatch);
      window.removeEventListener('open-modal', handleOpenModal);
      window.removeEventListener('resize', handleResize);

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Teleport helper for Map & Debug
  useEffect(() => {
    (window as any).__teleportPlayer = (x: number, z: number) => {
      if (playerRef.current) {
        playerRef.current.mesh.position.set(x, 1, z);
        playerRef.current.position.set(x, 1, z);
        if (playerRef.current.currentVehicle) {
          playerRef.current.currentVehicle.mesh.position.set(x, 0, z);
          playerRef.current.currentVehicle.speed = 0;
        }
        soundEngine.playUI('open');
        gameState.showToast('TELEPORTED', `Arrived at [${Math.round(x)}, ${Math.round(z)}]`, 'info');
      }
    };

    (window as any).__spawnPlayerVehicle = (model: VehicleModel, color?: string) => {
      if (vehicleMgrRef.current && playerRef.current) {
        const px = playerRef.current.mesh.position.x + 3;
        const pz = playerRef.current.mesh.position.z + 3;
        const veh = vehicleMgrRef.current.spawnVehicle(model, [px, 0, pz], playerRef.current.heading);
        if (color) veh.setBodyColor(color);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-crosshair overflow-hidden outline-none"
      onClick={() => {
        soundEngine.ensureAudio();
      }}
    />
  );
};
