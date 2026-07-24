import React from 'react';
import { StoryPlayerView } from '../components/story/StoryPlayerView';
import { EventDetailDrawer } from '../components/event/EventDetailDrawer';

export const StoryPage: React.FC = () => {
  return (
    <div>
      <StoryPlayerView />
      <EventDetailDrawer />
    </div>
  );
};
