const EMOTION_COLORS: Record<string, string> = {
  urgency: '#E24B4A',
  anger: '#E24B4A',
  fear: '#E24B4A',
  admiration: '#7C3AED',
  approval: '#7C3AED',
  gratitude: '#7C3AED',
  joy: '#F2A623',
  amusement: '#F2A623',
  excitement: '#F2A623',
  neutral: '#888780',
};

const DEFAULT_COLOR = '#378ADD';

interface ToneBarProps {
  emotion: string;
  current: number;
  delta: number;
  direction: 'up' | 'down' | 'flat';
}

export function ToneBar({ emotion, current, delta, direction }: ToneBarProps) {
  const color = EMOTION_COLORS[emotion] ?? DEFAULT_COLOR;
  const deltaLabel =
    direction === 'flat'
      ? '0'
      : `${direction === 'up' ? '+' : ''}${delta}`;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="capitalize">{emotion}</span>
        <span>
          {current} ({deltaLabel})
        </span>
      </div>
      <div className="h-2 rounded bg-slate-100">
        <div
          className="h-2 rounded"
          style={{ width: `${Math.min(current, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
