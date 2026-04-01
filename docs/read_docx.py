import sys
import zipfile
import xml.etree.ElementTree as ET

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.XML(xml_content)
            
            # Extract all text from w:t nodes
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            text_nodes = tree.findall('.//w:t', namespaces)
            paragraphs = tree.findall('.//w:p', namespaces)
            
            full_text = []
            for p in paragraphs:
                texts = p.findall('.//w:t', namespaces)
                if texts:
                    full_text.append(''.join(t.text for t in texts if t.text))
            
            return '\n'.join(full_text)
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python script.py <input.docx> <output.txt>")
        sys.exit(1)
        
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    text = extract_text_from_docx(input_file)
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Done")
