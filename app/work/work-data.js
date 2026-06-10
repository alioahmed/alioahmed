// Detail content for /work/[slug] — sourced from the verified canonical files.
// Truth flags honored: Paralegent founder = Mudassir (Ali = product + site); no client logos;
// Build Buy Software pre-launch; Bijli Bachao client/founder names withheld; no Wonder Women private context.

export const order = ["bijli-bachao", "cognilium", "paralegent", "build-buy-software", "wonder-women"];

export const work = {
  "bijli-bachao": {
    tag: "Bijli Bachao · IoT & energy",
    title: "Three production energy platforms",
    role: "Head of Product & Platforms",
    period: "Oct 2025 – present",
    summary:
      "Three production SaaS platforms covering Pakistan's commercial energy lifecycle: what you pull from the grid, what your solar generates, and how tenants are billed. Built end to end.",
    stats: [
      { num: "~1 GWh", label: "Monitored on Wattey in 3 months" },
      { num: "47 plants", label: "Solar fleet on SPC · 2.2 MW" },
      { num: "95%", label: "Meter-reading accuracy, up from 50%" },
      { num: "3", label: "Production platforms, one operator" },
    ],
    sections: [
      {
        heading: "Wattey — real-time IoT electricity monitoring",
        paras: ["Live monitoring for commercial sites: 28 smart meters across 8 client sites in 4 cities, reporting every 3 minutes. ~0.96 GWh monitored and 509,000+ readings stored in the first three months."],
        bullets: [
          "Pakistan-specific seasonal time-of-use tariffs (T1–T4, four seasons)",
          "Automatic generator on/off detection and costing during grid outages",
          "Solar import/export tracking; multi-tenant dashboards with role-based access",
        ],
      },
      {
        heading: "Solar Performance Cloud — multi-brand solar diagnostics",
        paras: ["Pakistan's first independent, multi-brand solar performance platform. 47 plants and 52 inverters (Growatt, Solis, Huawei, Sungrow) unified in one dashboard, 284 PV strings graded daily across 2.2 MW. No hardware required: it connects to inverter cloud APIs."],
        bullets: [
          "IEC 61724-1 health scoring and IEC 62446-1 five-state string classification",
          "String-level fault diagnosis: dust, shading, dead panels, sensor faults",
          "5-minute sync, 24/7; has caught faults causing up to 50% inverter loss",
        ],
      },
      {
        heading: "Ready Billing — photo-verified OCR billing",
        paras: ["Automated billing for multi-tenant commercial properties. Live at a shopping mall with 74 tenants and 469 meters captured by mobile app at 85–95% OCR confidence. Reading accuracy improved from 50% to 95%, and a 15-day manual process now takes about 3 hours."],
        bullets: [
          "React Native + Expo mobile capture with Google Vision OCR; Next.js + Supabase dashboard",
          "Month-close with frozen snapshots, audit trail, and multiplying-factor handling",
          "Role-based access and offline capability for field conditions",
        ],
      },
      {
        heading: "How it's built",
        paras: ["Shared discipline across all three: IEC-aligned scoring, multi-tenant org-scoped isolation, RBAC, observability baselines (error tracking, health crons), and operator-handover documentation so the software outlasts the builder."],
      },
    ],
  },

  cognilium: {
    tag: "Cognilium AI · product lead",
    title: "Five AI products + the company machine",
    role: "AI Business Analyst & Product Owner",
    period: "Sept 2024 – present",
    link: { label: "cognilium.ai", href: "https://cognilium.ai" },
    summary:
      "Product lead at a boutique AI engineering firm serving US and UAE clients. Five AI products from ideation to production, plus the brand, website, and growth engine behind them.",
    stats: [
      { num: "5", label: "AI products shipped" },
      { num: "76 pages", label: "cognilium.ai, built end to end" },
      { num: "50+", label: "Projects delivered (firm)" },
      { num: "96%", label: "Client satisfaction (firm)" },
    ],
    sections: [
      {
        heading: "The products",
        bullets: [
          "VectorHire — AI recruitment; 4 parallel agents per candidate, 60% less hiring time",
          "VORTA — enterprise knowledge / conversational AI; 92% first-call resolution, 22 languages, replaced a 24-person support team (≈ USD 400K saved)",
          "ProspectVox — voice sales AI; 47% connect rate on outbound, 5-stage workflow",
          "Paralegent AI — agentic contract review (full detail on its own page)",
          "ProProspect — AI outreach pipeline",
        ],
      },
      {
        heading: "The website & brand",
        paras: ["Built cognilium.ai end to end: 76 statically rendered pages, 264 React components, a Sanity CMS, Resend email, hosted on Vercel, with a 34-script SEO/GEO automation toolkit and a daily-publishing tech-news section. Authored the brand knowledge base and positioning."],
      },
      {
        heading: "The growth engine",
        paras: ["Built customer acquisition from zero: an Upwork strategy, a 6-domain / 30+ account cold-email stack, LinkedIn outreach, and an AI sales-agent playbook, bringing in USD 50,000+ in client value. Plus the HR infrastructure, hiring, and finance/compliance behind the firm."],
      },
    ],
  },

  paralegent: {
    tag: "Paralegent AI · product manager",
    title: "Agentic contract review",
    role: "AI Product Manager, and built the go-to-market site",
    period: "Jan 2026 – present",
    link: { label: "paralegent.ai", href: "https://paralegent.ai" },
    summary:
      "An agentic AI accelerator for contract due diligence, a product of Cognilium AI. It reviews any contract against a customer's own playbook and returns redlines inside Microsoft Word, deployed entirely in the customer's own cloud.",
    stats: [
      { num: "18+", label: "Specialised AI agents + orchestrator" },
      { num: "15–20s", label: "Contract match (1536-d search)" },
      { num: "2–8 min", label: "Full analysis per contract" },
      { num: "56 pages", label: "GTM site, built solo" },
    ],
    sections: [
      {
        heading: "What it does",
        paras: ["A legal team uploads its own playbook once; 18+ specialised agents plus an orchestrator (LangGraph + Google ADK, LLM-agnostic across Azure OpenAI, AWS Bedrock and Google Vertex AI) review any contract against it. It matches a contract in 15–20 seconds and returns a full GREEN/ORANGE/RED redline in 2–8 minutes, each with a suggested revision, rationale, and confidence score, natively inside a Microsoft Word add-in."],
        bullets: [
          "Not SaaS: it deploys in the customer's own cloud, so contract data never leaves their environment",
          "About 30 hours of manual review compressed to roughly 30 minutes; 40–50 findings per master agreement",
          "Reviews against the customer's own playbook (80–150 terms), not a generic model's opinion",
        ],
      },
      {
        heading: "My role",
        paras: ["I led the product from ideation through production, and built the entire go-to-market site solo: 56 statically rendered Next.js pages, 50 components, a 26-script SEO automation pipeline, and full AI-citation infrastructure, live and indexed. (Founder & CEO: Mudassir Marwat.) The product is in go-to-market with paying clients under NDA."],
      },
    ],
  },

  "build-buy-software": {
    tag: "Build Buy Software · product & editorial lead",
    title: "Independent legal-tech directory",
    role: "Product & Editorial Lead",
    period: "2026 · pre-launch",
    summary:
      "An independent directory of 420 legal-technology products, each scored by a published, sponsorship-proof formula, built to beat the incumbent on structured data and transparency.",
    stats: [
      { num: "420", label: "Products scored" },
      { num: "~2,000", label: "Statically rendered pages" },
      { num: "27", label: "Data-grounded articles" },
      { num: "0", label: "Paid placement in rankings" },
    ],
    sections: [
      {
        heading: "What it is",
        paras: ["A directory of 420 products across 10 categories and 387 vendors, each scored 0–100 by the BBS Score, a published formula computed only from public evidence, where sponsorship cannot touch rankings. ~2,000 statically rendered pages with structured data throughout."],
        bullets: [
          "27 published articles in which every statistic is computed from the database and re-verified on every change",
          "A quarterly State of Legal Tech report generated from the directory's own data",
          "A 48-prompt legal-AI library, and a CI quality gate that fails the build on editorial violations",
        ],
      },
      {
        heading: "My role",
        paras: ["Product and editorial lead: I built the directory, the scoring methodology, and the content end to end, and I'm the named author of its data analyses. The strategy is grounded in a 20-track, adversarially-verified research program. The site is built and content-complete, pre-launch."],
      },
    ],
  },

  "wonder-women": {
    tag: "Wonder Women · co-founder",
    title: "FemTech, hardware to health",
    role: "Co-Founder & Head of Product",
    period: "May 2022 – Oct 2024",
    summary:
      "Pakistan's first locally-assembled IoT sanitary-napkin vending machine, and the company around it. Built end to end: hardware, software, enterprise sales, pricing, grants, and operations.",
    stats: [
      { num: "29", label: "Machines across 24 locations" },
      { num: "75,000+", label: "Products dispensed" },
      { num: "PKR 3.7M", label: "Revenue in 12 months" },
      { num: "USD 35K", label: "HEC seed fund · 1 of 15 from 186" },
    ],
    sections: [
      {
        heading: "The product",
        paras: ["Asani: a wall-mounted sanitary-napkin vending machine, assembled locally at one-tenth the cost of imported alternatives and deployed across universities, offices, and hospitals. Plus the mobile app, the partner dashboard, and Pakistan's first PCOS self-assessment tool as the company pivoted toward digital health."],
      },
      {
        heading: "The deals",
        paras: ["Closed the #AlwaysAsani partnership with Procter & Gamble (P&G covered 53% of unit cost across a 70-machine pipeline), plus Engro, Aga Khan University Hospital (6 machines, the largest single deployment), NETSOL, Sapphire, and Devsinc."],
      },
      {
        heading: "Recognition",
        bullets: [
          "HEC Innovator Seed Fund — USD 35,000 (1 of 15 winners from 186 applicants)",
          "Falling Walls Lab — Pakistan winner",
          "Entrepreneurship World Cup — Top 100 global startups (2021)",
          "Bahria Innovation Challenge — 1st place",
        ],
      },
    ],
  },
};
