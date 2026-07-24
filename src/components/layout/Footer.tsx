import React from 'react';
import { useAppStore } from '../../store/appStore';
import { ShieldCheck, BookOpen, Layers, ExternalLink } from 'lucide-react';
import { DataRepository } from '../../data/repository';

export const Footer: React.FC = () => {
  const { locale } = useAppStore();
  const isZh = locale === 'zh-CN';
  const stats = DataRepository.getStats();

  return (
    <footer className="w-full border-t border-[#1A1A1A] bg-[#F5F2ED] text-[#1A1A1A] text-xs py-6 px-4 sm:px-8 z-20 font-sans">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Editorial Policy Statement & Status */}
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#C44536] animate-pulse shrink-0" />
          <div>
            <p className="font-bold uppercase text-[10px] tracking-widest text-[#1A1A1A]">
              {isZh
                ? '严格编辑标准：一手文献与地理归因校验'
                : 'Primary Source Policy & Geographic Attribution Standards'}
            </p>
            <p className="text-[11px] text-[#1A1A1A]/70 font-mono mt-0.5">
              {isZh
                ? `现收录 ${stats.totalEvents} 个核心里程碑 (${stats.verifiedEvents} 已完全核验) · ${stats.totalConcepts} 个概念依赖节点 · ${stats.totalSources} 篇一手文献`
                : `Indexed ${stats.totalEvents} Milestones (${stats.verifiedEvents} Fully Verified) · ${stats.totalConcepts} Concepts · ${stats.totalSources} Sources`}
            </p>
          </div>
        </div>

        {/* Badges & Links */}
        <div className="flex flex-wrap items-center gap-3 font-sans text-[10px] uppercase tracking-widest font-bold">
          <span className="inline-flex items-center border border-[#1A1A1A] bg-[#E8E4DD] px-2.5 py-1 text-[#1A1A1A]">
            Ref: AI-ATLAS/1.0
          </span>

          <span className="inline-flex items-center border border-[#1A1A1A] bg-[#E8E4DD] px-2.5 py-1 text-[#1A1A1A]">
            CC BY 4.0 / MIT
          </span>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 border border-[#1A1A1A] bg-[#FAF8F5] px-2.5 py-1 text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F2ED] transition"
          >
            <span>{isZh ? 'GitHub 史料库' : 'GitHub Repository'}</span>
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      </div>
    </footer>
  );
};
