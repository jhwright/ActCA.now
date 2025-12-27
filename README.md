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

## Google Sheets API Setup

To enable phone number click tracking, you need to set up Google Sheets API authentication.

### Step 1: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services** → **Library**
4. Search for "Google Sheets API"
5. Click on it and press **Enable**

### Step 2: Create a Service Account

1. In Google Cloud Console, go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **Service account**
3. Fill in the service account details:
   - **Service account name**: `actca-sheets-writer` (or any name you prefer)
   - **Service account ID**: Auto-generated (you can change it)
   - Click **CREATE AND CONTINUE**
4. Skip the optional steps (Grant access, Grant users access) and click **DONE**

### Step 3: Create and Download Service Account Key

1. In the **Credentials** page, find your newly created service account
2. Click on the service account email to open its details
3. Go to the **KEYS** tab
4. Click **ADD KEY** → **Create new key**
5. Choose **JSON** format
6. Click **CREATE** - this will download a JSON file to your computer
7. **Important**: Keep this file secure! It contains credentials that allow access to your Google Sheets.

### Step 4: Share Google Sheet with Service Account

1. Open or create a Google Sheet where you want to store click data
2. Click the **Share** button (top right)
3. Copy the **service account email** from the JSON file you downloaded (it's the `client_email` field)
4. Paste it in the "Add people and groups" field
5. Give it **Editor** permissions
6. Click **Share**
7. Copy the **Spreadsheet ID** from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - The `SPREADSHEET_ID` is the long string between `/d/` and `/edit`

### Step 5: Configure Netlify Environment Variables

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:

   **Option A: Using the full JSON key (Recommended)**
   - Variable name: `GOOGLE_SERVICE_ACCOUNT_KEY`
   - Value: Open the downloaded JSON file, copy its entire contents (including all braces and quotes), and paste it here
   - **Note**: The JSON should be valid JSON format. Netlify will store it as a string, and the code will parse it automatically

   **Option B: Using individual credentials**
   - Variable name: `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - Value: The `client_email` value from your JSON file
   - Variable name: `GOOGLE_PRIVATE_KEY`
   - Value: The `private_key` value from your JSON file (keep the `\n` characters)

4. Add the spreadsheet configuration:
   - Variable name: `GOOGLE_SHEETS_SPREADSHEET_ID`
   - Value: The Spreadsheet ID you copied in Step 4
   - Variable name: `GOOGLE_SHEETS_SHEET_NAME` (optional)
   - Value: The sheet/tab name (defaults to "Events" if not set)

5. Click **Save** for each variable

### Step 6: Verify Setup

1. The Google Sheet should have a tab named "Events" (or your custom name)
2. The first row will automatically be populated with headers: `timestamp`, `phone`, `targetID`, `eventType`, `zip`, `ip`
3. When users click phone numbers on your site, new rows will be appended to this sheet

### Troubleshooting

- **"Permission denied" errors**: Make sure you shared the Google Sheet with the service account email (Step 4)
- **"API not enabled" errors**: Verify the Google Sheets API is enabled in your Google Cloud project (Step 1)
- **"Invalid credentials" errors**: Check that the JSON key is correctly pasted in Netlify environment variables (no extra spaces or line breaks if using Option A)
- **No data appearing**: Check Netlify function logs (see Debugging section below)

## Debugging & Error Logs

### Where to Find Logs

#### 1. Netlify Function Logs (Server-Side)

**In Netlify Dashboard:**
1. Go to your site dashboard
2. Click **Functions** in the left sidebar
3. Click on **log-call** function
4. Click the **Logs** tab
5. You'll see all console.log and console.error output from the function

**What to look for:**
- `Click logged:` - Confirms the function received the click event
- `Google Sheets write failed` - Indicates a Sheets API error (check the error message)
- `Google Sheets credentials not configured` - Missing or invalid credentials
- `Error writing to Google Sheets:` - Detailed error from the Google API

#### 2. Browser Console (Client-Side)

**To check if clicks are being sent:**
1. Open your site in a browser
2. Open Developer Tools (F12 or Right-click → Inspect)
3. Go to the **Console** tab
4. Click on a phone number link
5. Check for any errors (red messages)

**To check network requests:**
1. In Developer Tools, go to the **Network** tab
2. Filter by "log-call" or "functions"
3. Click a phone number link
4. Look for a request to `/.netlify/functions/log-call`
5. Click on it to see:
   - **Request payload**: What data was sent
   - **Response**: What the function returned (check `sheetsLogged: true/false`)

#### 3. Test the Function Directly

You can test the function manually using curl or a tool like Postman:

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/log-call \
  -H "Content-Type: application/json" \
  -d '{"phone":"9163221394","targetID":"econ","eventType":"click"}'
```

Check the response - it should include `sheetsLogged: true` if successful.

**If the function test works but clicks don't:**
- Check browser console for JavaScript errors
- Verify the page is the deployed version (not localhost)
- Check if ad blockers or privacy extensions are blocking the request
- Look for CORS errors in the browser console

### Common Issues & Solutions

**Issue: `sheetsLogged: false` in response**
- Check Netlify function logs for the specific error
- Verify environment variables are set correctly
- Ensure the service account email has access to the sheet

**Issue: No network request appears in browser**
- Check browser console for JavaScript errors
- Verify the page is deployed (not just local dev)
- Check that `fetch` is working (some ad blockers may interfere)
- Look for "Tracking phone click:" in console - if you don't see this, the click handler isn't firing
- Verify the `.js-call-cta` element exists on the page

**Issue: Function logs show "Google Sheets credentials not configured"**
- Verify `GOOGLE_SERVICE_ACCOUNT_KEY` or both `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` are set
- Check that the JSON key is valid JSON (no extra characters)

**Issue: Function logs show permission errors**
- Double-check the service account email was added as an Editor to the Google Sheet
- Verify the Spreadsheet ID is correct in `GOOGLE_SHEETS_SPREADSHEET_ID`

**Issue: Headers not appearing in sheet**
- The function tries to create headers automatically, but if the sheet doesn't exist, create it manually
- Make sure the sheet tab name matches `GOOGLE_SHEETS_SHEET_NAME` (or "Events" if not set)


