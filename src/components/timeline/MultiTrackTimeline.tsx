import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { DataRepository } from '../../data/repository';
import { TRACKS } from '../../data/tracks';
import { ERAS } from '../../data/eras';
import { TrackId } from '../../types';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Cpu, Sparkles, Server, Globe, ShieldAlert, Building2 } from 'lucide-react';

export const MultiTrackTimeline: React.FC = () => {
  const { filter, setSelectedEventId, selectedEventId, locale, updateFilter, customDataVersion } = useAppStore();
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const isZh = locale === 'zh-CN';

  // Get filtered events based on current global store filters
  const events = useMemo(() => {
    return DataRepository.filterEvents(filter);
  }, [filter, customDataVersion]);

  const startYear = 1943;
  const endYear = 2026;
  const yearSpan = endYear - startYear;

  // Icon mapping
  const getTrackIcon = (trackId: TrackId) => {
    switch (trackId) {
      case 'theory-algorithm':
        return <Cpu className="h-3.5 w-3.5 text-[#1A1A1A]" />;
      case 'model-product':
        return <Sparkles className="h-3.5 w-3.5 text-[#1A1A1A]" />;
      case 'compute-infrastructure':
        return <Server className="h-3.5 w-3.5 text-[#1A1A1A]" />;
      case 'open-ecosystem':
        return <Globe className="h-3.5 w-3.5 text-[#1A1A1A]" />;
      case 'policy-governance':
        return <ShieldAlert className="h-3.5 w-3.5 text-[#C44536]" />;
      case 'society-industry':
        return <Building2 className="h-3.5 w-3.5 text-[#1A1A1A]" />;
      default:
        return null;
    }
  };

  const getEventLeftPercent = (dateStart: string) => {
    const year = parseInt(dateStart.substring(0, 4), 10);
    if (isNaN(year)) return 0;
    const boundedYear = Math.max(startYear, Math.min(endYear, year));
    return ((boundedYear - startYear) / yearSpan) * 100;
  };

  return (
    <div className="flex flex-col w-full border border-[#1A1A1A] bg-[#FAF8F5] p-5 shadow-sm space-y-4 text-[#1A1A1A]">
      {/* Timeline Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A1A1A] pb-4">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-[#1A1A1A]/70">
            Chronological Matrix // 03
          </span>
          <div className="flex items-center space-x-3 mt-0.5">
            <h2 className="text-xl font-serif italic font-bold text-[#1A1A1A]">
              {isZh ? '六维并行演化时间轴' : '6-Track Parallel History Timeline'}
            </h2>
            <span className="border border-[#1A1A1A] bg-[#E8E4DD] px-2 py-0.5 text-[10px] font-mono font-bold text-[#1A1A1A]">
              {events.length} {isZh ? '个历史节点' : 'nodes'}
            </span>
          </div>
        </div>

        {/* Zoom & Quick Filter Controls */}
        <div className="flex items-center space-x-2">
          {/* Era Jump Buttons */}
          <div className="hidden lg:flex items-center space-x-1 font-mono text-[10px] font-bold">
            {ERAS.map((era) => (
              <button
                key={era.id}
                onClick={() =>
                  updateFilter({
                    eraIds: filter.eraIds.includes(era.id) ? [] : [era.id],
                  })
                }
                className={`px-2 py-1 border transition ${
                  filter.eraIds.includes(era.id)
                    ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED]'
                    : 'border-[#1A1A1A]/30 bg-[#E8E4DD]/50 text-[#1A1A1A]/70 hover:border-[#1A1A1A]'
                }`}
                title={isZh ? era.titleZh : era.titleEn}
              >
                {era.startYear}
              </button>
            ))}
          </div>

          {/* Watchlist Toggle */}
          <button
            onClick={() =>
              updateFilter({ includeWatchlist: !filter.includeWatchlist })
            }
            className={`flex items-center space-x-1 border px-3 py-1 text-xs font-sans font-bold uppercase tracking-widest transition ${
              filter.includeWatchlist
                ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED]'
                : 'border-[#1A1A1A]/30 bg-[#E8E4DD]/50 text-[#1A1A1A]/70 hover:border-[#1A1A1A]'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{isZh ? 'Watchlist' : 'Watchlist'}</span>
          </button>

          {/* Zoom Buttons */}
          <div className="flex items-center border border-[#1A1A1A] bg-[#FAF8F5]">
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.3))}
              className="p-1.5 hover:bg-[#1A1A1A] hover:text-[#F5F2ED] transition border-r border-[#1A1A1A]"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(1.0, z - 0.3))}
              className="p-1.5 hover:bg-[#1A1A1A] hover:text-[#F5F2ED] transition border-r border-[#1A1A1A]"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1.0);
                updateFilter({ eraIds: [] });
              }}
              className="p-1.5 hover:bg-[#1A1A1A] hover:text-[#F5F2ED] transition"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Scrollable Timeline Canvas */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div
          className="relative flex flex-col space-y-3 min-w-[900px]"
          style={{ width: `${100 * zoomLevel}%` }}
        >
          {/* Era Header Bar Across Timeline */}
          <div className="relative h-8 w-full border border-[#1A1A1A] bg-[#E8E4DD] overflow-hidden flex">
            {ERAS.map((era) => {
              const endYr = era.endYear || 2026;
              const widthPct = ((endYr - era.startYear) / yearSpan) * 100;

              return (
                <div
                  key={era.id}
                  style={{ width: `${widthPct}%` }}
                  className="h-full border-r border-[#1A1A1A] px-2 py-1 font-mono text-[10px] text-[#1A1A1A] flex items-center justify-between truncate"
                  title={isZh ? era.descriptionZh : era.descriptionEn}
                >
                  <span className="font-bold truncate">
                    {era.startYear} {isZh ? era.titleZh : era.titleEn}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 6 Track Rows */}
          {TRACKS.map((track) => {
            const trackEvents = events.filter((e) => e.primaryTrack === track.id);

            return (
              <div
                key={track.id}
                className="relative flex h-14 w-full items-center bg-[#E8E4DD]/40 border border-[#1A1A1A]/30 px-3 hover:bg-[#E8E4DD]/80 transition group"
              >
                {/* Track Label Badge */}
                <div className="sticky left-0 z-10 flex w-44 shrink-0 items-center space-x-2 border border-[#1A1A1A] bg-[#FAF8F5] p-2 shadow-sm font-sans">
                  {getTrackIcon(track.id)}
                  <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider truncate">
                    {isZh ? track.nameZh : track.nameEn}
                  </span>
                  <span className="ml-auto border border-[#1A1A1A] bg-[#E8E4DD] px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#1A1A1A]">
                    {trackEvents.length}
                  </span>
                </div>

                {/* Track Nodes Line Area */}
                <div className="relative h-full flex-1 ml-4">
                  {/* Subtle Grid Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-[#1A1A1A]/20" />

                  {/* Nodes */}
                  {trackEvents.map((evt) => {
                    const leftPct = getEventLeftPercent(evt.dateStart);
                    const isSelected = selectedEventId === evt.id;

                    return (
                      <button
                        key={evt.id}
                        onClick={() => setSelectedEventId(evt.id)}
                        style={{ left: `${leftPct}%` }}
                        className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center transition group/node ${
                          evt.landmarkTier === 'S'
                            ? 'h-6 w-6'
                            : 'h-4 w-4'
                        }`}
                        title={`${evt.dateStart}: ${isZh ? evt.titleZh : evt.titleEn}`}
                      >
                        {/* Node Outer Marker */}
                        <div
                          className={`relative flex items-center justify-center border transition-transform ${
                            evt.landmarkTier === 'S'
                              ? 'h-5 w-5 border-[#1A1A1A] bg-[#C44536] text-white shadow'
                              : 'h-3.5 w-3.5 border-[#1A1A1A] bg-[#1A1A1A]'
                          } ${
                            isSelected
                              ? 'scale-125 ring-2 ring-[#C44536]'
                              : 'hover:scale-125'
                          }`}
                        >
                          <span className="text-[8px] font-bold font-mono">
                            {evt.landmarkTier === 'S' ? 'S' : ''}
                          </span>
                        </div>

                        {/* Tooltip Hover Label */}
                        <div className="absolute bottom-full mb-2 hidden group-hover/node:flex flex-col items-center z-30 pointer-events-none">
                          <div className="border border-[#1A1A1A] bg-[#FAF8F5] px-2.5 py-1 text-[11px] shadow-lg text-[#1A1A1A] whitespace-nowrap font-sans font-medium">
                            <span className="font-mono font-bold text-[#C44536] mr-1.5">
                              {evt.dateStart.substring(0, 4)}
                            </span>
                            <span>{isZh ? evt.titleZh : evt.titleEn}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
