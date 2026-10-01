import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppState } from './types';

const STATE_KEY = 'watch-companion:v1';

export const DEFAULT_STATE: AppState = {
  waterGoal: 2000,
  water: {},
  sips: [],
  coach: { level: 1, sessions: [] },
  run: null,
  toBuy: [],
  reminders: {
    water: true,
    waterEvery: 2,
    from: 9,
    to: 21,
    meals: true,
    breakfast: '08:00',
    lunch: '13:00',
    dinner: '19:30',
    move: false,
  },
};

export async function loadState(): Promise<AppState> {
  const raw = await AsyncStorage.getItem(STATE_KEY);
  if (!raw) return DEFAULT_STATE;
  try {
    const saved = JSON.parse(raw) as Partial<AppState>;
    return { ...DEFAULT_STATE, ...saved, reminders: { ...DEFAULT_STATE.reminders, ...saved.reminders } };
  } catch {
    return DEFAULT_STATE;
  }
}

export async function saveState(state: AppState): Promise<void> {
  await AsyncStorage.setItem(STATE_KEY, JSON.stringify(state));
}
