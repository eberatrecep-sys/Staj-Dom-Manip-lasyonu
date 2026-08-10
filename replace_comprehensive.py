import os
import re

src_dirs = [
    "/Users/ekremberatrecep/Desktop/staj/DOM Manipülasyonu/front-end-monorepo/packages/customer-app/src",
    "/Users/ekremberatrecep/Desktop/staj/DOM Manipülasyonu/front-end-monorepo/packages/admin-panel/src"
]

color_map = {
    r'#ffffff': 'var(--bg-main)',
    r'#101828': 'var(--gray-900)',
    r'#344054': 'var(--gray-900)',
    r'#667085': 'var(--gray-500)',
    r'#eaecf0': 'var(--gray-200)',
    r'#d0d5dd': 'var(--gray-200)',
    r'#d6bbfb': 'var(--primary-700)',
    r'#f9fafb': 'var(--gray-50)',
    r'#f9f5ff': 'var(--primary-50)',
    r'#fcfcfd': 'var(--bg-main)',
    r'#7f56d9': 'var(--primary-700)',
    r'#9e77ed': 'var(--primary-700)',
    r'#fee4e2': 'var(--gray-50)', # light red replaced with gray-50 for now or bg-main
    r'#d92d20': 'var(--gray-900)' # red
}

for src_dir in src_dirs:
    for root, _, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                file_path = os.path.join(root, file)
                with open(file_path, "r") as f:
                    content = f.read()
                
                original_content = content
                
                # Replace colors using regex (case insensitive)
                for hex_color, css_var in color_map.items():
                    # We match the hex code, ensuring it's not already part of a var or something
                    pattern = re.compile(hex_color, re.IGNORECASE)
                    content = pattern.sub(css_var, content)
                
                # Fix inputs and textareas which might need background: transparent and color: inherit
                # A bit hacky but we'll add `backgroundColor: 'transparent', color: 'inherit', ` before `border:` in style objects
                content = content.replace("border: '1px solid var(--gray-200)'", "backgroundColor: 'transparent', color: 'inherit', border: '1px solid var(--gray-200)'")
                
                if content != original_content:
                    with open(file_path, "w") as f:
                        f.write(content)
                    print(f"Updated {file_path}")

print("Done comprehensive color replacement.")
