/**
 * Utility functions for exporting NewRa Atlas regulatory data to CSV / Excel spreadsheets.
 */

export function downloadCSV(csvContent, fileName = 'newra-atlas-export.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportPassportToCSV(passport) {
  if (!passport) return;

  const rows = [
    ['NEWRA ATLAS - GES REGULATORY PASSPORT'],
    ['Passport URN', passport.passport_urn],
    ['Generated At', passport.generated_at],
    ['Verification Status', passport.verification_status],
    [],
    ['1. ENTITY & GRID NODE'],
    ['GES ID', passport.entity.ges_id],
    ['Consumer Name', passport.entity.consumer_name],
    ['State Jurisdiction', passport.entity.state],
    ['Electricity Regulator', passport.entity.regulator],
    ['Host DISCOM', passport.entity.discom],
    ['Contract Demand (kVA)', passport.entity.contract_demand_kva],
    ['Contract Demand (MW)', passport.entity.contract_demand_mw],
    ['Supply Voltage', passport.entity.voltage_code],
    ['Generation Technology', passport.entity.technology],
    [],
    ['2. TARIFF & BILLING PARAMETERS (FEED TO NEWRA LENS)'],
    ['Tariff Category', passport.tariff_and_billing.category_name],
    ['Financial Year', passport.tariff_and_billing.financial_year],
    ['Base Energy Charge (Rs/unit)', passport.tariff_and_billing.base_energy_charge_rs_unit],
    ['Energy Unit', passport.tariff_and_billing.energy_unit],
    ['Demand Charge (Rs/kVA/mo)', passport.tariff_and_billing.demand_charge_rs_kva_mo],
    ['Billing Demand Formula', `"${passport.tariff_and_billing.billing_demand_rule}"`],
    ['Electricity Duty (%)', passport.tariff_and_billing.electricity_duty_pct],
    ['FAC / FPPAS (Rs/kWh)', passport.tariff_and_billing.fac_fppas_rs_kwh],
    ['PF Incentive Rule', `"${passport.tariff_and_billing.power_factor_incentive}"`],
    ['PF Penalty Rule', `"${passport.tariff_and_billing.power_factor_penalty}"`],
    [],
    ['3. OPEN ACCESS & LANDED COST (FEED TO GRIDFLEX)'],
    ['Wheeling Charge (Rs/kWh)', passport.open_access_and_landed.wheeling_charge_rs_kwh],
    ['Transmission Charge (Rs/MW/day)', passport.open_access_and_landed.transmission_charge_rs_mw_day],
    ['Cross-Subsidy Surcharge (CSS) (Rs/kWh)', passport.open_access_and_landed.cross_subsidy_surcharge_rs_kwh],
    ['Additional Surcharge (AS) (Rs/kWh)', passport.open_access_and_landed.additional_surcharge_rs_kwh],
    ['Net Captive Exemption Savings (Rs/kWh)', passport.open_access_and_landed.captive_exemption_savings_rs_kwh],
    [],
    ['4. TECHNICAL LOSSES & GROSS-UP'],
    ['STU Transmission Loss (%)', passport.technical_losses.stu_transmission_loss_pct],
    ['DISCOM Wheeling Loss (%)', passport.technical_losses.discom_wheeling_loss_pct],
    ['Total Technical Loss (%)', passport.technical_losses.total_loss_pct],
    ['Loss Gross-Up Multiplier', passport.technical_losses.loss_gross_up_multiplier],
    [],
    ['5. RE BANKING & SETTLEMENT (FEED TO VPP & LEDGER)'],
    ['Banking Period', passport.banking_and_settlement.banking_period],
    ['In-Kind Deduction (%)', passport.banking_and_settlement.in_kind_deduction_pct],
    ['TOD Drawal Restrictions', `"${passport.banking_and_settlement.tod_restrictions}"`],
    ['APPC Surplus Cashout Rate (Rs/kWh)', passport.banking_and_settlement.appc_surplus_cashout_rate_rs_kwh],
    ['Settlement Cycle', passport.banking_and_settlement.settlement_cycle],
    [],
    ['6. STATUTORY COMPLIANCE MANDATES (FEED TO NEWRA GUARD)'],
    ['Captive Minimum Equity (%)', passport.compliance_mandates.captive_equity_threshold_pct],
    ['Captive Minimum Consumption (%)', passport.compliance_mandates.captive_consumption_threshold_pct],
    ['Metering Specification', `"${passport.compliance_mandates.metering_specification}"`],
    ['SLDC Telemetry Requirement', `"${passport.compliance_mandates.sldc_telemetry}"`],
    ['Governing Tariff Order', `"${passport.compliance_mandates.governing_order}"`]
  ];

  const csvString = rows.map(r => r.join(',')).join('\n');
  const filename = `${passport.entity.ges_id}_Regulatory_Passport_${passport.entity.state}.csv`;
  downloadCSV(csvString, filename);
}