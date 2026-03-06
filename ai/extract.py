import sys
try:
    import pypdf
except ImportError:
    print("pypdf not installed")
    sys.exit(1)

for pdf_file in ["u4.pdf", "Untitled 2.pdf", "prompt for data.pdf"]:
    try:
        reader = pypdf.PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        with open(pdf_file + ".txt", "w", encoding="utf-8") as f:
            f.write(text)
        print(f"Extracted {pdf_file}")
    except Exception as e:
        print(f"Error extracting {pdf_file}: {e}")
