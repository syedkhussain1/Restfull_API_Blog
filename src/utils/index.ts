export const generateUsername = (): string => {
  const userPrefix = "user-";
  const randomChar = Math.random().toString(36).slice(2);

  const username = userPrefix + randomChar;

  return username;
};

// generating a unique slug for a blog
export const genSlug = (title: string): string => {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]\s-/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const randomChars = Math.random().toString(36).slice(2);
  const uniqueSlug = `${slug}-${randomChars}`;

  return uniqueSlug;
};
