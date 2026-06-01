import { create } from 'zustand';
import type { HealthStatus, TemplateListItem } from '../types';
import type { MaintenanceJob, ProgressEvent, Toast } from '../types/maintenance';
import { getBrands, getLocales, getTemplates } from '../api/templates';
import { getHealth } from '../api/health';
import { useSessionStore } from './sessionStore';

function createToastId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface AppStore {
  templates: TemplateListItem[];
  locales: string[];
  brands: string[];
  health: Record<string, HealthStatus>;
  healthPollIntervalId: ReturnType<typeof setInterval> | null;
  maintenanceDrawerOpen: boolean;
  maintenanceJobs: MaintenanceJob[];
  activeRefreshTarget: string | null;
  activeRefreshStatus: 'idle' | 'refreshing' | 'failed' | null;
  staleSessionBannerTarget: string | null;
  toasts: Toast[];
  loadTemplates: () => Promise<void>;
  loadLocalesAndBrands: () => Promise<void>;
  pollHealth: () => void;
  stopPolling: () => void;
  openMaintenanceDrawer: () => void;
  closeMaintenanceDrawer: () => void;
  addJob: (job: Omit<MaintenanceJob, 'log' | 'expanded'>) => void;
  appendJobEvent: (job_id: string, event: ProgressEvent) => void;
  finalizeJob: (job_id: string, status: 'done' | 'failed', finished_at: string) => void;
  clearCompletedJobs: () => void;
  toggleJobExpanded: (job_id: string) => void;
  setActiveRefreshTarget: (target: string | null) => void;
  setActiveRefreshStatus: (status: 'idle' | 'refreshing' | 'failed' | null) => void;
  setStaleSessionBannerTarget: (target: string | null) => void;
  dismissStaleSessionBanner: () => void;
  addToast: (message: string, variant: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  templates: [],
  locales: [],
  brands: [],
  health: {},
  healthPollIntervalId: null,
  maintenanceDrawerOpen: false,
  maintenanceJobs: [],
  activeRefreshTarget: null,
  activeRefreshStatus: null,
  staleSessionBannerTarget: null,
  toasts: [],

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

  openMaintenanceDrawer: () => {
    set((state) => ({
      maintenanceDrawerOpen: true,
      activeRefreshStatus:
        state.activeRefreshStatus === 'failed' ? 'idle' : state.activeRefreshStatus,
    }));
  },

  closeMaintenanceDrawer: () => {
    set({ maintenanceDrawerOpen: false });
  },

  addJob: (job) => {
    set((state) => ({
      maintenanceJobs: [
        {
          ...job,
          log: [],
          expanded: true,
        } as MaintenanceJob,
        ...state.maintenanceJobs,
      ],
    }));
  },

  appendJobEvent: (job_id, event) => {
    set((state) => ({
      maintenanceJobs: state.maintenanceJobs.map((job) => {
        if (job.job_id !== job_id) return job;
        const eventKey = `${event.type}|${event.step ?? ''}|${event.timestamp}|${event.message}`;
        if (job.log.some((e) => `${e.type}|${e.step ?? ''}|${e.timestamp}|${e.message}` === eventKey)) {
          return job;
        }
        const nextStatus =
          job.status === 'pending' && event.type !== 'job_done' && event.type !== 'job_failed'
            ? 'running'
            : job.status;
        return {
          ...job,
          status: nextStatus,
          log: [...job.log, event],
        };
      }),
    }));
  },

  finalizeJob: (job_id, status, finished_at) => {
    const state = get();
    const job = state.maintenanceJobs.find((entry) => entry.job_id === job_id);
    const activeRefreshTarget = state.activeRefreshTarget;

    let nextActiveRefreshStatus = state.activeRefreshStatus;
    let nextActiveRefreshTarget = state.activeRefreshTarget;
    let nextStaleSessionBannerTarget = state.staleSessionBannerTarget;

    if (
      job?.type === 'template' &&
      job.target === activeRefreshTarget
    ) {
      nextActiveRefreshStatus = status === 'failed' ? 'failed' : 'idle';
      nextActiveRefreshTarget = null;

      if (status === 'done') {
        const { sessionId, templateName } = useSessionStore.getState();
        if (sessionId && templateName === job.target) {
          nextStaleSessionBannerTarget = job.target;
        }
      }
    }

    set({
      maintenanceJobs: state.maintenanceJobs.map((entry) =>
        entry.job_id === job_id
          ? { ...entry, status, finished_at, expanded: false }
          : entry,
      ),
      activeRefreshStatus: nextActiveRefreshStatus,
      activeRefreshTarget: nextActiveRefreshTarget,
      staleSessionBannerTarget: nextStaleSessionBannerTarget,
    });
  },

  clearCompletedJobs: () => {
    set((state) => ({
      maintenanceJobs: state.maintenanceJobs.filter(
        (job) => job.status !== 'done' && job.status !== 'failed',
      ),
    }));
  },

  toggleJobExpanded: (job_id) => {
    set((state) => ({
      maintenanceJobs: state.maintenanceJobs.map((job) =>
        job.job_id === job_id ? { ...job, expanded: !job.expanded } : job,
      ),
    }));
  },

  setActiveRefreshTarget: (target) => {
    set({ activeRefreshTarget: target });
  },

  setActiveRefreshStatus: (status) => {
    set({ activeRefreshStatus: status });
  },

  setStaleSessionBannerTarget: (target) => {
    set({ staleSessionBannerTarget: target });
  },

  dismissStaleSessionBanner: () => {
    set({ staleSessionBannerTarget: null });
  },

  addToast: (message, variant) => {
    const toast: Toast = {
      id: createToastId(),
      message,
      variant,
    };
    set((state) => ({ toasts: [...state.toasts, toast] }));
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));
