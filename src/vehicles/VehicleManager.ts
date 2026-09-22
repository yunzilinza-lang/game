import * as THREE from 'three';
import { VehicleModel, VehicleStats } from '../types';
import { soundEngine } from '../audio/SoundEngine';
import { CityBuilder } from '../world/CityBuilder';
import { gameState } from '../core/GameState';

export const VEHICLE_CONFIGS: Record<VehicleModel, VehicleStats> = {
  compact: {
    model: 'compact',
    name: 'Vanta Metro Compact',
    maxSpeed: 88,
    acceleration: 30,
    handling: 1.9,
    weight: 1050,
    maxHealth: 130,
    color: '#2563eb',
    price: 600,
    unlocked: true,
  },
  sedan: {
    model: 'sedan',
    name: 'Crestline Executive Sedan',
    maxSpeed: 120,
    acceleration: 34,
    handling: 1.6,
    weight: 1450,
    maxHealth: 160,
    color: '#e2e8f0',
    price: 1200,
    unlocked: true,
  },
  sports: {
    model: 'sports',
    name: 'Apex GT Turbo',
    maxSpeed: 175,
    acceleration: 52,
    handling: 2.2,
    weight: 1250,
    maxHealth: 120,
    color: '#dc2626',
    price: 3500,
    unlocked: false,
  },
  pickup: {
    model: 'pickup',
    name: 'Titan Heavy 4x4',
    maxSpeed: 100,
    acceleration: 26,
    handling: 1.3,
    weight: 2200,
    maxHealth: 240,
    color: '#374151',
    price: 1800,
    unlocked: false,
  },
  motorcycle: {
    model: 'motorcycle',
    name: 'Kaze 750 Sportbike',
    maxSpeed: 155,
    acceleration: 56,
    handling: 2.7,
    weight: 220,
    maxHealth: 80,
    color: '#16a34a',
    price: 2400,
    unlocked: false,
  },
  police: {
    model: 'police',
    name: 'Vanta Police Interceptor',
    maxSpeed: 135,
    acceleration: 40,
    handling: 1.8,
    weight: 1600,
    maxHealth: 190,
    color: '#09090b',
    price: 0,
    unlocked: false,
  },
  ambulance: {
    model: 'ambulance',
    name: 'Vanta General EMS Ambulance',
    maxSpeed: 110,
    acceleration: 32,
    handling: 1.4,
    weight: 2600,
    maxHealth: 280,
    color: '#ffffff',
    price: 0,
    unlocked: false,
  },
  bicycle: {
    model: 'bicycle',
    name: 'Vanta Street BMX',
    maxSpeed: 38,
    acceleration: 20,
    handling: 3.2,
    weight: 15,
    maxHealth: 40,
    color: '#f59e0b',
    price: 150,
    unlocked: true,
  },
  van: {
    model: 'van',
    name: 'Courier Cargo Van',
    maxSpeed: 95,
    acceleration: 24,
    handling: 1.3,
    weight: 2100,
    maxHealth: 210,
    color: '#475569',
    price: 1100,
    unlocked: false,
  }
};

export class VehicleInstance {
  public id: string;
  public model: VehicleModel;
  public stats: VehicleStats;
  public mesh: THREE.Group;
  public frontWheels: THREE.Group[] = [];
  public rearWheels: THREE.Group[] = [];
  public sirenLights?: { red: THREE.Mesh; blue: THREE.Mesh; pointLight: THREE.PointLight };
  public nitroFlames: THREE.Mesh[] = [];

  public health: number;
  public speed: number = 0;
  public steerAngle: number = 0;
  public heading: number = 0;
  public isOccupied: boolean = false;
  public isPolice: boolean = false;
  public isAmbulance: boolean = false;
  public isAmbientTraffic: boolean = false;
  
  // Emergency EMS mission tracking
  public emsTargetPos: THREE.Vector3 | null = null;
  public emsState: 'driving_to' | 'treating' | 'departing' | 'idle' = 'idle';
  public emsTimer: number = 0;

  private bodyMesh: THREE.Mesh | null = null;

  constructor(id: string, model: VehicleModel, pos: [number, number, number], heading: number = 0) {
    this.id = id;
    this.model = model;
    this.stats = VEHICLE_CONFIGS[model] || VEHICLE_CONFIGS.sedan;
    this.health = this.stats.maxHealth;
    this.heading = heading;
    this.isPolice = model === 'police';
    this.isAmbulance = model === 'ambulance';

    this.mesh = new THREE.Group();
    this.mesh.position.set(pos[0], pos[1], pos[2]);
    this.mesh.rotation.y = heading;

    this.buildDetailedVehicleMesh();
  }

  private buildDetailedVehicleMesh() {
    const isMoto = this.model === 'motorcycle' || this.model === 'bicycle';
    const isTruck = this.model === 'pickup';
    const isSports = this.model === 'sports';
    const isAmbulance = this.model === 'ambulance';
    const isVan = this.model === 'van';

    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: isAmbulance ? 0xf8fafc : (this.isPolice ? 0x09090b : new THREE.Color(this.stats.color)),
      metalness: 0.65,
      roughness: 0.35,
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85
    });

    const trimMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    if (isMoto) {
      const frameGeo = new THREE.BoxGeometry(0.35, 0.55, 1.6);
      this.bodyMesh = new THREE.Mesh(frameGeo, bodyMat);
      this.bodyMesh.position.y = 0.55;
      this.mesh.add(this.bodyMesh);

      const createBikeWheel = (z: number, isFront: boolean) => {
        const wGroup = new THREE.Group();
        const tireGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.14, 12);
        const tire = new THREE.Mesh(tireGeo, new THREE.MeshStandardMaterial({ color: 0x18181b }));
        tire.rotation.z = Math.PI / 2;
        wGroup.add(tire);
        wGroup.position.set(0, 0.32, z);
        this.mesh.add(wGroup);
        if (isFront) this.frontWheels.push(wGroup);
        else this.rearWheels.push(wGroup);
      };
      createBikeWheel(0.7, true);
      createBikeWheel(-0.7, false);
      return;
    }

    // Car Dimensions
    let carLength = 4.4;
    let carWidth = 2.0;
    let carHeight = 1.35;
    let cabinLength = 2.2;
    let cabinHeight = 0.65;

    if (isSports) {
      carLength = 4.6;
      carWidth = 2.1;
      carHeight = 1.15;
      cabinLength = 1.9;
      cabinHeight = 0.5;
    } else if (isTruck || isAmbulance || isVan) {
      carLength = 5.2;
      carWidth = 2.2;
      carHeight = 1.8;
      cabinLength = isAmbulance || isVan ? 3.4 : 2.2;
      cabinHeight = 0.9;
    } else if (this.model === 'compact') {
      carLength = 3.6;
      carWidth = 1.9;
      carHeight = 1.4;
      cabinLength = 2.0;
      cabinHeight = 0.65;
    }

    // 1. Lower Chassis
    const bodyGeo = new THREE.BoxGeometry(carWidth, carHeight * 0.5, carLength);
    this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    this.bodyMesh.position.y = carHeight * 0.4;
    this.bodyMesh.castShadow = true;
    this.mesh.add(this.bodyMesh);

    // 2. Upper Cabin
    const cabinGeo = new THREE.BoxGeometry(carWidth * 0.88, cabinHeight, cabinLength);
    const cabin = new THREE.Mesh(cabinGeo, (isAmbulance || isVan) ? bodyMat : glassMat);
    cabin.position.set(0, carHeight * 0.4 + (carHeight * 0.25) + (cabinHeight / 2), isTruck ? 0.3 : (isAmbulance || isVan ? 0.2 : -0.2));
    cabin.castShadow = true;
    this.mesh.add(cabin);

    // 3. Bumpers & Grille
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(carWidth * 0.95, 0.35, 0.3), trimMat);
    frontBumper.position.set(0, 0.35, carLength / 2 + 0.1);
    this.mesh.add(frontBumper);

    const grille = new THREE.Mesh(new THREE.BoxGeometry(carWidth * 0.6, 0.25, 0.1), chromeMat);
    grille.position.set(0, 0.45, carLength / 2 + 0.26);
    this.mesh.add(grille);

    // 4. Headlights & Taillights
    const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.15), headlightMat);
    hlL.position.set(-carWidth * 0.36, 0.48, carLength / 2 + 0.05);
    this.mesh.add(hlL);

    const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.15), headlightMat);
    hlR.position.set(carWidth * 0.36, 0.48, carLength / 2 + 0.05);
    this.mesh.add(hlR);

    const tlL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.15), tailMat);
    tlL.position.set(-carWidth * 0.36, 0.48, -carLength / 2 - 0.05);
    this.mesh.add(tlL);

    const tlR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.15), tailMat);
    tlR.position.set(carWidth * 0.36, 0.48, -carLength / 2 - 0.05);
    this.mesh.add(tlR);

    // 5. Nitro Exhaust Boost Flames
    const flameGeo = new THREE.ConeGeometry(0.12, 0.6, 8);
    flameGeo.rotateX(Math.PI / 2);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9 });
    
    const flameL = new THREE.Mesh(flameGeo, flameMat);
    flameL.position.set(-carWidth * 0.25, 0.3, -carLength / 2 - 0.35);
    flameL.visible = false;
    this.mesh.add(flameL);
    this.nitroFlames.push(flameL);

    const flameR = new THREE.Mesh(flameGeo, flameMat);
    flameR.position.set(carWidth * 0.25, 0.3, -carLength / 2 - 0.35);
    flameR.visible = false;
    this.mesh.add(flameR);
    this.nitroFlames.push(flameR);

    // 6. Police & Ambulance Strobing Emergency Lightbar
    if (this.isPolice || this.isAmbulance) {
      const barBase = new THREE.Mesh(new THREE.BoxGeometry(carWidth * 0.6, 0.15, 0.25), trimMat);
      barBase.position.set(0, cabin.position.y + cabinHeight / 2 + 0.12, 0);
      this.mesh.add(barBase);

      const redSiren = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.2), new THREE.MeshBasicMaterial({ color: isAmbulance ? 0xf59e0b : 0xff0000 }));
      redSiren.position.set(-0.35, barBase.position.y + 0.06, 0);
      this.mesh.add(redSiren);

      const blueSiren = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.2), new THREE.MeshBasicMaterial({ color: isAmbulance ? 0xffffff : 0x0066ff }));
      blueSiren.position.set(0.35, barBase.position.y + 0.06, 0);
      this.mesh.add(blueSiren);

      const sirenPoint = new THREE.PointLight(isAmbulance ? 0xf59e0b : 0xff0000, 0, 20);
      sirenPoint.position.set(0, barBase.position.y + 0.5, 0);
      this.mesh.add(sirenPoint);

      this.sirenLights = { red: redSiren, blue: blueSiren, pointLight: sirenPoint };
    }

    // 7. Wheels
    const wheelRadius = isTruck || isAmbulance ? 0.45 : 0.38;
    const wheelWidth = 0.28;
    const wheelOffsetZ = carLength * 0.32;
    const wheelOffsetX = carWidth * 0.48;

    const createWheel = (x: number, z: number, isFront: boolean) => {
      const wGroup = new THREE.Group();
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 14), new THREE.MeshStandardMaterial({ color: 0x18181b }));
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius * 0.6, wheelRadius * 0.6, wheelWidth + 0.02, 10), chromeMat);
      rim.rotation.z = Math.PI / 2;
      wGroup.add(rim);

      wGroup.position.set(x, wheelRadius, z);
      this.mesh.add(wGroup);

      if (isFront) this.frontWheels.push(wGroup);
      else this.rearWheels.push(wGroup);
    };

    createWheel(-wheelOffsetX, wheelOffsetZ, true);
    createWheel(wheelOffsetX, wheelOffsetZ, true);
    createWheel(-wheelOffsetX, -wheelOffsetZ, false);
    createWheel(wheelOffsetX, -wheelOffsetZ, false);
  }

  public setBodyColor(hexColor: string) {
    if (this.bodyMesh && this.bodyMesh.material instanceof THREE.MeshStandardMaterial) {
      this.bodyMesh.material.color.set(hexColor);
    }
  }

  public update(dt: number, city: CityBuilder, allVehicles: VehicleInstance[]) {
    // 1. Motion
    const forwardX = Math.sin(this.heading);
    const forwardZ = Math.cos(this.heading);

    this.mesh.position.x += forwardX * this.speed * dt;
    this.mesh.position.z += forwardZ * this.speed * dt;

    // 2. Steering & Yaw Rotation
    if (Math.abs(this.speed) > 0.05) {
      const turnFactor = (this.speed > 0 ? 1 : -1) * Math.min(1.5, Math.abs(this.speed) / 12);
      this.heading += this.steerAngle * turnFactor * dt * this.stats.handling;
      this.mesh.rotation.y = this.heading;
    }

    // 3. Wheel animations
    const wheelRadius = this.model === 'pickup' || this.model === 'ambulance' ? 0.45 : 0.38;
    const rollAngle = (this.speed * dt) / wheelRadius;
    [...this.frontWheels, ...this.rearWheels].forEach(w => {
      w.rotation.x += rollAngle;
    });
    this.frontWheels.forEach(w => {
      w.rotation.y = this.steerAngle;
    });

    // 4. Nitro Flames visibility
    const isNitro = this.isOccupied && gameState.isNitroActive;
    this.nitroFlames.forEach(f => {
      f.visible = isNitro;
      if (isNitro) {
        f.scale.set(1 + Math.random() * 0.4, 1 + Math.random() * 0.8, 1 + Math.random() * 0.4);
      }
    });

    // 5. Siren Strobes
    if (this.sirenLights) {
      const flash = Math.sin(Date.now() * 0.015) > 0;
      (this.sirenLights.red.material as THREE.MeshBasicMaterial).color.setHex(flash ? (this.isAmbulance ? 0xf59e0b : 0xff0000) : 0x220000);
      (this.sirenLights.blue.material as THREE.MeshBasicMaterial).color.setHex(!flash ? 0xffffff : 0x001133);
      this.sirenLights.pointLight.intensity = flash ? 2.5 : 0;
    }

    // 6. World Building Collisions
    const col = city.checkCollision(this.mesh.position.x, this.mesh.position.z, 2.0);
    if (col.hit) {
      this.mesh.position.x += col.pushX * 1.2;
      this.mesh.position.z += col.pushZ * 1.2;
      if (Math.abs(this.speed) > 4) {
        soundEngine.playCarCrash();
        this.health = Math.max(0, this.health - Math.abs(this.speed) * 0.7);
      }
      this.speed *= -0.3;
    }

    // 7. Vehicle-vs-Vehicle Collisions
    for (const other of allVehicles) {
      if (other === this) continue;
      const d = this.mesh.position.distanceTo(other.mesh.position);
      if (d < 3.8) {
        const pushDir = new THREE.Vector3().subVectors(this.mesh.position, other.mesh.position).normalize();
        this.mesh.position.addScaledVector(pushDir, 0.4);
        this.speed *= 0.5;
        other.speed *= 0.5;
        if (Math.abs(this.speed) > 5) {
          soundEngine.playCarCrash();
        }
      }
    }
  }
}

export class VehicleManager {
  public vehicles: VehicleInstance[] = [];
  public activeVehicle: VehicleInstance | null = null;
  private scene: THREE.Scene;
  private city: CityBuilder;

  constructor(scene: THREE.Scene, city: CityBuilder) {
    this.scene = scene;
    this.city = city;
    this.initWorldVehicles();
  }

  private initWorldVehicles() {
    this.spawnVehicle('compact', [-145, 0, 75], 0);
    this.spawnVehicle('sedan', [-160, 0, 56], Math.PI / 2);
    this.spawnVehicle('sports', [65, 0, 80], Math.PI);
    this.spawnVehicle('pickup', [250, 0, 70], Math.PI / 2);
    this.spawnVehicle('motorcycle', [-195, 0, 56], 0);
    this.spawnVehicle('bicycle', [-130, 0, 90], 0);

    const trafficSpawns: Array<{ model: VehicleModel; pos: [number, number, number]; heading: number }> = [
      { model: 'sedan', pos: [50, 0, -70], heading: Math.PI / 2 },
      { model: 'compact', pos: [120, 0, 70], heading: 0 },
      { model: 'sedan', pos: [180, 0, 150], heading: Math.PI },
      { model: 'pickup', pos: [270, 0, 180], heading: -Math.PI / 2 },
      { model: 'van', pos: [-70, 0, 240], heading: Math.PI },
    ];

    trafficSpawns.forEach(ts => {
      const v = this.spawnVehicle(ts.model, ts.pos, ts.heading);
      v.isAmbientTraffic = true;
      v.speed = 10 + Math.random() * 8;
    });
  }

  public spawnVehicle(model: VehicleModel, pos: [number, number, number], heading: number = 0): VehicleInstance {
    const id = `veh_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const vehicle = new VehicleInstance(id, model, pos, heading);
    this.vehicles.push(vehicle);
    this.scene.add(vehicle.mesh);
    return vehicle;
  }

  public dispatchAmbulance(incidentPos: THREE.Vector3) {
    // Spawn ambulance 60m away on nearby avenue
    const spawnX = incidentPos.x + (Math.random() > 0.5 ? 60 : -60);
    const spawnZ = incidentPos.z + (Math.random() > 0.5 ? 60 : -60);

    const amb = this.spawnVehicle('ambulance', [spawnX, 0, spawnZ], Math.atan2(incidentPos.x - spawnX, incidentPos.z - spawnZ));
    amb.emsTargetPos = incidentPos.clone();
    amb.emsState = 'driving_to';
    amb.speed = 16;
    soundEngine.playPoliceSiren();
    gameState.showToast('EMERGENCY DISPATCH', 'Ambulance responding to medical emergency', 'info');
  }

  public findNearestVehicle(pos: THREE.Vector3, maxDist: number = 5.0): VehicleInstance | null {
    let nearest: VehicleInstance | null = null;
    let minDist = maxDist;

    for (const v of this.vehicles) {
      if (v.isOccupied) continue;
      const d = v.mesh.position.distanceTo(pos);
      if (d < minDist) {
        minDist = d;
        nearest = v;
      }
    }
    return nearest;
  }

  public update(dt: number, playerPos: THREE.Vector3, heat: number) {
    // Police cruiser spawning
    if (heat > 0) {
      const policeCount = this.vehicles.filter(v => v.isPolice).length;
      const targetPolice = Math.min(heat, 3);

      if (policeCount < targetPolice) {
        const spawnX = playerPos.x + (Math.random() > 0.5 ? 65 : -65);
        const spawnZ = playerPos.z + (Math.random() > 0.5 ? 65 : -65);
        this.spawnVehicle('police', [spawnX, 0, spawnZ], Math.atan2(playerPos.x - spawnX, playerPos.z - spawnZ));
      }
    }

    // Update all vehicles
    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      const v = this.vehicles[i];

      // Ambulance AI response
      if (v.isAmbulance && v.emsTargetPos && !v.isOccupied) {
        if (v.emsState === 'driving_to') {
          const toTarget = new THREE.Vector3().subVectors(v.emsTargetPos, v.mesh.position);
          const dist = toTarget.length();
          if (dist > 8) {
            const targetHeading = Math.atan2(toTarget.x, toTarget.z);
            let diff = targetHeading - v.heading;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            v.steerAngle = Math.max(-0.4, Math.min(0.4, diff * 1.5));
            v.speed = Math.min(18, v.speed + 12 * dt);
          } else {
            v.speed = 0;
            v.emsState = 'treating';
            v.emsTimer = 4.0; // 4s treatment
          }
        } else if (v.emsState === 'treating') {
          v.emsTimer -= dt;
          if (v.emsTimer <= 0) {
            v.emsState = 'departing';
            gameState.showToast('PARAMEDIC TREATMENT COMPLETE', 'Patient stabilized', 'success');
          }
        } else if (v.emsState === 'departing') {
          v.speed = 14;
        }
      }

      // Police AI pursuit
      if (v.isPolice && !v.isOccupied) {
        const toPlayer = new THREE.Vector3().subVectors(playerPos, v.mesh.position);
        const dist = toPlayer.length();

        if (dist > 8 && dist < 160) {
          const targetHeading = Math.atan2(toPlayer.x, toPlayer.z);
          let diff = targetHeading - v.heading;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          v.steerAngle = Math.max(-0.4, Math.min(0.4, diff * 1.5));
          v.speed = Math.min(22, v.speed + 16 * dt);
        } else if (dist <= 8) {
          v.speed *= Math.pow(0.85, dt * 60);
        }
      }

      v.update(dt, this.city, this.vehicles);
    }
  }
}
