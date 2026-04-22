// ============================================
// WORKFLOWS VIEW
// ============================================

import { workflowDefinitions, WorkflowRunner } from '../workflows.js';
import { skuDatabase } from '../data.js';
import { highlightJSON } from '../agents.js';
import { getSalesOrders, getImportPlans } from '../api.js';

let currentWorkflow = null;
let runner = null;
let stepResults = [];

export function renderWorkflows() {
  return `
    <div class="section-header">
      <div>
        <div class="section-title">Workflow Engine</div>
        <div class="section-subtitle">Chọn quy trình và chạy mô phỏng AI tự động</div>
      </div>
    </div>

    <!-- Workflow Selector Cards -->
    <div class="workflow-selector" id="workflowSelector">
      ${workflowDefinitions.map(wf => `
        <div class="workflow-card animate-slide" data-workflow="${wf.id}" id="wfCard-${wf.id}">
          <div class="workflow-card-icon" style="background: var(--accent-${wf.color}-glow); color: var(--accent-${wf.color});">
            ${wf.icon}
          </div>
          <div class="workflow-card-title">${wf.name}</div>
          <div class="workflow-card-desc">${wf.description}</div>
        </div>
      `).join('')}
    </div>

    <!-- Workflow Form (hidden initially) -->
    <div id="workflowFormContainer" style="display: none;">
      <div class="workflow-form">
        <div class="card-header">
          <div class="card-title" id="wfFormTitle">—</div>
          <button class="btn btn-sm btn-secondary" id="wfBackBtn">← Chọn lại</button>
        </div>
        <div class="form-grid" id="wfFormFields"></div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary" id="wfRunBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Chạy Workflow
          </button>
          <button class="btn btn-danger btn-sm" id="wfCancelBtn" style="display: none;">Dừng</button>
        </div>
      </div>
    </div>

    <!-- Workflow Execution Steps -->
    <div class="card" id="workflowStepsContainer" style="display: none;">
      <div class="card-header">
        <div class="card-title">
          <span id="wfStepsTitle">Kết quả thực thi</span>
        </div>
        <div id="wfProgressText" style="font-size: 0.8rem; color: var(--text-muted);"></div>
      </div>
      <div class="workflow-steps" id="workflowSteps"></div>
      <!-- Final Status -->
      <div id="workflowFinalStatus" style="display: none; margin-top: 20px; padding: 16px; border-radius: var(--radius-md);"></div>
    </div>
  `;
}

export function initWorkflows(showToast) {
  const selector = document.getElementById('workflowSelector');
  const formContainer = document.getElementById('workflowFormContainer');
  const formFields = document.getElementById('wfFormFields');
  const formTitle = document.getElementById('wfFormTitle');
  const runBtn = document.getElementById('wfRunBtn');
  const cancelBtn = document.getElementById('wfCancelBtn');
  const backBtn = document.getElementById('wfBackBtn');
  const stepsContainer = document.getElementById('workflowStepsContainer');
  const stepsDiv = document.getElementById('workflowSteps');
  const progressText = document.getElementById('wfProgressText');
  const finalStatus = document.getElementById('workflowFinalStatus');

  // Select workflow
  selector.addEventListener('click', async (e) => {
    const card = e.target.closest('.workflow-card');
    if (!card) return;

    const wfId = card.dataset.workflow;
    currentWorkflow = workflowDefinitions.find(wf => wf.id === wfId);
    if (!currentWorkflow) return;

    // Highlight selected
    document.querySelectorAll('.workflow-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    let salesOrders = [];
    if (currentWorkflow.fields.some(f => f.type === 'select_so')) {
      try {
        salesOrders = await getSalesOrders();
      } catch (err) { console.error('Lỗi tải SO:', err); }
    }

    let importPlans = [];
    if (currentWorkflow.fields.some(f => f.type === 'select_plan')) {
      try {
        importPlans = (await getImportPlans()).filter(p => p.status !== 'DONE' && p.received_qty < p.qty);
      } catch (err) { console.error('Lỗi tải Plans:', err); }
    }

    // Show form
    formTitle.textContent = currentWorkflow.icon + ' ' + currentWorkflow.name;
    formFields.innerHTML = currentWorkflow.fields.map(field => {
      if (field.type === 'select_so') {
        return `
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">${field.label}</label>
            <input class="form-select" list="dl_wf_${field.id}" id="wf_${field.id}" placeholder="— Gõ để tìm kiếm Đơn Đặt Hàng SO —" autocomplete="off" />
            <datalist id="dl_wf_${field.id}">
              ${salesOrders.map(so => `<option value="${so.so_number}" data-itemcode="${so.item_code}" data-color="${so.color}" data-size="${so.size}" data-qty="${so.qty}" data-imported="${so.imported_qty || 0}">SO: ${so.so_number} | Mã: ${so.item_code} | Màu: ${so.color} | Size: ${so.size} | SL: ${so.qty} (Đã nhập: ${so.imported_qty || 0})</option>`).join('')}
            </datalist>
          </div>
        `;
      }
      if (field.type === 'select_plan') {
        return `
          <div class="form-group" style="grid-column: 1 / -1;">
            <label class="form-label">${field.label}</label>
            <input class="form-select" list="dl_wf_${field.id}" id="wf_${field.id}" placeholder="— Gõ để tìm kiếm Kế Hoạch Nhập NCC —" autocomplete="off" />
            <datalist id="dl_wf_${field.id}">
              ${importPlans.map(p => `<option value="${p.po_number || p.id}" data-supplier="${p.supplier}" data-sku="${p.sku}" data-qty="${p.qty}" data-imported="${p.received_qty || 0}">PO: ${p.po_number || '#' + p.id} | NCC: ${p.supplier} | SKU: ${p.sku} | SL Plan: ${p.qty} (Đã nhập: ${p.received_qty || 0})</option>`).join('')}
            </datalist>
          </div>
        `;
      }
      if (field.type === 'select') {
        const items = field.options === 'materials' ? skuDatabase.materials : skuDatabase.finishedGoods;
        return `
          <div class="form-group">
            <label class="form-label">${field.label}</label>
            <input class="form-select" list="dl_wf_${field.id}" id="wf_${field.id}" placeholder="— Gõ để tìm kiếm SKU —" autocomplete="off" />
            <datalist id="dl_wf_${field.id}">
              ${items.map(item => `<option value="${item.sku}">${item.sku} — ${item.name}</option>`).join('')}
            </datalist>
          </div>
        `;
      }
      const defaultValue = field.type === 'date' ? new Date().toISOString().slice(0, 10) : '';
      return `
        <div class="form-group">
          <label class="form-label">${field.label}</label>
          <input class="form-input" type="${field.type}" id="wf_${field.id}" placeholder="${field.placeholder || ''}" value="${defaultValue}" />
        </div>
      `;
    }).join('');

    formContainer.style.display = 'block';
    formContainer.classList.add('animate-fade');
    stepsContainer.style.display = 'none';
    finalStatus.style.display = 'none';
  });

  // Back button
  backBtn.addEventListener('click', () => {
    formContainer.style.display = 'none';
    document.querySelectorAll('.workflow-card').forEach(c => c.classList.remove('selected'));
    currentWorkflow = null;
  });

  // Run workflow
  runBtn.addEventListener('click', () => {
    if (!currentWorkflow) return;

    // Collect params
    const params = {};
    let valid = true;
    currentWorkflow.fields.forEach(field => {
      const el = document.getElementById('wf_' + field.id);
      if (!el || !el.value.trim()) {
        valid = false;
        if (el) el.style.borderColor = 'var(--accent-rose)';
      } else {
        params[field.id] = el.value.trim();
        if (el) el.style.borderColor = '';

        if (field.type === 'select_so') {
          const list = document.getElementById('dl_wf_' + field.id);
          const option = Array.from(list.options).find(o => o.value === params[field.id]);
          if (option) {
            params.itemCode = option.dataset.itemcode;
            params.color = option.dataset.color;
            params.size = option.dataset.size;
            params.totalQty = parseInt(option.dataset.qty) || 0;
            params.importedQty = parseInt(option.dataset.imported) || 0;
            params.so = params[field.id]; // map "so" for xuat_thanh_pham compatibility
            
            // Map SKU from Finished Goods mock DB
            const item = skuDatabase.finishedGoods.find(fg => fg.itemCode === params.itemCode) ||
                         skuDatabase.finishedGoods.find(fg => fg.item_code === params.itemCode);
            params.sku = item ? item.sku : ('TP-' + params.itemCode);
          }
        }

        if (field.type === 'select_plan') {
          const list = document.getElementById('dl_wf_' + field.id);
          const option = Array.from(list.options).find(o => o.value === params[field.id]);
          if (option) {
            params.supplier = option.dataset.supplier;
            params.sku = option.dataset.sku;
            params.totalQty = parseInt(option.dataset.qty) || 0;
            params.importedQty = parseInt(option.dataset.imported) || 0;
            params.po = params[field.id];
          }
        }
      }
    });

    if (!valid) {
      showToast('Vui lòng điền đầy đủ thông tin', 'warning');
      return;
    }

    // Validation: Kiem tra vuot muc SO (dành cho nhap_thanh_pham)
    if ((currentWorkflow.id === 'nhap_thanh_pham' || currentWorkflow.id === 'nhap_vat_tu') && params.qty) {
      const remaining = params.totalQty - params.importedQty;
      if (parseInt(params.qty) > remaining) {
        showToast(`Số lượng thực nhập (${params.qty}) vượt quá SL còn lại của kế hoạch/đơn hàng (${remaining})!`, 'error');
        const qtyEl = document.getElementById('wf_qty');
        if (qtyEl) qtyEl.style.borderColor = 'var(--accent-rose)';
        return;
      }
    }

    // Reset & show steps
    stepResults = [];
    stepsDiv.innerHTML = '';
    stepsContainer.style.display = 'block';
    stepsContainer.classList.add('animate-fade');
    finalStatus.style.display = 'none';
    finalStatus.innerHTML = '';
    runBtn.disabled = true;
    cancelBtn.style.display = 'inline-flex';
    progressText.textContent = 'Đang khởi tạo...';

    // Create runner
    runner = new WorkflowRunner(
      // onStepStart
      (stepIndex, totalSteps) => {
        progressText.textContent = `Bước ${stepIndex + 1} / ${totalSteps}`;
        // Add running step indicator
        const placeholder = document.createElement('div');
        placeholder.className = 'step-item';
        placeholder.id = `step-${stepIndex}`;
        placeholder.innerHTML = `
          <div class="step-number running">${stepIndex + 1}</div>
          <div class="step-body">
            <div class="step-header">
              <div class="step-title">Đang xử lý...</div>
              <div class="step-agent-badge">AI Processing</div>
            </div>
            <div class="step-description" style="color: var(--accent-blue);">
              <div class="spinner" style="display: inline-block; width: 12px; height: 12px; border: 2px solid var(--accent-blue-glow); border-top-color: var(--accent-blue); border-radius: 50%; animation: spin 0.6s linear infinite; vertical-align: middle; margin-right: 6px;"></div>
              Đang thực thi tác vụ...
            </div>
          </div>
        `;
        stepsDiv.appendChild(placeholder);
        placeholder.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      },
      // onStepComplete
      (stepIndex, totalSteps, result) => {
        stepResults.push(result);
        const el = document.getElementById(`step-${stepIndex}`);
        if (!el) return;

        const isSuccess = result.status === 'SUCCESS';
        el.innerHTML = `
          <div class="step-number ${isSuccess ? 'success' : 'fail'}">${isSuccess ? '✓' : '✗'}</div>
          <div class="step-body">
            <div class="step-header">
              <div class="step-title">${result.step}</div>
              <div class="step-agent-badge" style="${isSuccess ? '' : 'background: var(--accent-rose-glow); color: var(--accent-rose);'}">${result.agent.replace('AGENT_', '')}</div>
              <span style="font-size: 0.72rem; font-weight: 600; color: ${isSuccess ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">${result.status}</span>
            </div>
            <div class="step-description">${result.message}</div>
            <div class="step-json"><pre>${highlightJSON(result)}</pre></div>
          </div>
        `;
      },
      // onWorkflowComplete
      (success) => {
        runBtn.disabled = false;
        cancelBtn.style.display = 'none';
        progressText.textContent = success ? '✅ Hoàn tất' : '❌ Thất bại';

        finalStatus.style.display = 'block';
        finalStatus.style.background = success
          ? 'var(--accent-emerald-glow)'
          : 'var(--accent-rose-glow)';
        finalStatus.style.border = `1px solid ${success ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}`;
        finalStatus.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.5rem;">${success ? '✅' : '❌'}</span>
            <div>
              <div style="font-weight: 700; color: ${success ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
                ${success ? 'Workflow hoàn tất thành công!' : 'Workflow dừng do lỗi!'}
              </div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                ${stepResults.length} bước đã thực thi — ${currentWorkflow.name}
              </div>
            </div>
          </div>
        `;

        showToast(
          success ? `${currentWorkflow.name} hoàn tất thành công!` : `${currentWorkflow.name} thất bại!`,
          success ? 'success' : 'error'
        );
      }
    );

    // Run!
    runner.run(currentWorkflow.id, params);
  });
  // Cancel workflow
  cancelBtn.addEventListener('click', () => {
    if (runner) {
      runner.cancel();
      runBtn.disabled = false;
      cancelBtn.style.display = 'none';
      progressText.textContent = '⏹ Đã huỷ';
      showToast('Workflow đã bị huỷ', 'warning');
    }
  });

  // Listen for auto-fill event (from Planning page)
  window.addEventListener('wms-fill-workflow', (e) => {
    const { type, po, sku } = e.detail;
    let targetWfId = '';
    
    if (type === 'VT_IN') targetWfId = 'NHAP_KHO_VAT_TU';
    
    if (targetWfId) {
      const card = document.getElementById(`wfCard-${targetWfId}`);
      if (card) {
        card.click();
        // Wait a bit for the form to render
        setTimeout(() => {
          const poField = document.getElementById('wf_po');
          const skuField = document.getElementById('wf_sku');
          if (poField) poField.value = po;
          if (skuField) skuField.value = sku;
        }, 50);
      }
    }
  });
}
