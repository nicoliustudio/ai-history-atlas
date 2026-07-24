"""Phase 0: Split large PDFs into 8-page chunks for MinerU processing."""
import os
from PyPDF2 import PdfReader, PdfWriter

CHUNK_SIZE = 8  # pages per chunk
OUTPUT_DIR = "data/chunks"
SOURCE_DIR = "."

PDFS = [
    "AI发展历程-完整版.pdf",
    "人工智能发展史_从图灵测试到大模型时代.pdf",
]

os.makedirs(OUTPUT_DIR, exist_ok=True)

for pdf_name in PDFS:
    reader = PdfReader(pdf_name)
    total = len(reader.pages)
    prefix = pdf_name.replace(".pdf", "").replace(" ", "_")[:30]
    
    chunk_count = (total + CHUNK_SIZE - 1) // CHUNK_SIZE
    print(f"\n=== {pdf_name}: {total} pages → {chunk_count} chunks ===")
    
    for i in range(0, total, CHUNK_SIZE):
        writer = PdfWriter()
        end = min(i + CHUNK_SIZE, total)
        for j in range(i, end):
            writer.add_page(reader.pages[j])
        
        chunk_name = f"{prefix}_p{i+1:03d}-p{end:03d}.pdf"
        chunk_path = os.path.join(OUTPUT_DIR, chunk_name)
        with open(chunk_path, "wb") as f:
            writer.write(f)
        
        size_mb = os.path.getsize(chunk_path) / (1024 * 1024)
        print(f"  ✓ {chunk_name} ({end - i} pages, {size_mb:.2f} MB)")

print(f"\nDone! All chunks in {OUTPUT_DIR}/")
