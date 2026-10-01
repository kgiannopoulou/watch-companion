import { useKeepAwake } from 'expo-keep-awake';
import { useEffect, useRef, useState } from 'react';
import { Bar, Big, colors, Label, Pill, Row, Screen, Small, tap, Tile } from '../components/watch';
import { describeLevel, formatClock, segmentsFor, totalSeconds, type Adaptation } from '../lib/coach';
import { useStore } from '../lib/store';
import type { ActiveRun, Feeling } from '../lib/types';
import { elapsedSeconds, runStatus } from '../lib/watch';

const FEELINGS: { value: Feeling; label: string }[] = [
  { value: 'too_easy', label: '😎 Too easy' },
  { value: 'just_right', label: '🙂 Just right' },
  { value: 'hard', label: '😅 Hard' },
  { value: 'too_hard', label: '🥵 Too hard' },
  { value: 'pain', label: '🤕 Pain' },
];

/** Shown while running: keeps the screen on and buzzes at every change of phase. */
function ActiveRunView({ run }: { run: ActiveRun }) {
  useKeepAwake();
  const { pauseRun, resumeRun } = useStore();
  const [now, setNow] = useState(new Date());
  const segments = segmentsFor(run.level);
  const status = runStatus(segments, run, now);
  const lastIndex = useRef(status.index);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (status.index !== lastIndex.current) {
      lastIndex.current = status.index;
      tap('warning');
    }
  }, [status.index]);

  const color = status.segment.kind === 'run' ? colors.run : colors.walk;
  const total = totalSeconds(segments);
  const paused = !!run.pausedAt;

  return (
    <>
      <Label color={color}>{paused ? '⏸ Paused' : status.label}</Label>
      <Big color={color}>{status.done ? '0:00' : status.clock}</Big>
      {status.next && !status.done && <Small>Next: {status.next.kind === 'run' ? '🏃 run' : status.next.kind === 'walk' ? '🚶 walk' : '🧘 cool-down'} {formatClock(status.next.seconds)}</Small>}
      <Bar pct={elapsedSeconds(run, now) / total} color={color} />
      <Small>
        {formatClock(elapsedSeconds(run, now))} of {formatClock(total)}
      </Small>
      <Row>{paused ? <Pill label="▶ Resume" color={colors.walk} textColor="#002A0E" onPress={resumeRun} /> : <Pill label="⏸ Pause" onPress={pauseRun} />}</Row>
    </>
  );
}

export default function Run() {
  const { state, startRun, finishRun, cancelRun } = useStore();
  const [result, setResult] = useState<Adaptation | null>(null);
  const [stopping, setStopping] = useState(false);
  const run = state.run;
  const [, force] = useState(0);
  // Re-check every second whether the session has finished.
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const done = run ? runStatus(segmentsFor(run.level), run).done : false;

  if (result) {
    return (
      <Screen>
        <Label>Next run</Label>
        <Big color={colors.run}>Level {result.level}</Big>
        <Small>{describeLevel(result.level)}</Small>
        <Tile>
          <Label>{result.message}</Label>
        </Tile>
        <Pill label="OK" color={colors.run} textColor="#2A1700" onPress={() => setResult(null)} />
      </Screen>
    );
  }

  if (run && !done && !stopping) {
    return (
      <Screen>
        <ActiveRunView run={run} />
        <Pill label="■ Stop" color="#3A0A08" textColor={colors.danger} onPress={() => setStopping(true)} />
      </Screen>
    );
  }

  if (run) {
    return (
      <Screen>
        <Label>{done ? '✅ Done! How did it feel?' : 'Stopped early. How did it feel?'}</Label>
        <Row>
          {FEELINGS.map((f) => (
            <Pill
              key={f.value}
              label={f.label}
              onPress={() => {
                setStopping(false);
                setResult(finishRun(done, f.value));
              }}
            />
          ))}
        </Row>
        {!done && (
          <Row>
            <Pill label="↩ Keep going" onPress={() => setStopping(false)} />
            <Pill
              label="✕ Discard"
              color="#3A0A08"
              textColor={colors.danger}
              onPress={() => {
                setStopping(false);
                cancelRun();
              }}
            />
          </Row>
        )}
      </Screen>
    );
  }

  const segments = segmentsFor(state.coach.level);
  return (
    <Screen>
      <Small>🏃 Level {state.coach.level}</Small>
      <Label>{describeLevel(state.coach.level)}</Label>
      <Small>
        5 min warm-up and cool-down · {formatClock(totalSeconds(segments))} in total. Your watch buzzes when it's time to run or walk.
      </Small>
      <Pill label="▶ Start" color={colors.run} textColor="#2A1700" onPress={startRun} />
      {state.coach.sessions.length > 0 && <Small>{state.coach.sessions.length} runs so far</Small>}
    </Screen>
  );
}
