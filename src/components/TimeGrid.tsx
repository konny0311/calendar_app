import React, { useMemo, useRef, useState } from 'react';
import { addDays } from 'date-fns';
import { TZ, clampRange, fromTokyoLocal, hoursLabels, minutesToLabel, ymdInTokyo } from '../lib/time';
import { formatInTimeZone } from 'date-fns-tz';

type Range = { startMin: number; endMin: number };
type Props = {
  baseDate: Date; // day view: this date; week view: week start
  days: number; // 1 for day, 7 for week
  stepMinutes?: number; // default 15
  dayRanges: Record<string, Range[]>; // key: YYYY-MM-DD
  onAddRange: (date: Date, startMin: number, endMin: number) => void;
  onRemoveChunk: (date: Date, startMin: number, endMin: number) => void;
};

export default function TimeGrid({ baseDate, days, stepMinutes = 15, dayRanges, onAddRange, onRemoveChunk }: Props) {
  const slotsPerDay = (24 * 60) / stepMinutes;
  const labels = hoursLabels();
  const containerRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ dayIndex: number; start: number; end: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent, dayIndex: number, slotIndex: number) => {
    // Start drag selection. No pointer capture so pointerenter on other cells fires while dragging.
    setDrag({ dayIndex, start: slotIndex * stepMinutes, end: slotIndex * stepMinutes + stepMinutes });
  };

  const handlePointerEnter = (dayIndex: number, slotIndex: number) => {
    setDrag((d) => {
      if (!d) return d;
      if (d.dayIndex !== dayIndex) return d; // restrict within a day
      const [s, e] = clampRange(d.start, slotIndex * stepMinutes + stepMinutes);
      return { ...d, start: s, end: e };
    });
  };

  const handlePointerUp = () => {
    if (drag) {
      const date = addDays(baseDate, drag.dayIndex);
      const [s, e] = clampRange(drag.start, drag.end);
      if (e - s <= stepMinutes) {
        // treat as click toggle for a single slot
        const ymd = ymdInTokyo(date);
        const ranges = dayRanges[ymd] || [];
        const selected = ranges.some(r => s >= r.startMin && s < r.endMin);
        if (selected) onRemoveChunk(date, s, s + stepMinutes);
        else onAddRange(date, s, s + stepMinutes);
      } else {
        onAddRange(date, s, e);
      }
    }
    setDrag(null);
  };

  const isSelected = (dayIndex: number, slotIndex: number) => {
    const minute = slotIndex * stepMinutes;
    if (drag && drag.dayIndex === dayIndex) {
      const [s, e] = clampRange(drag.start, drag.end);
      return minute >= s && minute < e;
    }
    const ymd = ymdInTokyo(addDays(baseDate, dayIndex));
    const ranges = dayRanges[ymd] || [];
    if (ranges.length === 0) return false;
    return ranges.some(r => minute >= r.startMin && minute < r.endMin);
  };

  return (
    <div className="shadow-card p-2" ref={containerRef} onPointerUp={handlePointerUp}>
      <div className="h-[70vh] overflow-y-auto relative">
        <div
          className="grid sticky top-0 z-10 bg-white border-b border-gray-200"
          style={{ gridTemplateColumns: `60px repeat(${days}, minmax(0, 1fr))` }}
        >
          <div />
          {Array.from({ length: days }, (_, d) => (
            <div key={d} className="text-xs text-gray-500 py-2">
              {formatInTimeZone(addDays(baseDate, d), TZ, 'M/d(EEE)')}
            </div>
          ))}
        </div>

        <div className="grid" style={{ gridTemplateColumns: `60px repeat(${days}, minmax(0, 1fr))` }}>
          {/* time labels aligned to slots */}
          <div className="flex flex-col">
            {Array.from({ length: slotsPerDay }, (_, sIdx) => {
              const show = sIdx % (60 / stepMinutes) === 0; // every hour
              const lbl = show ? minutesToLabel(sIdx * stepMinutes) : '';
              const slotPx = stepMinutes === 15 ? 24 : stepMinutes === 30 ? 48 : stepMinutes * 1.6;
              return (
                <div key={sIdx} className="grid-cell cursor-default" style={{ height: `${slotPx}px` }}>
                  {show && <div className="time-col-label">{lbl}</div>}
                </div>
              );
            })}
          </div>
          {/* day columns */}
          {Array.from({ length: days }, (_, d) => (
            <div key={d} className="flex flex-col">
              {Array.from({ length: slotsPerDay }, (_, sIdx) => (
                <div
                  key={sIdx}
                  className={`grid-cell ${isSelected(d, sIdx) ? 'selected' : ''}`}
                  style={{ height: stepMinutes === 15 ? '24px' : stepMinutes === 30 ? '48px' : `${stepMinutes * 1.6}px` }}
                  onPointerDown={(e) => handlePointerDown(e, d, sIdx)}
                  onPointerEnter={() => handlePointerEnter(d, sIdx)}
                  role="button"
                  aria-label={`${minutesToLabel(sIdx * stepMinutes)} slot`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-2">ドラッグで時間帯を選択できます（同一日のみ）。</div>
    </div>
  );
}
