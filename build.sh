#!/bin/bash

# 디버깅을 위한 설정
set -e
set -x

# 현재 디렉토리 확인
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Node.js 및 npm 버전 확인
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# 의존성 설치
echo "Installing dependencies..."
npm ci

# 빌드 실행
echo "Building project..."
npx vite build

# 빌드 결과 확인
echo "Build output:"
ls -la dist

echo "Build completed successfully!" 