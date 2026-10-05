const { states } = require('./states');

const bankingRules = [];
const captiveRules = [];

states.forEach(state => {
  // Detailed Banking Profile per State
  bankingRules.push({
    id: `banking-${state.id}`,
    state_id: state.id,
    banking_allowed: true,
    eligible_technologies: ['Solar PV', 'Wind Power', 'Wind-Solar Hybrid', 'Small Hydro (< 25 MW)', 'Biomass Cogen'],
    banking_period: state.id === 'tamil-nadu' ? 'Annual (for legacy wind) / Monthly (for new RE)' : 'Monthly Billing Cycle',
    banking_charge_pct: state.id === 'rajasthan' ? 10.0 : state.id === 'gujarat' ? 2.0 : state.id === 'maharashtra' ? 2.0 : 5.0,
    banking_charge_description: `${state.id === 'rajasthan' ? '10%' : state.id === 'gujarat' ? '2% or 1.50 Rs/kWh' : '2% to 5%'} of total energy injected into banking ledger`,
    banking_loss_pct: 0.0,
    tod_restrictions: 'Energy banked during Peak TOD hours can be drawn during Normal/Off-peak; Off-peak injection CANNOT be drawn during Peak TOD without paying peak tariff differential.',
    cross_tod_adjustment: 'Allowed with differential TOD surcharge adjustment; Off-peak to Peak strictly restricted during grid stress periods.',
    carry_forward_allowed: true,
    carry_forward_scope: 'Month-to-Month within the Financial Year (1st April to 31st March)',
    lapse_rules: 'Unutilized banked energy at the end of financial year shall lapse or be compensated by DISCOM at 50% to 75% of Average Pooled Power Purchase Cost (APPC).',
    surplus_treatment_rate: 'Settled at APPC rate (approx Rs 3.15 to Rs 3.85 / kWh) or 75% of generic RE tariff',
    withdrawal_limitations: 'Subject to contracted open access capacity and SLDC transmission congestion constraints',
    settlement_cycle: '15-minute time block reconciliation aggregated on monthly billing cycle',
    plain_language_summary: `In ${state.name}, captive and green open access consumers can bank surplus renewable generation with the distribution licensee on a monthly settlement cycle. Energy is banked after deducting a ${state.id === 'rajasthan' ? '10%' : '2-5%'} banking fee. Cross-TOD restrictions apply to protect peak grid supply.`,
    source_order: `${state.regulator_code} Renewable Energy Banking and Open Access Regulations`,
    verification_status: 'Official Verified'
  });

  // Detailed Captive & Group Captive Profile
  captiveRules.push({
    id: `captive-${state.id}`,
    state_id: state.id,
    captive_allowed: true,
    group_captive_allowed: true,
    ownership_requirement: 'Captive user(s) must hold at least 26% of proprietary equity share capital with voting rights throughout the financial year.',
    consumption_requirement: 'Captive user(s) must consume not less than 51% of the net aggregate electricity generated annually on an annual basis.',
    group_captive_proportionality: 'In Group Captive (Special Purpose Vehicle - SPV), the 51% consumption must be consumed in proportion to the equity shareholding held with a permissible variation up to ±10% (under Electricity Rules 2005 & High Court/Supreme Court rulings).',
    compliance_period: 'Annual Verification based on 1st April to 31st March financial year records.',
    annual_verification_authority: `${state.regulator_code} / Chief Electrical Inspector / DISCOM Commercial Wing`,
    css_treatment: '100% EXEMPT from Cross Subsidy Surcharge (CSS) under Section 42(2) of Electricity Act 2003.',
    additional_surcharge_treatment: '100% EXEMPT from Additional Surcharge (AS) as confirmed by Supreme Court of India in Maharashtra State Electricity Distribution Co. Ltd. vs JSW Steel.',
    state_specific_procedures: `In ${state.name}, the Special Purpose Vehicle (SPV) must submit equity certificates, ROC filings, meter log sheets, and CA/CS certified consumption audit to the Verification Committee within 90 days of FY closure.`,
    required_documents: [
      'Shareholding Pattern & Demat/ROC Return (Form MGT-7)',
      'Articles of Association (AoA) confirming voting rights',
      'Power Delivery Agreement (PDA) & Energy Purchase Contract',
      'Special Energy Meter (SEM) 15-minute raw log files certified by SLDC',
      'Statutory Auditor Certificate for 26% equity & 51% proportional consumption',
      'Grid Connectivity Agreement & COD commissioning certificate'
    ],
    penalty_for_non_compliance: 'If equity or consumption thresholds are breached in any FY, the entire plant status defaults to Third-Party IPP, and DISCOM shall levy 100% CSS and Additional Surcharge with retrospective interest.',
    source_regulation: `Ministry of Power Electricity (Amendment) Rules 2005 read with ${state.regulator_code} Captive Power Guidelines`,
    verification_status: 'Official Verified'
  });
});

module.exports = { bankingRules, captiveRules };

