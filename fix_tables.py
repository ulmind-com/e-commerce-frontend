import os
import glob
import re

files = glob.glob('src/pages/admin/**/*.jsx', recursive=True)

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # If it has a table and isn't already wrapped in overflow-x-auto
    if '<table' in content:
        # Simple replace - we'll just ensure overflow-x-auto is present in the parent
        # A more robust regex: find <table ...> and wrap it if not wrapped.
        
        # Replace <table ...> with <div className="w-full overflow-x-auto"><table ...>
        # and </table> with </table></div>
        
        # To avoid double-wrapping, check if we already did it
        if 'w-full overflow-x-auto' not in content:
            # We'll just replace `<table` and `</table>`
            new_content = re.sub(r'(<table\b[^>]*>)', r'<div className="w-full overflow-x-auto">\n\1', content)
            new_content = re.sub(r'(</table>)', r'\1\n</div>', new_content)
            
            with open(file, 'w') as f:
                f.write(new_content)
            print(f"Fixed table in {file}")

