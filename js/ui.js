/* ==========================================================================
   RENDERIZAÇÃO DA INTERFACE E COMPONENTES - UI JS
   ========================================================================== */

import { state } from './state.js';
import { SENAI_UNITS, DEPARTMENTS, ROLE_EPI_MATRIX } from './mockData.js';
import { 
  calculateKPIMetrics, 
  getCollaboratorOverallStatus, 
  getMissingEPIsForCollaborator, 
  calculateDaysRemaining,
  getEPIStatus 
} from './alerts.js';
import { openNR6PrintWindow, downloadCSVReport } from './export.js';

export function renderApp() {
  renderSlicers();
  renderKPICards();
  renderActiveTabContent();
  renderDrawerIfNeeded();
}

/**
 * 1. Render Slicers & Filters Controls in Sidebar
 */
function renderSlicers() {
  const unitSelect = document.getElementById('filter-unit');
  const deptSelect = document.getElementById('filter-dept');
  
  if (unitSelect && unitSelect.options.length <= 1) {
    unitSelect.innerHTML = '<option value="all">Todas as Unidades SENAI-SP</option>';
    SENAI_UNITS.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.name;
      opt.textContent = u.name;
      unitSelect.appendChild(opt);
    });
  }
  if (unitSelect) unitSelect.value = state.selectedUnit;

  if (deptSelect && deptSelect.options.length <= 1) {
    deptSelect.innerHTML = '<option value="all">Todos os Departamentos</option>';
    DEPARTMENTS.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      deptSelect.appendChild(opt);
    });
  }
  if (deptSelect) deptSelect.value = state.selectedDepartment;

  // Status Chips Counts
  const allList = state.collaborators;
  let counts = { all: allList.length, ok: 0, warning: 0, danger: 0, missing: 0 };

  allList.forEach(col => {
    const st = getCollaboratorOverallStatus(col).code;
    if (counts[st] !== undefined) counts[st]++;
  });

  const statusChips = document.querySelectorAll('.chip-option');
  statusChips.forEach(chip => {
    const filterVal = chip.dataset.filter;
    chip.classList.toggle('active', state.selectedStatusFilter === filterVal);
    const countBadge = chip.querySelector('.chip-count');
    if (countBadge && counts[filterVal] !== undefined) {
      countBadge.textContent = counts[filterVal];
    }
  });
}

/**
 * 2. Render KPI Summary Cards
 */
function renderKPICards() {
  const filtered = state.getFilteredCollaborators();
  const metrics = calculateKPIMetrics(filtered);

  document.getElementById('kpi-total').textContent = metrics.totalCollaborators;
  document.getElementById('kpi-conformity').textContent = `${metrics.conformityPercentage}%`;
  document.getElementById('kpi-delivered').textContent = metrics.totalDeliveredEPIs;
  document.getElementById('kpi-missing').textContent = metrics.totalMissingEPIs;
  document.getElementById('kpi-warning').textContent = metrics.warningCount;
  document.getElementById('kpi-danger').textContent = metrics.expiredCount;
}

/**
 * 3. Render Active Tab View
 */
function renderActiveTabContent() {
  const container = document.getElementById('tab-content-container');
  if (!container) return;

  const tab = state.activeTab;

  if (tab === 'collaborators') {
    container.innerHTML = renderCollaboratorsView();
    attachCollaboratorViewEvents();
  } else if (tab === 'alerts') {
    container.innerHTML = renderAlertsView();
    attachAlertsViewEvents();
  } else if (tab === 'matrix') {
    container.innerHTML = renderMatrixView();
  } else if (tab === 'reports') {
    container.innerHTML = renderReportsView();
    attachReportsViewEvents();
  }
}

/**
 * Tab 1: Collaborators View (Table vs Grid)
 */
function renderCollaboratorsView() {
  const collaborators = state.getFilteredCollaborators();
  const isTable = state.viewMode === 'table';

  if (collaborators.length === 0) {
    return `
      <div style="text-align: center; padding: 4rem 2rem; background: white; border-radius: 12px; border: 1px solid var(--border-color);">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
        <h3 style="font-size: 1.2rem; color: var(--text-primary);">Nenhum colaborador encontrado</h3>
        <p style="color: var(--text-muted); margin-top: 0.5rem;">Tente ajustar os filtros do segmentador ou a busca para visualizar resultados.</p>
        <button class="btn-primary" id="btn-reset-filters-empty" style="margin-top: 1.25rem;">Limpar Filtros</button>
      </div>
    `;
  }

  if (isTable) {
    const tableRows = collaborators.map(collab => {
      const overall = getCollaboratorOverallStatus(collab);
      const missing = getMissingEPIsForCollaborator(collab);
      const epis = collab.epis || [];

      // Generate EPI pills summary
      const epiPillsHTML = epis.map(e => {
        const days = calculateDaysRemaining(e.expiryDate);
        if (days < 0) return `<span class="epi-pill expired" title="Vencido em ${e.expiryDate}">🔴 ${e.name}</span>`;
        if (days <= 30) return `<span class="epi-pill warning" title="Vence em ${days} dias">⚠️ ${e.name}</span>`;
        return `<span class="epi-pill possessed" title="Válido até ${e.expiryDate}">✅ ${e.name}</span>`;
      }).join('');

      const missingPillsHTML = missing.map(m => {
        return `<span class="epi-pill missing" title="Item em Falta Obrigatório">❌ ${m.name}</span>`;
      }).join('');

      return `
        <tr data-collab-id="${collab.id}" class="collab-row-item">
          <td>
            <div class="user-cell">
              <div class="user-avatar">${getInitials(collab.name)}</div>
              <div>
                <div class="user-info-name">${collab.name} ${collab.cipaMember ? '<span title="Membro CIPA SENAI-SP" style="font-size:0.75rem; background:#E30613; color:white; padding:1px 5px; border-radius:4px; margin-left:4px;">CIPA</span>' : ''}</div>
                <div class="user-info-re">${collab.re} • ${collab.role}</div>
              </div>
            </div>
          </td>
          <td>
            <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-primary);">${collab.unit.split('-')[0]}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${collab.department}</div>
          </td>
          <td>
            <span class="badge ${overall.badgeClass}">${overall.label}</span>
          </td>
          <td>
            <div class="epi-matrix-summary">
              ${epiPillsHTML}
              ${missingPillsHTML}
            </div>
          </td>
          <td style="text-align: right;">
            <button class="btn-secondary btn-open-drawer" data-collab-id="${collab.id}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">
              📋 Ficha / Detalhes
            </button>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Colaborador / RE</th>
              <th>Unidade SENAI & Setor</th>
              <th>Status CIPA</th>
              <th>EPIs Possuídos vs Em Falta</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    `;
  } else {
    // Grid Cards View
    const cardsHTML = collaborators.map(collab => {
      const overall = getCollaboratorOverallStatus(collab);
      const missing = getMissingEPIsForCollaborator(collab);
      const epis = collab.epis || [];

      return `
        <div class="collaborator-card" data-collab-id="${collab.id}">
          <div class="collab-card-header">
            <div class="user-cell">
              <div class="user-avatar">${getInitials(collab.name)}</div>
              <div>
                <div class="user-info-name">${collab.name}</div>
                <div class="user-info-re">${collab.re}</div>
              </div>
            </div>
            <span class="badge ${overall.badgeClass}">${overall.label}</span>
          </div>

          <div class="collab-card-body">
            <div class="collab-unit-tag">📍 ${collab.unit.split('-')[0]} | ${collab.department}</div>
            <div style="font-size: 0.82rem; font-weight: 600; color: var(--text-secondary);">
              Cargo: ${collab.role}
            </div>
            
            <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Resumo da Ficha:</div>
            <div class="epi-matrix-summary">
              <span class="epi-pill possessed">📦 ${epis.length} Entregue(s)</span>
              ${missing.length > 0 ? `<span class="epi-pill missing">⚠️ ${missing.length} Em Falta</span>` : '<span class="epi-pill possessed">✨ Completo</span>'}
            </div>
          </div>

          <div class="collab-card-footer">
            <span>Membro CIPA: <strong>${collab.cipaMember ? 'SIM' : 'NÃO'}</strong></span>
            <button class="btn-primary btn-open-drawer" data-collab-id="${collab.id}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">
              Ver Ficha Complete
            </button>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="collaborator-cards-grid">
        ${cardsHTML}
      </div>
    `;
  }
}

function attachCollaboratorViewEvents() {
  document.querySelectorAll('.collab-row-item, .btn-open-drawer, .collaborator-card').forEach(el => {
    el.addEventListener('click', (e) => {
      const id = el.dataset.collabId || el.closest('[data-collab-id]')?.dataset.collabId;
      if (id) {
        state.setSelectedCollaboratorId(id);
      }
    });
  });

  const emptyReset = document.getElementById('btn-reset-filters-empty');
  if (emptyReset) {
    emptyReset.addEventListener('click', () => {
      state.setUnitFilter('all');
      state.setDepartmentFilter('all');
      state.setStatusFilter('all');
      state.setSearchTerm('');
    });
  }
}

/**
 * Tab 2: Expiration & Alerts Center
 */
function renderAlertsView() {
  const filtered = state.getFilteredCollaborators();
  let alertItems = [];

  filtered.forEach(collab => {
    (collab.epis || []).forEach(epi => {
      const days = calculateDaysRemaining(epi.expiryDate);
      if (days <= 30) {
        alertItems.push({
          collab,
          epi,
          days,
          isExpired: days < 0
        });
      }
    });

    // Also include missing EPI alerts
    const missing = getMissingEPIsForCollaborator(collab);
    missing.forEach(req => {
      alertItems.push({
        collab,
        epi: { name: req.name, ca: req.ca, deliveryDate: '-', expiryDate: 'Pendente' },
        days: 0,
        isMissing: true
      });
    });
  });

  alertItems.sort((a, b) => a.days - b.days);

  if (alertItems.length === 0) {
    return `
      <div style="text-align: center; padding: 4rem 2rem; background: white; border-radius: 12px; border: 1px solid var(--border-color);">
        <div style="font-size: 3.5rem; margin-bottom: 1rem;">🎉</div>
        <h3 style="font-size: 1.2rem; color: var(--text-primary);">Nenhum alerta de vencimento ou EPI em falta!</h3>
        <p style="color: var(--text-muted); margin-top: 0.5rem;">Todos os colaboradores sob este filtro estão com seus EPIs em dia conforme a NR-6.</p>
      </div>
    `;
  }

  const itemsHTML = alertItems.map(item => {
    const c = item.collab;
    const e = item.epi;

    let badgeHTML = '';
    let cardClass = 'is-warning';

    if (item.isMissing) {
      badgeHTML = `<span class="badge badge-missing">EPI EM FALTA</span>`;
      cardClass = 'is-missing';
    } else if (item.isExpired) {
      badgeHTML = `<span class="badge badge-danger">VENCIDO HÁ ${Math.abs(item.days)} DIAS</span>`;
      cardClass = 'is-expired';
    } else {
      badgeHTML = `<span class="badge badge-warning">VENCE EM ${item.days} DIAS</span>`;
    }

    return `
      <div class="epi-item-card ${cardClass}" style="background: white;">
        <div class="epi-item-header">
          <div>
            <div class="epi-item-name">${e.name} ${e.ca !== 'Pendente' ? `(C.A. ${e.ca})` : ''}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">
              Colaborador: <strong>${c.name}</strong> (${c.re}) • Setor: ${c.department} - ${c.unit.split('-')[0]}
            </div>
          </div>
          ${badgeHTML}
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color);">
          <div style="font-size: 0.8rem; color: var(--text-secondary);">
            ${item.isMissing ? '<strong>Ação Requerida:</strong> Entregar este EPI ao colaborador para adequação CIPA.' : `Validade registrada: <strong>${formatDate(e.expiryDate)}</strong>`}
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn-secondary btn-notify-item" data-collab-email="${c.email}" data-collab-name="${c.name}" data-epi-name="${e.name}" style="padding: 0.35rem 0.65rem; font-size: 0.78rem;">
              📩 Enviar Alerta
            </button>
            <button class="btn-primary btn-renew-action" data-collab-id="${c.id}" data-epi-id="${e.id || ''}" data-epi-name="${e.name}" style="padding: 0.35rem 0.65rem; font-size: 0.78rem;">
              🔄 Registra Entrega / Renovação
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div style="background: white; padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h3 style="font-size: 1.1rem; color: var(--text-primary);">Central de Alertas e Vencimentos NR-6</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Itens que necessitam de substituição, renovação de C.A. ou entrega imediata.</p>
        </div>
        <button class="btn-secondary" id="btn-notify-all" style="font-size: 0.85rem;">
          📢 Disparar Alertas Gerais em Lote
        </button>
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        ${itemsHTML}
      </div>
    </div>
  `;
}

function attachAlertsViewEvents() {
  document.querySelectorAll('.btn-renew-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const collabId = btn.dataset.collabId;
      const epiName = btn.dataset.epiName;
      openDeliveryModal(collabId, epiName);
    });
  });

  document.querySelectorAll('.btn-notify-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const name = btn.dataset.collabName;
      const epi = btn.dataset.epiName;
      showToast(`Alerta de renovação do EPI "${epi}" enviado com sucesso para ${name}!`, 'success');
    });
  });

  const notifyAll = document.getElementById('btn-notify-all');
  if (notifyAll) {
    notifyAll.addEventListener('click', () => {
      showToast('Alertas por e-mail e notificação CIPA enviados para todos os colaboradores pendentes!', 'success');
    });
  }
}

/**
 * Tab 3: Required EPI Risk Matrix by Role
 */
function renderMatrixView() {
  const roles = Object.keys(ROLE_EPI_MATRIX);

  const matrixCards = roles.map(role => {
    const epis = ROLE_EPI_MATRIX[role];
    const itemsHTML = epis.map(item => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.4rem 0.6rem; background: var(--bg-card-subtle); border-radius: 6px; font-size: 0.85rem;">
        <span>🛡️ <strong>${item.name}</strong></span>
        <span style="font-size: 0.75rem; color: var(--text-muted); background: white; padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-color);">C.A. ${item.ca} • ${item.validityMonths} meses</span>
      </div>
    `).join('');

    return `
      <div style="background: white; border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
          <h4 style="font-size: 1rem; color: var(--senai-navy);">${role}</h4>
          <span class="badge badge-ok">${epis.length} EPIs Requeridos</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
          ${itemsHTML}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
      <div style="background: white; padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h3 style="font-size: 1.1rem; color: var(--text-primary);">Matriz de Exigência de EPIs por Cargo / Função (SENAI-SP)</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Definições regulamentares de EPIs obrigatórios segundo a norma NR-6 para cada ambiente de trabalho.</p>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.25rem;">
        ${matrixCards}
      </div>
    </div>
  `;
}

/**
 * Tab 4: NR-6 Reports & Export
 */
function renderReportsView() {
  const filtered = state.getFilteredCollaborators();

  const rowsHTML = filtered.map(collab => {
    const overall = getCollaboratorOverallStatus(collab);
    const missing = getMissingEPIsForCollaborator(collab);
    const epis = collab.epis || [];

    return `
      <tr>
        <td><strong>${collab.name}</strong> (${collab.re})</td>
        <td>${collab.unit.split('-')[0]}</td>
        <td>${collab.role}</td>
        <td><span class="badge ${overall.badgeClass}">${overall.label}</span></td>
        <td>${epis.length} EPIs</td>
        <td>${missing.length > 0 ? `<span style="color: var(--status-danger-text); font-weight: bold;">${missing.length} Item(ns)</span>` : 'Nenhuma'}</td>
        <td style="text-align: right;">
          <button class="btn-secondary btn-print-individual" data-collab-id="${collab.id}" style="padding: 0.3rem 0.6rem; font-size: 0.78rem;">
            📄 Ficha Termo NR-6
          </button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
      <div style="background: white; padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h3 style="font-size: 1.1rem; color: var(--text-primary);">Relatórios de Auditabilidade CIPA / NR-6</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Exporte o inventário geral de EPIs ou imprima Fichas de Termos de Responsabilidade individuais.</p>
        </div>
        <button class="btn-primary" id="btn-export-csv-all">
          📊 Exportar Relatório em Excel / CSV
        </button>
      </div>

      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Unidade SENAI</th>
              <th>Cargo</th>
              <th>Status CIPA</th>
              <th>EPIs Entregues</th>
              <th>Pendências</th>
              <th style="text-align: right;">Ação</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function attachReportsViewEvents() {
  const exportBtn = document.getElementById('btn-export-csv-all');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      downloadCSVReport(state.getFilteredCollaborators());
      showToast('Relatório CSV gerado com sucesso!', 'success');
    });
  }

  document.querySelectorAll('.btn-print-individual').forEach(btn => {
    btn.addEventListener('click', () => {
      const collabId = btn.dataset.collabId;
      const collab = state.collaborators.find(c => c.id === collabId);
      if (collab) {
        openNR6PrintWindow(collab);
      }
    });
  });
}

/**
 * 4. Render Employee Side Drawer Detail View
 */
function renderDrawerIfNeeded() {
  const backdrop = document.getElementById('drawer-backdrop');
  if (!backdrop) return;

  const collab = state.getSelectedCollaborator();

  if (!collab) {
    backdrop.classList.remove('active');
    return;
  }

  backdrop.classList.add('active');

  const overall = getCollaboratorOverallStatus(collab);
  const missing = getMissingEPIsForCollaborator(collab);
  const epis = collab.epis || [];

  document.getElementById('drawer-avatar').textContent = getInitials(collab.name);
  document.getElementById('drawer-name').textContent = collab.name;
  document.getElementById('drawer-re').textContent = `${collab.re} • ${collab.role}`;
  document.getElementById('drawer-status-badge').className = `badge ${overall.badgeClass}`;
  document.getElementById('drawer-status-badge').textContent = overall.label;

  document.getElementById('drawer-unit-dept').textContent = `${collab.unit} | Setor: ${collab.department}`;

  // Possessed Items List
  const possessedContainer = document.getElementById('drawer-possessed-list');
  if (epis.length === 0) {
    possessedContainer.innerHTML = '<p style="font-size:0.85rem; color:var(--text-muted);">Nenhum EPI entregue registrado.</p>';
  } else {
    possessedContainer.innerHTML = epis.map(item => {
      const days = calculateDaysRemaining(item.expiryDate);
      let cardClass = 'is-valid';
      let tagHTML = `<span class="badge badge-ok">Válido (${days} dias)</span>`;

      if (days < 0) {
        cardClass = 'is-expired';
        tagHTML = `<span class="badge badge-danger">Vencido há ${Math.abs(days)} dias</span>`;
      } else if (days <= 30) {
        cardClass = 'is-warning';
        tagHTML = `<span class="badge badge-warning">Vence em ${days} dias</span>`;
      }

      return `
        <div class="epi-item-card ${cardClass}">
          <div class="epi-item-header">
            <span class="epi-item-name">${item.name}</span>
            ${tagHTML}
          </div>
          <div class="epi-item-details">
            <div class="epi-item-meta">
              <span>Certificado (C.A.)</span>
              <strong>${item.ca}</strong>
            </div>
            <div class="epi-item-meta">
              <span>Data de Entrega</span>
              <strong>${formatDate(item.deliveryDate)}</strong>
            </div>
            <div class="epi-item-meta">
              <span>Validade do EPI</span>
              <strong>${formatDate(item.expiryDate)}</strong>
            </div>
            <div class="epi-item-meta">
              <span>Assinatura Digital</span>
              <strong style="color:var(--status-ok-text)">✔ Confirmado</strong>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Missing Items List
  const missingContainer = document.getElementById('drawer-missing-list');
  if (missing.length === 0) {
    missingContainer.innerHTML = `
      <div style="padding: 0.75rem; background: var(--status-ok-bg); color: var(--status-ok-text); border-radius: 6px; font-size: 0.85rem; font-weight: 600;">
        ✨ Nenhuma pendência! O colaborador possui todos os EPIs exigidos para seu cargo.
      </div>
    `;
  } else {
    missingContainer.innerHTML = missing.map(m => `
      <div class="epi-item-card is-missing">
        <div class="epi-item-header">
          <span class="epi-item-name">❌ ${m.name}</span>
          <span class="badge badge-missing">Em Falta</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">
          Item obrigatório para a função de <strong>${collab.role}</strong> conforme NR-6. (C.A. sugerido: ${m.ca})
        </div>
        <button class="btn-primary btn-quick-deliver" data-collab-id="${collab.id}" data-epi-name="${m.name}" data-epi-ca="${m.ca}" style="margin-top: 0.5rem; align-self: flex-start; padding: 0.35rem 0.75rem; font-size: 0.78rem;">
          ➕ Registrar Entrega Deste EPI
        </button>
      </div>
    `).join('');

    document.querySelectorAll('.btn-quick-deliver').forEach(b => {
      b.addEventListener('click', () => {
        openDeliveryModal(b.dataset.collabId, b.dataset.epiName, b.dataset.epiCa);
      });
    });
  }

  // Bind Drawer Action Buttons
  const printBtn = document.getElementById('btn-drawer-print-nr6');
  if (printBtn) {
    printBtn.onclick = () => openNR6PrintWindow(collab);
  }

  const addEpiBtn = document.getElementById('btn-drawer-add-epi');
  if (addEpiBtn) {
    addEpiBtn.onclick = () => openDeliveryModal(collab.id);
  }
}

/**
 * Open Delivery Modal Form
 */
export function openDeliveryModal(collabId, prefillEpiName = '', prefillCA = '') {
  const modal = document.getElementById('modal-delivery');
  if (!modal) return;

  const collabSelect = document.getElementById('delivery-collab-id');
  collabSelect.innerHTML = state.collaborators.map(c => `
    <option value="${c.id}" ${c.id === collabId ? 'selected' : ''}>${c.name} (${c.re}) - ${c.role}</option>
  `).join('');

  document.getElementById('delivery-epi-name').value = prefillEpiName;
  document.getElementById('delivery-epi-ca').value = prefillCA || '39872';
  document.getElementById('delivery-date').value = new Date().toISOString().split('T')[0];

  // Set default validity to +12 months
  const future = new Date();
  future.setFullYear(future.getFullYear() + 1);
  document.getElementById('delivery-expiry-date').value = future.toISOString().split('T')[0];

  modal.classList.add('active');
}

/**
 * Toast Notification Helper
 */
export function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '⚠️'}</span>
    <div>${message}</div>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Utility Helpers
function getInitials(name) {
  if (!name) return 'SP';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}
