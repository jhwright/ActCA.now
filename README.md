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

### Netlify function endpoints
After deploy, the functions are available at:
- `/.netlify/functions/log-call`
- `/.netlify/functions/submit-suggestion`

### Suggestion Box Setup

The suggestion box form uses **hCaptcha** for spam protection. To enable it:

1. **Get hCaptcha keys**:
   - Sign up at [hCaptcha](https://www.hcaptcha.com/)
   - Create a site and get your **Site Key** and **Secret Key**

2. **Update the form**:
   - Edit `actca-now/src/pages/suggestion.astro`
   - Replace the test site key `10000000-ffff-ffff-ffff-000000000001` with your real **Site Key** (line ~67)

3. **Set Netlify environment variable**:
   - In Netlify dashboard → Site settings → Environment variables
   - Add: `HCAPTCHA_SECRET_KEY` = your hCaptcha **Secret Key**

4. **Email notifications** (optional):
   - Currently, submissions are logged to Netlify function logs
   - To receive email notifications, uncomment and configure the email sending code in `actca-now/functions/submit-suggestion.js`
   - You can use SendGrid, AWS SES, or Netlify's email service


