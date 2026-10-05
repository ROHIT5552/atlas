const { states } = require('./states');
const { discoms } = require('./discoms');

// Tariff parameters for major states/discoms
const stateTariffMatrix = {
  maharashtra: {
    baseEnergy: 7.85,
    demandCharge: 480,
    dutyPct: 9.3,
    fac: 0.65,
    pfIncentive: '0.5% rebate on energy charge for every 0.01 PF increase above 0.95 up to unity (1.00 max 3.5% rebate)',
    pfPenalty: '1.0% surcharge for every 0.01 PF drop below 0.90 down to 0.85; 2.0% per 0.01 below 0.85',
    todSlots: [
      { name: 'Night Off-Peak', start: '22:00', end: '06:00', delta: -1.50, type: 'rebate', color: '#10b981' },
      { name: 'Morning Normal', start: '06:00', end: '09:00', delta: 0.00, type: 'normal', color: '#64748b' },
      { name: 'Morning Peak', start: '09:00', end: '12:00', delta: 0.80, type: 'peak', color: '#f59e0b' },
      { name: 'Day Normal', start: '12:00', end: '18:00', delta: 0.00, type: 'normal', color: '#64748b' },
      { name: 'Evening Super Peak', start: '18:00', end: '22:00', delta: 1.10, type: 'super-peak', color: '#ef4444' }
    ]
  },
  gujarat: {
    baseEnergy: 4.45,
    demandCharge: 385,
    dutyPct: 15.0,
    fac: 2.85,
    pfIncentive: '0.5% incentive on energy charges for each 1% improvement in average PF above 95% up to 100%',
    pfPenalty: '1.0% penalty for each 1% drop in average PF below 90% up to 85%; 2.0% below 85%',
    todSlots: [
      { name: 'Night Off-Peak', start: '22:00', end: '06:00', delta: -0.85, type: 'rebate', color: '#10b981' },
      { name: 'Morning Peak', start: '07:00', end: '11:00', delta: 0.85, type: 'peak', color: '#f59e0b' },
      { name: 'Normal Hours', start: '11:00', end: '18:00', delta: 0.00, type: 'normal', color: '#64748b' },
      { name: 'Evening Peak', start: '18:00', end: '22:00', delta: 0.85, type: 'peak', color: '#ef4444' },
      { name: 'Early Morning Normal', start: '06:00', end: '07:00', delta: 0.00, type: 'normal', color: '#64748b' }
    ]
  },
  rajasthan: {
    baseEnergy: 7.30,
    demandCharge: 310,
    dutyPct: 0.60, // Rs/unit or %
    fac: 0.45,
    pfIncentive: '1% rebate on energy bill if power factor is maintained above 0.95 to 0.98; 2% for 0.98 to 1.00',
    pfPenalty: '3% surcharge if PF is between 0.85 to 0.90; 5% surcharge if PF drops below 0.85',
    todSlots: [
      { name: 'Night Off-Peak', start: '23:00', end: '06:00', delta: -1.25, type: 'rebate', color: '#10b981' },
      { name: 'Morning Solar Slot', start: '06:00', end: '17:00', delta: 0.00, type: 'normal', color: '#64748b' },
      { name: 'Evening Peak Slot', start: '17:00', end: '23:00', delta: 1.25, type: 'peak', color: '#ef4444' }
    ]
  },
  karnataka: {
    baseEnergy: 6.90,
    demandCharge: 410,
    dutyPct: 9.0,
    fac: 0.50,
    pfIncentive: '2 paise/kWh for every 0.01 PF improvement above 0.95',
    pfPenalty: '3 paise/kWh for every 0.01 PF deterioration below 0.90 down to 0.85; 5 paise below 0.85',
    todSlots: [
      { name: 'Night Off-Peak', start: '22:00', end: '06:00', delta: -1.00, type: 'rebate', color: '#10b981' },
      { name: 'Normal Hours', start: '06:00', end: '18:00', delta: 0.00, type: 'normal', color: '#64748b' },
      { name: 'Evening Peak', start: '18:00', end: '22:00', delta: 1.00, type: 'peak', color: '#ef4444' }
    ]
  },
  'tamil-nadu': {
    baseEnergy: 6.75,
    demandCharge: 550,
    dutyPct: 6.0,
    fac: 0.35,
    pfIncentive: '0.5% incentive on energy charges for each 0.01 PF above 0.95',
    pfPenalty: '1.0% penalty for each 0.01 PF below 0.90 down to 0.85; 2.0% below 0.85',
    todSlots: [
      { name: 'Morning Peak', start: '06:00', end: '09:00', delta: 1.35, type: 'peak', color: '#f59e0b' },
      { name: 'Day Normal', start: '09:00', end: '18:00', delta: 0.00, type: 'normal', color: '#64748b' },
      { name: 'Evening Peak', start: '18:00', end: '21:00', delta: 1.35, type: 'peak', color: '#ef4444' },
      { name: 'Night Off-Peak', start: '22:00', end: '05:00', delta: -0.68, type: 'rebate', color: '#10b981' },
      { name: 'Transition Hours', start: '05:00', end: '06:00', delta: 0.00, type: 'normal', color: '#64748b' }
    ]
  },
  telangana: {
    baseEnergy: 7.65,
    demandCharge: 475,
    dutyPct: 0.06,
    fac: 0.40,
    pfIncentive: '1.0% discount for PF above 0.95',
    pfPenalty: '2.0% surcharge for PF below 0.90',
    todSlots: [
      { name: 'Night Off-Peak', start: '22:00', end: '06:00', delta: -1.00, type: 'rebate', color: '#10b981' },
      { name: 'Normal Hours', start: '06:00', end: '18:00', delta: 0.00, type: 'normal', color: '#64748b' },
      { name: 'Evening Peak', start: '18:00', end: '22:00', delta: 1.00, type: 'peak', color: '#ef4444' }
    ]
  },
  'andhra-pradesh': {
    baseEnergy: 7.20,
    demandCharge: 475,
    dutyPct: 6.0,
    fac: 0.85,
    pfIncentive: '0.5% incentive for PF > 0.95',
    pfPenalty: '1.5% penalty for PF < 0.90',
    todSlots: [
      { name: 'Night Off-Peak', start: '22:00', end: '06:00', delta: -1.00, type: 'rebate', color: '#10b981' },
      { name: 'Normal Day', start: '06:00', end: '18:00', delta: 0.00, type: 'normal', color: '#64748b' },
      { name: 'Evening Peak', start: '18:00', end: '22:00', delta: 1.00, type: 'peak', color: '#ef4444' }
    ]
  },
  'madhya-pradesh': {
    baseEnergy: 6.65,
    demandCharge: 390,
    dutyPct: 9.0,
    fac: 0.42,
    pfIncentive: '1% rebate on energy charges for PF above 0.95',
    pfPenalty: '2% surcharge for PF below 0.90',
    todSlots: [
      { name: 'Night Off-Peak', start: '22:00', end: '06:00', delta: -1.20, type: 'rebate', color: '#10b981' },
      { name: 'Normal Day', start: '06:00', end: '17:00', delta: 0.00, type: 'normal', color: '#64748b' },
      { name: 'Evening Peak', start: '17:00', end: '22:00', delta: 1.20, type: 'peak', color: '#ef4444' }
    ]
  },
  'uttar-pradesh': {
    baseEnergy: 7.10,
    demandCharge: 360,
    dutyPct: 7.5,
    fac: 0.38,
    pfIncentive: '0.5% rebate for PF > 0.95 up to 0.98; 1% for PF > 0.98',
    pfPenalty: '1% penalty for PF between 0.85-0.90; 2% for PF < 0.85',
    todSlots: [
      { name: 'Summer Night Off-Peak', start: '23:00', end: '05:00', delta: -1.10, type: 'rebate', color: '#10b981' },
      { name: 'Normal Hours', start: '05:00', end: '17:00', delta: 0.00, type: 'normal', color: '#64748b' },
      { name: 'Evening Peak', start: '17:00', end: '23:00', delta: 1.20, type: 'peak', color: '#ef4444' }
    ]
  },
  haryana: {
    baseEnergy: 6.95,
    demandCharge: 330,
    dutyPct: 10.0,
    fac: 0.52,
    pfIncentive: '0.5% rebate on energy charge for each 0.01 above 0.95',
    pfPenalty: '1.0% penalty for each 0.01 below 0.90',
    todSlots: [
      { name: 'Night Off-Peak', start: '22:00', end: '06:00', delta: -1.25, type: 'rebate', color: '#10b981' },
      { name: 'Day Normal', start: '06:00', end: '18:00', delta: 0.00, type: 'normal', color: '#64748b' },
      { name: 'Evening Peak', start: '18:00', end: '22:00', delta: 1.25, type: 'peak', color: '#ef4444' }
    ]
  },
  punjab: {
    baseEnergy: 6.40,
    demandCharge: 340,
    dutyPct: 13.0, // ED + IDF
    fac: 0.44,
    pfIncentive: '0.25% rebate for PF >= 0.95',
    pfPenalty: '0.50% penalty for PF < 0.90',
    todSlots: [
      { name: 'Night Off-Peak (Oct-May)', start: '22:00', end: '06:00', delta: -1.25, type: 'rebate', color: '#10b981' },
      { name: 'Normal Hours', start: '06:00', end: '18:00', delta: 0.00, type: 'normal', color: '#64748b' },
      { name: 'Summer Peak (Jun-Sep)', start: '18:00', end: '22:00', delta: 1.35, type: 'peak', color: '#ef4444' }
    ]
  },
  delhi: {
    baseEnergy: 7.75,
    demandCharge: 250,
    dutyPct: 5.0,
    fac: 0.70, // PPAC
    pfIncentive: '0.5% rebate for PF > 0.95',
    pfPenalty: '1.0% penalty for PF < 0.90',
    todSlots: [
      { name: 'Night Off-Peak', start: '00:00', end: '06:00', delta: -1.50, type: 'rebate', color: '#10b981' },
      { name: 'Normal Hours', start: '06:00', end: '14:00', delta: 0.00, type: 'normal', color: '#64748b' },
      { name: 'Afternoon Peak (Summer)', start: '14:00', end: '17:00', delta: 1.20, type: 'peak', color: '#f59e0b' },
      { name: 'Evening Normal', start: '17:00', end: '21:00', delta: 0.00, type: 'normal', color: '#64748b' },
      { name: 'Night Peak', start: '21:00', end: '24:00', delta: 1.20, type: 'peak', color: '#ef4444' }
    ]
  },
  chhattisgarh: {
    baseEnergy: 6.80,
    demandCharge: 380,
    dutyPct: 8.0,
    fac: 0.35,
    pfIncentive: '1% rebate on energy charge for PF > 0.95',
    pfPenalty: '2% surcharge for PF < 0.90',
    todSlots: [
      { name: 'Night Off-Peak', start: '23:00', end: '05:00', delta: -1.00, type: 'rebate', color: '#10b981' },
      { name: 'Day Normal', start: '05:00', end: '18:00', delta: 0.00, type: 'normal', color: '#64748b' },
      { name: 'Evening Peak', start: '18:00', end: '23:00', delta: 1.20, type: 'peak', color: '#ef4444' }
    ]
  },
  odisha: {
    baseEnergy: 6.10,
    demandCharge: 250,
    dutyPct: 6.0,
    fac: 0.25,
    pfIncentive: '0.5% incentive for PF > 0.95',
    pfPenalty: '1.0% penalty for PF < 0.90',
    todSlots: [
      { name: 'Normal Hours', start: '00:00', end: '06:00', delta: 0.00, type: 'normal', color: '#64748b' },
      { name: 'Day Normal', start: '06:00', end: '18:00', delta: 0.00, type: 'normal', color: '#64748b' },
      { name: 'Evening Peak (6 PM - 12 AM)', start: '18:00', end: '24:00', delta: 0.80, type: 'peak', color: '#ef4444' }
    ]
  },
  'west-bengal': {
    baseEnergy: 7.90,
    demandCharge: 380,
    dutyPct: 5.0,
    fac: 0.40,
    pfIncentive: '0.5% rebate on energy charge for PF above 0.95',
    pfPenalty: '1.0% penalty for PF below 0.90',
    todSlots: [
      { name: 'Normal Hours', start: '06:00', end: '17:00', delta: 0.00, type: 'normal', color: '#64748b' },
      { name: 'Peak Hours', start: '17:00', end: '23:00', delta: 1.50, type: 'peak', color: '#ef4444' },
      { name: 'Off-Peak Hours', start: '23:00', end: '06:00', delta: -1.20, type: 'rebate', color: '#10b981' }
    ]
  },
  uttarakhand: {
    baseEnergy: 6.25,
    demandCharge: 320,
    dutyPct: 0.15, // Rs/unit
    fac: 0.30,
    pfIncentive: '0.5% rebate for PF >= 0.95',
    pfPenalty: '1.0% penalty for PF < 0.90',
    todSlots: [
      { name: 'Morning Peak (Winter)', start: '06:00', end: '09:00', delta: 1.00, type: 'peak', color: '#f59e0b' },
      { name: 'Normal Hours', start: '09:00', end: '18:00', delta: 0.00, type: 'normal', color: '#64748b' },
      { name: 'Evening Peak', start: '18:00', end: '22:00', delta: 1.50, type: 'peak', color: '#ef4444' },
      { name: 'Off-Peak Hours', start: '22:00', end: '06:00', delta: -1.00, type: 'rebate', color: '#10b981' }
    ]
  },
  jharkhand: {
    baseEnergy: 6.70,
    demandCharge: 350,
    dutyPct: 6.0,
    fac: 0.35,
    pfIncentive: '0.5% incentive for PF > 0.95',
    pfPenalty: '1.0% penalty for PF < 0.90',
    todSlots: [
      { name: 'Normal Hours', start: '06:00', end: '17:30', delta: 0.00, type: 'normal', color: '#64748b' },
      { name: 'Peak Hours', start: '17:30', end: '23:00', delta: 1.20, type: 'peak', color: '#ef4444' },
      { name: 'Off-Peak Hours', start: '23:00', end: '06:00', delta: -1.00, type: 'rebate', color: '#10b981' }
    ]
  }
};

const tariffs = [];
const todProfiles = [];

let tariffIdCounter = 1;
let todIdCounter = 1;

// Generate structured tariffs across all DISCOMs and Consumer Categories
discoms.forEach(discom => {
  const stateMeta = stateTariffMatrix[discom.state_id] || stateTariffMatrix['maharashtra'];
  
  const categoriesList = [
    { catId: 'ht-industrial-cont', code: 'HT-IND', name: 'HT Industrial Continuous', conn: 'HT', volt: '33 kV', energyAdj: 0.0, demandAdj: 0 },
    { catId: 'ht-industrial-cont', code: 'HT-IND-11KV', name: 'HT Industrial Continuous (11 kV)', conn: 'HT', volt: '11 kV', energyAdj: 0.35, demandAdj: 20 },
    { catId: 'eht-heavy-industrial', code: 'EHT-IND-132KV', name: 'EHT Heavy Industrial (132 kV)', conn: 'EHT', volt: '132 kV', energyAdj: -0.40, demandAdj: -30 },
    { catId: 'ht-commercial', code: 'HT-COMM', name: 'HT Commercial / Non-Domestic', conn: 'HT', volt: '11 kV', energyAdj: 1.20, demandAdj: 50 },
    { catId: 'lt-industrial-md', code: 'LT-IND-MD', name: 'LT Industrial Demand Metered', conn: 'LT', volt: '415 V', energyAdj: 0.50, demandAdj: -80 },
    { catId: 'ev-charging-station', code: 'EV-CHARGING', name: 'Public EV Charging Station', conn: 'HT', volt: '11 kV', energyAdj: -0.80, demandAdj: -150 }
  ];

  const fyList = [
    { fy: 'FY 2025-26', from: '2025-04-01', until: '2026-03-31', status: 'Official Verified', multiplier: 1.0 },
    { fy: 'FY 2024-25', from: '2024-04-01', until: '2025-03-31', status: 'Superseded', multiplier: 0.96 },
    { fy: 'FY 2026-27 (Draft)', from: '2026-04-01', until: '2027-03-31', status: 'Pending Verification', multiplier: 1.04 }
  ];

  categoriesList.forEach(cat => {
    fyList.forEach(fyItem => {
      const energyRate = Number(((stateMeta.baseEnergy + cat.energyAdj) * fyItem.multiplier).toFixed(2));
      const demandRate = Math.round((stateMeta.demandCharge + cat.demandAdj) * fyItem.multiplier);

      tariffs.push({
        id: `tariff-${discom.id}-${cat.code.toLowerCase()}-${fyItem.fy.split(' ')[0].toLowerCase()}-${tariffIdCounter++}`,
        state_id: discom.state_id,
        discom_id: discom.id,
        consumer_category_id: cat.catId,
        tariff_category_code: cat.code,
        tariff_category_name: `${discom.code} - ${cat.name}`,
        connection_type: cat.conn,
        voltage_level: cat.volt,
        energy_charge: energyRate,
        energy_charge_unit: 'Rs/kVAh',
        demand_charge: demandRate,
        demand_charge_unit: 'Rs/kVA/month',
        fixed_charge: 0,
        fixed_charge_unit: 'Rs/month',
        tod_applicable: true,
        power_factor_incentive: stateMeta.pfIncentive,
        power_factor_penalty: stateMeta.pfPenalty,
        fac_fppas: stateMeta.fac,
        electricity_duty: stateMeta.dutyPct,
        electricity_duty_unit: stateMeta.dutyPct > 2 ? '%' : 'Rs/unit',
        other_cess: 0.12,
        other_cess_description: 'Green Energy Cess / Municipal Tax',
        effective_from: fyItem.from,
        effective_until: fyItem.until,
        financial_year: fyItem.fy,
        source_document: discom.tariff_order_ref,
        source_page: 'Chapter 5, Schedule of Tariffs',
        verification_status: fyItem.status,
        notes: `Structured retail tariff schedule for ${cat.name} at ${cat.volt} under ${discom.code} jurisdiction.`
      });
    });
  });

  // TOD Profile for DISCOM
  todProfiles.push({
    id: `tod-${discom.id}-${todIdCounter++}`,
    state_id: discom.state_id,
    discom_id: discom.id,
    tariff_category_code: 'HT-IND',
    season: 'Annual / All Seasons',
    effective_from: '2025-04-01',
    effective_until: '2026-03-31',
    slots: stateMeta.todSlots.map((slot, idx) => ({
      slot_index: idx + 1,
      slot_name: slot.name,
      start_time: slot.start,
      end_time: slot.end,
      tariff_addition: slot.delta > 0 ? slot.delta : 0.0,
      tariff_rebate: slot.delta < 0 ? Math.abs(slot.delta) : 0.0,
      rate_delta: slot.delta,
      unit: 'Rs/kWh',
      type: slot.type,
      color: slot.color
    })),
    source: discom.tariff_order_ref,
    verification_status: 'Official Verified'
  });
});

module.exports = { tariffs, todProfiles };

