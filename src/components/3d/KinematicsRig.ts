import * as THREE from "three";
import { MechanicalMaterials } from "./MechanicalMaterials";

export type ComponentId = "stator" | "gimbal" | "rotor" | "core";

export interface InteractiveMesh extends THREE.Mesh {
  userData: {
    componentId: ComponentId;
    isIndicator?: boolean;
    originalMaterial?: THREE.Material | THREE.Material[];
  };
}

/**
 * KinematicsRig
 *
 * Implements a precision-engineered industrial machine featuring:
 * 1. STATOR: Asymmetrical cast base plate, monolithic bearing tower, and tailstock bracket.
 * 2. ROTOR: Exposed central drive shaft, dual-flange heavy flywheel, and multi-stage compressor spool.
 * 3. GIMBAL: Articulated kinematic linkage (eccentric crank, connecting rod, bellcrank rocker, and calipers).
 * 4. CORE: Central power/drive module nestled in the chassis cradle with cooling heat sinks and emissive crystal.
 *
 * Provides raycasting registration, distinct visual highlighting on all 4 components,
 * true multi-axis spatial depth, and a 4-phase exploded view scroll choreography.
 */
export class KinematicsRig {
  public root: THREE.Group;
  public statorGroup: THREE.Group;
  public rotorGroup: THREE.Group;
  public gimbalGroup: THREE.Group;
  public coreGroup: THREE.Group;

  // Sub-assemblies for articulated linkages
  public flywheelGroup: THREE.Group;
  public shaftGroup: THREE.Group;
  public connectingRodGroup: THREE.Group;
  public bellcrankGroup: THREE.Group;
  public coreCrystalMesh: THREE.Mesh;

  private materials: MechanicalMaterials;
  private ownedGeometries: THREE.BufferGeometry[] = [];
  private interactiveMeshes: InteractiveMesh[] = [];

  // Kinematic state
  private rotorAngle = 0;
  private activeComponent: ComponentId | null = null;
  private scrollProgress = 0;
  private currentExplosion = 0;

  constructor(materials: MechanicalMaterials) {
    this.materials = materials;

    this.root = new THREE.Group();
    this.root.name = "industrial_machine_root";

    this.statorGroup = new THREE.Group();
    this.statorGroup.name = "stator_assembly";

    this.rotorGroup = new THREE.Group();
    this.rotorGroup.name = "rotor_assembly";

    this.gimbalGroup = new THREE.Group();
    this.gimbalGroup.name = "gimbal_linkage_assembly";

    this.coreGroup = new THREE.Group();
    this.coreGroup.name = "core_power_assembly";

    this.flywheelGroup = new THREE.Group();
    this.flywheelGroup.name = "flywheel_subgroup";

    this.shaftGroup = new THREE.Group();
    this.shaftGroup.name = "shaft_subgroup";

    this.connectingRodGroup = new THREE.Group();
    this.connectingRodGroup.name = "connecting_rod_subgroup";

    this.bellcrankGroup = new THREE.Group();
    this.bellcrankGroup.name = "bellcrank_subgroup";

    // Build the 4 mechanical assemblies
    this.buildStator();
    this.buildRotor();
    this.buildGimbalLinkage();
    this.coreCrystalMesh = this.buildCore();

    // Assemble root hierarchy
    this.root.add(this.statorGroup);
    this.root.add(this.rotorGroup);
    this.root.add(this.gimbalGroup);
    this.root.add(this.coreGroup);

    // Initial 3/4 beauty orientation for cinematic depth
    this.root.rotation.set(0.18, -0.42, 0.05);
  }

  private registerGeometry<T extends THREE.BufferGeometry>(geo: T): T {
    this.ownedGeometries.push(geo);
    return geo;
  }

  private registerInteractiveMesh(mesh: THREE.Mesh, componentId: ComponentId, isIndicator = false): void {
    const iMesh = mesh as InteractiveMesh;
    iMesh.userData = {
      componentId,
      isIndicator,
      originalMaterial: mesh.material,
    };
    this.interactiveMeshes.push(iMesh);
  }

  /**
   * 1. STATOR CHASSIS & HOUSING
   * Heavy asymmetrical industrial bed, main bearing pillar at X = -1.6,
   * tailstock outrigger at X = 2.0, reference vernier markings, and mounting flanges.
   */
  private buildStator(): void {
    // A. Main Cast Machine Bed Plate
    const bedGeo = this.registerGeometry(new THREE.BoxGeometry(6.4, 0.45, 3.6));
    const bedMesh = new THREE.Mesh(bedGeo, this.materials.housingCastIron);
    bedMesh.position.set(0, -1.8, 0);
    this.registerInteractiveMesh(bedMesh, "stator");
    this.statorGroup.add(bedMesh);

    // Bed T-Slot Rails (recessed dark titanium slots)
    [-0.9, 0.9].forEach((z) => {
      const railGeo = this.registerGeometry(new THREE.BoxGeometry(6.2, 0.08, 0.35));
      const railMesh = new THREE.Mesh(railGeo, this.materials.darkTitanium);
      railMesh.position.set(0, -1.55, z);
      this.registerInteractiveMesh(railMesh, "stator");
      this.statorGroup.add(railMesh);
    });

    // B. Monolithic Main Bearing Pillar (Asymmetrical Left Side, X = -1.6)
    const pillarBaseGeo = this.registerGeometry(new THREE.BoxGeometry(1.6, 2.6, 2.4));
    const pillarBaseMesh = new THREE.Mesh(pillarBaseGeo, this.materials.darkTitanium);
    pillarBaseMesh.position.set(-1.6, -0.4, 0);
    this.registerInteractiveMesh(pillarBaseMesh, "stator");
    this.statorGroup.add(pillarBaseMesh);

    // Main Bearing Housing Barrel (Horizontal Bore along X-axis)
    const barrelGeo = this.registerGeometry(new THREE.CylinderGeometry(1.15, 1.15, 1.7, 32));
    const barrelMesh = new THREE.Mesh(barrelGeo, this.materials.darkTitanium);
    barrelMesh.rotation.z = Math.PI / 2;
    barrelMesh.position.set(-1.6, 0.9, 0);
    this.registerInteractiveMesh(barrelMesh, "stator");
    this.statorGroup.add(barrelMesh);

    // Main Bearing Split Cap Flange with Chrome Cap Screws
    const capFlangeGeo = this.registerGeometry(new THREE.TorusGeometry(1.18, 0.1, 16, 32));
    const capFlange = new THREE.Mesh(capFlangeGeo, this.materials.machinedSteel);
    capFlange.rotation.y = Math.PI / 2;
    capFlange.position.set(-0.75, 0.9, 0);
    this.registerInteractiveMesh(capFlange, "stator");
    this.statorGroup.add(capFlange);

    // C. Structural Gusset Ribs (Triangular supports behind the pillar)
    const gussetGeo = this.registerGeometry(new THREE.BoxGeometry(0.2, 1.8, 1.2));
    const gusset = new THREE.Mesh(gussetGeo, this.materials.darkTitanium);
    gusset.position.set(-1.6, -0.6, -1.4);
    gusset.rotation.x = -Math.PI / 6;
    this.registerInteractiveMesh(gusset, "stator");
    this.statorGroup.add(gusset);

    // D. Tailstock Outrigger Pillar (Right Side, X = 2.0, aligned with shaft)
    const tailstockGeo = this.registerGeometry(new THREE.BoxGeometry(1.0, 2.6, 1.6));
    const tailstockMesh = new THREE.Mesh(tailstockGeo, this.materials.darkTitanium);
    tailstockMesh.position.set(2.0, -0.4, 0);
    this.registerInteractiveMesh(tailstockMesh, "stator");
    this.statorGroup.add(tailstockMesh);

    const tailstockBearingGeo = this.registerGeometry(new THREE.CylinderGeometry(0.65, 0.65, 1.05, 24));
    const tailstockBearing = new THREE.Mesh(tailstockBearingGeo, this.materials.darkTitanium);
    tailstockBearing.rotation.z = Math.PI / 2;
    tailstockBearing.position.set(2.0, 0.9, 0);
    this.registerInteractiveMesh(tailstockBearing, "stator");
    this.statorGroup.add(tailstockBearing);

    // E. Bronze Bushing Liners (aligned on shaft axis Y = 0.9)
    const bushingGeo = this.registerGeometry(new THREE.CylinderGeometry(0.48, 0.48, 0.35, 24));
    const bushingL = new THREE.Mesh(bushingGeo, this.materials.bronzeBushing);
    bushingL.rotation.z = Math.PI / 2;
    bushingL.position.set(-0.7, 0.9, 0);
    this.registerInteractiveMesh(bushingL, "stator");
    this.statorGroup.add(bushingL);

    const bushingR = new THREE.Mesh(bushingGeo, this.materials.bronzeBushing);
    bushingR.rotation.z = Math.PI / 2;
    bushingR.position.set(1.4, 0.9, 0);
    this.registerInteractiveMesh(bushingR, "stator");
    this.statorGroup.add(bushingR);

    // F. Precision Reference Scale / Vernier Marks on Bed Front Edge
    const rulerGeo = this.registerGeometry(new THREE.BoxGeometry(3.6, 0.08, 0.04));
    const rulerMesh = new THREE.Mesh(rulerGeo, this.materials.polishedSteel);
    rulerMesh.position.set(0, -1.5, 1.82);
    this.registerInteractiveMesh(rulerMesh, "stator");
    this.statorGroup.add(rulerMesh);

    // 16 Etched Scale Ticks
    for (let i = 0; i < 16; i++) {
      const tickGeo = this.registerGeometry(new THREE.BoxGeometry(0.04, 0.12, 0.02));
      const tick = new THREE.Mesh(tickGeo, this.materials.measurementTicks);
      tick.position.set(-1.6 + i * 0.22, -1.5, 1.84);
      this.statorGroup.add(tick);
    }

    // Stator Indicator Strip (illuminates on highlight)
    const indicatorGeo = this.registerGeometry(new THREE.BoxGeometry(1.2, 0.06, 0.06));
    const indicatorMesh = new THREE.Mesh(indicatorGeo, this.materials.greenIndicator);
    indicatorMesh.position.set(-1.6, 1.85, 0.95);
    this.registerInteractiveMesh(indicatorMesh, "stator", true);
    this.statorGroup.add(indicatorMesh);
  }

  /**
   * 2. ROTOR ASSEMBLY
   * Main drive shaft along X-axis, heavy dual-flange flywheel at X = -0.5,
   * multi-stage compressor turbine spool at X = 0.8, and eccentric crank pin.
   */
  private buildRotor(): void {
    // The entire rotor rotates around the X-axis passing through (X, 0.9, 0)
    this.rotorGroup.position.set(0, 0.9, 0);

    // A. Main Stepped Drive Shaft (Horizontal cylinder along X)
    const shaftGeo = this.registerGeometry(new THREE.CylinderGeometry(0.32, 0.32, 5.8, 32));
    const shaftMesh = new THREE.Mesh(shaftGeo, this.materials.machinedChrome);
    shaftMesh.rotation.z = Math.PI / 2;
    this.registerInteractiveMesh(shaftMesh, "rotor");
    this.shaftGroup.add(shaftMesh);

    // Keyway Collar on Shaft
    const collarGeo = this.registerGeometry(new THREE.CylinderGeometry(0.48, 0.48, 0.35, 24));
    const collarMesh = new THREE.Mesh(collarGeo, this.materials.polishedSteel);
    collarMesh.rotation.z = Math.PI / 2;
    collarMesh.position.set(0.1, 0, 0);
    this.registerInteractiveMesh(collarMesh, "rotor");
    this.shaftGroup.add(collarMesh);

    // B. Heavy Flywheel Assembly (Mounted at X = -0.4)
    this.flywheelGroup.position.set(-0.4, 0, 0);

    // Outer Heavy Rim
    const rimGeo = this.registerGeometry(new THREE.TorusGeometry(1.75, 0.24, 20, 48));
    const rimMesh = new THREE.Mesh(rimGeo, this.materials.darkTitanium);
    rimMesh.rotation.y = Math.PI / 2;
    this.registerInteractiveMesh(rimMesh, "rotor");
    this.flywheelGroup.add(rimMesh);

    // Central Flywheel Hub
    const hubGeo = this.registerGeometry(new THREE.CylinderGeometry(0.75, 0.75, 0.52, 32));
    const hubMesh = new THREE.Mesh(hubGeo, this.materials.polishedSteel);
    hubMesh.rotation.z = Math.PI / 2;
    this.registerInteractiveMesh(hubMesh, "rotor");
    this.flywheelGroup.add(hubMesh);

    // 6 Structural Spokes connecting Hub to Rim
    for (let i = 0; i < 6; i++) {
      const spokeAngle = (i * Math.PI) / 3;
      const spokeGeo = this.registerGeometry(new THREE.BoxGeometry(0.24, 1.25, 0.16));
      const spoke = new THREE.Mesh(spokeGeo, this.materials.machinedSteel);
      spoke.position.set(0, Math.sin(spokeAngle) * 1.05, Math.cos(spokeAngle) * 1.05);
      spoke.rotation.x = spokeAngle;
      this.registerInteractiveMesh(spoke, "rotor");
      this.flywheelGroup.add(spoke);
    }

    // 12 Perimeter Timing Teeth / Notches around Flywheel Rim
    for (let i = 0; i < 12; i++) {
      const toothAngle = (i * Math.PI) / 6;
      const toothGeo = this.registerGeometry(new THREE.BoxGeometry(0.28, 0.08, 0.1));
      const tooth = new THREE.Mesh(toothGeo, this.materials.machinedChrome);
      tooth.position.set(0, Math.sin(toothAngle) * 1.95, Math.cos(toothAngle) * 1.95);
      tooth.rotation.x = toothAngle;
      this.registerInteractiveMesh(tooth, "rotor");
      this.flywheelGroup.add(tooth);
    }

    // Eccentric Crank Pin on Flywheel Face (Radius = 0.95, drives connecting rod)
    const pinGeo = this.registerGeometry(new THREE.CylinderGeometry(0.14, 0.14, 0.45, 16));
    const pinMesh = new THREE.Mesh(pinGeo, this.materials.bronzeBushing);
    pinMesh.rotation.z = Math.PI / 2;
    pinMesh.position.set(0.35, 0.95, 0);
    this.registerInteractiveMesh(pinMesh, "rotor");
    this.flywheelGroup.add(pinMesh);

    // C. Multi-Stage Compressor / Turbine Rotor (Mounted at X = 0.9)
    const turbineHubGeo = this.registerGeometry(new THREE.CylinderGeometry(0.65, 0.55, 1.1, 24));
    const turbineHub = new THREE.Mesh(turbineHubGeo, this.materials.polishedSteel);
    turbineHub.rotation.z = Math.PI / 2;
    turbineHub.position.set(0.9, 0, 0);
    this.registerInteractiveMesh(turbineHub, "rotor");
    this.shaftGroup.add(turbineHub);

    // 16 Angled Aerodynamic Turbine Blades
    for (let i = 0; i < 16; i++) {
      const bladeAngle = (i * Math.PI) / 8;
      const bladeGeo = this.registerGeometry(new THREE.BoxGeometry(0.55, 0.65, 0.05));
      const blade = new THREE.Mesh(bladeGeo, this.materials.machinedChrome);
      blade.position.set(0.9, Math.sin(bladeAngle) * 0.88, Math.cos(bladeAngle) * 0.88);
      blade.rotation.x = bladeAngle;
      blade.rotation.y = 0.35; // Aerodynamic pitch angle
      this.registerInteractiveMesh(blade, "rotor");
      this.shaftGroup.add(blade);
    }

    this.rotorGroup.add(this.shaftGroup);
    this.rotorGroup.add(this.flywheelGroup);
  }

  /**
   * 3. GIMBAL / ARTICULATED KINEMATIC LINKAGE
   * Kinematic mechanism:
   * - Eccentric crank pin on flywheel drives connecting rod
   * - Connecting rod drives trunnion-mounted bellcrank rocker arm
   * - Articulated twin caliper arms clamp around bearing sleeve
   */
  private buildGimbalLinkage(): void {
    // Trunnion Pin Pivot mounted on stator base at X = 0.3, Y = -0.2, Z = 1.4
    const trunnionGeo = this.registerGeometry(new THREE.CylinderGeometry(0.18, 0.18, 0.8, 16));
    const trunnion = new THREE.Mesh(trunnionGeo, this.materials.bronzeBushing);
    trunnion.position.set(0.3, -0.2, 1.4);
    this.registerInteractiveMesh(trunnion, "gimbal");
    this.gimbalGroup.add(trunnion);

    // A. Bellcrank Rocker Arm (Pivoting triangular linkage)
    this.bellcrankGroup.position.set(0.3, -0.2, 1.4);

    const crankBodyGeo = this.registerGeometry(new THREE.BoxGeometry(0.26, 1.6, 0.45));
    const crankBody = new THREE.Mesh(crankBodyGeo, this.materials.darkTitanium);
    crankBody.position.set(0, 0.7, 0);
    this.registerInteractiveMesh(crankBody, "gimbal");
    this.bellcrankGroup.add(crankBody);

    const rockerPivotGeo = this.registerGeometry(new THREE.CylinderGeometry(0.32, 0.32, 0.35, 20));
    const rockerPivot = new THREE.Mesh(rockerPivotGeo, this.materials.machinedSteel);
    rockerPivot.rotation.x = Math.PI / 2;
    this.registerInteractiveMesh(rockerPivot, "gimbal");
    this.bellcrankGroup.add(rockerPivot);

    // B. Connecting Rod (Machined I-beam link connecting crank to bellcrank)
    this.connectingRodGroup.position.set(-0.05, 0.9, 0);

    const rodGeo = this.registerGeometry(new THREE.BoxGeometry(0.18, 1.5, 0.28));
    const rodMesh = new THREE.Mesh(rodGeo, this.materials.machinedSteel);
    rodMesh.position.set(0, -0.75, 0.7);
    rodMesh.rotation.x = Math.PI / 5;
    this.registerInteractiveMesh(rodMesh, "gimbal");
    this.connectingRodGroup.add(rodMesh);

    // Rod End Bearing Knuckle
    const knuckleGeo = this.registerGeometry(new THREE.CylinderGeometry(0.24, 0.24, 0.26, 16));
    const knuckle = new THREE.Mesh(knuckleGeo, this.materials.bronzeBushing);
    knuckle.rotation.z = Math.PI / 2;
    knuckle.position.set(0, 0, 0);
    this.registerInteractiveMesh(knuckle, "gimbal");
    this.connectingRodGroup.add(knuckle);

    // C. Articulated Caliper Stabilizer Arms (Upper and Lower Jaws)
    [-0.55, 0.55].forEach((offsetY) => {
      const jawGeo = this.registerGeometry(new THREE.BoxGeometry(0.22, 0.35, 1.3));
      const jaw = new THREE.Mesh(jawGeo, this.materials.polishedSteel);
      jaw.position.set(0.3, 0.9 + offsetY, 0.85);
      this.registerInteractiveMesh(jaw, "gimbal");
      this.gimbalGroup.add(jaw);

      const tipGeo = this.registerGeometry(new THREE.BoxGeometry(0.24, 0.18, 0.25));
      const tip = new THREE.Mesh(tipGeo, this.materials.greenIndicator);
      tip.position.set(0.3, 0.9 + offsetY, 0.2);
      this.registerInteractiveMesh(tip, "gimbal", true);
      this.gimbalGroup.add(tip);
    });

    this.gimbalGroup.add(this.connectingRodGroup);
    this.gimbalGroup.add(this.bellcrankGroup);
  }

  /**
   * 4. CORE COMPUTATION & POWER DRIVE MODULE
   * Precision hexagonal power module resting inside the bed cradle,
   * with parallel heat sink cooling fins, shielded chamber, and pulsating emerald core crystal.
   */
  private buildCore(): THREE.Mesh {
    this.coreGroup.position.set(0.7, -0.65, -0.7);

    // A. Hexagonal Drive Housing Cradle
    const cradleGeo = this.registerGeometry(new THREE.CylinderGeometry(0.9, 1.05, 1.4, 6));
    const cradleMesh = new THREE.Mesh(cradleGeo, this.materials.anodizedObsidian);
    this.registerInteractiveMesh(cradleMesh, "core");
    this.coreGroup.add(cradleMesh);

    // B. Array of 6 Machined Heat Sink Cooling Fins
    for (let i = 0; i < 6; i++) {
      const finGeo = this.registerGeometry(new THREE.BoxGeometry(1.6, 0.05, 1.6));
      const finMesh = new THREE.Mesh(finGeo, this.materials.machinedSteel);
      finMesh.position.set(0, -0.5 + i * 0.2, 0);
      this.registerInteractiveMesh(finMesh, "core");
      this.coreGroup.add(finMesh);
    }

    // C. Internal Crystal Chamber with Beveled Aperture
    const apertureGeo = this.registerGeometry(new THREE.TorusGeometry(0.55, 0.1, 16, 24));
    const aperture = new THREE.Mesh(apertureGeo, this.materials.polishedSteel);
    aperture.position.set(0, 0.72, 0);
    aperture.rotation.x = Math.PI / 2;
    this.registerInteractiveMesh(aperture, "core");
    this.coreGroup.add(aperture);

    // D. Faceted Central Computation Core Crystal (Octahedron)
    const crystalGeo = this.registerGeometry(new THREE.OctahedronGeometry(0.42, 0));
    const crystalMesh = new THREE.Mesh(crystalGeo, this.materials.electricGreenEmissive);
    crystalMesh.position.set(0, 0.85, 0);
    this.registerInteractiveMesh(crystalMesh, "core", true);
    this.coreGroup.add(crystalMesh);

    // E. Twin Hydraulic Conduits (connecting core to main bearing housing)
    const curvePoints = [
      new THREE.Vector3(0, 0.4, 0.6),
      new THREE.Vector3(-0.8, 0.2, 0.8),
      new THREE.Vector3(-1.4, 0.5, 0.3),
    ];
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const pipeGeo = this.registerGeometry(new THREE.TubeGeometry(curve, 20, 0.06, 8, false));
    const pipeMesh = new THREE.Mesh(pipeGeo, this.materials.bronzeBushing);
    this.registerInteractiveMesh(pipeMesh, "core");
    this.coreGroup.add(pipeMesh);

    return crystalMesh;
  }

  /**
   * Returns list of interactive meshes for Raycaster picking.
   */
  public getInteractiveMeshes(): THREE.Mesh[] {
    return this.interactiveMeshes;
  }

  /**
   * Sets the active component (hovered or persistently selected) and updates visual highlights.
   * All 4 assemblies (stator, gimbal, rotor, core) have distinct, unmistakable visual states.
   */
  public setHighlight(component: ComponentId | null): void {
    this.activeComponent = component;

    // Apply materials based on active component
    this.interactiveMeshes.forEach((mesh) => {
      const isThisActive = component !== null && mesh.userData.componentId === component;

      if (isThisActive) {
        if (mesh.userData.isIndicator) {
          mesh.material = this.materials.highlightAccent;
        } else if (mesh.userData.componentId === "rotor" && mesh === this.flywheelGroup.children[0]) {
          // Highlight flywheel rim with brilliant chrome
          mesh.material = this.materials.machinedChrome;
        }
      } else {
        // Restore nominal baseline material
        mesh.material = mesh.userData.originalMaterial as THREE.Material;
      }
    });

    // Special assembly-specific visual feedback:
    if (component === "core") {
      this.materials.electricGreenEmissive.emissiveIntensity = 4.8;
      this.coreCrystalMesh.scale.set(1.15, 1.15, 1.15);
    } else {
      this.materials.electricGreenEmissive.emissiveIntensity = 2.2;
      this.coreCrystalMesh.scale.set(1.0, 1.0, 1.0);
    }

    if (component === "gimbal") {
      this.bellcrankGroup.scale.set(1.08, 1.08, 1.08);
    } else {
      this.bellcrankGroup.scale.set(1.0, 1.0, 1.0);
    }

    if (component === "rotor") {
      this.flywheelGroup.scale.set(1.04, 1.04, 1.04);
    } else {
      this.flywheelGroup.scale.set(1.0, 1.0, 1.0);
    }

    if (component === "stator") {
      this.statorGroup.position.y = -0.05;
    } else {
      this.statorGroup.position.y = 0;
    }
  }

  /**
   * Explicit scroll progress setter (0.0 to 1.0).
   * Drives the 4-phase scrubbed sequence:
   * Phase A [0.0 - 0.25]: Assembled idle
   * Phase B [0.25 - 0.50]: Motion acceleration & camera dolly
   * Phase C [0.50 - 0.75]: Exploded view separation along multi-axis paths
   * Phase D [0.75 - 1.00]: Reassembly & handover to next section
   */
  public setScrollProgress(progress: number): void {
    this.scrollProgress = Math.max(0, Math.min(progress, 1));

    // Calculate Exploded View separation (Phase C: 0.50 - 0.75)
    let targetExplosion = 0;
    if (this.scrollProgress >= 0.45 && this.scrollProgress <= 0.85) {
      if (this.scrollProgress < 0.65) {
        // Easing outward (0.45 -> 0.65)
        const t = (this.scrollProgress - 0.45) / 0.2;
        targetExplosion = t * t * (3 - 2 * t); // smoothstep
      } else {
        // Easing back (0.65 -> 0.85)
        const t = (0.85 - this.scrollProgress) / 0.2;
        targetExplosion = t * t * (3 - 2 * t);
      }
    }
    this.currentExplosion = targetExplosion;

    // Apply 3D separation along meaningful mechanical vectors
    const exp = this.currentExplosion;
    // Stator slides back and downwards
    this.statorGroup.position.set(-2.0 * exp, -1.2 * exp, -1.6 * exp);
    // Rotor slides forward along shaft axis
    this.rotorGroup.position.set(2.4 * exp, 0.9 + 0.3 * exp, 1.4 * exp);
    // Gimbal linkages lift and swing outwards
    this.gimbalGroup.position.set(-0.5 * exp, 2.2 * exp, -0.8 * exp);
    // Core lifts upward out of bed cradle
    this.coreGroup.position.set(0.7 + 0.3 * exp, -0.65 + 2.5 * exp, -0.7 + 1.2 * exp);
  }

  /**
   * Evaluates the physical kinematics on every tick.
   */
  public update(
    time: number,
    deltaTime: number,
    pointerDamped: { x: number; y: number },
    isReducedMotion: boolean
  ): void {
    if (isReducedMotion) {
      // Static three-quarter beauty framing without motion
      this.root.rotation.set(0.18, -0.42, 0.05);
      this.rotorGroup.rotation.x = 0;
      return;
    }

    // Kinematic speed calculation: ramps during Phase B
    let speedMult = 1.0;
    if (this.scrollProgress >= 0.25 && this.scrollProgress <= 0.65) {
      const ramp = Math.sin(((this.scrollProgress - 0.25) / 0.4) * Math.PI);
      speedMult = 1.0 + ramp * 3.2;
    }

    // 1. Continuous Shaft and Flywheel Rotation along X-axis
    this.rotorAngle += deltaTime * 2.2 * speedMult;
    this.rotorGroup.rotation.x = this.rotorAngle;

    // 2. Articulated Linkage Kinematics (Connecting rod & Bellcrank oscillate with crank pin)
    const crankSin = Math.sin(this.rotorAngle);
    const crankCos = Math.cos(this.rotorAngle);

    // Bellcrank rocker rocks back and forth (±14 degrees)
    this.bellcrankGroup.rotation.z = crankSin * 0.24;

    // Connecting rod pivots around knuckle joint
    this.connectingRodGroup.rotation.x = crankCos * 0.18;

    // 3. Central Core Crystal Pulsation
    const crystalPulse = 2.2 + 0.6 * Math.sin(time * 3.2);
    if (this.activeComponent !== "core") {
      this.materials.electricGreenEmissive.emissiveIntensity = crystalPulse;
    }
    this.coreCrystalMesh.rotation.y = time * 0.8;
    this.coreCrystalMesh.rotation.z = time * 0.5;

    // 4. Subtle Damped Cursor Orientation (Smooth Parallax within ±15 degrees)
    const targetRotX = 0.18 + pointerDamped.y * 0.25;
    const targetRotY = -0.42 + pointerDamped.x * 0.32;
    this.root.rotation.x += (targetRotX - this.root.rotation.x) * 0.08;
    this.root.rotation.y += (targetRotY - this.root.rotation.y) * 0.08;
  }

  public dispose(): void {
    this.ownedGeometries.forEach((geo) => geo.dispose());
    this.ownedGeometries = [];
    this.interactiveMeshes = [];
  }
}
