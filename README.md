# ESL FDA AI Device Intelligence

**Live site: https://esl-fda.io**

The only free public platform that combines semantic search of every FDA-authorized AI medical device with live regulatory risk monitoring (recalls, adverse events, and warning letters) plus cybersecurity evidence analysis (xBOM/CycloneDX) and IEC 62304 risk classification.

Built on the open-source [FDA AI Search](https://github.com/lotterlab/fda_ai_search) by Kavishwar & Lotter (ML4H 2025), enhanced with ESL Software Evidence Services capabilities.

## Features

- **Semantic Search** - AI-powered search across 1,200+ FDA-authorized AI medical devices
- **Faceted Filtering** - Filter by clinical panel, company, regulatory pathway, data type, AI function, product code, estimated FDA class, and Section 524B applicability
- **Regulatory Risk Monitoring** - Live recalls, adverse events, and warning letters from FDA openFDA and FDA.gov APIs
- **Cybersecurity Evidence Layer** - 7 xBOM types (SBOM, ML-BOM, SaaSBOM, HBOM, CBOM, VDR/VEX, OBOM) per CycloneDX/OWASP ECMA-424
- **IEC 62304 Risk Classification** - Automatic Class A/B/C estimation for each device
- **FDA Summary PDF Analysis** - On-demand text extraction and cybersecurity evidence analysis from FDA Summary PDFs
- **Submission Readiness Assessment** - Interactive wizard that identifies evidence gaps and connects to ESL scoping workshop
- **Case Studies** - Real ESL engagement results (Parasoft/Inovytec, code coverage remediation)

## Tech Stack

- Next.js 15 + React 19 + Tailwind CSS 4
- @huggingface/transformers (MedEmbed-small-v0.1 for query embedding)
- pdf-parse (FDA Summary PDF text extraction)
- xlsx/SheetJS (FDA warning letter XLSX parsing)
- Flat-file data (CSV + JSON embeddings)
- Deployed on Railway - auto-deploys from GitHub main

## Getting Started

`ash
npm install
npm run dev
`

Open http://localhost:3000

## Data Source

FDA public database of AI-enabled medical devices: https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-enabled-medical-devices

## License

Code based on the original by lotterlab/fda_ai_search. ESL enhancements are proprietary.