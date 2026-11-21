import * as THREE from "three";
import { AstMaterials } from "./AstMaterials";

export type AstComponentId = "root" | "declarations" | "statements" | "expressions";

export interface InteractiveAstMesh extends THREE.Mesh {
  userData: {
    componentId: AstComponentId;
    isIndicator?: boolean;
    originalMaterial?: THREE.Material | THREE.Material[];
    originalScale?: THREE.Vector3;
    originalPosition?: THREE.Vector3;
  };
}

interface DataPacket {
  mesh: THREE.Mesh;
  path: THREE.Vector3[];
  t: number;
  speed: number;
}

/**
 * AstRig: The 3D Procedural Abstract Syntax Tree & Parser Lattice.
 *
 * Implements the approved Concept 1 for MACHINE / 001 — THE EXECUTION GRAPH.
 * Represents source-code parsing, scope declarations, control flow branching,
 * and expression evaluation in a cinematic, multi-layered 3D space.
 */
export class AstRig {
  public group: THREE.Group;
  public rootGroup: THREE.Group;
  public declarationsGroup: THREE.Group;
  public statementsGroup: THREE.Group;
  public expressionsGroup: THREE.Group;

  private materials: AstMaterials;
  private interactiveMeshes: InteractiveAstMesh[] = [];
  private ownedGeometries: THREE.BufferGeometry[] = [];
  private dataPackets: DataPacket[] = [];
  private activeHighlight: AstComponentId | null = null;
  private scrollProgress = 0;
  private basePacketSpeed = 0.4;
  private speedMultiplier = 1.0;

  // Sub-groups for distinct animation & exploded view mechanics
  private rootChassisGroup: THREE.Group;
  private declModule1Group: THREE.Group;
  private declModule2Group: THREE.Group;
  private stmtHighwayGroup: THREE.Group;
  private exprOperatorGroup: THREE.Group;

  constructor(materials: AstMaterials) {
    this.materials = materials;
    this.group = new THREE.Group();
    this.group.name = "ast_execution_graph";

    this.rootGroup = new THREE.Group();
    this.rootGroup.name = "root_assembly";

    this.declarationsGroup = new THREE.Group();
    this.declarationsGroup.name = "declarations_assembly";

    this.statementsGroup = new THREE.Group();
    this.statementsGroup.name = "statements_assembly";

    this.expressionsGroup = new THREE.Group();
    this.expressionsGroup.name = "expressions_assembly";

    this.rootChassisGroup = new THREE.Group();
    this.declModule1Group = new THREE.Group();
    this.declModule2Group = new THREE.Group();
    this.stmtHighwayGroup = new THREE.Group();
    this.exprOperatorGroup = new THREE.Group();

    this.rootGroup.add(this.rootChassisGroup);
    this.declarationsGroup.add(this.declModule1Group);
    this.declarationsGroup.add(this.declModule2Group);
    this.statementsGroup.add(this.stmtHighwayGroup);
    this.expressionsGroup.add(this.exprOperatorGroup);

    this.group.add(this.rootGroup);
    this.group.add(this.declarationsGroup);
    this.group.add(this.statementsGroup);
    this.group.add(this.expressionsGroup);

    this.buildSubsystems();
  }

  private registerGeometry<T extends THREE.BufferGeometry>(geo: T): T {
    this.ownedGeometries.push(geo);
    return geo;
  }

  private registerInteractiveMesh(mesh: THREE.Mesh, componentId: AstComponentId, isIndicator = false): void {
    const iMesh = mesh as InteractiveAstMesh;
    iMesh.userData = {
      componentId,
      isIndicator,
      originalMaterial: mesh.material,
      originalScale: mesh.scale.clone(),
      originalPosition: mesh.position.clone(),
    };
    this.interactiveMeshes.push(iMesh);
  }

  private buildSubsystems(): void {
    this.buildRootAssembly();
    this.buildDeclarationsAssembly();
    this.buildStatementsAssembly();
    this.buildExpressionsAssembly();
    this.buildConduitHighways();
    this.initDataPackets();
  }

  /**
   * 1. PARSE ROOT ASSEMBLY (SYS.01 // PARSE_ROOT)
   * Hexagonal monolithic titanium anchor plate, token input feeder sockets,
   * and lexer reference stage.
   */
  private buildRootAssembly(): void {
    // A. Main Hexagonal Root Plate (X = -2.2, Y = -1.2, Z = 0.4)
    // 6-sided cylinder with beveled steel top plate
    const rootGeo = this.registerGeometry(new THREE.CylinderGeometry(1.25, 1.35, 0.35, 6));
    const rootMesh = new THREE.Mesh(rootGeo, this.materials.darkTitanium);
    rootMesh.position.set(-2.2, -1.2, 0.4);
    this.registerInteractiveMesh(rootMesh, "root");
    this.rootChassisGroup.add(rootMesh);

    // Beveled surgical steel top plate
    const topPlateGeo = this.registerGeometry(new THREE.CylinderGeometry(1.1, 1.15, 0.08, 6));
    const topPlateMesh = new THREE.Mesh(topPlateGeo, this.materials.brushedSteel);
    topPlateMesh.position.set(-2.2, -1.0, 0.4);
    this.registerInteractiveMesh(topPlateMesh, "root");
    this.rootChassisGroup.add(topPlateMesh);

    // Central Obsidian Scope Window
    const windowGeo = this.registerGeometry(new THREE.CylinderGeometry(0.75, 0.75, 0.04, 6));
    const windowMesh = new THREE.Mesh(windowGeo, this.materials.obsidianGlass);
    windowMesh.position.set(-2.2, -0.94, 0.4);
    this.registerInteractiveMesh(windowMesh, "root");
    this.rootChassisGroup.add(windowMesh);

    // B. Token Feeder Conduit Sockets
    [-0.5, 0.5].forEach((offset) => {
      const socketGeo = this.registerGeometry(new THREE.BoxGeometry(0.4, 0.22, 0.6));
      const socketMesh = new THREE.Mesh(socketGeo, this.materials.brushedSteel);
      socketMesh.position.set(-3.2, -1.15, 0.4 + offset);
      this.registerInteractiveMesh(socketMesh, "root");
      this.rootChassisGroup.add(socketMesh);
    });

    // C. Lexer Sink Secondary Plate (Right Outrigger at X = 2.4, Y = -1.4, Z = -0.5)
    const sinkGeo = this.registerGeometry(new THREE.CylinderGeometry(0.85, 0.95, 0.28, 6));
    const sinkMesh = new THREE.Mesh(sinkGeo, this.materials.darkTitanium);
    sinkMesh.position.set(2.4, -1.4, -0.5);
    this.registerInteractiveMesh(sinkMesh, "root");
    this.rootChassisGroup.add(sinkMesh);

    const sinkPlateGeo = this.registerGeometry(new THREE.CylinderGeometry(0.75, 0.8, 0.06, 6));
    const sinkPlateMesh = new THREE.Mesh(sinkPlateGeo, this.materials.brushedSteel);
    sinkPlateMesh.position.set(2.4, -1.24, -0.5);
    this.registerInteractiveMesh(sinkPlateMesh, "root");
    this.rootChassisGroup.add(sinkPlateMesh);

    // Perimeter Electric Green Status Pips on Root
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const pipGeo = this.registerGeometry(new THREE.BoxGeometry(0.12, 0.05, 0.06));
      const pipMesh = new THREE.Mesh(pipGeo, this.materials.electricGreenEmissive);
      pipMesh.position.set(
        -2.2 + Math.cos(angle) * 1.18,
        -1.0,
        0.4 + Math.sin(angle) * 1.18
      );
      pipMesh.rotation.y = -angle;
      this.registerInteractiveMesh(pipMesh, "root", true);
      this.rootChassisGroup.add(pipMesh);
    }
  }

  /**
   * 2. DECLARATIONS ASSEMBLY (SYS.02 // SCOPE_DECL)
   * Function declaration modules, type definition blocks, and parameter sockets.
   */
  private buildDeclarationsAssembly(): void {
    // Module 1: FUNCTION_DECL [01] (Left elevated block: X = -1.4, Y = 0.4, Z = 0.0)
    const decl1BaseGeo = this.registerGeometry(new THREE.BoxGeometry(1.8, 0.35, 1.1));
    const decl1Base = new THREE.Mesh(decl1BaseGeo, this.materials.darkTitanium);
    decl1Base.position.set(-1.4, 0.4, 0.0);
    this.registerInteractiveMesh(decl1Base, "declarations");
    this.declModule1Group.add(decl1Base);

    const decl1TopGeo = this.registerGeometry(new THREE.BoxGeometry(1.6, 0.08, 0.95));
    const decl1Top = new THREE.Mesh(decl1TopGeo, this.materials.brushedSteel);
    decl1Top.position.set(-1.4, 0.6, 0.0);
    this.registerInteractiveMesh(decl1Top, "declarations");
    this.declModule1Group.add(decl1Top);

    // Function Scope Identifier Plate
    const decl1LabelGeo = this.registerGeometry(new THREE.BoxGeometry(1.2, 0.04, 0.5));
    const decl1Label = new THREE.Mesh(decl1LabelGeo, this.materials.obsidianGlass);
    decl1Label.position.set(-1.4, 0.66, 0.0);
    this.registerInteractiveMesh(decl1Label, "declarations");
    this.declModule1Group.add(decl1Label);

    // Function 1 Status LED strip
    const decl1LedGeo = this.registerGeometry(new THREE.BoxGeometry(1.4, 0.03, 0.04));
    const decl1Led = new THREE.Mesh(decl1LedGeo, this.materials.electricGreenEmissive);
    decl1Led.position.set(-1.4, 0.66, 0.35);
    this.registerInteractiveMesh(decl1Led, "declarations", true);
    this.declModule1Group.add(decl1Led);

    // Module 2: FUNCTION_DECL [02] (Right mid block: X = 1.5, Y = 0.3, Z = -0.4)
    const decl2BaseGeo = this.registerGeometry(new THREE.BoxGeometry(1.6, 0.32, 1.0));
    const decl2Base = new THREE.Mesh(decl2BaseGeo, this.materials.darkTitanium);
    decl2Base.position.set(1.5, 0.3, -0.4);
    this.registerInteractiveMesh(decl2Base, "declarations");
    this.declModule2Group.add(decl2Base);

    const decl2TopGeo = this.registerGeometry(new THREE.BoxGeometry(1.4, 0.08, 0.85));
    const decl2Top = new THREE.Mesh(decl2TopGeo, this.materials.brushedSteel);
    decl2Top.position.set(1.5, 0.48, -0.4);
    this.registerInteractiveMesh(decl2Top, "declarations");
    this.declModule2Group.add(decl2Top);

    // Module 3: TYPE_DEF [STRUCT] (Center background bridge block: X = 0.0, Y = 0.9, Z = -1.1)
    const typeDefGeo = this.registerGeometry(new THREE.BoxGeometry(1.4, 0.28, 0.8));
    const typeDefMesh = new THREE.Mesh(typeDefGeo, this.materials.darkTitanium);
    typeDefMesh.position.set(0.0, 0.9, -1.1);
    this.registerInteractiveMesh(typeDefMesh, "declarations");
    this.declarationsGroup.add(typeDefMesh);

    const typeDefTopGeo = this.registerGeometry(new THREE.BoxGeometry(1.2, 0.06, 0.65));
    const typeDefTop = new THREE.Mesh(typeDefTopGeo, this.materials.brushedSteel);
    typeDefTop.position.set(0.0, 1.06, -1.1);
    this.registerInteractiveMesh(typeDefTop, "declarations");
    this.declarationsGroup.add(typeDefTop);
  }

  /**
   * 3. STATEMENTS ASSEMBLY (SYS.03 // STMT_FLOW)
   * Statement list highways, conditional branch gate, and while loop feedback track.
   */
  private buildStatementsAssembly(): void {
    // A. Main Statement List Highway Block (X = -0.4, Y = -0.2, Z = 0.6)
    const stmtMainGeo = this.registerGeometry(new THREE.BoxGeometry(2.2, 0.3, 1.2));
    const stmtMain = new THREE.Mesh(stmtMainGeo, this.materials.darkTitanium);
    stmtMain.position.set(-0.4, -0.2, 0.6);
    this.registerInteractiveMesh(stmtMain, "statements");
    this.stmtHighwayGroup.add(stmtMain);

    const stmtMainTopGeo = this.registerGeometry(new THREE.BoxGeometry(2.0, 0.06, 1.0));
    const stmtMainTop = new THREE.Mesh(stmtMainTopGeo, this.materials.brushedSteel);
    stmtMainTop.position.set(-0.4, -0.02, 0.6);
    this.registerInteractiveMesh(stmtMainTop, "statements");
    this.stmtHighwayGroup.add(stmtMainTop);

    // B. Conditional Logic Branch Gate (IF_BRANCH at X = -1.2, Y = -0.7, Z = 1.3)
    const ifBranchGeo = this.registerGeometry(new THREE.BoxGeometry(1.1, 0.25, 0.75));
    const ifBranch = new THREE.Mesh(ifBranchGeo, this.materials.darkTitanium);
    ifBranch.position.set(-1.2, -0.7, 1.3);
    this.registerInteractiveMesh(ifBranch, "statements");
    this.statementsGroup.add(ifBranch);

    const ifBranchCapGeo = this.registerGeometry(new THREE.BoxGeometry(0.95, 0.05, 0.6));
    const ifBranchCap = new THREE.Mesh(ifBranchCapGeo, this.materials.obsidianGlass);
    ifBranchCap.position.set(-1.2, -0.55, 1.3);
    this.registerInteractiveMesh(ifBranchCap, "statements");
    this.statementsGroup.add(ifBranchCap);

    // C. Iterative Feedback Track (WHILE_LOOP at X = 0.7, Y = -0.5, Z = 1.0)
    const whileGeo = this.registerGeometry(new THREE.BoxGeometry(1.2, 0.25, 0.8));
    const whileMesh = new THREE.Mesh(whileGeo, this.materials.darkTitanium);
    whileMesh.position.set(0.7, -0.5, 1.0);
    this.registerInteractiveMesh(whileMesh, "statements");
    this.statementsGroup.add(whileMesh);

    // Dual Parallel Side Rails on Statement Highway (Glowing bus traces)
    [-0.45, 0.45].forEach((zOff) => {
      const railGeo = this.registerGeometry(new THREE.BoxGeometry(2.1, 0.03, 0.04));
      const rail = new THREE.Mesh(railGeo, this.materials.electricGreenEmissive);
      rail.position.set(-0.4, 0.02, 0.6 + zOff);
      this.registerInteractiveMesh(rail, "statements", true);
      this.stmtHighwayGroup.add(rail);
    });
  }

  /**
   * 4. EXPRESSIONS ASSEMBLY (SYS.04 // EXPR_EVAL)
   * Expression evaluation blocks, binary arithmetic operator nodes, and leaf operands.
   */
  private buildExpressionsAssembly(): void {
    // A. Main Expression Evaluator Block (X = -0.2, Y = -1.1, Z = 1.7)
    const expr1Geo = this.registerGeometry(new THREE.BoxGeometry(1.5, 0.25, 0.9));
    const expr1 = new THREE.Mesh(expr1Geo, this.materials.darkTitanium);
    expr1.position.set(-0.2, -1.1, 1.7);
    this.registerInteractiveMesh(expr1, "expressions");
    this.exprOperatorGroup.add(expr1);

    const expr1TopGeo = this.registerGeometry(new THREE.BoxGeometry(1.35, 0.05, 0.75));
    const expr1Top = new THREE.Mesh(expr1TopGeo, this.materials.brushedSteel);
    expr1Top.position.set(-0.2, -0.95, 1.7);
    this.registerInteractiveMesh(expr1Top, "expressions");
    this.exprOperatorGroup.add(expr1Top);

    // B. Binary Operator Diamond [BINARY_OP: ADD / MUL] (X = 0.8, Y = -1.0, Z = 1.8)
    const opDiamondGeo = this.registerGeometry(new THREE.BoxGeometry(0.65, 0.22, 0.65));
    const opDiamond = new THREE.Mesh(opDiamondGeo, this.materials.brushedSteel);
    opDiamond.rotation.y = Math.PI / 4;
    opDiamond.position.set(0.8, -1.0, 1.8);
    this.registerInteractiveMesh(opDiamond, "expressions");
    this.exprOperatorGroup.add(opDiamond);

    // Operator Core Emissive Gem
    const gemGeo = this.registerGeometry(new THREE.BoxGeometry(0.32, 0.12, 0.32));
    const gem = new THREE.Mesh(gemGeo, this.materials.electricGreenEmissive);
    gem.rotation.y = Math.PI / 4;
    gem.position.set(0.8, -0.86, 1.8);
    this.registerInteractiveMesh(gem, "expressions", true);
    this.exprOperatorGroup.add(gem);

    // C. Operand Leaf Nodes (Pills: Identifier `result`, Constant `0x3F`)
    const leaf1Geo = this.registerGeometry(new THREE.BoxGeometry(0.7, 0.18, 0.4));
    const leaf1 = new THREE.Mesh(leaf1Geo, this.materials.obsidianGlass);
    leaf1.position.set(1.7, -1.15, 1.6);
    this.registerInteractiveMesh(leaf1, "expressions");
    this.expressionsGroup.add(leaf1);

    const leaf2Geo = this.registerGeometry(new THREE.BoxGeometry(0.6, 0.18, 0.4));
    const leaf2 = new THREE.Mesh(leaf2Geo, this.materials.obsidianGlass);
    leaf2.position.set(-1.3, -1.2, 2.0);
    this.registerInteractiveMesh(leaf2, "expressions");
    this.expressionsGroup.add(leaf2);

    // Operand Status Markers
    [leaf1, leaf2].forEach((leaf) => {
      const markGeo = this.registerGeometry(new THREE.BoxGeometry(0.35, 0.02, 0.04));
      const mark = new THREE.Mesh(markGeo, this.materials.electricGreenEmissive);
      mark.position.set(leaf.position.x, leaf.position.y + 0.1, leaf.position.z);
      this.registerInteractiveMesh(mark, "expressions", true);
      this.expressionsGroup.add(mark);
    });
  }

  /**
   * 5. ARCHITECTURAL CONDUIT HIGHWAYS
   * Multi-lane planar bus tracks connecting stages in 3D (no wire noodles!).
   */
  private buildConduitHighways(): void {
    // Highway 1: Root (-2.2, -1.2, 0.4) -> Declaration 1 (-1.4, 0.4, 0.0)
    this.createConduitTrack(
      new THREE.Vector3(-2.2, -1.0, 0.4),
      new THREE.Vector3(-1.8, -0.2, 0.2),
      new THREE.Vector3(-1.4, 0.4, 0.0)
    );

    // Highway 2: Declaration 1 (-1.4, 0.4, 0.0) -> Statement Main (-0.4, -0.2, 0.6)
    this.createConduitTrack(
      new THREE.Vector3(-1.4, 0.4, 0.0),
      new THREE.Vector3(-0.9, 0.1, 0.3),
      new THREE.Vector3(-0.4, -0.02, 0.6)
    );

    // Highway 3: Statement Main (-0.4, -0.02, 0.6) -> Expression 1 (-0.2, -0.95, 1.7)
    this.createConduitTrack(
      new THREE.Vector3(-0.4, -0.02, 0.6),
      new THREE.Vector3(-0.3, -0.5, 1.1),
      new THREE.Vector3(-0.2, -0.95, 1.7)
    );

    // Highway 4: Expression 1 (-0.2, -0.95, 1.7) -> Binary Op (0.8, -1.0, 1.8)
    this.createConduitTrack(
      new THREE.Vector3(-0.2, -0.95, 1.7),
      new THREE.Vector3(0.3, -0.98, 1.75),
      new THREE.Vector3(0.8, -1.0, 1.8)
    );

    // Highway 5: Declaration 1 -> Type Def (0.0, 0.9, -1.1) -> Declaration 2 (1.5, 0.3, -0.4)
    this.createConduitTrack(
      new THREE.Vector3(-1.4, 0.4, 0.0),
      new THREE.Vector3(-0.7, 0.7, -0.6),
      new THREE.Vector3(0.0, 0.9, -1.1)
    );
    this.createConduitTrack(
      new THREE.Vector3(0.0, 0.9, -1.1),
      new THREE.Vector3(0.8, 0.6, -0.8),
      new THREE.Vector3(1.5, 0.3, -0.4)
    );
  }

  private createConduitTrack(p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3): void {
    // Two-segment orthogonal/angled structural bus track
    const seg1Dir = new THREE.Vector3().subVectors(p2, p1);
    const seg1Len = seg1Dir.length();
    const seg1Center = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    const track1Geo = this.registerGeometry(new THREE.BoxGeometry(0.24, 0.05, seg1Len));
    const track1 = new THREE.Mesh(track1Geo, this.materials.conduitTrack);
    track1.position.copy(seg1Center);
    track1.lookAt(p2);
    this.group.add(track1);

    // Embedded green optical core
    const core1Geo = this.registerGeometry(new THREE.BoxGeometry(0.08, 0.06, seg1Len * 0.95));
    const core1 = new THREE.Mesh(core1Geo, this.materials.electricGreenEmissive);
    core1.position.copy(seg1Center);
    core1.lookAt(p2);
    this.group.add(core1);

    const seg2Dir = new THREE.Vector3().subVectors(p3, p2);
    const seg2Len = seg2Dir.length();
    const seg2Center = new THREE.Vector3().addVectors(p2, p3).multiplyScalar(0.5);

    const track2Geo = this.registerGeometry(new THREE.BoxGeometry(0.24, 0.05, seg2Len));
    const track2 = new THREE.Mesh(track2Geo, this.materials.conduitTrack);
    track2.position.copy(seg2Center);
    track2.lookAt(p3);
    this.group.add(track2);

    const core2Geo = this.registerGeometry(new THREE.BoxGeometry(0.08, 0.06, seg2Len * 0.95));
    const core2 = new THREE.Mesh(core2Geo, this.materials.electricGreenEmissive);
    core2.position.copy(seg2Center);
    core2.lookAt(p3);
    this.group.add(core2);
  }

  /**
   * 6. DATA PACKET STREAMING SYSTEM
   * Silicon micro-packet blocks traversing along defined 3D waypoint paths.
   */
  private initDataPackets(): void {
    // Path 1: Root -> Decl1 -> StmtMain -> Expr1 -> BinOp -> Leaf1
    const path1 = [
      new THREE.Vector3(-2.2, -0.9, 0.4),
      new THREE.Vector3(-1.8, -0.2, 0.2),
      new THREE.Vector3(-1.4, 0.5, 0.0),
      new THREE.Vector3(-0.9, 0.1, 0.3),
      new THREE.Vector3(-0.4, 0.05, 0.6),
      new THREE.Vector3(-0.3, -0.5, 1.1),
      new THREE.Vector3(-0.2, -0.9, 1.7),
      new THREE.Vector3(0.8, -0.95, 1.8),
      new THREE.Vector3(1.7, -1.1, 1.6),
    ];

    // Path 2: Root -> Lexer Sink -> Decl2 -> TypeDef
    const path2 = [
      new THREE.Vector3(-2.2, -0.9, 0.4),
      new THREE.Vector3(0.0, -1.2, 0.0),
      new THREE.Vector3(2.4, -1.2, -0.5),
      new THREE.Vector3(1.5, 0.4, -0.4),
      new THREE.Vector3(0.0, 1.0, -1.1),
    ];

    const packetGeo = this.registerGeometry(new THREE.BoxGeometry(0.12, 0.08, 0.2));

    // Spawn 16 packets along path 1
    for (let i = 0; i < 16; i++) {
      const mesh = new THREE.Mesh(packetGeo, this.materials.activePacket);
      this.group.add(mesh);
      this.dataPackets.push({
        mesh,
        path: path1,
        t: i / 16,
        speed: 0.15 + (i % 3) * 0.02,
      });
    }

    // Spawn 8 packets along path 2
    for (let i = 0; i < 8; i++) {
      const mesh = new THREE.Mesh(packetGeo, this.materials.activePacket);
      this.group.add(mesh);
      this.dataPackets.push({
        mesh,
        path: path2,
        t: i / 8,
        speed: 0.12 + (i % 2) * 0.03,
      });
    }
  }

  /**
   * Continuous animation update driven by single clock (GSAP ticker).
   */
  public update(delta: number): void {
    const time = performance.now() * 0.001;
    const effectiveSpeed = this.basePacketSpeed * this.speedMultiplier;

    // 1. Advance data packets along waypoints
    this.dataPackets.forEach((p) => {
      p.t += delta * effectiveSpeed * p.speed;
      if (p.t > 1.0) p.t -= 1.0;

      const path = p.path;
      const totalSegments = path.length - 1;
      const progress = p.t * totalSegments;
      const index = Math.floor(progress);
      const frac = progress - index;

      const pStart = path[Math.min(index, totalSegments - 1)];
      const pEnd = path[Math.min(index + 1, totalSegments)];

      p.mesh.position.lerpVectors(pStart, pEnd, frac);
      p.mesh.lookAt(pEnd);
    });

    // 2. Subtle organic breathing float on node modules (CS state oscillation)
    this.declModule1Group.position.y = Math.sin(time * 1.5) * 0.03;
    this.declModule2Group.position.y = Math.cos(time * 1.8) * 0.03;
    this.stmtHighwayGroup.position.y = Math.sin(time * 1.2 + 1.0) * 0.025;
    this.exprOperatorGroup.position.y = Math.cos(time * 1.6 + 0.5) * 0.03;
  }

  /**
   * Manages distinct visual highlighting on AST subsystems.
   */
  public setHighlight(componentId: AstComponentId | null): void {
    this.activeHighlight = componentId;

    // Reset default scales and emissive intensities
    this.rootChassisGroup.position.y = 0;
    this.declModule1Group.scale.set(1.0, 1.0, 1.0);
    this.declModule2Group.scale.set(1.0, 1.0, 1.0);
    this.stmtHighwayGroup.scale.set(1.0, 1.0, 1.0);
    this.exprOperatorGroup.scale.set(1.0, 1.0, 1.0);
    this.materials.electricGreenEmissive.emissiveIntensity = 2.2;

    if (!componentId) return;

    switch (componentId) {
      case "root":
        this.rootChassisGroup.position.y = 0.12;
        this.materials.electricGreenEmissive.emissiveIntensity = 3.6;
        break;
      case "declarations":
        this.declModule1Group.scale.set(1.06, 1.06, 1.06);
        this.declModule2Group.scale.set(1.06, 1.06, 1.06);
        this.materials.electricGreenEmissive.emissiveIntensity = 4.2;
        break;
      case "statements":
        this.stmtHighwayGroup.scale.set(1.05, 1.05, 1.05);
        this.materials.electricGreenEmissive.emissiveIntensity = 4.5;
        break;
      case "expressions":
        this.exprOperatorGroup.scale.set(1.1, 1.1, 1.1);
        this.materials.electricGreenEmissive.emissiveIntensity = 5.0;
        break;
    }
  }

  /**
   * 4-Phase GSAP Scroll Choreography
   * Progress [0.0 -> 1.0] scrubbed by ScrollTrigger:
   * - Phase 1 (0.0 -> 0.20): Assembled Idle
   * - Phase 2 (0.20 -> 0.45): Compilation Surge & Acceleration
   * - Phase 3 (0.45 -> 0.85): Exploded Intermediate Representation (IR) Lowering
   * - Phase 4 (0.85 -> 1.0): Bytecode Convergence & Reassembly
   */
  public setScrollProgress(progress: number): void {
    this.scrollProgress = progress;

    if (progress <= 0.2) {
      // Phase 1: Assembled Idle
      this.speedMultiplier = 1.0;
      this.rootGroup.position.set(0, 0, 0);
      this.declarationsGroup.position.set(0, 0, 0);
      this.statementsGroup.position.set(0, 0, 0);
      this.expressionsGroup.position.set(0, 0, 0);
    } else if (progress <= 0.45) {
      // Phase 2: Compilation Surge (accelerate data packets, subtle node tension)
      const p = (progress - 0.2) / 0.25;
      this.speedMultiplier = 1.0 + p * 3.0; // accelerates to 4x throughput
      this.rootGroup.position.set(0, 0, 0);
      this.declarationsGroup.position.set(0, p * 0.1, 0);
      this.statementsGroup.position.set(0, -p * 0.05, 0);
      this.expressionsGroup.position.set(0, 0, p * 0.1);
    } else if (progress <= 0.85) {
      // Phase 3: Exploded Intermediate Representation (delaminate along 3D axes)
      const p = (progress - 0.45) / 0.4;
      this.speedMultiplier = 4.0 - p * 1.5;

      // Root shifts downward and back
      this.rootGroup.position.set(-p * 1.4, -p * 1.2, -p * 0.8);

      // Declarations lift upward along syntax hierarchy
      this.declarationsGroup.position.set(p * 0.6, p * 1.6, -p * 0.6);

      // Statements slide laterally along statement highway
      this.statementsGroup.position.set(-p * 1.5, p * 0.2, p * 0.9);

      // Expressions fan forward towards viewer
      this.expressionsGroup.position.set(p * 1.2, -p * 0.5, p * 1.8);
    } else {
      // Phase 4: Bytecode Convergence (smooth elastic reassembly)
      const p = (progress - 0.85) / 0.15;
      const invP = 1.0 - p;
      this.speedMultiplier = 2.5 - p * 1.5;

      this.rootGroup.position.set(-invP * 1.4, -invP * 1.2, -invP * 0.8);
      this.declarationsGroup.position.set(invP * 0.6, invP * 1.6, -invP * 0.6);
      this.statementsGroup.position.set(-invP * 1.5, invP * 0.2, invP * 0.9);
      this.expressionsGroup.position.set(invP * 1.2, -invP * 0.5, invP * 1.8);
    }
  }

  public getInteractiveMeshes(): InteractiveAstMesh[] {
    return this.interactiveMeshes;
  }

  public dispose(): void {
    this.ownedGeometries.forEach((geo) => geo.dispose());
    this.ownedGeometries = [];
    this.interactiveMeshes = [];
    this.dataPackets = [];
  }
}
