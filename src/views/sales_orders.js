// ============================================
// SALES ORDERS VIEW
// ============================================

import { getSalesOrders, importSalesOrders } from '../api.js';

export function renderSalesOrders() {
  return `
    <div class="section-header">
      <div>
        <div class="section-title">Danh Sách Đơn Đặt Hàng SO</div>
        <div class="section-subtitle">Quản lý và tra cứu thông tin sản xuất / thành phẩm</div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-sm" id="exportSOBtn" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-primary);">
          Export / Tải Mẫu
        </button>
        <button class="btn btn-sm btn-primary" id="importSOBtn">
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
      <input type="text" class="search-input" id="soSearch" placeholder="Tìm kiếm SO, Mã hàng..." />
    </div>

    <!-- Table -->
    <div class="card" style="padding: 0; overflow: hidden; overflow-x: auto;">
      <table class="wms-table">
        <thead>
          <tr>
            <th>Số Đơn SO</th>
            <th>Mã Hàng</th>
            <th>Màu Sắc</th>
            <th>Size</th>
            <th>Tổng Lượng (Đôi)</th>
            <th>Tiến độ (Nhập Kho)</th>
          </tr>
        </thead>
        <tbody id="soTableBody">
          <tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">Đang tải...</td></tr>
        </tbody>
      </table>
    </div>

    <div style="margin-top: 12px; font-size: 0.78rem; color: var(--text-muted); text-align: right;" id="soCount"></div>

    <!-- Hidden file input -->
    <input type="file" id="soFileInput" accept=".xlsx,.xls,.csv" style="display: none;" />
  `;
}

export function initSalesOrders(showToast) {
  const tbody = document.getElementById('soTableBody');
  const searchInput = document.getElementById('soSearch');
  const countDiv = document.getElementById('soCount');
  const importBtn = document.getElementById('importSOBtn');
  const exportBtn = document.getElementById('exportSOBtn');
  const fileInput = document.getElementById('soFileInput');

  let allItems = [];

  async function loadData() {
    try {
      allItems = await getSalesOrders();
      refresh();
    } catch (err) {
      showToast('Lỗi tải danh sách SO: ' + err.message, 'error');
    }
  }

  function refresh() {
    const search = searchInput.value.toLowerCase().trim();
    let filtered = allItems;

    if (search) {
      filtered = filtered.filter(i =>
        (i.so_number || '').toLowerCase().includes(search) ||
        (i.item_code || '').toLowerCase().includes(search) ||
        (i.color || '').toLowerCase().includes(search)
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">Không tìm thấy dữ liệu</td></tr>';
    } else {
      tbody.innerHTML = filtered.map(item => {
        const imported = item.imported_qty || 0;
        const total = item.qty || 0;
        const remaining = total - imported;
        const completePercent = total > 0 ? Math.min(100, Math.round((imported / total) * 100)) : 0;
        
        return `
          <tr class="animate-fade">
            <td><span class="primary-text" style="font-weight: 600; color: var(--accent-amber);">${item.so_number}</span></td>
            <td><span class="badge badge-purple">${item.item_code}</span></td>
            <td>${item.color || '--'}</td>
            <td>${item.size || '--'}</td>
            <td><strong>${total.toLocaleString()}</strong></td>
            <td>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <div style="font-size: 0.8rem; display: flex; justify-content: space-between;">
                  <span style="color: var(--accent-emerald);">${imported.toLocaleString()}</span>
                  <span style="color: var(--text-muted);">còn ${remaining.toLocaleString()}</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width: ${completePercent}%; background: var(--accent-emerald);"></div></div>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
    
    countDiv.textContent = `Tổng: ${filtered.length} dòng đơn hàng`;
  }

  searchInput.addEventListener('input', refresh);

  // Export / Template
  exportBtn.addEventListener('click', () => {
    let data;
    if (allItems.length > 0) {
      data = allItems.map(i => ({
        'Số Đơn SO': i.so_number,
        'Mã Hàng': i.item_code,
        'Màu Sắc': i.color,
        'Size': i.size,
        'Số Lượng': i.qty,
        'Đã Nhập': i.imported_qty || 0
      }));
    } else {
      data = [{ 'Số Đơn SO': 'SO-001', 'Mã Hàng': 'AH001', 'Màu Sắc': 'BK/WH', 'Size': 4, 'Số Lượng': 100 }];
      showToast('Đang tải file template mẫu', 'info');
    }

    const ws = window.XLSX.utils.json_to_sheet(data);
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "SalesOrders");
    window.XLSX.writeFile(wb, "Danh_Sach_Don_Hang_SO.xlsx");
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
        
        // Map các cột Excel
        const items = json.map(row => {
          return {
            so_number: row['Số Đơn SO'] || row['SO'] || row['so_number'] || '',
            item_code: row['Mã Hàng'] || row['Item Code'] || row['Mã'] || row['item_code'] || '',
            color: row['Màu Sắc'] || row['Màu'] || row['color'] || '',
            size: parseInt(row['Size'] || row['Cỡ'] || row['size']) || 0,
            qty: parseInt(row['Số Lượng'] || row['Qty'] || row['qty']) || 0
          };
        }).filter(i => i.so_number && i.item_code);

        if (items.length === 0) {
          showToast('File không hợp lệ hoặc thiếu cột "Số Đơn SO", "Mã Hàng"', 'warning');
          return;
        }

        const res = await importSalesOrders(items);
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
