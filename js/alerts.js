/* ==========================================================================
   ALERTA DE VENCIMENTO E CONFORMIDADE CIPA - ALERTS JS
   ========================================================================== */

import { ROLE_EPI_MATRIX } from './mockData.js';

/**
 * Calculates remaining days until expiration
 * @param {string} expiryDateStr - ISO Date string YYYY-MM-DD
 * @returns {number} Days difference (negative if expired)
 */
export function calculateDaysRemaining(expiryDateStr) {
  if (!expiryDateStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiryDate = new Date(expiryDateStr);
  expiryDate.setHours(0, 0, 0, 0);
  
  const diffTime = expiryDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Evaluates individual EPI status (valid, warning, expired)
 */
export function getEPIStatus(expiryDateStr) {
  const days = calculateDaysRemaining(expiryDateStr);
  if (days < 0) return { status: 'expired', label: 'Vencido', days };
  if (days <= 30) return { status: 'warning', label: `Vence em ${days} dias`, days };
  return { status: 'valid', label: `Válido (${days} dias)`, days };
}

/**
 * Calculates missing EPIs for a collaborator based on their Role in the Matrix
 */
export function getMissingEPIsForCollaborator(collaborator) {
  const requiredEPIs = ROLE_EPI_MATRIX[collaborator.role] || [];
  const possessedNames = (collaborator.epis || []).map(e => e.name.toLowerCase().trim());
  
  return requiredEPIs.filter(req => {
    return !possessedNames.some(pName => pName.includes(req.name.toLowerCase().trim()) || req.name.toLowerCase().trim().includes(pName));
  });
}

/**
 * Assesses overall compliance status for a collaborator:
 * - "ok": Has 100% required EPIs, none expired, none warning
 * - "warning": Has near-expiring EPIs (<= 30 days)
 * - "danger": Has expired EPIs
 * - "missing": Is missing required EPIs
 */
export function getCollaboratorOverallStatus(collaborator) {
  const missing = getMissingEPIsForCollaborator(collaborator);
  const epis = collaborator.epis || [];
  
  let hasExpired = false;
  let hasWarning = false;

  for (const item of epis) {
    const days = calculateDaysRemaining(item.expiryDate);
    if (days < 0) hasExpired = true;
    else if (days <= 30) hasWarning = true;
  }

  if (hasExpired) return { code: 'danger', label: 'EPI Vencido', badgeClass: 'badge-danger' };
  if (missing.length > 0) return { code: 'missing', label: `${missing.length} EPI em Falta`, badgeClass: 'badge-missing' };
  if (hasWarning) return { code: 'warning', label: 'Vencimento Próximo', badgeClass: 'badge-warning' };
  
  return { code: 'ok', label: '100% Conforme', badgeClass: 'badge-ok' };
}

/**
 * Calculates KPI Metrics from filtered collaborator list
 */
export function calculateKPIMetrics(collaboratorsList) {
  let totalCollaborators = collaboratorsList.length;
  let conformCount = 0;
  let totalDeliveredEPIs = 0;
  let totalMissingEPIs = 0;
  let warningCount = 0;
  let expiredCount = 0;

  collaboratorsList.forEach(col => {
    const statusObj = getCollaboratorOverallStatus(col);
    if (statusObj.code === 'ok') conformCount++;
    if (statusObj.code === 'warning') warningCount++;
    if (statusObj.code === 'danger') expiredCount++;

    const missing = getMissingEPIsForCollaborator(col);
    totalMissingEPIs += missing.length;
    
    (col.epis || []).forEach(epi => {
      totalDeliveredEPIs++;
      const days = calculateDaysRemaining(epi.expiryDate);
      if (days < 0) expiredCount++;
      else if (days <= 30) warningCount++;
    });
  });

  const conformityPercentage = totalCollaborators > 0 
    ? Math.round((conformCount / totalCollaborators) * 100) 
    : 100;

  return {
    totalCollaborators,
    conformityPercentage,
    totalDeliveredEPIs,
    totalMissingEPIs,
    warningCount,
    expiredCount
  };
}
