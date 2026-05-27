export function ToolChip({ name }: { name: string }) {
  return (
    <span className="mb-1 inline-block rounded bg-white/20 px-2 py-0.5 text-xs">
      {name}
    </span>
  );
}
