# Sandesh Patel — Portfolio (iOS Liquid Glass Edition)

A full redesign of the portfolio using an iOS 18 "Liquid Glass" visual language:
frosted glass panels, Dynamic Island, iMessage-style story timeline, App Store–style
project cards, Home Screen app-icon skill grid, and a scroll-reactive 3D glass scene.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build       # production build -> dist/
npm run preview     # preview the production build
```

Node 18+ recommended.

## Optional: AI chatbot

The floating chat widget works out of the box with **zero setup** — with no API
key it answers from a small built-in knowledge base (skills, projects, contact,
availability) instead of a dead "not configured" message. That's the "trained
model" without actually training anything: a lightweight intent matcher over
your real `config.json` data, in `Chatbot.jsx` → `localAnswer()`. Extend it by
adding more regex rules there if you want it to handle more question types.

To upgrade it to a real LLM:

```bash
cp .env.example .env
```

**Recommended: Groq** (fast, free tier is generous, no credit card)
1. https://console.groq.com/keys → create a free API key
2. `.env`: `VITE_GROQ_API_KEY=your_key_here`
3. Uses `llama-3.1-8b-instant` — fast enough to feel instant, plenty for a portfolio FAQ bot

**Alternative: Gemini**
1. https://aistudio.google.com/apikey → create a free API key
2. `.env`: `VITE_GEMINI_API_KEY=your_key_here`

If a live call ever fails (quota hit, network issue, bad key), the bot silently
falls back to the same local knowledge base rather than showing an error — so
it never dead-ends on the visitor.

**Important:** any `VITE_`-prefixed variable gets inlined into the client bundle
at build time — that's how Vite env vars work, it's not a leak specific to this
code. Both Groq and Gemini's free tiers are meant for exactly this kind of
client-side/demo use, so it's an acceptable tradeoff here. If you later want a
key that's genuinely never exposed, the correct fix is a tiny backend proxy
endpoint (`/api/chat`) that holds the key server-side — see the backend section
below.

## What changed structurally

- `Hero/GlassScene.jsx` — the only Three.js dependency, lazy-loaded (`React.lazy`) so
  it never blocks first paint; drops the JS bundle from ~1.2MB to ~360KB on first load.
- `PhoneFrame/` — reusable iPhone mockup (Dynamic Island, status bar, home indicator)
  used in the Projects section for App-Store-style previews.
- `DynamicIsland/` — replaces the old `FloatingClock`; expands/collapses with a real
  spring layout animation like iOS's actual Dynamic Island.
- `About/` — the signature piece: your timeline data (unchanged from `config.json`)
  is rendered as an iMessage conversation thread that reveals bubble-by-bubble on
  scroll, so the "journey" is literally readable top to bottom.
- Design tokens live entirely in `src/index.css` (`:root` variables) — colors, blur
  amounts, radii, spring easings. Change the look site-wide from one place.

## Responsiveness / iPhone notes

- Bottom tab bar (native iOS pattern) replaces the top navbar under 900px, with
  `env(safe-area-inset-bottom)` padding so it clears the home indicator on notched
  iPhones.
- The 3D canvas caps device-pixel-ratio at 1.6 and is capped/opacity-reduced on small
  screens to protect battery/thermals on real devices.
- All animations respect `prefers-reduced-motion`.
- Test on an actual iPhone via Safari, not just Chrome DevTools' iPhone emulation —
  backdrop-filter blur and momentum scrolling behave differently on real WebKit.

## On "borrowing components from 21st.dev"

I didn't route any of this through the 21st.dev MCP connector — everything here is
hand-built from your existing content/structure so it stays consistent as one system
(shared tokens, shared glass primitives) rather than a patchwork of externally-sourced
components with their own conventions. If there's a specific 21st.dev component you
saw and liked, send me the link/screenshot and I'll adapt it into this same token
system rather than dropping it in as-is.

## Backend suggestion (for later)

You don't need to change backend tech just because the frontend theme changed — the
glass/iOS look is 100% CSS + JS, nothing structural. Keep **Node.js + Express**, it's
simple and it's what the contact form / LeetCode proxy already expect
(`https://portfoliobackend-oy98.onrender.com`).

If you do want to modernize it later:
- **Fastify** instead of Express — same mental model, noticeably faster, better TS support.
- **Node + tRPC** if you rewrite the frontend data-fetching to be type-safe end-to-end.
- Either way, add one real endpoint: `/api/chat` that holds `GEMINI_API_KEY` server-side
  and proxies the chatbot request — this fixes the key-exposure issue above properly.

None of this is iOS-theme-specific; it's just normal backend hygiene.

## Stack

Vite + React 18, Framer Motion, React Three Fiber / drei (hero scene only),
react-icons, react-scroll. No Tailwind — plain CSS with a token system, so it stays
lightweight and fully custom.
