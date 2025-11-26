# Fighting-Game

A small browser-based 2D fighting game demo built with HTML5 Canvas and plain JavaScript.

What it is
- A minimal local demo that renders two fighters on a canvas, handles basic movement, jumping and attacking, and detects collisions to reduce health.
- Uses sprite sheets in `Fighting-Game/img/` for simple frame-based animations.

Tech stack
- HTML, CSS (inline), JavaScript (ES6)
- HTML5 Canvas 2D API for rendering

How to run
- Quick (no server): open `Fighting-Game/index.html` in your browser. Some browsers may block loading local images when opened via the file:// protocol — if something looks missing, use a local static server.
- Recommended (using npm):

```powershell
npm install
npm start
```

Then open http://localhost:8080/ — the `start` script now serves the `Fighting-Game` folder directly, so the game page will load immediately.

Quick open (PowerShell):

```powershell
Start-Process 'http://localhost:8080/'
```

If you prefer the server to serve the repo root (showing an index of folders), the start script can be changed back. Serving the `Fighting-Game` folder avoids needing to navigate to `/Fighting-Game/index.html` in the browser.

Controls
- Player 1 (left): A (left), D (right), W (jump), Space (attack)
- Player 2 (right): ArrowLeft (left), ArrowRight (right), ArrowUp (jump), ArrowDown (attack)

Files of interest
- `Fighting-Game/index.html` — page markup and UI elements (health bars, timer)
- `Fighting-Game/index.js` — game loop, input handling and initialization
- `Fighting-Game/js/classes.js` — `sprite` and `Fighter` class implementations
- `Fighting-Game/js/utils.js` — collision detection, winner logic and timer