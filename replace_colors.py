import sys

file_path = "/Users/ekremberatrecep/Desktop/staj/DOM Manipülasyonu/front-end-monorepo/packages/customer-app/src/features/shopping-list/components/ShoppingForm.tsx"

with open(file_path, "r") as f:
    content = f.read()

replacements = {
    "'#FFFFFF'": "'var(--bg-main)'",
    "'#ffffff'": "'var(--bg-main)'",
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

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, "w") as f:
    f.write(content)

print("Replaced colors successfully.")
