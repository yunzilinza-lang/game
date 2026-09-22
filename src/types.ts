export type DistrictId = 
  | 'riverside'
  | 'downtown'
  | 'industrial'
  | 'east_market'
  | 'harbor'
  | 'hillside'
  | 'old_quarter'
  | 'airport'
  | 'port_astra'
  | 'nova_heights'
  | 'countryside';

export interface DistrictInfo {
  id: DistrictId;
  name: string;
  description: string;
  color: string;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  theme: string;
  faction?: FactionId;
}

export type FactionId = 
  | 'riverside_union' 
  | 'iron_serpents' 
  | 'eastside_crew' 
  | 'black_harbor' 
  | 'night_market';

export interface FactionInfo {
  id: FactionId;
  name: string;
  color: string;
  territoryName: string;
  description: string;
  controlPercentage: number;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type WeatherType = 'clear' | 'cloudy' | 'rain';

export type WeaponType = 'fists' | 'pistol' | 'shotgun' | 'smg' | 'rifle' | 'dual_pistols' | 'spray_can';

export interface WeaponData {
  id: WeaponType;
  name: string;
  damage: number;
  fireRate: number; // ms between shots
  range: number;
  ammo: number;
  maxAmmo: number;
  magSize: number;
  magAmmo: number;
  unlocked: boolean;
}

export type VehicleModel = 
  | 'compact' 
  | 'sedan' 
  | 'sports' 
  | 'pickup' 
  | 'motorcycle' 
  | 'police' 
  | 'ambulance' 
  | 'bicycle' 
  | 'van';

export interface VehicleCustomization {
  primaryColor: string;
  secondaryColor: string;
  finish: 'glossy' | 'metallic' | 'matte';
  wheelStyle: 'standard' | 'sport_alloy' | 'chrome_spoke' | 'dark_mesh';
  spoiler: boolean;
  hasNitro: boolean;
  hasHydraulics: boolean;
  tintLevel: number;
}

export interface VehicleStats {
  model: VehicleModel;
  name: string;
  maxSpeed: number;
  acceleration: number;
  handling: number;
  weight: number;
  maxHealth: number;
  color: string;
  price: number;
  unlocked: boolean;
}

export type MeleeStyle = 'boxing' | 'martial_arts' | 'street_fighting';

export interface PlayerStats {
  name: string;
  health: number;
  maxHealth: number;
  armor: number;
  maxArmor: number;
  stamina: number;
  maxStamina: number;
  oxygen: number;
  maxOxygen: number;
  money: number;
  
  // Body Stats (0-100)
  muscle: number;
  bodyFat: number;
  bodyWeight: number; // kg
  hunger: number;     // 0-100
  
  // RPG Skills (0-100)
  staminaSkill: number;
  lungCapacitySkill: number;
  
  // Weapon Skills (0-100)
  pistolSkill: number;
  shotgunSkill: number;
  smgSkill: number;
  rifleSkill: number;
  
  // Vehicle Skills (0-100)
  carSkill: number;
  motorcycleSkill: number;
  bicycleSkill: number;
  flyingSkill: number;
  boatingSkill: number;
  
  // Combat Style
  meleeStyle: MeleeStyle;
  meleeSkill: number;
  
  // Social
  respect: number;
  reputation?: number;
  charisma: number;
  
  // Customization
  jacketColor: string;
  pantsColor: string;
  shoesColor: string;
  shirtColor: string;
  hatType: 'none' | 'beanie' | 'cap' | 'fedora';
  glassesType: 'none' | 'aviators' | 'sunglasses' | 'tactical_shades';
  hairStyle: 'fade' | 'short' | 'textured' | 'shaved' | 'dreads';
  hairColor: string;
  tattoos: string[];
  
  currentWeapon: WeaponType;
  weapons: Record<WeaponType, WeaponData>;
  currentDistrict: DistrictId;
  inVehicle: boolean;
  activeVehicleId: string | null;
  
  stats: {
    missionsCompleted: number;
    policeEscaped: number;
    enemiesDefeated: number;
    graffitiTagged: number;
    stuntsCompleted: number;
    racesWon: number;
    sideJobsCompleted: number;
    distanceTraveledKm: number;
    maxSpeedKmH: number;
  };
}

export interface PropertyItem {
  id: string;
  name: string;
  type: 'safehouse' | 'garage' | 'business' | 'apartment';
  price: number;
  dailyIncome: number;
  district: DistrictId;
  position: [number, number, number];
  owned: boolean;
  description: string;
}

export interface CollectibleGraffiti {
  id: string;
  position: [number, number, number];
  rotationY: number;
  owner: 'player' | 'iron_serpents' | 'neutral' | 'eastside_crew';
  isTaggedByPlayer: boolean;
  district: DistrictId;
}

export interface SideJobState {
  type: 'paramedic' | 'taxi' | 'courier' | 'vigilante' | 'none';
  level: number;
  passengersDelivered: number;
  targetPos?: [number, number, number];
  timeRemaining?: number;
  rewardEarned: number;
}

export interface Objective {
  id: string;
  text: string;
  targetPos?: [number, number, number];
  targetType?: 'location' | 'car' | 'npc' | 'garage' | 'safehouse' | 'market' | 'tag' | 'gym' | 'restaurant';
  completed: boolean;
}

export interface Mission {
  id: string;
  title: string;
  giver: string;
  description: string;
  district: DistrictId;
  rewardMoney: number;
  rewardRep: number;
  currentObjectiveIndex: number;
  objectives: Objective[];
  status: 'locked' | 'available' | 'active' | 'completed' | 'failed';
  startLocation: [number, number, number];
}

export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  frequency: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  avatarColor?: string;
}

export interface CompanionAlly {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  state: 'follow' | 'stay' | 'attack' | 'in_vehicle';
  weapon: WeaponType;
  faction: FactionId;
}

export interface GameSettings {
  mouseSensitivity: number;
  invertY: boolean;
  cameraDistance: number;
  sprintMode: 'toggle' | 'hold';
  aimMode: 'toggle' | 'hold';
  crouchMode: 'toggle' | 'hold';
  shiftLock: boolean;
  mobileControls: boolean;
  soundVolume: number;
  musicVolume: number;
}

export interface SaveGameData {
  version: number;
  player: PlayerStats;
  ownedVehicles: VehicleModel[];
  vehicleCustomizations: Partial<Record<VehicleModel, VehicleCustomization>>;
  completedMissionIds: string[];
  activeMissionId: string | null;
  heat: number;
  timeHour: number;
  ownedProperties: string[];
  taggedGraffitiIds: string[];
  factionControl: Record<FactionId, number>;
  settings: GameSettings;
}
