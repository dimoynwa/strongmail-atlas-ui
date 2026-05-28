import { create } from 'zustand';
import type { HealthStatus, TemplateListItem } from '../types';
import { getBrands, getLocales, getTemplates } from '../api/templates';
import { getHealth } from '../api/health';

export interface AppStore {
  templates: TemplateListItem[];
  locales: string[];
  brands: string[];
  health: Record<string, HealthStatus>;
  healthPollIntervalId: ReturnType<typeof setInterval> | null;
  loadTemplates: () => Promise<void>;
  loadLocalesAndBrands: () => Promise<void>;
  pollHealth: () => void;
  stopPolling: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  templates: [],
  locales: [],
  brands: [],
  health: {},
  healthPollIntervalId: null,

  loadTemplates: async () => {
    const templates = await getTemplates();
    set({ templates });
  },

  loadLocalesAndBrands: async () => {
    const [locales, brands] = await Promise.all([getLocales(), getBrands()]);
    set({ locales, brands });
  },

  pollHealth: () => {
    const existing = get().healthPollIntervalId;
    if (existing) {
      clearInterval(existing);
    }

    const fetchHealth = async () => {
      try {
        const response = await getHealth();
        set({ health: response.components });
      } catch {
        set({
          health: {
            redis: 'unavailable',
            postgres: 'unavailable',
            adk: 'unavailable',
          },
        });
      }
    };

    void fetchHealth();
    const intervalId = setInterval(() => {
      void fetchHealth();
    }, 30000);

    set({ healthPollIntervalId: intervalId });
  },

  stopPolling: () => {
    const intervalId = get().healthPollIntervalId;
    if (intervalId) {
      clearInterval(intervalId);
      set({ healthPollIntervalId: null });
    }
  },
}));
