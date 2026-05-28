import { useSessionStore } from '../store/sessionStore';

export function ResultCards() {
  const cards = useSessionStore((state) => state.generalResultCards);
  const clearGeneralResults = useSessionStore((state) => state.clearGeneralResults);
  const openTemplate = useSessionStore((state) => state.openTemplate);
  const setActiveTab = useSessionStore((state) => state.setActiveTab);

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-border-ter p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium">Results</h3>
        <button
          type="button"
          className="text-xs text-text-sec hover:text-text-pri"
          onClick={() => clearGeneralResults()}
        >
          Clear results
        </button>
      </div>
      <div className="space-y-2">
        {cards.map((card) => (
          <div
            key={`${card.template_name}-${card.description ?? ''}`}
            className="rounded border border-border-ter p-3 text-sm"
          >
            <div className="font-medium">{card.template_name}</div>
            {card.description && (
              <div className="text-xs text-text-sec">{card.description}</div>
            )}
            <button
              type="button"
              className="mt-2 text-xs font-medium text-text-pri hover:underline"
              onClick={() => {
                setActiveTab('template');
                void openTemplate(card.template_name);
              }}
            >
              Open →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
