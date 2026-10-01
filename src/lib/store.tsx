import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { adapt, segmentsFor, type Adaptation } from './coach';
import { newId, toDateKey } from './dates';
import { cancelRunAlerts, scheduleRunAlerts, syncReminders } from './notifications';
import { DEFAULT_STATE, loadState, saveState } from './storage';
import type { AppState, Feeling, ReminderSettings } from './types';
import { addUnique, phaseAlerts, reminderPlan } from './watch';

interface Store {
  state: AppState;
  ready: boolean;
  waterToday: number;
  addWater: (ml: number) => void;
  undoWater: () => void;
  setWaterGoal: (ml: number) => void;
  startRun: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  /** Ends the run and adapts the next one to how it felt */
  finishRun: (completed: boolean, feeling: Feeling) => Adaptation;
  cancelRun: () => void;
  addToBuy: (name: string) => void;
  removeToBuy: (name: string) => void;
  clearToBuy: () => void;
  setReminders: (r: ReminderSettings) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    loadState().then((s) => {
      // Undo only makes sense for today's sips.
      const today = toDateKey();
      const next = { ...s, sips: s.sips.filter((x) => toDateKey(new Date(x.at)) === today) };
      setState(next);
      stateRef.current = next;
      loaded.current = true;
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (loaded.current) saveState(state).catch((e) => console.warn('Could not save state', e));
  }, [state]);

  useEffect(() => {
    if (!ready) return;
    syncReminders(reminderPlan(state.reminders)).catch((e) => console.warn('Could not schedule reminders', e));
  }, [ready, state.reminders]);

  const commit = (next: AppState) => {
    stateRef.current = next;
    setState(next);
  };
  const update = (fn: (s: AppState) => AppState) => commit(fn(stateRef.current));

  const addWater = useCallback((ml: number) => {
    const today = toDateKey();
    update((s) => ({
      ...s,
      water: { ...s.water, [today]: (s.water[today] ?? 0) + ml },
      sips: [...s.sips, { at: new Date().toISOString(), ml }],
    }));
  }, []);

  const undoWater = useCallback(() => {
    const today = toDateKey();
    update((s) => {
      const last = s.sips[s.sips.length - 1];
      if (!last) return s;
      return { ...s, sips: s.sips.slice(0, -1), water: { ...s.water, [today]: Math.max(0, (s.water[today] ?? 0) - last.ml) } };
    });
  }, []);

  const setWaterGoal = useCallback((ml: number) => update((s) => ({ ...s, waterGoal: ml })), []);

  const startRun = useCallback(() => {
    const s = stateRef.current;
    const run = { level: s.coach.level, startedAt: new Date().toISOString(), pausedSeconds: 0 };
    commit({ ...s, run });
    scheduleRunAlerts(phaseAlerts(segmentsFor(run.level), run)).catch((e) => console.warn('Could not schedule run alerts', e));
  }, []);

  const pauseRun = useCallback(() => {
    const s = stateRef.current;
    if (!s.run || s.run.pausedAt) return;
    commit({ ...s, run: { ...s.run, pausedAt: new Date().toISOString() } });
    cancelRunAlerts().catch(() => {});
  }, []);

  const resumeRun = useCallback(() => {
    const s = stateRef.current;
    if (!s.run?.pausedAt) return;
    const paused = (Date.now() - new Date(s.run.pausedAt).getTime()) / 1000;
    const run = { ...s.run, pausedAt: undefined, pausedSeconds: s.run.pausedSeconds + paused };
    commit({ ...s, run });
    scheduleRunAlerts(phaseAlerts(segmentsFor(run.level), run)).catch((e) => console.warn('Could not schedule run alerts', e));
  }, []);

  const finishRun = useCallback((completed: boolean, feeling: Feeling) => {
    const s = stateRef.current;
    const level = s.run?.level ?? s.coach.level;
    const result = adapt({ ...s.coach, level }, completed, feeling);
    commit({
      ...s,
      run: null,
      coach: {
        level: result.level,
        sessions: [...s.coach.sessions, { id: newId(), date: toDateKey(), level, completed, feeling }].slice(-200),
      },
    });
    cancelRunAlerts().catch(() => {});
    return result;
  }, []);

  const cancelRun = useCallback(() => {
    update((s) => ({ ...s, run: null }));
    cancelRunAlerts().catch(() => {});
  }, []);

  const addToBuy = useCallback((name: string) => update((s) => ({ ...s, toBuy: addUnique(s.toBuy, name) })), []);
  const removeToBuy = useCallback((name: string) => update((s) => ({ ...s, toBuy: s.toBuy.filter((n) => n !== name) })), []);
  const clearToBuy = useCallback(() => update((s) => ({ ...s, toBuy: [] })), []);
  const setReminders = useCallback((reminders: ReminderSettings) => update((s) => ({ ...s, reminders })), []);

  const waterToday = state.water[toDateKey()] ?? 0;
  const value = useMemo(
    () => ({ state, ready, waterToday, addWater, undoWater, setWaterGoal, startRun, pauseRun, resumeRun, finishRun, cancelRun, addToBuy, removeToBuy, clearToBuy, setReminders }),
    [state, ready, waterToday, addWater, undoWater, setWaterGoal, startRun, pauseRun, resumeRun, finishRun, cancelRun, addToBuy, removeToBuy, clearToBuy, setReminders],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside <StoreProvider>');
  return store;
}

