/**
 * AI Smart System — Demo / Preview Data
 *
 * This module provides realistic mock data for the S2 admin Access Monitoring
 * demo view. It simulates what the AI scanning system would surface in a live
 * deployment: classified information access patterns, a detected breach, and
 * various security-scan findings.
 *
 * All timestamps are relative to "now" so the demo always looks fresh.
 */

import type { AnomalyEvent } from "@/backend.d";

// ─── Time helpers ─────────────────────────────────────────────────────────────
// biome-ignore lint/correctness/noUnusedVariables: reserved for future use
const _now = () => BigInt(Date.now());
const minsAgo = (m: number) => BigInt(Date.now() - m * 60 * 1000);
const hoursAgo = (h: number) => BigInt(Date.now() - h * 60 * 60 * 1000);

// ─── Fake principals (display only — never sent to backend) ───────────────────
export const DEMO_PRINCIPALS = {
  cpt_harris: "xjrne-xibzv-bqe7v-demo1",
  sgt_reyes: "pqmwk-uvzab-lyt3c-demo2",
  civ_morton: "abcde-fghij-klmno-demo3",
  unknown: "zzzzz-aaaaa-bbbbb-demo9",
} as const;

export const DEMO_PROFILES = [
  {
    name: "Cpt. James Harris",
    rank: "CPT",
    orgRole: "S2 Intelligence Officer",
    clearanceLevel: 4,
    principalId: DEMO_PRINCIPALS.cpt_harris,
  },
  {
    name: "Sgt. Maria Reyes",
    rank: "SGT",
    orgRole: "Intelligence Analyst",
    clearanceLevel: 3,
    principalId: DEMO_PRINCIPALS.sgt_reyes,
  },
  {
    name: "David Morton",
    rank: "CIV",
    orgRole: "Contractor — IT Support",
    clearanceLevel: 1,
    principalId: DEMO_PRINCIPALS.civ_morton,
  },
];

export const DEMO_FOLDERS = [
  {
    id: "folder-tsci-001",
    name: "HUMINT Reports — TS/SCI",
    requiredClearanceLevel: BigInt(4),
  },
  {
    id: "folder-ts-002",
    name: "SIGINT Intercepts — TS",
    requiredClearanceLevel: BigInt(3),
  },
  {
    id: "folder-secret-003",
    name: "Operational Orders — SECRET",
    requiredClearanceLevel: BigInt(2),
  },
  {
    id: "folder-cui-004",
    name: "Personnel Records — CUI",
    requiredClearanceLevel: BigInt(1),
  },
];

// ─── Live scan feed messages (cycled by the AI ticker) ────────────────────────
export const AI_SCAN_MESSAGES = [
  "Scanning access logs across all classification tiers…",
  "Analyzing document retrieval patterns for SGT Reyes…",
  "Cross-referencing HUMINT folder access timestamps…",
  "Detecting anomalous off-hours login attempt — flagging…",
  "Running behavioral baseline comparison for CIV Morton…",
  "Monitoring TS/SCI folder for unauthorized access vectors…",
  "Evaluating need-to-know verification chain integrity…",
  "Checking for repeated classified document downloads…",
  "Scanning message traffic for sensitive data exfiltration markers…",
  "Analyzing 60-minute access frequency threshold — 5+ accesses detected…",
  "Verifying commander authorization chain for elevated permissions…",
  "Correlating anomaly events with user clearance levels…",
  "Checking session tokens for concurrent login violations…",
  "Flagging civilian contractor access to SECRET tier folder…",
  "Escalating high-severity event to S2 notification queue…",
  "Audit trail integrity check — no tampering detected…",
  "Monitoring exfiltration vectors: USB, email, print — all clear…",
  "Real-time threat score updated: ELEVATED for CIV Morton…",
];

// ─── Threat score per user (demo only) ───────────────────────────────────────
export interface ThreatScore {
  name: string;
  rank: string;
  score: number; // 0-100
  level: "low" | "medium" | "high" | "critical";
  reason: string;
}

export const DEMO_THREAT_SCORES: ThreatScore[] = [
  {
    name: "Cpt. James Harris",
    rank: "CPT",
    score: 12,
    level: "low",
    reason: "Normal access patterns within authorized scope",
  },
  {
    name: "Sgt. Maria Reyes",
    rank: "SGT",
    score: 67,
    level: "high",
    reason: "7 accesses to TS folder in 45 min — threshold exceeded",
  },
  {
    name: "David Morton",
    rank: "CIV",
    score: 91,
    level: "critical",
    reason: "Unauthorized attempt to access SECRET folder; clearance level 1",
  },
];

// ─── Demo anomaly events ──────────────────────────────────────────────────────
export const DEMO_ANOMALY_EVENTS: AnomalyEvent[] = [
  // ── BREACH ────────────────────────────────────────────────────────────────
  {
    id: "demo-breach-001",
    detectedAt: minsAgo(8),
    eventType: "unauthorized_access_attempt",
    affectedUserId: undefined,
    affectedFolderId: "folder-secret-003",
    severity: "critical",
    description:
      "CIV David Morton (clearance level 1) attempted to access Operational Orders — SECRET folder (requires level 2). Access was blocked by the system. 3 repeated attempts detected in 4-minute window.",
    resolved: false,
    isSystemGenerated: true,
    resolvedBy: undefined,
  },

  // ── HIGH-FREQUENCY CLASSIFIED ACCESS ─────────────────────────────────────
  {
    id: "demo-freq-001",
    detectedAt: minsAgo(12),
    eventType: "classified_access_frequency_breach",
    affectedUserId: undefined,
    affectedFolderId: "folder-ts-002",
    severity: "high",
    description:
      "SGT Maria Reyes accessed SIGINT Intercepts — TS folder 7 times within 45 minutes. Automated threshold is 5 accesses per 60 minutes. Behavioral anomaly flagged for S2 review.",
    resolved: false,
    isSystemGenerated: true,
    resolvedBy: undefined,
  },

  // ── DOCUMENT BULK DOWNLOAD ────────────────────────────────────────────────
  {
    id: "demo-download-001",
    detectedAt: minsAgo(31),
    eventType: "bulk_document_retrieval",
    affectedUserId: undefined,
    affectedFolderId: "folder-tsci-001",
    severity: "high",
    description:
      "12 documents retrieved from HUMINT Reports — TS/SCI folder within a single session by SGT Reyes. Retrieval volume exceeds normal operational patterns. Possible data staging detected.",
    resolved: false,
    isSystemGenerated: true,
    resolvedBy: undefined,
  },

  // ── OFF-HOURS LOGIN ───────────────────────────────────────────────────────
  {
    id: "demo-offhours-001",
    detectedAt: hoursAgo(2),
    eventType: "off_hours_authentication",
    affectedUserId: undefined,
    affectedFolderId: undefined,
    severity: "medium",
    description:
      "Authentication detected outside normal duty hours (02:14 local). User CIV Morton accessed the system. No classified folders were opened, but pattern deviates from 30-day baseline.",
    resolved: false,
    isSystemGenerated: true,
    resolvedBy: undefined,
  },

  // ── CLEARANCE MISMATCH PROBE ──────────────────────────────────────────────
  {
    id: "demo-clearance-001",
    detectedAt: minsAgo(55),
    eventType: "clearance_mismatch_probe",
    affectedUserId: undefined,
    affectedFolderId: "folder-tsci-001",
    severity: "high",
    description:
      "Direct URL probe to TS/SCI folder endpoint detected from a session authenticated with clearance level 2. AI pattern recognition matched this to known enumeration behavior. Access blocked.",
    resolved: false,
    isSystemGenerated: true,
    resolvedBy: undefined,
  },

  // ── PERMISSION ESCALATION ATTEMPT ────────────────────────────────────────
  {
    id: "demo-escalation-001",
    detectedAt: hoursAgo(4),
    eventType: "privilege_escalation",
    affectedUserId: undefined,
    affectedFolderId: undefined,
    severity: "critical",
    description:
      "API call to setFolderPermission detected without valid S2 admin token. The call attempted to grant Owner-level access to TS/SCI folder for CIV Morton. Request rejected. Possible insider threat or compromised session.",
    resolved: false,
    isSystemGenerated: true,
    resolvedBy: undefined,
  },

  // ── SESSION ANOMALY ───────────────────────────────────────────────────────
  {
    id: "demo-session-001",
    detectedAt: hoursAgo(1),
    eventType: "concurrent_session_violation",
    affectedUserId: undefined,
    affectedFolderId: undefined,
    severity: "medium",
    description:
      "Two concurrent authenticated sessions detected for the same principal within a 3-minute window from different IP contexts. Second session was terminated automatically. Possible credential sharing.",
    resolved: true,
    isSystemGenerated: true,
    resolvedBy: undefined,
  },

  // ── MESSAGE EXFIL PROBE ───────────────────────────────────────────────────
  {
    id: "demo-message-001",
    detectedAt: hoursAgo(3),
    eventType: "sensitive_data_in_message",
    affectedUserId: undefined,
    affectedFolderId: undefined,
    severity: "medium",
    description:
      "Outbound message from CIV Morton scanned by AI content filter. Message body contained patterns matching classified document identifiers. Message was flagged and held pending S2 review.",
    resolved: false,
    isSystemGenerated: true,
    resolvedBy: undefined,
  },

  // ── LOW-LEVEL ROUTINE AUDIT ───────────────────────────────────────────────
  {
    id: "demo-audit-001",
    detectedAt: hoursAgo(6),
    eventType: "profile_update",
    affectedUserId: undefined,
    affectedFolderId: undefined,
    severity: "low",
    description:
      "Profile update executed for SGT Reyes by S2 admin (CPT Harris). Fields changed: orgRole, clearanceLevel (2→3). Change was authorized and logged. Commander authorization reference: CMD-2024-1147.",
    resolved: true,
    isSystemGenerated: false,
    resolvedBy: undefined,
  },

  // ── PERMISSION CHANGE ─────────────────────────────────────────────────────
  {
    id: "demo-perm-001",
    detectedAt: hoursAgo(5),
    eventType: "permission_change",
    affectedUserId: undefined,
    affectedFolderId: "folder-secret-003",
    severity: "low",
    description:
      "Folder permission updated for SGT Reyes on Operational Orders — SECRET. Role changed from Viewer to Editor. needToKnow flag set to true. Action performed by CPT Harris (S2 admin).",
    resolved: true,
    isSystemGenerated: false,
    resolvedBy: undefined,
  },
];
