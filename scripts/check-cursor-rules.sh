#!/bin/bash

echo "🔍 Checking Cursor Rules alwaysApply settings..."

# .cursor/rules 디렉토리 존재 확인
if [ ! -d ".cursor/rules" ]; then
    echo "❌ .cursor/rules directory not found"
    exit 1
fi

# alwaysApply: true가 설정된 파일 개수 확인
count=$(find .cursor/rules -name "*.mdc" -exec grep -l "alwaysApply: true" {} \; | wc -l)

if [ $count -gt 0 ]; then
    echo "✅ Found $count files with alwaysApply: true"
else
    echo "❌ No files with alwaysApply: true found"
    exit 1
fi

# 각 파일의 내용 확인
for file in .cursor/rules/*.mdc; do
    if [ -f "$file" ]; then
        # 파일 길이 확인 (최소 5줄)
        lines=$(wc -l < "$file")
        if [ $lines -lt 5 ]; then
            echo "❌ $file is too short (less than 5 lines)"
            exit 1
        fi

        # alwaysApply: true가 헤더에 있는지 확인
        if ! head -3 "$file" | grep -q "alwaysApply: true"; then
            echo "❌ $file missing alwaysApply: true in header"
            exit 1
        fi

        echo "✅ $file has correct format and content"
    fi
done

echo "🎉 All Cursor Rules checks passed!"
