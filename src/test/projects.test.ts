import { describe, expect, it } from "vitest";
import { projects } from "@/data/projects";

describe("portfolio projects", () => {
  it("contains uniquely identified projects", () => {
    const ids = projects.map((project) => project.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(projects.length).toBeGreaterThanOrEqual(3);
  });

  it("uses real source links for every featured project", () => {
    for (const project of projects) {
      expect(project.links.code).toMatch(/^https:\/\/github\.com\//);
      expect(project.title).not.toContain("PROJECT TITLE");
      expect(project.description).not.toContain("Project description goes here");
    }
  });
});
