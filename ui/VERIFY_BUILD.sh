#!/bin/bash
echo "🔍 Enterprise UI Build Verification"
echo "=================================="
echo ""

echo "✓ Checking TypeScript..."
npx tsc --noEmit && echo "  TypeScript: ✅ OK (0 errors)" || echo "  TypeScript: ❌ ERRORS"

echo ""
echo "✓ Building for production..."
npm run build > /tmp/build.log 2>&1
if [ $? -eq 0 ]; then
  echo "  Build: ✅ SUCCESS"
  echo ""
  echo "📊 Build Stats:"
  du -sh dist/
  ls -lh dist/assets/ | tail -3
else
  echo "  Build: ❌ FAILED"
  cat /tmp/build.log
fi

echo ""
echo "✓ Dependency check..."
npm list --depth=0 | head -20

echo ""
echo "✓ Type definitions..."
wc -l src/types/index.ts | awk '{print "  " $1 " lines of type definitions"}'

echo ""
echo "✓ Component files..."
find src/components -name "*.tsx" | wc -l | awk '{print "  " $1 " component files"}'

echo ""
echo "✓ Page files..."
find src/pages -name "*.tsx" | wc -l | awk '{print "  " $1 " page files"}'

echo ""
echo "✅ Verification Complete!"
