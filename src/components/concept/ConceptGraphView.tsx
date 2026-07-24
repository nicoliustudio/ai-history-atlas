import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3Force from 'd3-force';
import { select } from 'd3-selection';
import { useAppStore } from '../../store/appStore';
import { DataRepository } from '../../data/repository';
import { Concept } from '../../types';
import { Network, ArrowRight, HelpCircle, BookOpen } from 'lucide-react';

interface ConceptNode extends d3Force.SimulationNodeDatum {
  id: string;
  concept: Concept;
}

interface ConceptLink extends d3Force.SimulationLinkDatum<ConceptNode> {
  source: string | ConceptNode;
  target: string | ConceptNode;
  type: string;
}

export const ConceptGraphView: React.FC = () => {
  const { selectedConceptId, setSelectedConceptId, setSelectedEventId, locale } = useAppStore();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [activeConceptId, setActiveConceptId] = useState<string>('transformer');
  const isZh = locale === 'zh-CN';

  const concepts = useMemo(() => DataRepository.getAllConcepts(), []);

  // Sync selected concept from global store
  useEffect(() => {
    if (selectedConceptId) setActiveConceptId(selectedConceptId);
  }, [selectedConceptId]);

  const activeConcept = DataRepository.getConceptById(activeConceptId) || concepts[0];

  // Render D3 Force Layout Network
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const width = 650;
    const height = 450;

    // Build Nodes & Links
    const nodes: ConceptNode[] = concepts.map((c) => ({
      id: c.id,
      concept: c,
    }));

    const links: ConceptLink[] = [];
    concepts.forEach((c) => {
      c.prerequisiteConceptIds.forEach((preId) => {
        if (concepts.some((nc) => nc.id === preId)) {
          links.push({
            source: preId,
            target: c.id,
            type: 'prerequisite',
          });
        }
      });
    });

    // D3 Simulation
    const simulation = d3Force
      .forceSimulation<ConceptNode>(nodes)
      .force(
        'link',
        d3Force.forceLink<ConceptNode, ConceptLink>(links).id((d) => d.id).distance(80)
      )
      .force('charge', d3Force.forceManyBody().strength(-180))
      .force('center', d3Force.forceCenter(width / 2, height / 2))
      .force('collision', d3Force.forceCollide().radius(30));

    // D3 Selection rendering
    const d3Svg = select(svg);
    d3Svg.selectAll('*').remove();

    // Link lines
    const linkGroup = d3Svg
      .append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#1A1A1A')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1)
      .attr('marker-end', 'url(#arrow)');

    // Arrowhead marker
    d3Svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#1A1A1A');

    // Node circles & labels
    const nodeGroup = d3Svg
      .append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setActiveConceptId(d.id);
        setSelectedConceptId(d.id);
      });

    nodeGroup
      .append('circle')
      .attr('r', (d) => (d.id === activeConceptId ? 16 : 12))
      .attr('fill', (d) => {
        if (d.id === activeConceptId) return '#C44536';
        switch (d.concept.maturity) {
          case 'foundational':
            return '#1A1A1A';
          case 'established':
            return '#4A5568';
          case 'emerging':
            return '#718096';
          default:
            return '#C44536';
        }
      })
      .attr('stroke', '#1A1A1A')
      .attr('stroke-width', (d) => (d.id === activeConceptId ? 2.5 : 1));

    nodeGroup
      .append('text')
      .text((d) => (isZh ? d.concept.nameZh : d.concept.nameEn))
      .attr('x', 0)
      .attr('y', 24)
      .attr('text-anchor', 'middle')
      .attr('fill', '#1A1A1A')
      .attr('font-size', '10px')
      .attr('font-weight', '700');

    simulation.on('tick', () => {
      linkGroup
        .attr('x1', (d) => (d.source as ConceptNode).x || 0)
        .attr('y1', (d) => (d.source as ConceptNode).y || 0)
        .attr('x2', (d) => (d.target as ConceptNode).x || 0)
        .attr('y2', (d) => (d.target as ConceptNode).y || 0);

      nodeGroup.attr(
        'transform',
        (d) => `translate(${d.x || 0}, ${d.y || 0})`
      );
    });

    return () => {
      simulation.stop();
    };
  }, [concepts, activeConceptId, isZh, setSelectedConceptId]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-8 py-6 space-y-6 text-[#1A1A1A] font-sans">
      {/* Concept Network View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#1A1A1A] bg-[#FAF8F5] p-5">
        <div>
          <h1 className="text-2xl font-serif italic font-bold text-[#1A1A1A] flex items-center space-x-2">
            <Network className="h-5 w-5 text-[#C44536]" />
            <span>{isZh ? '人工智能概念演化与依赖图谱' : 'AI Concept Dependency Graph'}</span>
          </h1>
          <p className="text-xs text-[#1A1A1A]/70 mt-1">
            {isZh
              ? '清晰界定AI核心概念的技术前置依赖（Prerequisites）、赋能向下应用（Enables）与易混淆边界'
              : 'Mapping technical prerequisite dependencies, enables relationships, and conceptual boundaries'}
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="border border-[#1A1A1A] bg-[#E8E4DD] px-2.5 py-1 text-[10px] font-mono font-bold text-[#1A1A1A] uppercase">
            {concepts.length} {isZh ? '个结构化概念' : 'Concepts'}
          </span>
        </div>
      </div>

      {/* Main Split Grid: Left SVG Graph, Right Concept Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Graph Canvas Container */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center border border-[#1A1A1A] bg-[#FAF8F5] p-4 relative min-h-[480px]">
          <svg ref={svgRef} viewBox="0 0 650 450" className="w-full h-full max-h-[500px]" />

          {/* Graph Maturity Legend */}
          <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-3 border border-[#1A1A1A] bg-[#F5F2ED] p-2.5 text-[10px] font-mono font-bold">
            <div className="flex items-center space-x-1">
              <span className="h-2.5 w-2.5 border border-[#1A1A1A] bg-[#1A1A1A]" />
              <span>Foundational</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="h-2.5 w-2.5 border border-[#1A1A1A] bg-[#4A5568]" />
              <span>Established</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="h-2.5 w-2.5 border border-[#1A1A1A] bg-[#718096]" />
              <span>Emerging</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="h-2.5 w-2.5 border border-[#1A1A1A] bg-[#C44536]" />
              <span>Active</span>
            </div>
          </div>
        </div>

        {/* Right Inspector Card */}
        {activeConcept && (
          <div className="lg:col-span-5 border border-[#1A1A1A] bg-[#FAF8F5] p-6 flex flex-col space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="border border-[#1A1A1A] bg-[#E8E4DD] px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase text-[#1A1A1A]">
                  {activeConcept.maturity} maturity
                </span>
                <span className="text-[10px] font-mono font-bold text-[#1A1A1A]/60">
                  Known since: {activeConcept.firstKnownAt || 'Early AI'}
                </span>
              </div>

              <h2 className="text-2xl font-serif italic font-bold text-[#1A1A1A]">
                {isZh ? activeConcept.nameZh : activeConcept.nameEn}
              </h2>
              <p className="text-xs text-[#1A1A1A]/70 font-mono mt-0.5">
                {activeConcept.nameEn}{' '}
                {activeConcept.aliases.length > 0 && `(${activeConcept.aliases.join(', ')})`}
              </p>
            </div>

            {/* Definition */}
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center space-x-1">
                <BookOpen className="h-3.5 w-3.5 text-[#1A1A1A]" />
                <span>{isZh ? '权威定义' : 'Definition'}</span>
              </h3>
              <p className="text-xs text-[#1A1A1A] leading-relaxed border border-[#1A1A1A]/30 bg-[#E8E4DD]/40 p-3 font-serif">
                {isZh ? activeConcept.definitionZh : activeConcept.definitionEn}
              </p>
            </div>

            {/* Boundary Explanation */}
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C44536] flex items-center space-x-1">
                <HelpCircle className="h-3.5 w-3.5 text-[#C44536]" />
                <span>{isZh ? '技术边界与易混淆辩析' : 'Boundary & Scope'}</span>
              </h3>
              <p className="text-xs text-[#1A1A1A]/90 leading-relaxed border border-[#1A1A1A]/30 bg-[#E8E4DD]/40 p-3">
                {isZh ? activeConcept.boundaryZh : activeConcept.boundaryEn}
              </p>
            </div>

            {/* Prerequisites */}
            {activeConcept.prerequisiteConceptIds.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                  {isZh ? '前置理论/算法依赖 (Prerequisites)' : 'Prerequisite Concepts'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeConcept.prerequisiteConceptIds.map((id) => {
                    const pre = DataRepository.getConceptById(id);
                    if (!pre) return null;
                    return (
                      <button
                        key={pre.id}
                        onClick={() => {
                          setActiveConceptId(pre.id);
                          setSelectedConceptId(pre.id);
                        }}
                        className="flex items-center space-x-1 border border-[#1A1A1A] bg-[#FAF8F5] px-2.5 py-1 text-xs font-semibold text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F2ED] transition"
                      >
                        <span>{isZh ? pre.nameZh : pre.nameEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Related Events */}
            {activeConcept.relatedEventIds.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#1A1A1A]">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                  {isZh ? '关联历史节点' : 'Related Historic Milestones'}
                </h3>
                <div className="space-y-1.5">
                  {activeConcept.relatedEventIds.map((id) => {
                    const evt = DataRepository.getEventById(id);
                    if (!evt) return null;
                    return (
                      <button
                        key={evt.id}
                        onClick={() => {
                          setSelectedEventId(evt.id);
                          useAppStore.getState().setActiveMode('explore');
                        }}
                        className="w-full flex items-center justify-between border border-[#1A1A1A]/30 bg-[#E8E4DD]/40 p-2 text-xs font-semibold text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F2ED] transition"
                      >
                        <span className="truncate">{isZh ? evt.titleZh : evt.titleEn}</span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 ml-2" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
