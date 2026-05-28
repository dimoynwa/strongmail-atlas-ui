import { useState } from 'react';
import type { UnresolvableKey, UnresolvableReason } from '../types';

const REASON_DOT_COLOR: Record<UnresolvableReason, string> = {
  MISSING_KEY: '#F2A623',
  BROKEN_RULE_CHAIN: '#E24B4A',
  CYCLE: '#378ADD',
};

interface UnresolvableKeysPanelProps {
  keys: UnresolvableKey[];
}

export function UnresolvableKeysPanel({ keys }: UnresolvableKeysPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (keys.length === 0) return null;

  const countLabel = keys.length === 1 ? '1 unresolvable key' : `${keys.length} unresolvable keys`;

  return (
    <div className="flex-shrink-0">
      <button
        type="button"
        className="flex w-full items-center gap-1.5 px-2.5 py-2"
        onClick={() => setExpanded((v) => !v)}
      >
        <i className="ti ti-alert-triangle text-[13px] text-text-warning" />
        <span className="text-[11px] font-medium text-text-warning">{countLabel}</span>
        <span className="rounded-full bg-bg-warning px-1.5 py-0.5 text-[10px] text-text-warning">
          {keys.length}
        </span>
        <i
          className={`ti ${expanded ? 'ti-chevron-up' : 'ti-chevron-down'} ml-auto text-[13px] text-text-ter`}
        />
      </button>
      {expanded && (
        <div className="max-h-[180px] overflow-y-auto px-2.5 pb-2">
          <ul className="flex flex-col gap-1.5">
            {keys.map((entry) => (
              <li key={`${entry.key}-${entry.reason}`} className="flex gap-2">
                <span
                  className="mt-1.5 h-[5px] w-[5px] flex-shrink-0 rounded-full"
                  style={{ backgroundColor: REASON_DOT_COLOR[entry.reason] }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    <span className="font-mono text-[11px] font-medium text-text-pri">
                      {entry.key}
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.04em] text-text-ter">
                      {entry.reason}
                    </span>
                  </div>
                  {entry.detail && (
                    <p className="ml-3 text-[10px] italic text-text-ter">{entry.detail}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
