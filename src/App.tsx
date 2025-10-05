import React, { useMemo, useState } from 'react';
import Header from './components/Header';
import MonthView from './components/MonthView';
import TimeGrid from './components/TimeGrid';
import PreviewPanel from './components/PreviewPanel';
import { TZ, fromTokyoLocal, ymdInTokyo } from './lib/time';
import { addDays, startOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';

type View = 'month' | 'week' | 'day';

export default function App() {
  const [view, setView] = useState<View>('week');
  const [cursorDate, setCursorDate] = useState<Date>(new Date());
  const [dayRanges, setDayRanges] = useState<Record<string, { startMin: number; endMin: number }[]>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [copyFail, setCopyFail] = useState<boolean>(false);

  const weekStart = useMemo(() => startOfWeek(cursorDate, { locale: ja }), [cursorDate]);

  const previewItems = useMemo(() => {
    const ymds = Object.keys(dayRanges).sort();
    const items: { start: Date; end: Date }[] = [];
    for (const ymd of ymds) {
      const ranges = (dayRanges[ymd] || []).slice().sort((a,b)=>a.startMin-b.startMin);
      for (const r of ranges) {
        items.push({ start: fromTokyoLocal(ymd, r.startMin), end: fromTokyoLocal(ymd, r.endMin) });
      }
    }
    return items;
  }, [dayRanges]);

  const onAddRange = (date: Date, s: number, e: number) => {
    const ymd = ymdInTokyo(date);
    setDayRanges((prev) => {
      const next = { ...prev };
      const arr = next[ymd] ? [...next[ymd]] : [];
      next[ymd] = mergeRanges([...arr, normalizeRange(s, e)]);
      return next;
    });
  };

  const onRemoveChunk = (date: Date, s: number, e: number) => {
    const ymd = ymdInTokyo(date);
    setDayRanges((prev) => {
      const next = { ...prev };
      const arr = next[ymd] ? [...next[ymd]] : [];
      next[ymd] = subtractChunk(arr, { startMin: s, endMin: e });
      if (next[ymd].length === 0) delete next[ymd];
      return next;
    });
  };

  const toggleDate = (d: Date) => {
    // 月ビュークリックで日ビューにジャンプ（トグル管理は行わない）
    setCursorDate(d);
    setView('day');
  };

  function normalizeRange(a: number, b: number) {
    const [startMin, endMin] = a <= b ? [a, b] : [b, a];
    return { startMin, endMin };
  }

  function mergeRanges(arr: { startMin: number; endMin: number }[]) {
    const sorted = arr
      .filter(r => r.endMin > r.startMin)
      .sort((x, y) => x.startMin - y.startMin);
    const merged: { startMin: number; endMin: number }[] = [];
    for (const r of sorted) {
      if (!merged.length || merged[merged.length - 1].endMin < r.startMin) {
        merged.push({ ...r });
      } else {
        merged[merged.length - 1].endMin = Math.max(merged[merged.length - 1].endMin, r.endMin);
      }
    }
    return merged;
  }

  function subtractChunk(
    arr: { startMin: number; endMin: number }[],
    chunk: { startMin: number; endMin: number }
  ) {
    const res: { startMin: number; endMin: number }[] = [];
    for (const r of arr) {
      const s = r.startMin, e = r.endMin;
      const cs = chunk.startMin, ce = chunk.endMin;
      if (ce <= s || cs >= e) {
        // no overlap
        res.push(r);
        continue;
      }
      // overlap exists; keep left and right parts if any
      if (s < cs) res.push({ startMin: s, endMin: Math.max(s, Math.min(cs, e)) });
      if (ce < e) res.push({ startMin: Math.max(ce, s), endMin: e });
    }
    return mergeRanges(res);
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast('コピーしました');
      setCopyFail(false);
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setCopyFail(true);
      // Fallback handled by UI instruction; no throw
    }
  };

  return (
    <div className="app-container p-3 sm:p-6">
      <div className="max-w-[1200px] mx-auto">
        <Header view={view} onChangeView={setView} cursorDate={cursorDate} setCursorDate={setCursorDate} />
        <div className="mt-4 grid gap-4" style={{ gridTemplateColumns: '1fr var(--panel-width)' }}>
          <div className="min-w-0">
            {view === 'month' && (
              <MonthView
                cursorDate={cursorDate}
                selectedYmds={new Set(Object.keys(dayRanges))}
                onToggleDate={toggleDate}
              />
            )}
            {view === 'day' && (
              <TimeGrid
                baseDate={cursorDate}
                days={1}
                dayRanges={dayRanges}
                onAddRange={onAddRange}
                onRemoveChunk={onRemoveChunk}
              />
            )}
            {view === 'week' && (
              <TimeGrid
                baseDate={weekStart}
                days={7}
                dayRanges={dayRanges}
                onAddRange={onAddRange}
                onRemoveChunk={onRemoveChunk}
              />
            )}
          </div>
          <div className="min-w-[var(--panel-width)]">
            <PreviewPanel
              items={previewItems}
              onCopy={handleCopy}
              onClearDates={() => setDayRanges({})}
              onClearRanges={() => setDayRanges({})}
            />
            {copyFail && (
              <div className="mt-3 text-xs text-red-600">
                クリップボードへの書き込みに失敗しました。テキストを選択して Ctrl+C / Cmd+C でコピーしてください。
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
