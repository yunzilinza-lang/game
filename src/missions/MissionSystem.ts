import { Mission, Objective } from '../types';
import { gameState } from '../core/GameState';
import { soundEngine } from '../audio/SoundEngine';

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm01',
    title: 'WELCOME BACK',
    giver: 'Marcus Cole',
    description: 'Reunite with your old partner Marcus at the Riverside Garage and make a run out to East Market.',
    district: 'riverside',
    rewardMoney: 500,
    rewardRep: 10,
    currentObjectiveIndex: 0,
    status: 'available',
    startLocation: [-140, 0, 70],
    objectives: [
      {
        id: 'm01_obj1',
        text: 'Meet Marcus at Riverside Garage',
        targetPos: [-140, 1, 70],
        targetType: 'garage',
        completed: false
      },
      {
        id: 'm01_obj2',
        text: 'Enter the vehicle and drive Marcus to East Market',
        targetPos: [260, 1, 260],
        targetType: 'market',
        completed: false
      },
      {
        id: 'm01_obj3',
        text: 'Eliminate or escape the hostile ambush at East Market',
        targetPos: [260, 1, 260],
        targetType: 'npc',
        completed: false
      },
      {
        id: 'm01_obj4',
        text: 'Evade police heat and return safely to Riverside Garage',
        targetPos: [-140, 1, 70],
        targetType: 'garage',
        completed: false
      }
    ]
  },
  {
    id: 'm02',
    title: 'HOT CONTRABAND',
    giver: 'Elena Vance',
    description: 'A tuned sports car loaded with smuggled microchips is stranded at the Industrial Yard loading dock.',
    district: 'industrial',
    rewardMoney: 750,
    rewardRep: 15,
    currentObjectiveIndex: 0,
    status: 'locked',
    startLocation: [280, 0, 50],
    objectives: [
      {
        id: 'm02_obj1',
        text: 'Head to the Industrial Yard loading dock',
        targetPos: [280, 1, 50],
        targetType: 'location',
        completed: false
      },
      {
        id: 'm02_obj2',
        text: 'Secure the red Sports Car and start engine',
        targetPos: [280, 1, 50],
        targetType: 'car',
        completed: false
      },
      {
        id: 'm02_obj3',
        text: 'Deliver the vehicle intact to the Harbor Warehouse',
        targetPos: [80, 1, 320],
        targetType: 'safehouse',
        completed: false
      }
    ]
  },
  {
    id: 'm03',
    title: 'DOWNTOWN SHOWDOWN',
    giver: 'Kwon Tanaka',
    description: 'Intercept syndicate operatives outside the Downtown Financial Tower and recover stolen credentials.',
    district: 'downtown',
    rewardMoney: 1200,
    rewardRep: 25,
    currentObjectiveIndex: 0,
    status: 'locked',
    startLocation: [60, 0, 60],
    objectives: [
      {
        id: 'm03_obj1',
        text: 'Travel to Downtown Financial Plaza',
        targetPos: [60, 1, 60],
        targetType: 'location',
        completed: false
      },
      {
        id: 'm03_obj2',
        text: 'Neutralize the armed syndicate guards',
        targetPos: [60, 1, 60],
        targetType: 'npc',
        completed: false
      },
      {
        id: 'm03_obj3',
        text: 'Escape the high-heat police lockdown back to Safehouse',
        targetPos: [-180, 1, 90],
        targetType: 'safehouse',
        completed: false
      }
    ]
  }
];

class MissionSystemManager {
  public missions: Mission[] = JSON.parse(JSON.stringify(INITIAL_MISSIONS));
  public activeMission: Mission | null = null;
  public sideActivity: { type: 'race' | 'taxi'; active: boolean; timer: number; checkpointIndex: number; checkpoints: [number, number, number][] } | null = null;

  constructor() {
    // Check saved completed missions
  }

  public getActiveObjective(): Objective | null {
    if (!this.activeMission) return null;
    return this.activeMission.objectives[this.activeMission.currentObjectiveIndex] || null;
  }

  public startMission(missionId: string) {
    const mission = this.missions.find(m => m.id === missionId);
    if (!mission || mission.status === 'locked' || mission.status === 'completed') return;

    this.activeMission = mission;
    mission.status = 'active';
    mission.currentObjectiveIndex = 0;
    mission.objectives.forEach(obj => obj.completed = false);

    soundEngine.playUI('open');
    gameState.showToast(`MISSION STARTED`, mission.title, 'warning');

    if (missionId === 'm01') {
      gameState.playDialogue([
        { speaker: 'Marcus', text: 'Jayden! Man, you really came back. You look like you just walked off the night train.', avatarColor: '#38bdf8' },
        { speaker: 'Jayden', text: "Didn't have much choice, Marcus. Had to see what was left of the old district.", avatarColor: '#f59e0b' },
        { speaker: 'Marcus', text: 'Things changed fast while you were gone. East Market syndicate is running wild. Let’s head there now.', avatarColor: '#38bdf8' }
      ]);
    }
  }

  public advanceObjective() {
    if (!this.activeMission) return;
    const current = this.getActiveObjective();
    if (current) current.completed = true;

    this.activeMission.currentObjectiveIndex++;

    if (this.activeMission.currentObjectiveIndex >= this.activeMission.objectives.length) {
      this.completeMission();
    } else {
      soundEngine.playUI('checkpoint');
      const next = this.getActiveObjective();
      gameState.showToast('OBJECTIVE UPDATED', next ? next.text : '', 'info');

      // Trigger narrative hooks
      if (this.activeMission.id === 'm01' && this.activeMission.currentObjectiveIndex === 2) {
        // Hostiles appeared!
        gameState.playDialogue([
          { speaker: 'Marcus', text: 'Look out! Syndicate crew spotted our ride! Put your foot down!', avatarColor: '#38bdf8' },
          { speaker: 'Jayden', text: 'Hold on tight, Marcus!', avatarColor: '#f59e0b' }
        ]);
        gameState.increaseHeat(2);
      }
    }
  }

  public completeMission() {
    if (!this.activeMission) return;

    const mission = this.activeMission;
    mission.status = 'completed';
    this.activeMission = null;

    gameState.addMoney(mission.rewardMoney);
    gameState.addReputation(mission.rewardRep);
    gameState.player.stats.missionsCompleted++;

    soundEngine.playUI('complete');
    gameState.showToast('MISSION COMPLETE', `+$${mission.rewardMoney}  +${mission.rewardRep} REP`, 'success');

    // Unlock next mission
    if (mission.id === 'm01') {
      const m2 = this.missions.find(m => m.id === 'm02');
      if (m2 && m2.status === 'locked') m2.status = 'available';
    } else if (mission.id === 'm02') {
      const m3 = this.missions.find(m => m.id === 'm03');
      if (m3 && m3.status === 'locked') {
        m3.status = 'available';
        gameState.player.weapons.rifle.unlocked = true;
        gameState.showToast('WEAPON UNLOCKED', 'Viper-AR Carbine is now available', 'warning');
      }
    }

    gameState.notify();
  }

  public failMission(reason: string = 'Mission Failed') {
    if (!this.activeMission) return;
    gameState.showToast('MISSION FAILED', reason, 'danger');
    this.activeMission.status = 'available';
    this.activeMission.currentObjectiveIndex = 0;
    this.activeMission = null;
    gameState.notify();
  }

  // --- Street Race Side Activity ---
  public startStreetRace() {
    this.sideActivity = {
      type: 'race',
      active: true,
      timer: 55,
      checkpointIndex: 0,
      checkpoints: [
        [-100, 1, 70],
        [-30, 1, 70],
        [40, 1, 100],
        [120, 1, 70],
        [160, 1, 140],
        [60, 1, 160],
        [-60, 1, 120],
        [-100, 1, 70]
      ]
    };
    soundEngine.playUI('checkpoint');
    gameState.showToast('STREET SPRINT STARTED', 'Pass through all checkpoint gates before time runs out!', 'warning');
  }

  public advanceRaceCheckpoint() {
    if (!this.sideActivity || this.sideActivity.type !== 'race') return;
    this.sideActivity.checkpointIndex++;
    soundEngine.playUI('checkpoint');

    if (this.sideActivity.checkpointIndex >= this.sideActivity.checkpoints.length) {
      // Race victory
      this.sideActivity.active = false;
      this.sideActivity = null;
      gameState.addMoney(400);
      gameState.addReputation(8);
      soundEngine.playUI('complete');
      gameState.showToast('RACE WON!', '+$400 Prize Money Earned', 'success');
    }
  }

  public cancelSideActivity() {
    this.sideActivity = null;
  }
}

export const missionSystem = new MissionSystemManager();
