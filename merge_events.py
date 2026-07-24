"""Phase 4: LLM merges intermediate events into full AiHistoryEvent format."""
import json
import os
import requests

LLM_URL = "http://192.168.0.173:6000/v1/chat/completions"
LLM_MODEL = "AurightecLLM"
INPUT_PATH = "data/intermediate/events-verified.json"
OUTPUT_DIR = "data/output"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Existing event IDs and slugs to check for duplicates
EXISTING_IDS = [
    'mcculloch-pitts-1943', 'turing-paper-1950', 'dartmouth-proposal-1955',
    'dartmouth-workshop-1956', 'perceptron-1958', 'lighthill-report-1973',
    'backpropagation-1986', 'lenet-1998', 'deep-blue-1997',
    'imagenet-release-2009', 'alexnet-2012', 'gan-invented-2014',
    'alphago-lee-sedol-2016', 'transformer-2017', 'gpt-bert-2018',
    'alphafold2-2021', 'us-export-control-2022', 'chatgpt-launch-2022',
    'llama-open-weights-2023', 'eu-ai-act-passed-2024', 'mcp-protocol-launch-2024',
    'deepseek-r1-2025', 'agentic-loop-coding-2025', 'sovereign-ai-clusters-2025',
]

EXISTING_TITLES = [
    "麦卡洛克-皮茨神经元数学模型提出", "图灵发表《计算机器与智能》并提出图灵测试",
    "达特茅斯研讨会提案提交，Artificial Intelligence术语诞生",
    "达特茅斯研讨会召开，人工智能学科正式诞生", "弗兰克·罗森布拉特发明感知机（Perceptron）",
    "英国发布《莱特希尔报告》，引发第一次 AI 寒冬",
    "鲁梅哈特与辛顿在《Nature》发表反向传播算法", "杨立昆发表 LeNet-5",
    "IBM 深蓝战胜国际象棋世界冠军卡斯帕罗夫", "李飞飞团队发布 ImageNet",
    "AlexNet 夺得 ImageNet 视觉竞赛冠军", "伊恩·古德费洛等人提出生成对抗网络 (GAN)",
    "DeepMind AlphaGo 4:1 战胜围棋九段棋手李世石",
    "Google 团队发表 Transformer 架构", "GPT-1 与 BERT 相继问世",
    "DeepMind AlphaFold 2 破译蛋白质 3D 结构预测难题",
    "OpenAI 正式发布 ChatGPT", "Meta 发布 LLaMA 开源权重大模型",
    "DeepSeek 发布 DeepSeek-R1",
]

ERA_MAP = {
    1943: ('era-01', 1955),
    1956: ('era-02', 1973),
    1974: ('era-03', 1992),
    1993: ('era-04', 2011),
    2012: ('era-05', 2016),
    2017: ('era-06', 2021),
    2022: ('era-07', 2024),
    2025: ('era-08', None),
}

TRACK_MAP = {
    'theory-algorithm': ['数学', '模型', '算法', '理论', '论文', '逼近', '定理', '网络架构', '架构', '反向传播', '感知机', '信念', '图灵', '逻辑', '编程语言', 'LISP', 'LSTM'],
    'model-product': ['GPT', 'ChatGPT', '模型', '发布', 'Sora', 'Gemini', 'CLIP', 'Word2Vec', 'ResNet', 'AlexNet', 'GAN', 'BERT', 'LLaMA', '聊天', '翻译'],
    'compute-infrastructure': ['CUDA', 'GPU', '芯片', '算力', '超级计算机', '数据集', '第五代计算机', 'ImageNet', '并行'],
    'open-ecosystem': ['开源', '开放', '社区', '协议', 'LLaMA', 'DeepSeek'],
    'policy-governance': ['政府', 'DARPA', '挑战赛', '诺贝尔', '图灵奖', '通产省', '国家计划', '法案', '出口管制'],
    'society-industry': ['自动驾驶', '医疗', '蛋白质', '化学', '无人驾驶', '西洋', '国际象棋', '围棋', '图灵奖', '诺贝尔'],
}

MERGE_PROMPT = """你是一个AI历史数据编纂专家。请将以下中间格式的AI历史事件转换为完整的 AiHistoryEvent TypeScript 格式。

## 转换规则

### 1. 去重合并
- 如果多个中间事件描述同一件事（如"DBN提出"和"Hinton提出DBN"），合并为一个最准确的版本
- 已存在的事件必须跳过（不要重复输出）：{existing_titles}

### 2. Era 映射（根据年份）
{era_rules}

### 3. Track 分类（根据事件性质选择1-3个trackId）
可用trackIds: theory-algorithm, model-product, compute-infrastructure, open-ecosystem, policy-governance, society-industry
- theory-algorithm: 算法/理论/数学突破
- model-product: 模型/产品/应用发布
- compute-infrastructure: 算力/数据/硬件
- open-ecosystem: 开源/社区/协议
- policy-governance: 政策/法规/政府
- society-industry: 产业/社会/科学应用

### 4. LandmarkTier 分级
- S: 划时代里程碑（改变整个领域方向）
- A: 重大技术突破
- B: 重要节点
- C: 补充节点
- Watch: 观察中

### 5. 位置坐标
为每个事件补充 cityZh, countryCode, lat, lng。使用以下参考坐标：
- 美国 剑桥/波士顿 (42.36, -71.09) | 匹兹堡 (40.44, -79.99) | 旧金山 (37.77, -122.42) | 山景城 (37.39, -122.08) | 雷德蒙德 (47.67, -122.12)
- 加拿大 多伦多 (43.65, -79.38) | 蒙特利尔 (45.50, -73.57)
- 英国 伦敦 (51.51, -0.13)
- 日本 东京 (35.68, 139.76) | 京都 (35.01, 135.77)
- 瑞典 斯德哥尔摩 (59.33, 18.07)
- 若无确切城市，使用机构总部城市

### 6. 输出格式
输出纯 JSON 数组，每个事件严格按以下 TypeScript 接口：

```typescript
interface AiHistoryEvent {{
  id: string;       // 格式: "slug-like-name-YYYY", 如 "logic-theorist-1956"
  slug: string;     // 英文短横线, 如 "logic-theorist-program"
  titleZh: string;
  titleEn: string;
  dateStart: string;   // "YYYY-MM-DD"
  dateEnd?: string;    // 范围事件才填
  datePrecision: "day"|"month"|"year"|"range";
  eraId: string;       // 按年份映射
  primaryTrack: TrackId;  // 主要轨道
  trackIds: string[];     // 1-3个轨道
  landmarkTier: "S"|"A"|"B"|"C"|"Watch";
  status: "verified";
  summaryZh: string;    // 2-3句话
  summaryEn: string;
  significanceZh: string; // 1-2句话
  significanceEn: string;
  changedWhatZh?: string[];
  changedWhatEn?: string[];
  conceptIds: string[];   // 空数组即可
  actorIds: string[];     // 空数组即可
  organizationIds: string[]; // 空数组即可
  locations: [{{
    id: string;       // "loc-city-year"
    cityZh: string;
    cityEn: string;
    countryCode: string; // ISO 2-letter
    lat: number;
    lng: number;
    basis: "primary_research_institution"|"company_headquarters"|"physical_event_location"|"conference_location";
    confidence: "high"|"medium";
    evidenceSourceIds: string[];
  }}];
  sourceIds: string[];   // "src-xxx"
  scoring: {{
    originality: 1-5;
    impact: 1-5;
    globalReach: 1-5;
    societalEffect: 1-5;
    evidenceReliability: 1-5;
    historicalIndependence: 1-5;
  }};
  featured: false;
  storyChapterIds: [];
  firstPublishedAt: "2026-07-24";
  lastReviewedAt: "2026-07-24";
  reviewedBy: ["AI Editorial Team"];
  dataVersion: "1.0.0";
}}
```

以下是需要转换的中间事件：

{events_json}

## 重要
- 只输出 JSON 数组，不要输出任何其他文字
- 严格去重，相似的多个条目只保留最准确的一个
- 跳过与已有事件重复的内容
"""

def get_era(year: int):
    """Get eraId for a given year."""
    for start, (era_id, end) in sorted(ERA_MAP.items()):
        if end is None or year <= end:
            if year >= start:
                return era_id
    return 'era-08'

def build_era_rules():
    lines = []
    for start, (era_id, end) in sorted(ERA_MAP.items()):
        end_str = str(end) if end else '现在'
        lines.append(f"- {start}—{end_str} → {era_id}")
    return '\n'.join(lines)

def merge_batch(events: list, batch_label: str, output_path: str):
    """Send a batch of events to LLM for merging."""
    events_json = json.dumps(events, ensure_ascii=False, indent=2)
    prompt = MERGE_PROMPT.format(
        existing_titles="\n".join(f"- {t}" for t in EXISTING_TITLES),
        era_rules=build_era_rules(),
        events_json=events_json
    )
    
    print(f"\n=== Merging batch: {batch_label} ({len(events)} events) ===")
    print(f"Prompt length: {len(prompt)} chars")
    
    try:
        r = requests.post(LLM_URL, json={
            "model": LLM_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2,
            "max_tokens": 48000,
        }, timeout=900)
        
        if r.status_code != 200:
            print(f"LLM error: {r.status_code}")
            print(r.text[:500])
            return []
        
        data = r.json()
        msg = data['choices'][0]['message']
        reply = msg.get('content') or ''
        finish = data['choices'][0].get('finish_reason', '?')
        usage = data.get('usage', {})
        print(f"  finish={finish}, prompt_tokens={usage.get('prompt_tokens',0)}, completion={usage.get('completion_tokens',0)}")
        
        if not reply:
            print("  WARNING: content is null")
            return []
        
        # Extract JSON
        json_start = reply.find('[')
        json_end = reply.rfind(']') + 1
        if json_start >= 0 and json_end > json_start:
            result = json.loads(reply[json_start:json_end])
            print(f"  Merged to {len(result)} events")
            
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            
            return result
        else:
            print("  No JSON array found")
            debug_path = output_path.replace('.json', '_raw.txt')
            with open(debug_path, 'w', encoding='utf-8') as f:
                f.write(reply)
            return []
    except Exception as e:
        print(f"Error: {e}")
        return []

# Load verified events
with open(INPUT_PATH, 'r', encoding='utf-8') as f:
    events = json.load(f)

# Split into 2 batches by year
batch_early = []
batch_late = []
for e in events:
    year = int(e.get('date', '1950')[:4])
    # Remove _verification field before sending
    clean = {k: v for k, v in e.items() if k != '_verification'}
    if year < 2006:
        batch_early.append(clean)
    else:
        batch_late.append(clean)

print(f"Batch early (<2006): {len(batch_early)} events")
print(f"Batch late (>=2006): {len(batch_late)} events")

# Process batches
all_merged = []
for batch, label in [(batch_early, 'early'), (batch_late, 'late')]:
    out_path = os.path.join(OUTPUT_DIR, f'enriched-{label}.json')
    if os.path.exists(out_path):
        print(f"Skipping {label} (already exists)")
        with open(out_path, 'r', encoding='utf-8') as f:
            all_merged.extend(json.load(f))
    else:
        merged = merge_batch(batch, label, out_path)
        if merged:
            all_merged.extend(merged)

# Final save
final_path = os.path.join(OUTPUT_DIR, 'enriched-events.json')
with open(final_path, 'w', encoding='utf-8') as f:
    json.dump(all_merged, f, indent=2, ensure_ascii=False)

print(f"\n=== All done: {len(all_merged)} events saved to {final_path} ===")
