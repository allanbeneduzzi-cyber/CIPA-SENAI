/* ==========================================================================
   ESTADO REATIVO DA APLICAÇÃO - STATE JS
   ========================================================================== */

import { INITIAL_COLLABORATORS, DEPARTMENTS, INITIAL_STOCK } from './mockData.js';
import { getCollaboratorOverallStatus, getMissingEPIsForCollaborator } from './alerts.js';

const STORAGE_KEY = 'CIPA_SENAI_SP_COLLABORATORS_V2';
const STORAGE_KEY_DEPTS = 'CIPA_SENAI_SP_DEPARTMENTS_V2';
const STORAGE_KEY_STOCK = 'CIPA_SENAI_SP_STOCK_V1';

class AppState {
  constructor() {
    this.collaborators = this.loadFromStorage();
    this.departments = this.loadDepartmentsFromStorage();
    this.stock = this.loadStockFromStorage();
    this.selectedUnit = 'all';
    this.selectedDepartment = 'all';
    this.selectedStatusFilter = 'all'; // 'all', 'ok', 'warning', 'danger', 'missing', 'delivered'
    this.searchTerm = '';
    this.viewMode = 'table'; // 'table' | 'grid'
    this.activeTab = 'collaborators'; // 'collaborators' | 'alerts' | 'matrix' | 'reports' | 'stock'
    this.selectedCollaboratorId = null;
    this.stockSearchTerm = '';
    this.stockFilter = 'all'; // 'all' | 'normal' | 'low' | 'critical'
    this.listeners = [];
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length >= 20) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar dados do LocalStorage:', e);
    }
    // Remove legado V1 se existir para carregar a base completa oficial
    try {
      localStorage.removeItem('CIPA_SENAI_SP_COLLABORATORS_V1');
      localStorage.removeItem('CIPA_SENAI_SP_DEPARTMENTS_V1');
    } catch (_) {}
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

  loadDepartmentsFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_DEPTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length >= 10) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar departamentos:', e);
    }
    return [...DEPARTMENTS];
  }

  saveDepartmentsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_DEPTS, JSON.stringify(this.departments));
    } catch (e) {
      console.error('Erro ao salvar departamentos:', e);
    }
  }

  getDepartments() {
    return this.departments;
  }

  loadStockFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_STOCK);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Erro ao carregar estoque:', e);
    }
    return [...INITIAL_STOCK];
  }

  saveStockToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_STOCK, JSON.stringify(this.stock));
    } catch (e) {
      console.error('Erro ao salvar estoque:', e);
    }
    this.notify();
  }

  getStock() {
    return this.stock;
  }

  setStockSearchTerm(term) {
    this.stockSearchTerm = term;
    this.notify();
  }

  setStockFilter(filter) {
    this.stockFilter = filter;
    this.notify();
  }

  getFilteredStock() {
    return this.stock.filter(item => {
      // Filter by search query
      if (this.stockSearchTerm.trim() !== '') {
        const query = this.stockSearchTerm.toLowerCase();
        const nameMatch = item.epiName.toLowerCase().includes(query);
        const caMatch = item.ca && item.ca.includes(query);
        const catMatch = item.category && item.category.toLowerCase().includes(query);
        const locMatch = item.location && item.location.toLowerCase().includes(query);
        if (!nameMatch && !caMatch && !catMatch && !locMatch) return false;
      }

      // Filter by level status
      if (this.stockFilter === 'normal') {
        return item.quantity > item.minQuantity;
      } else if (this.stockFilter === 'low') {
        return item.quantity <= item.minQuantity && item.quantity > 0;
      } else if (this.stockFilter === 'critical') {
        return item.quantity === 0;
      }

      return true;
    });
  }

  getStockMetrics() {
    let totalUnits = 0;
    let totalModels = this.stock.length;
    let lowStockCount = 0;
    let criticalCount = 0;

    this.stock.forEach(item => {
      totalUnits += (item.quantity || 0);
      if (item.quantity === 0) {
        criticalCount++;
      } else if (item.quantity <= item.minQuantity) {
        lowStockCount++;
      }
    });

    return {
      totalUnits,
      totalModels,
      lowStockCount,
      criticalCount,
      totalAttention: lowStockCount + criticalCount
    };
  }

  addStockItem({ epiName, ca, category, quantity, minQuantity, unit, location }) {
    const existing = this.stock.find(s => s.epiName.toLowerCase().trim() === epiName.toLowerCase().trim());
    if (existing) {
      existing.quantity += Number(quantity) || 0;
      if (ca) existing.ca = ca;
      if (minQuantity) existing.minQuantity = Number(minQuantity);
      if (location) existing.location = location;
      this.saveStockToStorage();
      return existing;
    }

    const newItem = {
      id: `stock-${Date.now()}`,
      epiName: epiName.trim(),
      ca: ca || 'N/I',
      category: category || 'EPI Regulamentar',
      quantity: Number(quantity) || 0,
      minQuantity: Number(minQuantity) || 5,
      unit: unit || 'un',
      location: location || 'Almoxarifado Geral'
    };

    this.stock.push(newItem);
    this.saveStockToStorage();
    return newItem;
  }

  updateStockQuantity(stockId, delta, reason = '') {
    const item = this.stock.find(s => s.id === stockId);
    if (item) {
      item.quantity = Math.max(0, item.quantity + delta);
      this.saveStockToStorage();
      return item;
    }
    return null;
  }

  deductStockByEpiName(epiName, amount = 1) {
    if (!epiName) return null;
    const cleanName = epiName.toLowerCase().trim();
    // Try exact or partial match
    let item = this.stock.find(s => s.epiName.toLowerCase().trim() === cleanName);
    if (!item) {
      item = this.stock.find(s => s.epiName.toLowerCase().includes(cleanName) || cleanName.includes(s.epiName.toLowerCase()));
    }

    if (item) {
      const prevQty = item.quantity;
      item.quantity = Math.max(0, item.quantity - amount);
      this.saveStockToStorage();
      return {
        item,
        prevQty,
        newQty: item.quantity,
        isLow: item.quantity <= item.minQuantity,
        isZero: item.quantity === 0
      };
    }
    return null;
  }

  addDepartment(name) {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const exists = this.departments.some(d => d.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      this.departments.push(trimmed);
      this.saveDepartmentsToStorage();
      this.notify();
      return true;
    }
    return false;
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  // Filter Pipeline for KPI summary metrics (ignoring status filter)
  getCollaboratorsForKPIs() {
    return this.collaborators.filter(collab => {
      if (this.selectedUnit !== 'all' && collab.unit !== this.selectedUnit) {
        return false;
      }
      if (this.selectedDepartment !== 'all') {
        const matchesDept = collab.department === this.selectedDepartment || (collab.sector && collab.sector === this.selectedDepartment);
        if (!matchesDept) return false;
      }
      if (this.searchTerm.trim() !== '') {
        const query = this.searchTerm.toLowerCase();
        const nameMatch = collab.name.toLowerCase().includes(query);
        const reMatch = collab.re.toLowerCase().includes(query);
        const roleMatch = (collab.role || '').toLowerCase().includes(query);
        const deptMatch = (collab.department || '').toLowerCase().includes(query);
        const sectorMatch = (collab.sector || '').toLowerCase().includes(query);
        const epiMatch = (collab.epis || []).some(e => e.name.toLowerCase().includes(query) || e.ca.includes(query));
        if (!nameMatch && !reMatch && !roleMatch && !deptMatch && !sectorMatch && !epiMatch) {
          return false;
        }
      }
      return true;
    });
  }

  // Filter Pipeline
  getFilteredCollaborators() {
    return this.collaborators.filter(collab => {
      // 1. Unit Filter
      if (this.selectedUnit !== 'all' && collab.unit !== this.selectedUnit) {
        return false;
      }
      
      // 2. Department Filter (Área ou Setor)
      if (this.selectedDepartment !== 'all') {
        const matchesDept = collab.department === this.selectedDepartment || (collab.sector && collab.sector === this.selectedDepartment);
        if (!matchesDept) return false;
      }

      // 3. Status Filter
      if (this.selectedStatusFilter !== 'all') {
        if (this.selectedStatusFilter === 'delivered') {
          if (!collab.epis || collab.epis.length === 0) {
            return false;
          }
        } else {
          const statusObj = getCollaboratorOverallStatus(collab);
          if (this.selectedStatusFilter !== statusObj.code) {
            return false;
          }
        }
      }

      // 4. Search Term
      if (this.searchTerm.trim() !== '') {
        const query = this.searchTerm.toLowerCase();
        const nameMatch = collab.name.toLowerCase().includes(query);
        const reMatch = collab.re.toLowerCase().includes(query);
        const roleMatch = (collab.role || '').toLowerCase().includes(query);
        const deptMatch = (collab.department || '').toLowerCase().includes(query);
        const sectorMatch = (collab.sector || '').toLowerCase().includes(query);
        const epiMatch = (collab.epis || []).some(e => e.name.toLowerCase().includes(query) || e.ca.includes(query));
        
        if (!nameMatch && !reMatch && !roleMatch && !deptMatch && !sectorMatch && !epiMatch) {
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

  updateCollaborator(collabId, updatedFields) {
    const collab = this.collaborators.find(c => c.id === collabId);
    if (collab) {
      Object.assign(collab, updatedFields);
      this.saveToStorage();
    }
  }

  updateCollaboratorDepartment(collabId, newDepartment) {
    const collab = this.collaborators.find(c => c.id === collabId);
    if (collab) {
      collab.department = newDepartment;
      this.saveToStorage();
    }
  }

  deleteCollaborator(collabId) {
    this.collaborators = this.collaborators.filter(c => c.id !== collabId);
    if (this.selectedCollaboratorId === collabId) {
      this.selectedCollaboratorId = null;
    }
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
