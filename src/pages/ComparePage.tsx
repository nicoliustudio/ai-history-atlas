import React from 'react';
import { CompareView } from '../components/compare/CompareView';
import { EventDetailDrawer } from '../components/event/EventDetailDrawer';

export const ComparePage: React.FC = () => {
  return (
    <div>
      <CompareView />
      <EventDetailDrawer />
    </div>
  );
};
