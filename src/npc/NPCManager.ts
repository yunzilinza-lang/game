import * as THREE from 'three';
import { soundEngine } from '../audio/SoundEngine';
import { CityBuilder } from '../world/CityBuilder';
import { gameState } from '../core/GameState';

export type NPCState = 'IDLE' | 'WALK' | 'FLEE' | 'ATTACK' | 'DEAD';
export type NPCType = 'civilian' | 'hostile' | 'story' | 'trainer' | 'merchant' | 'paramedic';

export class NPCInstance {
  public id: string;
  public type: NPCType;
  public name: string;
  public mesh: THREE.Group;
  public state: NPCState = 'WALK';
  public health: number = 65;
  public maxHealth: number = 65;
  public speed: number = 1.8;
  public heading: number = 0;
  public attackCooldown: number = 0;

  private leftLeg: THREE.Mesh;
  private rightLeg: THREE.Mesh;
  private leftArm: THREE.Mesh;
  private rightArm: THREE.Mesh;
  private animTimer: number = 0;

  constructor(id: string, type: NPCType, name: string, pos: [number, number, number], outfitColor: number = 0x3b82f6) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.mesh = new THREE.Group();
    this.mesh.position.set(pos[0], pos[1], pos[2]);

    if (type === 'hostile') {
      this.health = 90;
      this.maxHealth = 90;
      this.state = 'ATTACK';
    } else if (type === 'story' || type === 'trainer' || type === 'merchant') {
      this.state = 'IDLE';
    }

    // Stylized 3D Humanoid Model
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.65 });
    const torsoMat = new THREE.MeshStandardMaterial({
      color: type === 'hostile' ? 0x991b1b : (type === 'story' ? 0x0284c7 : (type === 'paramedic' ? 0xf8fafc : outfitColor)),
      roughness: 0.55
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: type === 'hostile' ? 0x1f2937 : (type === 'paramedic' ? 0x0284c7 : 0x334155),
      roughness: 0.8
    });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1c1917 });

    // Head
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.38, 8), skinMat);
    head.position.y = 1.74;
    this.mesh.add(head);

    // Hair / Cap
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), hairMat);
    cap.position.set(0, 1.88, 0.02);
    this.mesh.add(cap);

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.68, 0.32), torsoMat);
    torso.position.y = 1.18;
    torso.castShadow = true;
    this.mesh.add(torso);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.68, 8);
    this.leftLeg = new THREE.Mesh(legGeo, pantsMat);
    this.leftLeg.position.set(-0.15, 0.44, 0);
    this.leftLeg.castShadow = true;
    this.mesh.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, pantsMat);
    this.rightLeg.position.set(0.15, 0.44, 0);
    this.rightLeg.castShadow = true;
    this.mesh.add(this.rightLeg);

    // Shoes
    const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.3), shoeMat);
    lShoe.position.set(-0.15, 0.07, 0.05);
    this.mesh.add(lShoe);

    const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.3), shoeMat);
    rShoe.position.set(0.15, 0.07, 0.05);
    this.mesh.add(rShoe);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.64, 8);
    this.leftArm = new THREE.Mesh(armGeo, torsoMat);
    this.leftArm.position.set(-0.34, 1.18, 0);
    this.leftArm.castShadow = true;
    this.mesh.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, torsoMat);
    this.rightArm.position.set(0.34, 1.18, 0);
    this.rightArm.castShadow = true;
    this.mesh.add(this.rightArm);
  }

  public takeDamage(amount: number, playerPos: THREE.Vector3) {
    if (this.state === 'DEAD') return;

    this.health -= amount;
    soundEngine.playHit();

    if (this.health <= 0) {
      this.state = 'DEAD';
      this.mesh.rotation.x = -Math.PI / 2;
      this.mesh.position.y = 0.2;
      gameState.player.stats.enemiesDefeated++;
      if (this.type === 'hostile') {
        const cashDrop = Math.floor(60 + Math.random() * 80);
        gameState.addMoney(cashDrop);
        gameState.showToast(`SYNDICATE ENEMY DOWN`, `+$${cashDrop} cash looted`, 'success');
      } else {
        gameState.increaseHeat(1);
        // Trigger emergency dispatch event
        window.dispatchEvent(new CustomEvent('emergency-ambulance', { detail: this.mesh.position.clone() }));
      }
      return;
    }

    if (this.type === 'civilian') {
      this.state = 'FLEE';
      const dx = this.mesh.position.x - playerPos.x;
      const dz = this.mesh.position.z - playerPos.z;
      this.heading = Math.atan2(dx, dz);
    }
  }

  public update(dt: number, playerPos: THREE.Vector3, isGunfireNearby: boolean, city: CityBuilder) {
    if (this.state === 'DEAD') return;

    const distToPlayer = this.mesh.position.distanceTo(playerPos);

    if (isGunfireNearby && this.type === 'civilian' && distToPlayer < 35 && this.state !== 'FLEE') {
      this.state = 'FLEE';
      const dx = this.mesh.position.x - playerPos.x;
      const dz = this.mesh.position.z - playerPos.z;
      this.heading = Math.atan2(dx, dz);
    }

    if (this.state === 'WALK') {
      this.speed = 1.8;
      const fX = Math.sin(this.heading) * this.speed;
      const fZ = Math.cos(this.heading) * this.speed;

      const newX = this.mesh.position.x + fX * dt;
      const newZ = this.mesh.position.z + fZ * dt;

      const col = city.checkCollision(newX, newZ, 0.5);
      if (!col.hit) {
        this.mesh.position.x = newX;
        this.mesh.position.z = newZ;
      } else {
        this.heading += Math.PI * 0.5;
      }

      this.mesh.rotation.y = this.heading;

      this.animTimer += dt * 7;
      const swing = Math.sin(this.animTimer) * 0.4;
      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;
      this.leftArm.rotation.x = -swing;
      this.rightArm.rotation.x = swing;

      if (Math.random() < 0.01) {
        this.heading += (Math.random() - 0.5) * Math.PI;
      }
    } else if (this.state === 'FLEE') {
      this.speed = 6.2;
      const fX = Math.sin(this.heading) * this.speed;
      const fZ = Math.cos(this.heading) * this.speed;

      const newX = this.mesh.position.x + fX * dt;
      const newZ = this.mesh.position.z + fZ * dt;

      const col = city.checkCollision(newX, newZ, 0.5);
      if (!col.hit) {
        this.mesh.position.x = newX;
        this.mesh.position.z = newZ;
      } else {
        this.heading += Math.PI * 0.5;
      }

      this.mesh.rotation.y = this.heading;

      this.animTimer += dt * 14;
      const swing = Math.sin(this.animTimer) * 0.75;
      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;
      this.leftArm.rotation.x = -Math.PI / 2 + swing * 0.5;
      this.rightArm.rotation.x = -Math.PI / 2 - swing * 0.5;
    } else if (this.state === 'ATTACK' && this.type === 'hostile') {
      const dx = playerPos.x - this.mesh.position.x;
      const dz = playerPos.z - this.mesh.position.z;
      this.heading = Math.atan2(dx, dz);
      this.mesh.rotation.y = this.heading;

      this.rightArm.rotation.x = -Math.PI / 2;

      if (distToPlayer > 12 && distToPlayer < 45) {
        this.speed = 3.5;
        this.mesh.position.x += Math.sin(this.heading) * this.speed * dt;
        this.mesh.position.z += Math.cos(this.heading) * this.speed * dt;

        this.animTimer += dt * 9;
        const swing = Math.sin(this.animTimer) * 0.5;
        this.leftLeg.rotation.x = swing;
        this.rightLeg.rotation.x = -swing;
      } else if (distToPlayer <= 12) {
        if (this.attackCooldown <= 0) {
          this.attackCooldown = 1.4;
          soundEngine.playWeapon('pistol');
          if (Math.random() > 0.3) {
            gameState.damagePlayer(12);
          }
        } else {
          this.attackCooldown -= dt;
        }
      }
    }
  }
}

export class NPCManager {
  public npcs: NPCInstance[] = [];
  private scene: THREE.Scene;
  private city: CityBuilder;

  constructor(scene: THREE.Scene, city: CityBuilder) {
    this.scene = scene;
    this.city = city;
    this.initWorldNPCs();
  }

  private initWorldNPCs() {
    // 1. Story NPC: Marcus Cole
    const marcus = new NPCInstance('npc_marcus', 'story', 'Marcus Cole', [-162, 0, 78], 0x0284c7);
    this.npcs.push(marcus);
    this.scene.add(marcus.mesh);

    // 2. Gym Trainer: Coach Dave at Iron Core Gym
    const coach = new NPCInstance('npc_coach', 'trainer', 'Coach Dave', [-138, 0, 108], 0xdc2626);
    this.npcs.push(coach);
    this.scene.add(coach.mesh);

    // 3. Ambient Civilians
    const civilianSpawns = [
      { name: 'Chloe Vance', pos: [-150, 0, 84], color: 0xec4899 },
      { name: 'Devon Lee', pos: [-125, 0, 68], color: 0x10b981 },
      { name: 'Elena Rostova', pos: [-110, 0, 92], color: 0xf59e0b },
      { name: 'Marcus Bell', pos: [230, 0, 230], color: 0x8b5cf6 },
      { name: 'Samira Khan', pos: [250, 0, 260], color: 0x06b6d4 },
      { name: 'Tariq Vance', pos: [270, 0, 240], color: 0x84cc16 },
      { name: 'Victor Stone', pos: [50, 0, 60], color: 0x64748b },
      { name: 'Maya Lin', pos: [70, 0, 50], color: 0xf43f5e },
    ];

    civilianSpawns.forEach((cs, i) => {
      const civ = new NPCInstance(`civ_${i}`, 'civilian', cs.name, cs.pos as [number, number, number], cs.color);
      civ.heading = Math.random() * Math.PI * 2;
      this.npcs.push(civ);
      this.scene.add(civ.mesh);
    });

    // 4. Hostile Syndicate Enforcers
    const hostileSpawns = [
      { name: 'Syndicate Enforcer 1', pos: [280, 0, 45] },
      { name: 'Syndicate Guard 2', pos: [290, 0, 60] },
      { name: 'Syndicate Lieutenant', pos: [270, 0, 55] },
    ];

    hostileSpawns.forEach((hs, i) => {
      const hos = new NPCInstance(`hos_${i}`, 'hostile', hs.name, hs.pos as [number, number, number]);
      this.npcs.push(hos);
      this.scene.add(hos.mesh);
    });
  }

  public findNearestNPC(pos: THREE.Vector3, maxDist: number = 4.0): NPCInstance | null {
    let nearest: NPCInstance | null = null;
    let minDist = maxDist;

    for (const npc of this.npcs) {
      if (npc.state === 'DEAD') continue;
      const d = npc.mesh.position.distanceTo(pos);
      if (d < minDist) {
        minDist = d;
        nearest = npc;
      }
    }
    return nearest;
  }

  public update(dt: number, playerPos: THREE.Vector3, isGunfireNearby: boolean) {
    this.npcs.forEach(npc => {
      npc.update(dt, playerPos, isGunfireNearby, this.city);
    });
  }
}
