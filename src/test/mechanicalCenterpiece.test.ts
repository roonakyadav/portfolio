import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { MechanicalMaterials } from "@/components/3d/MechanicalMaterials";
import { KinematicsRig } from "@/components/3d/KinematicsRig";
import { FallbackBlueprint } from "@/components/3d/FallbackBlueprint";
import { MechanicalCenterpiece } from "@/components/3d/MechanicalCenterpiece";

describe("MechanicalCenterpiece 3D Subsystems & Interaction", () => {
  it("initializes PBR materials with industrial parameters", () => {
    const materials = new MechanicalMaterials();

    expect(materials.darkTitanium.metalness).toBeCloseTo(0.82, 2);
    expect(materials.darkTitanium.roughness).toBeCloseTo(0.42, 2);
    expect(materials.polishedSteel.metalness).toBeCloseTo(0.88, 2);
    expect(materials.bronzeBushing.metalness).toBeCloseTo(0.82, 2);
    expect(materials.electricGreenEmissive.emissive.getHexString()).toBe("00ff66");

    materials.dispose();
  });

  it("builds the 4-subsystem industrial machine hierarchy with interactive raycast registration", () => {
    const materials = new MechanicalMaterials();
    const rig = new KinematicsRig(materials);

    // Verify all 4 major assemblies exist
    expect(rig.statorGroup.name).toBe("stator_assembly");
    expect(rig.rotorGroup.name).toBe("rotor_assembly");
    expect(rig.gimbalGroup.name).toBe("gimbal_linkage_assembly");
    expect(rig.coreGroup.name).toBe("core_power_assembly");

    // Check raycast interactive meshes are tagged with valid componentId
    const interactiveMeshes = rig.getInteractiveMeshes();
    expect(interactiveMeshes.length).toBeGreaterThanOrEqual(15);

    const validIds = new Set(["stator", "gimbal", "rotor", "core"]);
    interactiveMeshes.forEach((mesh) => {
      expect(validIds.has(mesh.userData.componentId)).toBe(true);
    });

    rig.dispose();
    materials.dispose();
  });

  it("manages distinct visual highlighting on all 4 components", () => {
    const materials = new MechanicalMaterials();
    const rig = new KinematicsRig(materials);

    // 1. Highlight STATOR
    rig.setHighlight("stator");
    expect(rig.statorGroup.position.y).toBeCloseTo(-0.05, 2);

    // 2. Highlight ROTOR
    rig.setHighlight("rotor");
    expect(rig.flywheelGroup.scale.x).toBeGreaterThan(1.0);

    // 3. Highlight GIMBAL
    rig.setHighlight("gimbal");
    expect(rig.bellcrankGroup.scale.x).toBeGreaterThan(1.0);

    // 4. Highlight CORE
    rig.setHighlight("core");
    expect(materials.electricGreenEmissive.emissiveIntensity).toBeGreaterThan(4.0);

    // Reset highlight
    rig.setHighlight(null);
    expect(materials.electricGreenEmissive.emissiveIntensity).toBeLessThanOrEqual(3.0);
    expect(rig.statorGroup.position.y).toBeCloseTo(0, 2);
    expect(rig.flywheelGroup.scale.x).toBeCloseTo(1.0, 2);
    expect(rig.bellcrankGroup.scale.x).toBeCloseTo(1.0, 2);

    rig.dispose();
    materials.dispose();
  });

  it("maps 4-phase scroll choreography and multi-axis exploded view", () => {
    const materials = new MechanicalMaterials();
    const rig = new KinematicsRig(materials);

    // Phase A: Assembled Idle (Progress = 0.0)
    rig.setScrollProgress(0.0);
    expect(rig.statorGroup.position.x).toBeCloseTo(0, 2);
    expect(rig.rotorGroup.position.x).toBeCloseTo(0, 2);
    expect(rig.gimbalGroup.position.y).toBeCloseTo(0, 2);
    expect(rig.coreGroup.position.y).toBeCloseTo(-0.65, 2);

    // Phase B: Motion Acceleration (Progress = 0.35) - still assembled
    rig.setScrollProgress(0.35);
    expect(rig.statorGroup.position.x).toBeCloseTo(0, 2);
    expect(rig.rotorGroup.position.x).toBeCloseTo(0, 2);

    // Phase C: Exploded View Separation (Progress = 0.65) - separated in 3D
    rig.setScrollProgress(0.65);
    expect(rig.statorGroup.position.x).toBeLessThan(-1.5); // slides back in X
    expect(rig.statorGroup.position.z).toBeLessThan(-1.0); // slides back in Z
    expect(rig.rotorGroup.position.x).toBeGreaterThan(2.0);  // slides forward in X
    expect(rig.gimbalGroup.position.y).toBeGreaterThan(1.8); // swings upward in Y
    expect(rig.coreGroup.position.y).toBeGreaterThan(1.5);   // lifts out of cradle in Y

    // Phase D: Reassembly (Progress = 1.0) - returns to origin
    rig.setScrollProgress(1.0);
    expect(rig.statorGroup.position.x).toBeCloseTo(0, 2);
    expect(rig.rotorGroup.position.x).toBeCloseTo(0, 2);
    expect(rig.gimbalGroup.position.y).toBeCloseTo(0, 2);
    expect(rig.coreGroup.position.y).toBeCloseTo(-0.65, 2);

    // Reversible scrub test: scroll backwards to 0.65, then back to 0.0
    rig.setScrollProgress(0.65);
    expect(rig.statorGroup.position.x).toBeLessThan(-1.5);

    rig.setScrollProgress(0.0);
    expect(rig.statorGroup.position.x).toBeCloseTo(0, 2);

    rig.dispose();
    materials.dispose();
  });

  it("separates hovered and selected component state and supports persistent selection", () => {
    const { getByRole } = render(
      React.createElement(MechanicalCenterpiece, { isMobile: false })
    );

    const statorBtn = getByRole("button", { name: /Select mechanical component STATOR/i });
    const rotorBtn = getByRole("button", { name: /Select mechanical component ROTOR/i });
    const coreBtn = getByRole("button", { name: /Select mechanical component CORE/i });

    // Initial state: none selected
    expect(statorBtn).toHaveAttribute("aria-pressed", "false");
    expect(rotorBtn).toHaveAttribute("aria-pressed", "false");
    expect(coreBtn).toHaveAttribute("aria-pressed", "false");

    // 1. Click STATOR -> becomes persistently selected
    fireEvent.click(statorBtn);
    expect(statorBtn).toHaveAttribute("aria-pressed", "true");

    // 2. Hover ROTOR -> STATOR selection persists, does not get cancelled
    fireEvent.mouseEnter(rotorBtn);
    expect(statorBtn).toHaveAttribute("aria-pressed", "true");

    // 3. Unhover ROTOR -> STATOR remains selected
    fireEvent.mouseLeave(rotorBtn);
    expect(statorBtn).toHaveAttribute("aria-pressed", "true");

    // 4. Click CORE -> changes selection from STATOR to CORE
    fireEvent.click(coreBtn);
    expect(statorBtn).toHaveAttribute("aria-pressed", "false");
    expect(coreBtn).toHaveAttribute("aria-pressed", "true");

    // 5. Click CORE again -> deselects
    fireEvent.click(coreBtn);
    expect(coreBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("renders FallbackBlueprint with accessible attributes and technical labels", () => {
    const { getByRole, getByText } = render(
      React.createElement(FallbackBlueprint, { label: "TEST SCHEMATIC // 001" })
    );

    const img = getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("aria-label", "Mechanical Artifact Schematic Blueprint");
    expect(getByText("TEST SCHEMATIC // 001")).toBeInTheDocument();
    expect(getByText(/SYS\.DIAG/)).toBeInTheDocument();
  });
});
