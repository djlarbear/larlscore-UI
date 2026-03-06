/**
 * Shared formatting utilities used across multiple components.
 */

/** Trim whitespace from sport name; handles undefined safely. */
export const cleanSportName = (sport: string | undefined): string =>
  (sport ?? '').trim();
