import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Share, TextInput } from 'react-native';
import { colors, Label, Pill, Row, Screen, Small, tap } from '../components/watch';
import { categorize, shoppingLink, shoppingText } from '../lib/homeCore';
import { useStore } from '../lib/store';
import { QUICK_ITEMS } from '../lib/watch';

export default function Finished() {
  const { state, addToBuy, removeToBuy, clearToBuy } = useStore();
  const [custom, setCustom] = useState('');
  const [status, setStatus] = useState('');
  const quick = QUICK_ITEMS.filter((i) => !state.toBuy.includes(i));

  const send = async () => {
    try {
      // Opens Smart Shopping List when it's installed on this device.
      await Linking.openURL(shoppingLink({ items: state.toBuy }));
      setStatus('Sent to your shopping list ✓');
    } catch {
      await Share.share({ message: shoppingText(state.toBuy.map((name) => ({ name, category: categorize(name) }))) });
      setStatus('Shared ✓');
    }
    clearToBuy();
    tap('success');
  };

  return (
    <Screen>
      <Label>🛒 I finished…</Label>
      <Small>Tap what ran out.</Small>
      <Row>
        {quick.map((name) => (
          <Pill key={name} label={name} onPress={() => addToBuy(name)} />
        ))}
      </Row>
      <TextInput
        value={custom}
        onChangeText={setCustom}
        placeholder="Something else…"
        placeholderTextColor={colors.muted}
        returnKeyType="done"
        onSubmitEditing={() => {
          if (custom.trim()) addToBuy(custom);
          setCustom('');
        }}
        style={{ backgroundColor: colors.tile, color: colors.text, borderRadius: 22, paddingHorizontal: 14, minHeight: 44, fontSize: 16 }}
      />
      {state.toBuy.length > 0 && (
        <>
          <Label>To buy ({state.toBuy.length})</Label>
          <Row>
            {state.toBuy.map((name) => (
              <Pill key={name} label={`${name} ✕`} color="#2A0F36" textColor={colors.shop} onPress={() => removeToBuy(name)} />
            ))}
          </Row>
          <Pill label="Send to shopping list" color={colors.shop} textColor="#1A0024" onPress={send} />
        </>
      )}
      {!!status && <Small>{status}</Small>}
    </Screen>
  );
}
