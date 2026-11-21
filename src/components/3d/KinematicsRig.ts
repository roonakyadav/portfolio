import * as THREE from "three";
import { MechanicalMaterials } from "./MechanicalMaterials";

export type ComponentId = "stator" | "gimbal" | "rotor" | "core";

export interface CaliperAssembly {
  group: THREE.Group;
  angle: number;
  baseRadius: number;
  jawMesh: THREE.Mesh;
  indicatorMesh: THREE.Mesh;
}

/**
 * KinematicsRig
 *
 * Implements the 5-component procedural mechanical artifact:
 * 1. Stator Chassis (fixed mounting frame, stepped rings, measurement ticks)
 * 2. Outer Gimbal (dual-axis oscillating titanium ring with pivot pins)
 * 3. Rotor Assembly (high-speed slotted turbine disc with angled radial fins)
 * 4. Central Computation Core (faceted geometric core with pulsating green emissive crystal)
 * 5. Articulated Calipers (four radial mechanical jaws with expandable linkages)
 *
 * Provides independent kinematic control, scroll-driven separation, and hover highlight states.
 */
export class KinematicsRig {
  public root: THREE.Group;
  public statorGroup: THREE.Group;
  public gimbalOuterGroup: THREE.Group;
  public gimbalInnerGroup: THREE.Group;
  public rotorGroup: THREE.Group;
  public coreGroup: THREE.Group;
  public calipersGroup: THREE.Group;

  private coreMesh: THREE.Mesh;
  private coreCrystalMesh: THREE.Mesh;
  private calipers: CaliperAssembly[] = [];
  private materials: MechanicalMaterials;
  private ownedGeometries: THREE.BufferGeometry[] = [];

  private rotorAngle = 0;
  private activeComponent: ComponentId | null = null;
  private currentExpansion = 0;

  constructor(materials: MechanicalMaterials) {
    this.materials = materials;
    this.root = new THREE.Group();
    this.root.name = "mechanical_artifact_root";

    this.statorGroup = new THREE.Group();
    this.statorGroup.name = "stator_chassis";

    this.gimbalOuterGroup = new THREE.Group();
    this.gimbalOuterGroup.name = "gimbal_outer_assembly";

    this.gimbalInnerGroup = new THREE.Group();
    this.gimbalInnerGroup.name = "gimbal_inner_assembly";

    this.rotorGroup = new THREE.Group();
    this.rotorGroup.name = "rotor_turbine_assembly";

    this.coreGroup = new THREE.Group();
    this.coreGroup.name = "central_computation_core";

    this.calipersGroup = new THREE.Group();
    this.calipersGroup.name = "articulated_calipers_assembly";

    this.buildStator();
    this.buildGimbal();
    this.buildRotor();
    const { coreMesh, coreCrystal } = this.buildCore();
    this.coreMesh = coreMesh;
    this.coreCrystalMesh = coreCrystal;
    this.buildCalipers();

    // Assemble Hierarchy
    // Outer gimbal contains inner gimbal
    this.gimbalOuterGroup.add(this.gimbalInnerGroup);

    // Root contains stator, gimbals, rotor, core, calipers
    this.root.add(this.statorGroup);
    this.root.add(this.gimbalOuterGroup);
    this.root.add(this.rotorGroup);
    this.root.add(this.coreGroup);
    this.root.add(this.calipersGroup);
  }

  private registerGeometry<T extends THREE.BufferGeometry>(geo: T): T {
    this.ownedGeometries.push(geo);
    return geo;
  }

  /**
   * 1. STATOR CHASSIS
   * Heavy outer circular mounting frame with precision measurement tick marks and mounting lugs.
   */
  private buildStator(): void {
    const mainRingGeo = this.registerGeometry(
      new THREE.TorusGeometry(3.3, 0.12, 16, 80)
    );
    const mainRing = new THREE.Mesh(mainRingGeo, this.materials.darkTitanium);
    mainRing.name = "stator_main_ring";
    this.statorGroup.add(mainRing);

    const stepRingGeo = this.registerGeometry(
      new THREE.TorusGeometry(3.55, 0.05, 12, 80)
    );
    const stepRing = new THREE.Mesh(stepRingGeo, this.materials.anodizedObsidian);
    stepRing.name = "stator_outer_step";
    this.statorGroup.add(stepRing);

    const innerBevelRingGeo = this.registerGeometry(
      new THREE.TorusGeometry(3.05, 0.04, 12, 80)
    );
    const innerBevelRing = new THREE.Mesh(innerBevelRingGeo, this.materials.polishedSteel);
    innerBevelRing.name = "stator_inner_step";
    this.statorGroup.add(innerBevelRing);

    // Precision measurement ticks (36 ticks every 10 degrees, with major ticks every 30 degrees)
    const tickMajorGeo = this.registerGeometry(new THREE.BoxGeometry(0.04, 0.22, 0.03));
    const tickMinorGeo = this.registerGeometry(new THREE.BoxGeometry(0.02, 0.12, 0.02));

    for (let i = 0; i < 36; i++) {
      const angle = (i * Math.PI) / 18;
      const isMajor = i % 3 === 0;
      const geo = isMajor ? tickMajorGeo : tickMinorGeo;
      const mat = isMajor ? this.materials.polishedSteel : this.materials.measurementTicks;

      const tick = new THREE.Mesh(geo, mat);
      const radius = 3.3;
      tick.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.1);
      tick.rotation.z = angle + Math.PI / 2;
      tick.name = `stator_tick_${i}`;
      this.statorGroup.add(tick);
    }

    // 4 Structural mounting bosses with hardware pins
    const lugGeo = this.registerGeometry(new THREE.BoxGeometry(0.24, 0.35, 0.3));
    const pinGeo = this.registerGeometry(new THREE.CylinderGeometry(0.06, 0.06, 0.36, 16));

    const lugAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
    lugAngles.forEach((angle, idx) => {
      const lug = new THREE.Mesh(lugGeo, this.materials.anodizedObsidian);
      const r = 3.55;
      lug.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
      lug.rotation.z = angle;
      lug.name = `stator_mounting_lug_${idx}`;

      const pin = new THREE.Mesh(pinGeo, this.materials.machinedChrome);
      pin.rotation.x = Math.PI / 2;
      lug.add(pin);

      this.statorGroup.add(lug);
    });
  }

  /**
   * 2. OUTER GIMBAL
   * Independent multi-axis titanium gimbal ring with cylindrical pivot pins.
   */
  private buildGimbal(): void {
    const gimbalRingGeo = this.registerGeometry(
      new THREE.TorusGeometry(2.7, 0.09, 16, 72)
    );
    const gimbalRing = new THREE.Mesh(gimbalRingGeo, this.materials.polishedSteel);
    gimbalRing.name = "gimbal_ring_mesh";
    this.gimbalInnerGroup.add(gimbalRing);

    // Gimbal secondary chamfer ring
    const gimbalAccentGeo = this.registerGeometry(
      new THREE.TorusGeometry(2.52, 0.035, 12, 72)
    );
    const gimbalAccent = new THREE.Mesh(gimbalAccentGeo, this.materials.darkTitanium);
    this.gimbalInnerGroup.add(gimbalAccent);

    // Pivot pins along the gimbal X axis
    const pivotPinGeo = this.registerGeometry(new THREE.CylinderGeometry(0.08, 0.08, 0.38, 16));
    const pivotA = new THREE.Mesh(pivotPinGeo, this.materials.machinedChrome);
    pivotA.position.set(2.7, 0, 0);
    pivotA.rotation.z = Math.PI / 2;
    this.gimbalInnerGroup.add(pivotA);

    const pivotB = new THREE.Mesh(pivotPinGeo, this.materials.machinedChrome);
    pivotB.position.set(-2.7, 0, 0);
    pivotB.rotation.z = Math.PI / 2;
    this.gimbalInnerGroup.add(pivotB);
  }

  /**
   * 3. ROTOR ASSEMBLY
   * High-speed central slotted turbine disc with 24 angled radial blades.
   */
  private buildRotor(): void {
    // Outer turbine rim
    const turbineRimGeo = this.registerGeometry(
      new THREE.TorusGeometry(2.0, 0.08, 16, 64)
    );
    const turbineRim = new THREE.Mesh(turbineRimGeo, this.materials.polishedSteel);
    turbineRim.name = "rotor_rim";
    this.rotorGroup.add(turbineRim);

    // Center hub collar
    const hubCollarGeo = this.registerGeometry(
      new THREE.CylinderGeometry(0.9, 0.9, 0.22, 32, 1, false)
    );
    const hubCollar = new THREE.Mesh(hubCollarGeo, this.materials.darkTitanium);
    hubCollar.rotation.x = Math.PI / 2;
    hubCollar.name = "rotor_center_hub";
    this.rotorGroup.add(hubCollar);

    // 20 Slotted angled turbine blades
    const bladeGeo = this.registerGeometry(new THREE.BoxGeometry(0.06, 0.95, 0.08));
    const bladeCount = 20;

    for (let i = 0; i < bladeCount; i++) {
      const angle = (i * 2 * Math.PI) / bladeCount;
      const blade = new THREE.Mesh(bladeGeo, this.materials.machinedChrome);

      // Mid-radius between hub (0.9) and rim (2.0)
      const r = 1.45;
      blade.position.set(Math.cos(angle) * r, Math.sin(angle) * r, 0);
      // Pitch angle for mechanical turbine aesthetic
      blade.rotation.z = angle + Math.PI / 2;
      blade.rotation.y = 0.35;
      blade.name = `rotor_blade_${i}`;
      this.rotorGroup.add(blade);
    }
  }

  /**
   * 4. CENTRAL COMPUTATION CORE
   * Faceted geometric obsidian core with an internal electric-green emissive crystal.
   */
  private buildCore(): { coreMesh: THREE.Mesh; coreCrystal: THREE.Mesh } {
    // Outer faceted core cage
    const coreCageGeo = this.registerGeometry(new THREE.IcosahedronGeometry(0.72, 0));
    const coreCage = new THREE.Mesh(coreCageGeo, this.materials.anodizedObsidian);
    coreCage.name = "core_faceted_chassis";
    this.coreGroup.add(coreCage);

    // Inner glowing crystal
    const crystalGeo = this.registerGeometry(new THREE.OctahedronGeometry(0.48, 0));
    const crystal = new THREE.Mesh(crystalGeo, this.materials.electricGreenEmissive);
    crystal.name = "core_emissive_crystal";
    this.coreGroup.add(crystal);

    // Wireframe overlay on core
    const wireGeo = this.registerGeometry(new THREE.IcosahedronGeometry(0.76, 0));
    const wireMat = this.registerGeometry(
      new THREE.WireframeGeometry(wireGeo)
    );
    const wireLines = new THREE.LineSegments(
      wireMat,
      new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.35 })
    );
    this.coreGroup.add(wireLines);

    return { coreMesh: coreCage, coreCrystal: crystal };
  }

  /**
   * 5. ARTICULATED CALIPERS
   * Four mechanical arms at 90° intervals with radial linkage expansion.
   */
  private buildCalipers(): void {
    const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    const armBarGeo = this.registerGeometry(new THREE.BoxGeometry(0.12, 0.65, 0.12));
    const jawGeo = this.registerGeometry(new THREE.BoxGeometry(0.24, 0.42, 0.2));
    const pipGeo = this.registerGeometry(new THREE.CylinderGeometry(0.04, 0.04, 0.1, 12));

    angles.forEach((angle, idx) => {
      const caliperGroup = new THREE.Group();
      caliperGroup.name = `caliper_arm_${idx}`;

      // Arm linkage
      const armBar = new THREE.Mesh(armBarGeo, this.materials.darkTitanium);
      armBar.position.set(0, 0.32, 0);
      caliperGroup.add(armBar);

      // Caliper jaw
      const jaw = new THREE.Mesh(jawGeo, this.materials.polishedSteel);
      jaw.position.set(0, 0.72, 0);
      caliperGroup.add(jaw);

      // Status indicator pip
      const pip = new THREE.Mesh(pipGeo, this.materials.greenIndicator);
      pip.position.set(0, 0.72, 0.12);
      pip.rotation.x = Math.PI / 2;
      caliperGroup.add(pip);

      // Orient caliper group radially
      caliperGroup.rotation.z = angle - Math.PI / 2;
      const baseRadius = 2.15;
      caliperGroup.position.set(Math.cos(angle) * baseRadius, Math.sin(angle) * baseRadius, 0);

      this.calipersGroup.add(caliperGroup);
      this.calipers.push({
        group: caliperGroup,
        angle,
        baseRadius,
        jawMesh: jaw,
        indicatorMesh: pip,
      });
    });
  }

  /**
   * Highlights or resets individual mechanical assemblies based on UI hover/focus.
   */
  public setHighlight(component: ComponentId | null): void {
    this.activeComponent = component;

    // Reset base materials
    this.coreCrystalMesh.material = this.materials.electricGreenEmissive;
    this.coreMesh.material = this.materials.anodizedObsidian;

    if (component === "core") {
      this.materials.electricGreenEmissive.emissiveIntensity = 4.2;
    } else {
      this.materials.electricGreenEmissive.emissiveIntensity = 2.2;
    }

    if (component === "gimbal") {
      this.gimbalInnerGroup.scale.set(1.04, 1.04, 1.04);
    } else {
      this.gimbalInnerGroup.scale.set(1.0, 1.0, 1.0);
    }
  }

  /**
   * Evaluates the physical kinematics on every tick.
   */
  public update(
    time: number,
    deltaTime: number,
    scrollProgress: number,
    pointerDamped: { x: number; y: number },
    isReducedMotion: boolean
  ): void {
    if (isReducedMotion) {
      // Static beauty angle without continuous movement
      this.root.rotation.set(0.25, -0.35, 0.08);
      this.calipers.forEach((c) => {
        c.group.position.set(
          Math.cos(c.angle) * c.baseRadius,
          Math.sin(c.angle) * c.baseRadius,
          0
        );
      });
      return;
    }

    // 1. Stator: Subtle micro-wobble
    this.statorGroup.rotation.z = Math.sin(time * 0.15) * 0.03;

    // 2. Outer Gimbal: Weighted sinusoidal dual-axis oscillation
    this.gimbalOuterGroup.rotation.y = Math.sin(time * 0.35) * 0.22;
    this.gimbalInnerGroup.rotation.x = Math.cos(time * 0.28) * 0.18;

    // 3. Rotor Turbine: High-speed continuous rotation with scroll velocity acceleration
    const speedMultiplier = 1.0 + scrollProgress * 3.5;
    this.rotorAngle -= deltaTime * 1.6 * speedMultiplier;
    this.rotorGroup.rotation.z = this.rotorAngle;

    // 4. Central Core: Counter-rotation + breathing emissive pulse
    this.coreGroup.rotation.y = time * 0.4;
    this.coreGroup.rotation.x = time * 0.25;

    const pulse = 2.2 + 0.8 * Math.sin(time * 2.8);
    if (this.activeComponent !== "core") {
      this.materials.electricGreenEmissive.emissiveIntensity = pulse;
    }

    // 5. Articulated Calipers: Radial expansion triggered by scroll progress & hover
    const targetExpansion = Math.min(scrollProgress * 1.5, 0.8) + (this.activeComponent === "stator" ? 0.2 : 0);
    this.currentExpansion += (targetExpansion - this.currentExpansion) * 0.1;

    this.calipers.forEach((c) => {
      const currentR = c.baseRadius + this.currentExpansion;
      c.group.position.set(Math.cos(c.angle) * currentR, Math.sin(c.angle) * currentR, 0);
    });

    // 6. Root Parallax & Orientation from damped cursor
    const targetRotX = 0.2 + pointerDamped.y * 0.35;
    const targetRotY = -0.3 + pointerDamped.x * 0.45;
    this.root.rotation.x += (targetRotX - this.root.rotation.x) * 0.08;
    this.root.rotation.y += (targetRotY - this.root.rotation.y) * 0.08;
    this.root.rotation.z = Math.sin(time * 0.2) * 0.04;
  }

  public dispose(): void {
    this.ownedGeometries.forEach((geo) => geo.dispose());
    this.ownedGeometries = [];
    this.calipers = [];
  }
}
