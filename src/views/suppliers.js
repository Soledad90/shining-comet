// ============================================
// SUPPLIERS VIEW
// ============================================

import { getSuppliers, importSuppliers } from '../api.js';

export function renderSuppliers() {
  return `
    <div class="section-header">
      <div>
        <div class="section-title">Quản Lý Nhà Cung Ứng</div>
        <div class="section-subtitle">Danh sách các nhà cung ứng vật tư và dịch vụ</div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-sm" id="exportSupplierBtn" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-primary);">
          Export / Tải Mẫu
        </button>
        <button class="btn btn-sm btn-primary" id="importSupplierBtn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Import Excel
        </button>
      </div>
    </div>

    <!-- Controls -->
    <div class="table-controls">
      <input type="text" class="search-input" id="supplierSearch" placeholder="Tìm kiếm tên, mã NCC..." />
    </div>

    <!-- Table -->
    <div class="card" style="padding: 0; overflow: hidden; overflow-x: auto;">
      <table class="wms-table">
        <thead>
          <tr>
            <th>Mã NCC</th>
            <th>Tên Nhà Cung Ứng</th>
            <th>Địa chỉ</th>
          </tr>
        </thead>
        <tbody id="supplierTableBody">
          <tr><td colspan="3" style="text-align: center; padding: 40px; color: var(--text-muted);">Đang tải...</td></tr>
        </tbody>
      </table>
    </div>

    <div style="margin-top: 12px; font-size: 0.78rem; color: var(--text-muted); text-align: right;" id="supplierCount"></div>

    <!-- Hidden file input -->
    <input type="file" id="supplierFileInput" accept=".xlsx,.xls,.csv" style="display: none;" />
  `;
}

export function initSuppliers(showToast) {
  const tbody = document.getElementById('supplierTableBody');
  const searchInput = document.getElementById('supplierSearch');
  const countDiv = document.getElementById('supplierCount');
  const importBtn = document.getElementById('importSupplierBtn');
  const exportBtn = document.getElementById('exportSupplierBtn');
  const fileInput = document.getElementById('supplierFileInput');

  let allItems = [];

  async function loadData() {
    try {
      allItems = await getSuppliers();
      refresh();
    } catch (err) {
      showToast('Lỗi tải danh sách NCC: ' + err.message, 'error');
    }
  }

  function refresh() {
    const search = searchInput.value.toLowerCase().trim();
    let filtered = allItems;

    if (search) {
      filtered = filtered.filter(i =>
        (i.supplier_code || '').toLowerCase().includes(search) ||
        (i.supplier_name || '').toLowerCase().includes(search) ||
        (i.address || '').toLowerCase().includes(search)
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 40px; color: var(--text-muted);">Không tìm thấy dữ liệu</td></tr>';
    } else {
      tbody.innerHTML = filtered.map(item => `
        <tr class="animate-fade">
          <td><span class="badge badge-info">${item.supplier_code}</span></td>
          <td style="font-weight: 500;">${item.supplier_name}</td>
          <td style="color: var(--text-secondary);">${item.address || '--'}</td>
        </tr>
      `).join('');
    }
    
    countDiv.textContent = `Tổng: ${filtered.length} nhà cung ứng`;
  }

  searchInput.addEventListener('input', refresh);

  // Export / Template
  exportBtn.addEventListener('click', () => {
    let data;
    if (allItems.length > 0) {
      data = allItems.map(i => ({
        'Mã NCC': i.supplier_code,
        'Tên NCC': i.supplier_name,
        'Địa chỉ': i.address
      }));
    } else {
      // Template
      data = [{ 'Mã NCC': 'SUP-001', 'Tên NCC': 'Công ty Mẫu', 'Địa chỉ': 'Địa chỉ mẫu' }];
      showToast('Đang tải file template mẫu', 'info');
    }
    
    const ws = window.XLSX.utils.json_to_sheet(data);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Suppliers");
    window.XLSX.writeFile(wb, "Danh_Sach_Nha_Cung_Ung.xlsx");
  });

  // Import
  importBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
    fileInput.value = '';
  });

  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        
        // Cần map các cột Excel (Tên, Mã, Địa chỉ...)
        const items = json.map(row => {
          return {
            supplier_code: row['Mã NCC'] || row['Mã'] || row['code'] || '',
            supplier_name: row['Tên NCC'] || row['Tên nhà cung ứng'] || row['name'] || '',
            address: row['Địa chỉ'] || row['Address'] || row['address'] || ''
          };
        }).filter(i => i.supplier_name); // Bỏ qua dòng trống

        if (items.length === 0) {
          showToast('File không hợp lệ hoặc thiếu cột "Tên NCC"', 'warning');
          return;
        }

        const res = await importSuppliers(items);
        showToast(res.message, 'success');
        loadData();
      } catch (err) {
        showToast('Lỗi import Excel: ' + err.message, 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // Init
  loadData();
}
