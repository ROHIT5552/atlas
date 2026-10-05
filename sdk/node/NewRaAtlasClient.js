/**
 * NewRa Atlas Client SDK (Node.js / TypeScript)
 * The Single Source of Truth client for NewRa Lens, GridFlex, Connect, VPP, and Ledger.
 */

class NewRaAtlasClient {
  constructor({ baseUrl = "http://localhost:8000" } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async _fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`[NewRa Atlas Error] ${res.status} ${res.statusText} on ${url}`);
    }
    return res.json();
  }

  // --- ENGINE 4: Consumer Eligibility Checker ---
  async checkConsumerEligibility({ stateId, discomId, contractDemandKva, voltageCode }) {
    return this._fetch("/api/v1/atlas/eligibility/consumer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        state_id: stateId,
        discom_id: discomId,
        contract_demand_kva: contractDemandKva,
        voltage_code: voltageCode
      })
    });
  }

  // --- ENGINE 5: Generator Eligibility Checker ---
  async checkGeneratorEligibility({ stateId, technology, capacityMw, gridType }) {
    return this._fetch("/api/v1/atlas/eligibility/generator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        state_id: stateId,
        technology,
        capacity_mw: capacityMw,
        grid_type: gridType
      })
    });
  }

  // --- ENGINE 3: Connectivity Matrix ---
  async getConnectivityMatrix({ stateId, voltageCode } = {}) {
    const q = new URLSearchParams();
    if (stateId) q.append("state_id", stateId);
    if (voltageCode) q.append("voltage_code", voltageCode);
    return this._fetch(`/api/v1/atlas/connectivity/matrix?${q.toString()}`);
  }

  // --- DOWNSTREAM: NewRa Lens (BillScan & Bill Optimizer) ---
  async getLensBillAuditRules({ discomId, categoryId, voltageCode }) {
    const q = new URLSearchParams({
      discom_id: discomId,
      category_id: categoryId || "",
      voltage_code: voltageCode || ""
    });
    return this._fetch(`/api/v1/atlas/lens/bill-audit?${q.toString()}`);
  }

  // --- DOWNSTREAM: GridFlex (Settlement & Commercial Engine) ---
  async getGridFlexSettlement({ stateId, discomId, voltageCode }) {
    const q = new URLSearchParams({
      state_id: stateId || "",
      discom_id: discomId || "",
      voltage_code: voltageCode || ""
    });
    return this._fetch(`/api/v1/atlas/gridflex/settlement-rules?${q.toString()}`);
  }

  // --- DOWNSTREAM: NewRa VPP (15-min Dispatch & DSM) ---
  async getVppDsmParameters({ stateId }) {
    const q = new URLSearchParams({ state_id: stateId });
    return this._fetch(`/api/v1/atlas/vpp/dsm-parameters?${q.toString()}`);
  }

  // --- DOWNSTREAM: NewRa Connect (Execution & Approval SSoT) ---
  async getConnectComplianceChecklist({ stateId }) {
    const q = new URLSearchParams({ state_id: stateId });
    return this._fetch(`/api/v1/atlas/connect/statutory-checklist?${q.toString()}`);
  }

  // --- DOWNSTREAM: NewRa Ledger (15-min Reconciliation) ---
  async getLedgerReconciliationFactors({ stateId, discomId, billingMonth }) {
    const q = new URLSearchParams({
      state_id: stateId || "",
      discom_id: discomId || "",
      billing_month: billingMonth || ""
    });
    return this._fetch(`/api/v1/atlas/ledger/reconciliation-factors?${q.toString()}`);
  }

  // --- REGULATORY PASSPORT GENERATOR ---
  async generateRegulatoryPassport({ stateId, gesId, fy } = {}) {
    const q = new URLSearchParams();
    if (stateId) q.append("state_id", stateId);
    if (gesId) q.append("ges_id", gesId);
    if (fy) q.append("fy", fy);
    return this._fetch(`/api/v1/atlas/passport/generate?${q.toString()}`);
  }

  // --- NEWRA GUARD COMPLIANCE RULEBOOK ---
  async getGuardComplianceRules({ stateId } = {}) {
    const q = new URLSearchParams();
    if (stateId) q.append("state_id", stateId);
    return this._fetch(`/api/v1/atlas/guard/compliance-rules?${q.toString()}`);
  }

  // --- STAGE 6: DISCOM BILL AUDIT ENGINE ---
  async auditDiscomBill(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this._fetch(`/api/v1/atlas/lifecycle/bill-audit?${q}`);
  }

  // --- STAGE 2: CAPTIVE 26/51 STRUCTURING ENGINE ---
  async structureCaptiveEquity(payload = {}) {
    return this._fetch("/api/v1/atlas/lifecycle/captive-structuring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  // --- STAGE 4: 96-BLOCK DISPATCH VECTOR ---
  async get96BlockDispatchVector(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this._fetch(`/api/v1/atlas/lifecycle/dispatch-vector-96?${q}`);
  }

  // --- STAGE 5: SETTLEMENT & LOSS WATERFALL ---
  async simulateSettlementWaterfall(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this._fetch(`/api/v1/atlas/lifecycle/settlement-waterfall?${q}`);
  }

  // --- REGULATORY CHANGE & RISK PROPAGATOR ---
  async simulateRegulatoryChange(params = {}) {
    const q = new URLSearchParams(params).toString();
    return this._fetch(`/api/v1/atlas/lifecycle/change-impact?${q}`);
  }
}

module.exports = { NewRaAtlasClient };
