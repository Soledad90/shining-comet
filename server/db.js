// ============================================
// WAREHOUSE OS — SQLite Database (WAL Mode)
// ============================================

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'warehouse.db');
const db = new Database(DB_PATH);

// === Enable WAL mode for concurrent reads ===
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// === Create Tables ===
db.exec(`
  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT NOT NULL,
    item_name TEXT,
    item_code TEXT DEFAULT '',
    so_number TEXT DEFAULT '',
    color TEXT DEFAULT '',
    qty INTEGER DEFAULT 0,
    location TEXT DEFAULT '',
    supplier TEXT DEFAULT '',
    category TEXT DEFAULT '',
    unit TEXT DEFAULT 'cái',
    converted_unit TEXT DEFAULT '',
    packages INTEGER DEFAULT 0,
    price INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    sizes TEXT DEFAULT '',
    type TEXT DEFAULT 'material',
    eta_date TEXT,
    actual_date TEXT,
    ontime_rate INTEGER DEFAULT 0,
    import_qty INTEGER DEFAULT 0,
    export_qty INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS import_plan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_number TEXT DEFAULT '',
    supplier TEXT,
    sku TEXT,
    item_name TEXT,
    qty INTEGER DEFAULT 0,
    received_qty INTEGER DEFAULT 0,
    packages INTEGER DEFAULT 0,
    eta_date TEXT,
    actual_date TEXT,
    qc_status TEXT DEFAULT 'Pending',
    status TEXT DEFAULT 'PLANNED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_inv_sku ON inventory(sku);
  CREATE INDEX IF NOT EXISTS idx_inv_type ON inventory(type);
  CREATE INDEX IF NOT EXISTS idx_plan_sku ON import_plan(sku);
  CREATE INDEX IF NOT EXISTS idx_plan_status ON import_plan(status);

  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_code TEXT UNIQUE,
    supplier_name TEXT NOT NULL,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sales_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    so_number TEXT NOT NULL,
    item_code TEXT NOT NULL,
    color TEXT,
    size INTEGER,
    qty INTEGER DEFAULT 0,
    imported_qty INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE INDEX IF NOT EXISTS idx_so_number ON sales_orders(so_number);

  -- AI AGENT OS TABLES
  CREATE TABLE IF NOT EXISTS agent_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_called TEXT,
    status TEXT,
    verification TEXT,
    action_log TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS production_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_vs_actual TEXT,
    delay TEXT,
    issue TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS compliance_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    compliance_score INTEGER,
    risk_level TEXT,
    issues_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scheduled_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_name TEXT,
    interval_time TEXT,
    last_run DATETIME,
    status TEXT DEFAULT 'IDLE'
  );
`);

try {
  db.exec('ALTER TABLE sales_orders ADD COLUMN imported_qty INTEGER DEFAULT 0;');
  console.log('  📦 Migration: Added imported_qty to sales_orders');
} catch (err) {}

try {
  db.exec('ALTER TABLE inventory ADD COLUMN packages INTEGER DEFAULT 0;');
  console.log('  📦 Migration: Added packages to inventory');
} catch (err) {}

try {
  db.exec('ALTER TABLE inventory ADD COLUMN converted_unit TEXT DEFAULT "";');
  console.log('  📦 Migration: Added converted_unit to inventory');
} catch (err) {}

// === Seed Data (only if tables are empty) ===
function seedDatabase() {
  const invCount = db.prepare('SELECT COUNT(*) as cnt FROM inventory').get();
  if (invCount.cnt > 0) return;

  console.log('  📦 Seeding database with initial data...');

  const insertInv = db.prepare(`
    INSERT INTO inventory (sku, item_name, item_code, so_number, color, qty, location, category, unit, price, min_stock, sizes, type, import_qty, export_qty)
    VALUES (@sku, @item_name, @item_code, @so_number, @color, @qty, @location, @category, @unit, @price, @min_stock, @sizes, @type, @import_qty, @export_qty)
  `);

  const insertPlan = db.prepare(`
    INSERT INTO import_plan (po_number, supplier, sku, item_name, qty, received_qty, qc_status, eta_date, status)
    VALUES (@po_number, @supplier, @sku, @item_name, @qty, @received_qty, @qc_status, @eta_date, @status)
  `);

  const insertJob = db.prepare(`
    INSERT INTO scheduled_jobs (task_name, interval_time, status)
    VALUES (@task_name, @interval_time, 'IDLE')
  `);

  const hasSuppliers = db.prepare('SELECT COUNT(*) as cnt FROM suppliers').get().cnt > 0;
  let insertSupplier = null;
  if (!hasSuppliers) {
    insertSupplier = db.prepare(`
      INSERT INTO suppliers (supplier_code, supplier_name, address)
      VALUES (@supplier_code, @supplier_name, @address)
    `);
  }

  const hasSO = db.prepare('SELECT COUNT(*) as cnt FROM sales_orders').get().cnt > 0;
  let insertSO = null;
  if (!hasSO) {
    insertSO = db.prepare(`
      INSERT INTO sales_orders (so_number, item_code, color, size, qty)
      VALUES (@so_number, @item_code, @color, @size, @qty)
    `);
  }

  // Materials
  const materials = [
    { sku: 'VT-DA-001', item_name: 'Da bò nhập Ý', qty: 1250, min_stock: 200, location: 'A-01-01', category: 'Da', price: 450000, unit: 'tấm' },
    { sku: 'VT-DA-002', item_name: 'Da tổng hợp PU', qty: 3200, min_stock: 500, location: 'A-01-02', category: 'Da', price: 120000, unit: 'tấm' },
    { sku: 'VT-DA-003', item_name: 'Da lộn cao cấp', qty: 85, min_stock: 100, location: 'A-01-03', category: 'Da', price: 680000, unit: 'tấm' },
    { sku: 'VT-DE-001', item_name: 'Đế cao su EVA', qty: 5600, min_stock: 1000, location: 'A-02-01', category: 'Đế', price: 35000, unit: 'đôi' },
    { sku: 'VT-DE-002', item_name: 'Đế phylon injection', qty: 4200, min_stock: 800, location: 'A-02-02', category: 'Đế', price: 42000, unit: 'đôi' },
    { sku: 'VT-DE-003', item_name: 'Đế TPR chống trượt', qty: 320, min_stock: 500, location: 'A-02-03', category: 'Đế', price: 28000, unit: 'đôi' },
    { sku: 'VT-CH-001', item_name: 'Chỉ may Nylon #40', qty: 890, min_stock: 200, location: 'B-01-01', category: 'Phụ liệu', price: 15000, unit: 'cuộn' },
    { sku: 'VT-CH-002', item_name: 'Keo dán PU-303', qty: 450, min_stock: 100, location: 'B-01-02', category: 'Phụ liệu', price: 85000, unit: 'kg' },
    { sku: 'VT-KH-001', item_name: 'Khoen kim loại bạc', qty: 15800, min_stock: 3000, location: 'B-02-01', category: 'Phụ kiện', price: 1500, unit: 'cái' },
    { sku: 'VT-DL-001', item_name: 'Đệm lót memory foam', qty: 2800, min_stock: 600, location: 'B-03-01', category: 'Đệm', price: 22000, unit: 'đôi' },
    { sku: 'VT-VL-001', item_name: 'Vải lót mesh thoáng khí', qty: 4500, min_stock: 800, location: 'C-01-01', category: 'Vải', price: 18000, unit: 'mét' },
    { sku: 'VT-HO-001', item_name: 'Hộp giày premium', qty: 6200, min_stock: 1500, location: 'C-02-01', category: 'Bao bì', price: 8000, unit: 'cái' },
  ];

  // Finished Goods
  const finishedGoods = [
    { sku: 'TP-SNK-001', item_name: 'Sneaker Urban Pro', so_number: 'ADR001', item_code: 'AH001', color: 'BK/WH', qty: 480, min_stock: 100, location: 'D-01-01', category: 'Sneaker', price: 1250000, unit: 'đôi', sizes: 'EU 38-44 | US 5.5-10.5 | UK 5-10' },
    { sku: 'TP-SNK-002', item_name: 'Sneaker Air Flow X', so_number: 'ADR002', item_code: 'AH002', color: 'NV', qty: 320, min_stock: 80, location: 'D-01-02', category: 'Sneaker', price: 1680000, unit: 'đôi', sizes: 'EU 39-45 | US 6.5-11.5 | UK 6-11' },
    { sku: 'TP-SNK-003', item_name: 'Sneaker Classic Retro', so_number: 'ADR003', item_code: 'AH003', color: 'WH/RD', qty: 15, min_stock: 50, location: 'D-01-03', category: 'Sneaker', price: 980000, unit: 'đôi', sizes: 'EU 38-43 | US 5.5-9.5 | UK 5-9' },
    { sku: 'TP-BT-001', item_name: 'Boot Chelsea Da Bò', so_number: 'ADR004', item_code: 'BT001', color: 'BR', qty: 210, min_stock: 60, location: 'D-02-01', category: 'Boot', price: 2450000, unit: 'đôi', sizes: 'EU 39-44 | US 6.5-10.5 | UK 6-10' },
    { sku: 'TP-BT-002', item_name: 'Boot Combat Tactical', so_number: 'ADR005', item_code: 'BT002', color: 'BK', qty: 45, min_stock: 40, location: 'D-02-02', category: 'Boot', price: 1890000, unit: 'đôi', sizes: 'EU 40-45 | US 7-11.5 | UK 6.5-11' },
    { sku: 'TP-SD-001', item_name: 'Sandal Sport Active', so_number: 'ADR006', item_code: 'SD001', color: 'BK/GY', qty: 580, min_stock: 120, location: 'D-03-01', category: 'Sandal', price: 650000, unit: 'đôi', sizes: 'EU 38-44 | US 5.5-10.5 | UK 5-10' },
    { sku: 'TP-SD-002', item_name: 'Sandal Comfort Plus', so_number: 'ADR007', item_code: 'SD002', color: 'BG/WH', qty: 0, min_stock: 100, location: 'D-03-02', category: 'Sandal', price: 480000, unit: 'đôi', sizes: 'EU 36-42 | US 4-8.5 | UK 3.5-8' },
    { sku: 'TP-LF-001', item_name: 'Loafer Executive', so_number: 'ADR008', item_code: 'LF001', color: 'BK-GL', qty: 165, min_stock: 50, location: 'D-04-01', category: 'Loafer', price: 1950000, unit: 'đôi', sizes: 'EU 39-44 | US 6.5-10.5 | UK 6-10' },
  ];

  // Import Plans
  const plans = [
    { po_number: 'PO-2026-0089', supplier: 'Công ty Da Italia', sku: 'VT-DA-001', item_name: 'Da bò nhập Ý', qty: 500, received_qty: 0, qc_status: 'Pending', eta_date: '2026-04-05', status: 'PLANNED' },
    { po_number: 'PO-2026-0090', supplier: 'NCC Đế Tân Phú', sku: 'VT-DE-003', item_name: 'Đế TPR chống trượt', qty: 1000, received_qty: 0, qc_status: 'Pending', eta_date: '2026-04-06', status: 'PLANNED' },
    { po_number: 'PO-2026-0092', supplier: 'Cao Su Miền Nam', sku: 'VT-DE-001', item_name: 'Đế cao su EVA', qty: 2000, received_qty: 1500, qc_status: 'Passed', eta_date: '2026-03-28', status: 'PLANNED' },
    { po_number: 'PO-2026-0093', supplier: 'Phụ Kiện May Mặc', sku: 'VT-KH-001', item_name: 'Khoen kim loại bạc', qty: 5000, received_qty: 5000, qc_status: 'Passed', eta_date: '2026-03-25', status: 'DONE' },
  ];

  const suppliersInfo = [
    { supplier_code: 'SUP-001', supplier_name: 'Công ty Da Italia', address: 'Milan, Italy' },
    { supplier_code: 'SUP-002', supplier_name: 'NCC Đế Tân Phú', address: 'Tân Phú, HCMC' },
    { supplier_code: 'SUP-003', supplier_name: 'Cao Su Miền Nam', address: 'Biên Hoà, Đồng Nai' },
    { supplier_code: 'SUP-004', supplier_name: 'Phụ Kiện May Mặc', address: 'Tân Bình, HCMC' }
  ];

  const salesOrdersList = [
    { so_number: 'SO-2026-0342', item_code: 'AH001', color: 'BK/WH', size: 4, qty: 200, imported_qty: 0 },
    { so_number: 'SO-2026-0343', item_code: 'BT001', color: 'BR', size: 4, qty: 50, imported_qty: 0 },
    { so_number: 'SO-2026-0343', item_code: 'LF001', color: 'BK-GL', size: 4, qty: 30, imported_qty: 0 },
    { so_number: 'SO-2026-0344', item_code: 'SD001', color: 'BK/GY', size: 4, qty: 150, imported_qty: 0 }
  ];

  const seedAll = db.transaction(() => {
    for (const m of materials) {
      insertInv.run({ ...m, item_code: '', so_number: '', color: '', sizes: '', type: 'material', import_qty: m.qty, export_qty: 0 });
    }
    for (const fg of finishedGoods) {
      insertInv.run({ ...fg, type: 'finished', import_qty: fg.qty, export_qty: 0 });
    }
    for (const p of plans) {
      insertPlan.run(p);
    }
    if (insertSupplier) {
      for (const s of suppliersInfo) insertSupplier.run(s);
    }
    if (insertSO) {
      for (const so of salesOrdersList) insertSO.run(so);
    }

    const jobCount = db.prepare('SELECT COUNT(*) as cnt FROM scheduled_jobs').get().cnt;
    if (jobCount === 0) {
      insertJob.run({ task_name: 'kiểm tra tồn kho và QC', interval_time: '5m' });
      insertJob.run({ task_name: 'tạo báo cáo tổng hợp', interval_time: '1h' });
    }
  });

  seedAll();
  console.log(`  ✅ Seeded: ${materials.length} materials, ${finishedGoods.length} finished goods, ${plans.length} plans, ${suppliersInfo.length} suppliers, ${salesOrdersList.length} SOs`);
}

seedDatabase();

module.exports = db;
