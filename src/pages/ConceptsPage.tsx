import React from 'react';
import { ConceptGraphView } from '../components/concept/ConceptGraphView';
import { EventDetailDrawer } from '../components/event/EventDetailDrawer';

export const ConceptsPage: React.FC = () => {
  return (
    <div>
      <ConceptGraphView />
      <EventDetailDrawer />
    </div>
  );
};
