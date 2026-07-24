import { AiHistoryEvent, Concept, Era, LandmarkTier, EventStatus, Relation, Source, TrackId, StoryChapter } from '../types';
import { EVENTS } from './events';
import { CONCEPTS } from './concepts';
import { ERAS } from './eras';
import { TRACKS } from './tracks';
import { RELATIONS } from './relations';
import { SOURCES } from './sources';
import { ORGANIZATIONS, PEOPLE } from './organizations';
import { STORY_CHAPTERS } from './stories';

export interface FilterOptions {
  eraIds?: string[];
  trackIds?: TrackId[];
  tiers?: LandmarkTier[];
  statuses?: EventStatus[];
  searchQuery?: string;
  countryCodes?: string[];
  startYear?: number;
  endYear?: number;
  includeWatchlist?: boolean;
}

const CUSTOM_EVENTS_KEY = 'ai_atlas_custom_events_v1';
const CUSTOM_CHAPTERS_KEY = 'ai_atlas_custom_chapters_v1';

function loadCustomEvents(): AiHistoryEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomEvents(events: AiHistoryEvent[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_EVENTS_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save custom events', err);
  }
}

function loadCustomChapters(): StoryChapter[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_CHAPTERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomChapters(chapters: StoryChapter[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_CHAPTERS_KEY, JSON.stringify(chapters));
  } catch (err) {
    console.error('Failed to save custom chapters', err);
  }
}

export class DataRepository {
  static getEras(): Era[] {
    return ERAS;
  }

  static getTracks() {
    return TRACKS;
  }

  static getAllEvents(): AiHistoryEvent[] {
    const custom = loadCustomEvents();
    return [...custom, ...EVENTS];
  }

  static getEventById(id: string): AiHistoryEvent | undefined {
    const all = this.getAllEvents();
    return all.find((e) => e.id === id || e.slug === id);
  }

  static addCustomEvent(evt: AiHistoryEvent): void {
    const current = loadCustomEvents();
    const updated = [evt, ...current.filter((e) => e.id !== evt.id)];
    saveCustomEvents(updated);
  }

  static deleteCustomEvent(id: string): void {
    const current = loadCustomEvents();
    const updated = current.filter((e) => e.id !== id);
    saveCustomEvents(updated);
  }

  static getCustomEvents(): AiHistoryEvent[] {
    return loadCustomEvents();
  }

  static getAllConcepts(): Concept[] {
    return Object.values(CONCEPTS);
  }

  static getConceptById(id: string): Concept | undefined {
    return CONCEPTS[id] || Object.values(CONCEPTS).find((c) => c.slug === id);
  }

  static getSourceById(id: string): Source | undefined {
    return SOURCES[id];
  }

  static getAllRelations(): Relation[] {
    return RELATIONS;
  }

  static getStoryChapters(): StoryChapter[] {
    const customCh = loadCustomChapters();
    return [...STORY_CHAPTERS, ...customCh];
  }

  static addCustomStoryChapter(ch: StoryChapter): void {
    const current = loadCustomChapters();
    const updated = [...current.filter((c) => c.id !== ch.id), ch];
    saveCustomChapters(updated);
  }

  static deleteCustomStoryChapter(id: string): void {
    const current = loadCustomChapters();
    const updated = current.filter((c) => c.id !== id);
    saveCustomChapters(updated);
  }

  static getCustomStoryChapters(): StoryChapter[] {
    return loadCustomChapters();
  }

  static getOrganizationById(id: string) {
    return ORGANIZATIONS[id];
  }

  static getPersonById(id: string) {
    return PEOPLE[id];
  }

  static filterEvents(options: FilterOptions): AiHistoryEvent[] {
    const all = this.getAllEvents();
    return all.filter((evt) => {
      // Tier filter
      if (options.tiers && options.tiers.length > 0) {
        if (!options.tiers.includes(evt.landmarkTier)) return false;
      }

      // Status filter
      if (options.statuses && options.statuses.length > 0) {
        if (!options.statuses.includes(evt.status)) return false;
      }

      // Watchlist filter
      if (options.includeWatchlist === false) {
        if (evt.status === 'watch' || evt.landmarkTier === 'Watch') return false;
      }

      // Era filter
      if (options.eraIds && options.eraIds.length > 0) {
        if (!options.eraIds.includes(evt.eraId)) return false;
      }

      // Track filter
      if (options.trackIds && options.trackIds.length > 0) {
        const hasTrack = options.trackIds.some((t) => evt.trackIds.includes(t));
        if (!hasTrack) return false;
      }

      // Country filter
      if (options.countryCodes && options.countryCodes.length > 0) {
        const hasCountry = evt.locations.some(
          (loc) => loc.countryCode && options.countryCodes!.includes(loc.countryCode)
        );
        if (!hasCountry) return false;
      }

      // Year range filter
      const year = parseInt(evt.dateStart.substring(0, 4), 10);
      if (!isNaN(year)) {
        if (options.startYear && year < options.startYear) return false;
        if (options.endYear && year > options.endYear) return false;
      }

      // Search Query
      if (options.searchQuery && options.searchQuery.trim().length > 0) {
        const q = options.searchQuery.toLowerCase().trim();
        const inTitle =
          evt.titleZh.toLowerCase().includes(q) ||
          evt.titleEn.toLowerCase().includes(q);
        const inSummary =
          evt.summaryZh.toLowerCase().includes(q) ||
          evt.summaryEn.toLowerCase().includes(q);
        const inSignificance =
          evt.significanceZh.toLowerCase().includes(q) ||
          evt.significanceEn.toLowerCase().includes(q);

        if (!inTitle && !inSummary && !inSignificance) return false;
      }

      return true;
    });
  }

  static getStats() {
    const all = this.getAllEvents();
    const totalEvents = all.length;
    const verifiedEvents = all.filter((e) => e.status === 'verified').length;
    const watchEvents = all.filter((e) => e.status === 'watch').length;
    const sTierCount = all.filter((e) => e.landmarkTier === 'S').length;
    const totalConcepts = Object.keys(CONCEPTS).length;
    const totalSources = Object.keys(SOURCES).length;

    return {
      totalEvents,
      verifiedEvents,
      watchEvents,
      sTierCount,
      totalConcepts,
      totalSources,
    };
  }
}

