const PLAYER_ID_PREFIX = 'guesswho_player_';

function getStorageKey(roomCode: string): string {
  return `${PLAYER_ID_PREFIX}${roomCode.toUpperCase()}`;
}

/**
 * Returns the stable browser identity for this player in a room.
 *
 * The ID is intentionally independent from nickname/avatar changes. It is
 * room-scoped and persisted in sessionStorage so reconnects in the same tab
 * retain the same identity.
 */
export function getOrCreateRoomPlayerId(roomCode: string): string {
  if (typeof window === 'undefined') {
    throw new Error('Room player identity can only be created in the browser.');
  }

  const key = getStorageKey(roomCode);
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;

  const playerId = globalThis.crypto?.randomUUID?.() ?? createFallbackPlayerId();
  sessionStorage.setItem(key, playerId);
  return playerId;
}

function createFallbackPlayerId(): string {
  return `player_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
