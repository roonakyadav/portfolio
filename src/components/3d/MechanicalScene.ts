import * as THREE from "three";
import { MechanicalMaterials } from "./MechanicalMaterials";
import { KinematicsRig, ComponentId } from "./KinematicsRig";

export interface SceneOptions {
  canvas: HTMLCanvasElement;
  isMobile?: boolean;
}

/**
 * MechanicalScene
 *
 * Encapsulates the WebGL rendering lifecycle:
 * - Three-quarter elevated cinematic camera with smooth parallax and clamped orbit drag
 * - Native THREE.Raycaster mesh picking on interactive mechanical assemblies
 * - 4-phase scroll choreography and camera dollying
 * - Studio PBR lighting and environment reflections
 */
export class MechanicalScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public materials: MechanicalMaterials;
  public rig: KinematicsRig;

  private isMobile: boolean;
  private width = 1;
  private height = 1;

  // Normalized cursor coordinates [-1, 1]
  private pointerTarget = { x: 0, y: 0 };
  private pointerDamped = { x: 0, y: 0 };

  // Desktop Orbit Dragging
  private isDragging = false;
  private lastDragPos = { x: 0, y: 0 };
  private orbitTheta = 0; // Horizontal angle (radians)
  private orbitPhi = 0;   // Vertical angle (radians)
  private targetOrbitTheta = 0;
  private targetOrbitPhi = 0;

  // Camera baseline in three-quarter elevated perspective
  private baseRadius = 9.2;
  private currentScrollProgress = 0;

  // Raycasting
  private raycaster = new THREE.Raycaster();
  private pointerVec = new THREE.Vector2();

  // Studio Lights
  private keyLight: THREE.DirectionalLight;
  private fillLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
  private corePointLight: THREE.PointLight;

  constructor({ canvas, isMobile = false }: SceneOptions) {
    this.isMobile = isMobile;

    this.scene = new THREE.Scene();

    // Field of view 36 degrees for cinematic, compressed telephoto perspective
    this.camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
    this.updateCameraPosition(0);

    const pixelRatio = Math.min(
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
      isMobile ? 1.0 : 1.5
    );

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !isMobile,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(pixelRatio);

    // Initialize materials & procedural studio environment
    this.materials = new MechanicalMaterials();
    this.materials.generateStudioEnvironment(this.renderer, this.scene);

    // Balanced Cinematic Studio Lighting (clean metallic contrast without green wash)
    this.keyLight = new THREE.DirectionalLight(0xf8fafc, 1.4);
    this.keyLight.position.set(7, 9, 8);
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(0x64748b, 0.7);
    this.fillLight.position.set(-8, -2, 6);
    this.scene.add(this.fillLight);

    this.rimLight = new THREE.DirectionalLight(0xa5f3fc, 0.9);
    this.rimLight.position.set(-7, 8, -7);
    this.scene.add(this.rimLight);

    this.corePointLight = new THREE.PointLight(0x00ff66, 1.2, 5);
    this.corePointLight.position.set(0.7, 0.2, -0.2);
    this.scene.add(this.corePointLight);

    // Initialize mechanical rig
    this.rig = new KinematicsRig(this.materials);
    this.scene.add(this.rig.root);

    // Adjust model scale for composition
    const scale = isMobile ? 0.76 : 0.94;
    this.rig.root.scale.set(scale, scale, scale);
  }

  public setIsMobile(isMobile: boolean): void {
    this.isMobile = isMobile;
    const pixelRatio = Math.min(
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
      isMobile ? 1.0 : 1.5
    );
    this.renderer.setPixelRatio(pixelRatio);
    const scale = isMobile ? 0.76 : 0.94;
    this.rig.root.scale.set(scale, scale, scale);
  }

  public setPointer(normalizedX: number, normalizedY: number): void {
    if (this.isMobile) return;
    this.pointerTarget.x = normalizedX;
    this.pointerTarget.y = normalizedY;
  }

  /**
   * Raycasts into the scene to identify which mechanical assembly is under the cursor.
   */
  public raycast(normalizedX: number, normalizedY: number): ComponentId | null {
    this.pointerVec.set(normalizedX, normalizedY);
    this.raycaster.setFromCamera(this.pointerVec, this.camera);

    const interactiveMeshes = this.rig.getInteractiveMeshes();
    const intersects = this.raycaster.intersectObjects(interactiveMeshes, false);

    if (intersects.length > 0) {
      const topHit = intersects[0].object;
      return (topHit.userData.componentId as ComponentId) || null;
    }
    return null;
  }

  // --- Orbit Drag Interactivity (Restrained Desktop Rotation) ---
  public startDrag(clientX: number, clientY: number): void {
    if (this.isMobile) return;
    this.isDragging = true;
    this.lastDragPos.x = clientX;
    this.lastDragPos.y = clientY;
  }

  public updateDrag(clientX: number, clientY: number): void {
    if (!this.isDragging || this.isMobile) return;
    const dx = clientX - this.lastDragPos.x;
    const dy = clientY - this.lastDragPos.y;
    this.lastDragPos.x = clientX;
    this.lastDragPos.y = clientY;

    // Clamped orbit rotation: Theta within [-0.65, 0.65], Phi within [-0.35, 0.35]
    this.targetOrbitTheta = Math.max(-0.65, Math.min(0.65, this.targetOrbitTheta + dx * 0.006));
    this.targetOrbitPhi = Math.max(-0.35, Math.min(0.35, this.targetOrbitPhi - dy * 0.005));
  }

  public endDrag(): void {
    this.isDragging = false;
  }

  public resize(width: number, height: number): void {
    if (width <= 0 || height <= 0) return;
    this.width = width;
    this.height = height;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);

    // Responsive model scaling: adapts gracefully to prevent text/CTA overlap
    const baseScale = this.isMobile ? 0.72 : width < 1400 ? 0.78 : 0.88;
    this.rig.root.scale.set(baseScale, baseScale, baseScale);
  }

  public highlightComponent(component: ComponentId | null): void {
    this.rig.setHighlight(component);
  }

  /**
   * Explicit scroll progress setter.
   * Feeds directly into kinematics rig exploded view solver.
   */
  public setScrollProgress(progress: number): void {
    this.currentScrollProgress = progress;
    this.rig.setScrollProgress(progress);
  }

  /**
   * Updates camera position using three-quarter elevated spherical coordinates,
   * incorporating damped orbit drag, scroll dollying, and subtle pointer parallax.
   */
  private updateCameraPosition(scrollProgress: number): void {
    // Dolly closer in Phases B and C (distance reduces from 9.2 -> 7.4)
    let dollyFactor = 1.0;
    if (scrollProgress >= 0.2 && scrollProgress <= 0.8) {
      const dollyRamp = Math.sin(((scrollProgress - 0.2) / 0.6) * Math.PI);
      dollyFactor = 1.0 - dollyRamp * 0.22;
    }
    const currentRadius = this.baseRadius * dollyFactor;

    // Base three-quarter elevated angles: azimuth ~ 32 deg, elevation ~ 20 deg
    const baseTheta = 0.55 + this.orbitTheta + this.pointerDamped.x * 0.12;
    const basePhi = 0.35 + this.orbitPhi + this.pointerDamped.y * 0.1;

    // Calculate spherical camera position
    const camX = currentRadius * Math.sin(baseTheta) * Math.cos(basePhi);
    const camY = currentRadius * Math.sin(basePhi) + 0.3;
    const camZ = currentRadius * Math.cos(baseTheta) * Math.cos(basePhi);

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(0, 0.1, 0);
  }

  /**
   * Render frame executed on GSAP Ticker tick.
   */
  public render(
    time: number,
    deltaTime: number,
    scrollProgress: number,
    isReducedMotion: boolean
  ): void {
    if (!isReducedMotion) {
      // Damped pointer parallax
      this.pointerDamped.x += (this.pointerTarget.x - this.pointerDamped.x) * 0.06;
      this.pointerDamped.y += (this.pointerTarget.y - this.pointerDamped.y) * 0.06;

      // Damped orbit drag
      this.orbitTheta += (this.targetOrbitTheta - this.orbitTheta) * 0.08;
      this.orbitPhi += (this.targetOrbitPhi - this.orbitPhi) * 0.08;

      this.updateCameraPosition(scrollProgress);
    } else {
      this.camera.position.set(4.8, 2.6, 7.2);
      this.camera.lookAt(0, 0.1, 0);
    }

    // Kinematics update
    this.rig.update(
      time,
      deltaTime,
      this.pointerDamped,
      isReducedMotion
    );

    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    this.rig.dispose();
    this.materials.dispose();

    this.scene.remove(this.keyLight);
    this.scene.remove(this.fillLight);
    this.scene.remove(this.rimLight);
    this.scene.remove(this.corePointLight);

    this.keyLight.dispose();
    this.fillLight.dispose();
    this.rimLight.dispose();
    this.corePointLight.dispose();

    this.renderer.dispose();
  }
}
