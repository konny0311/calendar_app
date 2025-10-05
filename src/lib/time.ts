import { addDays, eachDayOfInterval, endOfDay, startOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';

export const TZ = 'Asia/Tokyo';

export type Slot = {
  start: string; // ISO8601 in Asia/Tokyo offset
  end: string;   // ISO8601 in Asia/Tokyo offset
};

export function formatDateLabel(date: Date) {
  // yyyy/MM/dd(曜)
  return formatInTimeZone(date, TZ, "yyyy/MM/dd(EEE)", { locale: ja });
}

export function formatTimeRange(start: Date, end: Date) {
  const sameDay = formatInTimeZone(start, TZ, 'yyyyMMdd') === formatInTimeZone(end, TZ, 'yyyyMMdd');
  const dateLabel = formatInTimeZone(start, TZ, "yyyy/MM/dd(EEE)", { locale: ja });
  if (sameDay) {
    const s = formatInTimeZone(start, TZ, 'HH:mm');
    const e = formatInTimeZone(end, TZ, 'HH:mm');
    return `${dateLabel} ${s}–${e}`;
  }
  const sFull = `${formatInTimeZone(start, TZ, "yyyy/MM/dd(EEE)", { locale: ja })} ${formatInTimeZone(start, TZ, 'HH:mm')}`;
  const eFull = `${formatInTimeZone(end, TZ, "yyyy/MM/dd(EEE)", { locale: ja })} ${formatInTimeZone(end, TZ, 'HH:mm')}`;
  return `${sFull} – ${eFull}`;
}

export function toTokyoISO(date: Date) {
  // Format with offset e.g. +09:00
  return formatInTimeZone(date, TZ, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

export function fromTokyoLocal(dateYmd: string, minutes: number) {
  // Asia/Tokyoは通年UTC+09:00（DSTなし）。
  // minutes = 0..1440（1440は翌日の00:00）を許容。
  const isNextDay = minutes >= 24 * 60;
  const m = isNextDay ? 0 : minutes;
  const hh = Math.floor(m / 60).toString().padStart(2, '0');
  const mm = (m % 60).toString().padStart(2, '0');
  const ymd = isNextDay ? addDaysYmd(dateYmd, 1) : dateYmd;
  const isoWithOffset = `${ymd}T${hh}:${mm}:00+09:00`;
  return new Date(isoWithOffset);
}

export function ymdInTokyo(date: Date) {
  return formatInTimeZone(date, TZ, 'yyyy-MM-dd');
}

export function hoursLabels() {
  // 0..23 labels
  return Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
}

export function eachDay(start: Date, end: Date) {
  return eachDayOfInterval({ start: startOfDay(start), end: endOfDay(end) });
}

export function clampRange(a: number, b: number, min = 0, max = 24 * 60) {
  const s = Math.max(min, Math.min(a, b));
  const e = Math.min(max, Math.max(a, b));
  return [s, e] as const;
}

export function minutesToLabel(mins: number) {
  const hh = Math.floor(mins / 60).toString().padStart(2, '0');
  const mm = (mins % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export function addDaysYmd(ymd: string, days: number) {
  // ymd is YYYY-MM-DD. Interpret in Tokyo midnight, add days, return YYYY-MM-DD in Tokyo
  const d = new Date(`${ymd}T00:00:00+09:00`);
  const dd = addDays(d, days);
  return formatInTimeZone(dd, TZ, 'yyyy-MM-dd');
}
