import { describe, expect, it } from "vitest";
import { profile } from "@/data/profile";

describe("profile metadata", () => {
  it("contains the canonical identity and contact channels", () => {
    expect(profile.name).toBe("Ronak Yadav");
    expect(profile.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    expect(profile.social.github).toBe("https://github.com/roonakyadav");
  });

  it("keeps the displayed contribution metric above the requested threshold", () => {
    expect(profile.stats.githubContributionsPastYear).toBeGreaterThanOrEqual(1000);
  });
});
