export interface DeviceRecord {
  date_of_final_decision: string;
  submission_number: string;
  device_model: string;
  company: string;
  panel_lead: string;
  primary_product_code: string;
  summary_pdf_link: string;
  lead_panel: string;
  data_type: string;
  clinical_function: string;
  ai_function: string;
  ai_function_subclass: string;
  summary_keywords: string;
  summary: string;
  generated_questions: string;
  concepts: string;
  thesis: string;
  search_boost_text: string;
  gemini_cost_summary: string;
  query_match_1: string;
  query_match_2: string;
  query_match_3: string;
}

export interface SearchResult {
  deviceName: string;
  applicant: string;
  submissionNumber: string;
  decisionDate: string;
  similarity: number;
  pdfLink: string | null;
  thesis: string;
  keywords: string;
  concepts: string;
  panel: string;
  dataType: string;
  clinicalFunction: string;
  aiFunction: string;
  regulatoryPathway: string;
  riskClass: string;
  cyberDeviceStatus: string;
}

export interface CyberEvidence {
  hasSBOM: boolean;
  hasCyberRiskAssessment: boolean;
  hasPostmarketPlan: boolean;
  section524BApplicable: boolean;
  cyberScore: number;
  findings: string[];
}

export interface EvidenceRequirement {
  standard: string;
  requirement: string;
  applicable: boolean;
  eslCapability: string;
  status: 'required' | 'recommended' | 'optional';
}

export interface RiskClassification {
  iec62304Class: 'A' | 'B' | 'C';
  fdaClass: 'I' | 'II' | 'III';
  rationale: string;
  cyberDevice: boolean;
}

export interface CaseStudy {
  id: string;
  title: string;
  specialty: string;
  beforeESL: string[];
  afterESL: string[];
  result: string;
  pathway: string;
  sourceUrl?: string;
  sourceLabel?: string;
}
