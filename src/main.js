// ============================================
// WAREHOUSE MASTER AI — Main Application
// Entry point: routing, navigation, datetime
// ============================================

import { renderDashboard, initDashboard } from './views/dashboard.js';
import { renderWorkflows, initWorkflows } from './views/workflows.js';
import { renderInventory, initInventory } from './views/inventory.js';
import { renderAgents, initAgents } from './views/agents.js';
import { renderPlanning, initPlanning } from './views/planning.js';
import { renderSuppliers, initSuppliers } from './views/suppliers.js';
import { renderSalesOrders, initSalesOrders } from './views/sales_orders.js';
import { renderLogs, initLogs } from './views/logs.js';

// === State ===
let currentPage = 'dashboard';

// === DOM refs ===
const pageContent = document.getElementById('pageContent');
const pageTitle = document.getElementById('pageTitle');
const dateTimeEl = document.getElementById('dateTime');
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const toastContainer = document.getElementById('toastContainer');

// === Page Definitions ===
const pages = {
  dashboard: { title: 'Dashboard', render: renderDashboard, init: initDashboard },
  planning:  { title: 'Kế hoạch Nhập/QC', render: renderPlanning, init: (toast) => initPlanning(toast) },
  workflows: { title: 'Workflows', render: renderWorkflows, init: (toast) => initWorkflows(toast) },
  inventory: { title: 'Tồn Kho', render: renderInventory, init: (toast) => initInventory(toast) },
  suppliers: { title: 'Nhà Cung Ứng', render: renderSuppliers, init: (toast) => initSuppliers(toast) },
  sales_orders: { title: 'Đơn Hàng SO', render: renderSalesOrders, init: (toast) => initSalesOrders(toast) },
  agents:    { title: 'Agents', render: renderAgents, init: initAgents },
  logs:      { title: 'Nhật Ký', render: renderLogs, init: initLogs },
};

// === Navigation ===
function navigateTo(page) {
  if (!pages[page]) return;

  currentPage = page;

  // Update nav highlight
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  // Update title
  pageTitle.textContent = pages[page].title;

  // Render page
  pageContent.innerHTML = pages[page].render();

  // Initialize page
  if (pages[page].init) {
    if (['workflows', 'inventory', 'planning', 'suppliers', 'sales_orders'].includes(page)) {
      pages[page].init(showToast);
    } else {
      pages[page].init();
    }
  }

  // Close mobile sidebar
  sidebar.classList.remove('open');
}

// === Custom Events for Navigation (Data Passing) ===
window.addEventListener('wms-navigate', (e) => {
  const { page, data } = e.detail;
  if (pages[page]) {
    navigateTo(page);
    // If navigating to workflows, we might need a small delay to let it init
    if (page === 'workflows' && data) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('wms-fill-workflow', { detail: data }));
      }, 100);
    }
  }
});

// Nav click handler
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const page = item.dataset.page;
    if (page) navigateTo(page);
  });
});

// Mobile menu toggle
menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

// === Toast Notifications ===
function showToast(message, type = 'info') {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  // Auto-remove after 4s
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// === DateTime Update ===
function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  dateTimeEl.textContent = now.toLocaleString('vi-VN', options);
}

// Update every second
updateDateTime();
setInterval(updateDateTime, 1000);

// === Initial Page Load ===
navigateTo('dashboard');

// Show welcome toast
setTimeout(() => {
  showToast('Warehouse Master AI đã sẵn sàng!', 'success');
}, 800);

console.log('🏭 Warehouse Master AI v2.0 — Initialized');
