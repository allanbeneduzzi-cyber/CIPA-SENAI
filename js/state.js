/* ==========================================================================
   ESTADO REATIVO DA APLICAÇÃO - STATE JS
   ========================================================================== */

import { INITIAL_COLLABORATORS } from './mockData.js';
import { getCollaboratorOverallStatus, getMissingEPIsForCollaborator } from './alerts.js';

const STORAGE_KEY = 'CIPA_SENAI_SP_COLLABORATORS_V1';

class AppState {
  constructor() {
    this.collaborators = this.loadFromStorage();
    this.selectedUnit = 'all';
    this.selectedDepartment = 'all';
    this.selectedStatusFilter = 'all'; // 'all', 'ok', 'warning', 'danger', 'missing'
    this.searchTerm = '';
    this.viewMode = 'table'; // 'table' | 'grid'
    this.activeTab = 'collaborators'; // 'collaborators' | 'alerts' | 'matrix' | 'reports'
    this.selectedCollaboratorId = null;
    this.listeners = [];
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Erro ao carregar dados do LocalStorage:', e);
    }
    return INITIAL_COLLABORATORS;
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.collaborators));
    } catch (e) {
      console.error('Erro ao salvar no LocalStorage:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  // Filter Pipeline
  getFilteredCollaborators() {
    return this.collaborators.filter(collab => {
      // 1. Unit Filter
      if (this.selectedUnit !== 'all' && collab.unit !== this.selectedUnit) {
        return false;
      }
      
      // 2. Department Filter
      if (this.selectedDepartment !== 'all' && collab.department !== this.selectedDepartment) {
        return false;
      }

      // 3. Status Filter
      if (this.selectedStatusFilter !== 'all') {
        const statusObj = getCollaboratorOverallStatus(collab);
        if (this.selectedStatusFilter !== statusObj.code) {
          return false;
        }
      }

      // 4. Search Term
      if (this.searchTerm.trim() !== '') {
        const query = this.searchTerm.toLowerCase();
        const nameMatch = collab.name.toLowerCase().includes(query);
        const reMatch = collab.re.toLowerCase().includes(query);
        const roleMatch = collab.role.toLowerCase().includes(query);
        const epiMatch = (collab.epis || []).some(e => e.name.toLowerCase().includes(query) || e.ca.includes(query));
        
        if (!nameMatch && !reMatch && !roleMatch && !epiMatch) {
          return false;
        }
      }

      return true;
    });
  }

  // Actions
  setUnitFilter(unit) {
    this.selectedUnit = unit;
    this.notify();
  }

  setDepartmentFilter(dept) {
    this.selectedDepartment = dept;
    this.notify();
  }

  setStatusFilter(status) {
    this.selectedStatusFilter = status;
    this.notify();
  }

  setSearchTerm(term) {
    this.searchTerm = term;
    this.notify();
  }

  setViewMode(mode) {
    this.viewMode = mode;
    this.notify();
  }

  setActiveTab(tab) {
    this.activeTab = tab;
    this.notify();
  }

  setSelectedCollaboratorId(id) {
    this.selectedCollaboratorId = id;
    this.notify();
  }

  getSelectedCollaborator() {
    return this.collaborators.find(c => c.id === this.selectedCollaboratorId) || null;
  }

  // Data Mutations
  addCollaborator(newCollab) {
    this.collaborators.unshift(newCollab);
    this.saveToStorage();
  }

  addEPIToCollaborator(collabId, newEPI) {
    const collab = this.collaborators.find(c => c.id === collabId);
    if (collab) {
      collab.epis = collab.epis || [];
      collab.epis.push(newEPI);
      this.saveToStorage();
    }
  }

  renewEPI(collabId, epiId, newCADate, newExpiryDate) {
    const collab = this.collaborators.find(c => c.id === collabId);
    if (collab && collab.epis) {
      const epi = collab.epis.find(e => e.id === epiId);
      if (epi) {
        epi.deliveryDate = new Date().toISOString().split('T')[0];
        epi.expiryDate = newExpiryDate;
        if (newCADate) epi.ca = newCADate;
        this.saveToStorage();
      }
    }
  }
}

export const state = new AppState();
