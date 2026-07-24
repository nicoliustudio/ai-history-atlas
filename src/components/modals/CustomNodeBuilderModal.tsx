import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { DataRepository } from '../../data/repository';
import { AiHistoryEvent, LandmarkTier, EventStatus, TrackId, StoryChapter } from '../../types';
import {
  X,
  PlusCircle,
  FileSpreadsheet,
  MapPin,
  Trash2,
  Download,
  Upload,
  Sparkles,
  Check,
  BookOpen,
  Layers,
} from 'lucide-react';

// Preset locations for fast city picking
const PRESET_LOCATIONS = [
  { cityZh: '旧金山/硅谷', cityEn: 'Silicon Valley/SF', countryCode: 'US', lat: 37.4, lng: -122.1, basis: 'primary_research_institution' },
  { cityZh: '北京', cityEn: 'Beijing', countryCode: 'CN', lat: 39.9, lng: 116.4, basis: 'primary_research_institution' },
  { cityZh: '伦敦', cityEn: 'London', countryCode: 'GB', lat: 51.5, lng: -0.1, basis: 'company_headquarters' },
  { cityZh: '波士顿/剑桥', cityEn: 'Boston/Cambridge', countryCode: 'US', lat: 42.3, lng: -71.1, basis: 'primary_research_institution' },
  { cityZh: '上海', cityEn: 'Shanghai', countryCode: 'CN', lat: 31.2, lng: 121.4, basis: 'company_headquarters' },
  { cityZh: '巴黎', cityEn: 'Paris', countryCode: 'FR', lat: 48.8, lng: 2.35, basis: 'primary_research_institution' },
  { cityZh: '东京', cityEn: 'Tokyo', countryCode: 'JP', lat: 35.6, lng: 139.6, basis: 'company_headquarters' },
  { cityZh: '杭州', cityEn: 'Hangzhou', countryCode: 'CN', lat: 30.2, lng: 120.1, basis: 'company_headquarters' },
  { cityZh: '深圳', cityEn: 'Shenzhen', countryCode: 'CN', lat: 22.5, lng: 114.0, basis: 'company_headquarters' },
  { cityZh: '西雅图', cityEn: 'Seattle', countryCode: 'US', lat: 47.6, lng: -122.3, basis: 'company_headquarters' },
  { cityZh: '多伦多', cityEn: 'Toronto', countryCode: 'CA', lat: 43.6, lng: -79.3, basis: 'primary_research_institution' },
  { cityZh: '苏黎世', cityEn: 'Zurich', countryCode: 'CH', lat: 47.3, lng: 8.54, basis: 'primary_research_institution' },
];

export const CustomNodeBuilderModal: React.FC = () => {
  const {
    isCustomNodeModalOpen,
    setCustomNodeModalOpen,
    locale,
    bumpCustomDataVersion,
    setSelectedEventId,
    setActiveMode,
  } = useAppStore();

  const isZh = locale === 'zh-CN';
  const [activeTab, setActiveTab] = useState<'node' | 'story' | 'manage'>('node');

  // Node Form State
  const [titleZh, setTitleZh] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [dateStart, setDateStart] = useState('2026-03-15');
  const [eraId, setEraId] = useState('era-05-genai');
  const [landmarkTier, setLandmarkTier] = useState<LandmarkTier>('S');
  const [status, setStatus] = useState<EventStatus>('verified');
  const [selectedTracks, setSelectedTracks] = useState<TrackId[]>(['foundation_llm', 'agentic_ai']);

  // Geolocation
  const [cityZh, setCityZh] = useState('旧金山/硅谷');
  const [cityEn, setCityEn] = useState('Silicon Valley/SF');
  const [countryCode, setCountryCode] = useState('US');
  const [lat, setLat] = useState(37.4);
  const [lng, setLng] = useState(-122.1);
  const [basis, setBasis] = useState('primary_research_institution');

  // Text details
  const [summaryZh, setSummaryZh] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [significanceZh, setSignificanceZh] = useState('');
  const [significanceEn, setSignificanceEn] = useState('');
  const [changedWhatZh, setChangedWhatZh] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');

  // Story Chapter Form State
  const [storyTitleZh, setStoryTitleZh] = useState('');
  const [storyTitleEn, setStoryTitleEn] = useState('');
  const [storyPeriod, setStoryPeriod] = useState('2026—2027');
  const [storySummaryZh, setStorySummaryZh] = useState('');
  const [storySummaryEn, setStorySummaryEn] = useState('');
  const [storyNarrationZh, setStoryNarrationZh] = useState('');
  const [storyNarrationEn, setStoryNarrationEn] = useState('');
  const [selectedEventIdsForChapter, setSelectedEventIdsForChapter] = useState<string[]>([]);

  // JSON Import/Export State
  const [importJsonText, setImportJsonText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isCustomNodeModalOpen) return null;

  const eras = DataRepository.getEras();
  const tracks = DataRepository.getTracks();
  const allEvents = DataRepository.getAllEvents();
  const customEvents = DataRepository.getCustomEvents();
  const customChapters = DataRepository.getCustomStoryChapters();

  // Pick Preset Location
  const handleSelectPresetLoc = (loc: typeof PRESET_LOCATIONS[0]) => {
    setCityZh(loc.cityZh);
    setCityEn(loc.cityEn);
    setCountryCode(loc.countryCode);
    setLat(loc.lat);
    setLng(loc.lng);
    setBasis(loc.basis);
  };

  // Toggle track selection
  const toggleTrack = (tid: TrackId) => {
    if (selectedTracks.includes(tid)) {
      setSelectedTracks(selectedTracks.filter((t) => t !== tid));
    } else {
      setSelectedTracks([...selectedTracks, tid]);
    }
  };

  // Submit Milestone Node
  const handleSaveNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleZh.trim()) {
      setFeedbackMsg({ type: 'error', text: isZh ? '请填写中文节点标题' : 'Please enter event title' });
      return;
    }

    const newId = `custom-evt-${Date.now()}`;
    const sourceId = sourceTitle.trim() ? `src-${Date.now()}` : 'src-custom-01';

    const nowStr = new Date().toISOString();
    const primaryTrack = selectedTracks[0] || 'foundation_llm';

    const newEvent: AiHistoryEvent = {
      id: newId,
      slug: newId,
      titleZh: titleZh.trim(),
      titleEn: titleEn.trim() || titleZh.trim(),
      summaryZh: summaryZh.trim() || titleZh.trim(),
      summaryEn: summaryEn.trim() || titleEn.trim() || titleZh.trim(),
      significanceZh: significanceZh.trim() || '重大历史创新与技术飞跃',
      significanceEn: significanceEn.trim() || 'Significant milestone innovation.',
      dateStart,
      datePrecision: 'day',
      eraId,
      primaryTrack: primaryTrack as any,
      landmarkTier,
      status,
      trackIds: selectedTracks.length > 0 ? selectedTracks : ['foundation_llm'],
      changedWhatZh: changedWhatZh
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      changedWhatEn: changedWhatZh
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      locations: [
        {
          id: `loc-${newId}`,
          cityZh,
          cityEn,
          countryCode,
          lat,
          lng,
          basis: basis as any,
          confidence: 'high',
          evidenceSourceIds: [sourceId],
        },
      ],
      conceptIds: ['concept-01-transformer'],
      sourceIds: [sourceId],
      scoring: {
        originality: 5,
        impact: 5,
        globalReach: 5,
        societalEffect: 4,
        evidenceReliability: 5,
        historicalIndependence: 5,
      },
      firstPublishedAt: nowStr,
      lastReviewedAt: nowStr,
    };

    DataRepository.addCustomEvent(newEvent);
    bumpCustomDataVersion();

    setFeedbackMsg({
      type: 'success',
      text: isZh ? `成功添加历史节点: ${newEvent.titleZh}` : `Successfully created milestone: ${newEvent.titleEn}`,
    });

    // Automatically inspect new event
    setSelectedEventId(newEvent.id);
    setActiveMode('explore');

    setTimeout(() => {
      setCustomNodeModalOpen(false);
      setFeedbackMsg(null);
    }, 1200);
  };

  // Submit Story Chapter
  const handleSaveChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyTitleZh.trim()) {
      setFeedbackMsg({ type: 'error', text: isZh ? '请填写故事章节标题' : 'Please enter chapter title' });
      return;
    }

    const newChapterId = `custom-ch-${Date.now()}`;
    const allChapters = DataRepository.getStoryChapters();

    const newChapter: StoryChapter = {
      id: newChapterId,
      order: allChapters.length + 1,
      titleZh: storyTitleZh.trim(),
      titleEn: storyTitleEn.trim() || storyTitleZh.trim(),
      periodLabel: storyPeriod,
      eraIds: ['era-05-genai'],
      eventIds: selectedEventIdsForChapter,
      summaryZh: storySummaryZh.trim() || storyTitleZh.trim(),
      summaryEn: storySummaryEn.trim() || storyTitleEn.trim() || storyTitleZh.trim(),
      narrationZh: storyNarrationZh
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      narrationEn: storyNarrationEn
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      cameraCoords: {
        lat: 37.4,
        lng: -122.1,
        zoom: 3,
      },
      status: 'published',
    };

    DataRepository.addCustomStoryChapter(newChapter);
    bumpCustomDataVersion();

    setFeedbackMsg({
      type: 'success',
      text: isZh ? `成功创建故事章节: ${newChapter.titleZh}` : `Successfully created story chapter: ${newChapter.titleEn}`,
    });

    setTimeout(() => {
      setCustomNodeModalOpen(false);
      setFeedbackMsg(null);
    }, 1200);
  };

  // Export Custom Data JSON
  const handleExportJson = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      customEvents,
      customChapters,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_atlas_custom_data_${Date.now()}.json`;
    a.click();
  };

  // Import Custom Data JSON
  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (Array.isArray(parsed.customEvents)) {
        parsed.customEvents.forEach((evt: AiHistoryEvent) => DataRepository.addCustomEvent(evt));
      }
      if (Array.isArray(parsed.customChapters)) {
        parsed.customChapters.forEach((ch: StoryChapter) => DataRepository.addCustomStoryChapter(ch));
      }

      bumpCustomDataVersion();
      setFeedbackMsg({
        type: 'success',
        text: isZh ? '批量史料JSON导入成功！' : 'JSON Batch Import Successful!',
      });
      setImportJsonText('');
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: isZh ? 'JSON 格式解析错误，请检查输入' : 'Invalid JSON format. Please check your data.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl border-2 border-[#1A1A1A] bg-[#FAF8F5] p-6 shadow-2xl text-[#1A1A1A] font-sans my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-[#1A1A1A] pb-4 mb-5">
          <div>
            <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-[#C44536]">
              <Sparkles className="h-4 w-4 text-[#C44536]" />
              <span>History Node & Story Extension Studio // 史料工作台</span>
            </div>
            <h2 className="text-2xl font-serif italic font-bold text-[#1A1A1A] mt-1">
              {isZh ? '自定义史料节点与故事卡片配置' : 'Custom Milestone & Story Card Studio'}
            </h2>
            <p className="text-xs text-[#1A1A1A]/70 mt-1">
              {isZh
                ? '自主添加 AI 里程碑节点、地理归因及故事章节卡片，自动融合至全球沙盘、地图演化轨迹及时间轴'
                : 'Seamlessly configure new AI milestones, geo-coordinates, and narrative story cards across all map matrices.'}
            </p>
          </div>

          <button
            onClick={() => setCustomNodeModalOpen(false)}
            className="border border-[#1A1A1A] bg-[#E8E4DD] p-2 text-[#1A1A1A] hover:bg-[#C44536] hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Message Alert */}
        {feedbackMsg && (
          <div
            className={`p-3 mb-4 border font-mono text-xs font-bold flex items-center justify-between ${
              feedbackMsg.type === 'success'
                ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED]'
                : 'border-[#C44536] bg-[#C44536]/10 text-[#C44536]'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <Check className="h-4 w-4" />
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-[#1A1A1A] pb-2 mb-6 font-mono text-xs font-bold">
          <button
            onClick={() => setActiveTab('node')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 border transition ${
              activeTab === 'node'
                ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED]'
                : 'border-[#1A1A1A]/30 bg-[#E8E4DD]/50 text-[#1A1A1A] hover:border-[#1A1A1A]'
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span>{isZh ? '1. 新增历史里程碑' : '1. Add Milestone Node'}</span>
          </button>

          <button
            onClick={() => setActiveTab('story')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 border transition ${
              activeTab === 'story'
                ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED]'
                : 'border-[#1A1A1A]/30 bg-[#E8E4DD]/50 text-[#1A1A1A] hover:border-[#1A1A1A]'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>{isZh ? '2. 新增故事卡片章节' : '2. Add Story Chapter'}</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 border transition ${
              activeTab === 'manage'
                ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED]'
                : 'border-[#1A1A1A]/30 bg-[#E8E4DD]/50 text-[#1A1A1A] hover:border-[#1A1A1A]'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>
              {isZh ? '3. 管理与JSON导入导出' : '3. Manage & Import/Export'} ({customEvents.length})
            </span>
          </button>
        </div>

        {/* TAB 1: ADD MILESTONE EVENT FORM */}
        {activeTab === 'node' && (
          <form onSubmit={handleSaveNode} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event Title ZH */}
              <div>
                <label className="block font-mono font-bold uppercase text-[10px] text-[#1A1A1A]/70 mb-1">
                  {isZh ? '节点标题 (中文):' : 'Title (Chinese):'} *
                </label>
                <input
                  type="text"
                  required
                  value={titleZh}
                  onChange={(e) => setTitleZh(e.target.value)}
                  placeholder="例如: DeepSeek-V3 架构开源 / Claude 3.5 Sonnet"
                  className="w-full border border-[#1A1A1A] bg-white p-2 font-serif text-sm focus:outline-none focus:ring-1 focus:ring-[#C44536]"
                />
              </div>

              {/* Event Title EN */}
              <div>
                <label className="block font-mono font-bold uppercase text-[10px] text-[#1A1A1A]/70 mb-1">
                  {isZh ? '节点标题 (英文):' : 'Title (English):'}
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. DeepSeek-V3 Open Weights Release"
                  className="w-full border border-[#1A1A1A] bg-white p-2 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-[#C44536]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Date */}
              <div>
                <label className="block font-mono font-bold uppercase text-[10px] text-[#1A1A1A]/70 mb-1">
                  {isZh ? '发生日期 (YYYY-MM-DD):' : 'Date Start:'}
                </label>
                <input
                  type="text"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="w-full border border-[#1A1A1A] bg-white p-2 font-mono text-xs focus:outline-none"
                />
              </div>

              {/* Era Select */}
              <div>
                <label className="block font-mono font-bold uppercase text-[10px] text-[#1A1A1A]/70 mb-1">
                  {isZh ? '归属纪元 (Era):' : 'Era:'}
                </label>
                <select
                  value={eraId}
                  onChange={(e) => setEraId(e.target.value)}
                  className="w-full border border-[#1A1A1A] bg-white p-2 font-mono text-xs focus:outline-none"
                >
                  {eras.map((era) => (
                    <option key={era.id} value={era.id}>
                      {isZh ? era.titleZh : era.titleEn} ({era.startYear}—{era.endYear || 'Present'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tier Select */}
              <div>
                <label className="block font-mono font-bold uppercase text-[10px] text-[#1A1A1A]/70 mb-1">
                  {isZh ? '里程碑分级 (Landmark Tier):' : 'Landmark Tier:'}
                </label>
                <select
                  value={landmarkTier}
                  onChange={(e) => setLandmarkTier(e.target.value as LandmarkTier)}
                  className="w-full border border-[#1A1A1A] bg-white p-2 font-mono text-xs focus:outline-none font-bold text-[#C44536]"
                >
                  <option value="S">S-Tier (划时代枢纽 / Landmark Pivot)</option>
                  <option value="A">A-Tier (重要技术节点 / Major Tech Node)</option>
                  <option value="B">B-Tier (常规演化节点 / Standard Evolutionary)</option>
                  <option value="Watch">Watch (前瞻关注节点 / Watchlist)</option>
                </select>
              </div>
            </div>

            {/* Geolocation Section */}
            <div className="border border-[#1A1A1A] bg-[#E8E4DD]/40 p-3 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1A1A1A]/30 pb-1.5">
                <span className="font-mono text-[10px] font-bold uppercase text-[#C44536] flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {isZh ? '地理坐标与空间归因 (Geo-Location Attributing)' : 'Geo-Location Attributing'}
                </span>
                <span className="text-[9px] font-mono text-[#1A1A1A]/60">
                  用于在开源地图沙盘及轨迹播放器上精确定位
                </span>
              </div>

              {/* Quick Preset Location Buttons */}
              <div>
                <span className="block font-mono text-[9px] uppercase text-[#1A1A1A]/70 mb-1">
                  {isZh ? '快速选择知名AI学术与产业枢纽:' : 'Quick Select City Hub:'}
                </span>
                <div className="flex flex-wrap gap-1">
                  {PRESET_LOCATIONS.map((loc) => (
                    <button
                      type="button"
                      key={loc.cityEn}
                      onClick={() => handleSelectPresetLoc(loc)}
                      className={`px-2 py-0.5 border text-[10px] font-mono transition ${
                        cityEn === loc.cityEn
                          ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED] font-bold'
                          : 'border-[#1A1A1A]/30 bg-white text-[#1A1A1A] hover:border-[#1A1A1A]'
                      }`}
                    >
                      📍 {loc.cityZh}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lat Lng Inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[9px] font-mono">City (ZH)</label>
                  <input
                    type="text"
                    value={cityZh}
                    onChange={(e) => setCityZh(e.target.value)}
                    className="w-full border border-[#1A1A1A] bg-white p-1 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono">Country Code</label>
                  <input
                    type="text"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full border border-[#1A1A1A] bg-white p-1 font-mono text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono">Latitude (纬度)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value))}
                    className="w-full border border-[#1A1A1A] bg-white p-1 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono">Longitude (经度)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value))}
                    className="w-full border border-[#1A1A1A] bg-white p-1 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono font-bold uppercase text-[10px] text-[#1A1A1A]/70 mb-1">
                  {isZh ? '史实摘要 (中文):' : 'Summary (Chinese):'}
                </label>
                <textarea
                  rows={3}
                  value={summaryZh}
                  onChange={(e) => setSummaryZh(e.target.value)}
                  placeholder="准确简扼地概括该重大AI事件的核心突破与发布内容..."
                  className="w-full border border-[#1A1A1A] bg-white p-2 font-serif text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono font-bold uppercase text-[10px] text-[#1A1A1A]/70 mb-1">
                  {isZh ? '范式跃迁与历史意义:' : 'Significance & Shift:'}
                </label>
                <textarea
                  rows={3}
                  value={significanceZh}
                  onChange={(e) => setSignificanceZh(e.target.value)}
                  placeholder="阐明该里程碑节点对大模型、算力或AI应用生态带来的范式冲击..."
                  className="w-full border border-[#1A1A1A] bg-white p-2 font-serif text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Substantive Changes */}
            <div>
              <label className="block font-mono font-bold uppercase text-[10px] text-[#1A1A1A]/70 mb-1">
                {isZh ? '实质性改变要点 (每行一条):' : 'Substantive Key Changes (One per line):'}
              </label>
              <textarea
                rows={2}
                value={changedWhatZh}
                onChange={(e) => setChangedWhatZh(e.target.value)}
                placeholder="例如:&#10;1. 首次实现万亿参数 MoE 极低成本训练&#10;2. 推理算力效率提升 5 倍"
                className="w-full border border-[#1A1A1A] bg-white p-2 font-sans text-xs focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="border-2 border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED] hover:bg-[#C44536] px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-widest transition"
              >
                {isZh ? '保存并自动融合至全局图谱 →' : 'Save & Merge Milestone Node →'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: ADD STORY CHAPTER FORM */}
        {activeTab === 'story' && (
          <form onSubmit={handleSaveChapter} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono font-bold uppercase text-[10px] text-[#1A1A1A]/70 mb-1">
                  {isZh ? '故事章节标题 (中文):' : 'Story Chapter Title (ZH):'} *
                </label>
                <input
                  type="text"
                  required
                  value={storyTitleZh}
                  onChange={(e) => setStoryTitleZh(e.target.value)}
                  placeholder="例如: 第十章 · Agentic 具身与推理觉醒"
                  className="w-full border border-[#1A1A1A] bg-white p-2 font-serif text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono font-bold uppercase text-[10px] text-[#1A1A1A]/70 mb-1">
                  {isZh ? '时间跨度标识 (Period Label):' : 'Period Label:'}
                </label>
                <input
                  type="text"
                  value={storyPeriod}
                  onChange={(e) => setStoryPeriod(e.target.value)}
                  placeholder="例如: 2026—2027"
                  className="w-full border border-[#1A1A1A] bg-white p-2 font-mono text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono font-bold uppercase text-[10px] text-[#1A1A1A]/70 mb-1">
                {isZh ? '章节宏观导语 (Summary):' : 'Chapter Summary:'}
              </label>
              <textarea
                rows={2}
                value={storySummaryZh}
                onChange={(e) => setStorySummaryZh(e.target.value)}
                placeholder="为本章节编写宏观时代解说词概括..."
                className="w-full border border-[#1A1A1A] bg-white p-2 font-serif text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono font-bold uppercase text-[10px] text-[#1A1A1A]/70 mb-1">
                {isZh ? '章节解说词正文 (每段一行):' : 'Narration Script Paragraphs (One per line):'}
              </label>
              <textarea
                rows={4}
                value={storyNarrationZh}
                onChange={(e) => setStoryNarrationZh(e.target.value)}
                placeholder="编写沉浸式故事解说词，指导时空动画轨迹推进..."
                className="w-full border border-[#1A1A1A] bg-white p-2 font-serif text-xs focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="border-2 border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED] hover:bg-[#C44536] px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-widest transition"
              >
                {isZh ? '保存故事卡片章节 →' : 'Save Story Chapter →'}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: MANAGE & IMPORT / EXPORT */}
        {activeTab === 'manage' && (
          <div className="space-y-6 text-xs font-sans">
            {/* Custom Events List */}
            <div className="border border-[#1A1A1A] bg-white p-4 space-y-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#C44536] flex items-center justify-between border-b border-[#1A1A1A]/30 pb-2">
                <span>{isZh ? '已新增的自定义历史节点列表' : 'User Created Milestones'} ({customEvents.length})</span>
              </h3>

              {customEvents.length === 0 ? (
                <p className="font-serif italic text-[#1A1A1A]/60 py-2">
                  {isZh ? '暂无自定义节点。可在 Tab 1 手动添加或通过 JSON 导入。' : 'No custom events created yet.'}
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {customEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="flex items-center justify-between p-2.5 border border-[#1A1A1A]/30 bg-[#E8E4DD]/30"
                    >
                      <div>
                        <div className="font-mono text-[10px] font-bold text-[#C44536]">
                          {evt.dateStart} · [{evt.landmarkTier}-Tier]
                        </div>
                        <div className="font-serif italic font-bold text-sm">{evt.titleZh}</div>
                      </div>

                      <button
                        onClick={() => {
                          DataRepository.deleteCustomEvent(evt.id);
                          bumpCustomDataVersion();
                        }}
                        className="p-1.5 border border-[#C44536] text-[#C44536] hover:bg-[#C44536] hover:text-white transition"
                        title={isZh ? '删除此自定义节点' : 'Delete event'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Import & Export JSON Tools */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Export */}
              <div className="border border-[#1A1A1A] bg-white p-4 space-y-3">
                <h4 className="font-mono text-xs font-bold uppercase text-[#1A1A1A] flex items-center space-x-1">
                  <Download className="h-4 w-4 text-[#C44536]" />
                  <span>{isZh ? '导出自定义史料 (JSON)' : 'Export Custom Data (JSON)'}</span>
                </h4>
                <p className="text-[11px] text-[#1A1A1A]/70">
                  {isZh
                    ? '一键导出全部自定义节点与故事卡片 JSON 格式备份文件，方便团队共享或二次开发归档。'
                    : 'Export all custom nodes and story cards to a structured JSON file.'}
                </p>
                <button
                  onClick={handleExportJson}
                  className="w-full border border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED] hover:bg-[#C44536] py-2 font-mono text-xs font-bold uppercase transition"
                >
                  {isZh ? '下载 JSON 史料备份文件' : 'Download JSON Backup'}
                </button>
              </div>

              {/* Import */}
              <div className="border border-[#1A1A1A] bg-white p-4 space-y-3">
                <h4 className="font-mono text-xs font-bold uppercase text-[#1A1A1A] flex items-center space-x-1">
                  <Upload className="h-4 w-4 text-[#C44536]" />
                  <span>{isZh ? '批量导入史料 JSON' : 'Batch Import JSON'}</span>
                </h4>
                <textarea
                  rows={2}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="在此粘贴包含 customEvents 的 JSON 文本..."
                  className="w-full border border-[#1A1A1A] p-1.5 font-mono text-[10px]"
                />
                <button
                  onClick={handleImportJson}
                  disabled={!importJsonText.trim()}
                  className="w-full border border-[#1A1A1A] bg-[#1A1A1A] text-[#F5F2ED] hover:bg-[#C44536] disabled:opacity-30 py-2 font-mono text-xs font-bold uppercase transition"
                >
                  {isZh ? '执行批量导入解析' : 'Execute Batch Import'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
