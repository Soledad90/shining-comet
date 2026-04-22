// ============================================
// WAREHOUSE OS — Express API Server
// Port: 3001
// ============================================

const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ============================================
// INVENTORY ENDPOINTS
// ============================================

// GET /api/inventory — List all inventory
app.get('/api/inventory', (req, res) => {
  try {
    const { type, search } = req.query;
    let sql = 'SELECT * FROM inventory';
    const conditions = [];
    const params = {};

    if (type && type !== 'all') {
      conditions.push('type = @type');
      params.type = type;
    }
    if (search) {
      conditions.push('(sku LIKE @search OR item_name LIKE @search OR item_code LIKE @search OR so_number LIKE @search)');
      params.search = `%${search}%`;
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY type, sku';

    const rows = db.prepare(sql).all(params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inventory/:sku — Get single item
app.get('/api/inventory/:sku', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM inventory WHERE sku = ?').get(req.params.sku);
    if (!row) return res.status(404).json({ error: 'SKU not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/import — Direct import (no plan)
app.post('/api/import', (req, res) => {
  try {
    const { sku, qty, location, actual_date, item_name, supplier, so_number, item_code, color, packages, unit, converted_unit } = req.body;
    if (!sku || !qty) return res.status(400).json({ error: 'sku and qty required' });

    const existing = db.prepare('SELECT * FROM inventory WHERE sku = ?').get(sku);
    if (existing) {
      db.prepare(`UPDATE inventory 
                  SET qty = qty + ?, import_qty = import_qty + ?, packages = packages + ?, location = COALESCE(NULLIF(?, ''), location), actual_date = ?,
                  so_number = COALESCE(NULLIF(?, ''), so_number), item_code = COALESCE(NULLIF(?, ''), item_code), color = COALESCE(NULLIF(?, ''), color),
                  unit = COALESCE(NULLIF(?, ''), unit), converted_unit = COALESCE(NULLIF(?, ''), converted_unit)
                  WHERE sku = ?`)
        .run(qty, qty, packages || 0, location, actual_date || new Date().toISOString().slice(0, 10), so_number, item_code, color, unit, converted_unit, sku);
    } else {
      db.prepare(`INSERT INTO inventory (sku, item_name, qty, location, supplier, actual_date, import_qty, type, so_number, item_code, color, packages, unit, converted_unit)
                  VALUES (?, ?, ?, ?, ?, ?, ?, 'material', ?, ?, ?, ?, ?, ?)`)
        .run(sku, item_name || sku, qty, location || '', supplier || '', actual_date || new Date().toISOString().slice(0, 10), qty, so_number || '', item_code || '', color || '', packages || 0, unit || 'cái', converted_unit || '');
    }

    const updated = db.prepare('SELECT * FROM inventory WHERE sku = ?').get(sku);
    res.json({ success: true, message: `Imported ${qty} of ${sku}`, item: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/export — Export stock
app.post('/api/export', (req, res) => {
  try {
    const { sku, qty, packages } = req.body;
    if (!sku || !qty) return res.status(400).json({ error: 'sku and qty required' });

    const item = db.prepare('SELECT * FROM inventory WHERE sku = ?').get(sku);
    if (!item) return res.status(404).json({ error: 'SKU not found' });
    if (item.qty < qty) return res.status(400).json({ error: `Insufficient stock. Available: ${item.qty}` });

    db.prepare('UPDATE inventory SET qty = qty - ?, export_qty = export_qty + ?, packages = MAX(0, packages - ?) WHERE sku = ?')
      .run(qty, qty, packages || 0, sku);

    const updated = db.prepare('SELECT * FROM inventory WHERE sku = ?').get(sku);
    res.json({ success: true, message: `Exported ${qty} of ${sku}`, item: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// IMPORT PLAN ENDPOINTS
// ============================================

// GET /api/import-plans — List all plans
app.get('/api/import-plans', (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM import_plan';
    if (status) {
      sql += ' WHERE status = ?';
      const rows = db.prepare(sql).all(status);
      return res.json(rows);
    }
    const rows = db.prepare(sql + ' ORDER BY created_at DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/import-plan — Create new plan
app.post('/api/import-plan', (req, res) => {
  try {
    const { supplier, sku, item_name, qty, packages, eta_date, po_number } = req.body;
    if (!supplier || !sku || !qty) return res.status(400).json({ error: 'supplier, sku, qty required' });

    const poNum = po_number || `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

    const result = db.prepare(`
      INSERT INTO import_plan (po_number, supplier, sku, item_name, qty, packages, eta_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PLANNED')
    `).run(poNum, supplier, sku, item_name || sku, qty, packages || 0, eta_date || '');

    const plan = db.prepare('SELECT * FROM import_plan WHERE id = ?').get(result.lastInsertRowid);
    res.json({ success: true, message: 'Plan created', plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/import-from-plan — Import from existing plan
app.post('/api/import-from-plan', (req, res) => {
  try {
    const { plan_id, actual_date, location, qty } = req.body;
    if (!plan_id) return res.status(400).json({ error: 'plan_id required' });

    const plan = db.prepare('SELECT * FROM import_plan WHERE id = ?').get(plan_id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const importQty = qty || (plan.qty - plan.received_qty);
    const actualDate = actual_date || new Date().toISOString().slice(0, 10);

    // Update plan
    const newReceived = plan.received_qty + importQty;
    const newStatus = newReceived >= plan.qty ? 'DONE' : 'PLANNED';
    db.prepare('UPDATE import_plan SET received_qty = ?, actual_date = ?, status = ? WHERE id = ?')
      .run(newReceived, actualDate, newStatus, plan_id);

    // Update inventory
    const existing = db.prepare('SELECT * FROM inventory WHERE sku = ?').get(plan.sku);
    if (existing) {
      db.prepare('UPDATE inventory SET qty = qty + ?, import_qty = import_qty + ?, location = COALESCE(?, location) WHERE sku = ?')
        .run(importQty, importQty, location, plan.sku);
    } else {
      db.prepare(`INSERT INTO inventory (sku, item_name, qty, location, supplier, import_qty, type)
                  VALUES (?, ?, ?, ?, ?, ?, 'material')`)
        .run(plan.sku, plan.item_name, importQty, location || '', plan.supplier, importQty);
    }

    res.json({
      success: true,
      message: `Imported ${importQty} of ${plan.sku} from plan #${plan_id}`,
      plan: db.prepare('SELECT * FROM import_plan WHERE id = ?').get(plan_id)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/import-plan/:id/qc — Update QC status
app.put('/api/import-plan/:id/qc', (req, res) => {
  try {
    const { qc_status } = req.body;
    db.prepare('UPDATE import_plan SET qc_status = ? WHERE id = ?').run(qc_status, req.params.id);
    const plan = db.prepare('SELECT * FROM import_plan WHERE id = ?').get(req.params.id);
    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// KPI & ANALYTICS ENDPOINTS
// ============================================

// GET /api/kpi/import — Import KPI (on-time rate)
app.get('/api/kpi/import', (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM import_plan WHERE status = 'DONE'").all();
    const total = rows.length;
    const ontime = rows.filter(r => {
      if (!r.actual_date || !r.eta_date) return true;
      return new Date(r.actual_date) <= new Date(r.eta_date);
    }).length;
    const percent = total ? (ontime / total) * 100 : 0;

    res.json({
      total,
      ontime,
      late: total - ontime,
      percent_ontime: Math.round(percent * 10) / 10
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/suppliers — Supplier analytics
app.get('/api/analytics/suppliers', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT supplier,
        COUNT(*) as total_orders,
        SUM(CASE WHEN date(actual_date) <= date(eta_date) THEN 1 ELSE 0 END) as ontime_orders,
        AVG(CASE WHEN actual_date IS NOT NULL AND eta_date IS NOT NULL THEN
          (julianday(actual_date) - julianday(eta_date)) ELSE NULL END) as avg_delay_days
      FROM import_plan
      WHERE status = 'DONE'
      GROUP BY supplier
    `).all();

    const result = rows.map(r => ({
      supplier: r.supplier,
      total_orders: r.total_orders,
      ontime_rate: r.total_orders ? Math.round((r.ontime_orders / r.total_orders) * 1000) / 10 : 0,
      avg_delay_days: Math.round((r.avg_delay_days || 0) * 10) / 10,
      score: Math.round(((r.total_orders ? (r.ontime_orders / r.total_orders) * 100 : 0) - (r.avg_delay_days || 0)) * 10) / 10
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/kpi/inventory — Inventory KPI summary
app.get('/api/kpi/inventory', (req, res) => {
  try {
    const all = db.prepare('SELECT * FROM inventory').all();
    const totalSKUs = all.length;
    const totalValue = all.reduce((sum, i) => sum + (i.qty * i.price), 0);
    const lowStock = all.filter(i => i.qty > 0 && i.qty < i.min_stock).length;
    const outOfStock = all.filter(i => i.qty === 0).length;
    const materials = all.filter(i => i.type === 'material').length;
    const finished = all.filter(i => i.type === 'finished').length;

    res.json({
      totalSKUs,
      totalValue,
      lowStock,
      outOfStock,
      materials,
      finished
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// AUTOMATION: Check late plans every 5 minutes
// ============================================
setInterval(() => {
  try {
    const rows = db.prepare("SELECT * FROM import_plan WHERE status = 'PLANNED'").all();
    const today = new Date();
    rows.forEach(r => {
      if (r.eta_date && new Date(r.eta_date) < today) {
        console.log(`  ⚠ ALERT LATE: ${r.supplier} — ${r.sku} (ETA: ${r.eta_date})`);
      }
    });
  } catch (err) {
    console.error('  Automation check error:', err.message);
  }
}, 300000); // 5 minutes

// ============================================
// SUPPLIERS & SALES ORDERS ENDPOINTS
// ============================================

// GET /api/suppliers
app.get('/api/suppliers', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM suppliers ORDER BY supplier_name').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/suppliers/import
app.post('/api/suppliers/import', (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'items array required' });
    
    let imported = 0;
    const stmt = db.prepare('INSERT OR REPLACE INTO suppliers (supplier_code, supplier_name, address) VALUES (?, ?, ?)');
    db.transaction(() => {
      for (const item of items) {
        if (item.supplier_name) {
          stmt.run(item.supplier_code || `SUP-NEW-${Date.now()}`, item.supplier_name, item.address || '');
          imported++;
        }
      }
    })();
    
    res.json({ success: true, message: `Imported ${imported} suppliers` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sales-orders
app.get('/api/sales-orders', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM sales_orders ORDER BY so_number, item_code').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sales-orders/import
app.post('/api/sales-orders/import', (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'items array required' });
    
    let imported = 0;
    // We can clear old matching SOs or just append. Let's just append or replace
    // Actually no uniqueness constraint other than ID, so we just insert.
    // In a real app we might want to check SO+item_code combination
    const stmt = db.prepare('INSERT INTO sales_orders (so_number, item_code, color, size, qty, imported_qty) VALUES (?, ?, ?, ?, ?, 0)');
    db.transaction(() => {
      for (const item of items) {
        if (item.so_number && item.item_code) {
          stmt.run(item.so_number, item.item_code, item.color || '', item.size || 0, item.qty || 0);
          imported++;
        }
      }
    })();
    
    res.json({ success: true, message: `Imported ${imported} sales order items` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sales-orders/receive
app.post('/api/sales-orders/receive', (req, res) => {
  try {
    const { so_number, item_code, qty } = req.body;
    if (!so_number || !item_code || qty == null) return res.status(400).json({ error: 'so_number, item_code, qty required' });

    // Validate if it exceeds original
    const so = db.prepare('SELECT * FROM sales_orders WHERE so_number = ? AND item_code = ?').get(so_number, item_code);
    if (!so) return res.status(404).json({ error: 'Sales Order item not found' });

    const totalImported = (so.imported_qty || 0) + parseInt(qty);
    if (totalImported > so.qty) {
      return res.status(400).json({ error: `Số lượng nhập vượt quá quy định SO. Còn lại: ${so.qty - (so.imported_qty || 0)}` });
    }

    db.prepare('UPDATE sales_orders SET imported_qty = ? WHERE id = ?').run(totalImported, so.id);
    res.json({ success: true, message: `Đã cập nhật số lượng nhập SO. Đạt ${totalImported}/${so.qty}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log();
  console.log('  ================================================');
  console.log('  |   Warehouse OS — API Server                   |');
  console.log('  |----------------------------------------------|');
  console.log(`  |   API: http://localhost:${PORT}                  |`);
  console.log('  |   Press Ctrl+C to stop                       |');
  console.log('  ================================================');
  console.log();

  // Run late check immediately on start
  const lateRows = db.prepare("SELECT * FROM import_plan WHERE status = 'PLANNED'").all();
  const today = new Date();
  const lateCount = lateRows.filter(r => r.eta_date && new Date(r.eta_date) < today).length;
  if (lateCount > 0) {
    console.log(`  ⚠ ${lateCount} late plan(s) detected on startup`);
  }
  console.log(`  ✅ Database ready (WAL mode)`);
});
