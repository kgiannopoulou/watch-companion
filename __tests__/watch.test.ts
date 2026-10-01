import { describe, expect, test } from '@jest/globals';
import { adapt, segmentsFor, totalSeconds } from '../src/lib/coach';
import type { ActiveRun, ReminderSettings } from '../src/lib/types';
import { addUnique, elapsedSeconds, phaseAlerts, reminderPlan, runStatus, waterProgress } from '../src/lib/watch';

const start = new Date(2026, 9, 15, 7, 0, 0);
const after = (sec: number) => new Date(start.getTime() + sec * 1000);
const run = (patch: Partial<ActiveRun> = {}): ActiveRun => ({ level: 1, startedAt: start.toISOString(), pausedSeconds: 0, ...patch });

describe('water', () => {
  test('progress and glasses left', () => {
    expect(waterProgress(1250, 2000)).toEqual({ pct: 0.625, glassesLeft: 3 });
    expect(waterProgress(2600, 2000)).toEqual({ pct: 1, glassesLeft: 0 });
  });
});

describe('I finished…', () => {
  test('no duplicates, plural-insensitive', () => {
    expect(addUnique(['Eggs'], 'egg')).toEqual(['Eggs']);
    expect(addUnique(['Eggs'], ' Milk ')).toEqual(['Eggs', 'Milk']);
    expect(addUnique([], '  ')).toEqual([]);
  });
});

describe('run', () => {
  const segments = segmentsFor(1); // 5 min warm-up, then run 60 s / walk 90 s × 8

  test('status follows the clock', () => {
    expect(runStatus(segments, run(), after(10))).toMatchObject({ label: '🚶 Warm-up walk', clock: '4:50' });
    expect(runStatus(segments, run(), after(300 + 15))).toMatchObject({ label: '🏃 Run 1/8', clock: '0:45' });
    expect(runStatus(segments, run(), after(300 + 60 + 30)).label).toBe('🚶 Walk');
    expect(runStatus(segments, run(), after(totalSeconds(segments) + 5)).done).toBe(true);
  });

  test('pauses do not count', () => {
    const paused = run({ pausedAt: after(100).toISOString() });
    expect(elapsedSeconds(paused, after(500))).toBe(100);
    expect(elapsedSeconds(run({ pausedSeconds: 60 }), after(400))).toBe(340);
  });

  test('a buzz for every phase change still ahead', () => {
    const alerts = phaseAlerts(segments, run(), after(300 + 30));
    expect(alerts[0].title).toBe('🚶 Walk 1:30');
    expect(alerts[0].at.getTime()).toBe(after(360).getTime());
    expect(alerts[1].title).toBe('🏃 Run 1:00');
    expect(alerts[alerts.length - 1].title).toBe('✅ Done!');
    expect(alerts).toHaveLength(segments.length - 1);
  });

  test('adapts like Activity Coach', () => {
    expect(adapt({ level: 3, sessions: [] }, true, 'too_easy').level).toBe(5);
    expect(adapt({ level: 3, sessions: [] }, false, 'too_hard').level).toBe(2);
  });
});

describe('reminders', () => {
  const base: ReminderSettings = { water: true, waterEvery: 3, from: 9, to: 21, meals: true, breakfast: '08:00', lunch: '13:15', dinner: 'later', move: false };

  test('water, meals and move', () => {
    const plan = reminderPlan(base);
    expect(plan.filter((r) => r.id.startsWith('water')).map((r) => r.hour)).toEqual([9, 12, 15, 18, 21]);
    // An invalid time is skipped instead of breaking the rest.
    expect(plan.filter((r) => r.id.startsWith('meal')).map((r) => [r.hour, r.minute])).toEqual([
      [8, 0],
      [13, 15],
    ]);
    expect(reminderPlan({ ...base, water: false, meals: false, move: true })).toHaveLength(8);
    expect(reminderPlan({ ...base, water: false, meals: false })).toEqual([]);
  });
});
