// ============================================
// PRODUCTION MONITOR VIEW
// ============================================

import { getProductionSummary } from '../api.js';

export function renderProduction() {
  return `
    <div class="section-header">
      <div>
        <div class="section-title">Production Monitor</div>
        <div class="section-subtitle">Theo dõi sản lượng thực tế vs Kế hoạch</div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card animate-fade delay-1">
        <div class="card-header">
          <div class="card-title">Production Line A (Rubber Boots)</div>
        </div>
        <div class="prod-line-item">
          <div class="prod-stats">
            <span>Progress (Weekly)</span>
            <span>850 / 1000 đôi</span>
          </div>
          <div class="prod-progress-bg">
            <div class="prod-progress-fill" style="width: 85%"></div>
          </div>
        </div>
        <div class="prod-line-item">
          <div class="prod-stats">
            <span>QC Rejection Rate</span>
            <span style="color: var(--accent-emerald);">1.2%</span>
          </div>
          <div class="prod-progress-bg">
            <div class="prod-progress-fill emerald" style="width: 1.2%"></div>
          </div>
        </div>
      </div>

      <div class="card animate-fade delay-2">
        <div class="card-header">
          <div class="card-title">Production Line B (Components)</div>
        </div>
        <div class="prod-line-item">
          <div class="prod-stats">
            <span>Progress (Weekly)</span>
            <span>420 / 500 kiện</span>
          </div>
          <div class="prod-progress-bg">
            <div class="prod-progress-fill" style="width: 84%; background: var(--accent-purple);"></div>
          </div>
        </div>
        <div class="prod-line-item">
          <div class="prod-stats">
            <span>QC Rejection Rate</span>
            <span style="color: var(--accent-amber);">4.5%</span>
          </div>
          <div class="prod-progress-bg">
            <div class="prod-progress-fill amber" style="width: 4.5%"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="card full-width animate-fade delay-3" style="margin-top: 20px;">
      <div class="card-header">
        <div class="card-title">Production Plan Details</div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Line</th>
            <th>Item</th>
            <th>Plan Qty</th>
            <th>Actual Qty</th>
            <th>Variance</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="productionList">
          <tr>
            <td>Line A</td>
            <td>Rubber Boot AH-001</td>
            <td>1000</td>
            <td>850</td>
            <td>-150</td>
            <td><span class="stock-badge normal">ON TRACK</span></td>
          </tr>
          <tr>
            <td>Line B</td>
            <td>Sole Component SC-02</td>
            <td>500</td>
            <td>420</td>
            <td>-80</td>
            <td><span class="stock-badge normal">ON TRACK</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

export async function initProduction() {
  try {
    const data = await getProductionSummary();
    const productionList = document.getElementById('productionList');
    if (data && data.length > 0) {
      productionList.innerHTML = data.map(d => `
        <tr>
          <td>Line A</td>
          <td>${d.issue || 'Rubber Boots'}</td>
          <td>1000</td>
          <td>${d.plan_vs_actual || '--'}</td>
          <td>--</td>
          <td><span class="stock-badge normal">SYNCED</span></td>
        </tr>
      `).join('');
    }
  } catch (err) {}
}
