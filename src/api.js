// ============================================
// WAREHOUSE OS — API Client
// All backend communication goes through here
// ============================================

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    };
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const res = await fetch(url, config);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

// ============================================
// INVENTORY
// ============================================

export async function getInventory(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/inventory${query ? '?' + query : ''}`);
}

export async function getInventoryItem(sku) {
  return request(`/inventory/${encodeURIComponent(sku)}`);
}

export async function importStock(data) {
  return request('/import', { method: 'POST', body: data });
}

export async function exportStock(data) {
  return request('/export', { method: 'POST', body: data });
}

// ============================================
// IMPORT PLANS
// ============================================

export async function getImportPlans(status = null) {
  const query = status ? `?status=${status}` : '';
  return request(`/import-plans${query}`);
}

export async function createImportPlan(data) {
  return request('/import-plan', { method: 'POST', body: data });
}

export async function importFromPlan(data) {
  return request('/import-from-plan', { method: 'POST', body: data });
}

export async function updatePlanQC(planId, qcStatus) {
  return request(`/import-plan/${planId}/qc`, { method: 'PUT', body: { qc_status: qcStatus } });
}

// ============================================
// SUPPLIERS & SALES ORDERS
// ============================================

export async function getSuppliers() {
  return request('/suppliers');
}

export async function importSuppliers(items) {
  return request('/suppliers/import', { method: 'POST', body: { items } });
}

export async function getSalesOrders() {
  return request('/sales-orders');
}

export async function importSalesOrders(items) {
  return request('/sales-orders/import', { method: 'POST', body: { items } });
}

export async function updateSOImportedQty(so_number, item_code, qty) {
  return request('/sales-orders/receive', { method: 'POST', body: { so_number, item_code, qty } });
}

// ============================================
// KPI & ANALYTICS
// ============================================

export async function getImportKPI() {
  return request('/kpi/import');
}

export async function getInventoryKPI() {
  return request('/kpi/inventory');
}

export async function getSupplierAnalytics() {
  return request('/analytics/suppliers');
}

// ============================================
// AI AGENT OS
// ============================================

export async function sendAICommand(input) {
  return request('/ai/command', { method: 'POST', body: { input } });
}

export async function getAIAgents() {
  return request('/ai/agents');
}

export async function getAILogs() {
  return request('/ai/logs');
}

export async function getAISchedule() {
  return request('/ai/schedule');
}

export async function runAIJob(id) {
  return request('/ai/schedule/run', { method: 'POST', body: { id } });
}

export async function getProductionSummary() {
  return request('/production/summary');
}

export async function getComplianceStatus() {
  return request('/compliance/status');
}
