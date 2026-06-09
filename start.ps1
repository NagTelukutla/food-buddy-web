# Start frontend dev server (proxies /api to http://127.0.0.1:8080)
Set-Location $PSScriptRoot
if (-not (Test-Path ".\node_modules")) {
    npm install
}
npm run dev
