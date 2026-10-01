import { Bar, Big, colors, Label, Pill, Row, Screen, Small, tap } from '../components/watch';
import { useStore } from '../lib/store';
import { GLASSES, waterProgress } from '../lib/watch';

const GOALS = [1500, 2000, 2500, 3000];

export default function Water() {
  const { state, waterToday, addWater, undoWater, setWaterGoal } = useStore();
  const { pct } = waterProgress(waterToday, state.waterGoal);
  const last = state.sips[state.sips.length - 1];

  return (
    <Screen>
      <Small>💧 Today</Small>
      <Big color={colors.water}>{waterToday} ml</Big>
      <Bar pct={pct} color={colors.water} />
      <Small>
        {Math.round(pct * 100)}% of {state.waterGoal} ml
      </Small>
      <Row>
        {GLASSES.map((ml) => (
          <Pill
            key={ml}
            label={`+${ml}`}
            color={colors.water}
            textColor="#00111F"
            onPress={() => {
              addWater(ml);
              tap('success');
            }}
          />
        ))}
      </Row>
      {last && <Pill label={`↩ Undo ${last.ml} ml`} onPress={undoWater} />}
      <Label>Daily goal</Label>
      <Row>
        {GOALS.map((g) => (
          <Pill key={g} label={`${g / 1000} L`} color={g === state.waterGoal ? colors.water : colors.tile} textColor={g === state.waterGoal ? '#00111F' : colors.text} onPress={() => setWaterGoal(g)} />
        ))}
      </Row>
    </Screen>
  );
}
