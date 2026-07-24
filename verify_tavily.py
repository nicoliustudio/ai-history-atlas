"""Phase 3: Tavily cross-verification of extracted events."""
import json
import os
import time
import requests

TAVILY_URL = "https://api.tavily.com/search"
TAVILY_KEY = "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"
INPUT_PATH = "data/intermediate/events-draft.json"
OUTPUT_PATH = "data/intermediate/events-verified.json"

def search_tavily(query: str, max_results: int = 3):
    """Search Tavily and return results."""
    try:
        r = requests.post(TAVILY_URL, json={
            'api_key': TAVILY_KEY,
            'query': query,
            'max_results': max_results,
            'search_depth': 'basic',
        }, timeout=15)
        if r.status_code == 200:
            data = r.json()
            return data.get('results', [])
        return []
    except Exception as e:
        print(f"  Tavily error: {e}")
        return []

# Load events
with open(INPUT_PATH, 'r', encoding='utf-8') as f:
    events = json.load(f)

print(f"Loaded {len(events)} events for verification\n")

verified = []
for idx, event in enumerate(events):
    title = event.get('title_zh', event.get('title_en', ''))
    year = event.get('date', '')[:4]
    
    print(f"[{idx+1}/{len(events)}] {title[:60]}...")
    
    # Search query: title + year + key terms
    query = f"{title} {year}"
    results = search_tavily(query)
    
    verification = {
        'event_title': title,
        'searched_query': query,
        'results_count': len(results),
        'confirmed_date': None,
        'confirmed_location': None,
        'coordinates': None,
        'source_urls': [],
        'extra_facts': [],
        'data_quality': 'unverified'
    }
    
    if results:
        # Extract useful info from top results
        top = results[0]
        verification['source_urls'] = [r.get('url', '') for r in results[:3] if r.get('url')]
        verification['extra_facts'] = [r.get('content', '')[:300] for r in results[:2] if r.get('content')]
        verification['data_quality'] = 'verified_via_tavily'
    
    event['_verification'] = verification
    verified.append(event)
    
    # Small delay between requests
    time.sleep(0.5)

# Save
with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
    json.dump(verified, f, indent=2, ensure_ascii=False)

print(f"\nSaved {len(verified)} verified events to {OUTPUT_PATH}")
