# ESL FDA AI Device Intelligence

Search, assess, and prepare FDA-authorized AI medical device submissions.

Built on the open-source [FDA AI Search](https://github.com/lotterlab/fda_ai_search) by Kavishwar & Lotter (ML4H 2025), enhanced with ESL Software Evidence Services capabilities.

## Features

- **Semantic Search** — AI-powered search across 1,200+ FDA-authorized AI medical devices
- **Faceted Filtering** — Filter by clinical panel, company, regulatory pathway, data type, and year
- **Cybersecurity Evidence Layer** — SBOM presence, §524B compliance, CVE management indicators (powered by SBOMator™)
- **IEC 62304 Risk Classification** — Automatic Class A/B/C estimation for each device
- **Evidence Requirements Mapper** — Standards-mapped evidence checklist by device risk class
- **Submission Readiness Assessment** — Interactive wizard that identifies evidence gaps and connects to ESL's scoping workshop
- **Case Studies** — Before/after ESL engagement results across multiple device types

## Tech Stack

- Next.js 15 + React 19 + Tailwind CSS 4
- Transformers.js (MedEmbed-small-v0.1 for query embedding)
- Flat-file data (CSV + JSON embeddings) — same proven approach as the original
- Deploy on Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Data Source

FDA's public database of AI-enabled medical devices: https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-enabled-medical-devices

## License

Code based on the original by lotterlab/fda_ai_search. ESL enhancements are proprietary.
