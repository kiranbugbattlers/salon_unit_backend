#!/bin/bash

# Diagnostic script to check file structure on server
echo "🔍 Diagnostic Check on Server"
echo "=============================="
echo ""

echo "1. Checking if src/common/enums/index.ts exists:"
if [ -f "src/common/enums/index.ts" ]; then
    echo "✅ File exists"
    echo "File size: $(wc -c < src/common/enums/index.ts) bytes"
    echo "First 10 lines:"
    head -10 src/common/enums/index.ts
else
    echo "❌ File NOT found"
fi
echo ""

echo "2. Checking directory structure:"
ls -la src/common/ 2>/dev/null || echo "src/common/ not found"
echo ""

echo "3. Checking enums directory:"
ls -la src/common/enums/ 2>/dev/null || echo "src/common/enums/ not found"
echo ""

echo "4. Checking file encoding:"
file src/common/enums/index.ts 2>/dev/null || echo "Cannot check file type"
echo ""

echo "5. Checking if there are any special characters or BOM:"
hexdump -C src/common/enums/index.ts | head -5 2>/dev/null || echo "Cannot check hex dump"
echo ""

echo "6. Testing TypeScript compilation of a simple import:"
cat > /tmp/test-import.ts << 'EOF'
import { Gender } from './src/common/enums';
console.log(Gender);
EOF

npx tsc --noEmit /tmp/test-import.ts 2>&1 || echo "Import test completed"
rm -f /tmp/test-import.ts
echo ""

echo "7. Checking tsconfig.json:"
if [ -f "tsconfig.json" ]; then
    echo "✅ tsconfig.json exists"
    grep -A 5 "moduleResolution" tsconfig.json || echo "No moduleResolution found"
else
    echo "❌ tsconfig.json NOT found"
fi
