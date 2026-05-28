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
    <div className="space-y-2 border-b border-border-ter p-3">
      <label className="block text-xs font-medium text-text-sec">
        Language
        <select
          value={langLocal}
          onChange={(event) => onLangChange(event.target.value)}
          className="mt-1 w-full rounded border border-border-ter px-2 py-1 text-sm"
        >
          {(locales.length ? locales : ['EN']).map((locale) => (
            <option key={locale} value={locale}>
              {locale}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-xs font-medium text-text-sec">
        Brand
        <select
          value={paramCustBrand}
          onChange={(event) => onBrandChange(event.target.value)}
          className="mt-1 w-full rounded border border-border-ter px-2 py-1 text-sm"
        >
          {(brands.length ? brands : ['SKRILL']).map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
