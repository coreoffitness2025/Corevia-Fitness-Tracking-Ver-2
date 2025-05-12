#!/bin/bash

# 종속성 설치
npm ci

# 빌드 실행
npm run build

# 종료 코드 반환
exit $? 