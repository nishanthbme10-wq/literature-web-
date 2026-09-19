export interface Coordinator {
  id: string;
  name: string;
  department: string;
  year: string;
  type: "student" | "faculty";
  designation?: string;
  title?: "Mr." | "Ms.";
}

export const coordinators: Coordinator[] = [
  /* =========================================================
     FACULTY
  ========================================================= */

  {
    id: "faculty-bt",
    name: "Dr. M. Aniskumar, M.Tech., Ph.D.",
    department: "Biotechnology",
    year: "",
    type: "faculty",
    designation:
      "Professor and Head of the Department",
  },

  {
    id: "faculty-bme",
    name: "Dr. K. Kavitha, Ph.D.",
    department: "Biomedical Engineering",
    year: "",
    type: "faculty",
    designation:
      "Professor and Head of the Department",
  },

  /* =========================================================
     BME STUDENT COORDINATORS
  ========================================================= */

  {
    id: "bme-nishanth",
    name: "T. Nishanth",
    department: "Biomedical Engineering",
    year: "3rd Year",
    type: "student",
    title: "Mr.",
  },

  {
    id: "bme-mohammed-arsath",
    name: "R. Mohammed Arsath",
    department: "Biomedical Engineering",
    year: "3rd Year",
    type: "student",
    title: "Mr.",
  },

  {
    id: "bme-suba-sree",
    name: "V. Suba Sree",
    department: "Biomedical Engineering",
    year: "2nd Year",
    type: "student",
    title: "Ms.",
  },

  {
    id: "bme-mounitha",
    name: "P. Mounitha",
    department: "Biomedical Engineering",
    year: "2nd Year",
    type: "student",
    title: "Ms.",
  },

  {
    id: "bme-mohammed-irfan",
    name: "Z. Mohammed Irfan",
    department: "Biomedical Engineering",
    year: "2nd Year",
    type: "student",
    title: "Mr.",
  },

  {
    id: "bme-shanmugagurusaresh",
    name: "B.Shanmugagurusaresh",
    department: "Biomedical Engineering",
    year: "2nd Year",
    type: "student",
    title: "Mr.",
  },

  {
    id: "bme-asmitha",
    name: "V. P. Asmitha",
    department: "Biomedical Engineering",
    year: "3rd Year",
    type: "student",
    title: "Ms.",
  },

  {
    id: "bme-kanishka",
    name: "T. Kanishka",
    department: "Biomedical Engineering",
    year: "2nd Year",
    type: "student",
    title: "Ms.",
  },

  {
    id: "bme-priyatharshini",
    name: "K. Priyatharshini",
    department: "Biomedical Engineering",
    year: "3rd Year",
    type: "student",
    title: "Ms.",
  },

  {
    id: "bme-sangeeth",
    name: "S.Sangeeth",
    department: "Biomedical Engineering",
    year: "3rd Year",
    type: "student",
    title: "Mr.",
  },

  /* =========================================================
     BT STUDENT COORDINATORS
  ========================================================= */

  {
    id: "bt-sri-suganth",
    name: "K. Sri Suganth",
    department: "Biotechnology",
    year: "3rd Year",
    type: "student",
    title: "Mr.",
  },

  {
    id: "bt-vishal",
    name: "V. Vishal",
    department: "Biotechnology",
    year: "3rd Year",
    type: "student",
    title: "Mr.",
  },

  {
    id: "bt-roshni",
    name: "K. Roshni",
    department: "Biotechnology",
    year: "3rd Year",
    type: "student",
    title: "Ms.",
  },

  {
    id: "bt-elakiya",
    name: "R. Elakiya",
    department: "Biotechnology",
    year: "3rd Year",
    type: "student",
    title: "Ms.",
  },

  {
    id: "bt-devi-biswas",
    name: "H. Devi Biswas",
    department: "Biotechnology",
    year: "2nd Year",
    type: "student",
    title: "Ms.",
  },

  {
    id: "bt-swetha",
    name: "R. Swetha",
    department: "Biotechnology",
    year: "3rd Year",
    type: "student",
    title: "Ms.",
  },

  {
    id: "bt-anumithra",
    name: "S. Anumithra",
    department: "Biotechnology",
    year: "2nd Year",
    type: "student",
    title: "Ms.",
  },

  {
    id: "bt-petchi-muthu",
    name: "B. Petchi Muthu",
    department: "Biotechnology",
    year: "2nd Year",
    type: "student",
    title: "Mr.",
  },

  {
    id: "bt-logesh",
    name: "S. Logesh",
    department: "Biotechnology",
    year: "2nd Year",
    type: "student",
    title: "Mr.",
  },
];