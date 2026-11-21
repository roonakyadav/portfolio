import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { MechanicalMaterials } from "@/components/3d/MechanicalMaterials";
import { KinematicsRig } from "@/components/3d/KinematicsRig";
import { FallbackBlueprint } from "@/components/3d/FallbackBlueprint";

describe("MechanicalCenterpiece 3D Subsystems", () => {
  it("initializes PBR materials with appropriate metallic and roughness parameters", () => {
    const materials = new MechanicalMaterials();

    expect(materials.darkTitanium.metalness).toBeCloseTo(0.88, 2);
    expect(materials.darkTitanium.roughness).toBeCloseTo(0.32, 2);
    expect(materials.polishedSteel.metalness).toBeCloseTo(0.95, 2);
    expect(materials.electricGreenEmissive.emissive.getHexString()).toBe("00ff66");

    materials.dispose();
  });

  it("builds the 5-subsystem procedural hierarchy in KinematicsRig", () => {
    const materials = new MechanicalMaterials();
    const rig = new KinematicsRig(materials);

    // Verify all 5 assemblies exist in the root hierarchy
    expect(rig.statorGroup.name).toBe("stator_chassis");
    expect(rig.gimbalOuterGroup.name).toBe("gimbal_outer_assembly");
    expect(rig.gimbalInnerGroup.name).toBe("gimbal_inner_assembly");
    expect(rig.rotorGroup.name).toBe("rotor_turbine_assembly");
    expect(rig.coreGroup.name).toBe("central_computation_core");
    expect(rig.calipersGroup.name).toBe("articulated_calipers_assembly");

    // Check stator ticks count (36 ticks + 3 rings + 4 mounting lugs)
    expect(rig.statorGroup.children.length).toBeGreaterThanOrEqual(40);

    // Check rotor blades count (hub + rim + 20 blades)
    expect(rig.rotorGroup.children.length).toBe(22);

    // Check 4 articulated caliper arms
    expect(rig.calipersGroup.children.length).toBe(4);

    // Test highlight state
    rig.setHighlight("core");
    expect(materials.electricGreenEmissive.emissiveIntensity).toBeGreaterThan(3.0);

    rig.setHighlight(null);
    expect(materials.electricGreenEmissive.emissiveIntensity).toBeLessThanOrEqual(3.0);

    // Test kinematics update
    rig.update(1.0, 0.016, 0.5, { x: 0.1, y: 0.1 }, false);
    expect(rig.rotorGroup.rotation.z).not.toBe(0);

    // Test reduced-motion state
    rig.update(2.0, 0.016, 0.5, { x: 0.1, y: 0.1 }, true);
    expect(rig.root.rotation.x).toBeCloseTo(0.25, 2);
    expect(rig.root.rotation.y).toBeCloseTo(-0.35, 2);

    rig.dispose();
    materials.dispose();
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
