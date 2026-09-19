/** Production-facing client validation helpers. These complement, but never replace, Firebase rules. */
export function normalizeRegisterNumber(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, ' ');
}
export function isValidRegisterNumber(value: string) {
  const normalized = normalizeRegisterNumber(value);
  return normalized.length >= 3 && normalized.length <= 32 && /^[A-Z0-9 ./_-]+$/.test(normalized);
}
export function isValidDepartmentCode(value: string) {
  return /^[A-Z0-9]{2,12}$/.test(value.trim().toUpperCase());
}
export function isValidEventCode(value: string) {
  return /^[A-Z0-9-]{2,24}$/.test(value.trim().toUpperCase());
}
export function isSafeUpload(file: File, maxBytes = 10 * 1024 * 1024) {
  return file.size > 0 && file.size <= maxBytes && /^(image\/(jpeg|png|webp|gif)|application\/pdf)$/.test(file.type);
}
export function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 120);
}
