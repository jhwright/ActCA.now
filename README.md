## ActCA.now (Astro) — Deploy to Netlify via GitHub

### What you have
- **App directory**: `actca-now/`
- **Netlify config**: `netlify.toml` (repo root, with `base = "actca-now"`)
- **Build output**: `actca-now/dist/`
- **Netlify Functions**: `actca-now/functions/`

### Deploy (GitHub → Netlify)
1. **Push to GitHub**
   - Create a GitHub repo and push this repository (the folder that contains `netlify.toml`).
2. **Create a Netlify site from Git**
   - Netlify dashboard → **Add new site** → **Import an existing project**
   - Connect GitHub, pick the repo, choose the branch (e.g. `main`)
3. **Build settings**
   - These are configured by `netlify.toml`, but you can confirm:
     - **Base directory**: `actca-now`
     - **Build command**: `npm run build`
     - **Publish directory**: `actca-now/dist` (Netlify will show `dist` when base dir is set)
     - **Functions directory**: `actca-now/functions` (Netlify will show `functions` when base dir is set)
4. **Deploy**
   - Netlify will deploy on first import, then redeploy automatically on every push to the configured branch.

### Local dev
From `actca-now/`:

```bash
npm install
npm run dev
```

### Netlify function endpoint
After deploy, the function is available at:
- `/.netlify/functions/log-call`


