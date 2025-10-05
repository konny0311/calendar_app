import { addDays, addMonths, format, startOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';
import { TZ } from '../lib/time';
import React from 'react';

type Props = {
  view: 'month' | 'week' | 'day';
  onChangeView: (v: 'month' | 'week' | 'day') => void;
  cursorDate: Date;
  setCursorDate: (d: Date) => void;
};

export default function Header({ view, onChangeView, cursorDate, setCursorDate }: Props) {
  const title = (() => {
    if (view === 'month') return formatInTimeZone(cursorDate, TZ, 'yyyy年 M月', { locale: ja });
    if (view === 'day') return formatInTimeZone(cursorDate, TZ, 'yyyy/MM/dd(EEE)', { locale: ja });
    const weekStart = startOfWeek(cursorDate, { locale: ja });
    const weekEnd = addDays(weekStart, 6);
    const s = formatInTimeZone(weekStart, TZ, 'M/d');
    const e = formatInTimeZone(weekEnd, TZ, 'M/d');
    return `${formatInTimeZone(cursorDate, TZ, 'yyyy年')} 週: ${s} – ${e}`;
  })();

  const goPrev = () => {
    if (view === 'month') setCursorDate(addMonths(cursorDate, -1));
    else if (view === 'week') setCursorDate(addDays(cursorDate, -7));
    else setCursorDate(addDays(cursorDate, -1));
  };
  const goNext = () => {
    if (view === 'month') setCursorDate(addMonths(cursorDate, 1));
    else if (view === 'week') setCursorDate(addDays(cursorDate, 7));
    else setCursorDate(addDays(cursorDate, 1));
  };
  const goToday = () => setCursorDate(new Date());

  return (
    <div className="flex items-center justify-between gap-4 p-3 shadow-card">
      <div className="flex items-center gap-2">
        <button className="btn btn-ghost" onClick={goPrev} aria-label="前へ">‹</button>
        <button className="btn btn-ghost" onClick={goToday}>今日</button>
        <button className="btn btn-ghost" onClick={goNext} aria-label="次へ">›</button>
        <div className="ml-4 text-lg font-semibold">{title}</div>
      </div>
      <div className="flex items-center gap-1">
        {(['month','week','day'] as const).map(v => (
          <button key={v} className="tab" data-active={view===v} onClick={() => onChangeView(v)}>
            {v === 'month' ? '月' : v === 'week' ? '週' : '日'}
          </button>
        ))}
      </div>
    </div>
  );
}

