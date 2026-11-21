import * as THREE from "three";

/**
 * MechanicalMaterials
 *
 * Centralizes PBR and emissive materials for the procedural mechanical artifact.
 * Reuses single-instance materials across instances to prevent GPU memory bloat.
 * Provides a procedural studio environment generator using PMREMGenerator.
 */
export class MechanicalMaterials {
  public darkTitanium: THREE.MeshStandardMaterial;
  public polishedSteel: THREE.MeshStandardMaterial;
  public machinedChrome: THREE.MeshStandardMaterial;
  public anodizedObsidian: THREE.MeshStandardMaterial;
  public electricGreenEmissive: THREE.MeshStandardMaterial;
  public greenIndicator: THREE.MeshBasicMaterial;
  public measurementTicks: THREE.MeshBasicMaterial;
  private environmentRenderTarget: THREE.WebGLRenderTarget | null = null;

  constructor() {
    this.darkTitanium = new THREE.MeshStandardMaterial({
      color: 0x1a1a22,
      metalness: 0.88,
      roughness: 0.32,
      name: "mat_dark_titanium",
    });

    this.polishedSteel = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.2,
      name: "mat_polished_steel",
    });

    this.machinedChrome = new THREE.MeshStandardMaterial({
      color: 0xdde4ec,
      metalness: 0.98,
      roughness: 0.12,
      name: "mat_machined_chrome",
    });

    this.anodizedObsidian = new THREE.MeshStandardMaterial({
      color: 0x0c0c10,
      metalness: 0.78,
      roughness: 0.44,
      name: "mat_anodized_obsidian",
    });

    this.electricGreenEmissive = new THREE.MeshStandardMaterial({
      color: 0x00ff66,
      emissive: new THREE.Color(0x00ff66),
      emissiveIntensity: 2.2,
      metalness: 0.6,
      roughness: 0.22,
      name: "mat_electric_green",
    });

    this.greenIndicator = new THREE.MeshBasicMaterial({
      color: 0x00ff66,
      name: "mat_green_indicator",
    });

    this.measurementTicks = new THREE.MeshBasicMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.8,
      name: "mat_measurement_ticks",
    });
  }

  /**
   * Generates a lightweight, procedural studio environment texture.
   * Ensures metallic PBR materials reflect realistic studio lighting without external HDR assets.
   */
  public generateStudioEnvironment(renderer: THREE.WebGLRenderer, scene: THREE.Scene): void {
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      pmremGenerator.compileEquirectangularShader();

      const envScene = new THREE.Scene();
      envScene.background = new THREE.Color(0x070709);

      // Key studio light (neutral cool white)
      const keyPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(16, 16),
        new THREE.MeshBasicMaterial({ color: 0xf1f5f9 })
      );
      keyPlane.position.set(10, 12, 10);
      keyPlane.lookAt(0, 0, 0);
      envScene.add(keyPlane);

      // Fill soft steel light
      const fillPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.MeshBasicMaterial({ color: 0x475569 })
      );
      fillPlane.position.set(-12, -6, 8);
      fillPlane.lookAt(0, 0, 0);
      envScene.add(fillPlane);

      // Rim specular light (subtle electric emerald)
      const rimPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(12, 12),
        new THREE.MeshBasicMaterial({ color: 0x00ff66 })
      );
      rimPlane.position.set(-8, 10, -12);
      rimPlane.lookAt(0, 0, 0);
      envScene.add(rimPlane);

      this.environmentRenderTarget = pmremGenerator.fromScene(envScene);
      scene.environment = this.environmentRenderTarget.texture;

      // Dispose temporary geometry
      keyPlane.geometry.dispose();
      fillPlane.geometry.dispose();
      rimPlane.geometry.dispose();
      pmremGenerator.dispose();
    } catch {
      // Graceful fallback to scene directional/ambient lighting if PMREM unsupported
    }
  }

  public dispose(): void {
    this.darkTitanium.dispose();
    this.polishedSteel.dispose();
    this.machinedChrome.dispose();
    this.anodizedObsidian.dispose();
    this.electricGreenEmissive.dispose();
    this.greenIndicator.dispose();
    this.measurementTicks.dispose();

    if (this.environmentRenderTarget) {
      this.environmentRenderTarget.dispose();
      this.environmentRenderTarget = null;
    }
  }
}
