/* =========================================================
   LITERATURE CLUB PERMANENT MEMBER ID
   VSB Engineering College
========================================================= */

export const DEPARTMENT_SIGNATURES: Record<
  string,
  string
> = {
  "Biomedical Engineering": "PULSE",
  BME: "PULSE",

  Biotechnology: "GENOME",
  BT: "GENOME",

  "Computer Science and Engineering": "CODEX",
  CSE: "CODEX",

  "Electronics and Communication Engineering":
    "SIGNAL",
  ECE: "SIGNAL",

  "Electrical and Electronics Engineering":
    "VOLT",
  EEE: "VOLT",

  "Mechanical Engineering": "FORGE",
  Mechanical: "FORGE",
  MECH: "FORGE",

  "Civil Engineering": "STRUCTA",
  Civil: "STRUCTA",
  CIVIL: "STRUCTA",

  "Artificial Intelligence and Data Science":
    "INSIGHT",
  "AI&DS": "INSIGHT",
  AIDS: "INSIGHT",
  "AI & DS": "INSIGHT",

  "Artificial Intelligence and Machine Learning":
    "NEURA",
  AIML: "NEURA",

  "Computer and Communication Engineering":
    "LINK",
  CCE: "LINK",

  "Chemical Engineering": "CATALYST",
  Chemical: "CATALYST",
  CHEMICAL: "CATALYST",

  "Computer Science and Business Systems":
    "NEXUS",
  CSBS: "NEXUS",

  "Information Technology": "BYTE",
  IT: "BYTE",
};

/* =========================================================
   GET SIGNATURE
========================================================= */

export function getDepartmentSignature(
  department: string
): string {
  const cleanDepartment =
    String(
      department || ""
    )
      .trim();

  return (
    DEPARTMENT_SIGNATURES[
      cleanDepartment
    ] ??
    DEPARTMENT_SIGNATURES[
      cleanDepartment.toUpperCase()
    ] ??
    "MEMBER"
  );
}

/* =========================================================
   BUILD MEMBER ID
========================================================= */

export function buildClubMemberId(
  department: string,
  serialNumber: number
): string {
  const signature =
    getDepartmentSignature(
      department
    );

  const serial =
    String(
      serialNumber
    ).padStart(4, "0");

  return `VSBLC-${signature}-${serial}`;
}