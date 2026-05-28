const HIGHLIGHT_STYLE =
  'border-left:2px solid #22c55e;padding-left:6px;color:#166534';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function highlightModifiedValues(
  html: string,
  workingCopy: Record<string, string>,
  modifiedKeys: Set<string>,
): string {
  let result = html;

  for (const key of modifiedKeys) {
    const value = workingCopy[key];
    if (!value) continue;

    const index = result.indexOf(value);
    if (index === -1) continue;

    const highlighted = `<span style="${HIGHLIGHT_STYLE}">${escapeHtml(value)}</span>`;
    result = result.slice(0, index) + highlighted + result.slice(index + value.length);
  }

  return result;
}
