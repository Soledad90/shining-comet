// ============================================
// AGENTS VIEW
// ============================================

import { agentDefinitions } from '../data.js';

export function renderAgents() {
  return `
    <div class="section-header">
      <div>
        <div class="section-title">Agent Monitor</div>
        <div class="section-subtitle">Theo dõi trạng thái và hiệu suất 6 AI agents</div>
      </div>
    </div>

    <div class="agents-grid">
      ${agentDefinitions.map((agent, i) => `
        <div class="agent-detail-card animate-slide delay-${i + 1}">
          <div class="agent-detail-header">
            <div class="agent-detail-avatar agent-avatar ${agent.avatarClass}" style="width:48px;height:48px;font-size:1.1rem;">
              ${agent.shortName}
            </div>
            <div class="agent-detail-info">
              <h3>${agent.name}</h3>
              <p>${agent.role}</p>
            </div>
            <div class="agent-status-badge ${agent.status}" style="margin-left: auto;">
              ${agent.status.toUpperCase()}
            </div>
          </div>

          <div class="agent-stats">
            <div class="agent-stat">
              <div class="agent-stat-value">${agent.tasksCompleted.toLocaleString()}</div>
              <div class="agent-stat-label">Tác vụ</div>
            </div>
            <div class="agent-stat">
              <div class="agent-stat-value">${agent.accuracy}%</div>
              <div class="agent-stat-label">Chính xác</div>
            </div>
            <div class="agent-stat">
              <div class="agent-stat-value">${agent.avgTime}</div>
              <div class="agent-stat-label">Trung bình</div>
            </div>
          </div>

          <div class="agent-recent">
            <div class="agent-recent-title">Hoạt động gần đây</div>
            ${agent.recentActions.map(action => `
              <div class="agent-action-item">
                <div class="agent-action-dot" style="background: var(--accent-${action.status === 'success' ? 'emerald' : action.status === 'fail' ? 'rose' : action.status === 'warning' ? 'amber' : 'blue'});"></div>
                <span>${action.text}</span>
                <span style="margin-left: auto; color: var(--text-muted); font-size: 0.72rem;">${action.time}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

export function initAgents() {
  // Agent cards are static for now; could add refresh/interaction later.
}
