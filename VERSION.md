# Letter Dandelion V5.1

Date: 2026-06-03

V5.1 is the saved baseline for the immersive full-screen interactive 3D farewell dandelion poster with improved mobile readability.

## Source

- `index.html`
- `style.css`
- `sketch.js`
- `noise.jpg`
- `p5.min.js`

## Stability

- Version: `POSTER_VERSION = "V5.1"`
- Random seed: `POSTER_RANDOM_SEED = 20260603`
- The scene is seed-locked so refreshes keep the same generated composition.

## Visual Baseline

- Full-screen immersive canvas using the entire browser viewport.
- Mobile view uses dynamic viewport height and a short-side scene unit to keep the flower ball readable.
- Mobile view enlarges the flower ball slightly, reduces core overexposure, and raises name contrast.
- Clean blue gradient background with soft lower mist.
- A static `noise.jpg` overlay uses `soft-light` at `20%` opacity for a retro grain texture.
- 294 filaments are distributed on a real 3D sphere using golden-angle sampling.
- The flower ball is centered lower than V3 for a more balanced composition.
- 64 ambient seeds drift away from the flower by default.
- Filament tips include subtle fluff and a softened terminal glow.
- The flower ball gently sways in the wind by default.
- Hovering a name highlights that name filament while dimming the rest of the flower.
- Clicking a name opens a centered message window with a `收下` button.
- Clicking `收下` fades the window and releases that name filament with a slower wind-drift animation.
- Left-button horizontal dragging rotates the flower ball around the vertical axis.
- 20 clickable placeholder names are positioned in the same 3D sphere and rotate with the flower.
- Other filament tips use single Chinese or English characters.

## Performance Notes

- `RENDER_CONFIG` centralizes pixel density and frame rate.
- Max pixel density is capped at `1.5` to reduce high-DPI rendering cost.
- Frame rate is set to `45` for smoother interaction without forcing full 60 FPS.
- The sky, wash, mist, and grain are pre-rendered into cached layers.
- The temporary wash graphics layer is released after static background composition.
- Terminal and core glow are pre-rendered sprites rather than per-frame canvas blur.
- Drag handlers avoid extra `redraw()` calls because the sketch already runs continuously.
- The noise overlay is handled by CSS instead of p5, so it does not add per-frame canvas work.
- `p5.min.js` is vendored locally to avoid CDN access failures on corporate networks.

## Sharing Preview Links

- Local file links such as `file:///.../index.html` only work on your own machine.
- For someone on the same Wi-Fi, run a local server and share your LAN address, for example `http://YOUR_LAN_IP:8765/`.
- For a stable public link, deploy the folder to GitHub Pages, Vercel, Netlify, or Cloudflare Pages.
- This is a static site, so no build step is required. The deploy root should contain `index.html`, `style.css`, `sketch.js`, `noise.jpg`, and `p5.min.js`.

## History

- V1: fixed 16:9 non-glow dandelion poster with seed-locked 2D composition.
- V2: upgrades the flower ball to true 3D spherical distribution with drag rotation.
- V3: adds wind, hover, message, release interactions, glow, ambient seeds, and retro noise.
- V4: saves the centered blue-noise composition, slows the release animation, and improves render performance.
- V5: removes the fixed 16:9 board, expands the scene to full screen, improves mobile sizing, and doubles ambient drifting seeds.
- V5.1: improves mobile readability with a larger flower ball, lower core glow, lighter terminal glow, and stronger name contrast.

## Next Iteration Notes

- Replace `NAME_PLACEHOLDERS` and message text when the final colleague list is ready.
- If the flower feels too sparse or too dense, tune `RAY_COUNT`.
- If terminal glow feels too bright, tune `TERMINAL_STYLE.glowAlpha`.
- If rotation feels too fast or slow, tune `ROTATION.dragSensitivity`.
- If the wind feels too active, tune `WIND.swayAmp` and `WIND.swaySpeed`.
- If release motion feels too slow or fast, tune `RELEASE.duration`.
