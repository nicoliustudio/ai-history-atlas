import { z } from 'zod';

export type EventStatus = 'verified' | 'disputed' | 'watch' | 'deprecated';
export type LandmarkTier = 'S' | 'A' | 'B' | 'C' | 'Watch';
export type DatePrecision = 'day' | 'month' | 'year' | 'range' | 'approximate';

export type TrackId =
  | 'theory-algorithm'
  | 'model-product'
  | 'compute-infrastructure'
  | 'open-ecosystem'
  | 'policy-governance'
  | 'society-industry';

export type GeoBasis =
  | 'physical_event_location'
  | 'primary_research_institution'
  | 'company_headquarters'
  | 'government_jurisdiction'
  | 'conference_location'
  | 'multi_location'
  | 'global_event';

export type GeoConfidence = 'high' | 'medium' | 'low';

export type SourceType =
  | 'primary-paper'
  | 'official-announcement'
  | 'law-regulation'
  | 'official-dataset'
  | 'technical-report'
  | 'conference-record'
  | 'institutional-history'
  | 'reputable-secondary'
  | 'commentary';

export type ConceptMaturity =
  | 'foundational'
  | 'established'
  | 'emerging'
  | 'contested';

export type RelationType =
  | 'depends_on'
  | 'influences'
  | 'enables'
  | 'contrasts_with'
  | 'responds_to'
  | 'policy_affects'
  | 'organization_created'
  | 'person_contributed'
  | 'measured_flow';

// Zod Schemas
export const EventLocationSchema = z.object({
  id: z.string(),
  cityZh: z.string().optional(),
  cityEn: z.string().optional(),
  regionZh: z.string().optional(),
  regionEn: z.string().optional(),
  countryCode: z.string().optional(), // ISO 2-letter
  lng: z.number().min(-180).max(180).optional(),
  lat: z.number().min(-90).max(90).optional(),
  basis: z.enum([
    'physical_event_location',
    'primary_research_institution',
    'company_headquarters',
    'government_jurisdiction',
    'conference_location',
    'multi_location',
    'global_event',
  ]),
  confidence: z.enum(['high', 'medium', 'low']),
  evidenceSourceIds: z.array(z.string()).default([]),
  noteZh: z.string().optional(),
  noteEn: z.string().optional(),
});

export type EventLocation = z.infer<typeof EventLocationSchema>;

export const EventScoringSchema = z.object({
  originality: z.number().min(0).max(5),
  impact: z.number().min(0).max(5),
  globalReach: z.number().min(0).max(5),
  societalEffect: z.number().min(0).max(5),
  evidenceReliability: z.number().min(0).max(5),
  historicalIndependence: z.number().min(0).max(5),
});

export type EventScoring = z.infer<typeof EventScoringSchema>;

export const AiHistoryEventSchema = z.object({
  id: z.string(),
  slug: z.string(),
  titleZh: z.string(),
  titleEn: z.string(),
  shortTitleZh: z.string().optional(),
  shortTitleEn: z.string().optional(),

  dateStart: z.string(), // YYYY-MM-DD or YYYY-MM or YYYY
  dateEnd: z.string().optional(),
  datePrecision: z.enum(['day', 'month', 'year', 'range', 'approximate']),

  eraId: z.string(),
  primaryTrack: z.enum([
    'theory-algorithm',
    'model-product',
    'compute-infrastructure',
    'open-ecosystem',
    'policy-governance',
    'society-industry',
  ]),
  trackIds: z.array(z.string()),

  landmarkTier: z.enum(['S', 'A', 'B', 'C', 'Watch']),
  status: z.enum(['verified', 'disputed', 'watch', 'deprecated']),

  summaryZh: z.string(),
  summaryEn: z.string(),
  significanceZh: z.string(),
  significanceEn: z.string(),

  changedWhatZh: z.array(z.string()).optional(),
  changedWhatEn: z.array(z.string()).optional(),
  limitationsZh: z.array(z.string()).optional(),
  limitationsEn: z.array(z.string()).optional(),
  controversyZh: z.array(z.string()).optional(),
  controversyEn: z.array(z.string()).optional(),

  conceptIds: z.array(z.string()).optional().default([]),
  actorIds: z.array(z.string()).optional().default([]),
  organizationIds: z.array(z.string()).optional().default([]),

  locations: z.array(EventLocationSchema).optional().default([]),

  relationIds: z.array(z.string()).optional().default([]),
  sourceIds: z.array(z.string()).optional().default([]),

  scoring: EventScoringSchema,
  editorialNotes: z.array(z.string()).optional(),

  featured: z.boolean().default(false),
  storyChapterIds: z.array(z.string()).default([]),

  firstPublishedAt: z.string(),
  lastReviewedAt: z.string(),
  reviewedBy: z.array(z.string()).default([]),
  dataVersion: z.string().default('1.0.0'),
});

export type AiHistoryEvent = z.input<typeof AiHistoryEventSchema>;

export const ConceptSchema = z.object({
  id: z.string(),
  slug: z.string(),
  nameZh: z.string(),
  nameEn: z.string(),
  aliases: z.array(z.string()).default([]),

  definitionZh: z.string(),
  definitionEn: z.string(),
  boundaryZh: z.string(),
  boundaryEn: z.string(),

  maturity: z.enum(['foundational', 'established', 'emerging', 'contested']),
  firstKnownAt: z.string().optional(),

  parentConceptIds: z.array(z.string()).default([]),
  prerequisiteConceptIds: z.array(z.string()).default([]),
  enablesConceptIds: z.array(z.string()).default([]),
  relatedEventIds: z.array(z.string()).default([]),

  confusedWithIds: z.array(z.string()).default([]),
  sourceIds: z.array(z.string()).default([]),

  lastReviewedAt: z.string(),
});

export type Concept = z.infer<typeof ConceptSchema>;

export const SourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  sourceType: z.enum([
    'primary-paper',
    'official-announcement',
    'law-regulation',
    'official-dataset',
    'technical-report',
    'conference-record',
    'institutional-history',
    'reputable-secondary',
    'commentary',
  ]),
  publisher: z.string(),
  authors: z.array(z.string()).optional(),
  publishedAt: z.string().optional(),
  accessedAt: z.string(),
  language: z.string().default('en'),
  archivedUrl: z.string().optional(),
  notes: z.string().optional(),
});

export type Source = z.infer<typeof SourceSchema>;

export const RelationSchema = z.object({
  id: z.string(),
  fromId: z.string(),
  toId: z.string(),
  relationType: z.enum([
    'depends_on',
    'influences',
    'enables',
    'contrasts_with',
    'responds_to',
    'policy_affects',
    'organization_created',
    'person_contributed',
    'measured_flow',
  ]),
  direction: z.enum(['directed', 'undirected']),
  confidence: z.enum(['high', 'medium', 'low']),
  sourceIds: z.array(z.string()).default([]),
  noteZh: z.string().optional(),
  noteEn: z.string().optional(),
  visibleOnMap: z.boolean().default(true),
  visibleOnConceptGraph: z.boolean().default(true),
});

export type Relation = z.infer<typeof RelationSchema>;

export interface Era {
  id: string;
  slug: string;
  titleZh: string;
  titleEn: string;
  startYear: number;
  endYear: number | null; // null for present
  descriptionZh: string;
  descriptionEn: string;
  keyThemeZh: string;
  keyThemeEn: string;
  badgeColor: string;
}

export interface Track {
  id: TrackId;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  color: string;
  iconName: string;
}

export interface Organization {
  id: string;
  nameZh: string;
  nameEn: string;
  countryCode: string;
  cityZh?: string;
  cityEn?: string;
  lng?: number;
  lat?: number;
  type: 'academic' | 'corporate' | 'government' | 'nonprofit' | 'consortium';
}

export interface Person {
  id: string;
  nameZh: string;
  nameEn: string;
  organizationId?: string;
  roleZh?: string;
  roleEn?: string;
}

export interface StoryChapter {
  id: string;
  order: number;
  titleZh: string;
  titleEn: string;
  periodLabel: string;
  eraIds: string[];
  eventIds: string[];
  summaryZh: string;
  summaryEn: string;
  narrationZh: string[];
  narrationEn: string[];
  cameraCoords: {
    lat: number;
    lng: number;
    zoom: number;
  };
  highlightConceptIds?: string[];
  status: 'draft' | 'published';
}
