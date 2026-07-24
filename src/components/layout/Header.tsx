import React from 'react';
import { useAppStore } from '../../store/appStore';
import {
  Compass,
  PlayCircle,
  Network,
  GitCompare,
  Search,
  Globe,
  Sun,
  Moon,
  PlusCircle,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    locale,
    setLocale,
    theme,
    setTheme,
    activeMode,
    setActiveMode,
    setSearchModalOpen,
    setCustomNodeModalOpen,
  } = useAppStore();

  const isZh = locale === 'zh-CN';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1A1A1A] bg-[#F5F2ED]/95 backdrop-blur-md text-[#1A1A1A]">
      <div className="mx-auto flex h-20 max-w-7xl items-end justify-between px-4 pb-4 sm:px-8">
        {/* Logo and Title - Editorial Style */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-[#1A1A1A]/70 mb-0.5">
            Technical Document // 01 · 1943—Present
          </span>
          <div className="flex items-baseline space-x-3">
            <h1 className="text-2xl sm:text-3xl font-black italic font-serif tracking-tighter text-[#1A1A1A] uppercase leading-none">
              {isZh ? '全球AI演化图谱' : 'Atlas of Artificial Intelligence'}
            </h1>
            <span className="hidden sm:inline-block font-sans text-[10px] uppercase tracking-widest font-bold border border-[#1A1A1A] px-2 py-0.5 bg-[#E8E4DD]">
              Canonical & Live
            </span>
          </div>
        </div>

        {/* Navigation Tabs - Editorial Style */}
        <nav className="flex items-center space-x-1 sm:space-x-6 font-sans text-[11px] uppercase tracking-widest font-semibold pb-1">
          <button
            id="tab-explore"
            onClick={() => setActiveMode('explore')}
            className={`flex items-center space-x-1.5 pb-1 border-b-2 transition-all ${
              activeMode === 'explore'
                ? 'border-[#1A1A1A] text-[#1A1A1A] font-bold'
                : 'border-transparent text-[#1A1A1A]/50 hover:text-[#1A1A1A] hover:border-[#1A1A1A]/30'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>{isZh ? '沙盘探索' : 'Explore'}</span>
          </button>

          <button
            id="tab-story"
            onClick={() => setActiveMode('story')}
            className={`flex items-center space-x-1.5 pb-1 border-b-2 transition-all ${
              activeMode === 'story'
                ? 'border-[#1A1A1A] text-[#1A1A1A] font-bold'
                : 'border-transparent text-[#1A1A1A]/50 hover:text-[#1A1A1A] hover:border-[#1A1A1A]/30'
            }`}
          >
            <PlayCircle className="h-3.5 w-3.5" />
            <span>{isZh ? '故事导览' : 'Stories'}</span>
          </button>

          <button
            id="tab-concepts"
            onClick={() => setActiveMode('concepts')}
            className={`flex items-center space-x-1.5 pb-1 border-b-2 transition-all ${
              activeMode === 'concepts'
                ? 'border-[#1A1A1A] text-[#1A1A1A] font-bold'
                : 'border-transparent text-[#1A1A1A]/50 hover:text-[#1A1A1A] hover:border-[#1A1A1A]/30'
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            <span>{isZh ? '概念依赖' : 'Concepts'}</span>
          </button>

          <button
            id="tab-compare"
            onClick={() => setActiveMode('compare')}
            className={`flex items-center space-x-1.5 pb-1 border-b-2 transition-all ${
              activeMode === 'compare'
                ? 'border-[#1A1A1A] text-[#1A1A1A] font-bold'
                : 'border-transparent text-[#1A1A1A]/50 hover:text-[#1A1A1A] hover:border-[#1A1A1A]/30'
            }`}
          >
            <GitCompare className="h-3.5 w-3.5" />
            <span>{isZh ? '时空对比' : 'Compare'}</span>
          </button>
        </nav>

        {/* Actions (Custom Add, Search, Locale, Theme) */}
        <div className="flex items-center space-x-2 pb-0.5">
          {/* Custom Node Studio Button */}
          <button
            id="btn-custom-node-builder"
            onClick={() => setCustomNodeModalOpen(true)}
            className="flex items-center space-x-1.5 border border-[#1A1A1A] bg-[#C44536] text-white px-3 py-1.5 text-xs hover:bg-[#1A1A1A] transition font-sans font-bold shadow-xs"
            title={isZh ? '自定义扩展历史里程碑节点与故事卡片' : 'Custom add milestone events & story cards'}
          >
            <PlusCircle className="h-3.5 w-3.5 text-white" />
            <span className="hidden sm:inline-block">{isZh ? '扩展史料节点' : 'Custom Add'}</span>
          </button>

          {/* Quick Search Button */}
          <button
            id="btn-search-trigger"
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center space-x-1.5 border border-[#1A1A1A] bg-[#FAF8F5] px-3 py-1.5 text-xs text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F2ED] transition font-sans"
            title={isZh ? '搜索事件、概念与机构' : 'Search events, concepts, organizations'}
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline-block font-medium">{isZh ? '检索史料...' : 'Search...'}</span>
            <kbd className="hidden font-mono text-[9px] uppercase border border-current px-1 sm:inline-block">
              ⌘K
            </kbd>
          </button>

          {/* Language Toggle */}
          <button
            id="btn-locale-toggle"
            onClick={() => setLocale(locale === 'zh-CN' ? 'en' : 'zh-CN')}
            className="flex items-center space-x-1 border border-[#1A1A1A] bg-[#FAF8F5] px-2.5 py-1.5 text-xs font-semibold text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F2ED] transition"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{locale === 'zh-CN' ? 'EN' : '中文'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            id="btn-theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="border border-[#1A1A1A] bg-[#FAF8F5] p-2 text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F2ED] transition"
            title={isZh ? '切换深浅色主题' : 'Toggle dark/light theme'}
          >
            {theme === 'dark' ? (
              <Sun className="h-3.5 w-3.5 text-[#C44536]" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
