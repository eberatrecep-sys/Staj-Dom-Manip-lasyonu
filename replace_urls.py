import os
import glob
import re

directories = [
    '/var/www/MyShoppingApp/front-end-monorepo/packages/customer-app/src',
    '/var/www/MyShoppingApp/front-end-monorepo/packages/admin-panel/src'
]

for directory in directories:
    for filepath in glob.glob(f'{directory}/**/*.tsx', recursive=True) + glob.glob(f'{directory}/**/*.ts', recursive=True):
        if not os.path.isfile(filepath): continue
        with open(filepath, 'r') as f:
            content = f.read()
        
        new_content = re.sub(
            r"(['\"])http://localhost:5050/api/v1(/.*?)\1",
            r"import.meta.env.VITE_API_URL + '\2'",
            content
        )
        
        new_content = re.sub(
            r"`http://localhost:5050/api/v1(/.*?)`",
            r"`${import.meta.env.VITE_API_URL}\1`",
            new_content
        )

        new_content = re.sub(
            r"(['\"])http://localhost:5050/api(/.*?)\1",
            r"`${import.meta.env.VITE_API_URL}\2`",
            new_content
        )

        if new_content != content:
            with open(filepath, 'w') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
