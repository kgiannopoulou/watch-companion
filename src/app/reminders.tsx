import { Switch, View } from 'react-native';
import { colors, Label, Pill, Row, Screen, Small, Tile } from '../components/watch';
import { notificationsSupported } from '../lib/notifications';
import { useStore } from '../lib/store';
import type { ReminderSettings } from '../lib/types';
import { reminderPlan } from '../lib/watch';

function Toggle({ label, detail, value, onChange }: { label: string; detail: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Tile>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Label>{label}</Label>
          <Small>{detail}</Small>
        </View>
        <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.walk, false: colors.track }} accessibilityLabel={label} />
      </View>
    </Tile>
  );
}

export default function Reminders() {
  const { state, setReminders } = useStore();
  const r = state.reminders;
  const set = (patch: Partial<ReminderSettings>) => setReminders({ ...r, ...patch });
  const count = reminderPlan(r).length;

  return (
    <Screen>
      <Label>⏰ Reminders</Label>
      {!notificationsSupported && <Small>Reminders work on the watch or phone app, not on web.</Small>}
      <Toggle label="💧 Water" detail={`Every ${r.waterEvery} h, ${r.from}:00–${r.to}:00`} value={r.water} onChange={(water) => set({ water })} />
      {r.water && (
        <Row>
          {[1, 2, 3].map((h) => (
            <Pill key={h} label={`${h} h`} color={r.waterEvery === h ? colors.water : colors.tile} textColor={r.waterEvery === h ? '#00111F' : colors.text} onPress={() => set({ waterEvery: h })} />
          ))}
        </Row>
      )}
      <Toggle label="🍽️ Meals" detail={`${r.breakfast} · ${r.lunch} · ${r.dinner}`} value={r.meals} onChange={(meals) => set({ meals })} />
      <Toggle label="🚶 Move" detail="10:50–17:50, stand up and stretch" value={r.move} onChange={(move) => set({ move })} />
      <Small>{count ? `${count} reminders a day` : 'No reminders'}</Small>
    </Screen>
  );
}
