// ============================================
// AI COMMAND CENTER VIEW
// ============================================

import { sendAICommand, getAIAgents, getAILogs } from '../api.js';
import { highlightJSON } from '../agents.js';

export function renderAICommand() {
  return `
    <div class="ai-os-container">
      <!-- Left: Chat Interface -->
      <div class="chat-interface animate-fade">
        <div class="chat-messages" id="chatMessages">
          <div class="chat-welcome">
            <div class="brand-icon" style="margin: 0 auto 20px; width: 60px; height: 60px;">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <h2>Warehouse AI OS</h2>
            <p>Hệ điều hành AI cho nhà máy sản xuất giày cao su Adidas.</p>
            <div style="margin-top: 20px; display: flex; justify-content: center; gap: 10px;">
              <button class="btn-secondary" onclick="document.getElementById('chatInput').value='Kiểm tra tồn kho'; document.getElementById('btnSend').click();">📦 Check Kho</button>
              <button class="btn-secondary" onclick="document.getElementById('chatInput').value='Báo cáo QA'; document.getElementById('btnSend').click();">🔍 Check QA</button>
              <button class="btn-secondary" onclick="document.getElementById('chatInput').value='Audit Compliance'; document.getElementById('btnSend').click();">📜 Audit SOP</button>
            </div>
          </div>
        </div>

        <div class="chat-input-area">
          <input type="text" class="chat-input" id="chatInput" placeholder="Nhập yêu cầu điều hành (vd: nhập kho VT-DA-001)..." autocomplete="off">
          <button class="btn-send" id="btnSend">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Right: Agent Monitor -->
      <div class="agent-os-sidebar">
        <div class="card agent-monitor-card animate-slide delay-1">
          <div class="card-header">
            <div class="card-title">Live Agent Monitor</div>
          </div>
          <div id="agentLiveList">
            <div style="text-align: center; padding: 20px; color: var(--text-muted);">Đang kết nối...</div>
          </div>
        </div>

        <div class="card animate-slide delay-2">
          <div class="card-header">
            <div class="card-title">System Routing</div>
          </div>
          <div id="routingViz" style="font-size: 0.8rem; color: var(--text-muted);">
            Sẵn sàng xử lý yêu cầu...
          </div>
        </div>

        <div class="card animate-slide delay-3" style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
          <div class="card-header">
            <div class="card-title">Recent Audit Logs</div>
          </div>
          <div id="aiAuditLogs" style="flex: 1; overflow-y: auto; font-size: 0.75rem;">
             <!-- Logs go here -->
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function initAICommand() {
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const btnSend = document.getElementById('btnSend');
  const agentLiveList = document.getElementById('agentLiveList');
  const routingViz = document.getElementById('routingViz');
  const aiAuditLogs = document.getElementById('aiAuditLogs');

  // Load Agents
  async function refreshAgents() {
    try {
      const agents = await getAIAgents();
      agentLiveList.innerHTML = agents.map(a => `
        <div class="agent-live-item">
          <div class="agent-live-status online"></div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 0.85rem;">${a.name}</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">${a.role}</div>
          </div>
        </div>
      `).join('');
    } catch (err) {}
  }

  // Load Logs
  async function refreshLogs() {
    try {
      const logs = await getAILogs();
      aiAuditLogs.innerHTML = logs.map(l => `
        <div style="padding: 8px; border-bottom: 1px solid var(--border-subtle);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="color: var(--accent-blue); font-weight: 600;">${l.agent_called}</span>
            <span style="color: var(--text-muted);">${new Date(l.created_at).toLocaleTimeString()}</span>
          </div>
          <div style="color: var(--text-secondary); line-height: 1.3;">${l.action_log}</div>
        </div>
      `).join('');
    } catch (err) {}
  }

  refreshAgents();
  refreshLogs();

  // Send Logic
  btnSend.onclick = async () => {
    const input = chatInput.value.trim();
    if (!input) return;

    // Add User Message
    const userMsg = document.createElement('div');
    userMsg.className = 'message-bubble message-user';
    userMsg.textContent = input;
    chatMessages.appendChild(userMsg);
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Show Routing
    routingViz.innerHTML = `
      <div class="routing-flow">
        <div class="route-step">USER</div>
        <div class="route-arrow">→</div>
        <div class="route-step">MASTER</div>
        <div class="route-arrow">→</div>
        <div class="route-step" style="background: var(--accent-blue-glow);">ROUTING...</div>
      </div>
    `;

    try {
      const result = await sendAICommand(input);
      
      // Update Routing Viz
      routingViz.innerHTML = `
        <div class="routing-flow">
          <div class="route-step">USER</div>
          <div class="route-arrow">→</div>
          <div class="route-step">MASTER</div>
          <div class="route-arrow">→</div>
          <div class="route-step" style="background: var(--accent-emerald-glow);">${result.agent_called.toUpperCase()}</div>
        </div>
      `;

      // Add AI Response
      const aiMsg = document.createElement('div');
      aiMsg.className = 'message-bubble message-ai';
      aiMsg.innerHTML = `
        <div class="message-ai-header">
          <span class="agent-avatar" style="width: 24px; height: 24px; font-size: 0.7rem;">${result.agent_called.substring(0, 2).toUpperCase()}</span>
          <span style="font-weight: 600; font-size: 0.85rem;">${result.agent_called}</span>
          <span class="agent-status-badge active" style="margin-left: auto; font-size: 0.6rem;">${result.verification}</span>
        </div>
        <div>${result.action_log}</div>
        <div class="ai-json-card">
          <pre>${highlightJSON(result)}</pre>
        </div>
      `;
      chatMessages.appendChild(aiMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      refreshLogs();
    } catch (err) {
      const errorMsg = document.createElement('div');
      errorMsg.className = 'message-bubble message-ai';
      errorMsg.style.borderColor = 'var(--accent-rose)';
      errorMsg.textContent = "Lỗi kết nối AI OS: " + err.message;
      chatMessages.appendChild(errorMsg);
    }
  };

  chatInput.onkeydown = (e) => {
    if (e.key === 'Enter') btnSend.click();
  };
}
