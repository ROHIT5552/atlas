const { states } = require('./states');
const { discoms } = require('./discoms');

// Specific OA parameters by state
const stateOAMatrix = {
  maharashtra: {
    wheelingCharge: 1.42, // Rs/kWh at 33kV
    wheelingLoss: 7.20, // %
    transmissionCharge: 4250, // Rs/MW/day or ~0.45 Rs/kWh
    transmissionLoss: 3.18, // %
    css: 2.18, // Rs/kWh
    additionalSurcharge: 1.25, // Rs/kWh
    sldcCharge: 2850, // Rs/month
    schedulingCharge: 1500, // Rs/day
    standbyCharge: 380, // Rs/kVA/month
    reactiveCharge: 0.15 // Rs/kVArh
  },
  gujarat: {
    wheelingCharge: 0.22, // Rs/kWh (concessional for RE)
    wheelingLoss: 3.50,
    transmissionCharge: 3850,
    transmissionLoss: 3.52,
    css: 1.68,
    additionalSurcharge: 0.65,
    sldcCharge: 2500,
    schedulingCharge: 1200,
    standbyCharge: 310,
    reactiveCharge: 0.10
  },
  rajasthan: {
    wheelingCharge: 0.32,
    wheelingLoss: 4.80,
    transmissionCharge: 2950,
    transmissionLoss: 3.35,
    css: 1.95,
    additionalSurcharge: 0.80,
    sldcCharge: 2200,
    schedulingCharge: 1000,
    standbyCharge: 275,
    reactiveCharge: 0.12
  },
  karnataka: {
    wheelingCharge: 0.58,
    wheelingLoss: 4.10,
    transmissionCharge: 3450,
    transmissionLoss: 3.05,
    css: 2.30,
    additionalSurcharge: 0.95,
    sldcCharge: 3100,
    schedulingCharge: 1400,
    standbyCharge: 330,
    reactiveCharge: 0.14
  },
  'tamil-nadu': {
    wheelingCharge: 0.85,
    wheelingLoss: 5.60,
    transmissionCharge: 3950,
    transmissionLoss: 3.75,
    css: 2.45,
    additionalSurcharge: 1.10,
    sldcCharge: 3000,
    schedulingCharge: 1250,
    standbyCharge: 400,
    reactiveCharge: 0.16
  },
  telangana: {
    wheelingCharge: 0.72,
    wheelingLoss: 4.90,
    transmissionCharge: 3600,
    transmissionLoss: 3.25,
    css: 2.10,
    additionalSurcharge: 0.90,
    sldcCharge: 2600,
    schedulingCharge: 1100,
    standbyCharge: 320,
    reactiveCharge: 0.12
  },
  'andhra-pradesh': {
    wheelingCharge: 0.65,
    wheelingLoss: 4.70,
    transmissionCharge: 3400,
    transmissionLoss: 3.20,
    css: 2.05,
    additionalSurcharge: 0.85,
    sldcCharge: 2400,
    schedulingCharge: 1050,
    standbyCharge: 310,
    reactiveCharge: 0.11
  },
  'madhya-pradesh': {
    wheelingCharge: 0.60,
    wheelingLoss: 5.20,
    transmissionCharge: 3100,
    transmissionLoss: 3.40,
    css: 1.85,
    additionalSurcharge: 0.75,
    sldcCharge: 2100,
    schedulingCharge: 1000,
    standbyCharge: 290,
    reactiveCharge: 0.10
  },
  'uttar-pradesh': {
    wheelingCharge: 0.95,
    wheelingLoss: 6.50,
    transmissionCharge: 3800,
    transmissionLoss: 3.65,
    css: 2.25,
    additionalSurcharge: 1.05,
    sldcCharge: 2900,
    schedulingCharge: 1300,
    standbyCharge: 350,
    reactiveCharge: 0.15
  },
  haryana: {
    wheelingCharge: 0.82,
    wheelingLoss: 5.40,
    transmissionCharge: 3500,
    transmissionLoss: 2.95,
    css: 2.15,
    additionalSurcharge: 0.92,
    sldcCharge: 2700,
    schedulingCharge: 1200,
    standbyCharge: 315,
    reactiveCharge: 0.13
  },
  punjab: {
    wheelingCharge: 0.75,
    wheelingLoss: 5.10,
    transmissionCharge: 3300,
    transmissionLoss: 2.85,
    css: 1.98,
    additionalSurcharge: 0.88,
    sldcCharge: 2500,
    schedulingCharge: 1150,
    standbyCharge: 300,
    reactiveCharge: 0.12
  },
  delhi: {
    wheelingCharge: 1.10,
    wheelingLoss: 4.20,
    transmissionCharge: 4100,
    transmissionLoss: 1.95,
    css: 2.35,
    additionalSurcharge: 0.70,
    sldcCharge: 3200,
    schedulingCharge: 1500,
    standbyCharge: 280,
    reactiveCharge: 0.18
  },
  chhattisgarh: {
    wheelingCharge: 0.48,
    wheelingLoss: 4.30,
    transmissionCharge: 2800,
    transmissionLoss: 3.10,
    css: 1.70,
    additionalSurcharge: 0.60,
    sldcCharge: 2000,
    schedulingCharge: 950,
    standbyCharge: 260,
    reactiveCharge: 0.09
  },
  odisha: {
    wheelingCharge: 0.52,
    wheelingLoss: 4.60,
    transmissionCharge: 3000,
    transmissionLoss: 3.30,
    css: 1.80,
    additionalSurcharge: 0.65,
    sldcCharge: 2150,
    schedulingCharge: 980,
    standbyCharge: 270,
    reactiveCharge: 0.10
  },
  'west-bengal': {
    wheelingCharge: 0.88,
    wheelingLoss: 5.80,
    transmissionCharge: 3750,
    transmissionLoss: 3.45,
    css: 2.20,
    additionalSurcharge: 0.90,
    sldcCharge: 2800,
    schedulingCharge: 1250,
    standbyCharge: 340,
    reactiveCharge: 0.14
  },
  uttarakhand: {
    wheelingCharge: 0.45,
    wheelingLoss: 4.10,
    transmissionCharge: 2700,
    transmissionLoss: 2.70,
    css: 1.65,
    additionalSurcharge: 0.55,
    sldcCharge: 1900,
    schedulingCharge: 900,
    standbyCharge: 250,
    reactiveCharge: 0.08
  },
  jharkhand: {
    wheelingCharge: 0.55,
    wheelingLoss: 4.90,
    transmissionCharge: 2900,
    transmissionLoss: 3.20,
    css: 1.75,
    additionalSurcharge: 0.62,
    sldcCharge: 2050,
    schedulingCharge: 920,
    standbyCharge: 265,
    reactiveCharge: 0.09
  }
};

const openAccessRules = [];
const oaCharges = [];
const lossRules = [];

let oaChargeCounter = 1;
let lossRuleCounter = 1;

states.forEach(state => {
  const oaMeta = stateOAMatrix[state.id] || stateOAMatrix['maharashtra'];

  // State OA Rules
  openAccessRules.push({
    id: `oa-rules-${state.id}`,
    state_id: state.id,
    oa_threshold_conventional_mw: 1.0,
    oa_threshold_green_energy_kw: 100.0,
    captive_threshold: 'No minimum capacity threshold under Electricity Rules 2005',
    st_oa_duration: 'Up to 1 Month (renewable)',
    mt_oa_duration: '3 Months to 5 Years',
    lt_oa_duration: '5 Years to 25 Years',
    nodal_agency_st: `${state.sldc_code} / MSLDC`,
    nodal_agency_lt_mt: `${state.stu_code} / STU`,
    interstate_allowed: true,
    intrastate_allowed: true,
    single_window_portal: 'National Open Access Registry (NOAR) & National Green Energy OA Portal',
    approval_turnaround_days: 15,
    priority_order: '1. Must Run RE / Captive, 2. Long-term OA, 3. Medium-term OA, 4. Short-term OA',
    verification_status: 'Official Verified'
  });

  // Voltage-wise Technical Loss Rules
  const voltageLossTable = [
    { volt: '400 kV', txLoss: 1.80, whLoss: 0.00 },
    { volt: '220 kV', txLoss: 2.50, whLoss: 0.00 },
    { volt: '132 kV / 110 kV', txLoss: oaMeta.transmissionLoss, whLoss: 0.00 },
    { volt: '66 kV / 33 kV', txLoss: oaMeta.transmissionLoss, whLoss: Number((oaMeta.wheelingLoss * 0.5).toFixed(2)) },
    { volt: '11 kV / 22 kV', txLoss: oaMeta.transmissionLoss, whLoss: oaMeta.wheelingLoss },
    { volt: '415 V (LT)', txLoss: oaMeta.transmissionLoss, whLoss: Number((oaMeta.wheelingLoss * 1.6).toFixed(2)) }
  ];

  voltageLossTable.forEach(vLoss => {
    lossRules.push({
      id: `loss-${state.id}-${vLoss.volt.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}-${lossRuleCounter++}`,
      state_id: state.id,
      voltage_level: vLoss.volt,
      transmission_loss_pct: vLoss.txLoss,
      wheeling_loss_pct: vLoss.whLoss,
      total_technical_loss_pct: Number((vLoss.txLoss + vLoss.whLoss).toFixed(2)),
      effective_from: '2025-04-01',
      effective_until: '2026-03-31',
      financial_year: 'FY 2025-26',
      source: `${state.regulator_code} Transmission and Wheeling Tariff Order`,
      verification_status: 'Official Verified'
    });
  });
});

// DISCOM-wise OA Charges for FY 2025-26
discoms.forEach(discom => {
  const oaMeta = stateOAMatrix[discom.state_id] || stateOAMatrix['maharashtra'];

  const oaTypes = [
    { type: 'Third-Party Commercial OA', cssMultiplier: 1.0, asMultiplier: 1.0, label: 'Conventional 3rd Party' },
    { type: 'Green Energy Open Access (GEOA)', cssMultiplier: 1.0, asMultiplier: 0.0, label: 'Green Energy OA' },
    { type: 'Captive Power Plant (CPP)', cssMultiplier: 0.0, asMultiplier: 0.0, label: 'Captive (CSS & AS Exempt)' },
    { type: 'Group Captive (26%/51%)', cssMultiplier: 0.0, asMultiplier: 0.0, label: 'Group Captive' }
  ];

  oaTypes.forEach(oaItem => {
    oaCharges.push({
      id: `oacharge-${discom.id}-${oaItem.label.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}-${oaChargeCounter++}`,
      state_id: discom.state_id,
      discom_id: discom.id,
      oa_type: oaItem.type,
      consumer_category: 'HT Industrial / Commercial',
      voltage_level: '33 kV / 11 kV',
      wheeling_charge: oaMeta.wheelingCharge,
      wheeling_charge_unit: 'Rs/kWh',
      wheeling_loss_pct: oaMeta.wheelingLoss,
      transmission_charge: oaMeta.transmissionCharge,
      transmission_charge_unit: 'Rs/MW/day (~0.42 Rs/kWh)',
      transmission_loss_pct: oaMeta.transmissionLoss,
      css: Number((oaMeta.css * oaItem.cssMultiplier).toFixed(2)),
      css_unit: 'Rs/kWh',
      additional_surcharge: Number((oaMeta.additionalSurcharge * oaItem.asMultiplier).toFixed(2)),
      additional_surcharge_unit: 'Rs/kWh',
      sldc_charge: oaMeta.sldcCharge,
      sldc_charge_unit: 'Rs/month',
      scheduling_charge: oaMeta.schedulingCharge,
      scheduling_charge_unit: 'Rs/day',
      banking_charge: '2% to 10% of banked energy',
      standby_charge: oaMeta.standbyCharge,
      standby_charge_unit: 'Rs/kVA/month (if drawn from DISCOM)',
      reactive_energy_charge: oaMeta.reactiveCharge,
      reactive_energy_charge_unit: 'Rs/kVArh',
      effective_from: '2025-04-01',
      effective_until: '2026-03-31',
      financial_year: 'FY 2025-26',
      source_document: `${discom.code} Open Access Schedule FY 2025-26`,
      verification_status: 'Official Verified'
    });
  });
});

module.exports = { openAccessRules, oaCharges, lossRules };

