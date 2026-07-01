# Ali Ahmed — personal site

Personal site for **Ali Ahmed** — Product & Innovation Operator. Next.js (App Router), light editorial design, deployed on Vercel.

- LinkedIn: <https://www.linkedin.com/in/alioahmed/>

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

## Deploy (Vercel)

```bash
npm i -g vercel    # if needed
vercel --prod      # → *.vercel.app
```

Or import the repo at vercel.com/new — Next.js is auto-detected, zero config.

## Stack

- **Next.js 15** (App Router), **React 19** — no runtime UI dependencies
- Fonts via `next/font`: Fraunces (display) + Newsreader (body) + IBM Plex Mono (data)
- Design tokens (OKLCH colour, fluid type, 4-pt spacing) in `tokens.css`; page CSS in `app/globals.css` references tokens by name
- Content lives in `app/page.jsx`; re-theming is a token swap in `tokens.css`

Contact CTAs use `mailto:` + LinkedIn — swap for a booking URL when one exists.
