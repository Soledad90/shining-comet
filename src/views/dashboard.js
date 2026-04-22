// ============================================
// DASHBOARD VIEW — with API-driven KPI
// ============================================

import { getInventoryKPI, getImportKPI, getSupplierAnalytics } from '../api.js';
import { agentDefinitions, activityLog, warehouseLocations } from '../data.js';

export function renderDashboard() {
  const activeAgents = agentDefinitions.filter(a => a.status !== 'idle').length;
  const totalTasks = agentDefinitions.reduce((sum, a) => sum + a.tasksCompleted, 0);

  return `
    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card blue animate-slide delay-1">
        <div class="kpi-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </div>
        <div class="kpi-value" id="kpiTotalSKU">--</div>
        <div class="kpi-label">Tổng SKU</div>
        <div class="kpi-change up" id="kpiSKUChange">↑ Đang tải...</div>
      </div>

      <div class="kpi-card emerald animate-slide delay-2">
        <div class="kpi-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="kpi-value" id="kpiTotalValue">--</div>
        <div class="kpi-label">Giá trị tồn kho</div>
        <div class="kpi-change up">↑ Cập nhật realtime</div>
      </div>

      <div class="kpi-card amber animate-slide delay-3">
        <div class="kpi-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div class="kpi-value" id="kpiLowStock">--</div>
        <div class="kpi-label">Sắp hết hàng</div>
        <div class="kpi-change" id="kpiLowChange">Đang tải...</div>
      </div>

      <div class="kpi-card rose animate-slide delay-4">
        <div class="kpi-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div class="kpi-value" id="kpiOutOfStock">--</div>
        <div class="kpi-label">Hết hàng</div>
        <div class="kpi-change" id="kpiOutChange">Đang tải...</div>
      </div>

      <div class="kpi-card cyan animate-slide delay-5">
        <div class="kpi-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4"/>
          </svg>
        </div>
        <div class="kpi-value">${activeAgents}/6</div>
        <div class="kpi-label">Agents hoạt động</div>
        <div class="kpi-change up">↻ Đang xử lý</div>
      </div>

      <div class="kpi-card purple animate-slide delay-6">
        <div class="kpi-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <div class="kpi-value" id="kpiOntime">--</div>
        <div class="kpi-label">On-time Rate</div>
        <div class="kpi-change up" id="kpiOntimeDetail">Đang tải...</div>
      </div>
    </div>

    <!-- Dashboard Grid -->
    <div class="dashboard-grid">
      <!-- Agent Status -->
      <div class="card animate-fade delay-3">
        <div class="card-header">
          <div class="card-title">Trạng thái Agents</div>
        </div>
        <div class="agent-grid">
          ${agentDefinitions.map(agent => `
            <div class="agent-card">
              <div class="agent-card-header">
                <div class="agent-avatar ${agent.avatarClass}">${agent.shortName}</div>
                <div>
                  <div class="agent-name">${agent.name}</div>
                  <div class="agent-role">${agent.role.substring(0, 30)}...</div>
                </div>
              </div>
              <div class="agent-status-badge ${agent.status}">${agent.status.toUpperCase()}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Supplier Analytics -->
      <div class="card animate-fade delay-4">
        <div class="card-header">
          <div class="card-title">🏭 Supplier Analytics</div>
        </div>
        <div id="supplierAnalytics" style="padding: 8px 0;">
          <div style="text-align: center; color: var(--text-muted); padding: 20px;">Đang tải dữ liệu NCC...</div>
        </div>
      </div>

      <!-- Warehouse Capacity -->
      <div class="card animate-fade delay-5">
        <div class="card-header">
          <div class="card-title">Sức chứa kho</div>
        </div>
        <div class="capacity-list">
          ${Object.entries(warehouseLocations).map(([key, loc], i) => {
            const colors = ['blue', 'emerald', 'amber', 'purple'];
            return `
              <div class="capacity-item">
                <div class="capacity-header">
                  <span class="capacity-label">${loc.name}</span>
                  <span class="capacity-value">${loc.capacity}%</span>
                </div>
                <div class="capacity-bar">
                  <div class="capacity-fill ${colors[i]}" style="width: 0%" data-width="${loc.capacity}%"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card full-width animate-fade delay-6">
        <div class="card-header">
          <div class="card-title">Hoạt động gần đây</div>
        </div>
        <div class="timeline">
          ${activityLog.slice(0, 8).map(log => {
            const statusMap = { success: 'success', fail: 'fail', warning: 'warning', info: 'info' };
            return `
              <div class="timeline-item">
                <div class="timeline-dot ${statusMap[log.status] || 'info'}"></div>
                <div class="timeline-content">
                  <div class="timeline-text">${log.message}</div>
                  <div class="timeline-meta">${log.agent.replace('AGENT_', '')} — ${log.time}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

export async function initDashboard() {
  // Animate capacity bars
  setTimeout(() => {
    document.querySelectorAll('.capacity-fill').forEach(el => {
      el.style.width = el.dataset.width;
    });
  }, 300);

  // Load KPI from API
  const formatCurrency = (v) => {
    if (v >= 1e9) return (v / 1e9).toFixed(1) + ' tỷ';
    if (v >= 1e6) return (v / 1e6).toFixed(0) + ' tr';
    return v.toLocaleString('vi');
  };

  try {
    const [invKPI, importKPI, suppliers] = await Promise.all([
      getInventoryKPI(),
      getImportKPI(),
      getSupplierAnalytics(),
    ]);

    // Inventory KPI
    const totalSKUEl = document.getElementById('kpiTotalSKU');
    const totalValEl = document.getElementById('kpiTotalValue');
    const lowEl = document.getElementById('kpiLowStock');
    const outEl = document.getElementById('kpiOutOfStock');

    if (totalSKUEl) totalSKUEl.textContent = invKPI.totalSKUs;
    if (totalValEl) totalValEl.textContent = formatCurrency(invKPI.totalValue);
    if (lowEl) lowEl.textContent = invKPI.lowStock;
    if (outEl) outEl.textContent = invKPI.outOfStock;

    const lowChange = document.getElementById('kpiLowChange');
    const outChange = document.getElementById('kpiOutChange');
    const skuChange = document.getElementById('kpiSKUChange');
    if (lowChange) {
      lowChange.textContent = invKPI.lowStock > 0 ? '⚠ Cần bổ sung' : '✓ Ổn định';
      lowChange.className = `kpi-change ${invKPI.lowStock > 0 ? 'down' : 'up'}`;
    }
    if (outChange) {
      outChange.textContent = invKPI.outOfStock > 0 ? '🚨 Khẩn cấp' : '✓ Không có';
      outChange.className = `kpi-change ${invKPI.outOfStock > 0 ? 'down' : 'up'}`;
    }
    if (skuChange) skuChange.textContent = `↑ ${invKPI.totalSKUs} mã hàng`;

    // Import KPI (on-time)
    const ontimeEl = document.getElementById('kpiOntime');
    const ontimeDetail = document.getElementById('kpiOntimeDetail');
    if (ontimeEl) ontimeEl.textContent = `${importKPI.percent_ontime}%`;
    if (ontimeDetail) ontimeDetail.textContent = `✓ ${importKPI.ontime} on-time / ${importKPI.total} total | ${importKPI.late} late`;

    // Supplier Analytics
    const supplierDiv = document.getElementById('supplierAnalytics');
    if (supplierDiv) {
      if (suppliers.length === 0) {
        supplierDiv.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px; font-size: 0.85rem;">Chưa có dữ liệu NCC đã hoàn tất</div>`;
      } else {
        supplierDiv.innerHTML = `
          <table class="data-table" style="font-size: 0.82rem;">
            <thead>
              <tr>
                <th>Nhà cung cấp</th>
                <th>On-time %</th>
                <th>Avg Delay</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              ${suppliers.map(s => `
                <tr>
                  <td>${s.supplier}</td>
                  <td><span class="stock-badge ${s.ontime_rate >= 80 ? 'normal' : s.ontime_rate >= 50 ? 'low' : 'critical'}">${s.ontime_rate}%</span></td>
                  <td style="color: ${s.avg_delay_days > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)'};">${s.avg_delay_days > 0 ? '+' : ''}${s.avg_delay_days}d</td>
                  <td><strong>${s.score}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    }
  } catch (err) {
    console.warn('Dashboard KPI load failed (API may not be running):', err.message);
  }
}
