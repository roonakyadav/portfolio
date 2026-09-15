export type ContactFields = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
};

export const validateContactFields = (fields: ContactFields): string | null => {
  const values = Object.values(fields).map((value) => value.trim());

  if (values.some((value) => value.length === 0)) {
    return "All fields are required.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    return "Enter a valid email address.";
  }

  if (fields.message.trim().length < 10) {
    return "Message must be at least 10 characters long.";
  }

  return null;
};
