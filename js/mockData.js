import { EMPLOYEE_DATABASE } from './employeeDatabase.js';

export const SENAI_UNITS = [
  { id: "sp-euclidesfacchini", name: "SENAI 8.50 Euclides Facchini" },
  { id: "sp-ipiranga", name: "SENAI Ipiranga - Conde José Vicente de Azevedo" },
  { id: "sp-vilamariana", name: "SENAI Vila Mariana - A. Jacob Lafer" },
  { id: "sp-suicobrasileira", name: "SENAI Suíço-Brasileira - Paulo Ernesto Tolle" },
  { id: "sp-santoandre", name: "SENAI Santo André - A. Jacob Lafer" },
  { id: "sp-campinas", name: "SENAI Campinas - Roberto Mange" },
  { id: "sp-sorocaba", name: "SENAI Sorocaba - Gasparian" },
  { id: "sp-saobernardo", name: "SENAI São Bernardo - Almirante Tamandaré" }
];

// Lista consolidada de Áreas extraídas da base oficial do SENAI Euclides Facchini
export const DEPARTMENTS = [
  "Alimentos",
  "Automação",
  "Automotiva",
  "Construção Civil",
  "Coordenação Administrativa",
  "Eletricidade",
  "Eletroeletrônica",
  "Geral",
  "Gestão",
  "Gestão / Logística / Informática",
  "Gestão / Qualidade",
  "Logística",
  "Madeira e Mobiliário",
  "Manutenção Industrial",
  "Metalmecânica",
  "Movelaria",
  "Qualidade de Vida",
  "Saúde e Segurança no Trabalho",
  "Secretaria & Atendimento",
  "Soldagem",
  "Tecnologia da Informação",
  "Vestuário"
];

// Matrizes de EPIs por Área de Atuação e Especialidade (NR-6 / SENAI-SP)
export const AREA_EPI_REQUIREMENTS = {
  "Soldagem": [
    { name: "Máscara de Solda Auto-Escurecedora", ca: "39872", validityMonths: 12 },
    { name: "Avental de Raspa de Couro", ca: "28410", validityMonths: 12 },
    { name: "Luva de Raspa Canos Longo", ca: "15920", validityMonths: 6 },
    { name: "Óculos de Proteção Incolor", ca: "11234", validityMonths: 12 },
    { name: "Calçado de Segurança c/ Bico de Aço", ca: "41029", validityMonths: 12 },
    { name: "Protetor Auditivo do Tipo Plug/Concha", ca: "26711", validityMonths: 6 }
  ],
  "Metalmecânica": [
    { name: "Óculos de Proteção Incolor", ca: "11234", validityMonths: 12 },
    { name: "Calçado de Segurança c/ Bico de Aço", ca: "41029", validityMonths: 12 },
    { name: "Protetor Auditivo do Tipo Plug", ca: "14882", validityMonths: 6 },
    { name: "Luva Pigmentada Nitrílica", ca: "34910", validityMonths: 6 }
  ],
  "Automotiva": [
    { name: "Óculos de Proteção Incolor", ca: "11234", validityMonths: 12 },
    { name: "Calçado de Segurança c/ Bico de Aço", ca: "41029", validityMonths: 12 },
    { name: "Protetor Auditivo do Tipo Plug", ca: "14882", validityMonths: 6 },
    { name: "Luva Pigmentada Nitrílica", ca: "34910", validityMonths: 6 }
  ],
  "Eletricidade": [
    { name: "Capacete de Segurança Classe B (Dielétrico)", ca: "29841", validityMonths: 24 },
    { name: "Luva Isolante de Borracha Alta Voltagem", ca: "33120", validityMonths: 6 },
    { name: "Óculos de Proteção Contra Arco Elétrico", ca: "44901", validityMonths: 12 },
    { name: "Calçado Isolante Dielétrico", ca: "42110", validityMonths: 12 },
    { name: "Vestimenta NR-10 Anti-Chama", ca: "39200", validityMonths: 12 }
  ],
  "Eletroeletrônica": [
    { name: "Capacete de Segurança Classe B (Dielétrico)", ca: "29841", validityMonths: 24 },
    { name: "Luva Isolante de Borracha Alta Voltagem", ca: "33120", validityMonths: 6 },
    { name: "Óculos de Proteção Contra Arco Elétrico", ca: "44901", validityMonths: 12 },
    { name: "Calçado Isolante Dielétrico", ca: "42110", validityMonths: 12 },
    { name: "Vestimenta NR-10 Anti-Chama", ca: "39200", validityMonths: 12 }
  ],
  "Automação": [
    { name: "Capacete de Segurança Classe B (Dielétrico)", ca: "29841", validityMonths: 24 },
    { name: "Luva Isolante de Borracha Alta Voltagem", ca: "33120", validityMonths: 6 },
    { name: "Óculos de Proteção Contra Arco Elétrico", ca: "44901", validityMonths: 12 },
    { name: "Calçado Isolante Dielétrico", ca: "42110", validityMonths: 12 },
    { name: "Vestimenta NR-10 Anti-Chama", ca: "39200", validityMonths: 12 }
  ],
  "Manutenção Industrial": [
    { name: "Calçado de Segurança c/ Bico de Conformação", ca: "41029", validityMonths: 12 },
    { name: "Óculos de Proteção Incolor", ca: "11234", validityMonths: 12 },
    { name: "Protetor Auditivo do Tipo Concha", ca: "26711", validityMonths: 12 },
    { name: "Luva de Vaqueta", ca: "18930", validityMonths: 6 },
    { name: "Capacete de Segurança c/ Carneira", ca: "29841", validityMonths: 24 }
  ],
  "Madeira e Mobiliário": [
    { name: "Óculos de Proteção Incolor", ca: "11234", validityMonths: 12 },
    { name: "Calçado de Segurança c/ Bico de Aço", ca: "41029", validityMonths: 12 },
    { name: "Protetor Auditivo do Tipo Concha", ca: "26711", validityMonths: 12 },
    { name: "Respirador Semifacial c/ Filtro VO/GA", ca: "17820", validityMonths: 6 },
    { name: "Luva de Vaqueta", ca: "18930", validityMonths: 6 }
  ],
  "Movelaria": [
    { name: "Óculos de Proteção Incolor", ca: "11234", validityMonths: 12 },
    { name: "Calçado de Segurança c/ Bico de Aço", ca: "41029", validityMonths: 12 },
    { name: "Protetor Auditivo do Tipo Concha", ca: "26711", validityMonths: 12 },
    { name: "Respirador Semifacial c/ Filtro VO/GA", ca: "17820", validityMonths: 6 },
    { name: "Luva de Vaqueta", ca: "18930", validityMonths: 6 }
  ],
  "Alimentos": [
    { name: "Jaleco de Algodão Manga Longa Anti-Ácido", ca: "40192", validityMonths: 12 },
    { name: "Óculos de Ampla Visão para Químicos", ca: "28910", validityMonths: 12 },
    { name: "Calçado Antiderrapante Impermeável", ca: "38921", validityMonths: 12 },
    { name: "Luva Nitrílica Solvex", ca: "21940", validityMonths: 6 }
  ],
  "Vestuário": [
    { name: "Óculos de Proteção Incolor", ca: "11234", validityMonths: 12 },
    { name: "Calçado de Segurança c/ Bico de Conformação", ca: "41029", validityMonths: 12 },
    { name: "Protetor Auditivo do Tipo Plug", ca: "14882", validityMonths: 12 }
  ],
  "Construção Civil": [
    { name: "Capacete de Segurança c/ Carneira", ca: "29841", validityMonths: 24 },
    { name: "Calçado de Segurança c/ Bico de Aço", ca: "41029", validityMonths: 12 },
    { name: "Óculos de Proteção Incolor", ca: "11234", validityMonths: 12 },
    { name: "Luva de Vaqueta", ca: "18930", validityMonths: 6 },
    { name: "Protetor Auditivo do Tipo Plug", ca: "14882", validityMonths: 12 }
  ],
  "Saúde e Segurança no Trabalho": [
    { name: "Capacete de Segurança c/ Carneira", ca: "29841", validityMonths: 24 },
    { name: "Calçado de Segurança c/ Bico de Aço", ca: "41029", validityMonths: 12 },
    { name: "Óculos de Proteção Incolor", ca: "11234", validityMonths: 12 },
    { name: "Protetor Auditivo do Tipo Plug/Concha", ca: "26711", validityMonths: 12 }
  ],
  "default": [
    { name: "Calçado de Segurança Leve", ca: "41029", validityMonths: 24 },
    { name: "Óculos de Proteção Incolor", ca: "11234", validityMonths: 24 }
  ]
};

export const ROLE_EPI_MATRIX = {};

// Preencher ROLE_EPI_MATRIX tanto por cargo quanto por área
EMPLOYEE_DATABASE.forEach(emp => {
  const reqs = AREA_EPI_REQUIREMENTS[emp.area] || AREA_EPI_REQUIREMENTS["default"];
  ROLE_EPI_MATRIX[emp.role] = reqs;
  if (!ROLE_EPI_MATRIX[emp.area]) {
    ROLE_EPI_MATRIX[emp.area] = reqs;
  }
});

// Suporte para cargos legados caso referenciados
ROLE_EPI_MATRIX["Instrutor de Soldagem"] = AREA_EPI_REQUIREMENTS["Soldagem"];
ROLE_EPI_MATRIX["Técnico de Usinagem CNC"] = AREA_EPI_REQUIREMENTS["Metalmecânica"];
ROLE_EPI_MATRIX["Especialista em Eletroeletrônica"] = AREA_EPI_REQUIREMENTS["Eletroeletrônica"];
ROLE_EPI_MATRIX["Mecânico de Manutenção"] = AREA_EPI_REQUIREMENTS["Manutenção Industrial"];
ROLE_EPI_MATRIX["Assistente Administrativo / T.I."] = AREA_EPI_REQUIREMENTS["default"];

// Catálogo consolidado de todos os EPIs
const _epiMap = new Map();
Object.values(AREA_EPI_REQUIREMENTS).forEach(list => {
  list.forEach(epi => {
    if (!_epiMap.has(epi.name)) {
      _epiMap.set(epi.name, { name: epi.name, ca: epi.ca, validityMonths: epi.validityMonths });
    }
  });
});

export const EPI_CATALOG = Array.from(_epiMap.values()).sort((a, b) =>
  a.name.localeCompare(b.name, 'pt-BR')
);

function getRelativeDate(daysOffset) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

function formatCorporateEmail(name) {
  const clean = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z\s]/g, "");
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]}.${parts[parts.length - 1]}@sp.senai.br`;
  }
  return `${parts[0] || 'colaborador'}@sp.senai.br`;
}

// Geração inicial dos Colaboradores vinculados às Áreas e Setores oficiais
export const INITIAL_COLLABORATORS = EMPLOYEE_DATABASE.map((emp, index) => {
  const requiredEPIs = AREA_EPI_REQUIREMENTS[emp.area] || AREA_EPI_REQUIREMENTS["default"];
  
  // Membros destacados da CIPA
  const isCipa = [
    "01108210", // SIDNEI MARCIO DO NASCIMENTO (SST)
    "01108206", // MAINAN MARCATO (SST)
    "01049580", // ALEXANDRE FELIX DE ARAUJO (Metalmecânica)
    "01101672", // FLAVIO HENRIQUE BRESCANSIN (Soldagem)
    "00075636", // JOSE ROGERIO DA SILVA (Manutenção)
    "01090987", // APARECIDA ZANGRANDO (Vestuário)
    "01094692", // DANIEL DA SILVA MACHADO (TI)
    "01021529"  // BRUNO ALVES DE SOUZA (Metalmecânica)
  ].includes(emp.nif);

  // Variação controlada de status de conformidade
  let epis = [];
  const statusMod = index % 8;

  if (statusMod === 2) {
    // Possui um EPI com vencimento próximo (10 a 25 dias)
    epis = requiredEPIs.map((req, rIdx) => {
      const isWarn = rIdx === 0;
      return {
        id: `epi-${emp.nif}-${rIdx + 1}`,
        name: req.name,
        ca: req.ca,
        deliveryDate: getRelativeDate(isWarn ? -170 : -60),
        expiryDate: getRelativeDate(isWarn ? 12 : 180),
        status: isWarn ? "warning" : "valid"
      };
    });
  } else if (statusMod === 5) {
    // Possui um EPI vencido (-15 dias)
    epis = requiredEPIs.map((req, rIdx) => {
      const isExpired = rIdx === 0;
      return {
        id: `epi-${emp.nif}-${rIdx + 1}`,
        name: req.name,
        ca: req.ca,
        deliveryDate: getRelativeDate(isExpired ? -380 : -90),
        expiryDate: getRelativeDate(isExpired ? -15 : 210),
        status: isExpired ? "expired" : "valid"
      };
    });
  } else if (statusMod === 7) {
    // EPI em falta (faltando o último item da lista)
    epis = requiredEPIs.slice(0, Math.max(1, requiredEPIs.length - 1)).map((req, rIdx) => ({
      id: `epi-${emp.nif}-${rIdx + 1}`,
      name: req.name,
      ca: req.ca,
      deliveryDate: getRelativeDate(-75),
      expiryDate: getRelativeDate(220),
      status: "valid"
    }));
  } else {
    // 100% Conforme e válido
    epis = requiredEPIs.map((req, rIdx) => ({
      id: `epi-${emp.nif}-${rIdx + 1}`,
      name: req.name,
      ca: req.ca,
      deliveryDate: getRelativeDate(-50 - (rIdx * 15)),
      expiryDate: getRelativeDate(180 + (rIdx * 30)),
      status: "valid"
    }));
  }

  return {
    id: `col-${emp.nif}`,
    name: emp.name,
    re: `SN-${emp.nif}`,
    unit: "SENAI 8.50 Euclides Facchini",
    department: emp.area,
    sector: emp.sector,
    role: emp.role,
    email: formatCorporateEmail(emp.name),
    phone: "(17) 3426-8800",
    cipaMember: isCipa,
    epis: epis
  };
});

export const INITIAL_STOCK = [
  { id: "stock-1", epiName: "Óculos de Proteção Incolor", ca: "11234", category: "Proteção Ocular", quantity: 65, minQuantity: 20, unit: "un", location: "Armário A-01" },
  { id: "stock-2", epiName: "Calçado de Segurança c/ Bico de Aço", ca: "41029", category: "Proteção dos Pés", quantity: 38, minQuantity: 15, unit: "pares", location: "Prateleira P-03" },
  { id: "stock-3", epiName: "Protetor Auditivo do Tipo Plug", ca: "14882", category: "Proteção Auditiva", quantity: 80, minQuantity: 25, unit: "pares", location: "Gaveteiro G-02" },
  { id: "stock-4", epiName: "Protetor Auditivo do Tipo Plug/Concha", ca: "26711", category: "Proteção Auditiva", quantity: 24, minQuantity: 10, unit: "un", location: "Gaveteiro G-03" },
  { id: "stock-5", epiName: "Luva de Raspa Canos Longo", ca: "15920", category: "Proteção das Mãos", quantity: 18, minQuantity: 12, unit: "pares", location: "Prateleira P-01" },
  { id: "stock-6", epiName: "Avental de Raspa de Couro", ca: "28410", category: "Proteção Corporal", quantity: 16, minQuantity: 6, unit: "un", location: "Cabideiro C-01" },
  { id: "stock-7", epiName: "Máscara de Solda Auto-Escurecedora", ca: "39872", category: "Proteção Facial/Visual", quantity: 9, minQuantity: 5, unit: "un", location: "Armário A-02" },
  { id: "stock-8", epiName: "Luva Pigmentada Nitrílica", ca: "34910", category: "Proteção das Mãos", quantity: 35, minQuantity: 15, unit: "pares", location: "Prateleira P-02" },
  { id: "stock-9", epiName: "Capacete de Segurança Classe B (Dielétrico)", ca: "29841", category: "Proteção da Cabeça", quantity: 15, minQuantity: 6, unit: "un", location: "Armário B-01" },
  { id: "stock-10", epiName: "Luva Isolante de Borracha Alta Voltagem", ca: "33120", category: "Proteção Elétrica", quantity: 5, minQuantity: 6, unit: "pares", location: "Cofre Elétrico" },
  { id: "stock-11", epiName: "Óculos de Proteção Contra Arco Elétrico", ca: "44901", category: "Proteção Ocular/Elétrica", quantity: 12, minQuantity: 5, unit: "un", location: "Armário B-02" },
  { id: "stock-12", epiName: "Calçado Isolante Dielétrico", ca: "42110", category: "Proteção dos Pés", quantity: 10, minQuantity: 5, unit: "pares", location: "Prateleira P-04" },
  { id: "stock-13", epiName: "Vestimenta NR-10 Anti-Chama", ca: "39200", category: "Proteção Corporal", quantity: 12, minQuantity: 5, unit: "conjuntos", location: "Cabideiro C-02" },
  { id: "stock-14", epiName: "Jaleco de Algodão Manga Longa Anti-Ácido", ca: "40192", category: "Proteção Corporal", quantity: 22, minQuantity: 8, unit: "un", location: "Armário Alimentos" },
  { id: "stock-15", epiName: "Óculos de Ampla Visão para Químicos", ca: "28910", category: "Proteção Ocular", quantity: 18, minQuantity: 6, unit: "un", location: "Armário Alimentos" },
  { id: "stock-16", epiName: "Respirador Semifacial c/ Filtro VO/GA", ca: "17820", category: "Proteção Respiratória", quantity: 8, minQuantity: 8, unit: "un", location: "Armário Química/Madeira" },
  { id: "stock-17", epiName: "Luva Nitrílica Solvex", ca: "21940", category: "Proteção das Mãos", quantity: 30, minQuantity: 10, unit: "pares", location: "Prateleira P-02" },
  { id: "stock-18", epiName: "Calçado Antiderrapante Impermeável", ca: "38921", category: "Proteção dos Pés", quantity: 20, minQuantity: 8, unit: "pares", location: "Prateleira P-03" },
  { id: "stock-19", epiName: "Calçado de Segurança c/ Bico de Conformação", ca: "41029", category: "Proteção dos Pés", quantity: 16, minQuantity: 8, unit: "pares", location: "Prateleira P-03" },
  { id: "stock-20", epiName: "Luva de Vaqueta", ca: "18930", category: "Proteção das Mãos", quantity: 25, minQuantity: 10, unit: "pares", location: "Prateleira P-01" },
  { id: "stock-21", epiName: "Capacete de Segurança c/ Carneira", ca: "29841", category: "Proteção da Cabeça", quantity: 14, minQuantity: 6, unit: "un", location: "Armário B-01" },
  { id: "stock-22", epiName: "Calçado de Segurança Leve", ca: "41029", category: "Proteção dos Pés", quantity: 25, minQuantity: 10, unit: "pares", location: "Prateleira P-04" }
];
