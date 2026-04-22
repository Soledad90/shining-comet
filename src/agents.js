// ============================================
// WAREHOUSE MASTER AI — Agent Classes
// Each agent returns standard JSON output format
// ============================================

import { findSKU, generateQRCode, addLogEntry, skuDatabase, saveDatabase } from './data.js';

// === Base output builder ===
function buildOutput(step, agent, action, status, sku, qty, location, message) {
  return { step, agent, action, status, sku, qty, location, message };
}

// === JSON syntax highlighting ===
export function highlightJSON(obj) {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(
    /("(?:[^"\\]|\\.)*")\s*:/g, '<span class="json-key">$1</span>:'
  ).replace(
    /:\s*("(?:[^"\\]|\\.)*")/g, ': <span class="json-string">$1</span>'
  ).replace(
    /:\s*(\d+\.?\d*)/g, ': <span class="json-number">$1</span>'
  ).replace(
    /:\s*(true|false|null)/g, ': <span class="json-bool">$1</span>'
  );
}

// ============================================
// AGENT 1: KHO VẬT TƯ
// ============================================
export class AgentKhoVatTu {
  static id = 'AGENT_KHO_VAT_TU';

  // Nhận PO
  static receivePO(po, sku, qty) {
    const item = findSKU(sku);
    if (!item) {
      return buildOutput('Nhận PO', this.id, 'Tiếp nhận đơn hàng mua', 'FAIL', sku, qty, '--', `SKU ${sku} không tồn tại trong hệ thống`);
    }
    addLogEntry({ agent: this.id, message: `Nhận PO: ${po} — ${qty} ${item.unit} ${item.name}`, status: 'info' });
    return buildOutput('Nhận PO', this.id, 'Tiếp nhận đơn hàng mua', 'SUCCESS', sku, qty, item.location, `Tiếp nhận PO ${po}: ${qty} ${item.unit} ${item.name}`);
  }

  // Tạo QR
  static createQR(sku, qty) {
    const item = findSKU(sku);
    const qr = generateQRCode();
    addLogEntry({ agent: this.id, message: `Tạo QR: ${qr} cho ${sku} x ${qty}`, status: 'success' });
    return buildOutput('Tạo QR', this.id, 'Tạo mã QR cho lô hàng', 'SUCCESS', sku, qty, item?.location || '--', `Tạo QR thành công: ${qr}`);
  }

  // Nhập ERP
  static importERP(sku, qty) {
    const item = findSKU(sku);
    if (!item) {
      return buildOutput('Nhập ERP', this.id, 'Cập nhật hệ thống ERP', 'FAIL', sku, qty, '--', `SKU ${sku} không tìm thấy`);
    }
    item.stock += qty;
    saveDatabase();
    addLogEntry({ agent: this.id, message: `Nhập ERP: ${sku} +${qty} → tồn mới: ${item.stock}`, status: 'success' });
    return buildOutput('Nhập ERP', this.id, 'Cập nhật hệ thống ERP', 'SUCCESS', sku, qty, item.location, `Cập nhật ERP: tồn mới = ${item.stock} ${item.unit}`);
  }

  // Putaway
  static putaway(sku, qty, location) {
    const item = findSKU(sku);
    addLogEntry({ agent: this.id, message: `Putaway: ${sku} x ${qty} → ${location}`, status: 'success' });
    return buildOutput('Putaway', this.id, 'Xếp hàng vào vị trí', 'SUCCESS', sku, qty, location, `Xếp ${qty} ${item?.unit || ''} ${item?.name || sku} vào vị trí ${location}`);
  }

  // Check tồn
  static checkStock(sku) {
    const item = findSKU(sku);
    if (!item) {
      return buildOutput('Check tồn', this.id, 'Kiểm tra tồn kho', 'FAIL', sku, 0, '--', `SKU ${sku} không tìm thấy`);
    }
    const status = item.stock >= item.minStock ? 'SUCCESS' : 'FAIL';
    const msg = item.stock >= item.minStock
      ? `Tồn kho đủ: ${item.stock} ${item.unit} (min: ${item.minStock})`
      : `⚠ Tồn kho thấp: ${item.stock} ${item.unit} (min: ${item.minStock})`;
    addLogEntry({ agent: this.id, message: `Check tồn ${sku}: ${item.stock} ${item.unit}`, status: status === 'SUCCESS' ? 'info' : 'warning' });
    return buildOutput('Check tồn', this.id, 'Kiểm tra tồn kho', status, sku, item.stock, item.location, msg);
  }

  // Scan QR phiếu
  static scanQRPhieu(sku) {
    const qr = generateQRCode();
    addLogEntry({ agent: this.id, message: `Scan QR phiếu: ${qr} — SKU ${sku}`, status: 'success' });
    return buildOutput('Scan QR phiếu', this.id, 'Quét mã QR phiếu xuất', 'SUCCESS', sku, 0, '--', `Quét QR phiếu thành công: ${qr}`);
  }

  // Scan QR vật tư
  static scanQRVatTu(sku, qty) {
    const item = findSKU(sku);
    addLogEntry({ agent: this.id, message: `Scan QR vật tư: ${sku} x ${qty}`, status: 'success' });
    return buildOutput('Scan QR vật tư', this.id, 'Quét mã QR vật tư', 'SUCCESS', sku, qty, item?.location || '--', `Quét QR vật tư thành công: ${sku} x ${qty}`);
  }

  // Xuất ERP
  static exportERP(sku, qty) {
    const item = findSKU(sku);
    if (!item) {
      return buildOutput('Xuất ERP', this.id, 'Cập nhật ERP xuất kho', 'FAIL', sku, qty, '--', `SKU ${sku} không tìm thấy`);
    }
    if (item.stock < qty) {
      addLogEntry({ agent: this.id, message: `⚠ Xuất ERP thất bại: ${sku} tồn ${item.stock} < yêu cầu ${qty}`, status: 'fail' });
      return buildOutput('Xuất ERP', this.id, 'Cập nhật ERP xuất kho', 'FAIL', sku, qty, item.location, `Không đủ hàng: tồn ${item.stock} < yêu cầu ${qty}`);
    }
    item.stock -= qty;
    saveDatabase();
    addLogEntry({ agent: this.id, message: `Xuất ERP: ${sku} -${qty} → tồn mới: ${item.stock}`, status: 'success' });
    return buildOutput('Xuất ERP', this.id, 'Cập nhật ERP xuất kho', 'SUCCESS', sku, qty, item.location, `Xuất kho thành công: tồn mới = ${item.stock} ${item.unit}`);
  }
}

// ============================================
// AGENT 2: QC
// ============================================
export class AgentQC {
  static id = 'AGENT_QC';

  static inspect(sku, qty, forceResult = null) {
    const item = findSKU(sku);
    // Simulate QC: 90% pass rate or forced result
    const pass = forceResult !== null ? forceResult : Math.random() > 0.1;
    const status = pass ? 'SUCCESS' : 'FAIL';
    const msg = pass
      ? `QC PASS: ${qty} ${item?.unit || ''} ${item?.name || sku} đạt tiêu chuẩn chất lượng`
      : `QC FAIL: Phát hiện lỗi chất lượng — ${item?.name || sku}. Trả lại NCC.`;
    
    addLogEntry({ agent: this.id, message: msg, status: pass ? 'success' : 'fail' });
    return buildOutput('Kiểm tra QC', this.id, pass ? 'QC — PASS' : 'QC — FAIL', status, sku, qty, item?.location || '--', msg);
  }

  static confirmForFG(sku, qty) {
    const item = findSKU(sku);
    addLogEntry({ agent: this.id, message: `QC xác nhận TP: ${sku} x ${qty} — PASS`, status: 'success' });
    return buildOutput('QC xác nhận TP', this.id, 'Xác nhận chất lượng thành phẩm', 'SUCCESS', sku, qty, item?.location || '--', `QC xác nhận: ${qty} ${item?.unit || ''} ${item?.name || sku} đạt chuẩn xuất kho`);
  }
}

// ============================================
// AGENT 3: KHO THÀNH PHẨM
// ============================================
export class AgentKhoThanhPham {
  static id = 'AGENT_KHO_THANH_PHAM';

  static receiveGoods(sku, qty) {
    const item = findSKU(sku);
    if (!item) {
      return buildOutput('Nhập kho TP', this.id, 'Nhận thành phẩm vào kho', 'FAIL', sku, qty, '--', `SKU ${sku} không tìm thấy`);
    }
    item.stock += qty;
    saveDatabase();
    addLogEntry({ agent: this.id, message: `Nhập kho TP: ${sku} +${qty} → tồn: ${item.stock}`, status: 'success' });
    return buildOutput('Nhập kho TP', this.id, 'Nhận thành phẩm vào kho', 'SUCCESS', sku, qty, item.location, `Nhập kho ${qty} ${item.unit} ${item.name}. Tồn mới: ${item.stock}`);
  }

  static scanBox(sku, qty) {
    const boxId = 'TP' + Date.now().toString(36).toUpperCase();
    addLogEntry({ agent: this.id, message: `Scan thùng: ${boxId} — ${sku} x ${qty}`, status: 'success' });
    return buildOutput('Scan thùng', this.id, 'Quét mã thùng thành phẩm', 'SUCCESS', sku, qty, '--', `Scan thùng thành công: ${boxId}`);
  }

  static putaway(sku, qty, location) {
    addLogEntry({ agent: this.id, message: `Putaway TP: ${sku} x ${qty} → ${location}`, status: 'success' });
    return buildOutput('Putaway TP', this.id, 'Xếp thành phẩm vào vị trí', 'SUCCESS', sku, qty, location, `Xếp ${qty} vào vị trí ${location} thành công`);
  }
}

// ============================================
// AGENT 4: XUẤT HÀNG
// ============================================
export class AgentXuatHang {
  static id = 'AGENT_XUAT_HANG';

  static receiveOrder(so, sku, qty) {
    const item = findSKU(sku);
    addLogEntry({ agent: this.id, message: `Nhận lệnh xuất: ${so} — ${sku} x ${qty}`, status: 'info' });
    return buildOutput('Nhận lệnh xuất', this.id, 'Tiếp nhận lệnh xuất hàng', 'SUCCESS', sku, qty, item?.location || '--', `Nhận lệnh xuất ${so}: ${qty} ${item?.unit || ''} ${item?.name || sku}`);
  }

  static checkStock(sku, qty) {
    const item = findSKU(sku);
    if (!item) {
      return buildOutput('Check tồn TP', this.id, 'Kiểm tra tồn thành phẩm', 'FAIL', sku, qty, '--', `SKU ${sku} không tìm thấy`);
    }
    if (item.stock < qty) {
      addLogEntry({ agent: this.id, message: `⚠ Thiếu hàng: ${sku} tồn ${item.stock} < cần ${qty}`, status: 'fail' });
      return buildOutput('Check tồn TP', this.id, 'Kiểm tra tồn thành phẩm', 'FAIL', sku, qty, item.location, `Thiếu hàng: tồn ${item.stock} < yêu cầu ${qty}. Không cho phép xuất.`);
    }
    addLogEntry({ agent: this.id, message: `Check tồn OK: ${sku} tồn ${item.stock} >= ${qty}`, status: 'info' });
    return buildOutput('Check tồn TP', this.id, 'Kiểm tra tồn thành phẩm', 'SUCCESS', sku, qty, item.location, `Tồn đủ: ${item.stock} ${item.unit} ≥ ${qty} yêu cầu`);
  }

  static pick(sku, qty) {
    const item = findSKU(sku);
    addLogEntry({ agent: this.id, message: `Pick: ${sku} x ${qty} từ ${item?.location}`, status: 'success' });
    return buildOutput('Pick hàng', this.id, 'Lấy hàng từ kệ', 'SUCCESS', sku, qty, item?.location || '--', `Lấy ${qty} ${item?.unit || ''} ${item?.name || sku} từ ${item?.location || '--'}`);
  }

  static verifyActual(sku, qty) {
    const item = findSKU(sku);
    addLogEntry({ agent: this.id, message: `Check thực tế OK: ${sku} x ${qty}`, status: 'success' });
    return buildOutput('Check thực tế', this.id, 'Kiểm tra số lượng thực tế', 'SUCCESS', sku, qty, item?.location || '--', `Đối chiếu thực tế: ${qty} ${item?.unit || ''} — khớp phiếu xuất`);
  }

  static loadTruck(so, sku, qty) {
    const item = findSKU(sku);
    if (item) {
      item.stock -= qty;
      saveDatabase();
    }
    const truckId = 'XE-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    addLogEntry({ agent: this.id, message: `Load xe ${truckId}: ${so} — ${sku} x ${qty}`, status: 'success' });
    return buildOutput('Load xe', this.id, 'Xếp hàng lên xe', 'SUCCESS', sku, qty, 'Loading Bay', `Load xe ${truckId} hoàn tất: ${qty} ${item?.unit || ''} ${item?.name || sku}. Tồn mới: ${item?.stock ?? '--'}`);
  }
}

// ============================================
// AGENT 5: AQL Inspector
// ============================================
export class AgentAQL {
  static id = 'AGENT_AQL';

  // Determine sample size based on lot size (simplified AQL Level II, AQL 2.5)
  static getSampleSize(lotSize) {
    if (lotSize <= 50) return 8;
    if (lotSize <= 150) return 13;
    if (lotSize <= 500) return 50;
    if (lotSize <= 1200) return 80;
    return 125;
  }

  static takeSample(sku, lotSize) {
    const sampleSize = this.getSampleSize(lotSize);
    addLogEntry({ agent: this.id, message: `Lấy mẫu AQL: ${sku} — ${sampleSize}/${lotSize}`, status: 'info' });
    return buildOutput('Lấy mẫu AQL', this.id, 'Lấy mẫu kiểm tra AQL', 'SUCCESS', sku, sampleSize, '--', `Lấy mẫu: ${sampleSize} từ lô ${lotSize} (AQL Level II, 2.5)`);
  }

  static inspect(sku, sampleSize, forceResult = null) {
    const pass = forceResult !== null ? forceResult : Math.random() > 0.12;
    const defects = pass ? 0 : Math.ceil(Math.random() * 3);
    const status = pass ? 'SUCCESS' : 'FAIL';
    const msg = pass
      ? `AQL OK: ${sampleSize} mẫu kiểm tra — 0 lỗi. Lô hàng đạt chuẩn.`
      : `AQL NG: Phát hiện ${defects} lỗi / ${sampleSize} mẫu. Lô hàng KHÔNG đạt.`;
    addLogEntry({ agent: this.id, message: `AQL ${sku}: ${pass ? 'OK' : 'NG'} — ${defects} lỗi / ${sampleSize} mẫu`, status: pass ? 'success' : 'fail' });
    return buildOutput('Kiểm AQL', this.id, pass ? 'AQL — OK' : 'AQL — NG', status, sku, sampleSize, '--', msg);
  }
}

// ============================================
// AGENT 6: Control Center
// ============================================
export class AgentControl {
  static id = 'AGENT_CONTROL';

  static checkDiscrepancy(sku, expected, actual) {
    const match = expected === actual;
    const status = match ? 'SUCCESS' : 'FAIL';
    const msg = match
      ? `Không có sai lệch: ${sku} — khớp ${actual}`
      : `⚠ CẢNH BÁO SAI LỆCH: ${sku} — kỳ vọng ${expected}, thực tế ${actual}`;
    addLogEntry({ agent: this.id, message: msg, status: match ? 'success' : 'warning' });
    return buildOutput('Kiểm sai lệch', this.id, 'Kiểm soát sai lệch', status, sku, actual, '--', msg);
  }

  static checkStockLevel(sku) {
    const item = findSKU(sku);
    if (!item) {
      return buildOutput('Kiểm tồn', this.id, 'Kiểm tra mức tồn kho', 'FAIL', sku, 0, '--', `SKU ${sku} không tìm thấy`);
    }
    if (item.stock === 0) {
      const msg = `🚨 HẾT HÀNG: ${item.name} (${sku}) — stock = 0`;
      addLogEntry({ agent: this.id, message: msg, status: 'fail' });
      return buildOutput('Kiểm tồn', this.id, 'Kiểm tra mức tồn kho', 'FAIL', sku, 0, item.location, msg);
    }
    if (item.stock < item.minStock) {
      const msg = `⚠ TỒN THẤP: ${item.name} (${sku}) — ${item.stock} < min ${item.minStock}`;
      addLogEntry({ agent: this.id, message: msg, status: 'warning' });
      return buildOutput('Kiểm tồn', this.id, 'Kiểm tra mức tồn kho', 'FAIL', sku, item.stock, item.location, msg);
    }
    return buildOutput('Kiểm tồn', this.id, 'Kiểm tra mức tồn kho', 'SUCCESS', sku, item.stock, item.location, `Mức tồn ổn: ${item.stock} ${item.unit} (min: ${item.minStock})`);
  }

  static alert(message) {
    addLogEntry({ agent: this.id, message: `🚨 ${message}`, status: 'warning' });
    return buildOutput('Cảnh báo', this.id, 'Phát cảnh báo hệ thống', 'FAIL', '--', 0, '--', `🚨 ${message}`);
  }
}
