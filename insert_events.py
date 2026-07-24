"""Insert new events into events.ts"""
# Read the new events code
with open('data/output/new-events.ts.txt', 'r', encoding='utf-8') as f:
    new_code = f.read()

# Read existing events.ts
with open('src/data/events.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Insert new events before the closing ];
# Find the last ];
last_bracket = content.rfind('];')
if last_bracket > 0:
    # Find the line start of ];
    line_start = content.rfind('\n', 0, last_bracket) + 1
    new_content = content[:line_start] + new_code + '\n];'
    
    with open('src/data/events.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("Successfully inserted new events into events.ts")
    print(f"Original file: {len(content)} chars")
    print(f"New file: {len(new_content)} chars")
else:
    print("ERROR: Could not find ]; in events.ts")
