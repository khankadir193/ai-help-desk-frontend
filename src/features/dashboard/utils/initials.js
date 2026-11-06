/** Derive 1-2 character display initials from a person's name. */
export const getInitials = (name) => {
  const source = typeof name === 'string' ? name.trim() : '';
  if (!source) return 'U';
  const parts = source.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default getInitials;
