const express = require('express');
const cors = require('cors');
const { db, queryEngine } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 8000;


app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root & Health Check
app.get('/api', (req, res) => {
  res.json({
    app: 'NewRa State & DISCOM Regulatory Library API',
    version: '1.0.0',
    status: 'Healthy',
    docs: '/api/docs',
    endpoints: [
      '/api/stats',
      '/api/states',
      '/api/states/:id',
      '/api/discoms',
      '/api/discoms/:id',
      '/api/consumer-categories',
      '/api/connection-types',
      '/api/voltage-levels',
      '/api/tariffs',
      '/api/tod',
      '/api/open-access',
      '/api/oa-charges',
      '/api/losses',
      '/api/banking',
      '/api/captive',
      '/api/metering',
      '/api/scheduling',
      '/api/dsm',
      '/api/documents',
      '/api/regulatory-profile',
      '/api/compare',
      '/api/search'
    ]
  });
});

// 1. Dashboard KPI stats
app.get('/api/stats', (req, res) => {
  res.json(queryEngine.getStats());
});

// 2. States API
app.get('/api/states', (req, res) => {
  const { region, search } = req.query;
  const states = queryEngine.getStates({ region, search });
  res.json({ count: states.length, states });
});

app.get('/api/states/:id', (req, res) => {
  const state = queryEngine.getStateById(req.params.id);
  if (!state) {
    return res.status(404).json({ error: `State '${req.params.id}' not found` });
  }
  res.json(state);
});

// 3. DISCOMs API
app.get('/api/discoms', (req, res) => {
  const { state_id, search } = req.query;
  const discoms = queryEngine.getDiscoms({ state_id, search });
  res.json({ count: discoms.length, discoms });
});

app.get('/api/discoms/:id', (req, res) => {
  const discom = queryEngine.getDiscomById(req.params.id);
  if (!discom) {
    return res.status(404).json({ error: `DISCOM '${req.params.id}' not found` });
  }
  res.json(discom);
});

// 4. Metadata: Consumer Categories, Connection Types, Voltage Levels
app.get('/api/consumer-categories', (req, res) => {
  res.json({ count: db.consumerCategories.length, categories: db.consumerCategories });
});

app.get('/api/connection-types', (req, res) => {
  res.json({ count: db.connectionTypes.length, connection_types: db.connectionTypes });
});

app.get('/api/voltage-levels', (req, res) => {
  res.json({ count: db.voltageLevels.length, voltage_levels: db.voltageLevels });
});

// 5. Tariffs API
app.get('/api/tariffs', (req, res) => {
  const { state_id, discom_id, consumer_category_id, financial_year, voltage_level, connection_type, verification_status } = req.query;
  const tariffs = queryEngine.getTariffs({
    state_id,
    discom_id,
    consumer_category_id,
    financial_year,
    voltage_level,
    connection_type,
    verification_status
  });
  res.json({ count: tariffs.length, tariffs });
});

// 6. TOD Profiles API
app.get('/api/tod', (req, res) => {
  const { state_id, discom_id } = req.query;
  const profiles = queryEngine.getTodProfiles({ state_id, discom_id });
  res.json({ count: profiles.length, profiles });
});

// 7. Open Access Rules & Charges API
app.get('/api/open-access', (req, res) => {
  const { state_id } = req.query;
  const rules = queryEngine.getOpenAccessRules(state_id);
  res.json(rules ?? null);
});

app.get('/api/oa-charges', (req, res) => {
  const { state_id, discom_id, oa_type } = req.query;
  const charges = queryEngine.getOaCharges({ state_id, discom_id, oa_type });
  res.json({ count: charges.length, charges });
});

// 8. Grid Losses API
app.get('/api/losses', (req, res) => {
  const { state_id, voltage_level } = req.query;
  const losses = queryEngine.getLossRules({ state_id, voltage_level });
  res.json({ count: losses.length, losses });
});

// 9. Banking Rules API
app.get('/api/banking', (req, res) => {
  const { state_id } = req.query;
  const banking = queryEngine.getBankingRules(state_id);
  res.json(banking ?? null);
});

// 10. Captive Rules API
app.get('/api/captive', (req, res) => {
  const { state_id } = req.query;
  const captive = queryEngine.getCaptiveRules(state_id);
  res.json(captive ?? null);
});

// 11. Metering Rules API
app.get('/api/metering', (req, res) => {
  const { state_id } = req.query;
  const metering = queryEngine.getMeteringRules(state_id);
  res.json(metering ?? null);
});

// 12. Scheduling Rules API
app.get('/api/scheduling', (req, res) => {
  const { state_id } = req.query;
  const scheduling = queryEngine.getSchedulingRules(state_id);
  res.json(scheduling ?? null);
});

// 13. DSM Rules API
app.get('/api/dsm', (req, res) => {
  const { state_id } = req.query;
  const dsm = queryEngine.getDsmRules(state_id);
  res.json(dsm ?? null);
});

// 14. Regulatory Documents API
app.get('/api/documents', (req, res) => {
  const { state_id, category, search } = req.query;
  const docs = queryEngine.getRegulatoryDocuments({ state_id, category, search });
  res.json({ count: docs.length, documents: docs });
});

// 15. UNIFIED REGULATORY PROFILE ENDPOINT (Core GridFlex / Bill Scanner integration)
app.get('/api/regulatory-profile', (req, res) => {
  const {
    state, state_id,
    discom, discom_id,
    consumer_category, consumer_category_id,
    voltage, voltage_level,
    connection_type,
    fy, financial_year
  } = req.query;
  const profile = queryEngine.getRegulatoryProfile({
    state_id: state || state_id,
    discom_id: discom || discom_id,
    consumer_category_id: consumer_category || consumer_category_id,
    voltage_level: voltage || voltage_level,
    connection_type: connection_type,
    financial_year: fy || financial_year
  });
  res.json(profile);
});

// 16. Multi-Entity Comparison API
app.get('/api/compare', (req, res) => {
  const { type = 'state', ids } = req.query;
  const idArray = ids ? ids.split(',').map(s => s.trim()) : (type === 'state' ? ['maharashtra', 'gujarat', 'rajasthan'] : ['msedcl', 'dgvcl', 'jvvnl']);
  const result = queryEngine.compare(type, idArray);
  res.json(result);
});

// 17. Global Multi-Dimensional Search API
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  const results = queryEngine.search(q);
  res.json(results);
});

// 18. Admin CRUD & Versioning Endpoints
app.post('/api/admin/update', (req, res) => {
  try {
    const { entity_type, entity_id, fields, user } = req.body;
    if (!entity_type || !entity_id || !fields) {
      return res.status(400).json({ error: 'Missing required parameters: entity_type, entity_id, fields' });
    }
    const updateResult = queryEngine.updateRecord(entity_type, entity_id, fields, user);
    res.json(updateResult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/audit-logs', (req, res) => {
  res.json({ count: db.auditLogs.length, audit_logs: db.auditLogs });
});

// ==========================================
// NEWRA ATLAS SSoT V1 ENDPOINTS (DOWNSTREAM FEEDS)
// ==========================================

// Engine 4: Consumer Eligibility Checker (GES)
app.all('/api/v1/atlas/eligibility/consumer', (req, res) => {
  const params = { ...req.query, ...req.body };
  const result = queryEngine.checkConsumerEligibility(params);
  res.json(result);
});

// Engine 5: Generator Eligibility Checker (GEP)
app.all('/api/v1/atlas/eligibility/generator', (req, res) => {
  const params = { ...req.query, ...req.body };
  const result = queryEngine.checkGeneratorEligibility(params);
  res.json(result);
});

// Engine 3: Connectivity Matrix
app.get('/api/v1/atlas/connectivity/matrix', (req, res) => {
  const result = queryEngine.getConnectivityMatrix(req.query);
  res.json(result);
});

// Downstream Contract: NewRa Lens (BillScan & Bill Optimizer)
app.get('/api/v1/atlas/lens/bill-audit', (req, res) => {
  const result = queryEngine.getLensAuditRules(req.query);
  res.json(result);
});

// Downstream Contract: GridFlex (Settlement & Commercial Engine)
app.get('/api/v1/atlas/gridflex/settlement-rules', (req, res) => {
  const result = queryEngine.getGridFlexSettlement(req.query);
  res.json(result);
});

app.get('/api/v1/atlas/gridflex/landed-cost', (req, res) => {
  const result = queryEngine.getGridFlexSettlement(req.query);
  res.json(result);
});

// Downstream Contract: NewRa VPP (15-min Dispatch & DSM)
app.get('/api/v1/atlas/vpp/dsm-parameters', (req, res) => {
  const result = queryEngine.getVppDsmRules(req.query);
  res.json(result);
});

// Downstream Contract: NewRa Connect (Statutory OA Tracker)
app.get('/api/v1/atlas/connect/statutory-checklist', (req, res) => {
  const stateId = req.query.state_id || 'maharashtra';
  const state = db.states.find(s => s.id === stateId) || db.states[0];
  const captive = db.captiveRules.find(c => c.state_id === state.id) || db.captiveRules[0];
  const metering = db.meteringRules.find(m => m.state_id === state.id) || db.meteringRules[0];

  res.json({
    product_target: 'NewRa Connect (Execution & Approval SSoT)',
    state: state.name,
    steps: [
      { step: 1, name: 'Feeder Interconnection Approval', authority: state.stu_code, time_sla_days: 30 },
      { step: 2, name: 'ABT 0.2s SEM Meter Testing & Commissioning', authority: 'DISCOM / STU Metering Division', requirement: metering.meter_class },
      { step: 3, name: 'SLDC Telemetry & Real-Time RTU Connectivity', authority: state.sldc_code, requirement: metering.sldc_telemetry },
      { step: 4, name: 'Captive Shareholding Affidavit (26% Equity)', authority: 'SERC / DISCOM Commercial Division', requirement: captive.ownership_requirement },
      { step: 5, name: 'CEIG Electrical Safety Certificate', authority: 'Chief Electrical Inspector to Government', time_sla_days: 15 },
      { step: 6, name: 'Final Open Access Sanction Letter', authority: state.regulator_code, requirement: 'Grant of LTA / MTOA / GEOA' }
    ]
  });
});

// Downstream Contract: NewRa Ledger (15-min Energy Accounting & Bill Reconciliation)
app.get('/api/v1/atlas/ledger/reconciliation-factors', (req, res) => {
  const result = queryEngine.getLedgerReconciliation(req.query);
  res.json(result);
});

// ==========================================
// 1. THE GES / GEP REGULATORY PASSPORT GENERATOR API
// ==========================================
app.all('/api/v1/atlas/passport/generate', (req, res) => {
  const params = { ...req.query, ...req.body };
  const passport = queryEngine.generateRegulatoryPassport(params);
  res.json(passport);
});

// ==========================================
// 2. NEWRA GUARD COMPLIANCE RULEBOOK API
// ==========================================
app.get('/api/v1/atlas/guard/compliance-rules', (req, res) => {
  const rules = queryEngine.getGuardComplianceRules(req.query);
  res.json(rules);
});

// ==========================================
// 3. THE 6 LIFECYCLE ENGINES API
// ==========================================

// Stage 6: Billed — Bill Audit Engine
app.all('/api/v1/atlas/lifecycle/bill-audit', (req, res) => {
  const params = { ...req.query, ...req.body };
  const audit = queryEngine.auditDiscomBill(params);
  res.json(audit);
});

// Stage 2: Contracted — Captive 26/51 Structuring
app.all('/api/v1/atlas/lifecycle/captive-structuring', (req, res) => {
  const params = { ...req.query, ...req.body };
  const structuring = queryEngine.structureCaptiveEquity(params);
  res.json(structuring);
});

// Stage 4: Scheduled — 96-Block Dispatch Vector
app.get('/api/v1/atlas/lifecycle/dispatch-vector-96', (req, res) => {
  const vector = queryEngine.generate96BlockDispatchVector(req.query);
  res.json(vector);
});

// Stage 5: Settled — Settlement & Loss Waterfall Engine (NewRa Ledger SSoT)
app.all('/api/v1/atlas/lifecycle/settlement-waterfall', (req, res) => {
  const params = { ...req.query, ...req.body };
  const waterfall = queryEngine.simulateSettlementWaterfall(params);
  res.json(waterfall);
});

// Regulatory Change & Risk Propagator
app.all('/api/v1/atlas/lifecycle/change-impact', (req, res) => {
  const params = { ...req.query, ...req.body };
  const impact = queryEngine.simulateRegulatoryChangeImpact(params);
  res.json(impact);
});




const path = require('path');

// Serve static frontend in production
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

// SPA fallback handler
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(clientDist, 'index.html'));
  }
  next();
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`NewRa Regulatory Library API Server running on port ${PORT}`);
  console.log(`API Available at:  http://localhost:${PORT}/api`);
  console.log(`UI Available at:   http://localhost:${PORT}`);
  console.log(`=======================================================`);
});

module.exports = app;



