import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { DailyReminder } from './watch';

export const notificationsSupported = Platform.OS !== 'web';

if (notificationsSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

let permission: boolean | null = null;

async function ensurePermission(): Promise<boolean> {
  if (permission !== null) return permission;
  const { granted } = await Notifications.requestPermissionsAsync();
  permission = granted;
  if (granted && Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', { name: 'Reminders', importance: Notifications.AndroidImportance.DEFAULT });
    // Run phases must buzz even when the screen is off.
    await Notifications.setNotificationChannelAsync('run', {
      name: 'Run intervals',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 400, 200, 400],
    });
  }
  return granted;
}

/** Cancels this app's scheduled notifications whose id starts with `prefix`. */
async function cancelPrefix(prefix: string): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(all.filter((n) => n.identifier.startsWith(prefix)).map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}

export async function syncReminders(list: DailyReminder[]): Promise<void> {
  if (!notificationsSupported) return;
  await cancelPrefix('reminder-');
  if (!list.length || !(await ensurePermission())) return;
  await Promise.all(
    list.map((r) =>
      Notifications.scheduleNotificationAsync({
        identifier: `reminder-${r.id}`,
        content: { title: r.title, body: r.body },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: r.hour, minute: r.minute, channelId: 'reminders' },
      }),
    ),
  );
}

export async function scheduleRunAlerts(alerts: { at: Date; title: string; body: string }[]): Promise<void> {
  if (!notificationsSupported) return;
  await cancelPrefix('run-');
  if (!(await ensurePermission())) return;
  await Promise.all(
    alerts.map((a, i) =>
      Notifications.scheduleNotificationAsync({
        identifier: `run-${i}`,
        content: { title: a.title, body: a.body },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: a.at, channelId: 'run' },
      }),
    ),
  );
}

export const cancelRunAlerts = () => (notificationsSupported ? cancelPrefix('run-') : Promise.resolve());
