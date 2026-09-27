/**
 * Security & Sanitization Utilities for GuessWhooo?
 */

/**
 * Hashes a room password using SHA-256 for secure DB storage & client comparison.
 */
export async function hashPassword(plainText: string): Promise<string> {
  if (!plainText) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Sanitizes chat messages to prevent XSS and limit payload size.
 */
export function sanitizeChatMessage(input: string): string {
  if (!input) return '';
  const trimmed = input.trim().slice(0, 200);
  return trimmed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes room codes to alphanumeric uppercase characters.
 */
export function sanitizeRoomCode(code: string): string {
  if (!code) return '';
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
}

/**
 * General string sanitizer for player nicknames, etc.
 */
export function sanitizeString(input: string, maxLength = 50): string {
  if (!input) return '';
  return input.trim().slice(0, maxLength);
}
