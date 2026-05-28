import { useAppStore } from '../store/appStore';

interface ContextSelectorsProps {
  langLocal: string;
  paramCustBrand: string;
  onLangChange: (lang: string) => void;
  onBrandChange: (brand: string) => void;
}

export function ContextSelectors({
  langLocal,
  paramCustBrand,
  onLangChange,
  onBrandChange,
}: ContextSelectorsProps) {
  const locales = useAppStore((state) => state.locales);
  const brands = useAppStore((state) => state.brands);

  return (
    <div className="space-y-1 border-b border-border-ter p-2">
      <div className="flex items-center gap-2">
        <span className="w-[38px] flex-shrink-0 text-[10px] uppercase tracking-[0.04em] text-text-ter">
          Lang
        </span>
        <select
          value={langLocal}
          onChange={(event) => onLangChange(event.target.value)}
          className="flex-1 rounded border border-border-sec bg-bg-primary px-1.5 py-1 text-[11px]"
        >
          {(locales.length ? locales : ['EN']).map((locale) => (
            <option key={locale} value={locale}>
              {locale}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-[38px] flex-shrink-0 text-[10px] uppercase tracking-[0.04em] text-text-ter">
          Brand
        </span>
        <select
          value={paramCustBrand}
          onChange={(event) => onBrandChange(event.target.value)}
          className="flex-1 rounded border border-border-sec bg-bg-primary px-1.5 py-1 text-[11px]"
        >
          {(brands.length ? brands : ['SKRILL']).map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
