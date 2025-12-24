Core Identity & Strategy
Project Name: ActCA.now

Mission: A "Soft Secession" mobilization tool for California.

Target: I-580 Richmond Corridor commuters (Actionable in 3 seconds).

UX Philosophy: "Thumb-First" (60px min action height), High-Contrast (Slate 950 / Yellow 400).

Coding Standard: "Bridge AI" Legacy (Heavy use of heading comments, scannable modularity).

2. Technical Stack (Astro 5.0)
Framework: Astro 5.2+ (Static-First SSG).

Styling: Tailwind CSS v4.0 (Vite Plugin).

Interactivity: Alpine.js (State-based filtering).

Content Model: Git-based Content Collections (Astro 5 Content Layer).

Deployment: Netlify (Edge Functions for logging).

Database: Google Sheets (via serverless bridge).

3. Directory Structure
Bash
actca-now/
├── .cursor/rules/          # Modern Cursor Agent Instructions (.mdc)
├── src/
│   ├── content/            # Local Markdown Source
│   │   ├── calls/          # Political Target Cards
│   │   └── resources/      # Whitepapers & Source receipts
│   ├── content.config.ts   # Zod Schema for Content Layer (Astro 5)
│   ├── components/         # CallCard, TopicPicker, ResourceCard
│   ├── layouts/            # BaseLayout (Meta tags, Global CSS)
│   └── pages/              # index.astro (Action), resources.astro (Library)
├── functions/              # Netlify Serverless (log-call.js)
├── public/officials/       # Photos for CallCards
└── netlify.toml            # Build & Functions config
4. Content Schema (Zod)
In src/content.config.ts, define the calls collection:

topic: enum (rail, housing, ai, health, rights, econ)

officialName: string

officialTitle: string

phone: string (tel: link target)

script: string (Bold reading text)

priority: boolean (Urgent flag)

rationale: string (Why we are calling)

5. UI Logic & State
TopicPicker: Uses Alpine.js x-data="{ activeTopic: 'all' }" to filter cards.

CallCard: Every "Tap to Call" action must trigger a background fetch() to /.netlify/functions/log-call containing { targetID, zip }.

Layout: Must include OpenGraph tags for Richmond-specific social sharing (Meta description: "The Action Center for California Autonomy").

6. Cursor Agent Directives
Strictly use TypeScript for the Content Layer config.

Scannability: Every .astro file must start with a --- frontmatter block clearly separated by category comments (e.g., // --- IMPORTS ---).

Color Palette: Use Tailwind 4 text-yellow-400 for primary actions and bg-slate-950 for the page body.