/* ==========================================================================
   EXPORTAÇÃO DE RELATÓRIOS E FICHA NR-6 - EXPORT JS
   ========================================================================== */

import { getCollaboratorOverallStatus, getMissingEPIsForCollaborator, calculateDaysRemaining } from './alerts.js';

/**
 * Generates an NR-6 compliant printable receipt HTML layout for a collaborator
 */
export function generateNR6PrintableHTML(collaborator) {
  const missing = getMissingEPIsForCollaborator(collaborator);
  const epis = collaborator.epis || [];

  const rowsHTML = epis.map((e, index) => {
    const days = calculateDaysRemaining(e.expiryDate);
    const statusText = days < 0 ? 'VENCIDO' : (days <= 30 ? 'VENCENDO' : 'VÁLIDO');
    return `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${e.name}</strong></td>
        <td>C.A. ${e.ca}</td>
        <td>${formatDate(e.deliveryDate)}</td>
        <td>${formatDate(e.expiryDate)}</td>
        <td>${statusText}</td>
        <td>Assinado Digitalmente</td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Ficha de Entrega de EPI - NR-6 SENAI-SP - ${collaborator.name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 2rem; color: #0F172A; }
        .header { text-align: center; border-bottom: 3px solid #E30613; padding-bottom: 1rem; margin-bottom: 1.5rem; }
        .header h1 { font-size: 1.4rem; color: #E30613; margin: 0; }
        .header h2 { font-size: 1rem; color: #0F172A; margin: 0.25rem 0; }
        .info-box { background: #F8FAFC; border: 1px solid #CBD5E1; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9rem; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.85rem; }
        th, td { border: 1px solid #94A3B8; padding: 0.6rem; text-align: left; }
        th { background: #F1F5F9; font-weight: bold; }
        .term { font-size: 0.8rem; line-height: 1.4; color: #475569; border: 1px solid #E2E8F0; padding: 1rem; background: #FAF9F6; margin-bottom: 2rem; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-top: 3rem; text-align: center; }
        .sig-line { border-top: 1px solid #0F172A; padding-top: 0.5rem; font-size: 0.85rem; font-weight: bold; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 1rem; text-align: right;">
        <button onclick="window.print()" style="background: #E30613; color: white; border: none; padding: 0.6rem 1.2rem; font-weight: bold; border-radius: 4px; cursor: pointer;">
          🖨️ Imprimir / Salvar PDF
        </button>
      </div>

      <div class="header">
        <img src="assets/senai-logo-official.png" alt="SENAI Logo Oficial" style="height: 48px; margin-bottom: 0.5rem;">
        <h1>SENAI 8.50 EUCLIDES FACCHINI | SERVIÇO NACIONAL DE APRENDIZAGEM INDUSTRIAL</h1>
        <h2>FICHA DE REGISTRO E TERMO DE ENTREGA DE EPI (NR-6)</h2>
        <p style="font-size: 0.8rem; color: #64748B;">CIPA - Comissão Interna de Prevenção de Acidentes e Assédio</p>
      </div>

      <div class="info-box">
        <div class="info-grid">
          <div><strong>Colaborador:</strong> ${collaborator.name}</div>
          <div><strong>SN / Registro:</strong> ${collaborator.re}</div>
          <div><strong>Unidade SENAI:</strong> ${collaborator.unit}</div>
          <div><strong>Departamento:</strong> ${collaborator.department}</div>
          <div><strong>Função / Cargo:</strong> ${collaborator.role}</div>
          <div><strong>Integrante CIPA:</strong> ${collaborator.cipaMember ? 'SIM' : 'NÃO'}</div>
        </div>
      </div>

      <h3>Equipamentos de Proteção Individual Entregues</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>EPI / Equipamento</th>
            <th>Nº do C.A.</th>
            <th>Data Entrega</th>
            <th>Validade / Troca</th>
            <th>Status</th>
            <th>Visto Colaborador</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHTML.length > 0 ? rowsHTML : '<tr><td colspan="7" style="text-align:center;">Nenhum EPI entregue cadastrado.</td></tr>'}
        </tbody>
      </table>

      ${missing.length > 0 ? `
        <div style="background: #EEF2FF; border: 1px dashed #6366F1; padding: 0.75rem; border-radius: 6px; margin-bottom: 1.5rem; font-size: 0.85rem; color: #3730A3;">
          ⚠️ <strong>Pendências Identificadas pela CIPA:</strong> Este colaborador possui ${missing.length} EPI(s) em falta para sua função: 
          <em>${missing.map(m => m.name).join(', ')}</em>.
        </div>
      ` : ''}

      <div class="term">
        <strong>TERMO DE RESPONSABILIDADE (NR-6.7.1)</strong><br>
        Declaro ter recebido do SENAI-SP os Equipamentos de Proteção Individual (EPI) descritos nesta ficha, devidamente higienizados e em perfeito estado de conservação. Comprometo-me a usá-los exclusivamente para as finalidades a que se destinam, responsabilizando-me pela sua guarda e conservação, e a comunicar imediatamente qualquer alteração que os torne impróprios para uso, estando ciente das penalidades legais pelo descumprimento.
      </div>

      <div class="signatures">
        <div>
          <div class="sig-line">
            Assinatura do Colaborador<br>
            <span style="font-weight: normal; font-size: 0.75rem;">${collaborator.name} (${collaborator.re})</span>
          </div>
        </div>
        <div>
          <div class="sig-line">
            Responsável Técnico / CIPA SENAI-SP<br>
            <span style="font-weight: normal; font-size: 0.75rem;">Comissão Interna de Prevenção de Acidentes</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Open print preview window
 */
export function openNR6PrintWindow(collaborator) {
  const html = generateNR6PrintableHTML(collaborator);
  const printWin = window.open('', '_blank', 'width=900,height=800');
  if (printWin) {
    printWin.document.write(html);
    printWin.document.close();
  } else {
    alert('Por favor, permita pop-ups no seu navegador para imprimir a Ficha NR-6.');
  }
}

/**
 * Download CSV report of filtered collaborators
 */
export function downloadCSVReport(collaborators) {
  const headers = ["ID", "Nome", "SN", "Unidade SENAI", "Departamento", "Cargo", "Status CIPA", "Qtd EPIs Possuidos", "Qtd EPIs Em Falta"];
  
  const rows = collaborators.map(col => {
    const statusObj = getCollaboratorOverallStatus(col);
    const missing = getMissingEPIsForCollaborator(col);
    return [
      `"${col.id}"`,
      `"${col.name}"`,
      `"${col.re}"`,
      `"${col.unit}"`,
      `"${col.department}"`,
      `"${col.role}"`,
      `"${statusObj.label}"`,
      (col.epis || []).length,
      missing.length
    ].join(',');
  });

  const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n'); // UTF-8 BOM
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio_cipa_senaisp_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}
