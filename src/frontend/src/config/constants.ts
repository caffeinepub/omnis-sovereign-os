// ─── Branch / Rank / Category Mappings ────────────────────────────────────────

export const BRANCH_RANK_CATEGORIES: Record<
  string,
  Record<string, string[]>
> = {
  Army: {
    Enlisted: [
      "Private (PVT)",
      "Private Second Class (PV2)",
      "Private First Class (PFC)",
      "Specialist (SPC)",
      "Corporal (CPL)",
      "Sergeant (SGT)",
      "Staff Sergeant (SSG)",
      "Sergeant First Class (SFC)",
      "Master Sergeant (MSG)",
      "First Sergeant (1SG)",
      "Sergeant Major (SGM)",
      "Command Sergeant Major (CSM)",
      "Sergeant Major of the Army (SMA)",
    ],
    "Warrant Officer": [
      "Warrant Officer 1 (WO1)",
      "Chief Warrant Officer 2 (CW2)",
      "Chief Warrant Officer 3 (CW3)",
      "Chief Warrant Officer 4 (CW4)",
      "Chief Warrant Officer 5 (CW5)",
    ],
    Officer: [
      "Second Lieutenant (2LT)",
      "First Lieutenant (1LT)",
      "Captain (CPT)",
      "Major (MAJ)",
      "Lieutenant Colonel (LTC)",
      "Colonel (COL)",
      "Brigadier General (BG)",
      "Major General (MG)",
      "Lieutenant General (LTG)",
      "General (GEN)",
    ],
  },
  Navy: {
    Enlisted: [
      "Seaman Recruit (SR)",
      "Seaman Apprentice (SA)",
      "Seaman (SN)",
      "Petty Officer 3rd Class (PO3)",
      "Petty Officer 2nd Class (PO2)",
      "Petty Officer 1st Class (PO1)",
      "Chief Petty Officer (CPO)",
      "Senior Chief Petty Officer (SCPO)",
      "Master Chief Petty Officer (MCPO)",
      "Fleet Master Chief (FLTCM)",
      "Master Chief Petty Officer of the Navy (MCPON)",
    ],
    "Warrant Officer": [
      "Chief Warrant Officer 2 (CWO2)",
      "Chief Warrant Officer 3 (CWO3)",
      "Chief Warrant Officer 4 (CWO4)",
      "Chief Warrant Officer 5 (CWO5)",
    ],
    Officer: [
      "Ensign (ENS)",
      "Lieutenant Junior Grade (LTJG)",
      "Lieutenant (LT)",
      "Lieutenant Commander (LCDR)",
      "Commander (CDR)",
      "Captain (CAPT)",
      "Rear Admiral Lower Half (RDML)",
      "Rear Admiral Upper Half (RADM)",
      "Vice Admiral (VADM)",
      "Admiral (ADM)",
      "Fleet Admiral (FADM)",
    ],
  },
  "Air Force": {
    Enlisted: [
      "Airman Basic (AB)",
      "Airman (Amn)",
      "Airman First Class (A1C)",
      "Senior Airman (SrA)",
      "Staff Sergeant (SSgt)",
      "Technical Sergeant (TSgt)",
      "Master Sergeant (MSgt)",
      "Senior Master Sergeant (SMSgt)",
      "Chief Master Sergeant (CMSgt)",
      "Command Chief Master Sergeant (CCM)",
      "Chief Master Sergeant of the Air Force (CMSAF)",
    ],
    Officer: [
      "Second Lieutenant (2d Lt)",
      "First Lieutenant (1st Lt)",
      "Captain (Capt)",
      "Major (Maj)",
      "Lieutenant Colonel (Lt Col)",
      "Colonel (Col)",
      "Brigadier General (Brig Gen)",
      "Major General (Maj Gen)",
      "Lieutenant General (Lt Gen)",
      "General (Gen)",
      "General of the Air Force (GAF)",
    ],
  },
  "Marine Corps": {
    Enlisted: [
      "Private (Pvt)",
      "Private First Class (PFC)",
      "Lance Corporal (LCpl)",
      "Corporal (Cpl)",
      "Sergeant (Sgt)",
      "Staff Sergeant (SSgt)",
      "Gunnery Sergeant (GySgt)",
      "Master Sergeant (MSgt)",
      "First Sergeant (1stSgt)",
      "Master Gunnery Sergeant (MGySgt)",
      "Sergeant Major (SgtMaj)",
      "Sergeant Major of the Marine Corps (SMMC)",
    ],
    "Warrant Officer": [
      "Warrant Officer 1 (WO1)",
      "Chief Warrant Officer 2 (CWO2)",
      "Chief Warrant Officer 3 (CWO3)",
      "Chief Warrant Officer 4 (CWO4)",
      "Chief Warrant Officer 5 (CWO5)",
    ],
    Officer: [
      "Second Lieutenant (2ndLt)",
      "First Lieutenant (1stLt)",
      "Captain (Capt)",
      "Major (Maj)",
      "Lieutenant Colonel (LtCol)",
      "Colonel (Col)",
      "Brigadier General (BGen)",
      "Major General (MajGen)",
      "Lieutenant General (LtGen)",
      "General (Gen)",
      "Assistant Commandant of the Marine Corps (ACMC)",
    ],
  },
  "Coast Guard": {
    Enlisted: [
      "Seaman Recruit (SR)",
      "Seaman Apprentice (SA)",
      "Seaman (SN)",
      "Petty Officer 3rd Class (PO3)",
      "Petty Officer 2nd Class (PO2)",
      "Petty Officer 1st Class (PO1)",
      "Chief Petty Officer (CPO)",
      "Senior Chief Petty Officer (SCPO)",
      "Master Chief Petty Officer (MCPO)",
      "Master Chief Petty Officer of the Coast Guard (MCPOCG)",
    ],
    Officer: [
      "Ensign (ENS)",
      "Lieutenant Junior Grade (LTJG)",
      "Lieutenant (LT)",
      "Lieutenant Commander (LCDR)",
      "Commander (CDR)",
      "Captain (CAPT)",
      "Rear Admiral Lower Half (RDML)",
      "Rear Admiral Upper Half (RADM)",
      "Vice Admiral (VADM)",
      "Admiral (ADM)",
    ],
  },
  "Space Force": {
    Enlisted: [
      "Specialist 1 (Spc1)",
      "Specialist 2 (Spc2)",
      "Specialist 3 (Spc3)",
      "Specialist 4 (Spc4)",
      "Sergeant (Sgt)",
      "Technical Sergeant (TSgt)",
      "Master Sergeant (MSgt)",
      "Senior Master Sergeant (SMSgt)",
      "Chief Master Sergeant (CMSgt)",
      "Command Chief Master Sergeant (CCM)",
      "Chief Master Sergeant of the Space Force (CMSSF)",
    ],
    Officer: [
      "Second Lieutenant (2d Lt)",
      "First Lieutenant (1st Lt)",
      "Captain (Capt)",
      "Major (Maj)",
      "Lieutenant Colonel (Lt Col)",
      "Colonel (Col)",
      "Brigadier General (Brig Gen)",
      "Major General (Maj Gen)",
      "Lieutenant General (Lt Gen)",
      "General (Gen)",
    ],
  },
  "GS / Civilian": {
    "GS Schedule": [
      "GS-1",
      "GS-2",
      "GS-3",
      "GS-4",
      "GS-5",
      "GS-6",
      "GS-7",
      "GS-8",
      "GS-9",
      "GS-10",
      "GS-11",
      "GS-12",
      "GS-13",
      "GS-14",
      "GS-15",
    ],
    "Senior Executive": [
      "SES (Senior Executive Service)",
      "ST (Senior Technical)",
      "SL (Senior Level)",
    ],
  },
  Corporate: {
    "Individual Contributor": [
      "Intern",
      "Associate",
      "Analyst",
      "Senior Analyst",
      "Specialist",
      "Senior Specialist",
      "Lead",
    ],
    Management: ["Manager", "Senior Manager", "Director", "Senior Director"],
    Executive: [
      "Vice President",
      "Senior Vice President",
      "Executive Vice President",
      "C-Suite / Officer",
    ],
  },
};

export const BRANCH_LIST = Object.keys(BRANCH_RANK_CATEGORIES);

export function getCategoriesForBranch(branch: string): string[] {
  return Object.keys(BRANCH_RANK_CATEGORIES[branch] ?? {});
}

export function getRanks(branch: string, category: string): string[] {
  return BRANCH_RANK_CATEGORIES[branch]?.[category] ?? [];
}

// ─── Clearance / Severity ─────────────────────────────────────────────────────

export const CLEARANCE_COLORS: Record<number, string> = {
  0: "gray",
  1: "green",
  2: "blue",
  3: "orange",
  4: "red",
};

export const CLEARANCE_LABELS: Record<number, string> = {
  0: "Unclassified",
  1: "CUI",
  2: "Secret",
  3: "Top Secret",
  4: "TS/SCI",
};

export const SEVERITY_COLORS: Record<string, string> = {
  low: "green",
  medium: "yellow",
  high: "orange",
  critical: "red",
};

export const THEME = {
  navy: "#0a0e1a",
  slate: "#1a2235",
  amber: "#f59e0b",
} as const;
