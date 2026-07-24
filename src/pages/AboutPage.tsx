import React from 'react';
import { useAppStore } from '../store/appStore';
import { ShieldCheck, BookOpen, Layers, Award, CheckCircle2, Globe, HeartHandshake } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { locale } = useAppStore();
  const isZh = locale === 'zh-CN';

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8 text-slate-100">
      {/* Title */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-extrabold sm:text-3xl tracking-tight text-white">
          {isZh
            ? '全球人工智能演化图谱：数据规范与编辑政策'
            : 'Atlas of AI: Data Schema & Editorial Policy'}
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          {isZh
            ? '一套有史料依据、可持续更新、可追溯来源、面向公众解释的全球人工智能演化图谱。'
            : 'A verifiable, traceable, and open-access structural atlas of global artificial intelligence history.'}
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold">
            <ShieldCheck className="h-5 w-5" />
            <span>{isZh ? '一手文献强校验机制' : 'Primary Evidence Standard'}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isZh
              ? '所有 S 级（范式转变）与 A 级（关键里程碑）历史节点必须配备可引用的原始论文（DOI/arXiv）、官方发布文本、法律法规或政府公告，拒绝无据流言。'
              : 'All S-Tier and A-Tier milestones must be backed by primary academic papers, official institutional announcements, or statutory texts.'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
            <Globe className="h-5 w-5" />
            <span>{isZh ? '严密地理坐标归因 (Geo-Basis)' : 'Geographic Basis Standard'}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isZh
              ? '每个地点均明确标注归因依据（物理发生地、主要研究机构、公司总部、政府管辖地、会议举办地或全球分布式），防止强行虚构城市点位。'
              : 'Every coordinate explicitly declares its attribution basis (physical location, primary lab, HQ, or conference site) to avoid spatial fabrications.'}
          </p>
        </div>
      </div>

      {/* Double Timeline Policy */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <Layers className="h-5 w-5 text-amber-400" />
          <span>{isZh ? '双层时间线隔离机制 (Canonical vs Live Watchlist)' : 'Dual Timeline Isolation'}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1">
            <span className="font-bold text-amber-400">Canonical Timeline (历史确认层)</span>
            <p className="text-slate-400">
              {isZh
                ? '已形成全球学术与产业共识的已确认历史节点，严格入库审查。'
                : 'Confirmed historical milestones backed by global academic consensus.'}
            </p>
          </div>

          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1">
            <span className="font-bold text-indigo-400">Live Watchlist (观察中)</span>
            <p className="text-slate-400">
              {isZh
                ? '包含近 12—18 个月的新兴事件与新兴术语（如 Loop Engineering），明确标注“观察中”，与确认历史隔离。'
                : 'Tracks recent emerging trends and terms, strictly isolated from canonical historical facts.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
