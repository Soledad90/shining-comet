// ============================================
// LOGS VIEW
// ============================================

import { activityLog, agentDefinitions } from '../data.js';

export function renderLogs() {
  return `
    <div class="section-header">
      <div>
        <div class="section-title">Nhật Ký Hoạt Động</div>
        <div class="section-subtitle">Toàn bộ log thao tác từ các AI agents</div>
      </div>
      <button class="btn btn-sm btn-secondary" id="refreshLogsBtn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        Refresh
      </button>
    </div>

    <!-- Filter Controls -->
    <div class="table-controls" style="margin-bottom: 16px;">
      <input type="text" class="search-input" id="logSearch" placeholder="Tìm kiếm log..." />
      <div class="filter-tabs" id="logFilter">
        <button class="filter-tab active" data-filter="all">Tất cả</button>
        <button class="filter-tab" data-filter="success">Thành công</button>
        <button class="filter-tab" data-filter="fail">Lỗi</button>
        <button class="filter-tab" data-filter="warning">Cảnh báo</button>
        <button class="filter-tab" data-filter="info">Thông tin</button>
      </div>
    </div>

    <!-- Log List -->
    <div class="card" style="padding: 0; overflow: hidden;" id="logListContainer">
      <div id="logList"></div>
    </div>
    <div style="margin-top: 12px; font-size: 0.78rem; color: var(--text-muted); text-align: right;" id="logCount"></div>
  `;
}

function getAgentColor(agentId) {
  const agent = agentDefinitions.find(a => a.id === agentId);
  return agent ? `var(--accent-${agent.color})` : 'var(--text-secondary)';
}

function renderLogEntries(entries) {
  if (entries.length === 0) {
    return '<div style="text-align: center; padding: 40px; color: var(--text-muted);">Không có log nào</div>';
  }

  return entries.map(log => `
    <div class="log-entry">
      <div class="log-time">${log.time}</div>
      <div class="log-agent" style="color: ${getAgentColor(log.agent)};">${log.agent.replace('AGENT_', '')}</div>
      <div class="log-message">${log.message}</div>
      <div class="log-status ${log.status}">${log.status.toUpperCase()}</div>
    </div>
  `).join('');
}

export function initLogs() {
  const logList = document.getElementById('logList');
  const searchInput = document.getElementById('logSearch');
  const filterTabs = document.getElementById('logFilter');
  const logCount = document.getElementById('logCount');
  const refreshBtn = document.getElementById('refreshLogsBtn');

  let currentFilter = 'all';

  function refresh() {
    const search = searchInput.value.toLowerCase().trim();
    let filtered = activityLog;

    if (currentFilter !== 'all') {
      filtered = filtered.filter(l => l.status === currentFilter);
    }

    if (search) {
      filtered = filtered.filter(l =>
        l.message.toLowerCase().includes(search) ||
        l.agent.toLowerCase().includes(search)
      );
    }

    logList.innerHTML = renderLogEntries(filtered);
    logCount.textContent = `${filtered.length} / ${activityLog.length} entries`;
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

  refreshBtn.addEventListener('click', refresh);

  refresh();
}
