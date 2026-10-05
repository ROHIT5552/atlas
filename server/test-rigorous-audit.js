const { queryEngine, db } = require('./db/database');

console.log('================================================================');
console.log('NEWRA ATLAS - RIGOROUS FORENSIC CALCULATION & ENGINE VERIFICATION');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failCount++;
  }
}

// -------------------------------------------------------------------------
// TEST SUITE 1: CAPTIVE STRUCTURING & RULE 3(1) PROPORTIONALITY ENGINE
// -------------------------------------------------------------------------
console.log('--- 1. Testing Captive Structuring & Rule 3(1) Proportionality ---');

// Case 1A: Perfectly proportional SPV (Equity 18% + 8% = 26%, Consumption 12 MU + 5.33 MU = 17.33 MU of 17.5 MU generation = 99%)
const captivePerfect = queryEngine.structureCaptiveEquity({
  plant_capacity_mw: 10,
  annual_generation_mu: 17.5,
  captive_users: [
    { name: 'User A', equity_share_pct: 18.0, annual_consumption_mu: 12.0 },
    { name: 'User B', equity_share_pct: 8.0, annual_consumption_mu: 5.33 }
  ]
});
assert(captivePerfect.compliance_verdict.status === 'FULLY_COMPLIANT', 'Perfect structure passes full compliance');
assert(captivePerfect.compliance_verdict.is_equity_compliant === true, 'Equity >= 26% check passes');
assert(captivePerfect.compliance_verdict.is_consumption_compliant === true, 'Consumption >= 51% check passes');
assert(captivePerfect.compliance_verdict.is_proportionality_compliant === true, 'Proportionality check passes within 10%');

// Case 1B: Equity Deficit (< 26%)
const captiveEquityDeficit = queryEngine.structureCaptiveEquity({
  plant_capacity_mw: 10,
  annual_generation_mu: 17.5,
  captive_users: [
    { name: 'User A', equity_share_pct: 15.0, annual_consumption_mu: 12.0 },
    { name: 'User B', equity_share_pct: 5.0, annual_consumption_mu: 4.0 }
  ]
});
assert(captiveEquityDeficit.compliance_verdict.status === 'NON_COMPLIANT', 'Equity < 26% correctly rejected');
assert(captiveEquityDeficit.compliance_verdict.is_equity_compliant === false, 'Equity deficit flagged');

// Case 1C: Consumption Deficit (< 51%)
const captiveConsDeficit = queryEngine.structureCaptiveEquity({
  plant_capacity_mw: 10,
  annual_generation_mu: 17.5,
  captive_users: [
    { name: 'User A', equity_share_pct: 18.0, annual_consumption_mu: 5.0 },
    { name: 'User B', equity_share_pct: 8.0, annual_consumption_mu: 2.0 }
  ]
});
assert(captiveConsDeficit.compliance_verdict.status === 'NON_COMPLIANT', 'Consumption < 51% correctly rejected');
assert(captiveConsDeficit.compliance_verdict.is_consumption_compliant === false, 'Consumption deficit flagged');

// Case 1D: Proportionality Violation (> 10% deviation between captive partners)
// User A holds 90% of captive equity (23.4% of 26%) but consumes only 50% of captive energy
const captiveProportionViolation = queryEngine.structureCaptiveEquity({
  plant_capacity_mw: 10,
  annual_generation_mu: 17.5,
  captive_users: [
    { name: 'User A', equity_share_pct: 23.4, annual_consumption_mu: 6.0 },
    { name: 'User B', equity_share_pct: 2.6, annual_consumption_mu: 6.0 }
  ]
});
assert(captiveProportionViolation.compliance_verdict.status === 'NON_COMPLIANT', 'Proportionality violation correctly caught');
assert(captiveProportionViolation.compliance_verdict.is_proportionality_compliant === false, 'is_proportionality_compliant is false');
assert(captiveProportionViolation.spv_equity_structure.user_equity_breakdown[0].proportionality_deviation_pct > 10.0, 'Deviation percentage > 10% calculated');

// Case 1E: Extreme boundary test (0 MW or 0 MU)
const captiveZero = queryEngine.structureCaptiveEquity({ plant_capacity_mw: 0, annual_generation_mu: 0, captive_users: [] });
assert(!isNaN(captiveZero.plant_parameters.annual_generation_mu), 'Zero capacity handled safely without NaN');


// -------------------------------------------------------------------------
// TEST SUITE 2: STATUTORY BILL AUDIT ENGINE & BILLING DEMAND RULES
// -------------------------------------------------------------------------
console.log('\n--- 2. Testing Statutory Bill Audit Engine ---');

// Case 2A: 85% Contract Demand Rule (MD is lower than 85% of CD)
const auditUnderDraw = queryEngine.auditDiscomBill({
  discom_id: 'msedcl',
  contract_demand_kva: 2000,
  recorded_md_kva: 1200, // 1200 is below 85% of 2000 = 1700
  billed_units_kwh: 850000,
  pf: 0.95
});
assert(auditUnderDraw.bill_parameters.statutory_billing_demand_kva === 1700, 'Underdrawn plant correctly billed on 85% CD floor (1700 kVA)');
assert(auditUnderDraw.bill_parameters.has_demand_overdraw === false, 'No overdraw flagged');

// Case 2B: Demand Overdraw Rule (MD > CD)
const auditOverDraw = queryEngine.auditDiscomBill({
  discom_id: 'msedcl',
  contract_demand_kva: 2000,
  recorded_md_kva: 2300, // 300 kVA overdraw
  billed_units_kwh: 850000,
  pf: 0.95
});
assert(auditOverDraw.bill_parameters.has_demand_overdraw === true, 'Demand overdraw correctly detected');
assert(auditOverDraw.bill_parameters.overdraw_kva === 300, 'Overdraw quantity is 300 kVA');

// Case 2C: Minimum Sanctioned Floor (100 kVA)
const auditTinyPlant = queryEngine.auditDiscomBill({
  discom_id: 'msedcl',
  contract_demand_kva: 50,
  recorded_md_kva: 20,
  billed_units_kwh: 10000,
  pf: 0.95
});
assert(auditTinyPlant.bill_parameters.statutory_billing_demand_kva === 100, 'Minimum sanctioned floor of 100 kVA enforced');

// Case 2D: Power Factor Incentive (PF >= 0.95) vs Penalty (PF < 0.90)
const auditHighPf = queryEngine.auditDiscomBill({ pf: 0.98 });
assert(auditHighPf.line_item_audit.find(i => i.item.includes('Power Factor')).status === 'REBATE_CREDIT', 'PF 0.98 gets rebate credit');

const auditLowPf = queryEngine.auditDiscomBill({ pf: 0.82 });
assert(auditLowPf.line_item_audit.find(i => i.item.includes('Power Factor')).status === 'PENALTY_SURCHARGE', 'PF 0.82 gets penalty surcharge');

// Case 2E: Zero Power Factor Boundary Protection (PF = 0 or invalid)
const auditZeroPf = queryEngine.auditDiscomBill({ pf: 0 });
assert(!isNaN(auditZeroPf.bill_parameters.power_factor), 'PF = 0 gracefully clamped without crashing or producing NaN');
assert(auditZeroPf.bill_parameters.power_factor >= 0.5, 'Clamped to safe range >= 0.50');


// -------------------------------------------------------------------------
// TEST SUITE 3: TOD SLOT SETTLEMENT & PEAK BANKING RESTRICTION WATERFALL
// -------------------------------------------------------------------------
console.log('\n--- 3. Testing Settlement Waterfall & TOD Peak Restrictions ---');

// Case 3A: Maharashtra MERC (Peak draw prohibited)
const waterfallMH = queryEngine.simulateSettlementWaterfall({
  state_id: 'maharashtra',
  discom_id: 'msedcl',
  gross_injection_kwh: 100000,
  consumer_drawal_kwh: 92000
});
assert(waterfallMH.tod_slot_settlement !== undefined, 'TOD slot settlement matrix generated');
assert(waterfallMH.tod_slot_settlement.slots.length === 4, '4 discrete TOD slots generated');
assert(waterfallMH.tod_slot_settlement.peak_draw_prohibited === true, 'Maharashtra peak draw correctly prohibited under MERC orders');
assert(waterfallMH.tod_slot_settlement.slots[3].banked_draw_allowed === false, 'Evening peak slot banked draw is disabled in MH');

// Case 3B: Commercial Bottom Line Math
assert(waterfallMH.commercial_waterfall_inr.net_landed_cost_inr > 0, 'Net landed cost calculated');
assert(waterfallMH.commercial_waterfall_inr.net_savings_inr > 0, 'Captive net savings generated vs Discom retail grid rate');
assert(waterfallMH.waterfall_physical_units.cumulative_technical_loss_pct > 0, 'Cumulative technical grid loss deducted');

console.log('\n================================================================');
console.log(`AUDIT COMPLETE: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
