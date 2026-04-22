// ============================================
// INVENTORY VIEW — API-driven + Excel Import/Export
// ============================================

import { getInventory, importStock, exportStock } from '../api.js';
import { skuDatabase, getStockStatus, getStockLabel, parseExcelFile, applyImportedData, exportToExcel, downloadTemplate } from '../data.js';

// Track whether we loaded from API
let apiItems = null;

export function renderInventory() {
  return `
    <div class="section-header">
      <div>
        <div class="section-title">Quản Lý Tồn Kho</div>
        <div class="section-subtitle">Theo dõi tồn kho vật tư và thành phẩm — dữ liệu từ SQLite DB</div>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn btn-sm btn-secondary" id="downloadTemplateBtn" title="Tải file mẫu Excel">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Mẫu Excel
        </button>
        <button class="btn btn-sm btn-secondary" id="exportExcelBtn" title="Xuất dữ liệu ra Excel">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Xuất Excel
        </button>
        <button class="btn btn-sm btn-primary" id="importExcelBtn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Import Excel
        </button>
      </div>
    </div>

    <!-- Quick Import/Export -->
    <div class="card" style="margin-bottom: 16px;">
      <div class="card-header">
        <div class="card-title">⚡ Nhập / Xuất nhanh</div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 12px 0;">
        <div style="display: flex; gap: 8px; align-items: flex-end; flex-wrap: wrap;">
          <div>
            <label style="font-size: 0.72rem; color: var(--text-muted); display:block;">SKU</label>
            <input class="search-input" id="qi_sku" placeholder="VT-DA-001" style="width: 120px;">
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--text-muted); display:block;">Qty</label>
            <input class="search-input" id="qi_qty" type="number" placeholder="0" style="width: 80px;">
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--text-muted); display:block;">Vị trí</label>
            <input class="search-input" id="qi_loc" placeholder="A-01-01" style="width: 100px;">
          </div>
          <button class="btn btn-sm btn-primary" id="btnQuickImport">📥 Nhập kho</button>
        </div>
        <div style="display: flex; gap: 8px; align-items: flex-end; flex-wrap: wrap;">
          <div>
            <label style="font-size: 0.72rem; color: var(--text-muted); display:block;">SKU</label>
            <input class="search-input" id="qe_sku" placeholder="VT-DA-001" style="width: 120px;">
          </div>
          <div>
            <label style="font-size: 0.72rem; color: var(--text-muted); display:block;">Qty</label>
            <input class="search-input" id="qe_qty" type="number" placeholder="0" style="width: 80px;">
          </div>
          <button class="btn btn-sm" id="btnQuickExport" style="background: var(--accent-amber); color: #000;">📤 Xuất kho</button>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="table-controls">
      <input type="text" class="search-input" id="inventorySearch" placeholder="Tìm kiếm SKU, tên hàng..." />
      <div class="filter-tabs" id="inventoryFilter">
        <button class="filter-tab active" data-filter="all">Tất cả</button>
        <button class="filter-tab" data-filter="material">Vật tư</button>
        <button class="filter-tab" data-filter="finished">Thành phẩm</button>
        <button class="filter-tab" data-filter="low">Sắp hết</button>
      </div>
    </div>

    <!-- Table -->
    <div class="card" style="padding: 0; overflow: hidden; overflow-x: auto;">
      <table class="data-table" id="inventoryTable">
        <thead id="inventoryTableHead">
        </thead>
        <tbody id="inventoryTableBody">
          <tr><td colspan="12" style="text-align: center; padding: 40px; color: var(--text-muted);">Đang tải từ database...</td></tr>
        </tbody>
      </table>
    </div>

    <div style="margin-top: 12px; font-size: 0.78rem; color: var(--text-muted); text-align: right;" id="inventoryCount"></div>

    <!-- Hidden file input -->
    <input type="file" id="excelFileInput" accept=".xlsx,.xls,.csv" style="display: none;" />

    <!-- Import Modal -->
    <div class="modal-overlay" id="importModal" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3>📥 Import Excel</h3>
          <button class="modal-close" id="modalCloseBtn">&times;</button>
        </div>
        <div class="modal-body" id="modalBody">
          <div class="drop-zone" id="dropZone">
            <div class="drop-zone-icon">📁</div>
            <div class="drop-zone-text">
              Kéo thả file Excel vào đây<br/>
              <span style="font-size: 0.78rem; color: var(--text-muted);">hoặc click để chọn file (.xlsx, .xls, .csv)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

const ALL_HEADERS = '<tr><th>SKU</th><th>Tên hàng</th><th>Loại</th><th>Số PO/SO</th><th>Mã Hàng</th><th>Màu Sắc</th><th>Nhà Cung Cấp</th><th>Số lượng</th><th>Số kiện</th><th>Min</th><th>ĐVT</th><th>ĐVT QĐ</th><th>Vị trí</th><th>Nhập</th><th>Xuất</th><th>Trạng thái</th></tr>';

function stockStatus(item) {
  if (item.qty === 0) return 'critical';
  if (item.qty < item.min_stock) return 'low';
  if (item.qty > item.min_stock * 3) return 'full';
  return 'normal';
}

function stockLabel(status) {
  const labels = { critical: 'Hết hàng', low: 'Sắp hết', normal: 'Bình thường', full: 'Đầy đủ' };
  return labels[status] || status;
}

function renderRows(items) {
  return items.map(item => {
    const status = stockStatus(item);
    const label = stockLabel(status);
    const typeLabel = item.type === 'finished' ? 'Thành phẩm' : 'Vật tư';
    const typeColor = item.type === 'finished' ? 'var(--accent-purple)' : 'var(--accent-blue)';
    
    return `
      <tr class="animate-fade">
        <td><span class="sku-cell">${item.sku}</span></td>
        <td>${item.item_name}</td>
        <td><span style="font-size: 0.75rem; color: ${typeColor}; font-weight: 500;">${typeLabel}</span></td>
        <td><span style="color: var(--accent-amber); font-weight: 600;">${item.so_number || item.po_number || item.so || '--'}</span></td>
        <td><span class="badge badge-purple">${item.item_code || '--'}</span></td>
        <td>${item.color || '--'}</td>
        <td><span class="secondary-text">${item.supplier || '--'}</span></td>
        <td><strong>${(item.qty || 0).toLocaleString('vi')}</strong></td>
        <td>${(item.packages || 0).toLocaleString('vi')}</td>
        <td style="color: var(--text-muted);">${(item.min_stock || 0).toLocaleString('vi')}</td>
        <td>${item.unit || 'cái'}</td>
        <td>${item.converted_unit || '--'}</td>
        <td><span class="location-badge">${item.location || '--'}</span></td>
        <td style="color: var(--accent-emerald);">+${(item.import_qty || 0).toLocaleString('vi')}</td>
        <td style="color: var(--accent-rose);">-${(item.export_qty || 0).toLocaleString('vi')}</td>
        <td><span class="stock-badge ${status}">${label}</span></td>
      </tr>
    `;
  }).join('');
}

export function initInventory(showToast) {
  const tbody = document.getElementById('inventoryTableBody');
  const searchInput = document.getElementById('inventorySearch');
  const filterTabs = document.getElementById('inventoryFilter');
  const countDiv = document.getElementById('inventoryCount');
  const importBtn = document.getElementById('importExcelBtn');
  const exportBtn = document.getElementById('exportExcelBtn');
  const templateBtn = document.getElementById('downloadTemplateBtn');
  const fileInput = document.getElementById('excelFileInput');
  const modal = document.getElementById('importModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBody = document.getElementById('modalBody');
  const thead = document.getElementById('inventoryTableHead');

  let currentFilter = 'all';
  let allItems = [];

  // Quick Import
  document.getElementById('btnQuickImport')?.addEventListener('click', async () => {
    const sku = document.getElementById('qi_sku').value.trim();
    const qty = parseInt(document.getElementById('qi_qty').value) || 0;
    const location = document.getElementById('qi_loc').value.trim();

    if (!sku || !qty) { showToast('Nhập SKU và số lượng', 'warning'); return; }
    try {
      const result = await importStock({ sku, qty, location });
      showToast(result.message, 'success');
      loadFromAPI();
    } catch (err) {
      showToast('Lỗi nhập kho: ' + err.message, 'error');
    }
  });

  // Quick Export
  document.getElementById('btnQuickExport')?.addEventListener('click', async () => {
    const sku = document.getElementById('qe_sku').value.trim();
    const qty = parseInt(document.getElementById('qe_qty').value) || 0;

    if (!sku || !qty) { showToast('Nhập SKU và số lượng', 'warning'); return; }
    try {
      const result = await exportStock({ sku, qty });
      showToast(result.message, 'success');
      loadFromAPI();
    } catch (err) {
      showToast('Lỗi xuất kho: ' + err.message, 'error');
    }
  });

  async function loadFromAPI() {
    try {
      allItems = await getInventory();
      refresh();
    } catch (err) {
      console.warn('API load failed, using local data:', err.message);
      // Fallback to localStorage data
      allItems = [
        ...skuDatabase.materials.map(m => ({ ...m, item_name: m.name, type: 'material', min_stock: m.minStock, import_qty: m.stock, export_qty: 0 })),
        ...skuDatabase.finishedGoods.map(f => ({ ...f, item_name: f.name, type: 'finished', min_stock: f.minStock, import_qty: f.stock, export_qty: 0 })),
      ];
      refresh();
    }
  }

  function refresh() {
    const search = searchInput.value.toLowerCase().trim();
    let filtered = allItems;

    if (search) {
      filtered = filtered.filter(i =>
        (i.sku || '').toLowerCase().includes(search) ||
        (i.item_name || '').toLowerCase().includes(search) ||
        (i.item_code || '').toLowerCase().includes(search) ||
        (i.so_number || '').toLowerCase().includes(search)
      );
    }

    if (currentFilter === 'material') {
      filtered = filtered.filter(i => i.type === 'material');
    } else if (currentFilter === 'finished') {
      filtered = filtered.filter(i => i.type === 'finished');
    } else if (currentFilter === 'low') {
      filtered = filtered.filter(i => i.qty < i.min_stock);
    }

    thead.innerHTML = ALL_HEADERS;
    tbody.innerHTML = filtered.length > 0
      ? renderRows(filtered)
      : '<tr><td colspan="10" style="text-align: center; padding: 40px; color: var(--text-muted);">Không tìm thấy kết quả</td></tr>';
    countDiv.textContent = `Hiển thị ${filtered.length} / ${allItems.length} mục (SQLite DB)`;
  }

  searchInput.addEventListener('input', refresh);

  filterTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    filterTabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    refresh();
  });

  // Excel Export
  exportBtn?.addEventListener('click', () => {
    try {
      exportToExcel();
      showToast('Đã xuất file Excel thành công!', 'success');
    } catch (err) {
      showToast('Lỗi xuất Excel: ' + err.message, 'error');
    }
  });

  // Download Template
  templateBtn?.addEventListener('click', () => {
    try {
      downloadTemplate();
      showToast('Đã tải file mẫu Excel!', 'success');
    } catch (err) {
      showToast('Lỗi tải mẫu: ' + err.message, 'error');
    }
  });

  // Excel Import Modal
  function openModal() {
    modal.style.display = 'flex';
    modalBody.innerHTML = `
      <div class="drop-zone" id="dropZoneInner">
        <div class="drop-zone-icon">📁</div>
        <div class="drop-zone-text">
          Kéo thả file Excel vào đây<br/>
          <span style="font-size: 0.78rem; color: var(--text-muted);">hoặc click để chọn file (.xlsx, .xls, .csv)</span>
        </div>
      </div>
    `;
    const dz = document.getElementById('dropZoneInner');
    dz.addEventListener('click', () => fileInput.click());
    dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('drag-over'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
    dz.addEventListener('drop', (e) => {
      e.preventDefault();
      dz.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    });
  }

  function closeModal() { modal.style.display = 'none'; }

  importBtn?.addEventListener('click', openModal);
  modalCloseBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
    fileInput.value = '';
  });

  async function handleFile(file) {
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div class="spinner" style="width: 32px; height: 32px; border: 3px solid var(--accent-blue-glow); border-top-color: var(--accent-blue); border-radius: 50%; animation: spin 0.6s linear infinite; margin: 0 auto 16px;"></div>
        <div style="color: var(--text-secondary);">Đang đọc file <strong>${file.name}</strong>...</div>
      </div>
    `;
    try {
      const result = await parseExcelFile(file);
      const totalMat = result.materials.length;
      const totalFG = result.finishedGoods.length;

      modalBody.innerHTML = `
        <div class="import-preview">
          <div style="margin-bottom: 16px;">
            <div style="font-weight: 600; margin-bottom: 8px;">📄 ${file.name}</div>
            <div style="display: flex; gap: 12px;">
              <div class="import-stat"><span style="color: var(--accent-blue); font-weight: 700;">${totalMat}</span> Vật tư</div>
              <div class="import-stat"><span style="color: var(--accent-purple); font-weight: 700;">${totalFG}</span> Thành phẩm</div>
            </div>
          </div>
          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button class="btn btn-secondary btn-sm" id="cancelImportBtn">Huỷ</button>
            <button class="btn btn-primary" id="confirmImportBtn">Xác nhận Import (Thay thế)</button>
          </div>
        </div>
      `;

      document.getElementById('confirmImportBtn')?.addEventListener('click', () => {
        applyImportedData(result, 'replace');
        closeModal();
        loadFromAPI();
        showToast(`Import: ${totalMat} vật tư + ${totalFG} thành phẩm`, 'success');
      });
      document.getElementById('cancelImportBtn')?.addEventListener('click', closeModal);
    } catch (err) {
      modalBody.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--accent-rose);">❌ ${err.message}</div>`;
      showToast('Lỗi import: ' + err.message, 'error');
    }
  }

  // Initial load from API
  loadFromAPI();
}
