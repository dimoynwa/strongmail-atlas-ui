import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';

export type MarkdownVariant = 'assistant' | 'user' | 'error';

interface MarkdownContentProps {
  content: string;
  variant?: MarkdownVariant;
  className?: string;
}

function buildComponents(variant: MarkdownVariant): Components {
  const isUser = variant === 'user';
  const isError = variant === 'error';

  const linkClass = isUser
    ? 'underline opacity-90 hover:opacity-100'
    : isError
      ? 'text-text-danger underline'
      : 'text-text-info underline hover:opacity-90';

  const inlineCodeClass = isUser
    ? 'rounded bg-white/20 px-1 py-0.5 font-mono text-[0.85em]'
    : 'rounded bg-bg-tertiary px-1 py-0.5 font-mono text-[0.85em]';

  const preClass = isUser
    ? 'mb-2 overflow-x-auto rounded-md border border-white/20 bg-black/20 p-2 font-mono text-xs'
    : 'mb-2 overflow-x-auto rounded-md border border-border-ter bg-bg-primary p-2 font-mono text-xs';

  const blockquoteClass = isUser
    ? 'mb-2 border-l-2 border-white/40 pl-3 opacity-90'
    : isError
      ? 'mb-2 border-l-2 border-text-danger/50 pl-3 text-text-danger/90'
      : 'mb-2 border-l-2 border-border-sec pl-3 text-text-sec';

  const hrClass = isUser ? 'my-3 border-white/25' : 'my-3 border-border-ter';

  const thTdClass = isUser ? 'border border-white/25 px-2 py-1' : 'border border-border-ter px-2 py-1';

  return {
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    h1: ({ children }) => <h1 className="mb-2 text-base font-semibold">{children}</h1>,
    h2: ({ children }) => <h2 className="mb-2 text-sm font-semibold">{children}</h2>,
    h3: ({ children }) => <h3 className="mb-1.5 text-sm font-medium">{children}</h3>,
    ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5">{children}</ul>,
    ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    a: ({ children, href }) => (
      <a href={href} className={linkClass} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    blockquote: ({ children }) => <blockquote className={blockquoteClass}>{children}</blockquote>,
    hr: () => <hr className={hrClass} />,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ className, children, ...props }) => {
      const isFenced = /language-(\w+)/.test(className ?? '');
      if (isFenced) {
        return (
          <code className={`block whitespace-pre font-mono text-xs ${className ?? ''}`} {...props}>
            {children}
          </code>
        );
      }
      return (
        <code className={inlineCodeClass} {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children }) => <pre className={preClass}>{children}</pre>,
    table: ({ children }) => (
      <div className="mb-2 overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className={isUser ? 'bg-white/10' : 'bg-bg-tertiary'}>{children}</thead>,
    th: ({ children }) => <th className={`${thTdClass} font-medium`}>{children}</th>,
    td: ({ children }) => <td className={thTdClass}>{children}</td>,
  };
}

const variantComponents: Record<MarkdownVariant, Components> = {
  assistant: buildComponents('assistant'),
  user: buildComponents('user'),
  error: buildComponents('error'),
};

export function MarkdownContent({
  content,
  variant = 'assistant',
  className = '',
}: MarkdownContentProps) {
  return (
    <div
      className={`text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${className}`.trim()}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={variantComponents[variant]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
