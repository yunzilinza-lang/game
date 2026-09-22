import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator';

export interface WorldCollider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  height: number;
  type: 'building' | 'wall' | 'prop';
}

export interface LandmarkLocation {
  id: string;
  name: string;
  type: 'safehouse' | 'garage' | 'shop' | 'mission' | 'marker' | 'gym' | 'food' | 'barber' | 'tattoo' | 'arcade' | 'property' | 'academy';
  position: [number, number, number];
  description?: string;
  price?: number;
}

export class CityBuilder {
  public colliders: WorldCollider[] = [];
  public streetLights: THREE.PointLight[] = [];
  public neonLights: THREE.PointLight[] = [];
  public aviationLights: THREE.Mesh[] = [];

  public landmarks: LandmarkLocation[] = [
    { id: 'safehouse_riverside', name: 'Jayden’s Safehouse', type: 'safehouse', position: [-170, 0, 80] },
    { id: 'garage_riverside', name: 'Riverside Tuning Garage', type: 'garage', position: [-135, 0, 70] },
    { id: 'gym_ironcore', name: 'Iron Core Fitness Gym', type: 'gym', position: [-140, 0, 110], description: 'Train strength, stamina & boxing' },
    { id: 'food_bunblaze', name: 'Bun & Blaze Burger Bar', type: 'food', position: [-105, 0, 80], description: 'Fast food, heavy meals & milkshakes' },
    { id: 'food_pizzaloop', name: 'Pizza Loop Gourmet', type: 'food', position: [70, 0, 85], description: 'Artisanal slices & pasta' },
    { id: 'shop_threadline', name: 'Threadline Urban Apparel', type: 'shop', position: [-115, 0, 95], description: 'Streetwear, jackets & designer sneakers' },
    { id: 'barber_fade', name: 'Fade & Blade Barbershop', type: 'barber', position: [-125, 0, 85], description: 'Fresh cuts, fades & hair styling' },
    { id: 'tattoo_ink', name: 'Vanta Ink Tattoo Studio', type: 'tattoo', position: [-105, 0, 110], description: 'Custom body art & faction sleeves' },
    { id: 'arcade_neon', name: 'Star Runner Arcade Lounge', type: 'arcade', position: [85, 0, 70], description: 'Play retro 8-bit arcade machines' },
    { id: 'academy_driving', name: 'Apex Driving Academy', type: 'academy', position: [-220, 0, -60], description: 'Master precision driving & racing tests' },
    { id: 'property_loft', name: 'Skyview Luxury Penthouse', type: 'property', position: [50, 0, -80], price: 12000, description: 'High-rise apartment with skyline view' },
    { id: 'property_warehouse', name: 'Harbor Bay Logistics', type: 'property', position: [280, 0, 190], price: 8500, description: 'Commercial business + $350 daily income' },
    { id: 'downtown_plaza', name: 'Nexus Financial Plaza', type: 'mission', position: [60, 0, 60] },
    { id: 'east_market_center', name: 'East Market Grand Bazaar', type: 'mission', position: [260, 0, 260] },
    { id: 'industrial_dock', name: 'Industrial Dock 4 Docks', type: 'mission', position: [280, 0, 50] },
  ];

  public buildCity(scene: THREE.Scene): { roadMesh: THREE.Mesh; groundMesh: THREE.Mesh } {
    // 1. Vast Terrain Base & Grass/Park Zones
    const groundGeo = new THREE.PlaneGeometry(1200, 1200);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // urban pavement/base
      roughness: 0.9,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.05;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Lush Green Park Terrains in Riverside and Suburbs
    const parkMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.85 });
    const parkZones = [
      { x: -210, z: 90, w: 90, d: 110 },
      { x: 70, z: -160, w: 100, d: 80 },
    ];
    parkZones.forEach(pz => {
      const pGeo = new THREE.PlaneGeometry(pz.w, pz.d);
      const pMesh = new THREE.Mesh(pGeo, parkMat);
      pMesh.rotation.x = -Math.PI / 2;
      pMesh.position.set(pz.x, 0.02, pz.z);
      pMesh.receiveShadow = true;
      scene.add(pMesh);
    });

    // Ocean Water Plane (South Harbor)
    const waterGeo = new THREE.PlaneGeometry(1400, 450);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.15,
      metalness: 0.8,
      transparent: true,
      opacity: 0.88
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(0, -0.35, 520);
    scene.add(waterMesh);

    // 2. Road Network with Procedural Asphalt & Sidewalks
    this.buildRoadsAndIntersections(scene);

    // 3. Buildings by District Archetype
    this.buildDowntownSkyscrapers(scene);
    this.buildRiversideResidential(scene);
    this.buildIndustrialDistrict(scene);
    this.buildEastMarketDistrict(scene);
    this.buildOldQuarterDistrict(scene);
    this.buildHarborWaterfront(scene);

    // 4. Detailed Urban Props & Trees
    this.buildUrbanProps(scene);

    return { roadMesh: groundMesh, groundMesh };
  }

  // --- Roads, Sidewalks, & Intersections ---
  private buildRoadsAndIntersections(scene: THREE.Scene) {
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.75,
      metalness: 0.1
    });

    const sidewalkMat = new THREE.MeshStandardMaterial({
      map: TextureGenerator.createSidewalkTexture(),
      roughness: 0.85,
    });
    sidewalkMat.map?.repeat.set(12, 12);

    const crosswalkMat = new THREE.MeshStandardMaterial({
      map: TextureGenerator.createCrosswalkTexture(),
      roughness: 0.8,
    });

    const roadGroup = new THREE.Group();

    // Major Grid Lines
    const ewAvenuesZ = [-180, -70, 70, 180, 300];
    const nsBoulevardsX = [-180, -70, 70, 180, 300];
    const roadWidth = 20;

    // East-West Avenues
    ewAvenuesZ.forEach(z => {
      // Road surface
      const roadGeo = new THREE.PlaneGeometry(1000, roadWidth);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(50, 0.03, z);
      road.receiveShadow = true;
      roadGroup.add(road);

      // Yellow double center stripe
      const centerStripeGeo = new THREE.PlaneGeometry(1000, 0.4);
      const centerStripe = new THREE.Mesh(centerStripeGeo, new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      centerStripe.rotation.x = -Math.PI / 2;
      centerStripe.position.set(50, 0.04, z);
      roadGroup.add(centerStripe);

      // White lane dashes (North & South lanes)
      const dashGeo = new THREE.PlaneGeometry(1000, 0.25);
      const dashMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
      const dashN = new THREE.Mesh(dashGeo, dashMat);
      dashN.rotation.x = -Math.PI / 2;
      dashN.position.set(50, 0.04, z - 4.5);
      roadGroup.add(dashN);

      const dashS = new THREE.Mesh(dashGeo, dashMat);
      dashS.rotation.x = -Math.PI / 2;
      dashS.position.set(50, 0.04, z + 4.5);
      roadGroup.add(dashS);

      // Raised Sidewalks with curbs
      const swGeo = new THREE.BoxGeometry(1000, 0.22, 3.5);
      const swN = new THREE.Mesh(swGeo, sidewalkMat);
      swN.position.set(50, 0.11, z - (roadWidth / 2 + 1.75));
      swN.receiveShadow = true;
      roadGroup.add(swN);

      const swS = new THREE.Mesh(swGeo, sidewalkMat);
      swS.position.set(50, 0.11, z + (roadWidth / 2 + 1.75));
      swS.receiveShadow = true;
      roadGroup.add(swS);
    });

    // North-South Boulevards
    nsBoulevardsX.forEach(x => {
      // Road surface
      const roadGeo = new THREE.PlaneGeometry(roadWidth, 1000);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(x, 0.035, 50);
      road.receiveShadow = true;
      roadGroup.add(road);

      // Center stripe
      const centerStripeGeo = new THREE.PlaneGeometry(0.4, 1000);
      const centerStripe = new THREE.Mesh(centerStripeGeo, new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      centerStripe.rotation.x = -Math.PI / 2;
      centerStripe.position.set(x, 0.045, 50);
      roadGroup.add(centerStripe);

      // Raised Sidewalks
      const swGeo = new THREE.BoxGeometry(3.5, 0.22, 1000);
      const swW = new THREE.Mesh(swGeo, sidewalkMat);
      swW.position.set(x - (roadWidth / 2 + 1.75), 0.11, 50);
      swW.receiveShadow = true;
      roadGroup.add(swW);

      const swE = new THREE.Mesh(swGeo, sidewalkMat);
      swE.position.set(x + (roadWidth / 2 + 1.75), 0.11, 50);
      swE.receiveShadow = true;
      roadGroup.add(swE);
    });

    // Crosswalks at all intersections
    ewAvenuesZ.forEach(z => {
      nsBoulevardsX.forEach(x => {
        // 4 crosswalk segments per intersection
        const cwOffsets = [
          { dx: 0, dz: -12, w: 18, d: 3 },
          { dx: 0, dz: 12, w: 18, d: 3 },
          { dx: -12, dz: 0, w: 3, d: 18 },
          { dx: 12, dz: 0, w: 3, d: 18 },
        ];

        cwOffsets.forEach(c => {
          const cwGeo = new THREE.PlaneGeometry(c.w, c.d);
          const cwMesh = new THREE.Mesh(cwGeo, crosswalkMat);
          cwMesh.rotation.x = -Math.PI / 2;
          cwMesh.position.set(x + c.dx, 0.048, z + c.dz);
          roadGroup.add(cwMesh);
        });
      });
    });

    scene.add(roadGroup);
  }

  // --- Downtown Skyscraper Architecture ---
  private buildDowntownSkyscrapers(scene: THREE.Scene) {
    const glassCyanTex = TextureGenerator.createSkyscraperFacadeTexture('cyan');
    glassCyanTex.repeat.set(4, 8);
    const glassAmberTex = TextureGenerator.createSkyscraperFacadeTexture('amber');
    glassAmberTex.repeat.set(4, 8);
    const glassBlueTex = TextureGenerator.createSkyscraperFacadeTexture('blue');
    glassBlueTex.repeat.set(4, 8);

    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.75 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const redLightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    const towers = [
      { x: 0, z: 0, w: 68, d: 68, h: 110, tex: glassCyanTex, name: 'VANTA FINANCIAL TOWER', sub: 'Global Holdings' },
      { x: 120, z: 0, w: 58, d: 64, h: 140, tex: glassBlueTex, name: 'CYBERDYNE SYSTEMS', sub: 'Tech Innovation' },
      { x: 0, z: 120, w: 64, d: 58, h: 95, tex: glassAmberTex, name: 'NEXUS COMMERCE BANK', sub: 'Asset Management' },
      { x: 120, z: 120, w: 60, d: 60, h: 125, tex: glassCyanTex, name: 'METRO EMPIRE PLAZA', sub: 'Executive Suites' },
      { x: 60, z: -35, w: 32, d: 32, h: 75, tex: glassBlueTex, name: 'HOTEL LUXURY VANTA', sub: '5-Star Penthouse' },
    ];

    towers.forEach(t => {
      // 1. Podium Base (Ground floor entrance & retail)
      const baseHeight = 8;
      const baseGeo = new THREE.BoxGeometry(t.w + 6, baseHeight, t.d + 6);
      const baseMesh = new THREE.Mesh(baseGeo, concreteMat);
      baseMesh.position.set(t.x, baseHeight / 2, t.z);
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      scene.add(baseMesh);

      // Glass entrance awning
      const awningGeo = new THREE.BoxGeometry(16, 0.6, 6);
      const awning = new THREE.Mesh(awningGeo, metalMat);
      awning.position.set(t.x, 4.2, t.z + t.d / 2 + 3.2);
      scene.add(awning);

      // 2. Main Tower Shaft with detailed window facade
      const shaftMat = new THREE.MeshStandardMaterial({
        map: t.tex,
        roughness: 0.25,
        metalness: 0.8,
      });
      const shaftGeo = new THREE.BoxGeometry(t.w, t.h, t.d);
      const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
      shaftMesh.position.set(t.x, t.h / 2 + baseHeight, t.z);
      shaftMesh.castShadow = true;
      shaftMesh.receiveShadow = true;
      scene.add(shaftMesh);

      // 3. Step-Back Tier (Upper Penthouse section)
      const tierH = t.h * 0.3;
      const tierGeo = new THREE.BoxGeometry(t.w * 0.75, tierH, t.d * 0.75);
      const tierMesh = new THREE.Mesh(tierGeo, shaftMat);
      tierMesh.position.set(t.x, baseHeight + t.h + tierH / 2, t.z);
      tierMesh.castShadow = true;
      scene.add(tierMesh);

      // 4. Rooftop Mechanical Penthouse & Helipad
      const roofY = baseHeight + t.h + tierH;
      const roofGeo = new THREE.BoxGeometry(t.w * 0.5, 4, t.d * 0.5);
      const roofMesh = new THREE.Mesh(roofGeo, concreteMat);
      roofMesh.position.set(t.x, roofY + 2, t.z);
      scene.add(roofMesh);

      // Helipad "H" Marking
      const heliGeo = new THREE.RingGeometry(4, 5.5, 16);
      const heliMesh = new THREE.Mesh(heliGeo, new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide }));
      heliMesh.rotation.x = -Math.PI / 2;
      heliMesh.position.set(t.x, roofY + 4.05, t.z);
      scene.add(heliMesh);

      // Rooftop AC Coolers / Chiller Units
      for (let ac = 0; ac < 3; ac++) {
        const acGeo = new THREE.BoxGeometry(4, 2.5, 3.5);
        const acMesh = new THREE.Mesh(acGeo, metalMat);
        acMesh.position.set(t.x + (ac - 1) * 6, roofY + 1.25, t.z + t.d * 0.28);
        scene.add(acMesh);
      }

      // Antenna Mast with Flashing Red Aviation Beacon
      const mastGeo = new THREE.CylinderGeometry(0.25, 0.6, 18, 8);
      const mastMesh = new THREE.Mesh(mastGeo, metalMat);
      mastMesh.position.set(t.x, roofY + 13, t.z);
      scene.add(mastMesh);

      const beaconGeo = new THREE.SphereGeometry(0.6, 8, 8);
      const beaconMesh = new THREE.Mesh(beaconGeo, redLightMat);
      beaconMesh.position.set(t.x, roofY + 22, t.z);
      scene.add(beaconMesh);
      this.aviationLights.push(beaconMesh);

      // 5. Giant Illuminated Neon Billboard
      const billMat = new THREE.MeshBasicMaterial({
        map: TextureGenerator.createNeonBillboardTexture(t.name, t.sub, '#090d16', '#38bdf8'),
      });
      const billGeo = new THREE.PlaneGeometry(t.w * 0.75, 12);
      const billMesh = new THREE.Mesh(billGeo, billMat);
      billMesh.position.set(t.x, t.h * 0.75 + baseHeight, t.z + t.d / 2 + 0.1);
      scene.add(billMesh);

      // Neon Accent Glow PointLight
      const nLight = new THREE.PointLight(0x38bdf8, 1.2, 35);
      nLight.position.set(t.x, t.h * 0.75 + baseHeight, t.z + t.d / 2 + 3);
      scene.add(nLight);
      this.neonLights.push(nLight);

      // Colliders
      this.addCollider(t.x, t.z, t.w + 6, t.d + 6, t.h + baseHeight + tierH);
    });
  }

  // --- Riverside Residential, Jayden's Safehouse, & Shops ---
  private buildRiversideResidential(scene: THREE.Scene) {
    const wallStuccoMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
    const woodRoofMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.7 });
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.85 });
    const garageDoorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 });
    const windowGlassMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.2,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.25
    });

    // 1. Jayden's Safehouse (2-Story Modern Villa with Balcony)
    const shX = -170, shZ = 80;
    // Ground Floor
    const shBaseGeo = new THREE.BoxGeometry(24, 5, 20);
    const shBase = new THREE.Mesh(shBaseGeo, wallStuccoMat);
    shBase.position.set(shX, 2.5, shZ);
    shBase.castShadow = true;
    shBase.receiveShadow = true;
    scene.add(shBase);

    // Second Floor
    const shFloor2Geo = new THREE.BoxGeometry(20, 4.5, 16);
    const shFloor2 = new THREE.Mesh(shFloor2Geo, new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.7 }));
    shFloor2.position.set(shX - 2, 7.25, shZ - 2);
    shFloor2.castShadow = true;
    scene.add(shFloor2);

    // Second Floor Balcony Railing
    const railGeo = new THREE.BoxGeometry(18, 1.1, 0.2);
    const railMesh = new THREE.Mesh(railGeo, darkWoodMat);
    railMesh.position.set(shX - 2, 5.55, shZ + 6);
    scene.add(railMesh);

    // Pitched Modern Roof
    const roofGeo = new THREE.ConeGeometry(16, 4.5, 4);
    const roof = new THREE.Mesh(roofGeo, woodRoofMat);
    roof.position.set(shX - 2, 11.5, shZ - 2);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);

    // Safehouse Neon Signboard
    const shSignMat = new THREE.MeshBasicMaterial({
      map: TextureGenerator.createNeonBillboardTexture('SAFEHOUSE', 'Cross Residence • Armory', '#022c22', '#22c55e')
    });
    const shSign = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.5), shSignMat);
    shSign.position.set(shX, 7, shZ + 10.1);
    scene.add(shSign);

    const shGlow = new THREE.PointLight(0x22c55e, 1.5, 25);
    shGlow.position.set(shX, 7, shZ + 12);
    scene.add(shGlow);
    this.neonLights.push(shGlow);

    this.addCollider(shX, shZ, 24, 20, 12);

    // 2. Riverside Mod & Tuning Garage
    const garX = -135, garZ = 70;
    const garGeo = new THREE.BoxGeometry(26, 7.5, 24);
    const garMesh = new THREE.Mesh(garGeo, new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 }));
    garMesh.position.set(garX, 3.75, garZ);
    garMesh.castShadow = true;
    scene.add(garMesh);

    // Garage Bay Shutter Doors
    for (let bay = 0; bay < 2; bay++) {
      const doorGeo = new THREE.PlaneGeometry(8, 5.5);
      const door = new THREE.Mesh(doorGeo, garageDoorMat);
      door.position.set(garX - 5 + bay * 10, 2.75, garZ + 12.05);
      scene.add(door);
    }

    const garSignMat = new THREE.MeshBasicMaterial({
      map: TextureGenerator.createNeonBillboardTexture('RIVERSIDE MOTORS', 'Performance Tuning & Body Shop', '#082f49', '#06b6d4')
    });
    const garSign = new THREE.Mesh(new THREE.PlaneGeometry(12, 3.5), garSignMat);
    garSign.position.set(garX, 6.8, garZ + 12.1);
    scene.add(garSign);

    this.addCollider(garX, garZ, 26, 24, 7.5);

    // 3. Vanta Threads Boutique & Neon Bite Diner
    const shopX = -115, shopZ = 90;
    const shopGeo = new THREE.BoxGeometry(18, 8, 16);
    const shopMesh = new THREE.Mesh(shopGeo, new THREE.MeshStandardMaterial({ color: 0x1e1b4b }));
    shopMesh.position.set(shopX, 4, shopZ);
    shopMesh.castShadow = true;
    scene.add(shopMesh);

    const shopSignMat = new THREE.MeshBasicMaterial({
      map: TextureGenerator.createNeonBillboardTexture('VANTA THREADS', 'Streetwear & Tactical Apparel', '#18181b', '#ec4899')
    });
    const shopSign = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.2), shopSignMat);
    shopSign.position.set(shopX, 6.5, shopZ + 8.1);
    scene.add(shopSign);
    this.addCollider(shopX, shopZ, 18, 16, 8);

    // Diner
    const dinerX = -110, dinerZ = 55;
    const dinerGeo = new THREE.BoxGeometry(18, 6.5, 18);
    const dinerMesh = new THREE.Mesh(dinerGeo, new THREE.MeshStandardMaterial({ color: 0x7c2d12 }));
    dinerMesh.position.set(dinerX, 3.25, dinerZ);
    dinerMesh.castShadow = true;
    scene.add(dinerMesh);

    const dinerSignMat = new THREE.MeshBasicMaterial({
      map: TextureGenerator.createNeonBillboardTexture('NEON BITE', '24/7 All-American Diner & Coffee', '#450a0a', '#ef4444')
    });
    const dinerSign = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.2), dinerSignMat);
    dinerSign.position.set(dinerX, 5.5, dinerZ + 9.1);
    scene.add(dinerSign);
    this.addCollider(dinerX, dinerZ, 18, 18, 6.5);

    // 4. Row Townhouses with Porches & Fences
    for (let i = 0; i < 6; i++) {
      const hx = -135 - (i % 3) * 36;
      const hz = 125 + Math.floor(i / 3) * 35;

      const houseGeo = new THREE.BoxGeometry(18, 8.5, 18);
      const houseMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xf1f5f9 : 0xfef3c7,
        roughness: 0.8
      });
      const house = new THREE.Mesh(houseGeo, houseMat);
      house.position.set(hx, 4.25, hz);
      house.castShadow = true;
      house.receiveShadow = true;
      scene.add(house);

      // Roof
      const hRoofGeo = new THREE.ConeGeometry(14, 4.5, 4);
      const hRoof = new THREE.Mesh(hRoofGeo, woodRoofMat);
      hRoof.position.set(hx, 10.75, hz);
      hRoof.rotation.y = Math.PI / 4;
      hRoof.castShadow = true;
      scene.add(hRoof);

      // Windows
      for (let w = 0; w < 2; w++) {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5), windowGlassMat);
        win.position.set(hx - 4 + w * 8, 5, hz + 9.05);
        scene.add(win);
      }

      this.addCollider(hx, hz, 18, 18, 8.5);
    }
  }

  // --- Industrial Yard: Warehouses, Shipping Cranes, Containers ---
  private buildIndustrialDistrict(scene: THREE.Scene) {
    const metalCorrugatedMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.65,
      roughness: 0.45
    });
    const craneYellowMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.5 });
    const rustMetalMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });

    // 1. Large Warehouses with Barrel Vault Roofs
    for (let i = 0; i < 4; i++) {
      const wx = 230 + (i % 2) * 85;
      const wz = 20 + Math.floor(i / 2) * 85;

      const wGeo = new THREE.BoxGeometry(60, 16, 50);
      const wMesh = new THREE.Mesh(wGeo, metalCorrugatedMat);
      wMesh.position.set(wx, 8, wz);
      wMesh.castShadow = true;
      scene.add(wMesh);

      // Barrel Curved Roof
      const crGeo = new THREE.CylinderGeometry(30, 30, 60, 16, 1, false, 0, Math.PI);
      const crMesh = new THREE.Mesh(crGeo, rustMetalMat);
      crMesh.rotation.z = Math.PI / 2;
      crMesh.rotation.y = Math.PI / 2;
      crMesh.position.set(wx, 16, wz);
      crMesh.castShadow = true;
      scene.add(crMesh);

      // Loading Dock Bay Doors
      const bayGeo = new THREE.PlaneGeometry(12, 8);
      const bayDoor = new THREE.Mesh(bayGeo, new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
      bayDoor.position.set(wx, 4, wz + 25.1);
      scene.add(bayDoor);

      this.addCollider(wx, wz, 60, 50, 20);
    }

    // 2. Shipping Harbor Crane
    const craneX = 310, craneZ = 120;
    const legGeo = new THREE.BoxGeometry(2, 38, 2);
    for (let l = 0; l < 4; l++) {
      const leg = new THREE.Mesh(legGeo, craneYellowMat);
      leg.position.set(craneX + (l % 2 === 0 ? -10 : 10), 19, craneZ + (l < 2 ? -10 : 10));
      scene.add(leg);
    }
    // Crane Top Horizontal Boom
    const boomGeo = new THREE.BoxGeometry(65, 4, 6);
    const boom = new THREE.Mesh(boomGeo, craneYellowMat);
    boom.position.set(craneX, 40, craneZ);
    boom.castShadow = true;
    scene.add(boom);

    // 3. Multi-tier Stacked Shipping Containers
    const containerColors = [0xef4444, 0x2563eb, 0xd97706, 0x16a34a, 0x0284c7];
    for (let c = 0; c < 24; c++) {
      const cx = 205 + (c * 13) % 120;
      const cz = 95 + (c * 9) % 65;
      const stacks = (c % 3) + 1;
      const colHeight = stacks * 3.4;

      const cGeo = new THREE.BoxGeometry(14, colHeight, 5.2);
      const cMat = new THREE.MeshStandardMaterial({
        color: containerColors[c % containerColors.length],
        metalness: 0.5,
        roughness: 0.5
      });
      const cMesh = new THREE.Mesh(cGeo, cMat);
      cMesh.position.set(cx, colHeight / 2, cz);
      cMesh.castShadow = true;
      cMesh.receiveShadow = true;
      scene.add(cMesh);

      this.addCollider(cx, cz, 14, 5.2, colHeight);
    }
  }

  // --- East Market District: Bazaar Stalls, Glowing Lanterns, Canopies ---
  private buildEastMarketDistrict(scene: THREE.Scene) {
    const woodStallMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
    const canopyColors = [0xef4444, 0xf59e0b, 0x10b981, 0x6366f1, 0xec4899];

    for (let s = 0; s < 16; s++) {
      const sx = 215 + (s % 4) * 32;
      const sz = 215 + Math.floor(s / 4) * 34;

      // Stall Base Counter
      const sGeo = new THREE.BoxGeometry(12, 3.5, 9);
      const sMesh = new THREE.Mesh(sGeo, woodStallMat);
      sMesh.position.set(sx, 1.75, sz);
      sMesh.castShadow = true;
      scene.add(sMesh);

      // Striped Fabric Canopy
      const canopyGeo = new THREE.ConeGeometry(9, 3.8, 4);
      const canopyMat = new THREE.MeshStandardMaterial({
        color: canopyColors[s % canopyColors.length],
        roughness: 0.6
      });
      const cMesh = new THREE.Mesh(canopyGeo, canopyMat);
      cMesh.position.set(sx, 5.4, sz);
      cMesh.rotation.y = Math.PI / 4;
      cMesh.castShadow = true;
      scene.add(cMesh);

      // Hanging Red / Gold Lanterns
      const lanternGeo = new THREE.SphereGeometry(0.5, 8, 8);
      const lanternMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.position.set(sx, 4.2, sz + 4.6);
      scene.add(lantern);

      const lanternLight = new THREE.PointLight(0xf59e0b, 0.8, 14);
      lanternLight.position.set(sx, 4.2, sz + 4.6);
      scene.add(lanternLight);
      this.neonLights.push(lanternLight);

      this.addCollider(sx, sz, 12, 9, 5.5);
    }
  }

  // --- Old Quarter: Historic Brick Storefronts ---
  private buildOldQuarterDistrict(scene: THREE.Scene) {
    const brickTex = TextureGenerator.createBrickFacadeTexture();
    brickTex.repeat.set(2, 2);

    const brickMat = new THREE.MeshStandardMaterial({
      map: brickTex,
      roughness: 0.85,
    });
    const stoneTrimMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.7 });

    for (let o = 0; o < 8; o++) {
      const ox = -25 + (o % 4) * 48;
      const oz = -135 - Math.floor(o / 4) * 48;
      const bH = 24 + (o % 3) * 6;

      const bGeo = new THREE.BoxGeometry(34, bH, 30);
      const bMesh = new THREE.Mesh(bGeo, brickMat);
      bMesh.position.set(ox, bH / 2, oz);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      scene.add(bMesh);

      // Decorative Classical Cornice Roof Trim
      const corniceGeo = new THREE.BoxGeometry(36, 1.8, 32);
      const cornice = new THREE.Mesh(corniceGeo, stoneTrimMat);
      cornice.position.set(ox, bH + 0.9, oz);
      scene.add(cornice);

      // Ground Floor Fabric Storefront Awning
      const awnGeo = new THREE.BoxGeometry(18, 1.2, 4);
      const awn = new THREE.Mesh(awnGeo, new THREE.MeshStandardMaterial({ color: 0x1e3a8a }));
      awn.position.set(ox, 4.5, oz + 15.5);
      scene.add(awn);

      this.addCollider(ox, oz, 34, 30, bH);
    }
  }

  // --- Harbor Waterfront Piers & Promenade ---
  private buildHarborWaterfront(scene: THREE.Scene) {
    const pierPlankMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.9 });
    const woodPoleMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.95 });

    for (let p = 0; p < 4; p++) {
      const px = -30 + p * 65;
      const pz = 285;

      // Pier Deck
      const deckGeo = new THREE.BoxGeometry(26, 1.5, 90);
      const deck = new THREE.Mesh(deckGeo, pierPlankMat);
      deck.position.set(px, 0.75, pz);
      deck.receiveShadow = true;
      scene.add(deck);

      // Wooden Support Pylons
      for (let py = 0; py < 6; py++) {
        const pylonGeo = new THREE.CylinderGeometry(0.6, 0.6, 6, 8);
        const pylonL = new THREE.Mesh(pylonGeo, woodPoleMat);
        pylonL.position.set(px - 11, -1.5, pz - 35 + py * 14);
        scene.add(pylonL);

        const pylonR = new THREE.Mesh(pylonGeo, woodPoleMat);
        pylonR.position.set(px + 11, -1.5, pz - 35 + py * 14);
        scene.add(pylonR);
      }

      // Mooring Bollards
      const bollardGeo = new THREE.CylinderGeometry(0.3, 0.35, 1.2, 8);
      const bollardMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, metalness: 0.8 });
      const bollard = new THREE.Mesh(bollardGeo, bollardMat);
      bollard.position.set(px, 2.1, pz + 40);
      scene.add(bollard);
    }
  }

  // --- Urban Street Props, Traffic Lights, Trees, Hydrants, Benches ---
  private buildUrbanProps(scene: THREE.Scene) {
    // 1. Street Lamp Fixtures
    const lampPostGeo = new THREE.CylinderGeometry(0.18, 0.25, 7.5, 8);
    const lampArmGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.5, 8);
    const lampPostMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const bulbGeo = new THREE.SphereGeometry(0.45, 8, 8);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    const lampCoords = [
      [-160, 56], [-90, 56], [50, 56], [150, 56], [250, 56],
      [-160, 84], [-90, 84], [50, 84], [150, 84], [250, 84],
      [-160, 166], [-90, 166], [50, 166], [150, 166], [250, 166],
      [-56, -50], [-56, 50], [-56, 150], [-56, 250],
      [84, -50], [84, 50], [84, 150], [84, 250],
    ];

    lampCoords.forEach(([lx, lz]) => {
      const lampGroup = new THREE.Group();
      lampGroup.position.set(lx, 0, lz);

      const post = new THREE.Mesh(lampPostGeo, lampPostMat);
      post.position.y = 3.75;
      lampGroup.add(post);

      const arm = new THREE.Mesh(lampArmGeo, lampPostMat);
      arm.rotation.z = Math.PI / 3;
      arm.position.set(0.8, 7.4, 0);
      lampGroup.add(arm);

      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(1.6, 7.8, 0);
      lampGroup.add(bulb);

      const light = new THREE.PointLight(0xfef08a, 1.2, 32, 1.4);
      light.position.set(1.6, 7.5, 0);
      lampGroup.add(light);
      this.streetLights.push(light);

      scene.add(lampGroup);
    });

    // 2. Stylized Lush Trees (Branched trunk + multi-sphere foliage)
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, 4.5, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x582f0e, roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    const leafHighlightMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.75 });

    const treePositions = [
      [-210, 75], [-200, 95], [-190, 115], [-225, 130], [-180, 35],
      [-230, 55], [-130, 30], [-80, 30], [-40, 30], [20, 275], [60, 285],
      [80, -140], [110, -155], [60, -170]
    ];

    treePositions.forEach(([tx, tz]) => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(tx, 0, tz);

      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 2.25;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Multi-layer canopy
      const f1 = new THREE.Mesh(new THREE.SphereGeometry(3.2, 8, 8), leafMat);
      f1.position.set(0, 5.5, 0);
      f1.castShadow = true;
      treeGroup.add(f1);

      const f2 = new THREE.Mesh(new THREE.SphereGeometry(2.4, 8, 8), leafHighlightMat);
      f2.position.set(0.8, 7.0, 0.4);
      f2.castShadow = true;
      treeGroup.add(f2);

      const f3 = new THREE.Mesh(new THREE.SphereGeometry(2.2, 8, 8), leafMat);
      f3.position.set(-0.7, 6.6, -0.6);
      f3.castShadow = true;
      treeGroup.add(f3);

      scene.add(treeGroup);
      this.addCollider(tx, tz, 1.8, 1.8, 7.5, 'prop');
    });

    // 3. Fire Hydrants, Benches, Trash Bins, & Bus Shelters
    const hydrantGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.1, 8);
    const hydrantMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.7, roughness: 0.3 });
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });

    const propLocations = [
      { x: -150, z: 57 }, { x: -80, z: 57 }, { x: 40, z: 57 },
      { x: -150, z: 83 }, { x: -80, z: 83 }, { x: 40, z: 83 },
    ];

    propLocations.forEach(p => {
      // Fire Hydrant
      const hyd = new THREE.Mesh(hydrantGeo, hydrantMat);
      hyd.position.set(p.x + 4, 0.55, p.z);
      scene.add(hyd);

      // Park Bench
      const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 0.8), benchMat);
      bench.position.set(p.x - 4, 0.4, p.z);
      scene.add(bench);
    });
  }

  private addCollider(x: number, z: number, width: number, depth: number, height: number, type: 'building' | 'wall' | 'prop' = 'building') {
    this.colliders.push({
      minX: x - width / 2,
      maxX: x + width / 2,
      minZ: z - depth / 2,
      maxZ: z + depth / 2,
      height,
      type
    });
  }

  public checkCollision(x: number, z: number, radius: number = 0.8): { hit: boolean; pushX: number; pushZ: number } {
    let pushX = 0;
    let pushZ = 0;
    let hit = false;

    for (const c of this.colliders) {
      const closestX = Math.max(c.minX, Math.min(x, c.maxX));
      const closestZ = Math.max(c.minZ, Math.min(z, c.maxZ));

      const dx = x - closestX;
      const dz = z - closestZ;
      const distSq = dx * dx + dz * dz;

      if (distSq < radius * radius) {
        hit = true;
        const dist = Math.sqrt(distSq) || 0.001;
        const overlap = radius - dist;
        pushX += (dx / dist) * overlap;
        pushZ += (dz / dist) * overlap;
      }
    }

    return { hit, pushX, pushZ };
  }

  public raycastWorld(from: THREE.Vector3, to: THREE.Vector3): { hit: boolean; point: THREE.Vector3; distance: number } {
    const rayDir = new THREE.Vector3().subVectors(to, from);
    const maxDist = rayDir.length();
    rayDir.normalize();

    let closestDist = maxDist;
    let hasHit = false;

    // AABB Ray intersection tests
    for (const c of this.colliders) {
      const min = new THREE.Vector3(c.minX, 0, c.minZ);
      const max = new THREE.Vector3(c.maxX, c.height, c.maxZ);

      // Ray vs AABB
      let tmin = (min.x - from.x) / (rayDir.x || 0.000001);
      let tmax = (max.x - from.x) / (rayDir.x || 0.000001);
      if (tmin > tmax) [tmin, tmax] = [tmax, tmin];

      let tymin = (min.y - from.y) / (rayDir.y || 0.000001);
      let tymax = (max.y - from.y) / (rayDir.y || 0.000001);
      if (tymin > tymax) [tymin, tymax] = [tymax, tymin];

      if ((tmin > tymax) || (tymin > tmax)) continue;
      if (tymin > tmin) tmin = tymin;
      if (tymax < tmax) tmax = tymax;

      let tzmin = (min.z - from.z) / (rayDir.z || 0.000001);
      let tzmax = (max.z - from.z) / (rayDir.z || 0.000001);
      if (tzmin > tzmax) [tzmin, tzmax] = [tzmax, tzmin];

      if ((tmin > tzmax) || (tzmin > tmax)) continue;
      if (tzmin > tmin) tmin = tzmin;
      if (tzmax < tmax) tmax = tzmax;

      if (tmin > 0.05 && tmin < closestDist) {
        closestDist = tmin;
        hasHit = true;
      }
    }

    const hitPoint = from.clone().addScaledVector(rayDir, closestDist);
    return {
      hit: hasHit,
      point: hitPoint,
      distance: closestDist
    };
  }

  public updateLightsForTime(timeHour: number) {
    const isDark = timeHour < 6 || timeHour > 18.5;
    const streetIntensity = isDark ? 1.4 : 0.2;
    this.streetLights.forEach(light => {
      light.intensity = streetIntensity;
    });

    const neonIntensity = isDark ? 1.6 : 0.8;
    this.neonLights.forEach(light => {
      light.intensity = neonIntensity;
    });

    // Blinking aviation lights
    const flash = Math.sin(Date.now() * 0.004) > 0.3;
    this.aviationLights.forEach(av => {
      av.visible = flash;
    });
  }
}
