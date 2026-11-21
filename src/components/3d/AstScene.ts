import * as THREE from "three";
import { AstMaterials } from "./AstMaterials";
import { AstRig, AstComponentId, InteractiveAstMesh } from "./AstRig";

export interface AstRaycastHit {
  componentId: AstComponentId;
  point: THREE.Vector3;
  mesh: THREE.Mesh;
}

/**
 * AstScene: Manages WebGLRenderer, Three.js Scene, Camera, Studio Lighting,
 * Raycaster Mesh Picking, and Clamped Drag-to-Orbit.
 */
export class AstScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public rig: AstRig;
  public materials: AstMaterials;

  private canvas: HTMLCanvasElement;
  private raycaster: THREE.Raycaster;
  private pointer: THREE.Vector2;
  private ambientLight: THREE.AmbientLight;
  private keyLight: THREE.DirectionalLight;
  private fillLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
  private corePointLight: THREE.PointLight;

  // Clamped Orbit Drag State (Azimuth theta, Elevation phi)
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private targetTheta = 0;
  private currentTheta = 0;
  private targetPhi = 0;
  private currentPhi = 0;
  private readonly maxTheta = THREE.MathUtils.degToRad(35); // +/- 35 deg azimuth
  private readonly maxPhi = THREE.MathUtils.degToRad(20);   // +/- 20 deg elevation

  // Camera Base Position & Dollying
  private readonly baseCamRadius = 8.8;
  private readonly baseCamY = 2.8;
  private currentCamZ = 6.8;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();

    const aspect = canvas.clientWidth / Math.max(canvas.clientHeight, 1);
    this.camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
    this.camera.position.set(4.6, 2.8, 6.8);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.materials = new AstMaterials();
    this.materials.generateStudioEnvironment(this.renderer);

    // Studio Lighting Scheme
    this.ambientLight = new THREE.AmbientLight(0x0c0e12, 0.6);
    this.scene.add(this.ambientLight);

    // Key Light (Cool white studio softbox)
    this.keyLight = new THREE.DirectionalLight(0xddeeff, 1.4);
    this.keyLight.position.set(5.0, 8.0, 5.0);
    this.scene.add(this.keyLight);

    // Fill Light (Deep slate blue shadow recovery)
    this.fillLight = new THREE.DirectionalLight(0x4a5d6e, 0.6);
    this.fillLight.position.set(-6.0, 3.0, -4.0);
    this.scene.add(this.fillLight);

    // Rim Light (Surgical steel edge separator)
    this.rimLight = new THREE.DirectionalLight(0x8a99a8, 0.8);
    this.rimLight.position.set(0.0, -5.0, -6.0);
    this.scene.add(this.rimLight);

    // Central Logic Core Point Light (Restrained electric-green pulse)
    this.corePointLight = new THREE.PointLight(0x00ff66, 1.2, 8.0, 1.5);
    this.corePointLight.position.set(-0.4, 0.2, 0.6);
    this.scene.add(this.corePointLight);

    // Subtle Ground Coordinate Grid
    const gridHelper = new THREE.GridHelper(12, 12, 0x222a36, 0x141820);
    gridHelper.position.set(0, -2.2, 0);
    this.scene.add(gridHelper);

    // Initialize 3D AST Rig
    this.rig = new AstRig(this.materials);
    this.scene.add(this.rig.group);

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.resize(canvas.clientWidth, canvas.clientHeight);
  }

  /**
   * Raycast picking from normalized device coordinates [-1, 1].
   */
  public raycast(normX: number, normY: number): AstRaycastHit | null {
    this.pointer.set(normX, normY);
    this.raycaster.setFromCamera(this.pointer, this.camera);

    const interactiveMeshes = this.rig.getInteractiveMeshes();
    const intersects = this.raycaster.intersectObjects(interactiveMeshes, false);

    if (intersects.length > 0) {
      const topHit = intersects[0];
      const mesh = topHit.object as InteractiveAstMesh;
      if (mesh.userData && mesh.userData.componentId) {
        return {
          componentId: mesh.userData.componentId,
          point: topHit.point,
          mesh,
        };
      }
    }
    return null;
  }

  public setHighlight(componentId: AstComponentId | null): void {
    this.rig.setHighlight(componentId);
  }

  public setScrollProgress(progress: number): void {
    this.rig.setScrollProgress(progress);

    // Camera dollys smoothly from Z = 6.8 to 5.8 during compilation surge
    if (progress <= 0.45) {
      const p = progress / 0.45;
      this.currentCamZ = 6.8 - p * 1.0;
    } else if (progress <= 0.85) {
      this.currentCamZ = 5.8;
    } else {
      const p = (progress - 0.85) / 0.15;
      this.currentCamZ = 5.8 + p * 1.0;
    }
  }

  // Clamped Orbit Drag API
  public startDrag(clientX: number, clientY: number): void {
    this.isDragging = true;
    this.dragStartX = clientX;
    this.dragStartY = clientY;
  }

  public updateDrag(clientX: number, clientY: number): void {
    if (!this.isDragging) return;
    const deltaX = (clientX - this.dragStartX) * 0.0035;
    const deltaY = (clientY - this.dragStartY) * 0.0035;

    this.targetTheta = THREE.MathUtils.clamp(
      this.targetTheta + deltaX,
      -this.maxTheta,
      this.maxTheta
    );
    this.targetPhi = THREE.MathUtils.clamp(
      this.targetPhi + deltaY,
      -this.maxPhi,
      this.maxPhi
    );

    this.dragStartX = clientX;
    this.dragStartY = clientY;
  }

  public endDrag(): void {
    this.isDragging = false;
  }

  public render(delta: number): void {
    // Smooth damping spring return for orbit
    const returnSpeed = this.isDragging ? 0.15 : 0.05;
    const targetT = this.isDragging ? this.targetTheta : 0;
    const targetP = this.isDragging ? this.targetPhi : 0;

    this.currentTheta += (targetT - this.currentTheta) * returnSpeed;
    this.currentPhi += (targetP - this.currentPhi) * returnSpeed;

    // Camera elevated 3/4 perspective with clamped orbit
    const baseAngle = Math.atan2(4.6, this.currentCamZ);
    const effAngle = baseAngle + this.currentTheta;
    const radius = Math.sqrt(4.6 * 4.6 + this.currentCamZ * this.currentCamZ);

    this.camera.position.x = Math.sin(effAngle) * radius;
    this.camera.position.z = Math.cos(effAngle) * radius;
    this.camera.position.y = this.baseCamY + this.currentPhi * 3.0;
    this.camera.lookAt(0, 0, 0);

    // Subtle logic core pulse
    const time = performance.now() * 0.001;
    this.corePointLight.intensity = 1.0 + Math.sin(time * 3.0) * 0.4;

    this.rig.update(delta);
    this.renderer.render(this.scene, this.camera);
  }

  public resize(width: number, height: number): void {
    if (width <= 0 || height <= 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);

    // Dynamic model scaling to prevent encroaching on editorial text
    if (width <= 768) {
      this.rig.group.scale.set(0.70, 0.70, 0.70);
    } else if (width <= 1400) {
      this.rig.group.scale.set(0.78, 0.78, 0.78);
    } else {
      this.rig.group.scale.set(0.88, 0.88, 0.88);
    }
  }

  public dispose(): void {
    this.rig.dispose();
    this.materials.dispose();
    this.renderer.dispose();
    this.scene.clear();
  }
}
