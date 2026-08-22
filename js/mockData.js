import { EMPLOYEE_DATABASE } from './employeeDatabase.js';

export const SENAI_UNITS = [
  { id: "sp-euclidesfacchini", name: "SENAI 8.50 Euclides Facchini" },
  { id: "sp-ipiranga", name: "SENAI Ipiranga - Conde José Vicente de Azevedo" },
  { id: "sp-vilamariana", name: "SENAI Vila Mariana - A. Jacob Lafer" },
  { id: "sp-suicobrasileira", name: "SENAI Suíço-Brasileira - Paulo Ernesto Tolle" },
  { id: "sp-santoandre", name: "SENAI Santo Andre - A. Jacob Lafer" },
  { id: "sp-campinas", name: "SENAI Campinas - Roberto Mange" },
  { id: "sp-sorocaba", name: "SENAI Sorocaba - Gasparian" },
  { id: "sp-saobernardo", name: "SENAI São Bernardo - Almirante Tamandaré" }
];

export const DEPARTMENTS = [
  "Usinagem CNC & Mecânica",
  "Caldeiraria & Soldagem",
  "Eletroeletrônica & Automação",
  "Laboratório de Química",
  "Manutenção Industrial",
  "Automotiva & Mecatrônica",
  "Administrativo & T.I."
];

export const ROLE_EPI_MATRIX = {
  "Instrutor de Soldagem": [
    { name: "Máscara de Solda Auto-Escurecedora", ca: "39872", validityMonths: 12 },
    { name: "Avental de Raspa de Couro", ca: "28410", validityMonths: 12 },
    { name: "Luva de Raspa Canos Longo", ca: "15920", validityMonths: 6 },
    { name: "Óculos de Proteção Incolor", ca: "11234", validityMonths: 12 },
    { name: "Calçado de Segurança c/ Bico de Aço", ca: "41029", validityMonths: 12 },
    { name: "Protetor Auditivo do Tipo Plug/Concha", ca: "26711", validityMonths: 6 }
  ],
  "Técnico de Usinagem CNC": [
    { name: "Óculos de Proteção Incolor", ca: "11234", validityMonths: 12 },
    { name: "Calçado de Segurança c/ Bico de Aço", ca: "41029", validityMonths: 12 },
    { name: "Protetor Auditivo do Tipo Plug", ca: "14882", validityMonths: 6 },
    { name: "Luva Pigmentada Nitrílica", ca: "34910", validityMonths: 6 }
  ],
  "Especialista em Eletroeletrônica": [
    { name: "Capacete de Segurança Classe B (Dielétrico)", ca: "29841", validityMonths: 24 },
    { name: "Luva Isolante de Borracha Alta Voltagem", ca: "33120", validityMonths: 6 },
    { name: "Óculos de Proteção Contra Arco Elétrico", ca: "44901", validityMonths: 12 },
    { name: "Calçado Isolante Dielétrico", ca: "42110", validityMonths: 12 },
    { name: "Vestimenta NR-10 Anti-Chama", ca: "39200", validityMonths: 12 }
  ],
  "Técnico de Laboratório de Química": [
    { name: "Jaleco de Algodão Manga Longa Anti-Ácido", ca: "40192", validityMonths: 12 },
    { name: "Óculos de Ampla Visão para Químicos", ca: "28910", validityMonths: 12 },
    { name: "Respirador Semifacial c/ Filtro VO/GA", ca: "17820", validityMonths: 6 },
    { name: "Luva Nitrílica Solvex", ca: "21940", validityMonths: 6 },
    { name: "Calçado Antiderrapante Impermeável", ca: "38921", validityMonths: 12 }
  ],
  "Mecânico de Manutenção": [
    { name: "Calçado de Segurança c/ Bico de Conformação", ca: "41029", validityMonths: 12 },
    { name: "Óculos de Proteção Incolor", ca: "11234", validityMonths: 12 },
    { name: "Protetor Auditivo do Tipo Concha", ca: "26711", validityMonths: 12 },
    { name: "Luva de Vaqueta", ca: "18930", validityMonths: 6 },
    { name: "Capacete de Segurança c/ Carneira", ca: "29841", validityMonths: 24 }
  ],
  "Assistente Administrativo / T.I.": [
    { name: "Calçado de Segurança Leve", ca: "41029", validityMonths: 24 },
    { name: "Óculos de Proteção Incolor (Visita técnica)", ca: "11234", validityMonths: 24 }
  ]
};

// Matrizes base de EPIs para mapeamento dos cargos dinâmicos
const BASE_MATRICES = {
  soldagem: ROLE_EPI_MATRIX["Instrutor de Soldagem"],
  usinagem: ROLE_EPI_MATRIX["Técnico de Usinagem CNC"],
  eletro: ROLE_EPI_MATRIX["Especialista em Eletroeletrônica"],
  quimica: ROLE_EPI_MATRIX["Técnico de Laboratório de Química"],
  manutencao: ROLE_EPI_MATRIX["Mecânico de Manutenção"],
  admin: ROLE_EPI_MATRIX["Assistente Administrativo / T.I."]
};

// Expandir a matriz de EPIs com os cargos dinâmicos do banco de dados do PDF
EMPLOYEE_DATABASE.forEach(emp => {
  const role = emp.role;
  if (!ROLE_EPI_MATRIX[role]) {
    if (role.includes("INSTRUTOR") || role.includes("IFP") || role.includes("ORIENTADOR")) {
      ROLE_EPI_MATRIX[role] = BASE_MATRICES.soldagem;
    } else if (role.includes("MANUTENCAO") || role.includes("MARCENARIA") || role.includes("CONSERVACAO") || role.includes("OFICIAL DE MANUTENCAO")) {
      ROLE_EPI_MATRIX[role] = BASE_MATRICES.manutencao;
    } else if (role.includes("PROFESSOR")) {
      ROLE_EPI_MATRIX[role] = BASE_MATRICES.eletro;
    } else {
      ROLE_EPI_MATRIX[role] = BASE_MATRICES.admin;
    }
  }
});

// Data Helper to generate realistic dates relative to current date
function getRelativeDate(daysOffset) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

export const INITIAL_COLLABORATORS = [
  {
    id: "col-101",
    name: "Carlos Alberto Silva",
    re: "RE-884920",
    unit: "SENAI 8.50 Euclides Facchini",
    department: "Caldeiraria & Soldagem",
    role: "Instrutor de Soldagem",
    email: "carlos.silva@sp.senai.br",
    phone: "(11) 98765-4321",
    cipaMember: true,
    epis: [
      { id: "epi-1", name: "Máscara de Solda Auto-Escurecedora", ca: "39872", deliveryDate: getRelativeDate(-200), expiryDate: getRelativeDate(165), status: "valid" },
      { id: "epi-2", name: "Avental de Raspa de Couro", ca: "28410", deliveryDate: getRelativeDate(-300), expiryDate: getRelativeDate(65), status: "valid" },
      { id: "epi-3", name: "Luva de Raspa Canos Longo", ca: "15920", deliveryDate: getRelativeDate(-170), expiryDate: getRelativeDate(10), status: "warning" }, // Vence em 10 dias!
      { id: "epi-4", name: "Óculos de Proteção Incolor", ca: "11234", deliveryDate: getRelativeDate(-380), expiryDate: getRelativeDate(-15), status: "expired" }, // Vencido há 15 dias!
      { id: "epi-5", name: "Calçado de Segurança c/ Bico de Aço", ca: "41029", deliveryDate: getRelativeDate(-120), expiryDate: getRelativeDate(245), status: "valid" }
    ]
  },
  {
    id: "col-102",
    name: "Juliana Mendes Rocha",
    re: "RE-912044",
    unit: "SENAI Vila Mariana - A. Jacob Lafer",
    department: "Laboratório de Química",
    role: "Técnico de Laboratório de Química",
    email: "juliana.rocha@sp.senai.br",
    phone: "(11) 97654-1234",
    cipaMember: false,
    epis: [
      { id: "epi-6", name: "Jaleco de Algodão Manga Longa Anti-Ácido", ca: "40192", deliveryDate: getRelativeDate(-90), expiryDate: getRelativeDate(275), status: "valid" },
      { id: "epi-7", name: "Óculos de Ampla Visão para Químicos", ca: "28910", deliveryDate: getRelativeDate(-100), expiryDate: getRelativeDate(265), status: "valid" },
      { id: "epi-8", name: "Respirador Semifacial c/ Filtro VO/GA", ca: "17820", deliveryDate: getRelativeDate(-175), expiryDate: getRelativeDate(5), status: "warning" }, // Vence em 5 dias!
      { id: "epi-9", name: "Luva Nitrílica Solvex", ca: "21940", deliveryDate: getRelativeDate(-120), expiryDate: getRelativeDate(60), status: "valid" },
      { id: "epi-10", name: "Calçado Antiderrapante Impermeável", ca: "38921", deliveryDate: getRelativeDate(-50), expiryDate: getRelativeDate(315), status: "valid" }
    ]
  },
  {
    id: "col-103",
    name: "Roberto Fernando Souza",
    re: "RE-748911",
    unit: "SENAI Suíço-Brasileira - Paulo Ernesto Tolle",
    department: "Usinagem CNC & Mecânica",
    role: "Técnico de Usinagem CNC",
    email: "roberto.souza@sp.senai.br",
    phone: "(11) 96543-9876",
    cipaMember: true,
    epis: [
      { id: "epi-11", name: "Óculos de Proteção Incolor", ca: "11234", deliveryDate: getRelativeDate(-100), expiryDate: getRelativeDate(265), status: "valid" },
      { id: "epi-12", name: "Calçado de Segurança c/ Bico de Aço", ca: "41029", deliveryDate: getRelativeDate(-150), expiryDate: getRelativeDate(215), status: "valid" },
      { id: "epi-13", name: "Protetor Auditivo do Tipo Plug", ca: "14882", deliveryDate: getRelativeDate(-160), expiryDate: getRelativeDate(20), status: "warning" }
    ]
  },
  {
    id: "col-104",
    name: "Fernanda Lima de Oliveira",
    re: "RE-602931",
    unit: "SENAI Santo André - A. Jacob Lafer",
    department: "Eletroeletrônica & Automação",
    role: "Especialista em Eletroeletrônica",
    email: "fernanda.oliveira@sp.senai.br",
    phone: "(11) 95432-8765",
    cipaMember: false,
    epis: [
      { id: "epi-14", name: "Capacete de Segurança Classe B (Dielétrico)", ca: "29841", deliveryDate: getRelativeDate(-400), expiryDate: getRelativeDate(330), status: "valid" },
      { id: "epi-15", name: "Luva Isolante de Borracha Alta Voltagem", ca: "33120", deliveryDate: getRelativeDate(-190), expiryDate: getRelativeDate(-10), status: "expired" }, // Vencido há 10 dias!
      { id: "epi-16", name: "Óculos de Proteção Contra Arco Elétrico", ca: "44901", deliveryDate: getRelativeDate(-200), expiryDate: getRelativeDate(165), status: "valid" }
    ]
  },
  {
    id: "col-105",
    name: "Marcelo Henrique Duarte",
    re: "RE-553198",
    unit: "SENAI 8.50 Euclides Facchini",
    department: "Manutenção Industrial",
    role: "Mecânico de Manutenção",
    email: "marcelo.duarte@sp.senai.br",
    phone: "(11) 94321-7654",
    cipaMember: true,
    epis: [
      { id: "epi-17", name: "Calçado de Segurança c/ Bico de Conformação", ca: "41029", deliveryDate: getRelativeDate(-30), expiryDate: getRelativeDate(335), status: "valid" },
      { id: "epi-18", name: "Óculos de Proteção Incolor", ca: "11234", deliveryDate: getRelativeDate(-20), expiryDate: getRelativeDate(345), status: "valid" },
      { id: "epi-19", name: "Protetor Auditivo do Tipo Concha", ca: "26711", deliveryDate: getRelativeDate(-10), expiryDate: getRelativeDate(355), status: "valid" },
      { id: "epi-20", name: "Luva de Vaqueta", ca: "18930", deliveryDate: getRelativeDate(-5), expiryDate: getRelativeDate(175), status: "valid" },
      { id: "epi-21", name: "Capacete de Segurança c/ Carneira", ca: "29841", deliveryDate: getRelativeDate(-100), expiryDate: getRelativeDate(630), status: "valid" }
    ]
  },
  {
    id: "col-106",
    name: "Aline Vasconcelos",
    re: "RE-419082",
    unit: "SENAI São Bernardo - Almirante Tamandaré",
    department: "Automotiva & Mecatrônica",
    role: "Técnico de Usinagem CNC",
    email: "aline.vasconcelos@sp.senai.br",
    phone: "(11) 93210-6543",
    cipaMember: false,
    epis: [
      { id: "epi-22", name: "Óculos de Proteção Incolor", ca: "11234", deliveryDate: getRelativeDate(-350), expiryDate: getRelativeDate(15), status: "warning" },
      { id: "epi-23", name: "Calçado de Segurança c/ Bico de Aço", ca: "41029", deliveryDate: getRelativeDate(-380), expiryDate: getRelativeDate(-15), status: "expired" }
    ]
  }
];
