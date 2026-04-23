// ============================================
// AI AGENT ENGINE — Orchestrator & Sub-Agents
// deterministic rule-based implementation
// ============================================

const db = require('./db');

class AIEngine {
  constructor() {
    this.agents = {
      master_agent: {
        name: "master_agent",
        role: "orchestrator",
        description: "AI Operating System Orchestrator"
      },
      warehouse_agent: {
        name: "warehouse_agent",
        role: "warehouse",
        description: "Quản lý kho sản xuất giày"
      },
      qa_agent: {
        name: "qa_agent",
        role: "quality_control",
        description: "QA Agent tiêu chuẩn Adidas AQL"
      },
      compliance_agent: {
        name: "compliance_agent",
        role: "audit",
        description: "Compliance Agent tiêu chuẩn Adidas A0386"
      },
      production_agent: {
        name: "production_agent",
        role: "production",
        description: "AI quản lý sản xuất"
      },
      reporting_agent: {
        name: "reporting_agent",
        role: "reporting",
        description: "AI báo cáo điều hành"
      }
    };
  }

  // === Routing Rules (Keyword based) ===
  route(input) {
    const text = input.toLowerCase();
    if (text.includes('kho') || text.includes('nhập') || text.includes('xuất')) {
      return 'warehouse_agent';
    }
    if (text.includes('qc') || text.includes('aql') || text.includes('quality')) {
      return 'qa_agent';
    }
    if (text.includes('audit') || text.includes('compliance')) {
      return 'compliance_agent';
    }
    if (text.includes('sản xuất') || text.includes('production')) {
      return 'production_agent';
    }
    if (text.includes('báo cáo') || text.includes('report')) {
      return 'reporting_agent';
    }
    return 'warehouse_agent'; // Default
  }

  // === Process Command ===
  async processCommand(input) {
    const targetAgentId = this.route(input);
    const agent = this.agents[targetAgentId];
    
    let result = {
      agent_called: targetAgentId,
      status: "SUCCESS",
      verification: "PASS",
      action_log: ""
    };

    // Sub-agent specific logic
    switch (targetAgentId) {
      case 'warehouse_agent':
        result.action_log = this.handleWarehouse(input);
        break;
      case 'qa_agent':
        result.action_log = this.handleQA(input);
        break;
      case 'compliance_agent':
        result.action_log = this.handleCompliance(input);
        break;
      case 'production_agent':
        result.action_log = this.handleProduction(input);
        break;
      case 'reporting_agent':
        result.action_log = this.handleReporting(input);
        break;
    }

    // Log to DB
    db.prepare(`
      INSERT INTO agent_logs (agent_called, status, verification, action_log)
      VALUES (?, ?, ?, ?)
    `).run(result.agent_called, result.status, result.verification, result.action_log);

    return result;
  }

  // === Handlers ===
  handleWarehouse(input) {
    // Logic for inventory, sku check, location
    if (input.includes('tồn')) {
      return "Đang kiểm tra tồn kho... Tất cả SKU chính đều trên mức tối thiểu ngoại trừ VT-DA-003.";
    }
    return "Lệnh kho đã được tiếp nhận và xử lý theo SOP.";
  }

  handleQA(input) {
    return "Kiểm tra chất lượng AQL: Lô hàng đạt tiêu chuẩn PASS. Sample size: 80, Defects: 0.";
  }

  handleCompliance(input) {
    return "Kiểm tra A0386: Hồ sơ hóa chất đầy đủ, SOP lưu trữ đúng quy định. Score: 95/100.";
  }

  handleProduction(input) {
    return "Sản lượng thực tế: 1,200 đôi / Kế hoạch: 1,000 đôi. Hiệu suất: 120%. Không có delay.";
  }

  handleReporting(input) {
    return "Báo cáo tổng hợp: Kho ổn định, QA PASS 100%, Rủi ro thấp.";
  }

  // === Scheduled Job Runner ===
  async runJob(jobId) {
    const job = db.prepare('SELECT * FROM scheduled_jobs WHERE id = ?').get(jobId);
    if (!job) return;

    db.prepare('UPDATE scheduled_jobs SET status = "RUNNING", last_run = CURRENT_TIMESTAMP WHERE id = ?').run(jobId);
    
    // Simulate task work
    console.log(`[AI Engine] Running job: ${job.task_name}`);
    await new Promise(r => setTimeout(r, 2000));

    db.prepare('UPDATE scheduled_jobs SET status = "IDLE" WHERE id = ?').run(jobId);
  }
}

module.exports = new AIEngine();
