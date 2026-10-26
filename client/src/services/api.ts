/**
 * NewRa Atlas Central Regulatory SSoT Client API Service
 */

const API_BASE = '/api';

export const api = {
  // Stats
  async getStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  // States
  async getStates(params: Record<string, any> = {}): Promise<any> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/states?${query}`);
    if (!res.ok) throw new Error('Failed to fetch states');
    return res.json();
  },

  async getStateById(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/states/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch state ${id}`);
    return res.json();
  },

  // DISCOMs
  async getDiscoms(params: Record<string, any> = {}): Promise<any> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/discoms?${query}`);
    if (!res.ok) throw new Error('Failed to fetch discoms');
    return res.json();
  },

  async getDiscomById(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/discoms/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch discom ${id}`);
    return res.json();
  },

  // Metadata
  async getConsumerCategories(): Promise<any> {
    const res = await fetch(`${API_BASE}/consumer-categories`);
    if (!res.ok) throw new Error('Failed to fetch consumer categories');
    return res.json();
  },

  async getConnectionTypes(): Promise<any> {
    const res = await fetch(`${API_BASE}/connection-types`);
    if (!res.ok) throw new Error('Failed to fetch connection types');
    return res.json();
  },

  async getVoltageLevels(): Promise<any> {
    const res = await fetch(`${API_BASE}/voltage-levels`);
    if (!res.ok) throw new Error('Failed to fetch voltage levels');
    return res.json();
  },

  // Tariffs
  async getTariffs(params: Record<string, any> = {}): Promise<any> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/tariffs?${query}`);
    if (!res.ok) throw new Error('Failed to fetch tariffs');
    return res.json();
  },

  // TOD Profiles
  async getTodProfiles(params: Record<string, any> = {}): Promise<any> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/tod?${query}`);
    if (!res.ok) throw new Error('Failed to fetch TOD profiles');
    return res.json();
  },

  // Open Access
  async getOpenAccessRules(state_id?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/open-access${state_id ? `?state_id=${state_id}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch open access rules');
    return res.json();
  },

  async getOaCharges(params: Record<string, any> = {}): Promise<any> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/oa-charges?${query}`);
    if (!res.ok) throw new Error('Failed to fetch OA charges');
    return res.json();
  },

  // Grid Losses
  async getLosses(params: Record<string, any> = {}): Promise<any> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/losses?${query}`);
    if (!res.ok) throw new Error('Failed to fetch losses');
    return res.json();
  },

  // Banking
  async getBanking(state_id?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/banking${state_id ? `?state_id=${state_id}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch banking rules');
    return res.json();
  },

  // Captive
  async getCaptive(state_id?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/captive${state_id ? `?state_id=${state_id}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch captive rules');
    return res.json();
  },

  // Metering
  async getMetering(state_id?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/metering${state_id ? `?state_id=${state_id}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch metering rules');
    return res.json();
  },

  // Scheduling
  async getScheduling(state_id?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/scheduling${state_id ? `?state_id=${state_id}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch scheduling rules');
    return res.json();
  },

  // DSM
  async getDsm(state_id?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/dsm${state_id ? `?state_id=${state_id}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch DSM rules');
    return res.json();
  },

  // Documents
  async getDocuments(params: Record<string, any> = {}): Promise<any> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/documents?${query}`);
    if (!res.ok) throw new Error('Failed to fetch regulatory documents');
    return res.json();
  },

  // UNIFIED REGULATORY PROFILE
  async getRegulatoryProfile(params: Record<string, any> = {}): Promise<any> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/regulatory-profile?${query}`);
    if (!res.ok) throw new Error('Failed to fetch regulatory profile');
    return res.json();
  },

  // Comparison
  async compare(type: string = 'state', ids: string[] = []): Promise<any> {
    const res = await fetch(`${API_BASE}/compare?type=${type}&ids=${ids.join(',')}`);
    if (!res.ok) throw new Error('Failed to fetch comparison');
    return res.json();
  },

  // Global Search
  async search(query: string): Promise<any> {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to perform search');
    return res.json();
  },

  // Admin Update
  async updateAdminRecord(entity_type: string, entity_id: string, fields: any, user: string = 'Admin'): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity_type, entity_id, fields, user })
    });
    if (!res.ok) throw new Error('Failed to update record');
    return res.json();
  },

  async getAuditLogs(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // ==========================================
  // NEWRA ATLAS SSoT & DOWNSTREAM APIS
  // ==========================================

  // Engine 4: Consumer Eligibility Checker (GES)
  async checkConsumerEligibility(params: Record<string, any>): Promise<any> {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`/api/v1/atlas/eligibility/consumer?${q}`);
    if (!res.ok) throw new Error('Failed to evaluate consumer eligibility');
    return res.json();
  },

  // Engine 5: Generator Eligibility Checker (GEP)
  async checkGeneratorEligibility(params: Record<string, any>): Promise<any> {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`/api/v1/atlas/eligibility/generator?${q}`);
    if (!res.ok) throw new Error('Failed to evaluate generator eligibility');
    return res.json();
  },

  // Engine 3: Connectivity Matrix
  async getConnectivityMatrix(params: Record<string, any> = {}): Promise<any> {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`/api/v1/atlas/connectivity/matrix?${q}`);
    if (!res.ok) throw new Error('Failed to fetch connectivity matrix');
    return res.json();
  },

  // Downstream: NewRa Lens (BillScan)
  async getLensAuditRules(params: Record<string, any> = {}): Promise<any> {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`/api/v1/atlas/lens/bill-audit?${q}`);
    if (!res.ok) throw new Error('Failed to fetch Lens audit rules');
    return res.json();
  },

  // Downstream: GridFlex
  async getGridFlexSettlement(params: Record<string, any> = {}): Promise<any> {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`/api/v1/atlas/gridflex/settlement-rules?${q}`);
    if (!res.ok) throw new Error('Failed to fetch GridFlex settlement rules');
    return res.json();
  },

  // Downstream: NewRa VPP
  async getVppDsmParameters(params: Record<string, any> = {}): Promise<any> {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`/api/v1/atlas/vpp/dsm-parameters?${q}`);
    if (!res.ok) throw new Error('Failed to fetch VPP DSM parameters');
    return res.json();
  },

  // Downstream: NewRa Connect
  async getConnectChecklist(params: Record<string, any> = {}): Promise<any> {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`/api/v1/atlas/connect/statutory-checklist?${q}`);
    if (!res.ok) throw new Error('Failed to fetch Connect compliance checklist');
    return res.json();
  },

  // Downstream: NewRa Ledger
  async getLedgerReconciliation(params: Record<string, any> = {}): Promise<any> {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`/api/v1/atlas/ledger/reconciliation-factors?${q}`);
    if (!res.ok) throw new Error('Failed to fetch Ledger reconciliation factors');
    return res.json();
  },

  // 1. The GES / GEP Regulatory Passport Generator
  async generatePassport(params: Record<string, any> = {}): Promise<any> {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`/api/v1/atlas/passport/generate?${q}`);
    if (!res.ok) throw new Error('Failed to generate Regulatory Passport');
    return res.json();
  },

  // 2. NewRa Guard Compliance Rulebook
  async getGuardComplianceRules(params: Record<string, any> = {}): Promise<any> {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`/api/v1/atlas/guard/compliance-rules?${q}`);
    if (!res.ok) throw new Error('Failed to fetch Guard compliance rules');
    return res.json();
  },

  // 3. Lifecycle Stage 6: Bill Audit Engine
  async auditDiscomBill(params: Record<string, any> = {}): Promise<any> {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`/api/v1/atlas/lifecycle/bill-audit?${q}`);
    if (!res.ok) throw new Error('Failed to audit DISCOM bill');
    return res.json();
  },

  // 4. Lifecycle Stage 2: Captive 26/51 Structuring
  async structureCaptiveEquity(params: Record<string, any> = {}): Promise<any> {
    const res = await fetch(`/api/v1/atlas/lifecycle/captive-structuring`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to structure captive equity');
    return res.json();
  },

  // 5. Lifecycle Stage 4: 96-Block Dispatch Vector
  async get96BlockDispatchVector(params: Record<string, any> = {}): Promise<any> {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`/api/v1/atlas/lifecycle/dispatch-vector-96?${q}`);
    if (!res.ok) throw new Error('Failed to generate 96-block dispatch vector');
    return res.json();
  },

  // 6. Lifecycle Stage 5: Settlement & Loss Waterfall (NewRa Ledger SSoT)
  async simulateSettlementWaterfall(params: Record<string, any> = {}): Promise<any> {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`/api/v1/atlas/lifecycle/settlement-waterfall?${q}`);
    if (!res.ok) throw new Error('Failed to simulate settlement waterfall');
    return res.json();
  },

  // 7. Regulatory Change Impact Propagator
  async simulateRegulatoryChange(params: Record<string, any> = {}): Promise<any> {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`/api/v1/atlas/lifecycle/change-impact?${q}`);
    if (!res.ok) throw new Error('Failed to simulate regulatory change');
    return res.json();
  }
};
