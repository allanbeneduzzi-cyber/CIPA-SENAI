/* ==========================================================================
   INICIALIZAÇÃO E MANIPULADORES DE EVENTOS - APP JS
   ========================================================================== */

import { state } from './state.js';
import { renderApp, openDeliveryModal, showToast } from './ui.js';
import { SENAI_UNITS, DEPARTMENTS, ROLE_EPI_MATRIX } from './mockData.js';
import { EMPLOYEE_DATABASE } from './employeeDatabase.js';

function initApp() {
  // Subscribe UI to State changes
  state.subscribe(() => {
    renderApp();
  });

  // Initial Render
  renderApp();

  // 1. Slicer Filters Event Listeners
  const filterUnit = document.getElementById('filter-unit');
  if (filterUnit) {
    filterUnit.addEventListener('change', (e) => {
      state.setUnitFilter(e.target.value);
    });
  }

  const filterDept = document.getElementById('filter-dept');
  if (filterDept) {
    filterDept.addEventListener('change', (e) => {
      state.setDepartmentFilter(e.target.value);
    });
  }

  // Status Chips Click
  document.querySelectorAll('.chip-option').forEach(chip => {
    chip.addEventListener('click', () => {
      const filterVal = chip.dataset.filter;
      state.setStatusFilter(filterVal);
    });
  });

  // Reset Filters Button
  const btnReset = document.getElementById('btn-reset-slicers');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      state.setUnitFilter('all');
      state.setDepartmentFilter('all');
      state.setStatusFilter('all');
      state.setSearchTerm('');
      const searchInput = document.getElementById('main-search-input');
      if (searchInput) searchInput.value = '';
    });
  }

  // 2. Search Bar Event Listener
  const searchInput = document.getElementById('main-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.setSearchTerm(e.target.value);
    });
  }

  // 3. View Tabs Switching (Colaboradores, Alertas, Matriz, Relatórios)
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.setActiveTab(tab.dataset.tab);
    });
  });

  // 4. Table vs Grid Toggle
  const btnTable = document.getElementById('btn-mode-table');
  const btnGrid = document.getElementById('btn-mode-grid');

  if (btnTable && btnGrid) {
    btnTable.addEventListener('click', () => {
      btnTable.classList.add('active');
      btnGrid.classList.remove('active');
      state.setViewMode('table');
    });

    btnGrid.addEventListener('click', () => {
      btnGrid.classList.add('active');
      btnTable.classList.remove('active');
      state.setViewMode('grid');
    });
  }

  // 4.5. KPI Cards Clicks (Direcionamento para Abas e Filtros de Status)
  const switchTab = (tabName) => {
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabName);
    });
    state.setActiveTab(tabName);
  };

  const kpiMappings = [
    { selector: '.kpi-total', statusFilter: 'all', tab: 'collaborators' },
    { selector: '.kpi-conformity', statusFilter: 'ok', tab: 'collaborators' },
    { selector: '.kpi-delivered', statusFilter: 'all', tab: 'collaborators' },
    { selector: '.kpi-missing', statusFilter: 'missing', tab: 'alerts' },
    { selector: '.kpi-warning', statusFilter: 'warning', tab: 'alerts' },
    { selector: '.kpi-danger', statusFilter: 'danger', tab: 'alerts' }
  ];

  kpiMappings.forEach(({ selector, statusFilter, tab }) => {
    const card = document.querySelector(selector);
    if (card) {
      card.addEventListener('click', () => {
        state.setStatusFilter(statusFilter);
        switchTab(tab);
      });
    }
  });

  // 5. Drawer Close Action
  const closeDrawerBtn = document.getElementById('btn-close-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');

  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener('click', () => {
      state.setSelectedCollaboratorId(null);
    });
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', (e) => {
      if (e.target === drawerBackdrop) {
        state.setSelectedCollaboratorId(null);
      }
    });
  }

  // 7. Delivery Modal Form Submit
  const formDelivery = document.getElementById('form-delivery');
  if (formDelivery) {
    formDelivery.addEventListener('submit', (e) => {
      e.preventDefault();
      const collabId = document.getElementById('delivery-collab-id').value;
      const epiName = document.getElementById('delivery-epi-name').value;
      const ca = document.getElementById('delivery-epi-ca').value;
      const deliveryDate = document.getElementById('delivery-date').value;
      const expiryDate = document.getElementById('delivery-expiry-date').value;

      if (!collabId || !epiName || !ca || !expiryDate) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      state.addEPIToCollaborator(collabId, {
        id: `epi-${Date.now()}`,
        name: epiName,
        ca,
        deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
        expiryDate
      });

      closeModal('modal-delivery');
      showToast(`EPI "${epiName}" entregue com sucesso!`, 'success');
    });
  }

  // Autocomplete collaborator details when a name matches the database
  const collabNameInput = document.getElementById('collab-name');
  if (collabNameInput) {
    collabNameInput.addEventListener('input', (e) => {
      const name = e.target.value.trim().toUpperCase();
      const match = EMPLOYEE_DATABASE.find(emp => emp.name.toUpperCase() === name);
      if (match) {
        // Autocomplete fields
        const collabRe = document.getElementById('collab-re');
        if (collabRe) collabRe.value = `SN-${match.nif}`;

        const collabRole = document.getElementById('collab-role');
        if (collabRole) {
          // Make sure the role exists in the select options
          let optionExists = Array.from(collabRole.options).some(opt => opt.value === match.role);
          if (!optionExists) {
            const opt = document.createElement('option');
            opt.value = match.role;
            opt.textContent = match.role;
            collabRole.appendChild(opt);
          }
          collabRole.value = match.role;
        }

        const collabEmail = document.getElementById('collab-email');
        if (collabEmail) {
          // Generate corporative email
          const cleanName = match.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const nameParts = cleanName.split(/\s+/);
          const email = nameParts.length >= 2 
            ? `${nameParts[0]}.${nameParts[nameParts.length - 1]}@sp.senai.br`
            : `${cleanName}@sp.senai.br`;
          collabEmail.value = email;
        }

        showToast(`Dados de ${match.name} vinculados com sucesso!`, 'success');
      }
    });
  }

  // 8. Add Collaborator Form Submit
  const formAddCollab = document.getElementById('form-add-collab');
  if (formAddCollab) {
    formAddCollab.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('collab-name').value;
      const re = document.getElementById('collab-re').value;
      const unit = document.getElementById('collab-unit').value;
      const department = document.getElementById('collab-dept').value;
      const role = document.getElementById('collab-role').value;
      const email = document.getElementById('collab-email').value;
      const cipaMember = document.getElementById('collab-cipa').checked;

      const newCollab = {
        id: `collab-${Date.now()}`,
        re,
        name,
        email,
        unit,
        department,
        role,
        cipaMember,
        epis: []
      };

      state.addCollaborator(newCollab);
      closeModal('modal-add-collab');
      showToast(`Colaborador ${name} (${re}) adicionado com sucesso!`, 'success');
    });
  }

  // 8.5 Add EPI Form Submit
  const formAddEpi = document.getElementById('form-add-epi');
  if (formAddEpi) {
    formAddEpi.addEventListener('submit', (e) => {
      e.preventDefault();
      const epiName = document.getElementById('new-epi-name').value;
      const ca = document.getElementById('new-epi-ca').value;
      
      closeModal('modal-add-epi');
      showToast(`EPI "${epiName}" (C.A. ${ca}) cadastrado no catálogo do sistema!`, 'success');
      formAddEpi.reset();
    });
  }

  // 8.5.1 Add Department Form Submit
  const formAddDept = document.getElementById('form-add-dept');
  if (formAddDept) {
    formAddDept.addEventListener('submit', (e) => {
      e.preventDefault();
      const deptName = document.getElementById('new-dept-name').value;
      const added = state.addDepartment(deptName);
      if (added) {
        showToast(`Novo setor "${deptName}" cadastrado com sucesso!`, 'success');
      } else {
        showToast(`O setor "${deptName}" já existe no sistema.`, 'warning');
      }
      closeModal('modal-add-dept');
      formAddDept.reset();
    });
  }

  // 8.6 Edit Collab & Setor Form Submit
  const formEditCollab = document.getElementById('form-edit-collab');
  if (formEditCollab) {
    formEditCollab.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-collab-id').value;
      const name = document.getElementById('edit-collab-name').value;
      const re = document.getElementById('edit-collab-re').value;
      const unit = document.getElementById('edit-collab-unit').value;
      const department = document.getElementById('edit-collab-dept').value;
      const role = document.getElementById('edit-collab-role').value;
      const email = document.getElementById('edit-collab-email').value;
      const cipaMember = document.getElementById('edit-collab-cipa').checked;

      state.updateCollaborator(id, {
        name,
        re,
        unit,
        department,
        role,
        email,
        cipaMember
      });

      closeModal('modal-edit-collab');
      showToast(`Setor e dados do colaborador ${name} atualizados com sucesso!`, 'success');
    });
  }

  // 8.7 Delete Collab Form Submit
  const formConfirmDelete = document.getElementById('form-confirm-delete');
  if (formConfirmDelete) {
    formConfirmDelete.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('delete-collab-id').value;
      const collab = state.collaborators.find(c => c.id === id);
      const name = collab ? collab.name : '';

      state.deleteCollaborator(id);
      closeModal('modal-confirm-delete');
      showToast(`Colaborador ${name} foi excluído do sistema.`, 'success');
    });
  }
}

// Universal Event Delegation for Header Buttons and Modals Close Actions
document.addEventListener('click', (e) => {
  // 1. Cadastrar Setor Button
  const btnDept = e.target.closest('#btn-header-add-dept');
  if (btnDept) {
    const modal = document.getElementById('modal-add-dept');
    if (modal) modal.classList.add('active');
    return;
  }

  // 2. Cadastrar EPI Button
  const btnEpi = e.target.closest('#btn-header-add-epi');
  if (btnEpi) {
    const modal = document.getElementById('modal-add-epi');
    if (modal) modal.classList.add('active');
    return;
  }

  // 3. Cadastrar Colaborador Button
  const btnCollab = e.target.closest('#btn-header-add-collab');
  if (btnCollab) {
    openAddCollabModal();
    return;
  }

  // 4. Nova Entrega Button
  const btnDelivery = e.target.closest('#btn-header-add-delivery');
  if (btnDelivery) {
    openDeliveryModal();
    return;
  }

  // 5. Close Modals Action
  if (e.target.classList.contains('modal-backdrop') || e.target.classList.contains('btn-close-modal')) {
    const modal = e.target.closest('.modal-backdrop');
    if (modal) modal.classList.remove('active');
    return;
  }
});

// Run initialization immediately if DOM is ready, or on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function openAddCollabModal() {
  const modal = document.getElementById('modal-add-collab');
  if (!modal) return;

  const unitSelect = document.getElementById('collab-unit');
  unitSelect.innerHTML = SENAI_UNITS.map(u => `<option value="${u.name}">${u.name}</option>`).join('');

  const deptSelect = document.getElementById('collab-dept');
  deptSelect.innerHTML = state.getDepartments().map(d => `<option value="${d}">${d}</option>`).join('');

  // Dynamically populate the datalist for employees autocompletion
  const datalist = document.getElementById('employees-list');
  if (datalist) {
    datalist.innerHTML = EMPLOYEE_DATABASE.map(emp => `<option value="${emp.name}"></option>`).join('');
  }

  // Dynamically populate cargo / roles select option with all unique roles from ROLE_EPI_MATRIX
  const roleSelect = document.getElementById('collab-role');
  if (roleSelect) {
    const roles = Object.keys(ROLE_EPI_MATRIX).sort();
    roleSelect.innerHTML = roles.map(r => `<option value="${r}">${r}</option>`).join('');
  }

  modal.classList.add('active');
}

window.openEditCollabModal = function(collabId) {
  const collab = state.collaborators.find(c => c.id === collabId);
  if (!collab) return;

  const modal = document.getElementById('modal-edit-collab');
  if (!modal) return;

  document.getElementById('edit-collab-id').value = collab.id;
  document.getElementById('edit-collab-name').value = collab.name;
  document.getElementById('edit-collab-re').value = collab.re;
  document.getElementById('edit-collab-email').value = collab.email || '';
  document.getElementById('edit-collab-cipa').checked = !!collab.cipaMember;

  const unitSelect = document.getElementById('edit-collab-unit');
  if (unitSelect) {
    unitSelect.innerHTML = SENAI_UNITS.map(u => `<option value="${u.name}" ${u.name === collab.unit ? 'selected' : ''}>${u.name}</option>`).join('');
  }

  const deptSelect = document.getElementById('edit-collab-dept');
  if (deptSelect) {
    deptSelect.innerHTML = state.getDepartments().map(d => `<option value="${d}" ${d === collab.department ? 'selected' : ''}>${d}</option>`).join('');
  }

  const roleSelect = document.getElementById('edit-collab-role');
  if (roleSelect) {
    const roles = Object.keys(ROLE_EPI_MATRIX).sort();
    roleSelect.innerHTML = roles.map(r => `<option value="${r}" ${r === collab.role ? 'selected' : ''}>${r}</option>`).join('');
  }

  modal.classList.add('active');
};

window.openDeleteCollabModal = function(collabId) {
  const collab = state.collaborators.find(c => c.id === collabId);
  if (!collab) return;

  const modal = document.getElementById('modal-confirm-delete');
  if (!modal) return;

  document.getElementById('delete-collab-id').value = collab.id;
  document.getElementById('delete-collab-name-text').textContent = collab.name;
  document.getElementById('delete-collab-re-text').textContent = collab.re;

  modal.classList.add('active');
};

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}
