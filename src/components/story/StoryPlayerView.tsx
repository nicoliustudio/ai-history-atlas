import React, { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { DataRepository } from '../../data/repository';
import { SpatioTemporalTracePlayer } from './SpatioTemporalTracePlayer';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Gauge,
  BookOpen,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const StoryPlayerView: React.FC = () => {
  const { story, setStoryChapter, setStoryPlaybackStatus, setStorySpeed, setSelectedEventId, locale } =
    useAppStore();

  const isZh = locale === 'zh-CN';
  const allChapters = DataRepository.getStoryChapters();
  const currentChapter = allChapters[story.currentChapterIndex] || allChapters[0];

  // Fetch chapter events
  const chapterEvents = currentChapter.eventIds
    .map((id) => DataRepository.getEventById(id))
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-8 py-6 space-y-8 text-[#1A1A1A] font-sans">
      {/* 1. Spatio-Temporal Interactive Trace Player & Map Sandbox */}
      <section>
        <SpatioTemporalTracePlayer />
      </section>

      {/* Divider */}
      <div className="border-t border-[#1A1A1A] my-6" />

      {/* 2. Chapter Deep Narrative & Script Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#1A1A1A] bg-[#FAF8F5] p-5 shadow-sm">
          <div>
            <div className="flex items-center space-x-2">
              <span className="border border-[#1A1A1A] bg-[#C44536] px-2.5 py-0.5 text-[10px] font-mono font-bold text-white uppercase">
                Chapter {currentChapter.order} / {allChapters.length}
              </span>
              <span className="text-xs font-mono font-bold text-[#1A1A1A]/70">
                Period: {currentChapter.periodLabel}
              </span>
            </div>
            <h2 className="text-2xl font-serif italic font-bold text-[#1A1A1A] mt-1">
              {isZh ? currentChapter.titleZh : currentChapter.titleEn}
            </h2>
          </div>

          {/* Chapters Horizontal Stepper Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            {allChapters.map((ch, idx) => {
              const isActive = idx === story.currentChapterIndex;
              return (
                <button
                  key={ch.id}
                  onClick={() => setStoryChapter(idx)}
                  className={`px-3 py-1.5 border font-mono text-[10px] font-bold uppercase transition ${
                    isActive
                      ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED]'
                      : 'border-[#1A1A1A]/30 bg-[#E8E4DD]/50 text-[#1A1A1A] hover:border-[#1A1A1A]'
                  }`}
                >
                  CH 0{ch.order}
                </button>
              );
            })}
          </div>
        </div>

        {/* Narrative Script & Landmarks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Script Card */}
          <div className="lg:col-span-7 border border-[#1A1A1A] bg-[#FAF8F5] p-6 flex flex-col space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C44536] mb-1">
                <BookOpen className="h-3.5 w-3.5 text-[#C44536]" />
                <span>{isZh ? '章节深度史实解说词' : 'Chapter Narrative Script'}</span>
              </div>
              <p className="text-lg font-serif italic font-bold text-[#1A1A1A] border-l-2 border-[#C44536] pl-3 py-1 bg-[#E8E4DD]/30">
                {isZh ? currentChapter.summaryZh : currentChapter.summaryEn}
              </p>
            </div>

            {/* Narration Paragraphs */}
            <div className="space-y-4 font-serif">
              {(isZh ? currentChapter.narrationZh : currentChapter.narrationEn).map(
                (paragraph, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-3 border border-[#1A1A1A]/30 bg-[#E8E4DD]/30 p-4"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[#1A1A1A] bg-[#FAF8F5] text-xs font-mono font-bold text-[#1A1A1A]">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-[#1A1A1A] leading-relaxed">{paragraph}</p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Right Chapter Featured Milestones */}
          <div className="lg:col-span-5 border border-[#1A1A1A] bg-[#FAF8F5] p-6 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center space-x-2">
                <Calendar className="h-3.5 w-3.5 text-[#C44536]" />
                <span>{isZh ? '本章归因核心节点' : 'Featured Chapter Landmarks'}</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-[#1A1A1A]/60">
                {chapterEvents.length} {isZh ? '节点' : 'landmarks'}
              </span>
            </div>

            <div className="space-y-3">
              {chapterEvents.map((evt) => (
                <div
                  key={evt!.id}
                  onClick={() => {
                    setSelectedEventId(evt!.id);
                    useAppStore.getState().setActiveMode('explore');
                  }}
                  className="group flex flex-col p-3.5 border border-[#1A1A1A]/30 bg-[#E8E4DD]/40 hover:bg-[#1A1A1A] hover:text-[#F5F2ED] cursor-pointer transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#C44536] group-hover:text-[#F5F2ED]">
                      {evt!.dateStart}
                    </span>
                    <span
                      className={`border px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase ${
                        evt!.landmarkTier === 'S'
                          ? 'border-[#C44536] bg-[#C44536] text-white'
                          : 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED] group-hover:border-white'
                      }`}
                    >
                      {evt!.landmarkTier}-Tier
                    </span>
                  </div>
                  <h4 className="text-sm font-serif italic font-bold group-hover:text-[#F5F2ED] mt-1">
                    {isZh ? evt!.titleZh : evt!.titleEn}
                  </h4>
                  <p className="text-xs opacity-80 line-clamp-2 mt-1 font-sans">
                    {isZh ? evt!.summaryZh : evt!.summaryEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

