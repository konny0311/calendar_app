import React from 'react';
import { addDays, endOfMonth, endOfWeek, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { TZ, ymdInTokyo } from '../lib/time';

type Props = {
  cursorDate: Date;
  selectedYmds: Set<string>;
  onToggleDate: (d: Date) => void;
};

export default function MonthView({ cursorDate, selectedYmds, onToggleDate }: Props) {
  const monthStart = startOfMonth(cursorDate);
  const monthEnd = endOfMonth(cursorDate);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);

  const rows: JSX.Element[] = [];
  let day = gridStart;
  while (day <= gridEnd) {
    const cells: JSX.Element[] = [];
    for (let i=0;i<7;i++) {
      const d = day;
      const isCurrentMonth = isSameMonth(d, monthStart);
      const isSelected = selectedYmds.has(ymdInTokyo(d)); // 日付に範囲がある日を強調
      cells.push(
        <div key={i}
          onClick={() => onToggleDate(d)}
          className={
            `p-2 border border-gray-100 min-h-[90px] cursor-pointer ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''} ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white' : ''}`
          }
        >
          <div className="text-xs text-gray-500">{formatInTimeZone(d, TZ, 'd')}</div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(<div key={ymdInTokyo(day)} className="grid grid-cols-7">{cells}</div>);
  }

  return (
    <div className="shadow-card p-2">
      <div className="grid grid-cols-7 text-xs text-gray-500 px-2 pb-1">
        {['日','月','火','水','木','金','土'].map((w) => (
          <div key={w} className="py-1">{w}</div>
        ))}
      </div>
      <div className="flex flex-col gap-0">{rows}</div>
    </div>
  );
}
