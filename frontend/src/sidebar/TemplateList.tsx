import type { TemplateListItem } from '../types';
import { useSessionStore } from '../store/sessionStore';

interface TemplateListProps {
  templates: TemplateListItem[];
}

export function TemplateList({ templates }: TemplateListProps) {
  const openTemplate = useSessionStore((state) => state.openTemplate);
  const activeTemplate = useSessionStore((state) => state.templateName);
  const isOpeningTemplate = useSessionStore((state) => state.isOpeningTemplate);
  const openingTemplateName = useSessionStore((state) => state.openingTemplateName);

  return (
    <div className="flex-1 overflow-y-auto py-1">
      <div className="px-2 py-1 text-[10px] uppercase tracking-[0.04em] text-text-ter">
        Templates
      </div>
      <ul>
        {templates.map((template) => {
          const isOpeningThis =
            isOpeningTemplate && openingTemplateName === template.name;

          return (
            <li key={template.name}>
              <button
                type="button"
                onClick={() => void openTemplate(template.name)}
                className={`mx-1 w-full rounded px-2 py-1.5 text-left hover:bg-bg-secondary ${
                  activeTemplate === template.name ? 'bg-bg-info' : ''
                }`}
              >
                <span
                  className={`block truncate text-[12px] font-medium ${
                    activeTemplate === template.name ? 'text-text-info' : 'text-text-pri'
                  }`}
                >
                  {template.name}
                </span>
                {isOpeningThis ? (
                  <span className="flex items-center gap-1.5 text-[10px] text-text-ter">
                    <span className="template-opening-spinner" aria-hidden />
                    Opening…
                  </span>
                ) : (
                  <span className="block text-[10px] text-text-ter">
                    {template.key_count ?? 0} keys · {template.last_modified ?? '—'}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
