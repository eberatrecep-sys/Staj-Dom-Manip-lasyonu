const fs = require('fs');
const path = require('path');

const filesToProcess = [
    'src/features/currency/components/CurrencyWidget.tsx',
    'src/index.css',
    '../shopping-backend/src/index.ts',
    'src/features/admin/components/AdminDashboard.tsx',
    'src/features/auth/components/ResetPasswordForm.tsx',
    'src/features/shopping-list/components/ShoppingForm.tsx',
    'src/App.tsx'
];

function cleanComments(content, ext) {
    let newContent = content;

    // For CSS files, remove all /* ... */
    if (ext === '.css') {
        newContent = newContent.replace(/\/\*[\s\S]*?\*\//g, '');
    }
    // For TS/TSX files
    else {
        // Remove // comments except URLs (http:// or https://)
        // Also skip comments with @ts-ignore, eslint, generated
        newContent = newContent.replace(/(?<!:)\/\/([^\n]*)/g, (match, p1) => {
            const text = p1.toLowerCase();
            if (text.includes('eslint') || text.includes('ts-ignore') || text.includes('istanbul') || text.includes('generated using')) {
                return match;
            }
            return '';
        });

        // Remove JSX block comments {/* ... */}
        newContent = newContent.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

        // Remove JS block comments /* ... */
        newContent = newContent.replace(/\/\*[\s\S]*?\*\//g, (match) => {
            const text = match.toLowerCase();
            if (text.includes('eslint') || text.includes('ts-ignore') || text.includes('istanbul') || text.includes('generated using')) {
                return match;
            }
            return '';
        });
    }

    // Clean up excessive empty lines left by comment removal
    newContent = newContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    return newContent;
}

filesToProcess.forEach(file => {
    const fullPath = path.resolve(__dirname, file);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const ext = path.extname(fullPath);
        const cleaned = cleanComments(content, ext);
        fs.writeFileSync(fullPath, cleaned, 'utf8');
        console.log(`Cleaned comments from ${file}`);
    }
});
