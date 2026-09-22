import * as THREE from 'three';
import { gameState } from '../core/GameState';
import { soundEngine } from '../audio/SoundEngine';
import { CityBuilder } from '../world/CityBuilder';
import { VehicleManager, VehicleInstance } from '../vehicles/VehicleManager';
import { NPCManager, NPCInstance } from '../npc/NPCManager';
import { missionSystem } from '../missions/MissionSystem';
import { WeaponType } from '../types';

export class PlayerController {
  public mesh: THREE.Group;
  public camera: THREE.PerspectiveCamera;
  public position: THREE.Vector3 = new THREE.Vector3(-160, 0, 80);
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public heading: number = 0;

  // Camera angles
  public camYaw: number = 0;
  public camPitch: number = 0.22;
  public camDistance: number = 5.2;
  public targetCamDistance: number = 5.2;
  public isAiming: boolean = false;

  // Jump, Coyote Time & Ground physics
  public isGrounded: boolean = true;
  private verticalVelocity: number = 0;
  private gravity: number = -24;
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private sprintCooldownTimer: number = 0;

  // Target Lock
  public targetLockNpc: NPCInstance | null = null;

  // Combat
  public isAttacking: boolean = false;
  private attackCooldown: number = 0;
  public gunfireEvent: boolean = false;
  private comboStep: number = 0;
  private lastAttackTime: number = 0;

  // Limbs & Mesh References for Body Morphing & Animation
  private characterGroup!: THREE.Group;
  private leftLegUpper!: THREE.Mesh;
  private rightLegUpper!: THREE.Mesh;
  private leftArmUpper!: THREE.Mesh;
  private rightArmUpper!: THREE.Mesh;
  private jacketTorso!: THREE.Mesh;
  private innerShirt!: THREE.Mesh;
  private headMesh!: THREE.Mesh;
  private weaponMeshGroup!: THREE.Group;
  private dualWeaponMeshGroup!: THREE.Group;
  private muzzleFlash!: THREE.PointLight;
  private dualMuzzleFlash!: THREE.PointLight;
  private animTimer: number = 0;

  // Active vehicle reference
  public currentVehicle: VehicleInstance | null = null;

  // System References
  private city: CityBuilder;
  private vehicleMgr: VehicleManager;
  private npcMgr: NPCManager;

  // Key tracking
  public keys: Record<string, boolean> = {};

  constructor(camera: THREE.PerspectiveCamera, city: CityBuilder, vehicleMgr: VehicleManager, npcMgr: NPCManager) {
    this.camera = camera;
    this.city = city;
    this.vehicleMgr = vehicleMgr;
    this.npcMgr = npcMgr;

    this.mesh = new THREE.Group();
    this.mesh.position.copy(this.position);

    // Build Stylized 3D Human Model for Jayden Cross
    this.characterGroup = new THREE.Group();
    this.buildCharacterModel();
    this.mesh.add(this.characterGroup);

    this.updateBodyMorph();
  }

  private buildCharacterModel() {
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.6 });
    const jacketMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(gameState.player.jacketColor),
      roughness: 0.45,
      metalness: 0.1
    });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.8 });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(gameState.player.pantsColor),
      roughness: 0.75
    });
    const shoeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(gameState.player.shoesColor),
      roughness: 0.3
    });
    const darkAccMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 });
    const shadesMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });

    // 1. Head & Hair
    const headGeo = new THREE.CylinderGeometry(0.2, 0.18, 0.42, 10);
    this.headMesh = new THREE.Mesh(headGeo, skinMat);
    this.headMesh.position.y = 1.76;
    this.characterGroup.add(this.headMesh);

    // Stylized Hair / Beanie
    const hairGeo = new THREE.SphereGeometry(0.24, 10, 10);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 1.9, -0.02);
    this.characterGroup.add(hair);

    // Sunglasses / Shades
    const shadesGeo = new THREE.BoxGeometry(0.36, 0.09, 0.14);
    const shades = new THREE.Mesh(shadesGeo, shadesMat);
    shades.position.set(0, 1.8, 0.15);
    this.characterGroup.add(shades);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.18, 8);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 1.54;
    this.characterGroup.add(neck);

    // 2. Torso (Jacket with open collar & inner tee)
    const torsoGeo = new THREE.BoxGeometry(0.56, 0.72, 0.34);
    this.jacketTorso = new THREE.Mesh(torsoGeo, jacketMat);
    this.jacketTorso.position.y = 1.18;
    this.jacketTorso.castShadow = true;
    this.characterGroup.add(this.jacketTorso);

    const shirtGeo = new THREE.BoxGeometry(0.3, 0.65, 0.36);
    this.innerShirt = new THREE.Mesh(shirtGeo, shirtMat);
    this.innerShirt.position.set(0, 1.18, 0.01);
    this.characterGroup.add(this.innerShirt);

    // Tactical Utility Belt & Holster
    const beltGeo = new THREE.BoxGeometry(0.58, 0.1, 0.36);
    const belt = new THREE.Mesh(beltGeo, darkAccMat);
    belt.position.y = 0.82;
    this.characterGroup.add(belt);

    const holsterGeo = new THREE.BoxGeometry(0.15, 0.28, 0.18);
    const holster = new THREE.Mesh(holsterGeo, darkAccMat);
    holster.position.set(0.32, 0.75, 0);
    this.characterGroup.add(holster);

    // 3. Legs & High-Top Sneakers
    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.72, 8);

    // Left Leg
    this.leftLegUpper = new THREE.Mesh(legGeo, pantsMat);
    this.leftLegUpper.position.set(-0.16, 0.44, 0);
    this.leftLegUpper.castShadow = true;
    this.characterGroup.add(this.leftLegUpper);

    // Right Leg
    this.rightLegUpper = new THREE.Mesh(legGeo, pantsMat);
    this.rightLegUpper.position.set(0.16, 0.44, 0);
    this.rightLegUpper.castShadow = true;
    this.characterGroup.add(this.rightLegUpper);

    // High-top Sneakers
    const shoeGeo = new THREE.BoxGeometry(0.2, 0.16, 0.36);
    const lShoe = new THREE.Mesh(shoeGeo, shoeMat);
    lShoe.position.set(-0.16, 0.08, 0.06);
    this.characterGroup.add(lShoe);

    const rShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rShoe.position.set(0.16, 0.08, 0.06);
    this.characterGroup.add(rShoe);

    // 4. Arms & Hands
    const armGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.68, 8);

    this.leftArmUpper = new THREE.Mesh(armGeo, jacketMat);
    this.leftArmUpper.position.set(-0.36, 1.18, 0);
    this.leftArmUpper.castShadow = true;
    this.characterGroup.add(this.leftArmUpper);

    this.rightArmUpper = new THREE.Mesh(armGeo, jacketMat);
    this.rightArmUpper.position.set(0.36, 1.18, 0);
    this.rightArmUpper.castShadow = true;
    this.characterGroup.add(this.rightArmUpper);

    // Hands
    const handGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const lHand = new THREE.Mesh(handGeo, skinMat);
    lHand.position.set(0, -0.36, 0);
    this.leftArmUpper.add(lHand);

    const rHand = new THREE.Mesh(handGeo, skinMat);
    rHand.position.set(0, -0.36, 0);
    this.rightArmUpper.add(rHand);

    // 5. Right Weapon Mesh (Pistol / Shotgun / Rifle)
    this.weaponMeshGroup = new THREE.Group();
    const gunBody = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.48), new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.85 }));
    gunBody.position.set(0, 0, 0.15);
    this.weaponMeshGroup.add(gunBody);

    const gunBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.9 }));
    gunBarrel.rotation.x = Math.PI / 2;
    gunBarrel.position.set(0, 0.04, 0.45);
    this.weaponMeshGroup.add(gunBarrel);

    this.weaponMeshGroup.position.set(0, -0.36, 0.15);
    this.weaponMeshGroup.visible = false;
    this.rightArmUpper.add(this.weaponMeshGroup);

    this.muzzleFlash = new THREE.PointLight(0xfef08a, 0, 12);
    this.muzzleFlash.position.set(0, 0, 0.7);
    this.weaponMeshGroup.add(this.muzzleFlash);

    // 6. Left Dual Weapon Mesh (For Dual Pistols)
    this.dualWeaponMeshGroup = new THREE.Group();
    const dualGunBody = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.18, 0.48), new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.85 }));
    dualGunBody.position.set(0, 0, 0.15);
    this.dualWeaponMeshGroup.add(dualGunBody);
    this.dualWeaponMeshGroup.position.set(0, -0.36, 0.15);
    this.dualWeaponMeshGroup.visible = false;
    this.leftArmUpper.add(this.dualWeaponMeshGroup);

    this.dualMuzzleFlash = new THREE.PointLight(0xfef08a, 0, 12);
    this.dualMuzzleFlash.position.set(0, 0, 0.7);
    this.dualWeaponMeshGroup.add(this.dualMuzzleFlash);
  }

  // Dynamic 3D Human Body Scaling based on RPG Body Stats
  public updateBodyMorph() {
    const muscle = (gameState.player.muscle || 50) / 100;
    const bodyFat = (gameState.player.bodyFat || 20) / 100;

    const chestScaleX = 0.85 + muscle * 0.35 + bodyFat * 0.3;
    const chestScaleZ = 0.85 + muscle * 0.3 + bodyFat * 0.4;
    this.jacketTorso.scale.set(chestScaleX, 1.0, chestScaleZ);
    this.innerShirt.scale.set(chestScaleX, 1.0, chestScaleZ);

    const armScale = 0.85 + muscle * 0.4 + bodyFat * 0.15;
    this.leftArmUpper.scale.set(armScale, 1.0, armScale);
    this.rightArmUpper.scale.set(armScale, 1.0, armScale);

    const legScale = 0.85 + muscle * 0.25 + bodyFat * 0.25;
    this.leftLegUpper.scale.set(legScale, 1.0, legScale);
    this.rightLegUpper.scale.set(legScale, 1.0, legScale);
  }

  public updateWardrobe() {
    if (this.jacketTorso.material instanceof THREE.MeshStandardMaterial) {
      this.jacketTorso.material.color.set(gameState.player.jacketColor);
      this.leftArmUpper.material = this.jacketTorso.material;
      this.rightArmUpper.material = this.jacketTorso.material;
    }
  }

  public toggleTargetLock() {
    if (this.targetLockNpc) {
      this.targetLockNpc = null;
      gameState.targetLockNpcId = null;
      gameState.targetLockPos = null;
      soundEngine.playUI('close');
      gameState.notify();
      return;
    }

    // Find nearest hostile or NPC within 35m
    let nearest: NPCInstance | null = null;
    let minDist = 35;
    for (const npc of this.npcMgr.npcs) {
      if (npc.state === 'DEAD') continue;
      const d = this.mesh.position.distanceTo(npc.mesh.position);
      if (d < minDist) {
        minDist = d;
        nearest = npc;
      }
    }

    if (nearest) {
      this.targetLockNpc = nearest;
      gameState.targetLockNpcId = nearest.id;
      soundEngine.playUI('open');
      gameState.showToast('TARGET LOCKED', nearest.name, 'info');
      gameState.notify();
    }
  }

  public switchWeapon(type: WeaponType) {
    if (gameState.player.weapons[type]?.unlocked) {
      gameState.player.currentWeapon = type;
      this.weaponMeshGroup.visible = type !== 'fists';
      this.dualWeaponMeshGroup.visible = type === 'dual_pistols';
      soundEngine.playUI('open');
      gameState.notify();
    }
  }

  public attack() {
    if (this.attackCooldown > 0 || gameState.player.inVehicle) return;

    const curWep = gameState.player.weapons[gameState.player.currentWeapon];
    if (!curWep) return;

    // Check ammo
    if (curWep.id !== 'fists') {
      if (curWep.ammo <= 0) {
        gameState.showToast('OUT OF AMMO', 'Reload or visit shop', 'warning');
        return;
      }
      curWep.ammo--;
      gameState.notify();
    }

    this.attackCooldown = curWep.fireRate / 1000;
    this.gunfireEvent = curWep.id !== 'fists' && curWep.id !== 'spray_can';

    soundEngine.playWeapon(curWep.id === 'dual_pistols' ? 'pistol' : curWep.id);

    // Increase Weapon XP
    gameState.increaseWeaponSkill(curWep.id);

    // Recoil flash and punch animation
    if (this.gunfireEvent) {
      this.muzzleFlash.intensity = 4.5;
      this.rightArmUpper.rotation.x = -Math.PI / 2 + 0.3; // recoil kick
      if (curWep.id === 'dual_pistols') {
        this.dualMuzzleFlash.intensity = 4.5;
        this.leftArmUpper.rotation.x = -Math.PI / 2 + 0.3;
      }
      setTimeout(() => {
        this.muzzleFlash.intensity = 0;
        this.dualMuzzleFlash.intensity = 0;
      }, 70);
    } else if (curWep.id === 'spray_can') {
      // Spray aerosol tag action
      this.rightArmUpper.rotation.x = -Math.PI / 2.2;
      this.rightArmUpper.rotation.y = -0.3;
      gameState.showToast('GRAFFITI SPRAYED', '+1 Faction Tag', 'success');
      gameState.player.stats.graffitiTagged++;
      gameState.addMoney(50);
      setTimeout(() => {
        this.rightArmUpper.rotation.x = 0;
        this.rightArmUpper.rotation.y = 0;
      }, 300);
    } else {
      // Melee Martial Arts Combos
      const now = performance.now();
      if (now - this.lastAttackTime < 800) {
        this.comboStep = (this.comboStep + 1) % 3;
      } else {
        this.comboStep = 0;
      }
      this.lastAttackTime = now;

      if (this.comboStep === 0) {
        // Left Jab
        this.leftArmUpper.rotation.x = -Math.PI / 2;
        this.leftArmUpper.rotation.y = 0.3;
      } else if (this.comboStep === 1) {
        // Right Hook
        this.rightArmUpper.rotation.x = -Math.PI / 2;
        this.rightArmUpper.rotation.y = -0.5;
      } else {
        // Roundhouse Kick
        this.rightLegUpper.rotation.x = -Math.PI / 2.5;
        this.rightLegUpper.rotation.z = 0.4;
      }

      setTimeout(() => {
        this.leftArmUpper.rotation.x = 0;
        this.leftArmUpper.rotation.y = 0;
        this.rightArmUpper.rotation.x = 0;
        this.rightArmUpper.rotation.y = 0;
        this.rightLegUpper.rotation.x = 0;
        this.rightLegUpper.rotation.z = 0;
      }, 160);
    }

    // Aim forward direction vector
    const forward = new THREE.Vector3(
      Math.sin(this.camYaw),
      0,
      Math.cos(this.camYaw)
    ).normalize();

    // Hit detection raycast
    for (const npc of this.npcMgr.npcs) {
      if (npc.state === 'DEAD') continue;
      const toNpc = new THREE.Vector3().subVectors(npc.mesh.position, this.mesh.position);
      const dist = toNpc.length();

      if (dist <= curWep.range) {
        toNpc.normalize();
        const dot = forward.dot(toNpc);
        if (dot > 0.45 || this.targetLockNpc === npc) {
          npc.takeDamage(curWep.damage, this.mesh.position);
          const activeObj = missionSystem.getActiveObjective();
          if (activeObj && activeObj.targetType === 'npc' && npc.type === 'hostile') {
            missionSystem.advanceObjective();
          }
          break;
        }
      }
    }
  }

  public interact() {
    // 1. If inside vehicle, exit
    if (gameState.player.inVehicle && this.currentVehicle) {
      this.exitVehicle();
      return;
    }

    // 2. Check nearest vehicle to enter
    const nearVeh = this.vehicleMgr.findNearestVehicle(this.mesh.position, 4.5);
    if (nearVeh) {
      this.enterVehicle(nearVeh);
      return;
    }

    // 3. Check nearest NPC (Marcus Cole, Story NPCs, Allies)
    const nearNpc = this.npcMgr.findNearestNPC(this.mesh.position, 4.0);
    if (nearNpc) {
      if (nearNpc.name === 'Marcus Cole') {
        const activeObj = missionSystem.getActiveObjective();
        if (activeObj && activeObj.id === 'm01_obj1') {
          missionSystem.advanceObjective();
        } else {
          gameState.playDialogue([
            { speaker: 'Marcus', text: 'Jayden, the Syndicate is moving weapons through Industrial Dock 4. We need to claim those territories.', avatarColor: '#38bdf8' },
            { speaker: 'Marcus', text: 'Visit Iron Core Gym to build strength, and lowline customs to mod your ride.', avatarColor: '#38bdf8' }
          ]);
        }
      } else if (nearNpc.type === 'civilian' && gameState.player.respect >= 30) {
        // Recruit ally companion
        gameState.showToast('RECRUITED TO CREW', `${nearNpc.name} joined Riverside Union!`, 'success');
        gameState.allies.push({
          id: nearNpc.id,
          name: nearNpc.name,
          health: 100,
          maxHealth: 100,
          state: 'follow',
          weapon: 'pistol',
          faction: 'riverside_union'
        });
      }
      return;
    }

    // 4. Check Landmarks (Gym, Food, Barber, Tattoo, Safehouse, Garage, Shop, Arcade, Properties)
    for (const lm of this.city.landmarks) {
      const lmPos = new THREE.Vector3(...lm.position);
      if (this.mesh.position.distanceTo(lmPos) < 6.0) {
        if (lm.type === 'safehouse') {
          window.dispatchEvent(new CustomEvent('open-modal', { detail: 'safehouse' }));
        } else if (lm.type === 'garage') {
          window.dispatchEvent(new CustomEvent('open-modal', { detail: 'garage' }));
        } else if (lm.type === 'shop') {
          window.dispatchEvent(new CustomEvent('open-modal', { detail: 'shop' }));
        } else if (lm.type === 'gym') {
          window.dispatchEvent(new CustomEvent('open-modal', { detail: 'gym' }));
        } else if (lm.type === 'food') {
          window.dispatchEvent(new CustomEvent('open-modal', { detail: 'food' }));
        } else if (lm.type === 'barber') {
          window.dispatchEvent(new CustomEvent('open-modal', { detail: 'barber' }));
        } else if (lm.type === 'tattoo') {
          window.dispatchEvent(new CustomEvent('open-modal', { detail: 'tattoo' }));
        } else if (lm.type === 'arcade') {
          window.dispatchEvent(new CustomEvent('open-modal', { detail: 'arcade' }));
        } else if (lm.type === 'property') {
          window.dispatchEvent(new CustomEvent('open-modal', { detail: 'property' }));
        } else if (lm.type === 'academy') {
          window.dispatchEvent(new CustomEvent('open-modal', { detail: 'academy' }));
        }
        return;
      }
    }
  }

  public enterVehicle(vehicle: VehicleInstance) {
    this.currentVehicle = vehicle;
    vehicle.isOccupied = true;
    this.vehicleMgr.activeVehicle = vehicle;
    gameState.player.inVehicle = true;
    gameState.player.activeVehicleId = vehicle.id;
    gameState.currentVehicleModel = vehicle.model;
    gameState.vehicleHealth = vehicle.health;
    gameState.vehicleMaxHealth = vehicle.stats.maxHealth;

    this.mesh.visible = false;
    soundEngine.playUI('open');
    soundEngine.startEngine();

    gameState.showToast(`ENTERED ${vehicle.stats.name.toUpperCase()}`, 'W/S Drive • A/D Steer • Shift Nitro • Space Handbrake', 'info');

    const activeObj = missionSystem.getActiveObjective();
    if (activeObj && activeObj.id === 'm01_obj2') {
      gameState.showToast('WAYPOINT MARKED', 'Drive to East Market Bazaar', 'warning');
    }

    gameState.notify();
  }

  public exitVehicle() {
    if (!this.currentVehicle) return;

    const exitOffset = new THREE.Vector3(-2.4, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.currentVehicle.heading);
    this.mesh.position.copy(this.currentVehicle.mesh.position).add(exitOffset);
    this.mesh.position.y = 0;
    this.position.copy(this.mesh.position);
    this.mesh.visible = true;

    this.currentVehicle.isOccupied = false;
    this.vehicleMgr.activeVehicle = null;
    this.currentVehicle = null;

    gameState.player.inVehicle = false;
    gameState.player.activeVehicleId = null;
    soundEngine.stopEngine();
    soundEngine.playUI('open');

    gameState.notify();
  }

  public update(dt: number) {
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    this.gunfireEvent = false;

    // --- On-Foot Movement & Controls ---
    if (!gameState.player.inVehicle) {
      // 1. Jump Physics with Coyote Time & Buffer
      if (this.isGrounded) {
        this.coyoteTimer = 0.15; // 150ms coyote window
      } else {
        this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
      }

      if (this.keys['Space']) {
        this.jumpBufferTimer = 0.15; // 150ms buffer
      } else {
        this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
      }

      if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
        this.verticalVelocity = 8.8;
        this.isGrounded = false;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
      }

      if (!this.isGrounded) {
        this.verticalVelocity += this.gravity * dt;
        this.mesh.position.y += this.verticalVelocity * dt;
        if (this.mesh.position.y <= 0) {
          this.mesh.position.y = 0;
          this.verticalVelocity = 0;
          this.isGrounded = true;
        }
      }

      // 2. Camera-Relative Movement Vector Math
      let inputForward = 0;
      let inputStrafe = 0;

      if (this.keys['KeyW'] || this.keys['ArrowUp']) inputForward += 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) inputForward -= 1;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) inputStrafe -= 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) inputStrafe += 1;

      // Sprint & Stamina logic
      const wantsSprint = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) && inputForward > 0;
      let isSprinting = false;

      if (wantsSprint && gameState.player.stamina > 2) {
        isSprinting = true;
        gameState.player.stamina = Math.max(0, gameState.player.stamina - dt * 15);
        this.sprintCooldownTimer = 1.2;
      } else {
        if (this.sprintCooldownTimer > 0) {
          this.sprintCooldownTimer -= dt;
        } else {
          gameState.player.stamina = Math.min(gameState.player.maxStamina, gameState.player.stamina + dt * 18);
        }
      }

      const baseSpeed = isSprinting ? (9.2 + gameState.player.staminaSkill * 0.03) : (this.isAiming ? 3.0 : 4.8);
      const isMoving = inputForward !== 0 || inputStrafe !== 0;

      // Camera vectors on ground plane
      const camForward = new THREE.Vector3(Math.sin(this.camYaw), 0, Math.cos(this.camYaw)).normalize();
      const camRight = new THREE.Vector3(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw)).normalize();

      const moveDir = new THREE.Vector3();
      moveDir.addScaledVector(camForward, inputForward);
      moveDir.addScaledVector(camRight, inputStrafe);

      // Target Lock Orientation
      if (this.targetLockNpc && this.targetLockNpc.state !== 'DEAD') {
        const toTarget = new THREE.Vector3().subVectors(this.targetLockNpc.mesh.position, this.mesh.position);
        if (toTarget.length() < 35) {
          this.heading = Math.atan2(toTarget.x, toTarget.z);
          this.camYaw = this.heading;
          gameState.targetLockPos = [this.targetLockNpc.mesh.position.x, this.targetLockNpc.mesh.position.y + 1.2, this.targetLockNpc.mesh.position.z];
        } else {
          this.targetLockNpc = null;
          gameState.targetLockNpcId = null;
          gameState.targetLockPos = null;
        }
      }

      if (isMoving && moveDir.lengthSq() > 0.001) {
        moveDir.normalize();

        const targetHeading = Math.atan2(moveDir.x, moveDir.z);

        if (this.isAiming || gameState.settings.shiftLock) {
          this.heading = this.camYaw;
        } else if (!this.targetLockNpc) {
          let diff = targetHeading - this.heading;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          this.heading += diff * Math.min(1.0, dt * 14);
        }

        this.mesh.rotation.y = this.heading;

        // Move character with solid collision response
        const newX = this.mesh.position.x + moveDir.x * baseSpeed * dt;
        const newZ = this.mesh.position.z + moveDir.z * baseSpeed * dt;

        const col = this.city.checkCollision(newX, newZ, 0.7);
        if (!col.hit) {
          this.mesh.position.x = newX;
          this.mesh.position.z = newZ;
        } else {
          this.mesh.position.x = newX + col.pushX;
          this.mesh.position.z = newZ + col.pushZ;
        }

        this.position.copy(this.mesh.position);

        // Limbs Running Animation
        this.animTimer += dt * (isSprinting ? 14 : 9);
        const swing = Math.sin(this.animTimer) * (isSprinting ? 0.8 : 0.45);
        this.leftLegUpper.rotation.x = swing;
        this.rightLegUpper.rotation.x = -swing;
        this.leftArmUpper.rotation.x = -swing;
        if (!this.isAiming && gameState.player.currentWeapon === 'fists') {
          this.rightArmUpper.rotation.x = swing;
        }

        gameState.player.stats.distanceTraveledKm += (baseSpeed * dt) / 1000;
      } else {
        // Idle Stance
        this.leftLegUpper.rotation.x = 0;
        this.rightLegUpper.rotation.x = 0;
        this.leftArmUpper.rotation.x = 0;
        if (!this.isAiming && gameState.player.currentWeapon === 'fists') {
          this.rightArmUpper.rotation.x = 0;
        }
        if (this.isAiming || gameState.settings.shiftLock) {
          this.heading = this.camYaw;
          this.mesh.rotation.y = this.heading;
        }
      }

      // Aiming Weapon Pose
      if (this.isAiming) {
        this.rightArmUpper.rotation.x = -Math.PI / 2 - (this.camPitch - 0.2);
        this.rightArmUpper.rotation.y = 0.15;
        if (gameState.player.currentWeapon === 'dual_pistols') {
          this.leftArmUpper.rotation.x = -Math.PI / 2 - (this.camPitch - 0.2);
          this.leftArmUpper.rotation.y = -0.15;
        }
        this.targetCamDistance = 2.4;
      } else {
        if (gameState.player.currentWeapon !== 'fists') {
          this.rightArmUpper.rotation.x = -0.4;
          this.rightArmUpper.rotation.y = 0;
        }
        this.targetCamDistance = isSprinting ? 6.0 : (gameState.settings.cameraDistance || 5.2);
      }

      // Smooth Camera distance lerp
      this.camDistance += (this.targetCamDistance - this.camDistance) * dt * 8;

      // 3. Camera Collision Avoidance (Prevent clipping through walls & buildings)
      const targetLookAt = new THREE.Vector3(
        this.mesh.position.x,
        this.mesh.position.y + (this.isAiming ? 1.6 : 1.45),
        this.mesh.position.z
      );

      const shoulderOffset = this.isAiming ? 0.65 : 0;
      const desiredCamOffset = new THREE.Vector3(
        -Math.sin(this.camYaw) * this.camDistance * Math.cos(this.camPitch) + Math.cos(this.camYaw) * shoulderOffset,
        Math.sin(this.camPitch) * this.camDistance + (this.isAiming ? 0.1 : 0),
        -Math.cos(this.camYaw) * this.camDistance * Math.cos(this.camPitch) - Math.sin(this.camYaw) * shoulderOffset
      );

      const desiredCamPos = targetLookAt.clone().add(desiredCamOffset);

      // Raycast from player head to desired camera position against world colliders
      const camRay = this.city.raycastWorld(targetLookAt, desiredCamPos);
      if (camRay.hit && camRay.distance < this.camDistance) {
        // Move camera closer to avoid clipping
        const safeDist = Math.max(1.2, camRay.distance - 0.35);
        desiredCamOffset.normalize().multiplyScalar(safeDist);
        this.camera.position.copy(targetLookAt).add(desiredCamOffset);
      } else {
        this.camera.position.copy(desiredCamPos);
      }

      this.camera.lookAt(targetLookAt);

      // Update current district
      gameState.updateDistrict(this.mesh.position.x, this.mesh.position.z);
    } else if (this.currentVehicle) {
      // --- In-Vehicle Camera & Controls ---
      const veh = this.currentVehicle;

      let throttle = 0;
      let steer = 0;

      if (this.keys['KeyW'] || this.keys['ArrowUp']) throttle += 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) throttle -= 1;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) steer += 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) steer -= 1;

      const isHandbrake = this.keys['Space'];
      const wantsNitro = (this.keys['ShiftLeft'] || this.keys['KeyN']) && throttle > 0;

      // Nitro boost system
      if (wantsNitro && gameState.nitroAmount > 5) {
        gameState.isNitroActive = true;
        gameState.nitroAmount = Math.max(0, gameState.nitroAmount - dt * 30);
      } else {
        gameState.isNitroActive = false;
        gameState.nitroAmount = Math.min(100, gameState.nitroAmount + dt * 10);
      }

      // Acceleration with Vehicle Skill & Nitro
      const skillBonus = 1 + (gameState.player.carSkill || 0) * 0.003;
      const nitroMultiplier = gameState.isNitroActive ? 1.45 : 1.0;
      const accelRate = veh.stats.acceleration * skillBonus * nitroMultiplier;
      const maxSpd = (veh.stats.maxSpeed * (gameState.isNitroActive ? 1.25 : 1.0)) / 3.6;

      if (throttle > 0) {
        veh.speed = Math.min(maxSpd, veh.speed + accelRate * dt);
        gameState.increaseVehicleSkill('car', dt * 0.05);
      } else if (throttle < 0) {
        if (veh.speed > 1) {
          veh.speed = Math.max(0, veh.speed - accelRate * 2.2 * dt);
        } else {
          veh.speed = Math.max(-maxSpd * 0.4, veh.speed - accelRate * 0.8 * dt);
        }
      } else {
        veh.speed *= Math.pow(0.96, dt * 60);
      }

      if (isHandbrake) {
        veh.speed *= Math.pow(0.85, dt * 60);
      }

      const targetSteer = steer * 0.45;
      veh.steerAngle += (targetSteer - veh.steerAngle) * dt * 10;

      // Vehicle Follow Camera with Collision Avoidance
      const carPos = veh.mesh.position;
      this.camDistance = 7.5 + (Math.abs(veh.speed) / maxSpd) * 3.5;

      const camTargetOffset = new THREE.Vector3(
        -Math.sin(this.camYaw) * this.camDistance * Math.cos(this.camPitch),
        Math.sin(this.camPitch) * this.camDistance + 2.0,
        -Math.cos(this.camYaw) * this.camDistance * Math.cos(this.camPitch)
      );

      const lookTarget = new THREE.Vector3(carPos.x, carPos.y + 1.2, carPos.z);
      const desiredCarCamPos = lookTarget.clone().add(camTargetOffset);

      const carCamRay = this.city.raycastWorld(lookTarget, desiredCarCamPos);
      if (carCamRay.hit && carCamRay.distance < this.camDistance) {
        const safeDist = Math.max(2.5, carCamRay.distance - 0.4);
        camTargetOffset.normalize().multiplyScalar(safeDist);
        this.camera.position.copy(lookTarget).add(camTargetOffset);
      } else {
        this.camera.position.copy(desiredCarCamPos);
      }

      this.camera.lookAt(lookTarget);

      // Sync stats
      gameState.vehicleSpeedKmH = Math.round(Math.abs(veh.speed) * 3.6);
      if (gameState.vehicleSpeedKmH > gameState.player.stats.maxSpeedKmH) {
        gameState.player.stats.maxSpeedKmH = gameState.vehicleSpeedKmH;
      }
      gameState.player.stats.distanceTraveledKm += (Math.abs(veh.speed) * dt) / 1000;
      gameState.updateDistrict(carPos.x, carPos.z);
    }
  }
}
