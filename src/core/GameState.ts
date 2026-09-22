import { 
  PlayerStats, 
  DistrictId, 
  DistrictInfo, 
  WeaponType, 
  VehicleModel, 
  SaveGameData, 
  TimeOfDay, 
  WeatherType, 
  DialogueLine,
  FactionId,
  FactionInfo,
  PropertyItem,
  GameSettings,
  SideJobState,
  CompanionAlly,
  VehicleCustomization
} from '../types';
import { soundEngine } from '../audio/SoundEngine';

export const DISTRICTS: DistrictInfo[] = [
  {
    id: 'riverside',
    name: 'Riverside',
    description: 'Dense residential neighborhood with houses, safehouses, garages, and convenience shops.',
    color: '#10b981',
    bounds: { minX: -260, maxX: -40, minZ: -40, maxZ: 180 },
    theme: 'Residential',
    faction: 'riverside_union'
  },
  {
    id: 'downtown',
    name: 'Downtown Vanta',
    description: 'Towering commercial high-rises, offices, busy intersections, and neon advertising.',
    color: '#06b6d4',
    bounds: { minX: -40, maxX: 180, minZ: -40, maxZ: 180 },
    theme: 'Metropolitan',
    faction: 'riverside_union'
  },
  {
    id: 'industrial',
    name: 'Industrial Yard',
    description: 'Heavy shipping containers, warehouses, loading docks, and construction zones.',
    color: '#f97316',
    bounds: { minX: 180, maxX: 400, minZ: -40, maxZ: 180 },
    theme: 'Industrial',
    faction: 'iron_serpents'
  },
  {
    id: 'east_market',
    name: 'East Market',
    description: 'Outdoor food markets, vibrant street vendors, narrow alleys, and small shops.',
    color: '#eab308',
    bounds: { minX: 180, maxX: 400, minZ: 180, maxZ: 400 },
    theme: 'Market',
    faction: 'night_market'
  },
  {
    id: 'harbor',
    name: 'Black Harbor',
    description: 'Container docks, waterfront promenades, cargo cranes, and scenic ocean views.',
    color: '#3b82f6',
    bounds: { minX: -40, maxX: 180, minZ: 180, maxZ: 400 },
    theme: 'Maritime',
    faction: 'black_harbor'
  },
  {
    id: 'nova_heights',
    name: 'Nova Heights',
    description: 'Scenic high-elevation winding roads, luxury penthouses, and skyline viewpoints.',
    color: '#a855f7',
    bounds: { minX: -260, maxX: -40, minZ: -260, maxZ: -40 },
    theme: 'Luxury',
    faction: 'eastside_crew'
  },
  {
    id: 'old_quarter',
    name: 'Old Quarter',
    description: 'Classic brick architectures, narrow alleys, and historic storefronts.',
    color: '#ec4899',
    bounds: { minX: -40, maxX: 180, minZ: -260, maxZ: -40 },
    theme: 'Historic',
    faction: 'riverside_union'
  },
  {
    id: 'port_astra',
    name: 'Port Astra Transit',
    description: 'Export cargo depots, train tracks, and international shipping bays.',
    color: '#64748b',
    bounds: { minX: 180, maxX: 400, minZ: -260, maxZ: -40 },
    theme: 'Logistics',
    faction: 'black_harbor'
  }
];

export const FACTIONS: Record<FactionId, FactionInfo> = {
  riverside_union: {
    id: 'riverside_union',
    name: 'Riverside Union',
    color: '#10b981',
    territoryName: 'Riverside & Downtown',
    description: 'Jayden and Marcus’s founding crew fighting against Syndicate corporate control.',
    controlPercentage: 70
  },
  iron_serpents: {
    id: 'iron_serpents',
    name: 'Iron Serpents',
    color: '#ef4444',
    territoryName: 'Industrial Yard & Docks',
    description: 'Armed syndicate enforcers controlling contraband trade and weapons shipments.',
    controlPercentage: 85
  },
  eastside_crew: {
    id: 'eastside_crew',
    name: 'Eastside Crew',
    color: '#a855f7',
    territoryName: 'Nova Heights',
    description: 'High-stakes street racers and underground luxury vehicle syndicates.',
    controlPercentage: 55
  },
  black_harbor: {
    id: 'black_harbor',
    name: 'Black Harbor Syndicate',
    color: '#3b82f6',
    territoryName: 'Black Harbor & Port Astra',
    description: 'Port authority smuggling ring operating cargo crane terminals.',
    controlPercentage: 60
  },
  night_market: {
    id: 'night_market',
    name: 'Night Market Guild',
    color: '#eab308',
    territoryName: 'East Market Grand Bazaar',
    description: 'Merchants and martial artists safeguarding the old traditions.',
    controlPercentage: 65
  }
};

export const PROPERTIES: PropertyItem[] = [
  {
    id: 'prop_riverside_safe',
    name: 'Jayden’s Riverside Safehouse',
    type: 'safehouse',
    price: 0,
    dailyIncome: 0,
    district: 'riverside',
    position: [-170, 0, 80],
    owned: true,
    description: 'Your starter home with weapon stash and wardrobe closet.'
  },
  {
    id: 'prop_riverside_garage',
    name: 'Riverside Custom Garage',
    type: 'garage',
    price: 1500,
    dailyIncome: 120,
    district: 'riverside',
    position: [-135, 0, 70],
    owned: true,
    description: 'Tuning workshop with full vehicle respray and nitro bay.'
  },
  {
    id: 'prop_penthouse',
    name: 'Skyview Luxury Penthouse',
    type: 'apartment',
    price: 12000,
    dailyIncome: 0,
    district: 'downtown',
    position: [50, 0, -80],
    owned: false,
    description: 'High-rise luxury suite with panoramic skyline views.'
  },
  {
    id: 'prop_logistics',
    name: 'Harbor Bay Logistics Hub',
    type: 'business',
    price: 8500,
    dailyIncome: 450,
    district: 'harbor',
    position: [280, 0, 190],
    owned: false,
    description: 'Generates passive daily freight revenue for the player.'
  }
];

export const INITIAL_PLAYER_STATS: PlayerStats = {
  name: 'Jayden Cross',
  health: 100,
  maxHealth: 100,
  armor: 50,
  maxArmor: 100,
  stamina: 100,
  maxStamina: 100,
  oxygen: 100,
  maxOxygen: 100,
  money: 850,
  
  // Body Stats (0-100)
  muscle: 45,
  bodyFat: 20,
  bodyWeight: 78,
  hunger: 80,
  
  // RPG Skills (0-100)
  staminaSkill: 35,
  lungCapacitySkill: 25,
  
  // Weapon Skills (0-100)
  pistolSkill: 30,
  shotgunSkill: 15,
  smgSkill: 10,
  rifleSkill: 10,
  
  // Vehicle Skills (0-100)
  carSkill: 40,
  motorcycleSkill: 25,
  bicycleSkill: 20,
  flyingSkill: 10,
  boatingSkill: 15,
  
  // Combat
  meleeStyle: 'boxing',
  meleeSkill: 35,
  
  // Social
  respect: 25,
  charisma: 30,
  
  // Customization
  jacketColor: '#1e3a8a',
  pantsColor: '#1f2937',
  shoesColor: '#dc2626',
  shirtColor: '#09090b',
  hatType: 'none',
  glassesType: 'sunglasses',
  hairStyle: 'textured',
  hairColor: '#1c1917',
  tattoos: [],
  
  currentWeapon: 'fists',
  weapons: {
    fists: {
      id: 'fists',
      name: 'Unarmed Melee',
      damage: 25,
      fireRate: 350,
      range: 2.2,
      ammo: 999,
      maxAmmo: 999,
      magSize: 999,
      magAmmo: 999,
      unlocked: true,
    },
    pistol: {
      id: 'pistol',
      name: 'Viper 9mm Handgun',
      damage: 35,
      fireRate: 320,
      range: 45,
      ammo: 48,
      maxAmmo: 180,
      magSize: 12,
      magAmmo: 12,
      unlocked: true,
    },
    shotgun: {
      id: 'shotgun',
      name: 'Enforcer 12G Shotgun',
      damage: 90,
      fireRate: 900,
      range: 22,
      ammo: 16,
      maxAmmo: 64,
      magSize: 8,
      magAmmo: 8,
      unlocked: true,
    },
    smg: {
      id: 'smg',
      name: 'Vector 10mm SMG',
      damage: 26,
      fireRate: 110,
      range: 35,
      ammo: 90,
      maxAmmo: 300,
      magSize: 30,
      magAmmo: 30,
      unlocked: false,
    },
    rifle: {
      id: 'rifle',
      name: 'Apex Tactical Carbine',
      damage: 55,
      fireRate: 200,
      range: 75,
      ammo: 60,
      maxAmmo: 240,
      magSize: 30,
      magAmmo: 30,
      unlocked: true,
    },
    dual_pistols: {
      id: 'dual_pistols',
      name: 'Akimbo Viper Pistols',
      damage: 70,
      fireRate: 200,
      range: 45,
      ammo: 72,
      maxAmmo: 240,
      magSize: 24,
      magAmmo: 24,
      unlocked: false,
    },
    spray_can: {
      id: 'spray_can',
      name: 'Krylon Tagging Spray',
      damage: 5,
      fireRate: 200,
      range: 3.5,
      ammo: 100,
      maxAmmo: 100,
      magSize: 100,
      magAmmo: 100,
      unlocked: true,
    }
  },
  currentDistrict: 'riverside',
  inVehicle: false,
  activeVehicleId: null,
  stats: {
    missionsCompleted: 0,
    policeEscaped: 0,
    enemiesDefeated: 0,
    graffitiTagged: 1,
    stuntsCompleted: 0,
    racesWon: 0,
    sideJobsCompleted: 0,
    distanceTraveledKm: 0,
    maxSpeedKmH: 0,
  }
};

export class GameState {
  private static instance: GameState;
  
  public player: PlayerStats = { ...INITIAL_PLAYER_STATS };
  public ownedVehicles: VehicleModel[] = ['compact', 'sedan'];
  public vehicleCustomizations: Partial<Record<VehicleModel, VehicleCustomization>> = {};
  public properties: PropertyItem[] = [...PROPERTIES];
  public allies: CompanionAlly[] = [];
  public sideJob: SideJobState = { type: 'none', level: 1, passengersDelivered: 0, rewardEarned: 0 };
  
  // Police & Heat
  public heat: number = 0; // 0 to 5
  public heatTimer: number = 0;
  public policeSearching: boolean = false;
  public searchTimer: number = 0;
  
  // World State
  public timeHour: number = 17.5; // Start late afternoon (17:30)
  public weather: WeatherType = 'clear';
  public currentVehicleModel: VehicleModel | null = null;
  public vehicleSpeedKmH: number = 0;
  public vehicleHealth: number = 100;
  public vehicleMaxHealth: number = 100;
  public nitroAmount: number = 100; // 0 to 100
  public isNitroActive: boolean = false;
  
  // Settings
  public settings: GameSettings = {
    mouseSensitivity: 1.0,
    invertY: false,
    cameraDistance: 5.2,
    sprintMode: 'hold',
    aimMode: 'hold',
    crouchMode: 'toggle',
    shiftLock: false,
    mobileControls: false,
    soundVolume: 0.8,
    musicVolume: 0.6,
  };
  
  // Combat Target Lock
  public targetLockPos: [number, number, number] | null = null;
  public targetLockNpcId: string | null = null;
  
  // Dialogue
  public currentDialogue: DialogueLine[] | null = null;
  public dialogueIndex: number = 0;
  
  // Toast notifications
  public activeToast: { title: string; message: string; type: 'info' | 'success' | 'warning' | 'danger'; id: number } | null = null;
  private toastCounter = 0;
  
  // Observers
  private listeners: Array<() => void> = [];

  private constructor() {
    this.loadGame();
  }

  public static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  public notify() {
    this.listeners.forEach(fn => fn());
  }

  public showToast(title: string, message: string, type: 'info' | 'success' | 'warning' | 'danger' = 'info') {
    const id = ++this.toastCounter;
    this.activeToast = { title, message, type, id };
    this.notify();
    setTimeout(() => {
      if (this.activeToast?.id === id) {
        this.activeToast = null;
        this.notify();
      }
    }, 3800);
  }

  public addMoney(amount: number) {
    this.player.money += amount;
    soundEngine.playUI('complete');
    this.notify();
  }

  public spendMoney(amount: number): boolean {
    if (this.player.money >= amount) {
      this.player.money -= amount;
      this.notify();
      return true;
    }
    this.showToast('INSUFFICIENT CASH', `Need $${amount} (Have $${this.player.money})`, 'danger');
    soundEngine.playUI('error');
    return false;
  }

  public increaseHeat(amount: number) {
    const prev = this.heat;
    this.heat = Math.min(5, this.heat + amount);
    this.heatTimer = 0;
    this.policeSearching = false;
    if (this.heat > prev && this.heat >= 1) {
      soundEngine.playPoliceSiren();
      this.showToast(`WANTED LEVEL ${'★'.repeat(this.heat)}`, 'Police patrol units dispatched!', 'danger');
    }
    this.notify();
  }

  public clearHeat() {
    this.heat = 0;
    this.policeSearching = false;
    this.searchTimer = 0;
    this.notify();
  }

  public updateEvadeTick(dt: number, hasLineOfSight: boolean) {
    if (this.heat === 0) return;

    if (hasLineOfSight) {
      // In active chase
      this.policeSearching = false;
      this.searchTimer = 0;
      this.heatTimer = 0;
    } else {
      // Out of direct sight -> Searching mode
      this.policeSearching = true;
      this.searchTimer += dt;

      // After 14s of staying hidden, heat cools down
      if (this.searchTimer >= 14) {
        this.heat = Math.max(0, this.heat - 1);
        this.searchTimer = 0;
        if (this.heat === 0) {
          this.policeSearching = false;
          this.player.stats.policeEscaped++;
          this.addMoney(200);
          this.showToast('EVADED POLICE', '+$200 clean getaway bonus', 'success');
        } else {
          this.showToast('LOS LOST', `Heat reduced to ${'★'.repeat(this.heat)}`, 'info');
        }
      }
    }
    this.notify();
  }

  public damagePlayer(amount: number) {
    if (this.player.armor > 0) {
      const armorAbsorb = Math.min(this.player.armor, amount * 0.7);
      this.player.armor -= armorAbsorb;
      const leftover = amount - armorAbsorb;
      this.player.health = Math.max(0, this.player.health - leftover);
    } else {
      this.player.health = Math.max(0, this.player.health - amount);
    }

    soundEngine.playHit();

    if (this.player.health <= 0) {
      soundEngine.playDeath();
      this.showToast('WASTED', 'You collapsed in Vanta City. Responding to hospital...', 'danger');
    }
    this.notify();
  }

  public healPlayer(amount: number, armorAmount: number = 0) {
    this.player.health = Math.min(this.player.maxHealth, this.player.health + amount);
    if (armorAmount > 0) {
      this.player.armor = Math.min(this.player.maxArmor, this.player.armor + armorAmount);
    }
    this.notify();
  }

  public addRespect(amount: number) {
    this.player.respect = Math.min(100, this.player.respect + amount);
    this.player.reputation = this.player.respect;
    this.notify();
  }

  public addReputation(amount: number) {
    this.addRespect(amount);
  }

  public resetProgress() {
    this.player = JSON.parse(JSON.stringify(INITIAL_PLAYER_STATS));
    this.player.reputation = this.player.respect;
    this.heat = 0;
    this.timeHour = 14.5;
    this.ownedVehicles = ['compact', 'sedan'];
    try {
      localStorage.removeItem('vanta_neon_district_save_v2');
    } catch {}
    this.showToast('NEW CAREER STARTED', 'Welcome back to Vanta City', 'success');
    this.notify();
  }

  public eatFood(mealType: 'light' | 'normal' | 'heavy' | 'protein', cost: number) {
    if (!this.spendMoney(cost)) return;

    if (mealType === 'light') {
      this.healPlayer(20);
      this.player.hunger = Math.min(100, this.player.hunger + 25);
      this.player.bodyFat = Math.min(100, this.player.bodyFat + 0.5);
      this.showToast('LIGHT MEAL CONSUMED', '+20 HP • Light calories', 'success');
    } else if (mealType === 'normal') {
      this.healPlayer(50);
      this.player.hunger = Math.min(100, this.player.hunger + 50);
      this.player.bodyFat = Math.min(100, this.player.bodyFat + 1.2);
      this.showToast('FULL MEAL ENJOYED', '+50 HP • Restored vitality', 'success');
    } else if (mealType === 'heavy') {
      this.healPlayer(100);
      this.player.hunger = 100;
      this.player.bodyFat = Math.min(100, this.player.bodyFat + 3.0);
      this.player.bodyWeight += 0.4;
      this.showToast('HEAVY FEAST', '+100 HP Full Recovery • Calories high', 'success');
    } else if (mealType === 'protein') {
      this.healPlayer(60);
      this.player.hunger = Math.min(100, this.player.hunger + 40);
      this.player.muscle = Math.min(100, this.player.muscle + 1.5);
      this.player.bodyFat = Math.max(5, this.player.bodyFat - 0.5);
      this.showToast('PROTEIN SHAKE & CHICKEN', '+60 HP • +1.5 Muscle Mass', 'success');
    }
    soundEngine.playUI('complete');
    this.notify();
  }

  public trainAtGym(activity: 'weights' | 'treadmill' | 'boxing' | 'cycling') {
    if (this.player.stamina < 30) {
      this.showToast('TOO TIRED', 'Rest and recover stamina before working out', 'warning');
      return;
    }

    this.player.stamina = Math.max(0, this.player.stamina - 35);

    if (activity === 'weights') {
      this.player.muscle = Math.min(100, this.player.muscle + 2.5);
      this.player.bodyFat = Math.max(5, this.player.bodyFat - 1.0);
      this.player.meleeSkill = Math.min(100, this.player.meleeSkill + 1.5);
      this.showToast('WEIGHT BENCH SESSION', '+2.5 Muscle • -1.0% Body Fat', 'success');
    } else if (activity === 'treadmill') {
      this.player.staminaSkill = Math.min(100, this.player.staminaSkill + 3.0);
      this.player.maxStamina = Math.min(150, 100 + this.player.staminaSkill * 0.5);
      this.player.bodyFat = Math.max(5, this.player.bodyFat - 2.5);
      this.showToast('CARDIO TREADMILL COMPLETED', '+3.0 Stamina Skill • -2.5% Body Fat', 'success');
    } else if (activity === 'boxing') {
      this.player.meleeSkill = Math.min(100, this.player.meleeSkill + 3.5);
      this.player.muscle = Math.min(100, this.player.muscle + 1.2);
      this.showToast('HEAVY BAG BOXING', '+3.5 Melee Combat Skill • +1.2 Muscle', 'success');
    } else if (activity === 'cycling') {
      this.player.bicycleSkill = Math.min(100, this.player.bicycleSkill + 4.0);
      this.player.staminaSkill = Math.min(100, this.player.staminaSkill + 2.0);
      this.player.bodyFat = Math.max(5, this.player.bodyFat - 2.0);
      this.showToast('SPIN CYCLING WORKOUT', '+4.0 Cycling Skill • +2.0 Stamina', 'success');
    }
    soundEngine.playUI('complete');
    this.notify();
  }

  public increaseWeaponSkill(type: WeaponType, amount: number = 0.5) {
    if (type === 'pistol' || type === 'dual_pistols') {
      this.player.pistolSkill = Math.min(100, this.player.pistolSkill + amount);
      if (this.player.pistolSkill >= 90 && !this.player.weapons.dual_pistols.unlocked) {
        this.player.weapons.dual_pistols.unlocked = true;
        this.showToast('SKILL MASTERY UNLOCKED', 'Dual-Wield Akimbo Pistols Available!', 'success');
      }
    } else if (type === 'shotgun') {
      this.player.shotgunSkill = Math.min(100, this.player.shotgunSkill + amount);
    } else if (type === 'rifle') {
      this.player.rifleSkill = Math.min(100, this.player.rifleSkill + amount);
    } else if (type === 'smg') {
      this.player.smgSkill = Math.min(100, this.player.smgSkill + amount);
    }
  }

  public increaseVehicleSkill(type: 'car' | 'motorcycle' | 'bicycle' | 'flying' | 'boat', amount: number = 0.2) {
    if (type === 'car') {
      this.player.carSkill = Math.min(100, this.player.carSkill + amount);
    } else if (type === 'motorcycle') {
      this.player.motorcycleSkill = Math.min(100, this.player.motorcycleSkill + amount);
    } else if (type === 'bicycle') {
      this.player.bicycleSkill = Math.min(100, this.player.bicycleSkill + amount);
    }
  }

  public updateDistrict(x: number, z: number) {
    for (const d of DISTRICTS) {
      if (x >= d.bounds.minX && x <= d.bounds.maxX && z >= d.bounds.minZ && z <= d.bounds.maxZ) {
        if (this.player.currentDistrict !== d.id) {
          this.player.currentDistrict = d.id;
          this.showToast(`ENTERING ${d.name.toUpperCase()}`, d.description, 'info');
          this.notify();
        }
        return;
      }
    }
  }

  public getDistrictInfo(id: DistrictId): DistrictInfo {
    return DISTRICTS.find(d => d.id === id) || DISTRICTS[0];
  }

  public advanceTime(hoursDelta: number) {
    this.timeHour = (this.timeHour + hoursDelta) % 24;
    
    // Gradual stamina recovery
    if (this.player.stamina < this.player.maxStamina) {
      this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + hoursDelta * 120);
    }
  }

  public playDialogue(lines: DialogueLine[]) {
    this.currentDialogue = lines;
    this.dialogueIndex = 0;
    this.notify();
  }

  public nextDialogue() {
    if (!this.currentDialogue) return;
    if (this.dialogueIndex < this.currentDialogue.length - 1) {
      this.dialogueIndex++;
      this.notify();
    } else {
      this.currentDialogue = null;
      this.dialogueIndex = 0;
      this.notify();
    }
  }

  public saveGame(playerPos?: [number, number, number]) {
    try {
      const saveData: SaveGameData = {
        version: 2,
        player: this.player,
        ownedVehicles: this.ownedVehicles,
        vehicleCustomizations: this.vehicleCustomizations,
        completedMissionIds: [],
        activeMissionId: null,
        heat: this.heat,
        timeHour: this.timeHour,
        ownedProperties: this.properties.filter(p => p.owned).map(p => p.id),
        taggedGraffitiIds: [],
        factionControl: {
          riverside_union: FACTIONS.riverside_union.controlPercentage,
          iron_serpents: FACTIONS.iron_serpents.controlPercentage,
          eastside_crew: FACTIONS.eastside_crew.controlPercentage,
          black_harbor: FACTIONS.black_harbor.controlPercentage,
          night_market: FACTIONS.night_market.controlPercentage
        },
        settings: this.settings
      };
      localStorage.setItem('vanta_neon_district_save_v2', JSON.stringify(saveData));
      soundEngine.playUI('complete');
      this.showToast('PROGRESS SAVED', playerPos ? `Synced at [${Math.round(playerPos[0])}, ${Math.round(playerPos[2])}]` : 'All RPG stats & items synced', 'success');
      return true;
    } catch (e) {
      console.warn('Save failed', e);
      return false;
    }
  }

  public loadGame(): boolean {
    try {
      const raw = localStorage.getItem('vanta_neon_district_save_v2');
      if (raw) {
        const data = JSON.parse(raw) as SaveGameData;
        if (data && data.player) {
          this.player = { ...INITIAL_PLAYER_STATS, ...data.player };
          this.player.reputation = this.player.respect;
          if (data.ownedVehicles) this.ownedVehicles = data.ownedVehicles;
          if (data.vehicleCustomizations) this.vehicleCustomizations = data.vehicleCustomizations;
          if (data.settings) this.settings = { ...this.settings, ...data.settings };
          if (data.timeHour !== undefined) this.timeHour = data.timeHour;
          this.notify();
          return true;
        }
      }
      return false;
    } catch (e) {
      console.warn('Load failed', e);
      return false;
    }
  }
}

export const gameState = GameState.getInstance();
