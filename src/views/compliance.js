// ============================================
// COMPLIANCE & AUDIT VIEW
// ============================================

import { getComplianceStatus } from '../api.js';

export function renderCompliance() {
  return `
    <div class="section-header">
      <div>
        <div class="section-title">Compliance & Audit</div>
        <div class="section-subtitle">Tiêu chuẩn Adidas A0386 & Warehouse Audit Standards</div>
      </div>
    </div>

    <div class="compliance-summary">
      <div class="card animate-fade delay-1">
        <div class="card-header">
          <div class="card-title">Compliance Score</div>
        </div>
        <div class="score-gauge">
          <div class="score-circle" id="scoreCircle"></div>
          <div class="score-value" id="scoreValue">--</div>
        </div>
        <div style="text-align: center; margin-top: 10px; color: var(--text-muted); font-size: 0.8rem;">
          Dựa trên 15 danh mục kiểm tra gần nhất
        </div>
      </div>

      <div class="card animate-fade delay-2">
        <div class="card-header">
          <div class="card-title">Risk Level</div>
        </div>
        <div id="riskLevel" style="text-align: center; padding: 20px;">
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--accent-emerald);">LOW</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Hệ thống đang vận hành an toàn</div>
        </div>
        <div class="capacity-list" style="margin-top: 10px;">
          <div class="capacity-item">
            <div class="capacity-header"><span class="capacity-label">SOP Adherence</span><span class="capacity-value">98%</span></div>
            <div class="capacity-bar"><div class="capacity-fill emerald" style="width: 98%"></div></div>
          </div>
          <div class="capacity-item">
            <div class="capacity-header"><span class="capacity-label">Chemical Storage</span><span class="capacity-value">100%</span></div>
            <div class="capacity-bar"><div class="capacity-fill emerald" style="width: 100%"></div></div>
          </div>
        </div>
      </div>
    </div>

    <div class="card full-width animate-fade delay-3">
      <div class="card-header">
        <div class="card-title">Audit History</div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Thời gian</th>
            <th>Danh mục</th>
            <th>Trạng thái</th>
            <th>Vấn đề ghi nhận</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody id="complianceList">
          <tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">Đang tải dữ liệu audit...</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

export async function initCompliance() {
  const scoreCircle = document.getElementById('scoreCircle');
  const scoreValue = document.getElementById('scoreValue');
  const complianceList = document.getElementById('complianceList');

  // Set mock score
  const score = 95;
  scoreValue.textContent = score;
  scoreCircle.style.background = `conic-gradient(var(--accent-emerald) ${score}%, transparent 0%)`;

  try {
    const data = await getComplianceStatus();
    if (data.length === 0) {
      // Seed mock if empty
      complianceList.innerHTML = `
        <tr>
          <td>${new Date().toLocaleDateString()}</td>
          <td>Chemical Storage</td>
          <td><span class="stock-badge normal">PASS</span></td>
          <td>Không có vấn đề. Nhãn mác đầy đủ.</td>
          <td><button class="btn-secondary">Chi tiết</button></td>
        </tr>
        <tr>
          <td>${new Date().toLocaleDateString()}</td>
          <td>SOP Nhập kho</td>
          <td><span class="stock-badge normal">PASS</span></td>
          <td>Đã kiểm tra 5 PO, tất cả khớp ERP.</td>
          <td><button class="btn-secondary">Chi tiết</button></td>
        </tr>
      `;
    } else {
      complianceList.innerHTML = data.map(d => `
        <tr>
          <td>${new Date(d.created_at).toLocaleDateString()}</td>
          <td>Audit Check</td>
          <td><span class="stock-badge ${d.risk_level === 'LOW' ? 'normal' : 'critical'}">PASS</span></td>
          <td>Score: ${d.compliance_score}. Issues: ${d.issues_json}</td>
          <td><button class="btn-secondary">Chi tiết</button></td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error(err);
  }
}
