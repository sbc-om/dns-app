/**
 * @deprecated The global "stage" system was removed.
 * Progress in DNA is now points-based across programs/levels.
 *
 * This module is kept as a tiny backward-compatibility shim for older imports.
 */

export type OrganizationType = 'academy' | 'school';

/**
 * @deprecated Use `daysBetweenIso` from `src/lib/utils/date.ts`.
 */
export function daysBetween(startIso: string, endIso: string): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const diffMs = end.getTime() - start.getTime();
  if (!Number.isFinite(diffMs)) return 0;
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}
