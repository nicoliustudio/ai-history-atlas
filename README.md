# AI History Atlas — 全球人工智能演化图谱

**全球 AI 历史里程碑的可视化交互图谱**，覆盖从 1943 年到 2025 年的关键事件、核心概念与演化轨道。

## 功能特性

- **六维并行时间轴** — 理论与算法 / 模型与产品 / 算力与基础设施 / 开源与生态 / 政策与治理 / 社会与产业
- **全球地理图谱** — 基于 Leaflet 的交互式世界地图，标记每个事件的发生地与归因类型
- **时空轨迹播放器** — 按时间顺序动态巡览事件轨迹，支持飞行动画与章节切换
- **故事模式** — 9+ 个预配置故事章节，带中英双语旁白
- **概念知识图谱** — 核心概念间依赖与演化关系的 D3 力导向图
- **详细事件面板** — 每个事件的评分、来源、局限性、争议点完整呈现
- **筛选与搜索** — 按时代、轨道、等级、国家、年份范围灵活筛选
- **自定义节点** — 支持 JSON 导入用户自定义事件并持久化到 localStorage
- **暗色/亮色主题** — 全站主题切换
- **中英双语** — 全界面与数据双语覆盖

## 数据概览

| 维度 | 数量 |
|------|------|
| 历史事件 | **70+**（含 21 个中国 AI 里程碑） |
| 涵盖时代 | 8 个（1943—至今） |
| 演化轨道 | 6 条 |
| 核心概念 | 17 个 |
| 故事章节 | 10 个 |
| 引文来源 | 60+ |
| 组织 / 人物 | 18 个 / 13 位 |

### 中国 AI 发展里程碑（新增）

从钱学森《工程控制论》（1954）到 DeepSeek-R1（2025）与"人工智能+"国家战略，21 个经过严格交叉验证的历史节点完整覆盖中国 AI 70 年历程。

详见 [china_ai_history_atlas_evidence.md](./china_ai_history_atlas_evidence.md)

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **状态管理**: Zustand
- **样式**: Tailwind CSS 4
- **地图**: Leaflet
- **图谱可视化**: D3.js (force / scale / selection)
- **动效**: Motion (Framer Motion 继任者)
- **数据校验**: Zod
- **部署**: GitHub Pages + GitHub Actions

## 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器 (http://localhost:3000)
npm run dev

# 构建生产版本
npm run build

# TypeScript 类型检查
npm run lint
```

## 项目结构

```
src/
  components/
    timline/     MultiTrackTimeline — 六维并行时间轴
    map/         GlobalAtlasMap — 全球地理图谱
    story/       StoryPlayerView / SpatioTemporalTracePlayer — 故事播放器
    event/       EventDetailDrawer — 事件详情面板
    concept/     ConceptGraphView — 概念图谱
    filters/     FilterPanel — 筛选面板
    search/      GlobalSearchModal — 全局搜索
    modals/      CustomNodeBuilderModal — 自定义节点
  data/          数据层 — events / concepts / eras / tracks / sources / stories / organizations
  store/         Zustand 全局状态
  types/         TypeScript 类型与 Zod Schema
  pages/         页面 — Explore / Story / Concepts / Compare / About
```

## 许可证

MIT
