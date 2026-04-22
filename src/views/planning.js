// ============================================
// PLANNING VIEW — with API Integration
// ============================================

import { getImportPlans, createImportPlan, importFromPlan, updatePlanQC, getSuppliers, getInventory } from '../api.js';

export function renderPlanning() {
  return `
    <div class="planning-view">
      <div class="page-header">
        <div class="header-info">
          <h2>Kế hoạch Nhập kho & QC</h2>
          <p>Theo dõi tiến độ cung ứng vật tư và trạng thái kiểm định chất lượng</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" id="btnNewPlan">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tạo kế hoạch
          </button>
          <button class="btn btn-secondary" id="btnRefreshPlanning">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Làm mới
          </button>
        </div>
      </div>

      <!-- Create Plan Form (hidden by default) -->
      <div class="card" id="planFormCard" style="display: none; margin-bottom: 16px;">
        <div class="card-header">
          <div class="card-title">📋 Tạo kế hoạch nhập mới</div>
          <button class="btn btn-sm btn-secondary" id="btnCancelPlan">Huỷ</button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; padding: 16px 0;">
          <div>
            <label style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 4px; display: block;">Số PO</label>
            <input class="search-input" id="pf_po" placeholder="PO-XXXX" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 4px; display: block;">Nhà cung cấp *</label>
            <input list="dl_pf_supplier" class="search-input" id="pf_supplier" placeholder="— Gõ tên / Chọn NCC —" autocomplete="off" style="width: 100%;">
            <datalist id="dl_pf_supplier"></datalist>
          </div>
          <div>
            <label style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 4px; display: block;">SKU *</label>
            <input list="dl_pf_sku" class="search-input" id="pf_sku" placeholder="— Gõ tìm SKU —" autocomplete="off" style="width: 100%;">
            <datalist id="dl_pf_sku"></datalist>
          </div>
          <div>
            <label style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 4px; display: block;">Tên hàng</label>
            <input class="search-input" id="pf_name" placeholder="Tên vật tư" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 4px; display: block;">Số lượng *</label>
            <input class="search-input" id="pf_qty" type="number" placeholder="0" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 4px; display: block;">Packages</label>
            <input class="search-input" id="pf_pkg" type="number" placeholder="0" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 4px; display: block;">Đơn vị tính</label>
            <input class="search-input" id="pf_unit" placeholder="Mét, Cái..." style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 4px; display: block;">ĐVT Quy đổi</label>
            <input class="search-input" id="pf_c_unit" placeholder="Cuộn, Thùng..." style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 4px; display: block;">ETA</label>
            <input class="search-input" id="pf_eta" type="date" style="width: 100%;">
          </div>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button class="btn btn-primary" id="btnSubmitPlan">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Xác nhận
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid planning-stats" id="planningStats">
        <div class="stat-card">
          <div class="stat-icon planning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Tổng lệnh nhập</span>
            <span class="stat-value" id="statTotal">--</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Đã hoàn tất</span>
            <span class="stat-value" id="statDone">--</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4"/><path d="M12 16h.01"/><circle cx="12" cy="12" r="10"/></svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Đang thực hiện</span>
            <span class="stat-value" id="statProgress">--</span>
          </div>
        </div>
      </div>

      <!-- Plan Table -->
      <div class="table-container fade-in">
        <table class="wms-table" id="planTable">
          <thead>
            <tr>
              <th>ID / PO</th>
              <th>NCC / Vật tư</th>
              <th>Số lượng</th>
              <th>Tiến độ</th>
              <th>QC</th>
              <th>ETA</th>
              <th class="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody id="planTableBody">
            <tr><td colspan="7" style="text-align:center; padding: 40px; color: var(--text-muted);">Đang tải...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function getQCStatusLabel(status) {
  const labels = {
    'pending': 'Chờ kiểm',
    'inspecting': 'Đang kiểm',
    'passed': 'Đạt (Pass)',
    'failed': 'Lỗi (Fail)'
  };
  return labels[(status || '').toLowerCase()] || status;
}

export function initPlanning(toast) {
  const planFormCard = document.getElementById('planFormCard');
  const btnNew = document.getElementById('btnNewPlan');
  const btnCancel = document.getElementById('btnCancelPlan');
  const btnSubmit = document.getElementById('btnSubmitPlan');
  const btnRefresh = document.getElementById('btnRefreshPlanning');

  // Toggle form
  btnNew?.addEventListener('click', () => {
    planFormCard.style.display = planFormCard.style.display === 'none' ? 'block' : 'none';
  });
  btnCancel?.addEventListener('click', () => {
    planFormCard.style.display = 'none';
  });

  // Submit plan
  btnSubmit?.addEventListener('click', async () => {
    const po_number = document.getElementById('pf_po').value.trim();
    const supplier = document.getElementById('pf_supplier').value.trim();
    const sku = document.getElementById('pf_sku').value.trim();
    const item_name = document.getElementById('pf_name').value.trim();
    const qty = parseInt(document.getElementById('pf_qty').value) || 0;
    const packages = parseInt(document.getElementById('pf_pkg').value) || 0;
    const eta_date = document.getElementById('pf_eta').value;

    if (!supplier || !sku || !qty) {
      toast('Vui lòng nhập đủ: NCC, SKU, Số lượng', 'warning');
      return;
    }

    try {
      await createImportPlan({ po_number, supplier, sku, item_name, qty, packages, eta_date });
      toast(`Tạo kế hoạch: ${po_number ? po_number + ' — ' : ''}${sku} từ ${supplier} OK!`, 'success');
      planFormCard.style.display = 'none';
      loadDataAndOptions();
    } catch (err) {
      toast('Lỗi tạo kế hoạch: ' + err.message, 'error');
    }
  });

  // Refresh
  btnRefresh?.addEventListener('click', loadDataAndOptions);

  async function loadDataAndOptions() {
    try {
      const [plans, suppliers, inventory] = await Promise.all([
        getImportPlans(),
        getSuppliers(),
        getInventory({ type: 'material' })
      ]);
      
      // Populate Suppliers
      const supSelect = document.getElementById('dl_pf_supplier');
      if (supSelect && supSelect.options.length === 0) {
        suppliers.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.supplier_name;
          supSelect.appendChild(opt);
        });
      }

      // Populate SKUs
      const skuSelect = document.getElementById('dl_pf_sku');
      const skuInput = document.getElementById('pf_sku');
      if (skuSelect && skuSelect.options.length === 0) {
        inventory.forEach(i => {
          const opt = document.createElement('option');
          opt.value = i.sku;
          opt.textContent = i.item_name;
          skuSelect.appendChild(opt);
        });
        
        // Tự động điền item_name khi chọn SKU
        skuInput.addEventListener('input', (e) => {
          const selected = inventory.find(item => item.sku === e.target.value);
          const nameInput = document.getElementById('pf_name');
          if (selected && nameInput) nameInput.value = selected.item_name;
        });
      }

      renderPlanTable(plans);
      updateStats(plans);
    } catch (err) {
      console.error('Load plans failed:', err);
      toast('Không thể tải kế hoạch. API server đang chạy?', 'error');
    }
  }

  function updateStats(plans) {
    const total = plans.length;
    const done = plans.filter(p => p.status === 'DONE' || (p.received_qty >= p.qty && p.qty > 0)).length;
    const progress = plans.filter(p => p.received_qty > 0 && p.received_qty < p.qty).length;

    const el = (id) => document.getElementById(id);
    if (el('statTotal')) el('statTotal').textContent = total;
    if (el('statDone')) el('statDone').textContent = done;
    if (el('statProgress')) el('statProgress').textContent = progress;
  }

  function renderPlanTable(plans) {
    const tbody = document.getElementById('planTableBody');
    if (!tbody) return;

    if (plans.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 40px; color: var(--text-muted);">Chưa có kế hoạch nhập</td></tr>';
      return;
    }

    tbody.innerHTML = plans.map(plan => {
      const progress = plan.qty > 0 ? Math.min(Math.round((plan.received_qty / plan.qty) * 100), 100) : 0;
      const isDone = progress >= 100 || plan.status === 'DONE';

      return `
        <tr>
          <td>
            <div class="primary-text">#${plan.id} ${plan.po_number || ''}</div>
          </td>
          <td>
            <div class="primary-text">${plan.supplier}</div>
            <div class="secondary-text">${plan.item_name} (${plan.sku})</div>
          </td>
          <td>
            <div class="primary-text">${plan.qty.toLocaleString()}</div>
            <div class="secondary-text">Đã nhận: ${plan.received_qty.toLocaleString()}</div>
          </td>
          <td>
            <div class="progress-wrapper">
              <div class="progress-bar-bg">
                <div class="progress-bar-fill ${isDone ? 'done' : ''}" style="width: ${progress}%"></div>
              </div>
              <span class="progress-text">${progress}%</span>
            </div>
          </td>
          <td>
            <span class="badge badge-${(plan.qc_status || 'pending').toLowerCase()}">
              ${getQCStatusLabel(plan.qc_status)}
            </span>
          </td>
          <td>${plan.eta_date || '--'}</td>
          <td class="text-right">
            ${!isDone ? `
              <button class="btn btn-sm btn-outline btn-receive-plan" data-plan-id="${plan.id}">
                Nhập kho
              </button>
            ` : '<span class="status-done">Đã đủ</span>'}
          </td>
        </tr>
      `;
    }).join('');

    // Bind receive buttons
    document.querySelectorAll('.btn-receive-plan').forEach(btn => {
      btn.addEventListener('click', async () => {
        const planId = parseInt(btn.dataset.planId);
        try {
          const result = await importFromPlan({ plan_id: planId });
          toast(result.message, 'success');
          loadPlans();
        } catch (err) {
          toast('Lỗi nhập kho: ' + err.message, 'error');
        }
      });
    });
  }

  // Initial load
  loadDataAndOptions();
}
