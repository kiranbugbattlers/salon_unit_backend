#!/bin/bash

# Diagnostic script to check Docker build context
echo "🔍 Docker Build Context Diagnostic"
echo "===================================="
echo ""

# Create a temporary Dockerfile for diagnostics
cat > Dockerfile.diagnostic << 'EOF'
FROM node:20-alpine AS diagnostic

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# List what got copied
RUN echo "=== Files in /app ===" && ls -la
RUN echo "" && echo "=== src directory ===" && ls -la src/ || echo "src/ not found"
RUN echo "" && echo "=== src/common ===" && ls -la src/common/ || echo "src/common/ not found"
RUN echo "" && echo "=== src/common/enums ===" && ls -la src/common/enums/ || echo "src/common/enums/ not found"
RUN echo "" && echo "=== src/common/enums/index.ts content ===" && cat src/common/enums/index.ts || echo "File not found"

# Test TypeScript module resolution
RUN echo "" && echo "=== Testing TypeScript compilation ===" && npx tsc --noEmit || echo "TypeScript compilation failed"
EOF

echo "Building diagnostic Docker image..."
docker build -f Dockerfile.diagnostic -t salon-diagnostic . 2>&1 | tee docker-diagnostic.log

echo ""
echo "📝 Diagnostic log saved to: docker-diagnostic.log"
echo ""
echo "Check the log above for where the issue occurs"

# Clean up
rm -f Dockerfile.diagnostic
