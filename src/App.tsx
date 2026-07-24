import React, { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ExplorePage } from './pages/ExplorePage';
import { StoryPage } from './pages/StoryPage';
import { ConceptsPage } from './pages/ConceptsPage';
import { ComparePage } from './pages/ComparePage';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { CustomNodeBuilderModal } from './components/modals/CustomNodeBuilderModal';

export default function App() {
  const { activeMode, theme } = useAppStore();

  // Sync dark class on document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Global Navigation Bar */}
      <Header />

      {/* Dynamic Mode Content */}
      <main className="flex-1">
        {activeMode === 'explore' && <ExplorePage />}
        {activeMode === 'story' && <StoryPage />}
        {activeMode === 'concepts' && <ConceptsPage />}
        {activeMode === 'compare' && <ComparePage />}
      </main>

      {/* Quick Search Modal */}
      <GlobalSearchModal />

      {/* Custom Node & Story Builder Modal */}
      <CustomNodeBuilderModal />

      {/* Footer */}
      <Footer />
    </div>
  );
}
