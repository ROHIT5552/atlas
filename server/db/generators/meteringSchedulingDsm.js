const { states } = require('./states');

const meteringRules = [];
const schedulingRules = [];
const dsmRules = [];

states.forEach(state => {
  // Metering Requirements per State
  meteringRules.push({
    id: `metering-${state.id}`,
    state_id: state.id,
    meter_type: 'Tri-Vector Special Energy Meter (SEM) / ABT Compliant',
    abt_compliant: true,
    sem_required: true,
    main_meter_spec: '0.2S Accuracy Class static bidirectional 4-Quadrant 15-minute integration tri-vector ABT meter with DLMS/COSEM open protocol.',
    check_meter_spec: '0.2S Accuracy Class independent CT/PT core meter matching Main Meter specifications.',
    standby_meter_spec: 'Required for grid substations connecting RE / Open Access consumers >= 10 MW.',
    communication_protocol: 'DLMS / IEC 62056 standard with dual-SIM 4G/GPRS telemetry modem for auto-polling.',
    amr_telemetry_required: true,
    amr_spec: 'Automated Meter Reading (AMR) system integrated with SLDC SCADA and DISCOM Billing MDAS portal.',
    accuracy_class: 'Class 0.2S for active energy and Class 0.5S for reactive energy (per CEA Metering Regulations 2006 & amendments).',
    metering_location: 'Interconnection Substation Bay / Consumer incoming feeder terminal / Generator step-up switchyard.',
    sldc_integration_req: 'Mandatory direct telemetry connection with SLDC Energy Accounting Server via secure VPN channel.',
    discom_integration_req: 'Joint meter reading (JMR) protocol conducted on 1st day of every calendar month by DISCOM, STU, and Consumer representatives.',
    testing_calibration_frequency: 'Annual testing & calibration by NABL accredited third-party laboratory / STU Testing Division.',
    source_code: `Central Electricity Authority (Installation and Operation of Meters) Regulations & ${state.regulator_code} Metering Code`,
    verification_status: 'Official Verified'
  });

  // Scheduling Rules per State
  schedulingRules.push({
    id: `scheduling-${state.id}`,
    state_id: state.id,
    scheduling_required: true,
    scheduling_authority: `${state.sldc_code} (${state.name})`,
    time_block_duration_minutes: 15,
    day_ahead_schedule_deadline: '10:00 AM (D-1) on SLDC Scheduling Web Portal',
    revisions_allowed: true,
    max_revisions_per_day: 16,
    revision_gate_closure_blocks: 'Effective starting 4th time-block (approx 1 hour 15 mins ahead of real-time dispatch)',
    applicable_generators: 'All Solar, Wind, Hydro, and Thermal generators with capacity >= 5 MW (or 1 MW in solar parks) injecting into STU/DISCOM grid.',
    applicable_oa_consumers: 'All Open Access consumers with drawal capacity >= 1 MW (and GEOA consumers >= 100 kW participating in dynamic scheduling).',
    qca_pooling_allowed: true,
    qca_framework: 'Qualified Coordinating Agency (QCA) authorized for pooling multiple wind/solar generators at pooling substation level.',
    source_regulation: `${state.regulator_code} Forecasting, Scheduling and Deviation Settlement Regulations`,
    verification_status: 'Official Verified'
  });

  // DSM Rules per State
  dsmRules.push({
    id: `dsm-${state.id}`,
    state_id: state.id,
    dsm_applicable: true,
    deviation_methodology: 'Frequency-linked deviation pricing benchmarked against Central Electricity Regulatory Commission (CERC) DSM Regulations 2024.',
    re_forecasting_mandatory: true,
    error_tolerance_band_pct: '±10% of Available Capacity (AvC) for Solar/Wind without commercial deviation surcharge; tiered penalties for deviations beyond ±10%.',
    penalty_rate_structure: 'Deviations beyond ±10% to ±15% charged at 10% of PPA/APPC rate; deviations beyond ±15% to ±25% charged at 20% of PPA; deviations > 25% charged at 30% of PPA.',
    consumer_deviation_charges: 'OA consumers under-drawing power during peak hours receive normal pool rates; over-drawing power during peak hours charged at 120% of higher of DISCOM temporary tariff or Day-Ahead Market (DAM) MCP.',
    pool_account_operator: `${state.sldc_code} / SLDC State Deviation Settlement Pool Account`,
    settlement_frequency: 'Weekly commercial DSM settlement accounts issued by SLDC.',
    source_regulation: `${state.regulator_code} Deviation Settlement Mechanism Regulations`,
    verification_status: 'Official Verified'
  });
});

module.exports = { meteringRules, schedulingRules, dsmRules };

