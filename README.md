# Letter Dandelion

Immersive full-screen interactive 3D dandelion farewell poster built with p5.js.

## Local Preview

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:8765/
```

## Public Preview Link

This project is a static site. Deploy the whole folder to any static hosting service:

- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages

Current GitHub Pages preview:

```text
https://dawncuius-ux.github.io/letter-dandelion-v4/?v=V5.1
```

The deploy root must include:

- `index.html`
- `style.css`
- `sketch.js`
- `noise.jpg`
- `p5.min.js`

After deployment, share the generated public URL.

## Same Wi-Fi Preview

If the recipient is on the same network, run:

```bash
python3 -m http.server 8765 --bind 0.0.0.0
```

Then share:

```text
http://YOUR_LAN_IP:8765/
```

Replace `YOUR_LAN_IP` with your computer's local network IP.
