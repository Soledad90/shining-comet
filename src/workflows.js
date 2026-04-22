// ============================================
// WAREHOUSE MASTER AI — Workflow Engine
// Orchestrates agents through 5 standard workflows
// ============================================

import { AgentKhoVatTu, AgentQC, AgentKhoThanhPham, AgentXuatHang, AgentAQL, AgentControl } from './agents.js';
import { findSKU, saveDatabase, updatePlanProgress } from './data.js';
import { getImportPlans, importFromPlan, importStock, exportStock, updateSOImportedQty } from './api.js';

// === Workflow Definitions ===
export const workflowDefinitions = [
  {
    id: 'nhap_vat_tu',
    name: 'Nhập Kho Vật Tư',
    icon: '📦',
    description: 'PO → QC → ERP → QR → Putaway',
    color: 'blue',
    fields: [
      { id: 'txnDate', label: 'Ngày thực hiện', type: 'date' },
      { id: 'po', label: 'Sổ Chọn Kế Hoạch PO', type: 'select_plan' },
      { id: 'qty', label: 'Số lượng thực nhập', type: 'number', placeholder: 'Nhập SL...' },
      { id: 'packages', label: 'Số kiện / cuộn', type: 'number', placeholder: '0' },
      { id: 'unit', label: 'Đơn vị tính', type: 'text', placeholder: 'Vd: Mét' },
      { id: 'converted_unit', label: 'ĐVT Quy đổi', type: 'text', placeholder: 'Vd: Cuộn' }
    ]
  },
  {
    id: 'xuat_vat_tu',
    name: 'Xuất Kho Vật Tư',
    icon: '📤',
    description: 'Request → Check tồn → Scan QR → Check SL → ERP',
    color: 'cyan',
    fields: [
      { id: 'txnDate', label: 'Ngày thực hiện', type: 'date' },
      { id: 'sku', label: 'Chọn SKU Vật Tư', type: 'select', options: 'materials' },
      { id: 'qty', label: 'Số lượng cần xuất', type: 'number', placeholder: '0' },
      { id: 'packages', label: 'Số kiện cần xuất', type: 'number', placeholder: '0' },
      { id: 'reason', label: 'Lý do', type: 'text', placeholder: 'Sản xuất đơn hàng...' }
    ]
  },
  {
    id: 'nhap_thanh_pham',
    name: 'Nhập Kho Thành Phẩm',
    icon: '👟',
    description: 'QC xác nhận → Nhập kho → Scan thùng → Putaway',
    color: 'purple',
    fields: [
      { id: 'txnDate', label: 'Ngày thực hiện', type: 'date' },
      { id: 'so', label: 'Số SO', type: 'select_so' },
      { id: 'qty', label: 'Số lượng', type: 'number', placeholder: '1000' },
      { id: 'packages', label: 'Số kiện / thùng', type: 'number', placeholder: '0' },
      { id: 'unit', label: 'Đơn vị tính', type: 'text', placeholder: 'Vd: Đôi' },
      { id: 'converted_unit', label: 'ĐVT Quy đổi', type: 'text', placeholder: 'Vd: Thùng' },
      { id: 'location', label: 'Vị trí lưu kho', type: 'text', placeholder: 'Khu D-01' }
    ]
  },
  {
    id: 'kiem_aql',
    name: 'Kiểm Tra AQL',
    icon: '🔍',
    description: 'Lấy mẫu → QC kiểm → Đánh giá OK/NG',
    color: 'emerald',
    fields: [
      { id: 'txnDate', label: 'Ngày thực hiện', type: 'date' },
      { id: 'soNumber', label: 'Sổ Chọn Đơn Hàng SO', type: 'select_so' },
      { id: 'location', label: 'Vị trí', type: 'text', placeholder: 'D-01-01' },
      { id: 'lotSize', label: 'Số lượng lô (để mẫu)', type: 'number', placeholder: '200' }
    ]
  },
  {
    id: 'xuat_thanh_pham',
    name: 'Xuất Thành Phẩm',
    icon: '🚛',
    description: 'Lệnh xuất → Check tồn → Pick → Check → Load xe',
    color: 'amber',
    fields: [
      { id: 'txnDate', label: 'Ngày thực hiện', type: 'date' },
      { id: 'soNumber', label: 'Sổ Chọn Đơn Hàng SO', type: 'select_so' },
      { id: 'location', label: 'Vị trí lấy', type: 'text', placeholder: 'D-01-01' }
    ]
  }
];

// === Workflow Runner ===
export class WorkflowRunner {
  constructor(onStepStart, onStepComplete, onWorkflowComplete) {
    this.onStepStart = onStepStart;
    this.onStepComplete = onStepComplete;
    this.onWorkflowComplete = onWorkflowComplete;
    this.isRunning = false;
    this.isCancelled = false;
  }

  cancel() {
    this.isCancelled = true;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async runStep(stepIndex, totalSteps, fn) {
    if (this.isCancelled) return null;
    this.onStepStart(stepIndex, totalSteps);
    await this.delay(800 + Math.random() * 600);
    if (this.isCancelled) return null;
    const result = fn();
    this.onStepComplete(stepIndex, totalSteps, result);
    return result;
  }

  // === WORKFLOW 1: Nhập Kho Vật Tư ===
  async runNhapVatTu({ po, supplier, sku, qty, txnDate, packages, unit, converted_unit }) {
    this.isRunning = true;
    this.isCancelled = false;
    qty = parseInt(qty);
    const totalSteps = 6;
    const item = findSKU(sku);

    // Step 1: Nhận PO (Pass the supplier info to agent if needed, or just keep original message)
    let result = await this.runStep(0, totalSteps, () => {
      const r = AgentKhoVatTu.receivePO(po, sku, qty);
      if (supplier) r.message += ` (từ NCC: ${supplier})`;
      return r;
    });
    if (!result || result.status === 'FAIL') { this.finish(false, result); return; }

    // Step 2: QC kiểm
    result = await this.runStep(1, totalSteps, () => AgentQC.inspect(sku, qty, true));
    if (!result || result.status === 'FAIL') {
      // QC FAIL → trả NCC
      await this.runStep(2, totalSteps, () => AgentControl.alert(`QC FAIL — Trả lại NCC: ${sku} x ${qty}`));
      this.finish(false, result);
      return;
    }

    // Step 3: Nhập ERP
    result = await this.runStep(2, totalSteps, () => AgentKhoVatTu.importERP(sku, qty));
    if (!result || result.status === 'FAIL') { this.finish(false, result); return; }

    // Step 4: Tạo QR
    result = await this.runStep(3, totalSteps, () => AgentKhoVatTu.createQR(sku, qty));

    // Step 5: Putaway
    result = await this.runStep(4, totalSteps, () => AgentKhoVatTu.putaway(sku, qty, item?.location || 'A-01-01'));

    // Step 6: Control check
    result = await this.runStep(5, totalSteps, () => AgentControl.checkStockLevel(sku));

    // Update Planning Progress & API Backend
    try {
      // Still update local mock just in case for UI that relies on it
      updatePlanProgress(po, sku, qty, 'Passed');
      
      // Update Real API database
      const plans = await getImportPlans('PLANNED');
      const plan = plans.find(p => p.sku === sku && (!po || p.po_number === po));
      
      if (plan) {
        await importFromPlan({ plan_id: plan.id, qty: qty, actual_date: txnDate, location: item?.location || 'A-01-01' });
        console.log(`[Workflow] Synced real API: Imported from plan #${plan.id}`);
      } else {
        await importStock({ sku: sku, qty: qty, actual_date: txnDate, location: item?.location || 'A-01-01', supplier: supplier });
        console.log(`[Workflow] Synced real API: Direct import for ${sku}`);
      }
    } catch(err) {
      console.warn('Failed to sync workflow result to API:', err.message);
    }

    this.finish(true);
  }

  // === WORKFLOW 2: Xuất Kho Vật Tư ===
  async runXuatVatTu({ sku, qty, txnDate, packages, reason, po, supplier }) {
    this.isRunning = true;
    this.isCancelled = false;
    qty = parseInt(qty);
    const totalSteps = 5;

    // Step 1: Check tồn
    let result = await this.runStep(0, totalSteps, () => AgentKhoVatTu.checkStock(sku));
    const item = findSKU(sku);
    if (!result) { this.finish(false, result); return; }
    if (item && item.stock < qty) {
      await this.runStep(1, totalSteps, () => AgentControl.alert(`Lệch tồn: ${sku} — tồn ${item.stock} < yêu cầu ${qty}`));
      this.finish(false, result);
      return;
    }

    // Step 2: Scan QR phiếu
    result = await this.runStep(1, totalSteps, () => AgentKhoVatTu.scanQRPhieu(sku));

    // Step 3: Scan QR vật tư
    result = await this.runStep(2, totalSteps, () => AgentKhoVatTu.scanQRVatTu(sku, qty));

    // Step 4: Check số lượng
    result = await this.runStep(3, totalSteps, () => AgentControl.checkDiscrepancy(sku, qty, qty));

    // Step 5: Xuất ERP
    result = await this.runStep(4, totalSteps, () => AgentKhoVatTu.exportERP(sku, qty));
    if (!result || result.status === 'FAIL') { this.finish(false, result); return; }

    // Update real API backend (Inventory)
    try {
      await exportStock({ sku: sku, qty: qty, actual_date: txnDate, packages: parseInt(packages) || 0, reason: reason || 'Xuất cấp phát sản xuất' });
      console.log(`[Workflow] Synced real API: Exported target ${sku}`);
    } catch(err) {
      console.warn('Failed to sync workflow result to API:', err.message);
    }

    this.finish(true);
  }

  // === WORKFLOW 3: Nhập Kho Thành Phẩm ===
  async runNhapThanhPham({ sku, qty, soNumber, itemCode, color, size, location, txnDate, packages, unit, converted_unit }) {
    this.isRunning = true;
    this.isCancelled = false;
    qty = parseInt(qty);
    size = parseInt(size) || 0;
    const totalSteps = 5;
    const item = findSKU(sku);
    const targetLocation = location && location.trim() !== '' ? location : (item?.location || 'D-01-01');
    const extraInfo = `SO: ${soNumber || '--'} | Mã hàng: ${itemCode || '--'} | Màu: ${color || '--'} | Size: ${size || '--'} | Vị trí: ${targetLocation}`;

    // Step 1: QC xác nhận
    let result = await this.runStep(0, totalSteps, () => {
      const r = AgentQC.confirmForFG(sku, qty);
      r.message += ` [${extraInfo}]`;
      return r;
    });
    if (!result || result.status === 'FAIL') { this.finish(false, result); return; }

    // Step 2: Nhập kho (và cập nhật thông tin mở rộng)
    result = await this.runStep(1, totalSteps, () => {
      const r = AgentKhoThanhPham.receiveGoods(sku, qty);
      // Update item with new fields
      const updatedItem = findSKU(sku);
      if (updatedItem) {
        if (soNumber) updatedItem.soNumber = soNumber;
        if (itemCode) updatedItem.itemCode = itemCode;
        if (color) updatedItem.color = color;
        if (size) updatedItem.size = size;
        if (location && location.trim() !== '') updatedItem.location = location.trim();
        saveDatabase();
      }
      r.soNumber = soNumber || '--';
      r.itemCode = itemCode || '--';
      r.color = color || '--';
      r.size = size || '--';
      r.location = targetLocation;
      r.message += ` [${extraInfo}]`;
      return r;
    });
    if (!result || result.status === 'FAIL') { this.finish(false, result); return; }

    // Step 3: Scan thùng
    result = await this.runStep(2, totalSteps, () => AgentKhoThanhPham.scanBox(sku, qty));

    // Step 4: Putaway
    result = await this.runStep(3, totalSteps, () => AgentKhoThanhPham.putaway(sku, qty, targetLocation));

    // Step 5: Control check
    result = await this.runStep(4, totalSteps, () => AgentControl.checkStockLevel(sku));

    // Update real API backend Inventory Stock
    try {
      await importStock({ 
        sku: sku, qty: qty, actual_date: txnDate, so_number: soNumber, item_code: itemCode, color: color, location: targetLocation,
        packages: parseInt(packages) || 0, unit: unit, converted_unit: converted_unit,
        reason: 'Nhập kho thành phẩm' 
      });
      console.log(`[Workflow] Updated Inventory DB for Finished Good ${sku}`);
    } catch(err) {
      console.warn('Failed to sync workflow FG result to API:', err.message);
    }

    // Update real API backend (sales_orders imported_qty)
    if (soNumber && itemCode) {
      try {
        await updateSOImportedQty(soNumber, itemCode, qty);
        console.log(`[Workflow] Updated SO imported qty for ${soNumber}`);
      } catch (err) {
        console.warn('Failed to update SO imported qty to API:', err.message);
      }
    }

    this.finish(true);
  }

  // === WORKFLOW 4: Kiểm Tra AQL ===
  async runKiemAQL({ sku, lotSize, soNumber, itemCode, color, size, location, txnDate }) {
    this.isRunning = true;
    this.isCancelled = false;
    lotSize = parseInt(lotSize);
    size = parseInt(size) || 0;
    const totalSteps = 3;
    const item = findSKU(sku);
    const targetLocation = location && location.trim() !== '' ? location : (item?.location || '--');
    const extraInfo = `SO: ${soNumber || '--'} | Mã hàng: ${itemCode || '--'} | Màu: ${color || '--'} | Size: ${size || '--'} | Vị trí: ${targetLocation}`;

    // Step 1: Lấy mẫu
    let result = await this.runStep(0, totalSteps, () => {
      const r = AgentAQL.takeSample(sku, lotSize);
      if (r) {
        r.soNumber = soNumber || '--';
        r.itemCode = itemCode || '--';
        r.color = color || '--';
        r.size = size || '--';
        r.location = targetLocation;
        r.message += ` [${extraInfo}]`;
      }
      return r;
    });
    if (!result) { this.finish(false, result); return; }
    const sampleSize = AgentAQL.getSampleSize(lotSize);

    // Step 2: QC kiểm
    result = await this.runStep(1, totalSteps, () => {
      const r = AgentAQL.inspect(sku, sampleSize);
      if (r) {
        r.soNumber = soNumber || '--';
        r.itemCode = itemCode || '--';
        r.color = color || '--';
        r.size = size || '--';
        r.location = targetLocation;
      }
      return r;
    });
    if (!result) { this.finish(false, result); return; }

    // Step 3: Control report
    if (result.status === 'FAIL') {
      result = await this.runStep(2, totalSteps, () => AgentControl.alert(`AQL NG: ${sku} — lô ${lotSize} không đạt | ${extraInfo}`));
      this.finish(false, result);
    } else {
      result = await this.runStep(2, totalSteps, () => AgentControl.checkStockLevel(sku));
      this.finish(true);
    }
  }

  // === WORKFLOW 5: Xuất Thành Phẩm ===
  async runXuatThanhPham({ so, sku, qty, itemCode, color, size, location, txnDate }) {
    this.isRunning = true;
    this.isCancelled = false;
    qty = parseInt(qty);
    size = parseInt(size) || 0;
    const totalSteps = 5;
    const item = findSKU(sku);
    const sourceLocation = location && location.trim() !== '' ? location : (item?.location || '--');
    const extraInfo = `SO: ${so || '--'} | Mã hàng: ${itemCode || '--'} | Màu: ${color || '--'} | Size: ${size || '--'} | Vị trí: ${sourceLocation}`;

    // Step 1: Nhận lệnh xuất
    let result = await this.runStep(0, totalSteps, () => {
      const r = AgentXuatHang.receiveOrder(so, sku, qty);
      r.soNumber = so || '--';
      r.itemCode = itemCode || '--';
      r.color = color || '--';
      r.size = size || '--';
      r.location = sourceLocation;
      r.message += ` [${extraInfo}]`;
      return r;
    });
    if (!result) { this.finish(false, result); return; }

    // Step 2: Check tồn
    result = await this.runStep(1, totalSteps, () => AgentXuatHang.checkStock(sku, qty));
    if (!result || result.status === 'FAIL') {
      await this.runStep(2, totalSteps, () => AgentControl.alert(`Không đủ hàng xuất: ${sku} | ${extraInfo} — yêu cầu ${qty}`));
      this.finish(false, result);
      return;
    }

    // Step 3: Pick
    result = await this.runStep(2, totalSteps, () => {
      const r = AgentXuatHang.pick(sku, qty);
      r.itemCode = itemCode || '--';
      r.color = color || '--';
      r.size = size || '--';
      r.location = sourceLocation;
      return r;
    });

    // Step 4: Check thực tế
    result = await this.runStep(3, totalSteps, () => AgentXuatHang.verifyActual(sku, qty));

    // Step 5: Load xe
    result = await this.runStep(4, totalSteps, () => {
      const r = AgentXuatHang.loadTruck(so, sku, qty);
      r.soNumber = so || '--';
      r.itemCode = itemCode || '--';
      r.color = color || '--';
      r.size = size || '--';
      r.location = sourceLocation;
      r.message += ` [${extraInfo}]`;
      return r;
    });

    this.finish(true);
  }

  finish(success, lastResult = null) {
    this.isRunning = false;
    if (this.onWorkflowComplete) {
      this.onWorkflowComplete(success, lastResult);
    }
  }

  // === Dispatch workflow ===
  async run(workflowId, params) {
    switch (workflowId) {
      case 'nhap_vat_tu': return this.runNhapVatTu(params);
      case 'xuat_vat_tu': return this.runXuatVatTu(params);
      case 'nhap_thanh_pham': return this.runNhapThanhPham(params);
      case 'kiem_aql': return this.runKiemAQL(params);
      case 'xuat_thanh_pham': return this.runXuatThanhPham(params);
      default: console.error('Unknown workflow:', workflowId);
    }
  }
}
