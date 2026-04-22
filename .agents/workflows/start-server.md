---
description: Start the Warehouse OS development servers (API + Frontend)
---

# Start Warehouse OS Dev Servers

// turbo-all

1. Set up PATH and start both servers:
```
$env:Path = "C:\Users\huongcv\nodejs\node-v22.16.0-win-x64;C:\Program Files\Git\cmd;$env:Path"; cmd /c "npx concurrently -n API,UI -c blue,green ""node server/server.js"" ""npx vite"""
```
Run from: `c:\Users\huongcv\.gemini\antigravity\playground\shining-comet`

2. Verify the servers are running:
   - Frontend: `http://localhost:5173`
   - API: `http://localhost:3001/api/inventory`

## Alternative: Double-click startup
You can also double-click `START_SERVER.bat` in the project folder to start both servers.

## Individual Servers
- API only: `node server/server.js` (port 3001)
- Frontend only: `npx vite` (port 5173)
