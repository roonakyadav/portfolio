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
 * Encapsulates the WebGL lifecycle, scene graph, lights, procedural studio reflections,
 * camera damping, and rendering execution for the mechanical centerpiece.
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

  // Lights
  private keyLight: THREE.DirectionalLight;
  private fillLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
  private corePointLight: THREE.PointLight;

  constructor({ canvas, isMobile = false }: SceneOptions) {
    this.isMobile = isMobile;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    this.camera.position.set(0, 0, 11);
    this.camera.lookAt(0, 0, 0);

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

    // Lights
    this.keyLight = new THREE.DirectionalLight(0xe2e8f0, 2.2);
    this.keyLight.position.set(6, 8, 8);
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(0x64748b, 0.8);
    this.fillLight.position.set(-6, -4, 4);
    this.scene.add(this.fillLight);

    this.rimLight = new THREE.DirectionalLight(0x00ff66, 3.2);
    this.rimLight.position.set(-6, 8, -8);
    this.scene.add(this.rimLight);

    this.corePointLight = new THREE.PointLight(0x00ff66, 1.4, 7);
    this.corePointLight.position.set(0, 0, 0.5);
    this.scene.add(this.corePointLight);

    // Initialize mechanical rig
    this.rig = new KinematicsRig(this.materials);
    this.scene.add(this.rig.root);

    // Adjust model scale for composition
    const scale = isMobile ? 0.72 : 0.88;
    this.rig.root.scale.set(scale, scale, scale);
  }

  public setIsMobile(isMobile: boolean): void {
    this.isMobile = isMobile;
    const pixelRatio = Math.min(
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
      isMobile ? 1.0 : 1.5
    );
    this.renderer.setPixelRatio(pixelRatio);
    const scale = isMobile ? 0.72 : 0.88;
    this.rig.root.scale.set(scale, scale, scale);
  }

  public setPointer(normalizedX: number, normalizedY: number): void {
    if (this.isMobile) return;
    this.pointerTarget.x = normalizedX;
    this.pointerTarget.y = normalizedY;
  }

  public resize(width: number, height: number): void {
    if (width <= 0 || height <= 0) return;
    this.width = width;
    this.height = height;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
  }

  public highlightComponent(component: ComponentId | null): void {
    this.rig.setHighlight(component);
  }

  /**
   * Render frame executed on GSAP Ticker tick.
   *
   * @param time Total elapsed time in seconds
   * @param deltaTime Frame delta in seconds
   * @param scrollProgress Normalized scroll position [0..1]
   * @param isReducedMotion User prefers reduced motion
   */
  public render(
    time: number,
    deltaTime: number,
    scrollProgress: number,
    isReducedMotion: boolean
  ): void {
    // Damped camera & model tracking
    if (!isReducedMotion && !this.isMobile) {
      this.pointerDamped.x += (this.pointerTarget.x - this.pointerDamped.x) * 0.05;
      this.pointerDamped.y += (this.pointerTarget.y - this.pointerDamped.y) * 0.05;

      // Subtle camera translation
      this.camera.position.x = this.pointerDamped.x * 0.45;
      this.camera.position.y = this.pointerDamped.y * 0.35;
      this.camera.lookAt(0, 0, 0);
    } else {
      this.camera.position.set(0, 0, 11);
      this.camera.lookAt(0, 0, 0);
    }

    // Kinematics update
    this.rig.update(
      time,
      deltaTime,
      scrollProgress,
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
