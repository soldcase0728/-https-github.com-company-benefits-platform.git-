#!/bin/bash

echo "🔍 Scanning and fixing all package.json files..."
echo ""

# Find all package.json files (excluding node_modules)
for pkg_file in $(find . -name "package.json" -not -path "*/node_modules/*"); do
    echo "Checking: $pkg_file"
    
    # Check if file has a version field
    if ! grep -q '"version"' "$pkg_file"; then
        echo "  ⚠️  Missing version field - adding it"
        # Add version after name field
        sed -i '/"name":/a\  "version": "1.0.0",' "$pkg_file" 2>/dev/null || \
        sed -i '' '/"name":/a\  "version": "1.0.0",' "$pkg_file" 2>/dev/null
    fi
    
    # Check for empty version
    if grep -q '"version":\s*""' "$pkg_file"; then
        echo "  ⚠️  Empty version - fixing it"
        sed -i 's/"version":\s*""/"version": "1.0.0"/' "$pkg_file" 2>/dev/null || \
        sed -i '' 's/"version":\s*""/"version": "1.0.0"/' "$pkg_file" 2>/dev/null
    fi
    
    # Check for invalid characters in version
    if grep -q '"version":\s*"[^"]*[^0-9.\-a-zA-Z][^"]*"' "$pkg_file"; then
        echo "  ⚠️  Invalid version format - fixing it"
        sed -i 's/"version":\s*"[^"]*"/"version": "1.0.0"/' "$pkg_file" 2>/dev/null || \
        sed -i '' 's/"version":\s*"[^"]*"/"version": "1.0.0"/' "$pkg_file" 2>/dev/null
    fi
    
    # Show current version
    version=$(grep '"version"' "$pkg_file" | head -1)
    echo "  ✓ Version: $version"
done

echo ""
echo "✅ All package.json files checked"