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

  if (deptSelect) {
    const currentVal = state.selectedDepartment;
    deptSelect.innerHTML = '<option value="all">Todas as Áreas / Setores</option>';
    state.getDepartments().forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      deptSelect.appendChild(opt);
    });
    deptSelect.value = currentVal;
  }

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
  const kpiList = state.getCollaboratorsForKPIs();
  const metrics = calculateKPIMetrics(kpiList);

  document.getElementById('kpi-total').textContent = metrics.totalCollaborators;
  document.getElementById('kpi-conformity').textContent = `${metrics.conformityPercentage}%`;
  document.getElementById('kpi-delivered').textContent = metrics.totalDeliveredEPIs;
  
  const deliveredSubtext = document.getElementById('kpi-delivered-subtext');
  if (deliveredSubtext) {
    deliveredSubtext.textContent = `${metrics.activeDeliveredEPIs} com C.A. ativo • ${metrics.expiredDeliveredEPIs} vencidos`;
  }

  document.getElementById('kpi-missing').textContent = metrics.totalMissingEPIs;
  document.getElementById('kpi-warning').textContent = metrics.warningCount;
  document.getElementById('kpi-danger').textContent = metrics.expiredCount;

  // Stock KPI Metrics
  const stockMetrics = state.getStockMetrics();
  const stockTotalEl = document.getElementById('kpi-stock-total');
  if (stockTotalEl) stockTotalEl.textContent = stockMetrics.totalUnits;
  
  const stockSubtextEl = document.getElementById('kpi-stock-subtext');
  if (stockSubtextEl) {
    if (stockMetrics.criticalCount > 0) {
      stockSubtextEl.innerHTML = `<span style="color: #DC2626; font-weight: 700;">🚨 ${stockMetrics.criticalCount} esgotado(s)</span>`;
    } else if (stockMetrics.lowStockCount > 0) {
      stockSubtextEl.innerHTML = `<span style="color: #D97706; font-weight: 600;">⚠️ ${stockMetrics.lowStockCount} em nível baixo</span>`;
    } else {
      stockSubtextEl.textContent = `${stockMetrics.totalModels} modelos regulamentares`;
    }
  }

  // Active status visual indicator on cards
  const filter = state.selectedStatusFilter;
  document.querySelector('.kpi-total')?.classList.toggle('active', filter === 'all' && state.activeTab === 'collaborators');
  document.querySelector('.kpi-conformity')?.classList.toggle('active', filter === 'ok');
  document.querySelector('.kpi-delivered')?.classList.toggle('active', filter === 'delivered');
  document.querySelector('.kpi-missing')?.classList.toggle('active', filter === 'missing');
  document.querySelector('.kpi-warning')?.classList.toggle('active', filter === 'warning');
  document.querySelector('.kpi-danger')?.classList.toggle('active', filter === 'danger');
  document.querySelector('.kpi-stock')?.classList.toggle('active', state.activeTab === 'stock');
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
  } else if (tab === 'stock') {
    container.innerHTML = renderStockView();
    attachStockViewEvents();
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
            <div style="font-size: 0.78rem; color: var(--text-muted);">${collab.department}${collab.sector ? ` • ${collab.sector}` : ''}</div>
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
            <div style="display: flex; gap: 0.35rem; justify-content: flex-end;">
              <button class="btn-secondary btn-open-drawer" data-collab-id="${collab.id}" style="padding: 0.35rem 0.65rem; font-size: 0.8rem;" title="Ver Ficha">
                📋 Detalhes
              </button>
              <button class="btn-secondary btn-edit-collab" data-collab-id="${collab.id}" style="padding: 0.35rem 0.55rem; font-size: 0.8rem;" title="Alterar Setor / Editar">
                ✏️
              </button>
              <button class="btn-secondary btn-delete-collab" data-collab-id="${collab.id}" style="padding: 0.35rem 0.55rem; font-size: 0.8rem; background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5;" title="Excluir Colaborador">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="table-container">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Colaborador / SN</th>
              <th>Unidade SENAI & Setor</th>
              <th>Status CIPA</th>
              <th>Status de EPI's</th>
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
            <div class="collab-unit-tag">📍 ${collab.unit.split('-')[0]} | ${collab.department}${collab.sector ? ` • ${collab.sector}` : ''}</div>
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
            <div style="display: flex; gap: 0.35rem;">
              <button class="btn-primary btn-open-drawer" data-collab-id="${collab.id}" style="padding: 0.35rem 0.65rem; font-size: 0.8rem;">
                Ficha
              </button>
              <button class="btn-secondary btn-edit-collab" data-collab-id="${collab.id}" style="padding: 0.35rem 0.55rem; font-size: 0.8rem;" title="Alterar Setor / Editar">
                ✏️
              </button>
              <button class="btn-secondary btn-delete-collab" data-collab-id="${collab.id}" style="padding: 0.35rem 0.55rem; font-size: 0.8rem; background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5;" title="Excluir Colaborador">
                🗑️
              </button>
            </div>
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
  document.querySelectorAll('.btn-open-drawer').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.dataset.collabId || el.closest('[data-collab-id]')?.dataset.collabId;
      if (id) {
        state.setSelectedCollaboratorId(id);
      }
    });
  });

  document.querySelectorAll('.collab-row-item, .collaborator-card').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.btn-edit-collab') || e.target.closest('.btn-delete-collab')) return;
      const id = el.dataset.collabId || el.closest('[data-collab-id]')?.dataset.collabId;
      if (id) {
        state.setSelectedCollaboratorId(id);
      }
    });
  });

  document.querySelectorAll('.btn-edit-collab').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.dataset.collabId || el.closest('[data-collab-id]')?.dataset.collabId;
      if (id && window.openEditCollabModal) {
        window.openEditCollabModal(id);
      }
    });
  });

  document.querySelectorAll('.btn-delete-collab').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = el.dataset.collabId || el.closest('[data-collab-id]')?.dataset.collabId;
      if (id && window.openDeleteCollabModal) {
        window.openDeleteCollabModal(id);
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

  // Filter alert items based on active status filter
  if (state.selectedStatusFilter === 'danger') {
    alertItems = alertItems.filter(item => item.isExpired);
  } else if (state.selectedStatusFilter === 'warning') {
    alertItems = alertItems.filter(item => !item.isExpired && !item.isMissing);
  } else if (state.selectedStatusFilter === 'missing') {
    alertItems = alertItems.filter(item => item.isMissing);
  }

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
            <button class="btn-secondary btn-notify-item" 
              data-collab-id="${c.id}"
              data-collab-name="${c.name}"
              data-collab-re="${c.re}"
              data-collab-email="${c.email}"
              data-collab-dept="${c.department}"
              data-collab-sector="${c.sector || ''}"
              data-collab-role="${c.role}"
              data-epi-name="${e.name}"
              data-epi-ca="${e.ca || ''}"
              data-days="${item.days}"
              data-is-expired="${item.isExpired ? 'true' : 'false'}"
              data-is-missing="${item.isMissing ? 'true' : 'false'}"
              data-expiry="${e.expiryDate || ''}"
              style="padding: 0.35rem 0.65rem; font-size: 0.78rem;"
              title="Disparar e-mail de alerta corporativo">
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
      openSendAlertModal({
        collabName: btn.dataset.collabName,
        collabRe: btn.dataset.collabRe,
        collabEmail: btn.dataset.collabEmail,
        collabDept: btn.dataset.collabDept,
        collabSector: btn.dataset.collabSector,
        collabRole: btn.dataset.collabRole,
        epiName: btn.dataset.epiName,
        epiCa: btn.dataset.epiCa,
        expiryDate: btn.dataset.expiry,
        days: parseInt(btn.dataset.days || '0', 10),
        isExpired: btn.dataset.isExpired === 'true',
        isMissing: btn.dataset.isMissing === 'true'
      });
    });
  });

  const notifyAll = document.getElementById('btn-notify-all');
  if (notifyAll) {
    notifyAll.addEventListener('click', () => {
      openBatchAlertsModal();
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
 * Tab 5: Stock & Warehouse Management (NR-6)
 */
function renderStockView() {
  const metrics = state.getStockMetrics();
  const items = state.getFilteredStock();
  const currentFilter = state.stockFilter;

  const rowsHTML = items.map(item => {
    const isZero = item.quantity === 0;
    const isLow = !isZero && item.quantity <= item.minQuantity;

    let statusBadge = '<span class="badge badge-ok">🟢 Normal</span>';
    let progressColor = '#10B981'; // green

    if (isZero) {
      statusBadge = '<span class="badge badge-danger">🔴 Esgotado</span>';
      progressColor = '#EF4444'; // red
    } else if (isLow) {
      statusBadge = '<span class="badge badge-warning">🟡 Reposição Necessária</span>';
      progressColor = '#F59E0B'; // amber
    }

    // Progress percentage based on 2.5x min quantity as optimal level
    const maxReference = Math.max(item.minQuantity * 2.5, item.quantity, 10);
    const progressPercent = Math.min(100, Math.round((item.quantity / maxReference) * 100));

    return `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--text-primary); font-size: 0.92rem;">${item.epiName}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem; margin-top: 2px;">
            <span>C.A.: <strong style="color: var(--senai-blue-accent);">${item.ca || 'N/I'}</strong></span>
            <span>•</span>
            <span>${item.category || 'Geral'}</span>
          </div>
        </td>
        <td>
          <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.82rem; background: var(--bg-card-subtle); padding: 3px 8px; border-radius: 4px; border: 1px solid var(--border-color);">
            📍 ${item.location || 'Almoxarifado Geral'}
          </span>
        </td>
        <td style="min-width: 140px;">
          <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 4px;">
            <strong style="font-size: 1rem; color: ${isZero ? 'var(--status-danger-text)' : isLow ? 'var(--status-warning-text)' : 'var(--text-primary)'};">
              ${item.quantity} ${item.unit || 'un'}
            </strong>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${progressPercent}%</span>
          </div>
          <div style="width: 100%; height: 6px; background: #E2E8F0; border-radius: 999px; overflow: hidden;">
            <div style="height: 100%; width: ${progressPercent}%; background: ${progressColor}; border-radius: 999px; transition: width 0.3s ease;"></div>
          </div>
        </td>
        <td>
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">
            ${item.minQuantity} ${item.unit || 'un'}
          </span>
        </td>
        <td>${statusBadge}</td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="btn-secondary btn-stock-add" data-stock-id="${item.id}" style="padding: 0.28rem 0.55rem; font-size: 0.75rem; margin-right: 4px;" title="Adicionar entrada de estoque">
            ➕ Entrada
          </button>
          <button class="btn-secondary btn-stock-sub" data-stock-id="${item.id}" data-name="${item.epiName}" style="padding: 0.28rem 0.55rem; font-size: 0.75rem; margin-right: 4px;" title="Registrar baixa manual">
            ➖ Baixa
          </button>
          <button class="btn-primary btn-stock-deliver" data-epi-name="${item.epiName}" data-epi-ca="${item.ca || ''}" style="padding: 0.28rem 0.6rem; font-size: 0.75rem;" title="Entregar este EPI a um colaborador">
            📦 Entregar
          </button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
      <!-- Stock Header Overview Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
        <div style="background: white; padding: 1.15rem; border-radius: 12px; border: 1px solid var(--border-color); border-left: 4px solid #0D9488;">
          <div style="font-size: 0.78rem; text-transform: uppercase; font-weight: 700; color: var(--text-secondary);">Total em Almoxarifado</div>
          <div style="font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin-top: 4px;">${metrics.totalUnits} <span style="font-size: 0.85rem; font-weight: normal; color: var(--text-muted);">unidades físicas</span></div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">Saldo consolidado de EPIs</div>
        </div>

        <div style="background: white; padding: 1.15rem; border-radius: 12px; border: 1px solid var(--border-color); border-left: 4px solid var(--senai-navy);">
          <div style="font-size: 0.78rem; text-transform: uppercase; font-weight: 700; color: var(--text-secondary);">Catálogo de Modelos</div>
          <div style="font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin-top: 4px;">${metrics.totalModels} <span style="font-size: 0.85rem; font-weight: normal; color: var(--text-muted);">tipos de EPI</span></div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">Especificações regulamentadas</div>
        </div>

        <div style="background: white; padding: 1.15rem; border-radius: 12px; border: 1px solid var(--border-color); border-left: 4px solid var(--status-warning);">
          <div style="font-size: 0.78rem; text-transform: uppercase; font-weight: 700; color: var(--status-warning-text);">Estoque Baixo</div>
          <div style="font-size: 1.75rem; font-weight: 800; color: var(--status-warning-text); margin-top: 4px;">${metrics.lowStockCount} <span style="font-size: 0.85rem; font-weight: normal; color: var(--text-muted);">em ponto de reposição</span></div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">Necessitam novo pedido</div>
        </div>

        <div style="background: white; padding: 1.15rem; border-radius: 12px; border: 1px solid var(--border-color); border-left: 4px solid var(--status-danger);">
          <div style="font-size: 0.78rem; text-transform: uppercase; font-weight: 700; color: var(--status-danger-text);">Itens Esgotados</div>
          <div style="font-size: 1.75rem; font-weight: 800; color: var(--status-danger-text); margin-top: 4px;">${metrics.criticalCount} <span style="font-size: 0.85rem; font-weight: normal; color: var(--text-muted);">zerados</span></div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">Ação de compra urgente</div>
        </div>
      </div>

      <!-- Action & Filters Bar -->
      <div style="background: white; padding: 1rem 1.25rem; border-radius: 12px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <!-- Filters by Stock Level -->
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn-stock-filter ${currentFilter === 'all' ? 'active' : ''}" data-filter="all" style="padding: 0.35rem 0.75rem; font-size: 0.82rem; border-radius: 6px; border: 1px solid var(--border-color); background: ${currentFilter === 'all' ? 'var(--senai-navy)' : 'white'}; color: ${currentFilter === 'all' ? 'white' : 'var(--text-secondary)'}; font-weight: 600; cursor: pointer;">
            Todos (${metrics.totalModels})
          </button>
          <button class="btn-stock-filter ${currentFilter === 'normal' ? 'active' : ''}" data-filter="normal" style="padding: 0.35rem 0.75rem; font-size: 0.82rem; border-radius: 6px; border: 1px solid var(--border-color); background: ${currentFilter === 'normal' ? '#10B981' : 'white'}; color: ${currentFilter === 'normal' ? 'white' : 'var(--text-secondary)'}; font-weight: 600; cursor: pointer;">
            🟢 Normal (${metrics.totalModels - metrics.totalAttention})
          </button>
          <button class="btn-stock-filter ${currentFilter === 'low' ? 'active' : ''}" data-filter="low" style="padding: 0.35rem 0.75rem; font-size: 0.82rem; border-radius: 6px; border: 1px solid var(--border-color); background: ${currentFilter === 'low' ? '#F59E0B' : 'white'}; color: ${currentFilter === 'low' ? 'white' : 'var(--text-secondary)'}; font-weight: 600; cursor: pointer;">
            🟡 Reposição (${metrics.lowStockCount})
          </button>
          <button class="btn-stock-filter ${currentFilter === 'critical' ? 'active' : ''}" data-filter="critical" style="padding: 0.35rem 0.75rem; font-size: 0.82rem; border-radius: 6px; border: 1px solid var(--border-color); background: ${currentFilter === 'critical' ? '#EF4444' : 'white'}; color: ${currentFilter === 'critical' ? 'white' : 'var(--text-secondary)'}; font-weight: 600; cursor: pointer;">
            🔴 Zerados (${metrics.criticalCount})
          </button>
        </div>

        <!-- Search & New Entry Action -->
        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <input type="text" id="stock-search-input" class="form-input" placeholder="🔍 Buscar EPI, C.A., Local..." value="${state.stockSearchTerm}" style="font-size: 0.85rem; padding: 0.45rem 0.75rem; max-width: 250px;">
          <button class="btn-primary" id="btn-open-stock-entry" style="font-size: 0.85rem; white-space: nowrap;">
            ➕ Nova Entrada no Estoque
          </button>
        </div>
      </div>

      <!-- Stock Table View -->
      <div class="table-container" style="background: white; border-radius: 12px; border: 1px solid var(--border-color);">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Equipamento / EPI (NR-6)</th>
              <th>Localização / Armário</th>
              <th>Estoque Atual</th>
              <th>Estoque Mínimo</th>
              <th>Situação</th>
              <th style="text-align: right;">Ações de Almoxarifado</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML.length > 0 ? rowsHTML : `
              <tr>
                <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                  🔍 Nenhum EPI encontrado sob os filtros selecionados.
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function attachStockViewEvents() {
  // 1. Search Filter
  const searchInput = document.getElementById('stock-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.setStockSearchTerm(e.target.value);
    });
  }

  // 2. Status Level Filter Buttons
  document.querySelectorAll('.btn-stock-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      state.setStockFilter(btn.dataset.filter);
    });
  });

  // 3. Open Stock Entry Modal
  const btnOpenEntry = document.getElementById('btn-open-stock-entry');
  if (btnOpenEntry) {
    btnOpenEntry.addEventListener('click', () => {
      openStockEntryModal();
    });
  }

  // 4. Quick Add Stock Button
  document.querySelectorAll('.btn-stock-add').forEach(btn => {
    btn.addEventListener('click', () => {
      openStockEntryModal(btn.dataset.stockId);
    });
  });

  // 5. Quick Subtract Stock Button (-1)
  document.querySelectorAll('.btn-stock-sub').forEach(btn => {
    btn.addEventListener('click', () => {
      const stockId = btn.dataset.stockId;
      const name = btn.dataset.name;
      const updated = state.updateStockQuantity(stockId, -1, 'Baixa manual');
      if (updated) {
        showToast(`Baixa registrada: 1 unidade de "${name}" (Saldo: ${updated.quantity}).`, 'success');
      }
    });
  });

  // 6. Deliver Stock Item Directly
  document.querySelectorAll('.btn-stock-deliver').forEach(btn => {
    btn.addEventListener('click', () => {
      const epiName = btn.dataset.epiName;
      const epiCa = btn.dataset.epiCa;
      openDeliveryModal(null, epiName, epiCa);
    });
  });
}

/**
 * Open Stock Entry Modal
 */
export function openStockEntryModal(prefillStockId = null) {
  const modal = document.getElementById('modal-stock-entry');
  if (!modal) return;

  const select = document.getElementById('stock-entry-item-id');
  if (select) {
    select.innerHTML = state.getStock().map(item => `
      <option value="${item.id}" ${item.id === prefillStockId ? 'selected' : ''}>
        ${item.epiName} (C.A. ${item.ca}) — Atual: ${item.quantity} ${item.unit}
      </option>
    `).join('');
  }

  document.getElementById('stock-entry-qty').value = '';
  document.getElementById('stock-entry-note').value = '';

  modal.classList.add('active');
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

  const deptBox = document.getElementById('drawer-unit-dept-box');
  if (deptBox) {
    deptBox.innerHTML = `
      <div>
        <div style="color: var(--text-muted); font-size: 0.78rem;">${collab.unit}</div>
        <div style="margin-top: 2px;">
          Área / Setor: <strong id="drawer-dept-label" style="color: var(--text-primary);">${collab.department}${collab.sector ? ` (${collab.sector})` : ''}</strong>
        </div>
      </div>
      <div id="drawer-dept-actions">
        <button class="btn-secondary" id="btn-drawer-edit-dept" style="padding: 0.3rem 0.65rem; font-size: 0.78rem; white-space: nowrap;">
          ✏️ Alterar Área
        </button>
      </div>
    `;

    const editBtn = document.getElementById('btn-drawer-edit-dept');
    if (editBtn) {
      editBtn.onclick = (e) => {
        e.stopPropagation();
        const actionsDiv = document.getElementById('drawer-dept-actions');
        const deptOptions = state.getDepartments().map(d => `<option value="${d}" ${d === collab.department ? 'selected' : ''}>${d}</option>`).join('');
        
        actionsDiv.innerHTML = `
          <div style="display: flex; gap: 0.35rem; align-items: center;">
            <select id="drawer-select-dept" class="form-select" style="padding: 0.3rem 0.5rem; font-size: 0.8rem; width: auto; max-width: 220px;">
              ${deptOptions}
            </select>
            <button id="btn-save-inline-dept" class="btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.78rem;" title="Salvar Setor">✔</button>
            <button id="btn-cancel-inline-dept" class="btn-secondary" style="padding: 0.3rem 0.5rem; font-size: 0.78rem;" title="Cancelar">✕</button>
          </div>
        `;

        document.getElementById('btn-save-inline-dept').onclick = () => {
          const newDept = document.getElementById('drawer-select-dept').value;
          state.updateCollaboratorDepartment(collab.id, newDept);
          showToast(`Setor de ${collab.name} alterado para "${newDept}" com sucesso!`, 'success');
        };

        document.getElementById('btn-cancel-inline-dept').onclick = () => {
          renderDrawerIfNeeded();
        };
      };
    }
  }

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
          ${days <= 30 ? `
            <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px dashed var(--border-color); display: flex; justify-content: flex-end;">
              <button class="btn-secondary btn-drawer-notify" 
                data-collab-id="${collab.id}"
                data-collab-name="${collab.name}"
                data-collab-re="${collab.re}"
                data-collab-email="${collab.email}"
                data-collab-dept="${collab.department}"
                data-collab-sector="${collab.sector || ''}"
                data-collab-role="${collab.role}"
                data-epi-name="${item.name}"
                data-epi-ca="${item.ca}"
                data-days="${days}"
                data-is-expired="${days < 0 ? 'true' : 'false'}"
                data-is-missing="false"
                data-expiry="${item.expiryDate}"
                style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">
                📩 Notificar por E-mail
              </button>
            </div>
          ` : ''}
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
        <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; align-self: flex-start;">
          <button class="btn-primary btn-quick-deliver" data-collab-id="${collab.id}" data-epi-name="${m.name}" data-epi-ca="${m.ca}" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
            ➕ Registrar Entrega Deste EPI
          </button>
          <button class="btn-secondary btn-drawer-notify" 
            data-collab-id="${collab.id}"
            data-collab-name="${collab.name}"
            data-collab-re="${collab.re}"
            data-collab-email="${collab.email}"
            data-collab-dept="${collab.department}"
            data-collab-sector="${collab.sector || ''}"
            data-collab-role="${collab.role}"
            data-epi-name="${m.name}"
            data-epi-ca="${m.ca}"
            data-days="0"
            data-is-expired="false"
            data-is-missing="true"
            data-expiry=""
            style="padding: 0.35rem 0.65rem; font-size: 0.78rem;">
            📩 Notificar Retirada
          </button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.btn-quick-deliver').forEach(b => {
      b.addEventListener('click', () => {
        openDeliveryModal(b.dataset.collabId, b.dataset.epiName, b.dataset.epiCa);
      });
    });
  }

  // Bind drawer notification buttons
  document.querySelectorAll('.btn-drawer-notify').forEach(btn => {
    btn.addEventListener('click', () => {
      openSendAlertModal({
        collabName: btn.dataset.collabName,
        collabRe: btn.dataset.collabRe,
        collabEmail: btn.dataset.collabEmail,
        collabDept: btn.dataset.collabDept,
        collabSector: btn.dataset.collabSector,
        collabRole: btn.dataset.collabRole,
        epiName: btn.dataset.epiName,
        epiCa: btn.dataset.epiCa,
        expiryDate: btn.dataset.expiry,
        days: parseInt(btn.dataset.days || '0', 10),
        isExpired: btn.dataset.isExpired === 'true',
        isMissing: btn.dataset.isMissing === 'true'
      });
    });
  });

  // Bind Drawer Action Buttons
  const printBtn = document.getElementById('btn-drawer-print-nr6');
  if (printBtn) {
    printBtn.onclick = () => openNR6PrintWindow(collab);
  }

  const addEpiBtn = document.getElementById('btn-drawer-add-epi');
  if (addEpiBtn) {
    addEpiBtn.onclick = () => openDeliveryModal(collab.id);
  }

  const editDeptBtn = document.getElementById('btn-drawer-edit-dept');
  if (editDeptBtn) {
    editDeptBtn.onclick = () => {
      if (window.openEditCollabModal) window.openEditCollabModal(collab.id);
    };
  }

  const deleteCollabBtn = document.getElementById('btn-drawer-delete-collab');
  if (deleteCollabBtn) {
    deleteCollabBtn.onclick = () => {
      if (window.openDeleteCollabModal) window.openDeleteCollabModal(collab.id);
    };
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

/**
 * Render Delivered EPIs Inventory in the dedicated modal
 */
export function renderDeliveredInventoryModal(searchTerm = '') {
  const tbody = document.getElementById('delivered-inventory-tbody');
  if (!tbody) return;

  const query = (searchTerm || '').trim().toLowerCase();
  const allCollabs = state.getCollaboratorsForKPIs();
  
  let deliveredItems = [];
  let totalValid = 0;
  let totalWarning = 0;
  let totalExpired = 0;

  allCollabs.forEach(collab => {
    (collab.epis || []).forEach(epi => {
      const days = calculateDaysRemaining(epi.expiryDate);
      let statusType = 'valid';
      if (days < 0) {
        statusType = 'expired';
        totalExpired++;
      } else if (days <= 30) {
        statusType = 'warning';
        totalWarning++;
      } else {
        totalValid++;
      }

      deliveredItems.push({
        collab,
        epi,
        days,
        statusType
      });
    });
  });

  // Update Modal Badges
  const badgeTotal = document.getElementById('modal-inv-total');
  const badgeValid = document.getElementById('modal-inv-valid');
  const badgeWarning = document.getElementById('modal-inv-warning');
  const badgeExpired = document.getElementById('modal-inv-expired');

  if (badgeTotal) badgeTotal.textContent = `Total: ${deliveredItems.length} EPIs em posse`;
  if (badgeValid) badgeValid.textContent = `C.A. Válido: ${totalValid}`;
  if (badgeWarning) badgeWarning.textContent = `Vencendo (<30d): ${totalWarning}`;
  if (badgeExpired) badgeExpired.textContent = `Vencidos: ${totalExpired}`;

  // Filter items by search query if any
  let filtered = deliveredItems;
  if (query) {
    filtered = deliveredItems.filter(item => {
      const epiMatch = item.epi.name.toLowerCase().includes(query) || (item.epi.ca && item.epi.ca.includes(query));
      const collabMatch = item.collab.name.toLowerCase().includes(query) || item.collab.re.toLowerCase().includes(query);
      const deptMatch = item.collab.department.toLowerCase().includes(query) || item.collab.role.toLowerCase().includes(query);
      return epiMatch || collabMatch || deptMatch;
    });
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
          🔍 Nenhum EPI entregue encontrado com o termo "${searchTerm}".
        </td>
      </tr>
    `;
    return;
  }

  // Sort: expired first, then warning, then valid
  filtered.sort((a, b) => a.days - b.days);

  tbody.innerHTML = filtered.map(item => {
    const { collab, epi, days, statusType } = item;
    
    let badgeHTML = '';
    if (statusType === 'expired') {
      badgeHTML = `<span class="badge badge-danger">🔴 Vencido há ${Math.abs(days)}d</span>`;
    } else if (statusType === 'warning') {
      badgeHTML = `<span class="badge badge-warning">🟡 Vence em ${days}d</span>`;
    } else {
      badgeHTML = `<span class="badge badge-ok">🟢 Válido (${days}d)</span>`;
    }

    return `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${epi.name}</div>
          <div style="font-size: 0.76rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
            <span>Certificado C.A.:</span>
            <strong style="color: var(--senai-blue-accent);">${epi.ca || 'N/I'}</strong>
          </div>
        </td>
        <td>
          <div style="font-weight: 600;">${collab.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${collab.re} • ${collab.role}</div>
        </td>
        <td>
          <div>${collab.department}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${collab.unit.split('-')[0]}</div>
        </td>
        <td>${formatDate(epi.deliveryDate)}</td>
        <td>
          <div>${formatDate(epi.expiryDate)}</div>
        </td>
        <td>${badgeHTML}</td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="btn-secondary btn-inv-renew" data-collab-id="${collab.id}" data-epi-name="${epi.name}" data-epi-ca="${epi.ca}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; margin-right: 4px;" title="Renovar ou substituir EPI">
            🔄 Renovar
          </button>
          <button class="btn-secondary btn-inv-print" data-collab-id="${collab.id}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" title="Ver Ficha NR-6">
            📄 Ficha
          </button>
        </td>
      </tr>
    `;
  }).join('');

  // Attach button events
  tbody.querySelectorAll('.btn-inv-renew').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const modalInv = document.getElementById('modal-delivered-inventory');
      if (modalInv) modalInv.classList.remove('active');
      openDeliveryModal(btn.dataset.collabId, btn.dataset.epiName, btn.dataset.epiCa);
    });
  });

  tbody.querySelectorAll('.btn-inv-print').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const collab = state.collaborators.find(c => c.id === btn.dataset.collabId);
      if (collab && window.openNR6PrintWindow) {
        window.openNR6PrintWindow(collab);
      }
    });
  });
}

/**
 * Open Delivered Inventory Modal
 */
export function openDeliveredInventoryModal() {
  const modal = document.getElementById('modal-delivered-inventory');
  if (!modal) return;

  const searchInput = document.getElementById('delivered-inventory-search');
  if (searchInput) {
    searchInput.value = '';
  }

  renderDeliveredInventoryModal('');
  modal.classList.add('active');
}

/**
 * Modal de Disparo de Alerta Corporativo por E-mail (NR-6 / CIPA)
 */
export function openSendAlertModal({
  collabName,
  collabRe,
  collabEmail,
  collabDept,
  collabSector,
  collabRole,
  epiName,
  epiCa,
  expiryDate,
  days,
  isExpired,
  isMissing
}) {
  const modal = document.getElementById('modal-send-alert');
  if (!modal) return;

  const caVal = epiCa && epiCa !== 'Pendente' && epiCa !== 'N/I' ? epiCa : 'Pendente CIPA';
  const cleanCollabName = collabName ? collabName.trim() : 'colaborador';

  // Badge & Diagnóstico
  const badgeEl = document.getElementById('alert-collab-badge');
  let statusText = '';
  let badgeClass = 'badge-warning';

  let subject = '';
  let body = '';

  if (isExpired || (typeof days === 'number' && days < 0)) {
    const absDays = Math.abs(days || 0);
    statusText = `Vencido há ${absDays} dias`;
    badgeClass = 'badge-danger';
    subject = `[CIPA SENAI] ⚠️ Atenção: EPI Vencido - ${epiName}`;
    body = `Olá, ${cleanCollabName}.\n\n⚠️ Atenção: EPI Vencido\n\nO item ${epiName} (C.A. ${caVal}) está com a validade expirada. Procure o setor responsável para retirar um novo equipamento antes do próximo uso.\n\nAtenciosamente,\nComissão Interna de Prevenção de Acidentes e Assédio (CIPA)\nEscola SENAI Euclides Facchini`;
  } else if (isMissing) {
    statusText = 'EPI em Falta / Pendente de Retirada';
    badgeClass = 'badge-missing';
    subject = `[CIPA SENAI] ⚠️ Atenção: EPI Pendente de Retirada - ${epiName}`;
    body = `Olá, ${cleanCollabName}.\n\n⚠️ Atenção: EPI Pendente de Retirada (NR-6)\n\nO item ${epiName} (C.A. ${caVal}) consta como pendente de retirada para a sua função/área. Procure o setor responsável para retirar o seu equipamento antes do próximo uso.\n\nAtenciosamente,\nComissão Interna de Prevenção de Acidentes e Assédio (CIPA)\nEscola SENAI Euclides Facchini`;
  } else {
    statusText = `Vence em ${days} dias`;
    badgeClass = 'badge-warning';
    const dateFormatted = expiryDate ? formatDate(expiryDate) : '';
    subject = `[CIPA SENAI] ⚠️ Atenção: EPI Próximo do Vencimento - ${epiName}`;
    body = `Olá, ${cleanCollabName}.\n\n⚠️ Atenção: EPI Próximo do Vencimento\n\nO item ${epiName} (C.A. ${caVal}) vencerá em ${days} dias${dateFormatted ? ` (validade: ${dateFormatted})` : ''}. Procure o setor responsável para providenciar a substituição antes do próximo uso.\n\nAtenciosamente,\nComissão Interna de Prevenção de Acidentes e Assédio (CIPA)\nEscola SENAI Euclides Facchini`;
  }

  if (badgeEl) {
    badgeEl.className = `badge ${badgeClass}`;
    badgeEl.textContent = statusText;
  }

  const nameEl = document.getElementById('alert-collab-name-display');
  if (nameEl) nameEl.textContent = `${cleanCollabName} (${collabRe || ''})`;

  const metaEl = document.getElementById('alert-collab-meta-display');
  if (metaEl) {
    metaEl.textContent = `${collabRole || ''} • ${collabDept || ''}${collabSector ? ' - ' + collabSector : ''} • EPI: ${epiName} (C.A. ${caVal})`;
  }

  const emailInput = document.getElementById('alert-email-to');
  if (emailInput) emailInput.value = collabEmail || '';

  const subjectInput = document.getElementById('alert-email-subject');
  if (subjectInput) subjectInput.value = subject;

  const bodyInput = document.getElementById('alert-email-body');
  if (bodyInput) bodyInput.value = body;

  modal.classList.add('active');
}

/**
 * Modal de Disparo de Alertas em Lote (NR-6 / CIPA)
 */
export function openBatchAlertsModal() {
  const modal = document.getElementById('modal-batch-alerts');
  if (!modal) return;

  const pendingCollabs = [];
  const allEmails = new Set();

  state.collaborators.forEach(c => {
    const missing = getMissingEPIsForCollaborator(c);
    const expiredOrWarnEpis = (c.epis || []).filter(e => {
      const days = calculateDaysRemaining(e.expiryDate);
      return days <= 30;
    });

    if (missing.length > 0 || expiredOrWarnEpis.length > 0) {
      if (c.email) allEmails.add(c.email);
      pendingCollabs.push({
        collab: c,
        missing,
        expiredOrWarnEpis
      });
    }
  });

  const summaryEl = document.getElementById('batch-alerts-summary');
  if (summaryEl) {
    summaryEl.innerHTML = `<strong>${pendingCollabs.length}</strong> colaboradores com pendências de EPIs identificados no sistema.`;
  }

  const tbody = document.getElementById('batch-alerts-tbody');
  if (tbody) {
    if (pendingCollabs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding: 2rem; color: var(--status-ok-text);">
            🎉 Parabéns! Nenhum colaborador possui pendências ativas de EPIs no momento.
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = pendingCollabs.map(({ collab, missing, expiredOrWarnEpis }) => {
        const issuesSummary = [
          ...expiredOrWarnEpis.map(e => {
            const days = calculateDaysRemaining(e.expiryDate);
            const isExp = days < 0;
            return `<span class="badge ${isExp ? 'badge-danger' : 'badge-warning'}" style="font-size:0.72rem; margin: 1px 2px; display:inline-block;">${e.name} (${isExp ? 'Vencido' : `${days}d`})</span>`;
          }),
          ...missing.map(m => `<span class="badge badge-missing" style="font-size:0.72rem; margin: 1px 2px; display:inline-block;">${m.name} (Falta)</span>`)
        ].join(' ');

        // Seleciona o item mais crítico para pré-preenchimento
        const firstExp = expiredOrWarnEpis.find(e => calculateDaysRemaining(e.expiryDate) < 0) || expiredOrWarnEpis[0] || missing[0];
        const isExp = firstExp && firstExp.expiryDate ? calculateDaysRemaining(firstExp.expiryDate) < 0 : false;
        const isMiss = !expiredOrWarnEpis[0] && missing[0];
        const daysRem = firstExp && firstExp.expiryDate ? calculateDaysRemaining(firstExp.expiryDate) : 0;

        return `
          <tr>
            <td>
              <strong>${collab.name}</strong>
              <div style="font-size:0.75rem; color:var(--text-muted);">${collab.re} • ${collab.role}</div>
            </td>
            <td>
              <code style="font-size:0.8rem; background: var(--bg-card-subtle); padding: 2px 5px; border-radius: 4px; color: var(--senai-blue-accent);">${collab.email}</code>
            </td>
            <td>${collab.department}${collab.sector ? ` • ${collab.sector}` : ''}</td>
            <td style="max-width: 280px;">${issuesSummary}</td>
            <td style="text-align: right;">
              <button class="btn-secondary btn-batch-item-send" 
                data-collab-id="${collab.id}"
                data-collab-name="${collab.name}"
                data-collab-re="${collab.re}"
                data-collab-email="${collab.email}"
                data-collab-dept="${collab.department}"
                data-collab-sector="${collab.sector || ''}"
                data-collab-role="${collab.role}"
                data-epi-name="${firstExp ? firstExp.name : ''}"
                data-epi-ca="${firstExp ? firstExp.ca : ''}"
                data-days="${daysRem}"
                data-is-expired="${isExp ? 'true' : 'false'}"
                data-is-missing="${isMiss ? 'true' : 'false'}"
                data-expiry="${firstExp && firstExp.expiryDate ? firstExp.expiryDate : ''}"
                style="padding: 0.3rem 0.6rem; font-size: 0.78rem;">
                📩 Notificar
              </button>
            </td>
          </tr>
        `;
      }).join('');

      tbody.querySelectorAll('.btn-batch-item-send').forEach(btn => {
        btn.addEventListener('click', () => {
          modal.classList.remove('active');
          openSendAlertModal({
            collabName: btn.dataset.collabName,
            collabRe: btn.dataset.collabRe,
            collabEmail: btn.dataset.collabEmail,
            collabDept: btn.dataset.collabDept,
            collabSector: btn.dataset.collabSector,
            collabRole: btn.dataset.collabRole,
            epiName: btn.dataset.epiName,
            epiCa: btn.dataset.epiCa,
            days: parseInt(btn.dataset.days || '0', 10),
            isExpired: btn.dataset.isExpired === 'true',
            isMissing: btn.dataset.isMissing === 'true',
            expiryDate: btn.dataset.expiry
          });
        });
      });
    }
  }

  // Handle batch copy emails button
  const copyBtn = document.getElementById('btn-copy-batch-emails');
  if (copyBtn) {
    copyBtn.onclick = () => {
      const emailList = Array.from(allEmails).join('; ');
      if (!emailList) {
        showToast('Nenhum e-mail para copiar!', 'warning');
        return;
      }
      navigator.clipboard.writeText(emailList).then(() => {
        showToast(`Lista de ${allEmails.size} e-mails corporativos copiada com sucesso!`, 'success');
      });
    };
  }

  // Handle batch launch mailto button
  const mailtoBtn = document.getElementById('btn-launch-batch-mailto');
  if (mailtoBtn) {
    mailtoBtn.onclick = () => {
      const emailList = Array.from(allEmails).join(';');
      if (!emailList) {
        showToast('Nenhum e-mail com pendência para notificar!', 'warning');
        return;
      }
      const bcc = encodeURIComponent(emailList);
      const subject = encodeURIComponent('[CIPA SENAI] ⚠️ Convocação Geral: Regularização de EPIs Vencidos / Pendentes (NR-6)');
      const body = encodeURIComponent(
        `Prezados colaboradores,\n\nIdentificamos através do sistema de controle da CIPA da Escola SENAI Euclides Facchini que constam em seu cadastro pendências relativas à conformidade da NR-6 (equipamentos de proteção individual com validade expirada, próximos do vencimento ou pendentes de retirada).\n\nSolicitamos o seu comparecimento ao Almoxarifado / Segurança do Trabalho para conferência e regularização dos seus EPIs antes do próximo uso.\n\nAtenciosamente,\nComissão Interna de Prevenção de Acidentes e Assédio (CIPA)\nEscola SENAI Euclides Facchini`
      );
      window.location.href = `mailto:?bcc=${bcc}&subject=${subject}&body=${body}`;
      showToast('Cliente de e-mail aberto com convocação geral em cópia oculta (CCO)!', 'success');
      modal.classList.remove('active');
    };
  }

  modal.classList.add('active');
}


