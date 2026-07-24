import React from 'react';
import { useAppStore } from '../../store/appStore';
import { TRACKS } from '../../data/tracks';
import { LandmarkTier, TrackId } from '../../types';
import { Filter, RotateCcw } from 'lucide-react';

export const FilterPanel: React.FC = () => {
  const { filter, updateFilter, resetFilter, locale } = useAppStore();
  const isZh = locale === 'zh-CN';

  const toggleTrack = (trackId: TrackId) => {
    const current = filter.trackIds;
    if (current.includes(trackId)) {
      updateFilter({ trackIds: current.filter((t) => t !== trackId) });
    } else {
      updateFilter({ trackIds: [...current, trackId] });
    }
  };

  const toggleTier = (tier: LandmarkTier) => {
    const current = filter.tiers;
    if (current.includes(tier)) {
      updateFilter({ tiers: current.filter((t) => t !== tier) });
    } else {
      updateFilter({ tiers: [...current, tier] });
    }
  };

  return (
    <div className="flex flex-col w-full border border-[#1A1A1A] bg-[#FAF8F5] p-5 space-y-4 shadow-sm text-[#1A1A1A]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
        <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] font-sans text-[#1A1A1A]">
          <Filter className="h-3.5 w-3.5 text-[#1A1A1A]" />
          <span>{isZh ? '史料分类与过滤器' : 'Evidence Matrix Filters'}</span>
        </div>

        <button
          onClick={resetFilter}
          className="flex items-center space-x-1 text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/60 hover:text-[#C44536] transition"
        >
          <RotateCcw className="h-3 w-3" />
          <span>{isZh ? '重置' : 'Reset'}</span>
        </button>
      </div>

      {/* Track Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/60 mr-1">
          {isZh ? '轨道:' : 'Track:'}
        </span>
        {TRACKS.map((t) => {
          const isSelected = filter.trackIds.length === 0 || filter.trackIds.includes(t.id);
          return (
            <button
              key={t.id}
              onClick={() => toggleTrack(t.id)}
              className={`px-2.5 py-1 text-xs font-sans font-medium border transition ${
                isSelected
                  ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED]'
                  : 'border-[#1A1A1A]/30 bg-[#E8E4DD]/50 text-[#1A1A1A]/60 hover:border-[#1A1A1A]'
              }`}
            >
              {isZh ? t.nameZh : t.nameEn}
            </button>
          );
        })}
      </div>

      {/* Landmark Tiers Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1A1A1A]/20">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/60 mr-1">
          {isZh ? '等级:' : 'Tier:'}
        </span>
        {(['S', 'A', 'B', 'Watch'] as LandmarkTier[]).map((tier) => {
          const isSelected = filter.tiers.includes(tier);
          return (
            <button
              key={tier}
              onClick={() => toggleTier(tier)}
              className={`px-3 py-1 text-xs font-mono font-bold border transition ${
                isSelected
                  ? tier === 'S'
                    ? 'border-[#C44536] bg-[#C44536] text-white'
                    : 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED]'
                  : 'border-[#1A1A1A]/30 bg-[#E8E4DD]/50 text-[#1A1A1A]/60 hover:border-[#1A1A1A]'
              }`}
            >
              {tier}-Tier
            </button>
          );
        })}
      </div>
    </div>
  );
};
