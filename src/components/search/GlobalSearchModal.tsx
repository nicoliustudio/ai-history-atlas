import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { DataRepository } from '../../data/repository';
import { Search, X, Calendar, Network, ChevronRight, FileText } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchModalOpen, setSearchModalOpen, setSelectedEventId, setSelectedConceptId, locale } =
    useAppStore();
  const [query, setQuery] = useState('');

  const isZh = locale === 'zh-CN';

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchModalOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const events = DataRepository.filterEvents({ searchQuery: query });
  const concepts = DataRepository.getAllConcepts().filter(
    (c) =>
      c.nameZh.toLowerCase().includes(query.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(query.toLowerCase()) ||
      c.aliases.some((a) => a.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-[#1A1A1A]/70 backdrop-blur-sm p-4 animate-in fade-in duration-150 font-sans">
      <div className="w-full max-w-2xl overflow-hidden border border-[#1A1A1A] bg-[#FAF8F5] shadow-2xl text-[#1A1A1A]">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-[#1A1A1A] px-4 py-3 bg-[#F5F2ED]">
          <Search className="h-5 w-5 text-[#1A1A1A] mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isZh ? '检索事件、算法概念、论文来源、人物与机构...' : 'Search events, concepts, primary sources...'}
            className="w-full bg-transparent text-sm font-sans font-medium text-[#1A1A1A] placeholder-[#1A1A1A]/50 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setSearchModalOpen(false)}
            className="ml-2 border border-[#1A1A1A] px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F2ED]"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6 divide-y divide-[#1A1A1A]/20">
          {/* Events Category */}
          {events.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-3">
                <Calendar className="h-3.5 w-3.5 text-[#C44536]" />
                <span>{isZh ? `历史节点 (${events.length})` : `Historical Events (${events.length})`}</span>
              </div>
              <div className="space-y-2">
                {events.slice(0, 8).map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => {
                      setSelectedEventId(evt.id);
                      setSearchModalOpen(false);
                    }}
                    className="group flex items-center justify-between p-3 border border-[#1A1A1A]/30 bg-[#E8E4DD]/30 hover:bg-[#1A1A1A] hover:text-[#F5F2ED] transition cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-[#C44536] group-hover:text-[#F5F2ED]">
                          {evt.dateStart.substring(0, 4)}
                        </span>
                        <span className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#F5F2ED]">
                          {isZh ? evt.titleZh : evt.titleEn}
                        </span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold border ${
                          evt.landmarkTier === 'S'
                            ? 'border-[#C44536] bg-[#C44536] text-white'
                            : 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED] group-hover:border-white'
                        }`}>
                          {evt.landmarkTier}-Tier
                        </span>
                      </div>
                      <p className="text-xs opacity-80 line-clamp-1 mt-1 font-serif">
                        {isZh ? evt.summaryZh : evt.summaryEn}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concepts Category */}
          {concepts.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-3">
                <Network className="h-3.5 w-3.5 text-[#1A1A1A]" />
                <span>{isZh ? `AI核心概念 (${concepts.length})` : `Core Concepts (${concepts.length})`}</span>
              </div>
              <div className="space-y-2">
                {concepts.slice(0, 6).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedConceptId(c.id);
                      useAppStore.getState().setActiveMode('concepts');
                      setSearchModalOpen(false);
                    }}
                    className="group flex items-center justify-between p-3 border border-[#1A1A1A]/30 bg-[#E8E4DD]/30 hover:bg-[#1A1A1A] hover:text-[#F5F2ED] transition cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#F5F2ED]">
                          {isZh ? c.nameZh : c.nameEn}
                        </span>
                        <span className="text-[10px] opacity-60">
                          ({c.nameEn})
                        </span>
                        <span className="border border-[#1A1A1A] px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase group-hover:border-white">
                          {c.maturity}
                        </span>
                      </div>
                      <p className="text-xs opacity-80 line-clamp-1 mt-1 font-serif">
                        {isZh ? c.definitionZh : c.definitionEn}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {events.length === 0 && concepts.length === 0 && (
            <div className="py-12 text-center text-[#1A1A1A]/60 font-sans">
              <FileText className="mx-auto h-8 w-8 text-[#1A1A1A]/40 mb-2" />
              <p>{isZh ? '未找到相关事件或概念，请输入不同关键字' : 'No matching events or concepts found'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
