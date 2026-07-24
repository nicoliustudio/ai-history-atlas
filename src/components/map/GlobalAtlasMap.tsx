import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { useAppStore } from '../../store/appStore';
import { DataRepository } from '../../data/repository';
import { AiHistoryEvent, EventLocation } from '../../types';
import { MapPin, Globe, Layers, Navigation, ExternalLink, ShieldCheck } from 'lucide-react';

// Open-source Map Tile Provider configurations
const TILE_PROVIDERS = [
  {
    id: 'cartodb-light',
    nameZh: 'CartoDB 纸质印染图 (推荐)',
    nameEn: 'CartoDB Positron (Paper Light)',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    id: 'osm-standard',
    nameZh: 'OpenStreetMap 官方矢量图',
    nameEn: 'OpenStreetMap Standard',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    id: 'cartodb-voyager',
    nameZh: 'CartoDB 探索彩色图',
    nameEn: 'CartoDB Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    id: 'cartodb-dark',
    nameZh: 'CartoDB 极简深色图',
    nameEn: 'CartoDB Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
];

export const GlobalAtlasMap: React.FC = () => {
  const { filter, selectedEventId, setSelectedEventId, locale, customDataVersion } = useAppStore();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeTileId, setActiveTileId] = useState<string>('cartodb-light');
  const isZh = locale === 'zh-CN';

  // Filtered events
  const events = useMemo(() => {
    return DataRepository.filterEvents(filter);
  }, [filter, customDataVersion]);

  // Extract all points with coordinates
  const eventPoints = useMemo(() => {
    const points: {
      event: AiHistoryEvent;
      location: EventLocation;
      lat: number;
      lng: number;
    }[] = [];

    events.forEach((evt) => {
      evt.locations.forEach((loc) => {
        if (loc.lat !== undefined && loc.lng !== undefined) {
          points.push({
            event: evt,
            location: loc,
            lat: loc.lat,
            lng: loc.lng,
          });
        }
      });
    });

    return points;
  }, [events]);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    const map = L.map(mapContainerRef.current, {
      center: [25, 10],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
    });

    // Add Zoom control at top-right
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

  // 2. Update Tile Provider when user selects a different style
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

  // 3. Render Leaflet Custom Pin Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    eventPoints.forEach((pt) => {
      const isS = pt.event.landmarkTier === 'S';
      const isSelected = selectedEventId === pt.event.id;
      const title = isZh ? pt.event.titleZh : pt.event.titleEn;
      const city = isZh
        ? pt.location.cityZh || pt.location.regionZh || '未知地点'
        : pt.location.cityEn || pt.location.regionEn || 'Location';

      // Create structured HTML DivIcon for Editorial design
      const htmlContent = `
        <div class="relative group cursor-pointer transition-transform hover:scale-110">
          ${
            isS
              ? `<div class="absolute -inset-1 rounded-sm bg-[#C44536]/30 animate-pulse"></div>`
              : ''
          }
          <div class="relative flex items-center space-x-1 px-2 py-0.5 border ${
            isSelected
              ? 'border-[#C44536] bg-[#C44536] text-white shadow-md'
              : isS
              ? 'border-[#1A1A1A] bg-[#C44536] text-white'
              : 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED]'
          } text-[9px] font-mono font-bold uppercase tracking-tight">
            <span>${isS ? 'S' : 'M'}</span>
            <span class="w-px h-2.5 bg-current opacity-40"></span>
            <span class="truncate max-w-[90px]">${city}</span>
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

      // Create rich Leaflet Popup card
      const popupHtml = `
        <div class="p-3.5 space-y-2 font-sans w-64 text-[#1A1A1A]">
          <div class="flex items-center justify-between border-b border-[#1A1A1A]/30 pb-1.5">
            <span class="px-1.5 py-0.5 border border-[#1A1A1A] ${
              isS ? 'bg-[#C44536] text-white' : 'bg-[#1A1A1A] text-[#F5F2ED]'
            } text-[9px] font-mono font-bold uppercase">
              ${pt.event.landmarkTier}-Tier Milestone
            </span>
            <span class="text-[10px] font-mono font-bold text-[#C44536]">
              ${pt.event.dateStart}
            </span>
          </div>

          <div>
            <h4 class="text-sm font-serif italic font-bold leading-tight text-[#1A1A1A]">
              ${title}
            </h4>
            <p class="text-[11px] font-bold text-[#1A1A1A]/70 mt-0.5 flex items-center">
              📍 ${city} ${pt.location.countryCode ? `[${pt.location.countryCode}]` : ''}
            </p>
          </div>

          <p class="text-[11px] text-[#1A1A1A]/80 leading-snug line-clamp-2 font-serif border-l-2 border-[#1A1A1A] pl-2 py-0.5 bg-[#E8E4DD]/40">
            ${isZh ? pt.event.summaryZh : pt.event.summaryEn}
          </p>

          <div class="pt-1 flex items-center justify-between text-[10px] font-mono text-[#1A1A1A]/60">
            <span>Basis: ${pt.location.basis || 'Primary'}</span>
            <span>Conf: ${pt.location.confidence || 1.0}</span>
          </div>

          <button
            id="inspect-evt-${pt.event.id}"
            class="w-full mt-2 border border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED] hover:bg-[#C44536] py-1 text-[10px] font-mono font-bold uppercase tracking-wider transition text-center"
          >
            Inspect Milestone Details →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 280,
        closeButton: true,
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`inspect-evt-${pt.event.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedEventId(pt.event.id);
          };
        }
      });

      markersGroupRef.current.addLayer(marker);
    });
  }, [eventPoints, selectedEventId, isZh, setSelectedEventId]);

  // Quick Region Focus helper
  const handleJumpRegion = (lat: number, lng: number, zoom: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
    }
  };

  return (
    <div className="relative flex flex-col w-full border border-[#1A1A1A] bg-[#FAF8F5] p-5 shadow-sm overflow-hidden text-[#1A1A1A] font-sans">
      {/* Header & Controls Bar */}
      <div className="z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 border-b border-[#1A1A1A] pb-3">
        <div>
          <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-[#C44536]">
            <Globe className="h-3.5 w-3.5 text-[#C44536]" />
            <span>OpenSource Cartographic Matrix // 02</span>
          </div>
          <div className="flex items-center space-x-3 mt-0.5">
            <h2 className="text-xl font-serif italic font-bold text-[#1A1A1A]">
              {isZh ? '开源地理地图沙盘 (OpenStreetMap & CARTO)' : 'OpenSource AI Geographic Atlas'}
            </h2>
            <span className="border border-[#1A1A1A] bg-[#E8E4DD] px-2 py-0.5 text-[10px] font-mono font-bold text-[#1A1A1A]">
              {eventPoints.length} {isZh ? '个可归因地理坐标' : 'Geo-pinned Events'}
            </span>
          </div>
        </div>

        {/* Map Tile Switcher Select */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[10px] font-mono font-bold uppercase text-[#1A1A1A]/70 flex items-center">
            <Layers className="h-3.5 w-3.5 mr-1" />
            Tiles:
          </span>
          <select
            value={activeTileId}
            onChange={(e) => setActiveTileId(e.target.value)}
            className="border border-[#1A1A1A] bg-[#F5F2ED] px-2.5 py-1 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none cursor-pointer"
          >
            {TILE_PROVIDERS.map((tp) => (
              <option key={tp.id} value={tp.id}>
                {isZh ? tp.nameZh : tp.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Region Presets Bar */}
      <div className="z-10 flex flex-wrap items-center gap-1.5 mb-3 text-[10px] font-mono font-bold uppercase">
        <span className="text-[#1A1A1A]/60 flex items-center mr-1">
          <Navigation className="h-3 w-3 mr-1" />
          Quick Focus:
        </span>
        <button
          onClick={() => handleJumpRegion(20, 0, 2)}
          className="border border-[#1A1A1A] bg-[#E8E4DD] px-2 py-0.5 hover:bg-[#1A1A1A] hover:text-[#F5F2ED] transition"
        >
          {isZh ? '🌍 全球视角' : 'Global'}
        </button>
        <button
          onClick={() => handleJumpRegion(37.4, -122.1, 9)}
          className="border border-[#1A1A1A] bg-[#FAF8F5] px-2 py-0.5 hover:bg-[#1A1A1A] hover:text-[#F5F2ED] transition"
        >
          {isZh ? '🇺🇸 硅谷 (SF / Stanford)' : 'Silicon Valley'}
        </button>
        <button
          onClick={() => handleJumpRegion(42.3, -71.1, 10)}
          className="border border-[#1A1A1A] bg-[#FAF8F5] px-2 py-0.5 hover:bg-[#1A1A1A] hover:text-[#F5F2ED] transition"
        >
          {isZh ? '🇺🇸 波士顿 (MIT / Harvard)' : 'Boston/MIT'}
        </button>
        <button
          onClick={() => handleJumpRegion(39.9, 116.4, 10)}
          className="border border-[#1A1A1A] bg-[#FAF8F5] px-2 py-0.5 hover:bg-[#1A1A1A] hover:text-[#F5F2ED] transition"
        >
          {isZh ? '🇨🇳 北京 (清华 / 五道口)' : 'Beijing'}
        </button>
        <button
          onClick={() => handleJumpRegion(51.5, -0.1, 9)}
          className="border border-[#1A1A1A] bg-[#FAF8F5] px-2 py-0.5 hover:bg-[#1A1A1A] hover:text-[#F5F2ED] transition"
        >
          {isZh ? '🇬🇧 伦敦 (DeepMind / Oxford)' : 'London/DeepMind'}
        </button>
      </div>

      {/* Leaflet Map DOM Container */}
      <div className="relative w-full h-[460px] border border-[#1A1A1A] z-0 overflow-hidden shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-[1000] flex items-center space-x-3 border border-[#1A1A1A] bg-[#FAF8F5] p-2.5 font-mono text-[10px] text-[#1A1A1A] font-bold shadow-md">
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 border border-[#1A1A1A] bg-[#C44536]" />
            <span>S-Tier Landmark</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 border border-[#1A1A1A] bg-[#1A1A1A]" />
            <span>Milestone Pin</span>
          </div>
        </div>
      </div>
    </div>
  );
};
