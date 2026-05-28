import type { TemplateListItem } from '../types';
import { useSessionStore } from '../store/sessionStore';

interface TemplateListProps {
  templates: TemplateListItem[];
}

export function TemplateList({ templates }: TemplateListProps) {
  const openTemplate = useSessionStore((state) => state.openTemplate);
  const activeTemplate = useSessionStore((state) => state.templateName);

  return (
    <ul className="flex-1 overflow-y-auto px-2">
      {templates.map((template) => (
        <li key={template.name}>
          <button
            type="button"
            onClick={() => void openTemplate(template.name)}
            className={`mb-1 w-full rounded px-3 py-2 text-left text-sm hover:bg-bg-secondary ${
              activeTemplate === template.name ? 'bg-bg-secondary font-medium' : ''
            }`}
          >
            <span className="block">{template.name}</span>
            {template.description && (
              <span className="block text-xs text-text-sec">
                {template.description}
              </span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
