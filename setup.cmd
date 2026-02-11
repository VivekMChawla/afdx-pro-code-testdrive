@echo off
REM Entry point for the AFDX setup script (Windows).
REM Installs Node dependencies on first run, then invokes the setup script.

REM Install dependencies if node_modules doesn't exist.
if not exist "scripts\js\node_modules" (
  echo Initializing Setup...
  npm install --prefix scripts/js > NUL 2>&1
  npm audit fix --prefix scripts/js > NUL 2>&1
)

REM Run the setup script, passing through all arguments.
node scripts\js\setup.mjs %*
