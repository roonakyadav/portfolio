import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { AstMaterials } from "@/components/3d/AstMaterials";
import { AstRig } from "@/components/3d/AstRig";
import { FallbackBlueprint } from "@/components/3d/FallbackBlueprint";
import { AstCenterpiece } from "@/components/3d/AstCenterpiece";

describe("THE EXECUTION GRAPH: 3D Subsystems & Interaction", () => {
  it("initializes PBR materials with calibrated computer science parameters", () => {
    const materials = new AstMaterials();

    expect(materials.darkTitanium.metalness).toBeCloseTo(0.84, 2);
    expect(materials.darkTitanium.roughness).toBeCloseTo(0.40, 2);
    expect(materials.brushedSteel.metalness).toBeCloseTo(0.90, 2);
    expect(materials.obsidianGlass.metalness).toBeCloseTo(0.55, 2);
    expect(materials.electricGreenEmissive.emissive.getHexString()).toBe("00ff66");

    materials.dispose();
  });

  it("builds the 4-subsystem AST execution graph hierarchy with interactive raycast registration", () => {
    const materials = new AstMaterials();
    const rig = new AstRig(materials);

    // Verify all 4 major assemblies exist
    expect(rig.rootGroup.name).toBe("root_assembly");
    expect(rig.declarationsGroup.name).toBe("declarations_assembly");
    expect(rig.statementsGroup.name).toBe("statements_assembly");
    expect(rig.expressionsGroup.name).toBe("expressions_assembly");

    // Check raycast interactive meshes are tagged with valid componentId
    const interactiveMeshes = rig.getInteractiveMeshes();
    expect(interactiveMeshes.length).toBeGreaterThanOrEqual(12);

    const validIds = new Set(["root", "declarations", "statements", "expressions"]);
    interactiveMeshes.forEach((mesh) => {
      expect(validIds.has(mesh.userData.componentId)).toBe(true);
    });

    rig.dispose();
    materials.dispose();
  });

  it("manages distinct visual highlighting on all 4 components", () => {
    const materials = new AstMaterials();
    const rig = new AstRig(materials);

    // 1. Highlight ROOT
    rig.setHighlight("root");
    expect(materials.electricGreenEmissive.emissiveIntensity).toBeGreaterThan(3.0);

    // 2. Highlight DECLARATIONS
    rig.setHighlight("declarations");
    expect(materials.electricGreenEmissive.emissiveIntensity).toBeGreaterThan(4.0);

    // 3. Highlight STATEMENTS
    rig.setHighlight("statements");
    expect(materials.electricGreenEmissive.emissiveIntensity).toBeGreaterThan(4.0);

    // 4. Highlight EXPRESSIONS
    rig.setHighlight("expressions");
    expect(materials.electricGreenEmissive.emissiveIntensity).toBeGreaterThan(4.5);

    // Reset highlight
    rig.setHighlight(null);
    expect(materials.electricGreenEmissive.emissiveIntensity).toBeLessThanOrEqual(2.5);

    rig.dispose();
    materials.dispose();
  });

  it("maps 4-phase scroll choreography and multi-axis exploded view", () => {
    const materials = new AstMaterials();
    const rig = new AstRig(materials);

    // Phase 1: Assembled Idle (Progress = 0.0)
    rig.setScrollProgress(0.0);
    expect(rig.rootGroup.position.x).toBeCloseTo(0, 2);
    expect(rig.declarationsGroup.position.y).toBeCloseTo(0, 2);
    expect(rig.statementsGroup.position.x).toBeCloseTo(0, 2);
    expect(rig.expressionsGroup.position.z).toBeCloseTo(0, 2);

    // Phase 2: Compilation Surge (Progress = 0.35) - subtle expansion
    rig.setScrollProgress(0.35);
    expect(rig.rootGroup.position.x).toBeCloseTo(0, 2);

    // Phase 3: Exploded Intermediate Representation (Progress = 0.65) - separated in 3D
    rig.setScrollProgress(0.65);
    expect(rig.rootGroup.position.y).toBeLessThan(-0.5); // shifts down
    expect(rig.declarationsGroup.position.y).toBeGreaterThan(0.5); // lifts up along hierarchy
    expect(rig.statementsGroup.position.x).toBeLessThan(-0.5); // slides laterally
    expect(rig.expressionsGroup.position.z).toBeGreaterThan(0.5); // fans forward towards camera

    // Phase 4: Bytecode Convergence & Reassembly (Progress = 1.0) - returns to origin
    rig.setScrollProgress(1.0);
    expect(rig.rootGroup.position.x).toBeCloseTo(0, 2);
    expect(rig.declarationsGroup.position.y).toBeCloseTo(0, 2);
    expect(rig.statementsGroup.position.x).toBeCloseTo(0, 2);
    expect(rig.expressionsGroup.position.z).toBeCloseTo(0, 2);

    // Reversible scrub test: scroll backwards to 0.65, then back to 0.0
    rig.setScrollProgress(0.65);
    expect(rig.declarationsGroup.position.y).toBeGreaterThan(0.5);

    rig.setScrollProgress(0.0);
    expect(rig.declarationsGroup.position.y).toBeCloseTo(0, 2);

    rig.dispose();
    materials.dispose();
  });

  it("separates hovered and selected component state and supports persistent selection", () => {
    const { getByRole } = render(
      React.createElement(AstCenterpiece, { isMobile: false })
    );

    const rootBtn = getByRole("button", { name: /Select ROOT:/i });
    const scopeBtn = getByRole("button", { name: /Select SCOPE:/i });
    const exprBtn = getByRole("button", { name: /Select EXPR:/i });

    // Initial state: none selected
    expect(rootBtn).toHaveAttribute("aria-pressed", "false");
    expect(scopeBtn).toHaveAttribute("aria-pressed", "false");
    expect(exprBtn).toHaveAttribute("aria-pressed", "false");

    // 1. Click ROOT -> becomes persistently selected
    fireEvent.click(rootBtn);
    expect(rootBtn).toHaveAttribute("aria-pressed", "true");

    // 2. Hover SCOPE -> ROOT selection persists
    fireEvent.mouseEnter(scopeBtn);
    expect(rootBtn).toHaveAttribute("aria-pressed", "true");

    // 3. Unhover SCOPE -> ROOT remains selected
    fireEvent.mouseLeave(scopeBtn);
    expect(rootBtn).toHaveAttribute("aria-pressed", "true");

    // 4. Click EXPR -> changes selection from ROOT to EXPR
    fireEvent.click(exprBtn);
    expect(rootBtn).toHaveAttribute("aria-pressed", "false");
    expect(exprBtn).toHaveAttribute("aria-pressed", "true");

    // 5. Click EXPR again -> deselects
    fireEvent.click(exprBtn);
    expect(exprBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("renders FallbackBlueprint with accessible attributes and technical labels", () => {
    const { getByRole, getByText } = render(
      React.createElement(FallbackBlueprint, { label: "SPEC: COMPUTATIONAL AST SCHEMATIC // 001" })
    );

    const img = getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("aria-label", "Computational AST Execution Graph Blueprint");
    expect(getByText("SPEC: COMPUTATIONAL AST SCHEMATIC // 001")).toBeInTheDocument();
    expect(getByText(/PARSE_ROOT/)).toBeInTheDocument();
  });
});
