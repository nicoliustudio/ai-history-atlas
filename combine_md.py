"""Combine chunk markdown files into per-PDF and master files."""
import os

RAW_DIR = "data/raw"

# Collect all MD files (skip _mineru_log.json)
md_files = sorted([f for f in os.listdir(RAW_DIR) if f.endswith('.md')])

# Group by source PDF
groups = {}
for f in md_files:
    # Extract prefix: "AI发展历程-完整版" or "人工智能发展史_从图灵测试到大模型时代"
    prefix = f.rsplit('_p', 1)[0]  
    if prefix not in groups:
        groups[prefix] = []
    groups[prefix].append(f)

for prefix, files in groups.items():
    combined = []
    for f in sorted(files):
        path = os.path.join(RAW_DIR, f)
        with open(path, 'r', encoding='utf-8') as fh:
            content = fh.read()
            combined.append(f"<!-- Chunk: {f} -->\n\n{content}")

    out_name = prefix + ".md"
    out_path = os.path.join(RAW_DIR, out_name)
    with open(out_path, 'w', encoding='utf-8') as fh:
        fh.write('\n\n'.join(combined))
    
    total_chars = sum(len(c) for c in combined)
    print(f"✓ {out_name}: {len(files)} chunks → {total_chars} chars")

# Also create a master combined file
master = []
for f in md_files:
    path = os.path.join(RAW_DIR, f)
    with open(path, 'r', encoding='utf-8') as fh:
        master.append(fh.read())

master_path = os.path.join(RAW_DIR, "_all_combined.md")
with open(master_path, 'w', encoding='utf-8') as fh:
    fh.write('\n\n'.join(master))
print(f"\n✓ _all_combined.md: {len(md_files)} files → {sum(len(m) for m in master)} chars total")
