# Dashboard

The main web-based interface for the tracking system.

## Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **No build tools, frameworks, or dependencies** — pure client-side web technologies
- **Backend**: FastAPI (Python) — see `api/server.py`

## Installation & Dependencies

### Dashboard Frontend

**No installation required.** The dashboard is pure HTML/CSS/JavaScript with zero dependencies. All files are self-contained and inline.

### Backend Setup

The dashboard is served by the FastAPI backend. To set it up:

```bash
# Install Python dependencies (from project root)
python -m pip install -r requirements.txt
```

That's it. No additional dashboard-specific setup needed.

## Starting the Dashboard

1. **Start the API server** (from project root):
   ```bash
   python api/server.py
   ```

2. **Open your browser** to:
   ```
   http://localhost:8000
   ```

The server runs on `http://localhost:8000/` by default. All dashboard files are served from the root path.

## Backend API Endpoints Expected

The dashboard connects to the following backend endpoints, all hosted on the same server:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/zones` | GET | Fetch all defined zones |
| `/api/zones` | POST | Save/update zones |
| `/api/rules` | GET | Fetch all rules |
| `/api/rules` | POST | Save/update rules |
| `/api/events` | GET | Fetch all events |
| `/api/events/delete/{index}` | DELETE | Delete a single event |
| `/api/events/clear` | DELETE | Clear all events |
| `/api/health` | GET | Check device/system health |
| `/ws/live` | WebSocket | Live camera feed stream (JSON frames) |
| `/media/{filename}` | GET | Access recorded video clips |

**Base URL**: `http://localhost:8000`

All requests use relative paths, so the dashboard works with any hostname/port the backend runs on.

## Dashboard Pages

- **`index.html`** - Main dashboard home with navigation to all tools
- **`zone_editor.html`** - Interactive zone drawing and management
- **`rule_editor.html`** - Rule configuration (count, posture, actions)
- **`event_viewer.html`** - Event log and video playback
- **`onboarding.html`** - First-run setup wizard

## Features

### Zone Editor
- Draw polygons by clicking to place points
- Double-click to finalize zone
- Right-click to undo last point
- Select multiple zones with Shift+Drag
- Delete selected zones
- Save all zones to server config

### Rule Editor
- Create rules based on:
  - Object count (`count_gt`)
  - Posture detection (`posture_eq`, `posture_in`)
- Specify minimum duration in posture
- Set actions (alert, record, both) per zone
- Save rules to server config

### Event Viewer
- Real-time event log display
- Play or export video clips
- Delete individual events or clear all
- Auto-refresh every 5 seconds

### Onboarding Wizard
- **Step 1**: Verify device health via `/api/health`
- **Step 2**: Live camera feed preview via WebSocket
- **Step 3**: Draw first zone interactively
- Saves zone immediately to server config

## Architecture

All HTML files are **self-contained** with **inline CSS and JavaScript**. This means:
- No build process required
- No npm/package manager needed
- Edit HTML files directly in any text editor
- Changes take effect immediately (just refresh browser)

The FastAPI backend (`api/server.py`) handles:
- Static file serving from this `Dashboard/` folder
- REST API endpoints for zones, rules, events
- WebSocket stream for live camera feed
- Health status checks

## Configuration Files

Configuration is stored server-side in `config/`:
- `config/zones.json` — Zone definitions
- `config/rules.json` — Rule definitions
- `config/events.json` — Event log
- `config/posture.yaml` — Posture model settings

The dashboard reads/writes these via the backend API.

## Troubleshooting

**"Cannot connect to server"**
- Ensure `python api/server.py` is running
- Check that port 8000 is not in use: `netstat -an | findstr :8000` (Windows)
- Try visiting http://localhost:8000 directly in browser

**"Live camera feed not working"**
- Ensure WebSocket is available at `/ws/live`
- Check that the vision pipeline is running (see main project `final.py`)
- Browser console may show WebSocket connection errors

**"API endpoints not found"**
- Verify `api/server.py` is serving with no startup errors
- Check logs for path/config errors

For more details, see the main [Documentation/README.md](../Documentation/README.md).
