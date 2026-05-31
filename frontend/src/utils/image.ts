/**
 * Resolves item image URLs to the backend API base url if they are stored relatively.
 *
 * @param url relative or absolute image path
 * @returns absolute web-accessible URL
 */
export const getImageUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:8080${url}`;
};
