import type { LearningEvent } from '@/lib/learning-domain';

/** Kana to review in a day for Home's daily goal. */
export const dailyGoal = 5;

export const streakMilestones = [3, 7, 14, 30, 50, 100, 365] as const;

export type DailyStreak = {
  days: number;
  state: 'active' | 'at-risk' | 'off';
};

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

/**
 * Consecutive local days with at least one saved review, ending today or, when
 * today has none yet, yesterday. Only saved review events count.
 */
export function dailyStreak(
  events: readonly Pick<LearningEvent, 'reviewedAt'>[],
  now = new Date(),
): DailyStreak {
  const days = new Set(
    events.map((event) => dayKey(new Date(event.reviewedAt))),
  );
  const cursor = new Date(now);
  const today = days.has(dayKey(cursor));
  if (!today) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (days.has(dayKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return {
    days: count,
    state: count === 0 ? 'off' : today ? 'active' : 'at-risk',
  };
}

export const isMilestone = (days: number) =>
  (streakMilestones as readonly number[]).includes(days);

/** True when `after` is the streak that `before` became by playing today. */
export const extendedToday = (before: DailyStreak, after: DailyStreak) =>
  before.state !== 'active' && after.state === 'active';
