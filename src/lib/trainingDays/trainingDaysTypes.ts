export type WeekdayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export const WEEKDAYS: Array<{ key: WeekdayKey; index: number }> = [
  { key: 'sun', index: 0 },
  { key: 'mon', index: 1 },
  { key: 'tue', index: 2 },
  { key: 'wed', index: 3 },
  { key: 'thu', index: 4 },
  { key: 'fri', index: 5 },
  { key: 'sat', index: 6 },
];

export interface GroupTrainingDays {
  academyId: string;
  groupKey: string; // e.g. "U10" or any academy-defined group
  days: number[]; // 0-6 (Sun-Sat)
  updatedAt: string;
  updatedBy: string;
}
