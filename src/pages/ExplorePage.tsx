import React from 'react';
import { GlobalAtlasMap } from '../components/map/GlobalAtlasMap';
import { MultiTrackTimeline } from '../components/timeline/MultiTrackTimeline';
import { FilterPanel } from '../components/filters/FilterPanel';
import { EventDetailDrawer } from '../components/event/EventDetailDrawer';

export const ExplorePage: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      {/* Top Section: Sandbox Map & Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <GlobalAtlasMap />
        </div>
        <div className="lg:col-span-4">
          <FilterPanel />
        </div>
      </div>

      {/* Bottom Section: 6-Track Interactive Timeline */}
      <div>
        <MultiTrackTimeline />
      </div>

      {/* Event Details Inspector Drawer */}
      <EventDetailDrawer />
    </div>
  );
};
