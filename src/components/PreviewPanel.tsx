import React from 'react';
import { Slot, TZ, formatTimeRange, toTokyoISO } from '../lib/time';
import { formatInTimeZone } from 'date-fns-tz';

type Props = {
  items: { start: Date; end: Date }[];
  onCopy: (text: string) => Promise<void>;
  onClearRanges?: () => void;
};

export default function PreviewPanel({ items, onCopy, onClearRanges }: Props) {
  const lines = items.map(({ start, end }) => {
    const isAllDay = formatInTimeZone(start, TZ, 'HH:mm') === '00:00' && formatInTimeZone(end, TZ, 'HH:mm') === '00:00' &&
      formatInTimeZone(start, TZ, 'yyyyMMdd') !== formatInTimeZone(end, TZ, 'yyyyMMdd');
    if (isAllDay) return `${formatInTimeZone(start, TZ, 'yyyy/MM/dd(EEE)')} 終日`;
    return formatTimeRange(start, end);
  });
  const text = lines.length ? lines.join('\n') : '日付と時間帯を選択してください';

  const handleCopy = async () => {
    await onCopy(text);
  };

  return (
    <div className="shadow-card p-4 sticky top-2">
      <div className="text-sm text-gray-600 mb-1">出力プレビュー</div>
      <pre className="p-3 bg-gray-50 rounded border border-gray-200 break-words min-h-[48px] whitespace-pre-wrap" data-testid="preview-text">{text}</pre>
      <button className="btn btn-primary w-full mt-3" onClick={handleCopy}>コピー</button>
      {onClearRanges && (
        <div className="mt-2">
          <button className="btn btn-ghost" onClick={onClearRanges}>時間帯をクリア</button>
        </div>
      )}
      {items.length > 0 && (
        <details className="mt-3 text-xs text-gray-500">
          <summary>詳細（ISO8601 / Asia/Tokyo）</summary>
          <div className="mt-1 space-y-1">
            {items.map(({ start, end }, i) => (
              <div key={i}>
                <div>start: <code>{toTokyoISO(start)}</code></div>
                <div>end: <code>{toTokyoISO(end)}</code></div>
              </div>
            ))}
          </div>
        </details>
      )}
      <div className="text-[11px] text-gray-400 mt-3">タイムゾーン: Asia/Tokyo 固定</div>
    </div>
  );
}
