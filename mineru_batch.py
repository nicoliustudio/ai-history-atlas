"""Phase 1: Batch MinerU OCR processing of PDF chunks."""
import os
import time
import json
import requests

MINERU_URL = "http://192.168.0.183:7089/api/tools/MinerUOCR"
CHUNKS_DIR = "data/chunks"
OUTPUT_DIR = "data/raw"
TIMEOUT = 600  # seconds per chunk
DELAY_BETWEEN = 3  # seconds between requests

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Collect all chunk files sorted
chunk_files = sorted([
    f for f in os.listdir(CHUNKS_DIR) if f.endswith('.pdf')
])

print(f"Found {len(chunk_files)} chunks to process")

results = []
for idx, chunk_name in enumerate(chunk_files):
    chunk_path = os.path.join(CHUNKS_DIR, chunk_name)
    file_size = os.path.getsize(chunk_path) / (1024 * 1024)
    
    output_md = os.path.join(OUTPUT_DIR, chunk_name.replace('.pdf', '.md'))
    
    # Skip if already processed
    if os.path.exists(output_md):
        print(f"[{idx+1}/{len(chunk_files)}] SKIP (exists): {chunk_name}")
        with open(output_md, 'r', encoding='utf-8') as f:
            results.append({
                'chunk': chunk_name,
                'size_mb': round(file_size, 2),
                'status': 'cached',
                'parse_doc': f.read()
            })
        continue
    
    print(f"[{idx+1}/{len(chunk_files)}] Processing: {chunk_name} ({file_size:.2f} MB)...", end=' ', flush=True)
    
    try:
        t0 = time.time()
        with open(chunk_path, 'rb') as f:
            response = requests.post(
                MINERU_URL,
                files={"file": (chunk_name, f, "application/pdf")},
                data={"backend": "vlm-http-client", "rtype": "MarkDown"},
                timeout=TIMEOUT
            )
        elapsed = time.time() - t0
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                parse_doc = data.get('parse_doc', '')
                # Save markdown
                with open(output_md, 'w', encoding='utf-8') as f:
                    f.write(parse_doc)
                print(f"OK ({elapsed:.0f}s, {len(parse_doc)} chars)")
                results.append({
                    'chunk': chunk_name,
                    'size_mb': round(file_size, 2),
                    'status': 'success',
                    'elapsed_s': round(elapsed, 1),
                    'chars': len(parse_doc)
                })
            else:
                print(f"FAIL: success=false, message={data.get('message')}")
                results.append({
                    'chunk': chunk_name,
                    'size_mb': round(file_size, 2),
                    'status': 'api_error',
                    'message': data.get('message', 'unknown')
                })
        else:
            print(f"FAIL: HTTP {response.status_code}")
            results.append({
                'chunk': chunk_name,
                'size_mb': round(file_size, 2),
                'status': f'http_{response.status_code}'
            })
    except requests.Timeout:
        print(f"TIMEOUT after {TIMEOUT}s")
        results.append({'chunk': chunk_name, 'size_mb': round(file_size, 2), 'status': 'timeout'})
    except Exception as e:
        print(f"ERROR: {e}")
        results.append({'chunk': chunk_name, 'size_mb': round(file_size, 2), 'status': str(e)[:100]})
    
    # Delay between requests
    if idx < len(chunk_files) - 1:
        time.sleep(DELAY_BETWEEN)

# Save processing log
log_path = os.path.join(OUTPUT_DIR, '_mineru_log.json')
with open(log_path, 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

# Summary
success = sum(1 for r in results if r['status'] in ('success', 'cached'))
failed = len(results) - success
print(f"\n=== MinerU Processing Complete ===")
print(f"Total: {len(results)}, Success: {success}, Failed: {failed}")
print(f"Log saved to: {log_path}")
