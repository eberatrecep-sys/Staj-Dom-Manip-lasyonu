import os
import glob

src_dir = "/Users/ekremberatrecep/Desktop/staj/DOM Manipülasyonu/front-end-monorepo/packages/customer-app/src"

replacements = {
    "'#FFFFFF'": "'var(--bg-main)'",
    "'#ffffff'": "'var(--bg-main)'",
    "'white'": "'var(--bg-main)'",
    "'#101828'": "'var(--gray-900)'",
    "'#344054'": "'var(--gray-900)'",
    "'#667085'": "'var(--gray-500)'",
    "'#EAECF0'": "'var(--gray-200)'",
    "'#D0D5DD'": "'var(--gray-200)'",
    "'#F9FAFB'": "'var(--gray-50)'",
    "'#F9F5FF'": "'var(--primary-50)'",
    "'#FCFCFD'": "'var(--bg-main)'",
    "'#7F56D9'": "'var(--primary-700)'"
}

for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            file_path = os.path.join(root, file)
            with open(file_path, "r") as f:
                content = f.read()
            
            modified = False
            for old, new in replacements.items():
                if old in content:
                    content = content.replace(old, new)
                    modified = True
            
            if modified:
                with open(file_path, "w") as f:
                    f.write(content)
                print(f"Updated {file_path}")

print("Done.")
