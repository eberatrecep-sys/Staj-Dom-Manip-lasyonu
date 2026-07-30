import os
import glob

for filepath in glob.glob('/Users/ekremberatrecep/Desktop/staj/DOM Manipülasyonu/react-enterprise-app/src/**/*.ts*', recursive=True):
    if not os.path.isfile(filepath): continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content.replace('http://localhost:5050/api/', 'http://localhost:5050/api/v1/')
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
