import fitz  # PyMuPDF
import glob
import os

pdf_files = glob.glob('static/assets/certs/*.pdf')

for pdf_path in pdf_files:
    print(f"Processing {pdf_path}...")
    doc = fitz.open(pdf_path)
    page = doc.load_page(0)  # load the first page
    pix = page.get_pixmap(dpi=300) # render page to an image with 300 DPI
    
    # Generate jpeg filename
    base_name = os.path.splitext(pdf_path)[0]
    jpg_path = base_name + '.jpeg'
    
    pix.save(jpg_path)
    print(f"Saved {jpg_path}")
