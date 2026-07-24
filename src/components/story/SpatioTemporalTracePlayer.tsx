import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { useAppStore } from '../../store/appStore';
import { DataRepository } from '../../data/repository';
import { AiHistoryEvent, EventLocation, StoryChapter } from '../../types';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Gauge,
  Globe,
  Layers,
  MapPin,
  Calendar,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  ListOrdered,
  ArrowRight,
  Filter,
  Sparkles,
} from 'lucide-react';

// Tile providers for map
const TILE_PROVIDERS = [
  {
    id: 'cartodb-light',
    nameZh: 'CartoDB 纸质印染图',
    nameEn: 'CartoDB Positron',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    id: 'osm-standard',
    nameZh: 'OpenStreetMap 矢量图',
    nameEn: 'OpenStreetMap Standard',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    id: 'cartodb-voyager',
    nameZh: 'CartoDB 探索图',
    nameEn: 'CartoDB Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    id: 'cartodb-dark',
    nameZh: 'CartoDB 极简深色',
    nameEn: 'CartoDB Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
];

interface SpatioTemporalPoint {
  stepIndex: number;
  event: AiHistoryEvent;
  location: NonNullable<AiHistoryEvent['locations']>[number];
  lat: number;
  lng: number;
  year: number;
  city: string;
  countryCode: string;
  chapter?: StoryChapter;
}

export const SpatioTemporalTracePlayer: React.FC = () => {
  const {
    locale,
    setSelectedEventId,
    setSelectedConceptId,
    setActiveMode,
    customDataVersion,
  } = useAppStore();

  const isZh = locale === 'zh-CN';
  const allChapters = DataRepository.getStoryChapters();

  // Selected Filter Chapter ('all' | 'ch-01' | 'ch-02' ...)
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [activeTileId, setActiveTileId] = useState<string>('cartodb-light');

  // Player controls
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  // 1. Prepare chronologically ordered SpatioTemporal Points
  const sortedPoints = useMemo<SpatioTemporalPoint[]>(() => {
    let rawEvents = DataRepository.getAllEvents();

    if (selectedChapterId !== 'all') {
      const ch = allChapters.find((c) => c.id === selectedChapterId);
      if (ch) {
        rawEvents = rawEvents.filter((e) => ch.eventIds.includes(e.id));
      }
    }

    const pointsList: SpatioTemporalPoint[] = [];

    rawEvents.forEach((evt) => {
      evt.locations.forEach((loc) => {
        if (loc.lat !== undefined && loc.lng !== undefined) {
          const year = parseInt(evt.dateStart.substring(0, 4), 10) || 1950;
          const city = isZh
            ? loc.cityZh || loc.regionZh || '未知地点'
            : loc.cityEn || loc.regionEn || 'Location';

          const ch = allChapters.find((c) => c.eventIds.includes(evt.id));

          pointsList.push({
            stepIndex: 0, // reassigned below
            event: evt,
            location: loc,
            lat: loc.lat,
            lng: loc.lng,
            year,
            city,
            countryCode: loc.countryCode || 'GLOBAL',
            chapter: ch,
          });
        }
      });
    });

    // Sort strictly by dateStart ascending
    pointsList.sort((a, b) => {
      const dA = a.event.dateStart;
      const dB = b.event.dateStart;
      return dA.localeCompare(dB);
    });

    // Reassign step indexes
    return pointsList.map((pt, idx) => ({
      ...pt,
      stepIndex: idx,
    }));
  }, [selectedChapterId, allChapters, isZh, customDataVersion]);

  // Ensure activeStep stays within bounds when sortedPoints changes
  useEffect(() => {
    if (activeStep >= sortedPoints.length) {
      setActiveStep(0);
    }
  }, [sortedPoints.length, activeStep]);

  const currentPoint = sortedPoints[activeStep] || sortedPoints[0];

  // 2. Auto Playback Interval Timer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 5000 / speed;
    const timer = setInterval(() => {
      setActiveStep((prevStep) => {
        if (prevStep < sortedPoints.length - 1) {
          return prevStep + 1;
        } else {
          setIsPlaying(false);
          return prevStep;
        }
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, speed, sortedPoints.length]);

  // 3. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialLat = currentPoint ? currentPoint.lat : 30.0;
    const initialLng = currentPoint ? currentPoint.lng : 10.0;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 3,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    const provider = TILE_PROVIDERS.find((p) => p.id === activeTileId) || TILE_PROVIDERS[0];
    const tileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    markersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 4. Update Tile Provider
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const provider = TILE_PROVIDERS.find((p) => p.id === activeTileId) || TILE_PROVIDERS[0];

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    tileLayerRef.current = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);
  }, [activeTileId]);

  // 5. Render Trajectory Polylines and Pins & Camera Motion
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    if (sortedPoints.length === 0) return;

    markersGroupRef.current.clearLayers();

    // 5a. Remove old polyline if any
    if (polylineRef.current) {
      mapInstanceRef.current.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    // 5b. Draw Trajectory Line up to activeStep
    const traceCoords = sortedPoints
      .slice(0, activeStep + 1)
      .map((pt) => [pt.lat, pt.lng] as [number, number]);

    if (traceCoords.length > 1) {
      const polyline = L.polyline(traceCoords, {
        color: '#C44536',
        weight: 3,
        opacity: 0.85,
        dashArray: '6, 8',
      }).addTo(mapInstanceRef.current);

      polylineRef.current = polyline;
    }

    // 5c. Render Pin Markers for points up to activeStep
    sortedPoints.slice(0, activeStep + 1).forEach((pt) => {
      const isCurrent = pt.stepIndex === activeStep;
      const isS = pt.event.landmarkTier === 'S';
      const title = isZh ? pt.event.titleZh : pt.event.titleEn;

      const htmlContent = `
        <div class="relative group cursor-pointer transition-transform ${
          isCurrent ? 'scale-125 z-50' : 'hover:scale-110 opacity-85'
        }">
          ${
            isCurrent
              ? `<div class="absolute -inset-2 rounded-full bg-[#C44536]/40 animate-ping"></div>`
              : ''
          }
          <div class="relative flex items-center space-x-1 px-2 py-0.5 border ${
            isCurrent
              ? 'border-[#1A1A1A] bg-[#C44536] text-white shadow-lg'
              : isS
              ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED]'
              : 'border-[#1A1A1A]/70 bg-[#E8E4DD] text-[#1A1A1A]'
          } text-[9px] font-mono font-bold uppercase tracking-tight">
            <span class="bg-[#1A1A1A]/20 px-1 rounded-xs">#${pt.stepIndex + 1}</span>
            <span>${pt.city}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-editorial-pin',
        html: htmlContent,
        iconSize: [110, 24],
        iconAnchor: [55, 12],
      });

      const marker = L.marker([pt.lat, pt.lng], { icon: customIcon });

      // Click pin to set activeStep directly
      marker.on('click', () => {
        setActiveStep(pt.stepIndex);
      });

      markersGroupRef.current!.addLayer(marker);
    });

    // 5d. Camera Motion: Fly to current point location
    if (currentPoint) {
      mapInstanceRef.current.flyTo([currentPoint.lat, currentPoint.lng], 4.5, {
        duration: 1.2,
      });
    }
  }, [activeStep, sortedPoints, isZh, currentPoint]);

  if (!currentPoint) {
    return (
      <div className="p-8 border border-[#1A1A1A] bg-[#FAF8F5] text-center font-serif text-lg">
        {isZh ? '暂无符合筛选的历史轨迹数据' : 'No spatio-temporal data available for selection.'}
      </div>
    );
  }

  const activeEvent = currentPoint.event;
  const sources = activeEvent.sourceIds
    .map((id) => DataRepository.getSourceById(id))
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-8 py-6 space-y-6 text-[#1A1A1A] font-sans">
      {/* Top Header & Chapter Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border border-[#1A1A1A] bg-[#FAF8F5] p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-[#C44536]">
            <Sparkles className="h-3.5 w-3.5 text-[#C44536]" />
            <span>Spatio-Temporal Interactive Narrative // AI Evolution Matrix</span>
          </div>
          <h1 className="text-2xl font-serif italic font-bold text-[#1A1A1A] mt-0.5">
            {isZh ? '全球 AI 演化时空轨迹沙盘' : 'Global AI Spatio-Temporal Evolution Matrix'}
          </h1>
          <p className="text-xs text-[#1A1A1A]/70 mt-1">
            {isZh
              ? '结合地图空间分布与时间推进动画，动态演绎全球AI重大人文与技术里程碑'
              : 'Interactive spatial-temporal map trace player capturing key AI milestones across geography and time'}
          </p>
        </div>

        {/* Chapter Switcher Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-mono font-bold">
          <span className="text-[10px] uppercase text-[#1A1A1A]/60 flex items-center shrink-0">
            <Filter className="h-3 w-3 mr-1" />
            {isZh ? '故事章节:' : 'Chapter:'}
          </span>
          <button
            onClick={() => {
              setSelectedChapterId('all');
              setActiveStep(0);
            }}
            className={`px-2.5 py-1 border shrink-0 uppercase transition ${
              selectedChapterId === 'all'
                ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED]'
                : 'border-[#1A1A1A]/30 bg-[#E8E4DD]/50 text-[#1A1A1A] hover:border-[#1A1A1A]'
            }`}
          >
            {isZh ? '全景史诗 (1943-2026)' : 'Full Epic'}
          </button>
          {allChapters.map((ch) => (
            <button
              key={ch.id}
              onClick={() => {
                setSelectedChapterId(ch.id);
                setActiveStep(0);
              }}
              className={`px-2 py-1 border shrink-0 transition ${
                selectedChapterId === ch.id
                  ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED]'
                  : 'border-[#1A1A1A]/30 bg-[#E8E4DD]/50 text-[#1A1A1A] hover:border-[#1A1A1A]'
              }`}
            >
              CH {ch.order}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Map Player (Left/Center) + Historical Inspector Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Center: Leaflet Interactive Map & Controls (Col 7) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="relative w-full border border-[#1A1A1A] bg-[#FAF8F5] p-4 shadow-sm">
            {/* Map Top Status Bar */}
            <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-2 mb-3">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold">
                <span className="border border-[#1A1A1A] bg-[#C44536] text-white px-2 py-0.5 text-[10px]">
                  STEP {activeStep + 1} / {sortedPoints.length}
                </span>
                <span className="text-[#C44536]">{currentPoint.year}</span>
                <span className="text-[#1A1A1A]/40">•</span>
                <span>📍 {currentPoint.city} [{currentPoint.countryCode}]</span>
              </div>

              {/* Map Tile Select */}
              <div className="flex items-center space-x-1.5 text-xs font-mono">
                <Layers className="h-3.5 w-3.5 text-[#1A1A1A]/60" />
                <select
                  value={activeTileId}
                  onChange={(e) => setActiveTileId(e.target.value)}
                  className="border border-[#1A1A1A] bg-[#FAF8F5] px-2 py-0.5 text-[10px] font-mono font-bold text-[#1A1A1A] focus:outline-none cursor-pointer"
                >
                  {TILE_PROVIDERS.map((tp) => (
                    <option key={tp.id} value={tp.id}>
                      {isZh ? tp.nameZh : tp.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Leaflet Map DOM Container */}
            <div className="relative w-full h-[480px] border border-[#1A1A1A] overflow-hidden z-0">
              <div ref={mapContainerRef} className="w-full h-full" />

              {/* Floating Legend / Status Badge */}
              <div className="absolute top-3 left-3 z-[1000] border border-[#1A1A1A] bg-[#FAF8F5]/95 backdrop-blur-xs p-2 text-[10px] font-mono font-bold space-y-1">
                <div className="flex items-center space-x-2 text-[#C44536]">
                  <span className="h-2 w-2 rounded-full bg-[#C44536] animate-pulse" />
                  <span>{isPlaying ? 'PLAYING SPATIAL TRACE' : 'TRACE PAUSED'}</span>
                </div>
                {currentPoint.chapter && (
                  <div className="text-[#1A1A1A]/70 truncate max-w-[180px]">
                    {isZh ? currentPoint.chapter.titleZh : currentPoint.chapter.titleEn}
                  </div>
                )}
              </div>
            </div>

            {/* Playback Controls & Progress Scrubber */}
            <div className="mt-4 border border-[#1A1A1A] bg-[#E8E4DD]/40 p-3 space-y-3 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Main Play Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                    disabled={activeStep === 0}
                    className="border border-[#1A1A1A] bg-[#FAF8F5] p-2 text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F2ED] disabled:opacity-30 transition"
                    title={isZh ? '上一个里程碑' : 'Previous Step'}
                  >
                    <SkipBack className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center space-x-1.5 border border-[#1A1A1A] bg-[#1A1A1A] px-4 py-2 text-xs font-bold text-[#F5F2ED] uppercase tracking-wider hover:bg-[#C44536] transition"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4" />
                        <span>{isZh ? '暂停' : 'Pause'}</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        <span>{isZh ? '播放时空轨迹' : 'Play Trace'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      setActiveStep((prev) => Math.min(sortedPoints.length - 1, prev + 1))
                    }
                    disabled={activeStep === sortedPoints.length - 1}
                    className="border border-[#1A1A1A] bg-[#FAF8F5] p-2 text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#F5F2ED] disabled:opacity-30 transition"
                    title={isZh ? '下一个里程碑' : 'Next Step'}
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>

                  {/* Playback Speed Selector */}
                  <div className="flex items-center border border-[#1A1A1A] bg-[#FAF8F5] p-1 text-xs">
                    <Gauge className="h-3.5 w-3.5 mx-1 text-[#1A1A1A]/70" />
                    {[1.0, 1.5, 2.0, 3.0].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSpeed(s)}
                        className={`px-1.5 py-0.5 font-mono text-[10px] font-bold border ${
                          speed === s
                            ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED]'
                            : 'border-transparent hover:border-[#1A1A1A]'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Progress Indicator */}
                <div className="text-right font-mono text-xs font-bold">
                  <div className="text-[#C44536] text-sm">
                    {currentPoint.event.dateStart}
                  </div>
                  <div className="text-[10px] text-[#1A1A1A]/60">
                    {Math.round(((activeStep + 1) / sortedPoints.length) * 100)}% {isZh ? '进度完成' : 'Completed'}
                  </div>
                </div>
              </div>

              {/* Range Slider Scrubber */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={0}
                  max={sortedPoints.length - 1}
                  value={activeStep}
                  onChange={(e) => setActiveStep(parseInt(e.target.value, 10))}
                  className="w-full accent-[#C44536] cursor-pointer"
                />
                <div className="flex justify-between font-mono text-[9px] text-[#1A1A1A]/60">
                  <span>{sortedPoints[0]?.dateStart} ({sortedPoints[0]?.city})</span>
                  <span>
                    {sortedPoints[sortedPoints.length - 1]?.dateStart} (
                    {sortedPoints[sortedPoints.length - 1]?.city})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Active Node Detailed Historical Card + Chronological Feed (Col 5) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Active Landmark Card */}
          <div className="border border-[#1A1A1A] bg-[#FAF8F5] p-6 shadow-sm flex flex-col space-y-4">
            {/* Card Header Badges */}
            <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
              <div className="flex items-center space-x-2">
                <span
                  className={`border px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                    activeEvent.landmarkTier === 'S'
                      ? 'border-[#C44536] bg-[#C44536] text-white'
                      : 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED]'
                  }`}
                >
                  {activeEvent.landmarkTier}-Tier Milestone
                </span>
                <span className="border border-[#1A1A1A] bg-[#E8E4DD] px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-[#1A1A1A]">
                  {activeEvent.status}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-[#C44536]">
                {activeEvent.dateStart}
              </span>
            </div>

            {/* Title & Location */}
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-[#1A1A1A]/60 flex items-center space-x-1 mb-1">
                <MapPin className="h-3 w-3 text-[#C44536]" />
                <span>
                  📍 {currentPoint.city} {currentPoint.countryCode ? `[${currentPoint.countryCode}]` : ''} · Basis: {currentPoint.location.basis}
                </span>
              </div>
              <h2 className="text-xl font-serif italic font-bold text-[#1A1A1A] leading-tight">
                {isZh ? activeEvent.titleZh : activeEvent.titleEn}
              </h2>
            </div>

            {/* Summary & Significance */}
            <div className="space-y-3 font-serif">
              <p className="text-xs text-[#1A1A1A]/90 leading-relaxed border-l-2 border-[#C44536] pl-3 py-1 bg-[#E8E4DD]/40">
                {isZh ? activeEvent.summaryZh : activeEvent.summaryEn}
              </p>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A1A1A]/70 block mb-1">
                  {isZh ? '历史意义与范式跃迁' : 'Historical Significance & Shift'}
                </span>
                <p className="text-xs text-[#1A1A1A] leading-relaxed">
                  {isZh ? activeEvent.significanceZh : activeEvent.significanceEn}
                </p>
              </div>
            </div>

            {/* Substantive Changes */}
            {((isZh ? activeEvent.changedWhatZh : activeEvent.changedWhatEn) || []).length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-[#1A1A1A]/20">
                <span className="text-[10px] font-mono font-bold uppercase text-[#C44536] flex items-center">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {isZh ? '实质性改变 (Substantive Impact):' : 'Key Changes Introduced:'}
                </span>
                <ul className="space-y-1 text-xs font-sans text-[#1A1A1A]/85 pl-1">
                  {(isZh ? activeEvent.changedWhatZh : activeEvent.changedWhatEn)!.map(
                    (change, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-[#C44536] font-bold">•</span>
                        <span>{change}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Primary Sources / Evidence Links */}
            {sources.length > 0 && (
              <div className="pt-2 border-t border-[#1A1A1A]/20">
                <span className="text-[10px] font-mono font-bold uppercase text-[#1A1A1A]/60 block mb-1">
                  {isZh ? '首要文献与权威出处 (Evidence Citations):' : 'Primary Evidence Sources:'}
                </span>
                <div className="space-y-1">
                  {sources.map((src) => (
                    <a
                      key={src!.id}
                      href={src!.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 border border-[#1A1A1A]/30 bg-[#E8E4DD]/30 hover:bg-[#1A1A1A] hover:text-[#F5F2ED] text-xs font-serif transition group"
                    >
                      <span className="truncate pr-2 font-bold">{src!.title}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 text-[#C44536] group-hover:text-[#F5F2ED]" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#1A1A1A] flex items-center space-x-2">
              <button
                onClick={() => {
                  setSelectedEventId(activeEvent.id);
                  setActiveMode('explore');
                }}
                className="flex-1 border border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED] hover:bg-[#C44536] py-2 text-xs font-mono font-bold uppercase tracking-wider transition text-center"
              >
                {isZh ? '查看完整节点史料档案 →' : 'Inspect Full Archive →'}
              </button>
            </div>
          </div>

          {/* Passed Footprints / Chronological Feed */}
          <div className="border border-[#1A1A1A] bg-[#FAF8F5] p-5 shadow-sm flex flex-col space-y-3 max-h-[380px] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-2 sticky top-0 bg-[#FAF8F5] z-10">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center space-x-2">
                <ListOrdered className="h-3.5 w-3.5 text-[#C44536]" />
                <span>{isZh ? '时空历史轨迹卡片流' : 'Spatio-Temporal Milestone Feed'}</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-[#1A1A1A]/60">
                1 ~ {activeStep + 1} / {sortedPoints.length}
              </span>
            </div>

            <div className="space-y-2">
              {sortedPoints.slice(0, activeStep + 1).map((pt, idx) => {
                const isActive = idx === activeStep;
                return (
                  <div
                    key={`${pt.event.id}-${idx}`}
                    onClick={() => setActiveStep(idx)}
                    className={`p-3 border cursor-pointer transition flex items-start space-x-3 ${
                      isActive
                        ? 'border-[#C44536] bg-[#1A1A1A] text-[#F5F2ED] shadow-md'
                        : 'border-[#1A1A1A]/30 bg-[#E8E4DD]/40 text-[#1A1A1A] hover:border-[#1A1A1A]'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center border font-mono text-[10px] font-bold ${
                        isActive
                          ? 'border-[#C44536] bg-[#C44536] text-white'
                          : 'border-[#1A1A1A] bg-[#FAF8F5] text-[#1A1A1A]'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-[#C44536]' : 'text-[#C44536]'}`}>
                          {pt.event.dateStart}
                        </span>
                        <span className="text-[9px] font-mono uppercase opacity-70">
                          📍 {pt.city}
                        </span>
                      </div>
                      <h4 className="text-xs font-serif italic font-bold truncate mt-0.5">
                        {isZh ? pt.event.titleZh : pt.event.titleEn}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
