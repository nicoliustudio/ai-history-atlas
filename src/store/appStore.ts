import { create } from 'zustand';
import { EventStatus, LandmarkTier, TrackId } from '../types';

export interface FilterState {
  eraIds: string[];
  trackIds: TrackId[];
  tiers: LandmarkTier[];
  statuses: EventStatus[];
  startYear: number;
  endYear: number;
  includeWatchlist: boolean;
  searchQuery: string;
  countryCodes: string[];
}

interface AppStore {
  locale: 'zh-CN' | 'en';
  theme: 'dark' | 'light';
  reducedMotion: boolean;

  activeMode: 'explore' | 'story' | 'concepts' | 'compare';
  selectedEventId: string | null;
  selectedConceptId: string | null;
  isDetailDrawerOpen: boolean;
  isSearchModalOpen: boolean;
  isCustomNodeModalOpen: boolean;
  customDataVersion: number;

  filter: FilterState;

  mapProjection: 'globe' | 'mercator';
  mapViewState: { lat: number; lng: number; zoom: number };

  story: {
    currentChapterIndex: number;
    playbackStatus: 'playing' | 'paused' | 'stopped';
    speed: number;
  };

  // Actions
  setLocale: (locale: 'zh-CN' | 'en') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setReducedMotion: (val: boolean) => void;
  setActiveMode: (mode: 'explore' | 'story' | 'concepts' | 'compare') => void;

  setSelectedEventId: (id: string | null) => void;
  setSelectedConceptId: (id: string | null) => void;
  setDetailDrawerOpen: (open: boolean) => void;
  setSearchModalOpen: (open: boolean) => void;
  setCustomNodeModalOpen: (open: boolean) => void;
  bumpCustomDataVersion: () => void;

  updateFilter: (partialFilter: Partial<FilterState>) => void;
  resetFilter: () => void;

  setMapProjection: (proj: 'globe' | 'mercator') => void;
  setMapViewState: (state: { lat: number; lng: number; zoom: number }) => void;

  setStoryChapter: (index: number) => void;
  setStoryPlaybackStatus: (status: 'playing' | 'paused' | 'stopped') => void;
  setStorySpeed: (speed: number) => void;
}

const initialFilter: FilterState = {
  eraIds: [],
  trackIds: [],
  tiers: ['S', 'A'], // Default S & A
  statuses: ['verified', 'disputed', 'watch'],
  startYear: 1943,
  endYear: 2026,
  includeWatchlist: true,
  searchQuery: '',
  countryCodes: [],
};

export const useAppStore = create<AppStore>((set) => ({
  locale: 'zh-CN',
  theme: 'dark',
  reducedMotion: false,

  activeMode: 'explore',
  selectedEventId: null,
  selectedConceptId: null,
  isDetailDrawerOpen: false,
  isSearchModalOpen: false,
  isCustomNodeModalOpen: false,
  customDataVersion: 0,

  filter: initialFilter,

  mapProjection: 'globe',
  mapViewState: { lat: 30.0, lng: 10.0, zoom: 2.5 },

  story: {
    currentChapterIndex: 0,
    playbackStatus: 'stopped',
    speed: 1.0,
  },

  setLocale: (locale) => set({ locale }),
  setTheme: (theme) => set({ theme }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setActiveMode: (activeMode) => set({ activeMode }),

  setSelectedEventId: (id) =>
    set({
      selectedEventId: id,
      isDetailDrawerOpen: id !== null,
    }),

  setSelectedConceptId: (id) => set({ selectedConceptId: id }),
  setDetailDrawerOpen: (open) => set({ isDetailDrawerOpen: open }),
  setSearchModalOpen: (open) => set({ isSearchModalOpen: open }),
  setCustomNodeModalOpen: (open) => set({ isCustomNodeModalOpen: open }),
  bumpCustomDataVersion: () =>
    set((state) => ({ customDataVersion: state.customDataVersion + 1 })),

  updateFilter: (partialFilter) =>
    set((state) => ({
      filter: { ...state.filter, ...partialFilter },
    })),

  resetFilter: () => set({ filter: initialFilter }),

  setMapProjection: (mapProjection) => set({ mapProjection }),
  setMapViewState: (mapViewState) => set({ mapViewState }),

  setStoryChapter: (index) =>
    set((state) => ({
      story: { ...state.story, currentChapterIndex: index },
    })),

  setStoryPlaybackStatus: (playbackStatus) =>
    set((state) => ({
      story: { ...state.story, playbackStatus },
    })),

  setStorySpeed: (speed) =>
    set((state) => ({
      story: { ...state.story, speed },
    })),
}));
