import { describe, expect, it } from "vitest";
import { validateContactFields, type ContactFields } from "@/lib/contactValidation";

const validFields: ContactFields = {
  firstName: "Ronak",
  lastName: "Yadav",
  email: "ronak@example.com",
  subject: "Project opportunity",
  message: "I would like to discuss a software project with you.",
};

describe("validateContactFields", () => {
  it("accepts a complete valid form", () => {
    expect(validateContactFields(validFields)).toBeNull();
  });

  it("rejects empty fields", () => {
    expect(validateContactFields({ ...validFields, subject: "   " })).toBe("All fields are required.");
  });

  it("rejects malformed email addresses", () => {
    expect(validateContactFields({ ...validFields, email: "not-an-email" })).toBe("Enter a valid email address.");
  });

  it("rejects messages shorter than ten characters", () => {
    expect(validateContactFields({ ...validFields, message: "Too short" })).toBe("Message must be at least 10 characters long.");
  });
});
