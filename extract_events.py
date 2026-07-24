"""Phase 2: Extract AI history events from MinerU markdown using Qwen LLM."""
import json
import os
import re
import requests

LLM_URL = "http://192.168.0.173:6000/v1/chat/completions"
LLM_MODEL = "AurightecLLM"
RAW_DIR = "data/raw"
OUTPUT_DIR = "data/intermediate"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Existing event titles for dedup reference
EXISTING_TITLES = [
    "麦卡洛克-皮茨神经元数学模型提出",
    "图灵发表《计算机器与智能》并提出图灵测试",
    "达特茅斯研讨会提案提交，Artificial Intelligence术语诞生",
    "达特茅斯研讨会召开，人工智能学科正式诞生",
    "弗兰克·罗森布拉特发明感知机（Perceptron）",
    "英国发布《莱特希尔报告》，引发第一次 AI 寒冬",
    "鲁梅哈特与辛顿在《Nature》发表反向传播算法",
    "杨立昆发表 LeNet-5",
    "IBM 深蓝战胜国际象棋世界冠军卡斯帕罗夫",
    "李飞飞团队发布 ImageNet",
    "AlexNet 夺得 ImageNet 视觉竞赛冠军",
    "伊恩·古德费洛等人提出生成对抗网络 (GAN)",
    "DeepMind AlphaGo 4:1 战胜围棋九段棋手李世石",
    "Google 团队发表 Transformer 架构",
    "GPT-1 与 BERT 相继问世",
    "DeepMind AlphaFold 2 破译蛋白质 3D 结构预测难题",
    "美国商务部对高算力 AI 芯片实施出口管制",
    "OpenAI 正式发布 ChatGPT",
    "Meta 发布 LLaMA 开源权重大模型",
    "欧盟《人工智能法案》正式颁布",
    "Anthropic 发布 MCP 协议",
    "DeepSeek 发布 DeepSeek-R1",
    "长程自主编码与循环工程普及",
    "全球主权 AI 算力集群发展",
]

EXTRACTION_PROMPT = """你是一个AI历史学研究助手。请从以下PDF解析出的Markdown内容中，提取所有重要的AI历史事件节点。

## 提取规则

1. **事件粒度**: 提取具有明确时间、地点、人物/机构的具体事件里程碑，不要提取泛泛的描述性文字
2. **去重**: 忽略与以下已有事件重复的内容（标题或含义相同即可跳过）：
已有事件列表: {existing_titles}

3. **覆盖全面**: 提取PDF中提到的所有具体历史事件，包括但不限于：
   - 重要论文/算法发表
   - 关键产品/模型发布
   - 重大赛事/里程碑
   - 政策/法规事件
   - 重要机构成立
   - 技术突破/范式转变

4. **年份推断**: 如果PDF只提到年份没有具体日期，则date填写"YYYY-01-01"，date_precision设为"year"

## 输出格式

请以JSON数组格式输出，每个事件一个对象：

```json
[
  {{
    "title_zh": "事件中文全称",
    "title_en": "事件英文全称",
    "date": "YYYY-MM-DD",
    "date_precision": "day|month|year|approximate",
    "city_zh": "发生城市中文名",
    "country_code": "ISO两位国家代码（如US/CN/GB/CA/FR/JP/KR等）",
    "summary_zh": "2-3句话概括事件内容（准确、简练）",
    "significance_zh": "1-2句话说明该事件的历史意义",
    "people": ["主要人物姓名，如无则为空数组"],
    "organization": "主要机构名称，如无则为空字符串",
    "source_hint": "此信息在PDF中的位置线索（章节名、页码等）"
  }}
]
```

重要：只输出JSON数组，不要输出任何其他文字。

以下是需要提取的PDF内容：

{markdown_content}"""

def extract_events(md_path: str, output_path: str, label: str):
    """Send markdown to LLM and extract events."""
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Clean up: remove image references to save tokens
    content = re.sub(r'!\[.*?\]\(images/.*?\)', '', content)
    # Remove HTML comments
    content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
    # Collapse multiple blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    print(f"\n=== Extracting from: {label} ===")
    print(f"Content length: {len(content)} chars")
    
    # Trim to ~80k chars to stay safe within 156k token context
    if len(content) > 80000:
        content = content[:80000]
        print(f"Trimmed to 80000 chars")
    
    prompt = EXTRACTION_PROMPT.format(
        existing_titles="\n".join(f"- {t}" for t in EXISTING_TITLES),
        markdown_content=content
    )
    
    print(f"Sending to LLM...")
    
    try:
        response = requests.post(
            LLM_URL,
            json={
                "model": LLM_MODEL,
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 32000,  # Large for reasoning model overhead
            },
            timeout=600
        )
        
        if response.status_code != 200:
            print(f"LLM error: {response.status_code}")
            print(response.text[:500])
            return
        
        result = response.json()
        msg = result['choices'][0]['message']
        reply = msg.get('content') or ''
        reasoning = msg.get('reasoning', '')
        finish = result['choices'][0].get('finish_reason', 'unknown')
        usage = result.get('usage', {})
        
        print(f"  finish_reason={finish}, tokens: prompt={usage.get('prompt_tokens',0)}, completion={usage.get('completion_tokens',0)}")
        
        if not reply:
            print("  WARNING: content is null (all tokens used for reasoning?)")
            # Save reasoning for debugging
            debug_path = output_path.replace('.json', '_reasoning.txt')
            with open(debug_path, 'w', encoding='utf-8') as f:
                f.write(f"finish_reason: {finish}\nreasoning:\n{reasoning[:2000]}\n...")
            print(f"  Reasoning saved to {debug_path}")
            return []
        
        # Extract JSON from reply (may have markdown code fences)
        json_start = reply.find('[')
        json_end = reply.rfind(']') + 1
        if json_start >= 0 and json_end > json_start:
            json_str = reply[json_start:json_end]
            try:
                events = json.loads(json_str)
                print(f"  Extracted {len(events)} events")
                
                with open(output_path, 'w', encoding='utf-8') as f:
                    json.dump(events, f, indent=2, ensure_ascii=False)
                
                return events
            except json.JSONDecodeError as je:
                print(f"  JSON parse error: {je}")
                debug_path = output_path.replace('.json', '_raw.txt')
                with open(debug_path, 'w', encoding='utf-8') as f:
                    f.write(reply)
                print(f"  Raw response saved to {debug_path}")
                return []
        else:
            print("  Could not find JSON array in response")
            debug_path = output_path.replace('.json', '_raw.txt')
            with open(debug_path, 'w', encoding='utf-8') as f:
                f.write(reply)
            print(f"  Raw response saved to {debug_path}")
            return []
            
    except Exception as e:
        print(f"Error: {e}")
        return []

# Process each PDF separately
pdfs = [
    ("AI发展历程-完整版.md", "events_ai_dev.json", "AI发展历程-完整版"),
    ("人工智能发展史_从图灵测试到大模型时代.md", "events_ai_history.json", "人工智能发展史"),
]

all_events = []
for md_file, out_file, label in pdfs:
    md_path = os.path.join(RAW_DIR, md_file)
    out_path = os.path.join(OUTPUT_DIR, out_file)
    
    if os.path.exists(out_path):
        print(f"Skipping {label} (already exists)")
        with open(out_path, 'r', encoding='utf-8') as f:
            events = json.load(f)
            all_events.extend(events)
    else:
        events = extract_events(md_path, out_path, label)
        if events:
            all_events.extend(events)

# Merge and deduplicate
print(f"\n=== Merge Results ===")
print(f"Total events before dedup: {len(all_events)}")

# Simple dedup by title
seen_titles = set()
deduped = []
for e in all_events:
    title = e.get('title_zh', '')
    if title and title not in seen_titles:
        seen_titles.add(title)
        deduped.append(e)

print(f"After dedup: {len(deduped)} events")

merged_path = os.path.join(OUTPUT_DIR, "events-draft.json")
with open(merged_path, 'w', encoding='utf-8') as f:
    json.dump(deduped, f, indent=2, ensure_ascii=False)

print(f"Merged events saved to {merged_path}")
