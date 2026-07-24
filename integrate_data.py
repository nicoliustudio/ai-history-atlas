"""Phase 5: Generate TypeScript code for new events."""
import json
import os

INPUT_PATH = "data/output/enriched-events.json"

EXISTING_KEYWORDS = [
    'mcculloch', 'pitts', 'turing test', 'dartmouth proposal', 'dartmouth workshop',
    'perceptron', 'rosenblatt', 'lighthill', 'backpropagation', 'rumelhart hinton',
    'lenet-5', 'lecun', 'deep blue', 'kasparov', 'imagenet',
    'alexnet', 'generative adversarial', 'gan', 'alphago', 'lee sedol',
    'attention is all you need', 'transformer architecture', 'gpt-1', 'bert',
    'alphafold', 'chatgpt', 'llama open', 'meta releases llama',
    'eu ai act', 'mcp protocol', 'model context protocol',
    'deepseek-r1', 'deepseek r1', 'loop engineering', 'sovereign ai clusters',
]

def is_duplicate(event):
    title = event.get('titleZh', '') + ' ' + event.get('titleEn', '')
    slug = event.get('slug', '')
    return any(kw.lower() in title.lower() or kw.lower() in slug.lower() for kw in EXISTING_KEYWORDS)

with open(INPUT_PATH, 'r', encoding='utf-8') as f:
    events = json.load(f)

new_events = [e for e in events if not is_duplicate(e)]
print(f"New events after dedup: {len(new_events)}")

# Generate TypeScript code
def escape_str(s):
    return s.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n')

def generate_event(e):
    lines = []
    lines.append("  {")
    lines.append(f"    id: '{e['id']}',")
    lines.append(f"    slug: '{e['slug']}',")
    lines.append(f"    titleZh: '{escape_str(e['titleZh'])}',")
    lines.append(f"    titleEn: '{escape_str(e['titleEn'])}',")
    lines.append(f"    dateStart: '{e['dateStart']}',")
    if e.get('dateEnd'):
        lines.append(f"    dateEnd: '{e['dateEnd']}',")
    lines.append(f"    datePrecision: '{e['datePrecision']}',")
    lines.append(f"    eraId: '{e['eraId']}',")
    lines.append(f"    primaryTrack: '{e['primaryTrack']}',")
    lines.append(f"    trackIds: {json.dumps(e['trackIds'])},")
    lines.append(f"    landmarkTier: '{e['landmarkTier']}',")
    lines.append(f"    status: '{e.get('status', 'verified')}',")
    lines.append(f"    summaryZh: '{escape_str(e['summaryZh'])}',")
    lines.append(f"    summaryEn: '{escape_str(e['summaryEn'])}',")
    lines.append(f"    significanceZh: '{escape_str(e['significanceZh'])}',")
    lines.append(f"    significanceEn: '{escape_str(e['significanceEn'])}',")
    if e.get('changedWhatZh'):
        lines.append(f"    changedWhatZh: {json.dumps(e['changedWhatZh'], ensure_ascii=False)},")
    if e.get('changedWhatEn'):
        lines.append(f"    changedWhatEn: {json.dumps(e['changedWhatEn'], ensure_ascii=False)},")
    lines.append(f"    conceptIds: {json.dumps(e.get('conceptIds', []))},")
    lines.append(f"    actorIds: {json.dumps(e.get('actorIds', []))},")
    lines.append(f"    organizationIds: {json.dumps(e.get('organizationIds', []))},")
    
    # Locations
    locs = e.get('locations', [])
    lines.append(f"    locations: [")
    for loc in locs:
        lines.append(f"      {{")
        lines.append(f"        id: '{loc['id']}',")
        lines.append(f"        cityZh: '{escape_str(loc['cityZh'])}',")
        lines.append(f"        cityEn: '{escape_str(loc['cityEn'])}',")
        lines.append(f"        countryCode: '{loc['countryCode']}',")
        lines.append(f"        lng: {loc['lng']},")
        lines.append(f"        lat: {loc['lat']},")
        lines.append(f"        basis: '{loc['basis']}',")
        lines.append(f"        confidence: '{loc['confidence']}',")
        lines.append(f"        evidenceSourceIds: {json.dumps(loc.get('evidenceSourceIds', []))},")
        lines.append(f"      }},")
    lines.append(f"    ],")
    
    lines.append(f"    sourceIds: {json.dumps(e.get('sourceIds', []))},")
    
    scoring = e.get('scoring', {})
    lines.append(f"    scoring: {{")
    lines.append(f"      originality: {scoring.get('originality', 3)},")
    lines.append(f"      impact: {scoring.get('impact', 3)},")
    lines.append(f"      globalReach: {scoring.get('globalReach', 3)},")
    lines.append(f"      societalEffect: {scoring.get('societalEffect', 3)},")
    lines.append(f"      evidenceReliability: {scoring.get('evidenceReliability', 4)},")
    lines.append(f"      historicalIndependence: {scoring.get('historicalIndependence', 4)},")
    lines.append(f"    }},")
    
    lines.append(f"    featured: false,")
    lines.append(f"    storyChapterIds: {json.dumps(e.get('storyChapterIds', []))},")
    lines.append(f"    firstPublishedAt: '2026-07-24',")
    lines.append(f"    lastReviewedAt: '2026-07-24',")
    lines.append(f"    reviewedBy: ['AI Editorial Team'],")
    lines.append(f"    dataVersion: '1.0.0',")
    lines.append(f"  }},")
    return '\n'.join(lines)

# Generate code for all new events
ts_code = "  // === NEW EVENTS FROM PDF EXTRACTION ===\n"
for e in new_events:
    ts_code += generate_event(e) + "\n\n"

output_path = "data/output/new-events.ts.txt"
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(ts_code)

print(f"TypeScript code generated: {output_path}")
print(f"\nEvent list:")
for e in new_events:
    print(f"  [{e['dateStart'][:4]}] {e['titleZh'][:60]} ({e['landmarkTier']}-Tier)")
