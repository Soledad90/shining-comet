// ============================================
// WAREHOUSE OS — Playwright Verify Tests
// Run: npx playwright test
// ============================================

const { test, expect } = require('@playwright/test');

const FRONTEND_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3001';

// API Tests
test('API: inventory endpoint returns data', async ({ request }) => {
  const res = await request.get(`${API_URL}/api/inventory`);
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  expect(Array.isArray(data)).toBeTruthy();
  expect(data.length).toBeGreaterThan(0);
});

test('API: import KPI endpoint works', async ({ request }) => {
  const res = await request.get(`${API_URL}/api/kpi/import`);
  expect(res.ok()).toBeTruthy();
  const kpi = await res.json();
  expect(kpi).toHaveProperty('total');
  expect(kpi).toHaveProperty('percent_ontime');
});

test('API: supplier analytics endpoint works', async ({ request }) => {
  const res = await request.get(`${API_URL}/api/analytics/suppliers`);
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  expect(Array.isArray(data)).toBeTruthy();
});

test('API: import increases stock', async ({ request }) => {
  // Get current stock
  const before = await (await request.get(`${API_URL}/api/inventory`)).json();
  const item = before.find(i => i.sku === 'VT-DA-001');
  const oldQty = item ? item.qty : 0;

  // Import
  const res = await request.post(`${API_URL}/api/import`, {
    data: { sku: 'VT-DA-001', qty: 10, location: 'A-01-01' }
  });
  expect(res.ok()).toBeTruthy();

  // Verify
  const after = await (await request.get(`${API_URL}/api/inventory`)).json();
  const updated = after.find(i => i.sku === 'VT-DA-001');
  expect(updated.qty).toBe(oldQty + 10);
});

test('API: export decreases stock', async ({ request }) => {
  const before = await (await request.get(`${API_URL}/api/inventory`)).json();
  const item = before.find(i => i.sku === 'VT-DA-001');
  const oldQty = item.qty;

  const res = await request.post(`${API_URL}/api/export`, {
    data: { sku: 'VT-DA-001', qty: 5 }
  });
  expect(res.ok()).toBeTruthy();

  const after = await (await request.get(`${API_URL}/api/inventory`)).json();
  const updated = after.find(i => i.sku === 'VT-DA-001');
  expect(updated.qty).toBe(oldQty - 5);
});

test('API: create import plan', async ({ request }) => {
  const res = await request.post(`${API_URL}/api/import-plan`, {
    data: {
      supplier: 'Test Supplier',
      sku: 'VT-TEST-001',
      item_name: 'Test Material',
      qty: 100,
      eta_date: '2026-04-10'
    }
  });
  expect(res.ok()).toBeTruthy();
  const result = await res.json();
  expect(result.success).toBeTruthy();
  expect(result.plan.sku).toBe('VT-TEST-001');
});

// UI Tests
test('UI: dashboard loads and shows KPI', async ({ page }) => {
  await page.goto(FRONTEND_URL);
  await page.waitForTimeout(2000);

  // Check page title
  await expect(page).toHaveTitle(/Warehouse/);

  // KPI cards should be visible
  const kpiGrid = page.locator('.kpi-grid');
  await expect(kpiGrid).toBeVisible();
});

test('UI: import stock via quick form', async ({ page }) => {
  await page.goto(FRONTEND_URL);
  await page.waitForTimeout(1000);

  // Navigate to inventory
  await page.click('[data-page="inventory"]');
  await page.waitForTimeout(1000);

  // Fill quick import
  await page.fill('#qi_sku', 'RM001');
  await page.fill('#qi_qty', '10');
  await page.fill('#qi_loc', 'A1');
  await page.click('#btnQuickImport');

  await page.waitForTimeout(1000);
  const table = await page.locator('#inventoryTableBody').innerText();
  expect(table).toContain('RM001');
});
