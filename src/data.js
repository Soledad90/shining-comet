// ============================================
// WAREHOUSE MASTER AI — Mock Data
// ============================================

// === Default Data ===
const defaultDatabase = {
  // Vật tư (Materials)
  materials: [
    { sku: 'VT-DA-001', name: 'Da bò nhập Ý', unit: 'tấm', stock: 1250, minStock: 200, location: 'A-01-01', category: 'Da', price: 450000 },
    { sku: 'VT-DA-002', name: 'Da tổng hợp PU', unit: 'tấm', stock: 3200, minStock: 500, location: 'A-01-02', category: 'Da', price: 120000 },
    { sku: 'VT-DA-003', name: 'Da lộn cao cấp', unit: 'tấm', stock: 85, minStock: 100, location: 'A-01-03', category: 'Da', price: 680000 },
    { sku: 'VT-DE-001', name: 'Đế cao su EVA', unit: 'đôi', stock: 5600, minStock: 1000, location: 'A-02-01', category: 'Đế', price: 35000 },
    { sku: 'VT-DE-002', name: 'Đế phylon injection', unit: 'đôi', stock: 4200, minStock: 800, location: 'A-02-02', category: 'Đế', price: 42000 },
    { sku: 'VT-DE-003', name: 'Đế TPR chống trượt', unit: 'đôi', stock: 320, minStock: 500, location: 'A-02-03', category: 'Đế', price: 28000 },
    { sku: 'VT-CH-001', name: 'Chỉ may Nylon #40', unit: 'cuộn', stock: 890, minStock: 200, location: 'B-01-01', category: 'Phụ liệu', price: 15000 },
    { sku: 'VT-CH-002', name: 'Keo dán PU-303', unit: 'kg', stock: 450, minStock: 100, location: 'B-01-02', category: 'Phụ liệu', price: 85000 },
    { sku: 'VT-KH-001', name: 'Khoen kim loại bạc', unit: 'cái', stock: 15800, minStock: 3000, location: 'B-02-01', category: 'Phụ kiện', price: 1500 },
    { sku: 'VT-DL-001', name: 'Đệm lót memory foam', unit: 'đôi', stock: 2800, minStock: 600, location: 'B-03-01', category: 'Đệm', price: 22000 },
    { sku: 'VT-VL-001', name: 'Vải lót mesh thoáng khí', unit: 'mét', stock: 4500, minStock: 800, location: 'C-01-01', category: 'Vải', price: 18000 },
    { sku: 'VT-HO-001', name: 'Hộp giày premium', unit: 'cái', stock: 6200, minStock: 1500, location: 'C-02-01', category: 'Bao bì', price: 8000 },
  ],

  // Thành phẩm (Finished Goods)
  // Columns: sku, name, soNumber, itemCode, color, size, unit, stock, minStock, location, category, price, sizes (EU/US/UK)
  finishedGoods: [
    { sku: 'TP-SNK-001', name: 'Sneaker Urban Pro', soNumber: 'ADR001', itemCode: 'AH001', color: 'BK/WH', size: 4, unit: 'đôi', stock: 480, minStock: 100, location: 'D-01-01', category: 'Sneaker', price: 1250000, sizes: 'EU 38-44 | US 5.5-10.5 | UK 5-10' },
    { sku: 'TP-SNK-002', name: 'Sneaker Air Flow X', soNumber: 'ADR002', itemCode: 'AH002', color: 'NV', size: 5, unit: 'đôi', stock: 320, minStock: 80, location: 'D-01-02', category: 'Sneaker', price: 1680000, sizes: 'EU 39-45 | US 6.5-11.5 | UK 6-11' },
    { sku: 'TP-SNK-003', name: 'Sneaker Classic Retro', soNumber: 'ADR003', itemCode: 'AH003', color: 'WH/RD', size: 3, unit: 'đôi', stock: 15, minStock: 50, location: 'D-01-03', category: 'Sneaker', price: 980000, sizes: 'EU 38-43 | US 5.5-9.5 | UK 5-9' },
    { sku: 'TP-BT-001', name: 'Boot Chelsea Da Bò', soNumber: 'ADR004', itemCode: 'BT001', color: 'BR', size: 4, unit: 'đôi', stock: 210, minStock: 60, location: 'D-02-01', category: 'Boot', price: 2450000, sizes: 'EU 39-44 | US 6.5-10.5 | UK 6-10' },
    { sku: 'TP-BT-002', name: 'Boot Combat Tactical', soNumber: 'ADR005', itemCode: 'BT002', color: 'BK', size: 5, unit: 'đôi', stock: 45, minStock: 40, location: 'D-02-02', category: 'Boot', price: 1890000, sizes: 'EU 40-45 | US 7-11.5 | UK 6.5-11' },
    { sku: 'TP-SD-001', name: 'Sandal Sport Active', soNumber: 'ADR006', itemCode: 'SD001', color: 'BK/GY', size: 4, unit: 'đôi', stock: 580, minStock: 120, location: 'D-03-01', category: 'Sandal', price: 650000, sizes: 'EU 38-44 | US 5.5-10.5 | UK 5-10' },
    { sku: 'TP-SD-002', name: 'Sandal Comfort Plus', soNumber: 'ADR007', itemCode: 'SD002', color: 'BG/WH', size: 3, unit: 'đôi', stock: 0, minStock: 100, location: 'D-03-02', category: 'Sandal', price: 480000, sizes: 'EU 36-42 | US 4-8.5 | UK 3.5-8' },
    { sku: 'TP-LF-001', name: 'Loafer Executive', soNumber: 'ADR008', itemCode: 'LF001', color: 'BK-GL', size: 4, unit: 'đôi', stock: 165, minStock: 50, location: 'D-04-01', category: 'Loafer', price: 1950000, sizes: 'EU 39-44 | US 6.5-10.5 | UK 6-10' },
  ],

  // Kế hoạch nhập kho
  inboundPlans: [
    { id: 'PLN-001', poNumber: 'PO-2026-0089', sku: 'VT-DA-001', itemName: 'Da bò nhập Ý', plannedQty: 500, receivedQty: 0, qcStatus: 'Pending', eta: '2026-04-05', supplier: 'Công ty Da Italia' },
    { id: 'PLN-002', poNumber: 'PO-2026-0090', sku: 'VT-DE-003', itemName: 'Đế TPR chống trượt', plannedQty: 1000, receivedQty: 0, qcStatus: 'Pending', eta: '2026-04-06', supplier: 'NCC Đế Tân Phú' },
    { id: 'PLN-003', poNumber: 'PO-2026-0092', sku: 'VT-DE-001', itemName: 'Đế cao su EVA', plannedQty: 2000, receivedQty: 1500, qcStatus: 'Passed', eta: '2026-03-28', supplier: 'Cao Su Miền Nam' },
    { id: 'PLN-004', poNumber: 'PO-2026-0093', sku: 'VT-KH-001', itemName: 'Khoen kim loại bạc', plannedQty: 5000, receivedQty: 5000, qcStatus: 'Passed', eta: '2026-03-25', supplier: 'Phụ Kiện May Mặc' },
  ]
};

// === SKU Database State ===
// Load from localStorage or use default
const storedData = localStorage.getItem('wms_sku_database');
export let skuDatabase = storedData ? JSON.parse(storedData) : JSON.parse(JSON.stringify(defaultDatabase));

// === Save to Local Storage ===
export function saveDatabase() {
  localStorage.setItem('wms_sku_database', JSON.stringify(skuDatabase));
}

// === Reset Data (for testing/debugging) ===
export function resetDatabase() {
  localStorage.removeItem('wms_sku_database');
  localStorage.removeItem('wms_activity_log');
  skuDatabase = JSON.parse(JSON.stringify(defaultDatabase));
  activityLog = JSON.parse(JSON.stringify(defaultActivityLog));
  window.location.reload();
}

// === Bảng quy đổi Size quốc tế (EU / US / UK) ===
export const sizeConversionTable = [
  { eu: 35, us: 3.5,  uk: 2.5  },
  { eu: 36, us: 4,    uk: 3.5  },
  { eu: 37, us: 4.5,  uk: 3.5  },
  { eu: 38, us: 5.5,  uk: 5    },
  { eu: 39, us: 6.5,  uk: 6    },
  { eu: 40, us: 7,    uk: 6.5  },
  { eu: 41, us: 8,    uk: 7.5  },
  { eu: 42, us: 8.5,  uk: 8    },
  { eu: 43, us: 9.5,  uk: 9    },
  { eu: 44, us: 10.5, uk: 10   },
  { eu: 45, us: 11.5, uk: 11   },
  { eu: 46, us: 12,   uk: 11.5 },
];

export function convertSize(euSize) {
  const entry = sizeConversionTable.find(s => s.eu === euSize);
  if (!entry) return `EU ${euSize}`;
  return `EU ${entry.eu} | US ${entry.us} | UK ${entry.uk}`;
}

// === Warehouse Locations ===
export const warehouseLocations = {
  'A': { name: 'Khu A — Nguyên liệu chính', capacity: 85, zones: ['A-01', 'A-02', 'A-03'] },
  'B': { name: 'Khu B — Phụ liệu & Phụ kiện', capacity: 62, zones: ['B-01', 'B-02', 'B-03'] },
  'C': { name: 'Khu C — Vải & Bao bì', capacity: 71, zones: ['C-01', 'C-02'] },
  'D': { name: 'Khu D — Thành phẩm', capacity: 48, zones: ['D-01', 'D-02', 'D-03', 'D-04'] },
};

// === Agent Definitions ===
export const agentDefinitions = [
  {
    id: 'AGENT_KHO_VAT_TU',
    name: 'Kho Vật Tư',
    shortName: 'VT',
    role: 'Nhập/Xuất vật tư, Quét QR, Kiểm tra tồn',
    color: 'blue',
    avatarClass: 'vt',
    status: 'idle',
    tasksCompleted: 1247,
    accuracy: 99.8,
    avgTime: '2.3s',
    recentActions: [
      { text: 'Nhập 500 tấm Da bò nhập Ý', status: 'success', time: '14:25' },
      { text: 'Xuất 200 đôi Đế cao su EVA', status: 'success', time: '13:50' },
      { text: 'Kiểm tra tồn khu A', status: 'info', time: '12:00' },
    ]
  },
  {
    id: 'AGENT_QC',
    name: 'Quality Control',
    shortName: 'QC',
    role: 'Kiểm tra chất lượng → PASS/FAIL',
    color: 'emerald',
    avatarClass: 'qc',
    status: 'active',
    tasksCompleted: 892,
    accuracy: 99.9,
    avgTime: '5.1s',
    recentActions: [
      { text: 'QC lô Da bò — PASS', status: 'success', time: '14:30' },
      { text: 'QC lô Đế TPR — FAIL (nứt)', status: 'fail', time: '14:15' },
      { text: 'QC Sneaker Urban Pro — PASS', status: 'success', time: '13:40' },
    ]
  },
  {
    id: 'AGENT_KHO_THANH_PHAM',
    name: 'Kho Thành Phẩm',
    shortName: 'TP',
    role: 'Nhập kho TP, Lưu kho, Quản lý vị trí',
    color: 'purple',
    avatarClass: 'tp',
    status: 'idle',
    tasksCompleted: 634,
    accuracy: 99.7,
    avgTime: '3.5s',
    recentActions: [
      { text: 'Nhập 120 đôi Sneaker Air Flow X', status: 'success', time: '14:00' },
      { text: 'Putaway D-01-02', status: 'success', time: '13:55' },
      { text: 'Scan thùng #TP240325-005', status: 'info', time: '13:50' },
    ]
  },
  {
    id: 'AGENT_XUAT_HANG',
    name: 'Xuất Hàng',
    shortName: 'XH',
    role: 'Xuất hàng, Load xe',
    color: 'amber',
    avatarClass: 'xh',
    status: 'busy',
    tasksCompleted: 456,
    accuracy: 99.5,
    avgTime: '8.2s',
    recentActions: [
      { text: 'Load xe ĐH-2026-0342', status: 'success', time: '14:20' },
      { text: 'Pick 200 đôi Sneaker Urban Pro', status: 'success', time: '14:10' },
      { text: 'Check tồn D-01-01', status: 'info', time: '14:05' },
    ]
  },
  {
    id: 'AGENT_AQL',
    name: 'AQL Inspector',
    shortName: 'AQL',
    role: 'Lấy mẫu kiểm, Kiểm theo AQL',
    color: 'cyan',
    avatarClass: 'aql',
    status: 'idle',
    tasksCompleted: 312,
    accuracy: 100,
    avgTime: '12.4s',
    recentActions: [
      { text: 'AQL Sneaker Air Flow X — OK', status: 'success', time: '13:30' },
      { text: 'Lấy mẫu 13/200 đôi', status: 'info', time: '13:25' },
      { text: 'AQL Boot Chelsea — OK', status: 'success', time: '11:00' },
    ]
  },
  {
    id: 'AGENT_CONTROL',
    name: 'Control Center',
    shortName: 'CT',
    role: 'Kiểm soát sai lệch, Cảnh báo',
    color: 'rose',
    avatarClass: 'ct',
    status: 'active',
    tasksCompleted: 178,
    accuracy: 100,
    avgTime: '0.8s',
    recentActions: [
      { text: '⚠ Tồn VT-DA-003 dưới mức tối thiểu', status: 'warning', time: '14:32' },
      { text: '⚠ TP-SD-002 hết hàng', status: 'fail', time: '14:28' },
      { text: 'Hệ thống ổn định', status: 'success', time: '12:00' },
    ]
  }
];

// === Purchase Orders ===
export const purchaseOrders = [
  { po: 'PO-2026-0089', supplier: 'Công ty Da Italia', items: [{ sku: 'VT-DA-001', qty: 500 }], status: 'pending' },
  { po: 'PO-2026-0090', supplier: 'NCC Đế Tân Phú', items: [{ sku: 'VT-DE-003', qty: 1000 }], status: 'pending' },
  { po: 'PO-2026-0091', supplier: 'TM Phụ Liệu Sài Gòn', items: [{ sku: 'VT-CH-001', qty: 300 }, { sku: 'VT-CH-002', qty: 200 }], status: 'completed' },
];

// === Sales Orders ===
export const salesOrders = [
  { so: 'SO-2026-0342', customer: 'Chuỗi ABC Sport', items: [{ sku: 'TP-SNK-001', qty: 200 }], status: 'processing' },
  { so: 'SO-2026-0343', customer: 'Đại lý Miền Bắc', items: [{ sku: 'TP-BT-001', qty: 50 }, { sku: 'TP-LF-001', qty: 30 }], status: 'pending' },
  { so: 'SO-2026-0344', customer: 'Shop Online VN', items: [{ sku: 'TP-SD-001', qty: 150 }], status: 'pending' },
];

// === Activity Log State ===
const defaultActivityLog = [
  { time: '14:32', agent: 'AGENT_CONTROL', message: 'Cảnh báo: VT-DA-003 Da lộn cao cấp — tồn 85 < mức tối thiểu 100', status: 'warning' },
  { time: '14:30', agent: 'AGENT_QC', message: 'QC Pass: Lô VT-DA-001 Da bò nhập Ý — 500 tấm đạt chuẩn', status: 'success' },
  { time: '14:28', agent: 'AGENT_CONTROL', message: 'Cảnh báo: TP-SD-002 Sandal Comfort Plus — hết hàng (stock = 0)', status: 'fail' },
  { time: '14:25', agent: 'AGENT_KHO_VAT_TU', message: 'Nhập kho: 500 tấm VT-DA-001 → vị trí A-01-01', status: 'success' },
  { time: '14:20', agent: 'AGENT_XUAT_HANG', message: 'Load xe hoàn tất: ĐH SO-2026-0342 — 200 đôi TP-SNK-001', status: 'success' },
  { time: '14:15', agent: 'AGENT_QC', message: 'QC Fail: Lô VT-DE-003 Đế TPR — phát hiện nứt 3/10 mẫu', status: 'fail' },
  { time: '14:10', agent: 'AGENT_XUAT_HANG', message: 'Pick: 200 đôi TP-SNK-001 từ D-01-01', status: 'success' },
  { time: '14:05', agent: 'AGENT_XUAT_HANG', message: 'Check tồn D-01-01: 480 đôi — đủ cho SO-2026-0342', status: 'info' },
  { time: '14:00', agent: 'AGENT_KHO_THANH_PHAM', message: 'Nhập kho: 120 đôi TP-SNK-002 → vị trí D-01-02', status: 'success' },
  { time: '13:55', agent: 'AGENT_KHO_THANH_PHAM', message: 'Putaway: thùng #TP240325-005 → D-01-02', status: 'success' },
  { time: '13:50', agent: 'AGENT_KHO_VAT_TU', message: 'Xuất kho: 200 đôi VT-DE-001 cho sản xuất', status: 'success' },
  { time: '13:40', agent: 'AGENT_QC', message: 'QC Pass: Sneaker Urban Pro batch #B025 — 120 đôi đạt chuẩn', status: 'success' },
  { time: '13:30', agent: 'AGENT_AQL', message: 'AQL OK: Sneaker Air Flow X — lấy mẫu 13/200, 0 lỗi', status: 'success' },
  { time: '13:25', agent: 'AGENT_AQL', message: 'Bắt đầu AQL: TP-SNK-002 — Level II, AQL 2.5', status: 'info' },
];

const storedLog = localStorage.getItem('wms_activity_log');
export let activityLog = storedLog ? JSON.parse(storedLog) : JSON.parse(JSON.stringify(defaultActivityLog));

export function saveActivityLog() {
  localStorage.setItem('wms_activity_log', JSON.stringify(activityLog.slice(0, 500))); // Keep last 500
}

// === Helper Functions ===
export function findSKU(sku) {
  return skuDatabase.materials.find(m => m.sku === sku) ||
         skuDatabase.finishedGoods.find(f => f.sku === sku) || null;
}

export function getAllSKUs() {
  return [...skuDatabase.materials, ...skuDatabase.finishedGoods];
}

export function getStockStatus(item) {
  if (item.stock === 0) return 'critical';
  if (item.stock < item.minStock) return 'low';
  if (item.stock > item.minStock * 3) return 'full';
  return 'normal';
}

export function getStockLabel(status) {
  const labels = {
    critical: 'Hết hàng',
    low: 'Sắp hết',
    normal: 'Bình thường',
    full: 'Đầy đủ'
  };
  return labels[status] || status;
}

export function addLogEntry(entry) {
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  activityLog.unshift({ time, ...entry });
  saveActivityLog();
}

export function generateQRCode() {
  return 'QR-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
}

// === Planning Helpers ===
export function updatePlanProgress(poNumber, sku, qty, qcStatus = null) {
  const plan = skuDatabase.inboundPlans.find(p => p.poNumber === poNumber && p.sku === sku);
  if (plan) {
    plan.receivedQty += qty;
    if (qcStatus) plan.qcStatus = qcStatus;
    saveDatabase();
    return true;
  }
  return false;
}

// ============================================
// EXCEL IMPORT / EXPORT
// ============================================

const MATERIAL_COLUMNS = ['sku', 'name', 'unit', 'stock', 'minStock', 'location', 'category', 'price'];
const FG_COLUMNS = ['sku', 'name', 'soNumber', 'itemCode', 'color', 'size', 'unit', 'stock', 'minStock', 'location', 'category', 'price', 'sizes'];

const COLUMN_LABELS = {
  sku: 'Mã SKU',
  name: 'Tên hàng',
  soNumber: 'Số đơn hàng SO',
  itemCode: 'Mã hàng',
  color: 'Màu sắc',
  size: 'Size',
  unit: 'Đơn vị',
  stock: 'Tồn kho',
  minStock: 'Tồn tối thiểu',
  location: 'Vị trí',
  category: 'Danh mục',
  price: 'Đơn giá',
  sizes: 'Hệ Size (EU/US/UK)'
};

// Parse an Excel file and return { materials, finishedGoods, errors }
export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const result = { materials: [], finishedGoods: [], errors: [] };

        // Try to find sheets by name
        const matSheetName = workbook.SheetNames.find(n =>
          n.toLowerCase().includes('vật tư') || n.toLowerCase().includes('vat tu') || n.toLowerCase().includes('material')
        ) || workbook.SheetNames[0];

        const fgSheetName = workbook.SheetNames.find(n =>
          n.toLowerCase().includes('thành phẩm') || n.toLowerCase().includes('thanh pham') || n.toLowerCase().includes('finished')
        ) || workbook.SheetNames[1];

        // Parse materials sheet
        if (matSheetName && workbook.Sheets[matSheetName]) {
          const { items, errors } = parseSheet(workbook.Sheets[matSheetName], MATERIAL_COLUMNS, 'Vật tư');
          result.materials = items;
          result.errors.push(...errors);
        }

        // Parse finished goods sheet (if different from materials)
        if (fgSheetName && fgSheetName !== matSheetName && workbook.Sheets[fgSheetName]) {
          const { items, errors } = parseSheet(workbook.Sheets[fgSheetName], FG_COLUMNS, 'Thành phẩm');
          result.finishedGoods = items;
          result.errors.push(...errors);
        }

        // If only one sheet, try to split by SKU prefix
        if (!fgSheetName || fgSheetName === matSheetName) {
          const allItems = result.materials;
          result.materials = allItems.filter(item => item.sku.startsWith('VT'));
          result.finishedGoods = allItems.filter(item => item.sku.startsWith('TP'));
          // Items that don't match either prefix stay in materials
          const unmatched = allItems.filter(item => !item.sku.startsWith('VT') && !item.sku.startsWith('TP'));
          result.materials.push(...unmatched);
        }

        resolve(result);
      } catch (err) {
        reject(new Error('Không thể đọc file Excel: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('Lỗi đọc file'));
    reader.readAsArrayBuffer(file);
  });
}

function parseSheet(sheet, expectedColumns, sheetLabel) {
  const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const items = [];
  const errors = [];

  if (json.length === 0) {
    errors.push(`Sheet "${sheetLabel}": không có dữ liệu`);
    return { items, errors };
  }

  // Map header aliases → internal field names
  const headerMap = {};
  const firstRow = json[0];
  const headerKeys = Object.keys(firstRow);

  for (const key of headerKeys) {
    const lk = key.toLowerCase().trim();
    if (lk.includes('mã sku') || lk === 'sku' || lk === 'mã') headerMap[key] = 'sku';
    else if (lk.includes('tên') || lk.includes('ten') || lk.includes('name')) headerMap[key] = 'name';
    else if (lk.includes('đơn hàng') || lk.includes('don hang') || lk.includes('so number') || lk === 'so') headerMap[key] = 'soNumber';
    else if (lk.includes('mã hàng') || lk.includes('ma hang') || lk.includes('item code') || lk === 'itemcode') headerMap[key] = 'itemCode';
    else if (lk.includes('màu') || lk.includes('mau') || lk.includes('color') || lk.includes('colour')) headerMap[key] = 'color';
    else if (lk === 'size' || lk === 'cỡ' || lk === 'co') headerMap[key] = 'size';
    else if (lk.includes('đơn vị') || lk.includes('don vi') || lk.includes('unit')) headerMap[key] = 'unit';
    else if (lk.includes('tồn kho') || lk.includes('ton kho') || lk.includes('stock') || lk.includes('số lượng') || lk.includes('so luong')) {
      if (lk.includes('tối thiểu') || lk.includes('min')) headerMap[key] = 'minStock';
      else headerMap[key] = 'stock';
    }
    else if (lk.includes('min') || lk.includes('tối thiểu')) headerMap[key] = 'minStock';
    else if (lk.includes('vị trí') || lk.includes('vi tri') || lk.includes('location')) headerMap[key] = 'location';
    else if (lk.includes('danh mục') || lk.includes('danh muc') || lk.includes('category') || lk.includes('loại') || lk.includes('loai')) headerMap[key] = 'category';
    else if (lk.includes('giá') || lk.includes('gia') || lk.includes('price') || lk.includes('đơn giá')) headerMap[key] = 'price';
    else if (lk.includes('hệ size') || lk.includes('he size') || lk.includes('eu') || lk.includes('sizes')) headerMap[key] = 'sizes';
  }

  // Parse each row
  json.forEach((row, idx) => {
    const item = {};
    for (const [excelKey, fieldName] of Object.entries(headerMap)) {
      let val = row[excelKey];
      // Type coercion
      if (['stock', 'minStock', 'price'].includes(fieldName)) {
        val = parseInt(val) || 0;
      }
      item[fieldName] = val ?? '';
    }

    // Validate required fields
    if (!item.sku || String(item.sku).trim() === '') {
      errors.push(`${sheetLabel} dòng ${idx + 2}: thiếu mã SKU — bỏ qua`);
      return;
    }
    if (!item.name || String(item.name).trim() === '') {
      errors.push(`${sheetLabel} dòng ${idx + 2}: thiếu tên hàng — bỏ qua`);
      return;
    }

    item.sku = String(item.sku).trim();
    item.name = String(item.name).trim();
    item.soNumber = item.soNumber || '';
    item.itemCode = item.itemCode || '';
    item.color = item.color || '';
    item.size = parseInt(item.size) || 0;
    item.unit = item.unit || 'cái';
    item.stock = item.stock || 0;
    item.minStock = item.minStock || 0;
    item.location = item.location || '--';
    item.category = item.category || '';
    item.price = item.price || 0;
    item.sizes = item.sizes || '';

    items.push(item);
  });

  return { items, errors };
}

// Apply imported data: mode = 'replace' or 'merge'
export function applyImportedData(importResult, mode = 'replace') {
  const { materials, finishedGoods } = importResult;

  if (mode === 'replace') {
    if (materials.length > 0) skuDatabase.materials = materials;
    if (finishedGoods.length > 0) skuDatabase.finishedGoods = finishedGoods;
  } else {
    // Merge: update existing, add new
    for (const item of materials) {
      const existing = skuDatabase.materials.find(m => m.sku === item.sku);
      if (existing) {
        Object.assign(existing, item);
      } else {
        skuDatabase.materials.push(item);
      }
    }
    for (const item of finishedGoods) {
      const existing = skuDatabase.finishedGoods.find(f => f.sku === item.sku);
      if (existing) {
        Object.assign(existing, item);
      } else {
        skuDatabase.finishedGoods.push(item);
      }
    }
  }

  addLogEntry({
    agent: 'AGENT_CONTROL',
    message: `Excel import: ${materials.length} vật tư + ${finishedGoods.length} thành phẩm (${mode})`,
    status: 'success'
  });
  saveDatabase();
}

// Export current data to Excel file
export function exportToExcel() {
  const wb = XLSX.utils.book_new();

  // Materials sheet
  const matHeaders = MATERIAL_COLUMNS.map(c => COLUMN_LABELS[c]);
  const matData = skuDatabase.materials.map(item => MATERIAL_COLUMNS.map(c => item[c] ?? ''));
  const matSheet = XLSX.utils.aoa_to_sheet([matHeaders, ...matData]);
  // Set column widths
  matSheet['!cols'] = MATERIAL_COLUMNS.map(c => ({ wch: c === 'name' ? 25 : c === 'sku' ? 15 : 12 }));
  XLSX.utils.book_append_sheet(wb, matSheet, 'Vật Tư');

  // Finished Goods sheet
  const fgHeaders = FG_COLUMNS.map(c => COLUMN_LABELS[c]);
  const fgData = skuDatabase.finishedGoods.map(item => FG_COLUMNS.map(c => item[c] ?? ''));
  const fgSheet = XLSX.utils.aoa_to_sheet([fgHeaders, ...fgData]);
  fgSheet['!cols'] = FG_COLUMNS.map(c => ({ wch: c === 'name' || c === 'sizes' ? 28 : c === 'sku' || c === 'soNumber' ? 16 : 12 }));
  XLSX.utils.book_append_sheet(wb, fgSheet, 'Thành Phẩm');

  XLSX.writeFile(wb, `WMS_TonKho_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// Download template Excel file
export function downloadTemplate() {
  const wb = XLSX.utils.book_new();

  const matHeaders = MATERIAL_COLUMNS.map(c => COLUMN_LABELS[c]);
  const matExample = ['VT-XX-001', 'Tên vật tư', 'cái', 100, 20, 'A-01-01', 'Danh mục', 50000];
  const matSheet = XLSX.utils.aoa_to_sheet([matHeaders, matExample]);
  matSheet['!cols'] = MATERIAL_COLUMNS.map(c => ({ wch: c === 'name' ? 25 : c === 'sku' ? 15 : 12 }));
  XLSX.utils.book_append_sheet(wb, matSheet, 'Vật Tư');

  const fgHeaders = FG_COLUMNS.map(c => COLUMN_LABELS[c]);
  const fgExample = ['TP-XX-001', 'Tên thành phẩm', 'ADR001', 'AH001', 'Đen/Trắng', 4, 'đôi', 50, 10, 'D-01-01', 'Sneaker', 1200000, 'EU 38-44 | US 5.5-10.5 | UK 5-10'];
  const fgSheet = XLSX.utils.aoa_to_sheet([fgHeaders, fgExample]);
  fgSheet['!cols'] = FG_COLUMNS.map(c => ({ wch: c === 'name' || c === 'sizes' ? 28 : c === 'sku' || c === 'soNumber' ? 16 : 12 }));
  XLSX.utils.book_append_sheet(wb, fgSheet, 'Thành Phẩm');

  XLSX.writeFile(wb, 'WMS_Template_Import.xlsx');
}

