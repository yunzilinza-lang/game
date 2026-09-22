import * as THREE from 'three';

export class SkyEnvironment {
  public skyMesh: THREE.Mesh;
  public sunMesh: THREE.Mesh;
  public moonMesh: THREE.Mesh;
  public cloudGroup: THREE.Group;
  public starsMesh: THREE.Points;
  private skyCanvas: HTMLCanvasElement;
  private skyCtx: CanvasRenderingContext2D;
  private skyTexture: THREE.CanvasTexture;

  constructor(scene: THREE.Scene) {
    // 1. Sky Dome Canvas Texture
    this.skyCanvas = document.createElement('canvas');
    this.skyCanvas.width = 512;
    this.skyCanvas.height = 512;
    this.skyCtx = this.skyCanvas.getContext('2d')!;
    this.skyTexture = new THREE.CanvasTexture(this.skyCanvas);

    const skyGeo = new THREE.SphereGeometry(600, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      map: this.skyTexture,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(this.skyMesh);

    // 2. Sun Glow Sphere
    const sunGeo = new THREE.SphereGeometry(14, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(this.sunMesh);

    // 3. Moon Sphere
    const moonGeo = new THREE.SphereGeometry(10, 16, 16);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonMesh.visible = false;
    scene.add(this.moonMesh);

    // 4. Stylized Clouds
    this.cloudGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffedd5,
      roughness: 0.9,
      metalness: 0.1,
      transparent: true,
      opacity: 0.82
    });

    for (let c = 0; c < 22; c++) {
      const cloudCluster = new THREE.Group();
      const puffCount = 4 + Math.floor(Math.random() * 4);
      for (let p = 0; p < puffCount; p++) {
        const pRadius = 14 + Math.random() * 18;
        const pGeo = new THREE.SphereGeometry(pRadius, 8, 8);
        const pMesh = new THREE.Mesh(pGeo, cloudMat);
        pMesh.position.set((p - puffCount / 2) * 16, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 12);
        pMesh.scale.set(1.2, 0.6, 0.9);
        cloudCluster.add(pMesh);
      }
      const angle = (c / 22) * Math.PI * 2;
      const radius = 220 + Math.random() * 160;
      cloudCluster.position.set(Math.cos(angle) * radius, 110 + Math.random() * 40, Math.sin(angle) * radius);
      this.cloudGroup.add(cloudCluster);
    }
    scene.add(this.cloudGroup);

    // 5. Stars for Night Sky
    const starCount = 1200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 580;
      const sinPhi = Math.sin(phi);
      starPositions[i * 3] = r * sinPhi * Math.cos(theta);
      starPositions[i * 3 + 1] = Math.abs(r * Math.cos(phi)); // upper hemisphere
      starPositions[i * 3 + 2] = r * sinPhi * Math.sin(theta);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.8,
      transparent: true,
      opacity: 0
    });
    this.starsMesh = new THREE.Points(starGeo, starMat);
    scene.add(this.starsMesh);

    // Initial render
    this.updateTime(17.5);
  }

  public updateTime(timeHour: number, sunLight?: THREE.DirectionalLight, hemiLight?: THREE.HemisphereLight, scene?: THREE.Scene) {
    const isNight = timeHour < 5.5 || timeHour > 19.5;
    const isSunset = timeHour >= 16.5 && timeHour <= 19.5;
    const isSunrise = timeHour >= 5.5 && timeHour <= 7.5;

    // Redraw sky gradient canvas
    const gradient = this.skyCtx.createLinearGradient(0, 0, 0, 512);

    if (isSunset) {
      // Golden hour to glowing sunset
      gradient.addColorStop(0, '#1e3a8a');   // deep rich blue zenith
      gradient.addColorStop(0.35, '#3b82f6'); // vibrant blue
      gradient.addColorStop(0.65, '#f97316'); // rich golden orange
      gradient.addColorStop(0.88, '#fbbf24'); // bright gold horizon
      gradient.addColorStop(1.0, '#fed7aa');  // soft warm horizon haze
    } else if (isSunrise) {
      // Dawn / Sunrise
      gradient.addColorStop(0, '#1e293b');
      gradient.addColorStop(0.4, '#475569');
      gradient.addColorStop(0.7, '#ec4899');
      gradient.addColorStop(0.9, '#f59e0b');
      gradient.addColorStop(1.0, '#fef08a');
    } else if (isNight) {
      // Deep starry night with city underglow
      gradient.addColorStop(0, '#030712');   // zenith deep space
      gradient.addColorStop(0.5, '#0f172a');  // midnight blue
      gradient.addColorStop(0.85, '#1e1b4b'); // city neon atmospheric haze
      gradient.addColorStop(1.0, '#312e81');
    } else {
      // Clear daytime
      gradient.addColorStop(0, '#0284c7');
      gradient.addColorStop(0.5, '#38bdf8');
      gradient.addColorStop(0.85, '#bae6fd');
      gradient.addColorStop(1.0, '#e0f2fe');
    }

    this.skyCtx.fillStyle = gradient;
    this.skyCtx.fillRect(0, 0, 512, 512);
    this.skyTexture.needsUpdate = true;

    // Sun / Moon trajectory
    const sunAngle = ((timeHour - 6) / 24) * Math.PI * 2;
    const sunDist = 480;
    const sunX = Math.cos(sunAngle) * sunDist;
    const sunY = Math.sin(sunAngle) * sunDist;
    const sunZ = Math.sin(sunAngle * 0.5) * 180;

    this.sunMesh.position.set(sunX, Math.max(10, sunY), sunZ);
    this.moonMesh.position.set(-sunX, Math.max(10, -sunY), -sunZ);

    this.sunMesh.visible = sunY > -20;
    this.moonMesh.visible = sunY <= 10;

    // Adjust stars visibility
    if (this.starsMesh.material instanceof THREE.PointsMaterial) {
      this.starsMesh.material.opacity = isNight ? 0.9 : 0.0;
    }

    // Adjust lights and fog
    if (sunLight && hemiLight && scene) {
      if (isSunset) {
        sunLight.color.setHex(0xfbbf24);
        sunLight.intensity = 1.6;
        sunLight.position.set(sunX * 0.5, Math.max(80, sunY * 0.5), sunZ * 0.5);

        hemiLight.color.setHex(0x93c5fd); // bright sky fill
        hemiLight.groundColor.setHex(0x78350f); // warm earth bounce
        hemiLight.intensity = 0.95;

        if (scene.fog) {
          scene.fog.color.setHex(0xfde68a);
        }
      } else if (isNight) {
        sunLight.color.setHex(0x38bdf8);
        sunLight.intensity = 0.35;
        sunLight.position.set(-sunX * 0.5, Math.max(60, -sunY * 0.5), -sunZ * 0.5);

        hemiLight.color.setHex(0x38bdf8);
        hemiLight.groundColor.setHex(0x0f172a);
        hemiLight.intensity = 0.5;

        if (scene.fog) {
          scene.fog.color.setHex(0x0f172a);
        }
      } else {
        sunLight.color.setHex(0xffffff);
        sunLight.intensity = 1.7;
        sunLight.position.set(sunX * 0.5, Math.max(100, sunY * 0.5), sunZ * 0.5);

        hemiLight.color.setHex(0xe0f2fe);
        hemiLight.groundColor.setHex(0x64748b);
        hemiLight.intensity = 1.0;

        if (scene.fog) {
          scene.fog.color.setHex(0xbae6fd);
        }
      }
    }
  }

  public update(dt: number, playerPos: THREE.Vector3) {
    this.skyMesh.position.copy(playerPos);
    this.starsMesh.position.copy(playerPos);
    this.cloudGroup.rotation.y += dt * 0.008;
    this.cloudGroup.position.x = playerPos.x;
    this.cloudGroup.position.z = playerPos.z;
  }
}
