import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { DataRepository } from '../../data/repository';
import { GitCompare, Globe } from 'lucide-react';

export const CompareView: React.FC = () => {
  const { locale, setSelectedEventId, setActiveMode } = useAppStore();
  const [compareType, setCompareType] = useState<'region' | 'paradigm'>('region');
  const isZh = locale === 'zh-CN';

  const events = DataRepository.getAllEvents();

  // Region comparison (US vs CN)
  const usEvents = events.filter((e) =>
    e.locations.some((loc) => loc.countryCode === 'US')
  );
  const cnEvents = events.filter((e) =>
    e.locations.some((loc) => loc.countryCode === 'CN')
  );

  // Ecosystem comparison (Open vs Closed)
  const openEvents = events.filter(
    (e) =>
      e.primaryTrack === 'open-ecosystem' ||
      e.trackIds.includes('open-ecosystem') ||
      e.titleZh.includes('开源') ||
      e.titleEn.includes('Open')
  );
  const closedEvents = events.filter(
    (e) =>
      e.primaryTrack === 'model-product' &&
      !e.trackIds.includes('open-ecosystem')
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-8 py-6 space-y-6 text-[#1A1A1A] font-sans">
      {/* Compare View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#1A1A1A] bg-[#FAF8F5] p-5">
        <div>
          <h1 className="text-2xl font-serif italic font-bold text-[#1A1A1A] flex items-center space-x-2">
            <GitCompare className="h-5 w-5 text-[#C44536]" />
            <span>{isZh ? '全球 AI 时空与路线双轨对比沙盘' : 'Global AI Dual-Track Comparative Matrix'}</span>
          </h1>
          <p className="text-xs text-[#1A1A1A]/70 mt-1">
            {isZh
              ? '客观呈现中美地域分布、开源与闭源生态差异、预训练 Scaling 与推理算力演变'
              : 'Objective comparative matrix for regional, ecosystem, and compute scaling trends'}
          </p>
        </div>

        {/* Comparison Switcher Tabs */}
        <div className="flex items-center space-x-1 border border-[#1A1A1A] bg-[#FAF8F5] p-1 text-xs">
          <button
            onClick={() => setCompareType('region')}
            className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase transition border ${
              compareType === 'region'
                ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED]'
                : 'border-transparent text-[#1A1A1A]/70 hover:border-[#1A1A1A]'
            }`}
          >
            {isZh ? '中美地域对比' : 'US vs CN'}
          </button>
          <button
            onClick={() => setCompareType('paradigm')}
            className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase transition border ${
              compareType === 'paradigm'
                ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED]'
                : 'border-transparent text-[#1A1A1A]/70 hover:border-[#1A1A1A]'
            }`}
          >
            {isZh ? '开源 vs 闭源' : 'Open vs Closed'}
          </button>
        </div>
      </div>

      {/* Side-by-side Dual Column Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="border border-[#1A1A1A] bg-[#FAF8F5] p-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center space-x-2">
              <Globe className="h-4 w-4 text-[#C44536]" />
              <span>
                {compareType === 'region'
                  ? isZh
                    ? '北美与欧洲地区 (US / EU)'
                    : 'US & Europe Landmarks'
                  : isZh
                  ? '开源权重与开放标准生态'
                  : 'Open Weights & Protocols'}
              </span>
            </h2>
            <span className="border border-[#1A1A1A] bg-[#E8E4DD] px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#1A1A1A]">
              {compareType === 'region' ? usEvents.length : openEvents.length} {isZh ? '节点' : 'items'}
            </span>
          </div>

          <div className="space-y-3">
            {(compareType === 'region' ? usEvents : openEvents).map((evt) => (
              <div
                key={evt.id}
                onClick={() => {
                  setSelectedEventId(evt.id);
                  setActiveMode('explore');
                }}
                className="group flex flex-col p-3.5 border border-[#1A1A1A]/30 bg-[#E8E4DD]/40 hover:bg-[#1A1A1A] hover:text-[#F5F2ED] cursor-pointer transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#C44536] group-hover:text-[#F5F2ED]">
                    {evt.dateStart}
                  </span>
                  <span className="border border-[#1A1A1A] px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase group-hover:border-white">
                    {evt.landmarkTier}-Tier
                  </span>
                </div>
                <h3 className="text-sm font-serif italic font-bold group-hover:text-[#F5F2ED] mt-1">
                  {isZh ? evt.titleZh : evt.titleEn}
                </h3>
                <p className="text-xs opacity-80 line-clamp-2 mt-1 font-sans">
                  {isZh ? evt.summaryZh : evt.summaryEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="border border-[#1A1A1A] bg-[#FAF8F5] p-6 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center space-x-2">
              <Globe className="h-4 w-4 text-[#C44536]" />
              <span>
                {compareType === 'region'
                  ? isZh
                    ? '中国地区 (China / CN)'
                    : 'China (CN) Landmarks'
                  : isZh
                  ? '商业模型与闭源前沿产品'
                  : 'Closed-Source Commercial Models'}
              </span>
            </h2>
            <span className="border border-[#1A1A1A] bg-[#E8E4DD] px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#1A1A1A]">
              {compareType === 'region' ? cnEvents.length : closedEvents.length} {isZh ? '节点' : 'items'}
            </span>
          </div>

          <div className="space-y-3">
            {(compareType === 'region' ? cnEvents : closedEvents).map((evt) => (
              <div
                key={evt.id}
                onClick={() => {
                  setSelectedEventId(evt.id);
                  setActiveMode('explore');
                }}
                className="group flex flex-col p-3.5 border border-[#1A1A1A]/30 bg-[#E8E4DD]/40 hover:bg-[#1A1A1A] hover:text-[#F5F2ED] cursor-pointer transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#C44536] group-hover:text-[#F5F2ED]">
                    {evt.dateStart}
                  </span>
                  <span className="border border-[#1A1A1A] px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase group-hover:border-white">
                    {evt.landmarkTier}-Tier
                  </span>
                </div>
                <h3 className="text-sm font-serif italic font-bold group-hover:text-[#F5F2ED] mt-1">
                  {isZh ? evt.titleZh : evt.titleEn}
                </h3>
                <p className="text-xs opacity-80 line-clamp-2 mt-1 font-sans">
                  {isZh ? evt.summaryZh : evt.summaryEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
