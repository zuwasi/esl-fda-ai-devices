# ESL FDA AI Device Intelligence - Next Steps & Improvement Roadmap

> Created: August 27, 2026
> Status: Living document - update as items are completed or reprioritized.

---

# 1. AI-Enhanced Regulatory Concerns Summary (High Priority)

**Problem:** The Regulatory Concerns modal currently shows raw FDA data - individual recall cards, individual adverse event cards. A user seeing "37 recalls, 12,119 adverse events" for a company like Medtronic has to read through them one by one.

**Solution:** Add an AI-generated plain-language risk summary at the top of the modal:

> *"This device has 37 recalls primarily related to battery depletion and lead fractures. Adverse events are dominated by malfunction reports (78%2) with 14 death reports associated with lead displacement. Key risk areas: power management and lead integrity."*
r**Implementation:**
- Call an LLM APi (Gemini, OpenAI, or Anthropic) from a new server-side API route `/api/risk-summary`
- Send the structured regulatory concerns data (recalls + adverse events) as context
- Prompt the LLM to produce: (1) a 2-3 sentence risk summary, (2) top 3 risk themes, (3) trend direction (improving/stable/worsening based on dates)
- Cache results per company+device to avoid repeated API calls
- Graceful degradation: if the API fails, the modal works exactly as it does today (raw data only)

*Cost:** LLM APi per-request billing. Estimate ~$0.01-0.03 per summary with a small model (Gemini Flash / GPT-4o-mini). Cache reduces repeat calls.

*Why this first:** Highest value-to-effort ratio. Directly supports the positioning statement: "actionable intelligence, not just raw data." Turns a data dump into a consultative insight.

---

# 2. AI-Assisted Submission Assessment Wizard (Medium Priority)

*Problem:* The current assessment page (`/assessment`) is a static 3-step form with checkboxes. It produces a generic gap analysis.

Solution: Make it conversational and personalized:
- User describes their device in plain language -> AI identifies the closest predicate devices from the database
- AI suggests the regulatory pathway and evidence requirements based on what similar FDA-cleared devices actually provided
- AI generates a draft gap analysis with prioritized recommendations instead of a static checklist
- Output includes: "Devices similar to yours provided X, Y, Z evidence. You indicated you have X but not Y or Z. Priority: address Y first because FDA reviewers cited it in 3 warning letters to similar devices."

Implementation:
- New API route `/api/assessment-analysis`
- Use the existing search API to find predicate devices, then send results + user self-assessment to an LLM
- Generate a structured JSON response with: matched predicates, evidence gaps, priority recommendations, ESL service mapping
- Render as a formatted report page with a "Download as PDF" option

Cost: Higher per-request cost than #1 (more context, more reasoning). Estimate ~$0.05-0.15 per assessment.

Why not first: More complex to build, higher API cost, and the current static assessment already works. Build after #1 proves the AI integration pattern.

---

# 3. Device Comparison Feature (Medium Priority)

Problem: Users cannot compare two devices side by side.

Solution: Add a "Compare" button on search results. Select 2-3 devices and see a synthesized comparison table:
- Risk class, regulatory pathway, data type, clinical panel
- Cybersecurity evidence (SBOM, Section 524B, CVE management)
- Regulatory concerns count (recalls, adverse events, warning letters)
- AI-generated narrative comparison: "Device A has more cybersecurity evidence but Device B has fewer adverse events. Device A used 510(k) with a broader predicate pool; Device B used De Novo, establishing a new classification."

Implementation:
- New page `/compare?ids=K240369,K230453,K221762`
- Fetch device records + regulatory concerns for all selected devices
- Send structured data to LLM for narrative synthesis
- Render comparison table + AI narrative

Cost: Moderate - one LLM call per comparison session.

---

# 4. Data Pipeline Automation (Operational)

Problem: The dataset (`api/fda_ai_records.csv`) is a static snapshot. New FDA AI device authorizations are not reflected until the CSV is manually updated.

Solution: Build a data refresh pipeline:
- Scrape FDA official AI device list monthly (https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-enabled-medical-devices)
- For new devices, fetch the FDA Summary PDF and extract structured fields (use LLM for extraction, same as the original pipeline)
- Generate embeddings for new devices and append to the JSON shards
- Automated CI/CD job (GitHub Actions cron) that updates the CSV + embeddings and commits to the repo
- Railway auto-deploys the updated data

Complexity: High - requires FDA PDF parsing, LLM extraction, embedding generation, and CI/CD setup. But ensures the platform stays current.

Alternative (simpler): Add a "Last updated" date on the homepage and a manual refresh script that can be run quarterly.

---

# 5. SEO & Discoverability (High Priority, Low Effort)

Problem: The platform has no SEO optimization. Search engines cannot index device detail pages because they are client-rendered.

Solution:
- Add `metadata` exports to each page (title, description, Open Graph tags)
- Generate static metadata for each device detail page: "K240369 - Sleep Apnea Notification Feature (SANF) - FDA AI Device | ESL"
- Add `robots.txt` and `sitemap.xml` with all device pages
- Add structured data (JSON-LD) for each device: MedicalDevice schema with name, manufacturer, regulation, date
- Add canonical URLs
- This is critical: if people searching "FDA sleep apnea device" cannot find your page, the platform does not exist

Effort: 2-4 hours. One of the highest ROI improvements.

---

# 6. Analytics & Lead Tracking (High Priority, Low Effort)

Problem: No analytics. You do not know how many people search, what they search for, how many click "Contact ESL", or which devices get the most traffic.

Solution:
- Add Google Analytics 4 (or Plausible for privacy-friendly) - simple script tag
- Track key events: search, device detail view, regulatory concerns open, assessment completion, contact clicks
- Add conversion tracking: "Regulatory Concerns opened -> Contact ESL clicked" is the primary funnel
- Optional: add a lightweight contact form on the assessment results page (instead of just mailto:) to capture leads with device context

Effort: 1-2 hours for basic analytics. Half day for the contact form.

---

# 7. Custom Domain & Email (Operational)

Problem: The Railway URL (`esl-fda-ai-devices-production.up.railway.app`) is not memorable or professional for client-facing use.

Solution:
- Register a domain like `fda-ai-devices.eswlab.com` (subdomain of existing ESL domain) or a dedicated domain like `fdaaidevices.com`
- Configure the custom domain in Railway settings
- Set up DNS (CNAME to Railway proxy)
- This eliminates the awkward Railway URL in client communications

Effort: 1 hour once the domain is decided.

---

# 8. Data Export & PDF Reports (Medium Priority)

Problem: Users cannot save or share device information or assessment results.

Solution:
- "Download Device Report" button on each device detail page - generates a PDF with: device info, risk classification, cybersecurity evidence analysis, regulatory concerns summary, evidence requirements
- "Download Assessment Report" on the assessment results page - generates a PDF with: gap analysis, evidence checklist, ESL service recommendations, next steps
- Use a server-side PDF library (e.g., `@react-pdf/renderer` or puppeteer)

Why: A PDF report is something a regulatory affairs manager can forward internally. It becomes a sales document that carries ESL branding into client organizations.

---

# 9. Bookmarking & Saved Searches (Low Priority)

Problem: Users cannot save a device or search for later reference.

Solution:
- "Bookmark" button on device detail pages (stored in localStorage - no login required)
- "Saved Devices" page showing all bookmarks with quick comparison
- "Save this search" for search queries - notifies when new matching devices are added (requires #4 data pipeline)

---

# 10. API for External Access (Low Priority)

Problem: The search and regulatory concerns APIs are internal-only (same origin).

Solution:
- Add API key authentication
- Publish API documentation (OpenAPI/Swagger)
- Offer a free tier (100 requests/day) and a paid tier for commercial use
- This positions the platform as a data provider, not just a UI.

Why low priority: The platform value is in the UI and the lead generation funnel. An API is a different business model that may distract from the consultancy positioning.

---

Priority Summary

| # | Feature | Priority | Effort | Impact |
|---|--------|-------|------|-------|
| 5 | SEO & Discoverability | High | Leg | High |
| 6 | Analytics & Lead Tracking | High | Leg | High |
| 7 | Custom Domain | High | Leg | Medium |
| 1 | AI Regulatory Concerns Summary | High | Medium | High |
| 4 | Data Pipeline Automation | Medium | High | High |
| 8 | Data Export & PDF Reports | Medium | Medium | Medium |
| 2 | AI Assessment Wizard | Medium | High | High |
| 3 | Device Comparison | Medium | Medium | Medium |
| 9 | Bookmarking & Saved Searches | Low | Leg | Low |
| 10 | External API | Low | Medium | Low |

---

Architecture Notes

- *Current stack:*% Next.js 15 + React 19 + Tailwind CSS 4 + @huggingface/transformers (local embeddings) + flat-file data (CSV + JSON)
- *No database:* All data is file-based. For features like saved searches or API keys, add a lightweight store (SQlite via better-sqlite3, or Upstash Redis for serverless)
- *No auth:* Currently no login. Assessment and bookmarking can work with localStorage. API access (#10) would require auth.
- *Deployment:* Railway (auto-deploy from GitHub main branch). Could also deploy to Versel for edge functions if needed.
- *LLM integration pattern:*% Server-side API routes only. Never expose API keys to the client. Cache responses to minimize cost.

---

Not Recommended (And Why)

- *Replacing local embeddings with an LLM APi for search* - adds latency, cost, and a dependency. The local MedEmbed model works well and runs free.
- *LLM-based risk classification* - the current rule-based IEC 62304 classification is deterministic and explainable. An LLM would make it less trustworthy for regulatory evidence, not more.
- *LLM-based cybersecurity evidence analysis* - same reasoning. Rule-based is auditable. LLM is not.
- *User accounts / login system* - adds friction with no clear benefit for the current use case. The platform value is zero-friction access. Add auth only if #10 (external API) or paid features require it.
