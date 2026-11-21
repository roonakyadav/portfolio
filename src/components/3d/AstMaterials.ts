import * as THREE from "three";

/**
 * PBR and emissive materials calibrated for THE EXECUTION GRAPH:
 * The Monolithic AST & Parser Lattice.
 *
 * Cinematic dark charcoal, graphite, brushed surgical steel, and restrained
 * electric-green (#00FF66) phosphor accents. Carefully tuned roughness to avoid
 * specular blowouts while preserving crisp metallic edge bevels.
 */
export class AstMaterials {
  public darkTitanium: THREE.MeshStandardMaterial;
  public brushedSteel: THREE.MeshStandardMaterial;
  public obsidianGlass: THREE.MeshStandardMaterial;
  public conduitTrack: THREE.MeshStandardMaterial;
  public electricGreenEmissive: THREE.MeshStandardMaterial;
  public activePacket: THREE.MeshStandardMaterial;
  public highlightBracket: THREE.MeshStandardMaterial;
  public greenIndicator: THREE.MeshBasicMaterial;
  public measurementTicks: THREE.MeshBasicMaterial;
  public gridFloor: THREE.LineBasicMaterial;
  private environmentRenderTarget: THREE.WebGLRenderTarget | null = null;

  constructor() {
    // 1. Dark Titanium - Monolithic AST node bodies & socket housings
    this.darkTitanium = new THREE.MeshStandardMaterial({
      color: 0x181a1f,
      metalness: 0.84,
      roughness: 0.40,
      name: "mat_ast_dark_titanium",
    });

    // 2. Brushed Steel - Beveled top plates, socket rings & structural collars
    this.brushedSteel = new THREE.MeshStandardMaterial({
      color: 0x828f9e,
      metalness: 0.90,
      roughness: 0.30,
      name: "mat_ast_brushed_steel",
    });

    // 3. Obsidian Glass - Precision node caps & operand leaf pills
    this.obsidianGlass = new THREE.MeshStandardMaterial({
      color: 0x0c0e12,
      metalness: 0.55,
      roughness: 0.18,
      name: "mat_ast_obsidian_glass",
    });

    // 4. Conduit Track - Multi-lane planar bus tracks & routing highways
    this.conduitTrack = new THREE.MeshStandardMaterial({
      color: 0x20242c,
      metalness: 0.86,
      roughness: 0.34,
      name: "mat_ast_conduit_track",
    });

    // 5. Electric Green Emissive - Active logic channels & optical fiber traces
    this.electricGreenEmissive = new THREE.MeshStandardMaterial({
      color: 0x051a0d,
      emissive: new THREE.Color(0x00ff66),
      emissiveIntensity: 2.2,
      roughness: 0.25,
      metalness: 0.1,
      name: "mat_ast_electric_green",
    });

    // 6. Active Packet - Discrete silicon data packets traversing bus channels
    this.activePacket = new THREE.MeshStandardMaterial({
      color: 0x021208,
      emissive: new THREE.Color(0x00ff66),
      emissiveIntensity: 2.8,
      roughness: 0.20,
      metalness: 0.4,
      name: "mat_ast_active_packet",
    });

    // 7. Highlight Bracket - High-contrast selection outline bracket
    this.highlightBracket = new THREE.MeshStandardMaterial({
      color: 0x003311,
      emissive: new THREE.Color(0x00ff66),
      emissiveIntensity: 4.0,
      roughness: 0.15,
      metalness: 0.6,
      name: "mat_ast_highlight_bracket",
    });

    // 8. Basic Green Indicator - Telemetry pips & status LEDs
    this.greenIndicator = new THREE.MeshBasicMaterial({
      color: 0x00ff66,
      name: "mat_ast_green_indicator",
    });

    // 9. Measurement Ticks - Precision coordinate crosshairs and scale tick lines
    this.measurementTicks = new THREE.MeshBasicMaterial({
      color: 0x4a5568,
      transparent: true,
      opacity: 0.65,
      name: "mat_ast_measurement_ticks",
    });

    // 10. Subtle Coordinate Floor Grid
    this.gridFloor = new THREE.LineBasicMaterial({
      color: 0x1f242d,
      transparent: true,
      opacity: 0.45,
    });
  }

  /**
   * Generates a neutral, dark studio PMREM cube environment map for realistic
   * metallic anisotropic reflections without specular white blowouts.
   */
  public generateStudioEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08090b);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    // Studio key reflector plane (neutral soft cool white)
    const keyGeo = new THREE.PlaneGeometry(16, 16);
    const keyMat = new THREE.MeshBasicMaterial({ color: 0x3a424e, side: THREE.DoubleSide });
    const keyMesh = new THREE.Mesh(keyGeo, keyMat);
    keyMesh.position.set(12, 14, 10);
    keyMesh.lookAt(0, 0, 0);
    scene.add(keyMesh);

    // Studio fill reflector (deep slate/charcoal)
    const fillGeo = new THREE.PlaneGeometry(14, 14);
    const fillMat = new THREE.MeshBasicMaterial({ color: 0x161a22, side: THREE.DoubleSide });
    const fillMesh = new THREE.Mesh(fillGeo, fillMat);
    fillMesh.position.set(-14, 6, -10);
    fillMesh.lookAt(0, 0, 0);
    scene.add(fillMesh);

    // Subtle cool rim strip (surgical steel reflection)
    const rimGeo = new THREE.PlaneGeometry(20, 4);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x8a99a8, side: THREE.DoubleSide });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.set(0, -12, -14);
    rimMesh.lookAt(0, 0, 0);
    scene.add(rimMesh);

    this.environmentRenderTarget = pmremGenerator.fromScene(scene);

    // Assign generated studio environment to all PBR standard materials
    const envMap = this.environmentRenderTarget.texture;
    this.darkTitanium.envMap = envMap;
    this.brushedSteel.envMap = envMap;
    this.obsidianGlass.envMap = envMap;
    this.conduitTrack.envMap = envMap;
    this.electricGreenEmissive.envMap = envMap;
    this.activePacket.envMap = envMap;
    this.highlightBracket.envMap = envMap;

    this.darkTitanium.needsUpdate = true;
    this.brushedSteel.needsUpdate = true;
    this.obsidianGlass.needsUpdate = true;
    this.conduitTrack.needsUpdate = true;
    this.electricGreenEmissive.needsUpdate = true;
    this.activePacket.needsUpdate = true;
    this.highlightBracket.needsUpdate = true;

    pmremGenerator.dispose();
    keyGeo.dispose();
    keyMat.dispose();
    fillGeo.dispose();
    fillMat.dispose();
    rimGeo.dispose();
    rimMat.dispose();

    return envMap;
  }

  public dispose(): void {
    this.darkTitanium.dispose();
    this.brushedSteel.dispose();
    this.obsidianGlass.dispose();
    this.conduitTrack.dispose();
    this.electricGreenEmissive.dispose();
    this.activePacket.dispose();
    this.highlightBracket.dispose();
    this.greenIndicator.dispose();
    this.measurementTicks.dispose();
    this.gridFloor.dispose();
    if (this.environmentRenderTarget) {
      this.environmentRenderTarget.dispose();
      this.environmentRenderTarget = null;
    }
  }
}
