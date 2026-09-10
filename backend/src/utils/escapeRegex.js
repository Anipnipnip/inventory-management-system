// Escapes regex special characters in a user-supplied string before it's
// used inside a MongoDB regex query (e.g. case-insensitive duplicate
// checks). Without this, input like "C++" or "A.B" would be interpreted
// as regex syntax instead of matched literally.
export const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
