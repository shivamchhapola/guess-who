import { CardSetTemplate, CharacterCard } from '@/types/game';

/**
 * Utility functions for Set Data & UX Model
 * Enables rich metadata handling, multi-tag filtering, description truncation,
 * search matching, and card metadata presentation.
 */

export interface DisplayTags {
  visibleTags: string[];
  extraCount: number;
}

/**
 * Returns visible tags up to maxCount, and count of remaining tags (+N more).
 */
export function getDisplayTags(template: CardSetTemplate, maxCount: number = 3): DisplayTags {
  const tags = template?.tags || [];
  if (tags.length <= maxCount) {
    return { visibleTags: tags, extraCount: 0 };
  }
  return {
    visibleTags: tags.slice(0, maxCount),
    extraCount: tags.length - maxCount,
  };
}

/**
 * Returns a truncated 1-2 line description preview.
 */
export function getTruncatedDescription(description?: string, maxLength: number = 110): string {
  if (!description) return 'No description provided.';
  const trimmed = description.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength).trim() + '…';
}

/**
 * Returns formatted character count label.
 */
export function getCharacterCountLabel(template: CardSetTemplate): string {
  const count = template?.cards?.length || 0;
  return `${count} ${count === 1 ? 'Character' : 'Characters'}`;
}

/**
 * Returns formatted creator label.
 */
export function getCreatorLabel(template: CardSetTemplate): string {
  return `By ${template?.creatorName || 'Community Creator'}`;
}

/**
 * Checks if a template matches search query across title, description, tags, and creator.
 */
export function matchesSearch(template: CardSetTemplate, query: string): boolean {
  if (!template) return false;
  if (!query || !query.trim()) return true;
  const q = query.toLowerCase().trim();

  const titleMatch = (template.title || '').toLowerCase().includes(q);
  const descMatch = (template.description || '').toLowerCase().includes(q);
  const creatorMatch = (template.creatorName || '').toLowerCase().includes(q);
  const tagMatch = (template.tags || []).some((tag) => tag.toLowerCase().includes(q));

  return titleMatch || descMatch || creatorMatch || tagMatch;
}

/**
 * Checks if a template has all (or any) specified tags.
 */
export function matchesTags(
  template: CardSetTemplate,
  selectedTags: string[],
  matchAll: boolean = false
): boolean {
  if (!template) return false;
  if (!selectedTags || selectedTags.length === 0) return true;
  const setTags = (template.tags || []).map((t) => t.toLowerCase());

  if (matchAll) {
    return selectedTags.every((st) => setTags.includes(st.toLowerCase()));
  }
  return selectedTags.some((st) => setTags.includes(st.toLowerCase()));
}

/**
 * Helper to determine if a template is a user-created custom set.
 */
export function isCustomSet(template: CardSetTemplate): boolean {
  if (!template) return false;
  const builtInIds = ['the-office-us', 'hollywood-stars', 'marvel-superheroes', 'classic-24'];
  return !builtInIds.includes(template.id) || Boolean(template.creatorId);
}

/**
 * Ensures cards have valid attribute dictionaries.
 * For custom decks with empty attributes, generates deterministic fallback attributes
 * based on card ID / index so QuestionAssistant and AI turn engines function seamlessly.
 */
export function ensureCardAttributes(cards: CharacterCard[]): CharacterCard[] {
  if (!cards || cards.length === 0) return [];
  const hairColors: ('brown' | 'black' | 'blonde' | 'red')[] = ['brown', 'black', 'blonde', 'red'];
  const genders: ('male' | 'female')[] = ['male', 'female'];
  const eyeColors: ('brown' | 'blue' | 'green')[] = ['brown', 'blue', 'green'];

  return cards.map((card, idx) => {
    const existing = card.attributes || {};
    const hasAnyAttr = Object.keys(existing).length > 0;

    if (hasAnyAttr) {
      return card;
    }

    // Deterministic fallback based on index / character name hash
    const charCodeSum = (card.name || '').split('').reduce((sum: number, ch: string) => sum + ch.charCodeAt(0), 0) + idx;

    const inferred: CharacterCard['attributes'] = {
      gender: genders[charCodeSum % 2],
      hairColor: hairColors[charCodeSum % 4],
      glasses: (charCodeSum % 3) === 0,
      hat: (charCodeSum % 5) === 0,
      facialHair: (charCodeSum % 2) === 0 && (genders[charCodeSum % 2] === 'male'),
      eyeColor: eyeColors[charCodeSum % 3],
    };

    return {
      ...card,
      attributes: inferred,
    };
  });
}
