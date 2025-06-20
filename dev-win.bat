@echo off
set NODE_ENV=development
set SKIP_DB_CHECK=true
echo Starting OOF Platform Development Server (Windows Compatible Mode)...
echo Database connection test will be skipped for Windows compatibility
tsx server/index.ts