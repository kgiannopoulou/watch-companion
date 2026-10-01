import { formatClock, positionAt, type Segment } from './coach';
import { normalizeName } from './homeCore';
import type { ActiveRun, ReminderSettings } from './types';

// ---------- Water ----------

export const GLASSES = [150, 250, 500];

export function waterProgress(ml: number, goal: number): { pct: number; glassesLeft: number } {
  const pct = goal > 0 ? Math.min(1, ml / goal) : 0;
  return { pct, glassesLeft: Math.max(0, Math.ceil((goal - ml) / 250)) };
}

// ---------- "I finished…" ----------

/** The things people run out of most, as one-tap buttons. */
export const QUICK_ITEMS = ['Milk', 'Eggs', 'Bread', 'Coffee', 'Bananas', 'Yogurt', 'Dish soap', 'Toilet paper', 'Trash bags', 'Laundry detergent'];

export function addUnique(list: string[], name: string): string[] {
  const clean = name.trim();
  if (!clean || list.some((n) => normalizeName(n) === normalizeName(clean))) return list;
  return [...list, clean];
}

// ---------- Run ----------

/** Seconds of running so far, not counting pauses. */
export function elapsedSeconds(run: ActiveRun, now: Date = new Date()): number {
  const end = run.pausedAt ? new Date(run.pausedAt).getTime() : now.getTime();
  return Math.max(0, (end - new Date(run.startedAt).getTime()) / 1000 - run.pausedSeconds);
}

export const SEGMENT_LABEL = { warmup: '🚶 Warm-up walk', run: '🏃 Run', walk: '🚶 Walk', cooldown: '🧘 Cool-down' } as const;

export function runStatus(segments: Segment[], run: ActiveRun, now: Date = new Date()) {
  const elapsed = elapsedSeconds(run, now);
  const pos = positionAt(segments, elapsed);
  const seg = segments[pos.index];
  const runs = segments.filter((s) => s.kind === 'run').length;
  return {
    ...pos,
    segment: seg,
    label: SEGMENT_LABEL[seg.kind] + (seg.kind === 'run' && runs > 1 ? ` ${seg.rep}/${runs}` : ''),
    clock: formatClock(pos.remaining),
    next: segments[pos.index + 1],
  };
}

/**
 * A buzz for every change of phase still ahead, so the watch tells you when to run or walk
 * even with the screen off.
 */
export function phaseAlerts(segments: Segment[], run: ActiveRun, now: Date = new Date()): { at: Date; title: string; body: string }[] {
  const elapsed = elapsedSeconds(run, now);
  const out: { at: Date; title: string; body: string }[] = [];
  let t = 0;
  for (let i = 0; i < segments.length; i++) {
    t += segments[i].seconds;
    if (t <= elapsed) continue;
    const next = segments[i + 1];
    const at = new Date(now.getTime() + (t - elapsed) * 1000);
    if (!next) out.push({ at, title: '✅ Done!', body: 'Great work. Open the app to say how it felt.' });
    else out.push({ at, title: `${SEGMENT_LABEL[next.kind]} ${formatClock(next.seconds)}`, body: next.kind === 'run' ? 'Easy pace: you should still be able to talk.' : 'Catch your breath.' });
  }
  return out;
}

// ---------- Reminders ----------

export interface DailyReminder {
  id: string;
  hour: number;
  minute: number;
  title: string;
  body: string;
}

export const parseTime = (t: string): [number, number] | null => {
  const m = t.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  return m ? [Number(m[1]), Number(m[2])] : null;
};

/** Every daily reminder the settings ask for. */
export function reminderPlan(s: ReminderSettings): DailyReminder[] {
  const out: DailyReminder[] = [];
  if (s.water && s.waterEvery > 0) {
    for (let h = s.from; h <= s.to; h += s.waterEvery) {
      out.push({ id: `water-${h}`, hour: h, minute: 0, title: '💧 Drink some water', body: 'Tap +250 ml when you have.' });
    }
  }
  if (s.meals) {
    for (const [meal, time, body] of [
      ['breakfast', s.breakfast, 'Breakfast time 🍳'],
      ['lunch', s.lunch, 'Lunch time 🥗'],
      ['dinner', s.dinner, 'Dinner time 🍲'],
    ] as const) {
      const t = parseTime(time);
      if (t) out.push({ id: `meal-${meal}`, hour: t[0], minute: t[1], title: body, body: 'Don’t skip it: it keeps your energy up.' });
    }
  }
  if (s.move) {
    for (let h = 10; h <= 17; h++) out.push({ id: `move-${h}`, hour: h, minute: 50, title: '🚶 Time to move', body: 'Stand up, stretch or walk for a couple of minutes.' });
  }
  return out;
}


