import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { Bar, Big, colors, Label, Pill, Row, Screen, Small, tap, Tile } from '../components/watch';
import { describeLevel, segmentsFor } from '../lib/coach';
import { useStore } from '../lib/store';
import { runStatus, waterProgress } from '../lib/watch';

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);
  return (
    <Text style={{ color: colors.muted, textAlign: 'center', fontSize: 15, fontVariant: ['tabular-nums'] }}>
      {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </Text>
  );
}

export default function Home() {
  const { state, waterToday, addWater } = useStore();
  const router = useRouter();
  const { pct, glassesLeft } = waterProgress(waterToday, state.waterGoal);
  const run = state.run;
  const status = run ? runStatus(segmentsFor(run.level), run) : null;

  return (
    <Screen>
      <Clock />

      <Tile onPress={() => router.push('/water')} label="Water">
        <Small>💧 Water</Small>
        <Big color={colors.water}>
          {waterToday}
          <Text style={{ fontSize: 16, color: colors.muted }}> / {state.waterGoal} ml</Text>
        </Big>
        <Bar pct={pct} color={colors.water} />
        <Small>{glassesLeft ? `${glassesLeft} more glass${glassesLeft > 1 ? 'es' : ''}` : 'Goal reached 🎉'}</Small>
      </Tile>
      <Row>
        <Pill
          label="+250 ml"
          color={colors.water}
          textColor="#00111F"
          onPress={() => {
            addWater(250);
            tap('success');
          }}
        />
      </Row>

      <Tile onPress={() => router.push('/run')} label="Run coach" color={run ? '#3A2600' : colors.tile}>
        <Small>🏃 Run coach · level {run?.level ?? state.coach.level}</Small>
        {status ? (
          <>
            <Label color={colors.run}>{run?.pausedAt ? '⏸ Paused' : status.label}</Label>
            <Big color={colors.run}>{status.clock}</Big>
          </>
        ) : (
          <Label>{describeLevel(state.coach.level)}</Label>
        )}
      </Tile>

      <Tile onPress={() => router.push('/finished')} label="I finished something">
        <Small>🛒 I finished…</Small>
        <Label>{state.toBuy.length ? `${state.toBuy.length} to buy: ${state.toBuy.slice(0, 3).join(', ')}${state.toBuy.length > 3 ? '…' : ''}` : 'Milk, coffee, dish soap…'}</Label>
      </Tile>

      <Tile onPress={() => router.push('/reminders')} label="Reminders">
        <Small>⏰ Reminders</Small>
        <Label>
          {[state.reminders.water && '💧', state.reminders.meals && '🍽️', state.reminders.move && '🚶'].filter(Boolean).join(' ') || 'Off'}
        </Label>
      </Tile>
    </Screen>
  );
}
