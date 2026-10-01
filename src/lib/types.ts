export type Feeling = 'too_easy' | 'just_right' | 'hard' | 'too_hard' | 'pain';

export interface CoachSession {
  id: string;
  date: string;
  level: number;
  completed: boolean;
  feeling: Feeling;
}

export interface CoachState {
  /** 1-based level in the running plan (same plan as Activity Coach) */
  level: number;
  sessions: CoachSession[];
}

/** A run in progress. Time is measured from the clock, not by counting ticks, so it survives the screen sleeping. */
export interface ActiveRun {
  level: number;
  /** ISO */
  startedAt: string;
  /** ISO when paused, otherwise undefined */
  pausedAt?: string;
  /** Seconds spent paused so far */
  pausedSeconds: number;
}

export interface Sip {
  /** ISO */
  at: string;
  ml: number;
}

export interface ReminderSettings {
  water: boolean;
  /** Hours between water reminders */
  waterEvery: number;
  from: number;
  to: number;
  meals: boolean;
  breakfast: string;
  lunch: string;
  dinner: string;
  /** "Stand up and move" every hour during the work day */
  move: boolean;
}

export interface AppState {
  waterGoal: number;
  /** ml per day (YYYY-MM-DD) */
  water: Record<string, number>;
  /** Today's sips, for undo */
  sips: Sip[];
  coach: CoachState;
  run: ActiveRun | null;
  /** Things you finished, waiting to go on the shopping list */
  toBuy: string[];
  reminders: ReminderSettings;
}
