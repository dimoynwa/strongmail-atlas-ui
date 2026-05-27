const HIGHLIGHT_STYLE =
  'border-left:2px solid #22c55e;padding-left:6px;color:#166534';

export function highlightModifiedValues(
  html: string,
  workingCopy: Record<string, string>,
  modifiedKeys: Set<string>,
): string {
  let result = html;

  for (const key of modifiedKeys) {
    const value = workingCopy[key];
    if (!value) continue;

    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(${escaped})`, 'g');
    result = result.replace(
      pattern,
      `<span style="${HIGHLIGHT_STYLE}">$1</span>`,
    );
  }

  return result;
}
