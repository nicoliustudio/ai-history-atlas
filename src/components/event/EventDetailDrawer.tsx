import React from 'react';
import { useAppStore } from '../../store/appStore';
import { DataRepository } from '../../data/repository';
import {
  X,
  Calendar,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

export const EventDetailDrawer: React.FC = () => {
  const { selectedEventId, setSelectedEventId, isDetailDrawerOpen, setDetailDrawerOpen, locale, setSelectedConceptId, setActiveMode } =
    useAppStore();

  const isZh = locale === 'zh-CN';

  if (!isDetailDrawerOpen || !selectedEventId) return null;

  const event = DataRepository.getEventById(selectedEventId);

  if (!event) return null;

  const sources = event.sourceIds
    .map((id) => DataRepository.getSourceById(id))
    .filter(Boolean);

  const concepts = event.conceptIds
    .map((id) => DataRepository.getConceptById(id))
    .filter(Boolean);

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-[#1A1A1A] bg-[#FAF8F5] shadow-2xl animate-in slide-in-from-right duration-200 text-[#1A1A1A] font-sans">
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-[#1A1A1A] p-5 bg-[#F5F2ED]">
        <div className="flex items-center space-x-2">
          <span
            className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border border-[#1A1A1A] ${
              event.landmarkTier === 'S'
                ? 'bg-[#C44536] text-white'
                : 'bg-[#1A1A1A] text-[#F5F2ED]'
            }`}
          >
            {event.landmarkTier}-Tier Paradigm
          </span>

          <span
            className="inline-flex items-center space-x-1 border border-[#1A1A1A] bg-[#E8E4DD] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]"
          >
            {event.status === 'verified' ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 mr-1 text-[#C44536]" />
                <span>Verified Evidence</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3.5 w-3.5 mr-1 text-[#C44536]" />
                <span>{event.status}</span>
              </>
            )}
          </span>
        </div>

        <button
          onClick={() => {
            setDetailDrawerOpen(false);
            setSelectedEventId(null);
          }}
          className="border border-[#1A1A1A] p-1.5 text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F2ED] transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Drawer Body Scroll */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Title & Date */}
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#C44536] mb-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {event.dateStart} ({event.datePrecision})
            </span>
          </div>
          <h2 className="text-2xl font-serif italic font-black tracking-tight text-[#1A1A1A] sm:text-3xl">
            {isZh ? event.titleZh : event.titleEn}
          </h2>
          <p className="text-xs text-[#1A1A1A]/60 mt-1 italic font-serif">
            {event.titleEn}
          </p>
        </div>

        {/* Location & Basis */}
        {event.locations.length > 0 && (
          <div className="border border-[#1A1A1A] bg-[#E8E4DD]/40 p-4 space-y-2">
            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
              <MapPin className="h-3.5 w-3.5 text-[#C44536]" />
              <span>{isZh ? '地理位置与归因依据' : 'Geographic Basis & Evidence'}</span>
            </div>
            {event.locations.map((loc) => (
              <div key={loc.id} className="text-xs text-[#1A1A1A]/80 pl-5 space-y-0.5">
                <div className="font-bold text-[#1A1A1A]">
                  {isZh ? loc.cityZh || loc.regionZh || '全球分布式' : loc.cityEn || loc.regionEn || 'Global Event'}{' '}
                  {loc.countryCode && `[${loc.countryCode}]`}
                </div>
                <div className="text-[11px] text-[#1A1A1A]/70 font-mono">
                  Basis: <code className="font-bold">{loc.basis}</code> · Confidence: {loc.confidence}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* What Happened (Summary) */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center space-x-1.5">
            <BookOpen className="h-3.5 w-3.5 text-[#1A1A1A]" />
            <span>{isZh ? '事件概要 (What Happened)' : 'Summary'}</span>
          </h3>
          <p className="text-sm text-[#1A1A1A] leading-relaxed border border-[#1A1A1A]/30 bg-[#FAF8F5] p-4 font-serif">
            {isZh ? event.summaryZh : event.summaryEn}
          </p>
        </div>

        {/* Why It Matters (Significance) */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C44536] flex items-center space-x-1.5">
            <Award className="h-3.5 w-3.5 text-[#C44536]" />
            <span>{isZh ? '历史意义与范式改变 (Why It Matters)' : 'Historical Significance'}</span>
          </h3>
          <p className="text-sm text-[#1A1A1A] leading-relaxed border border-[#1A1A1A]/30 bg-[#FAF8F5] p-4">
            {isZh ? event.significanceZh : event.significanceEn}
          </p>
        </div>

        {/* Key Changes */}
        {event.changedWhatZh && event.changedWhatZh.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center space-x-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#1A1A1A]" />
              <span>{isZh ? '实质性改变 (Key Changes)' : 'Key Changes'}</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-[#1A1A1A]/90 pl-2">
              {(isZh ? event.changedWhatZh : event.changedWhatEn)?.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-[#C44536] font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Controversies or Limitations */}
        {event.limitationsZh && event.limitationsZh.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C44536] flex items-center space-x-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-[#C44536]" />
              <span>{isZh ? '局限性与争议 (Limitations & Controversy)' : 'Limitations'}</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-[#1A1A1A]/80 pl-2">
              {(isZh ? event.limitationsZh : event.limitationsEn)?.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-[#C44536] font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Linked Concepts */}
        {concepts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
              {isZh ? '关联核心概念 (Linked Concepts)' : 'Linked Concepts'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {concepts.map((c) => (
                <button
                  key={c!.id}
                  onClick={() => {
                    setSelectedConceptId(c!.id);
                    setActiveMode('concepts');
                  }}
                  className="group flex items-center space-x-1.5 border border-[#1A1A1A] bg-[#FAF8F5] px-3 py-1.5 text-xs font-semibold text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F2ED] transition"
                >
                  <span>{isZh ? c!.nameZh : c!.nameEn}</span>
                  <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Primary Evidence Sources */}
        <div className="space-y-3 pt-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center justify-between">
            <span>{isZh ? '一手与权威文献来源' : 'Primary Evidence Sources'}</span>
            <span className="text-[10px] font-mono font-normal text-[#1A1A1A]/60">
              {sources.length} {isZh ? '篇可溯源文献' : 'sources'}
            </span>
          </h3>

          <div className="space-y-2">
            {sources.map((src) => (
              <a
                key={src!.id}
                href={src!.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between border border-[#1A1A1A] bg-[#FAF8F5] p-3 hover:bg-[#1A1A1A] hover:text-[#F5F2ED] transition"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold line-clamp-1">
                    {src!.title}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 ml-2" />
                </div>
                <div className="flex items-center justify-between text-[11px] opacity-70 mt-2 font-mono">
                  <span>{src!.publisher}</span>
                  <span>
                    {src!.publishedAt || 'Published'}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Editorial Audit Meta */}
        <div className="border border-[#1A1A1A]/30 bg-[#E8E4DD] p-3 text-[10px] text-[#1A1A1A]/70 space-y-1 font-mono">
          <div className="flex justify-between">
            <span>Published: {event.firstPublishedAt}</span>
            <span>Reviewed: {event.lastReviewedAt}</span>
          </div>
          <div className="flex justify-between">
            <span>Version: {event.dataVersion}</span>
            <span>Audited By: {event.reviewedBy.join(', ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
