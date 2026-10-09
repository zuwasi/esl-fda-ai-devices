export interface ArticleEntry {
  id: string;
  /** ISO date (YYYY-MM-DD), used for ordering. Newest first in the array. */
  date: string;
  /** Short source label shown as the badge (e.g. "Medscape Medical News"). */
  source: string;
  title: string;
  summary: string;
  /** Target for "Read more": external URL or internal path. */
  url: string;
  /** True when url points outside esl-fda.io. */
  external: boolean;
  /** Attribution / copyright line shown on the card, for republished summaries. */
  credit?: string;
}

/**
 * Editorial feed for the /articles page and the Breaking banner.
 * The banner always shows the three newest entries (articles[0..2]),
 * so add new entries at the top of this array.
 */
export const articles: ArticleEntry[] = [
  {
    id: 'medscape-device-recall-safety',
    date: '2026-10-06',
    source: 'Medscape Medical News',
    title: 'FDA Device Recall Problems Raise Questions About Patient Safety, Clinician Liability',
    summary:
      'Medscape Medical News examines how persistent problems in the FDA device recall system raise questions about patient safety and clinician liability. The report traces the issue back to the 510(k) pathway: although it began as a loophole, a 2023 study found that about 99% of devices cleared for market went through it, and it asks what clinicians can do when recalled devices keep reaching patients.',
    url: 'https://www.medscape.com/viewarticle/fda-device-recall-problems-raise-questions-about-patient-2026a10011cz',
    external: true,
    credit:
      'Summary republished with credit. Original article by John McFarland, Medscape Medical News, October 6, 2026. Full article © Medscape; read the original on medscape.com.',
  },
  {
    id: 'esl-executive-brief-unit-testing',
    date: '2026-09-24',
    source: 'ESL Executive Brief',
    title: 'Static Code Analysis Alone Is Not Enough: Add Unit Testing & Code Coverage',
    summary:
      'Seven FDA enforcement cases show one consistent pattern: teams that passed system-level testing and managed static-analysis findings were still cited for missing code-level verification. The brief maps each case to the exact ESL solution with Parasoft tools.',
    url: '/case-studies/unit-testing-code-coverage',
    external: false,
  },
  {
    id: 'fda-genai-discussion-paper',
    date: '2026-09-10',
    source: 'FDA / CDRH',
    title: 'FDA seeks feedback on regulating Generative AI-enabled medical devices',
    summary:
      'FDA issued a discussion paper and request for feedback on considerations for the regulation of generative AI-enabled medical devices. Public comments are open through October 19, 2026.',
    url: 'https://www.fda.gov/medical-devices/digital-health-center-excellence/considerations-regulation-generative-ai-enabled-medical-devices-discussion-paper-and-request',
    external: true,
  },
];
