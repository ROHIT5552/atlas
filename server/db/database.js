const fs = require('fs');
const path = require('path');

const seedDir = path.join(__dirname, 'seedData');

// Load in-memory database from JSON seed data
function loadJSON(filename) {
  const filePath = path.join(seedDir, filename);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return [];
}

const db = {
  states: loadJSON('states.json'),
  discoms: loadJSON('discoms.json'),
  consumerCategories: loadJSON('consumerCategories.json'),
  connectionTypes: loadJSON('connectionTypes.json'),
  voltageLevels: loadJSON('voltageLevels.json'),
  tariffs: loadJSON('tariffs.json'),
  todProfiles: loadJSON('todProfiles.json'),
  openAccessRules: loadJSON('openAccessRules.json'),
  oaCharges: loadJSON('oaCharges.json'),
  lossRules: loadJSON('lossRules.json'),
  bankingRules: loadJSON('bankingRules.json'),
  captiveRules: loadJSON('captiveRules.json'),
  meteringRules: loadJSON('meteringRules.json'),
  schedulingRules: loadJSON('schedulingRules.json'),
  dsmRules: loadJSON('dsmRules.json'),
  regulatoryDocuments: loadJSON('regulatoryDocuments.json'),
  auditLogs: [
    {
      id: 'audit-init',
      entity_type: 'System',
      entity_id: 'SYSTEM_INIT',
      action: 'INIT',
      user: 'System Admin (NewRa Data Team)',
      timestamp: new Date().toISOString(),
      details: 'Initial seed datasets loaded for 17 Indian States and 49 DISCOMs.'
    }
  ]
};

// Helper to normalize and compare IDs (handling hyphens, underscores, and casing)
const normId = (id) => (id ? String(id).toLowerCase().replace(/_/g, '-').trim() : '');
const matchId = (a, b) => normId(a) === normId(b);

// Helper queries
const queryEngine = {
  // Get all states with DISCOM summary
  getStates(filters = {}) {
    let result = db.states;
    if (filters.region) {
      result = result.filter(s => s.region.toLowerCase() === filters.region.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q) || s.state_code.toLowerCase().includes(q) || s.regulator_code.toLowerCase().includes(q));
    }
    return result;
  },

  getStateById(id) {
    if (!id) return null;
    const state = db.states.find(s => matchId(s.id, id) || matchId(s.state_code, id));
    if (!state) return null;
    const discomList = db.discoms.filter(d => matchId(d.state_id, state.id));
    const documents = db.regulatoryDocuments.filter(doc => matchId(doc.state_id, state.id));
    const oaRule = db.openAccessRules.find(r => matchId(r.state_id, state.id));
    const bankingRule = db.bankingRules.find(r => matchId(r.state_id, state.id));
    const captiveRule = db.captiveRules.find(r => matchId(r.state_id, state.id));
    const meteringRule = db.meteringRules.find(m => matchId(m.state_id, state.id));
    const schedulingRule = db.schedulingRules.find(s => matchId(s.state_id, state.id));
    const dsmRule = db.dsmRules.find(r => matchId(r.state_id, state.id));
    const lossList = db.lossRules.filter(l => matchId(l.state_id, state.id));

    return {
      ...state,
      discoms: discomList,
      documents,
      open_access_rules: oaRule,
      banking_rules: bankingRule,
      captive_rules: captiveRule,
      metering_rules: meteringRule,
      scheduling_rules: schedulingRule,
      dsm_rules: dsmRule,
      loss_rules: lossList
    };
  },

  getDiscoms(filters = {}) {
    let result = db.discoms;
    if (filters.state_id) {
      result = result.filter(d => matchId(d.state_id, filters.state_id));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(d => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.service_territory.toLowerCase().includes(q));
    }
    return result;
  },

  getDiscomById(id) {
    if (!id) return null;
    const discom = db.discoms.find(d => matchId(d.id, id) || matchId(d.code, id));
    if (!discom) return null;
    const state = db.states.find(s => matchId(s.id, discom.state_id));
    const discomTariffs = db.tariffs.filter(t => matchId(t.discom_id, discom.id));
    const todProfile = db.todProfiles.find(p => matchId(p.discom_id, discom.id));
    const oaChargesList = db.oaCharges.filter(c => matchId(c.discom_id, discom.id));
    const documents = db.regulatoryDocuments.filter(doc => matchId(doc.state_id, discom.state_id));

    return {
      ...discom,
      state,
      tariffs: discomTariffs,
      tod_profile: todProfile,
      oa_charges: oaChargesList,
      documents
    };
  },

  getTariffs(filters = {}) {
    let result = db.tariffs;
    if (filters.state_id) result = result.filter(t => matchId(t.state_id, filters.state_id));
    if (filters.discom_id) result = result.filter(t => matchId(t.discom_id, filters.discom_id));
    if (filters.consumer_category_id) result = result.filter(t => t.consumer_category_id === filters.consumer_category_id);
    if (filters.financial_year) result = result.filter(t => t.financial_year.includes(filters.financial_year));
    if (filters.voltage_level) result = result.filter(t => t.voltage_level === filters.voltage_level);
    if (filters.connection_type) result = result.filter(t => t.connection_type === filters.connection_type);
    if (filters.verification_status) result = result.filter(t => t.verification_status === filters.verification_status);
    return result;
  },

  getTodProfiles(filters = {}) {
    let result = db.todProfiles;
    if (filters.state_id) result = result.filter(p => matchId(p.state_id, filters.state_id));
    if (filters.discom_id) result = result.filter(p => matchId(p.discom_id, filters.discom_id));
    return result;
  },

  getOpenAccessRules(state_id) {
    if (state_id) return db.openAccessRules.find(r => matchId(r.state_id, state_id)) || null;
    return db.openAccessRules;
  },

  getOaCharges(filters = {}) {
    let result = db.oaCharges;
    if (filters.state_id) result = result.filter(c => matchId(c.state_id, filters.state_id));
    if (filters.discom_id) result = result.filter(c => matchId(c.discom_id, filters.discom_id));
    if (filters.oa_type) result = result.filter(c => c.oa_type.toLowerCase().includes(filters.oa_type.toLowerCase()));
    return result;
  },

  getLossRules(filters = {}) {
    let result = db.lossRules;
    if (filters.state_id) result = result.filter(l => matchId(l.state_id, filters.state_id));
    if (filters.voltage_level) result = result.filter(l => l.voltage_level === filters.voltage_level);
    return result;
  },

  getBankingRules(state_id) {
    if (state_id) return db.bankingRules.find(b => matchId(b.state_id, state_id)) || null;
    return db.bankingRules;
  },

  getCaptiveRules(state_id) {
    if (state_id) return db.captiveRules.find(c => matchId(c.state_id, state_id)) || null;
    return db.captiveRules;
  },

  getMeteringRules(state_id) {
    if (state_id) return db.meteringRules.find(m => matchId(m.state_id, state_id)) || null;
    return db.meteringRules;
  },

  getSchedulingRules(state_id) {
    if (state_id) return db.schedulingRules.find(s => matchId(s.state_id, state_id)) || null;
    return db.schedulingRules;
  },

  getDsmRules(state_id) {
    if (state_id) return db.dsmRules.find(d => matchId(d.state_id, state_id)) || null;
    return db.dsmRules;
  },

  getRegulatoryDocuments(filters = {}) {
    let result = db.regulatoryDocuments;
    if (filters.state_id) result = result.filter(doc => matchId(doc.state_id, filters.state_id));
    if (filters.category) result = result.filter(doc => doc.document_category.toLowerCase() === filters.category.toLowerCase());
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(doc => doc.title.toLowerCase().includes(q) || doc.summary.toLowerCase().includes(q) || doc.document_number.toLowerCase().includes(q));
    }
    return result;
  },

  // UNIFIED REGULATORY PROFILE ENDPOINT (Core NewRa Query Engine)
  getRegulatoryProfile(params = {}) {
    const { state_id, discom_id, consumer_category_id, voltage_level, connection_type, financial_year = 'FY 2025-26' } = params;

    const state = (state_id ? db.states.find(s => matchId(s.id, state_id) || matchId(s.state_code, state_id)) : null) || db.states[0];
    const discom = (discom_id ? db.discoms.find(d => matchId(d.id, discom_id) && matchId(d.state_id, state.id)) : null) || db.discoms.find(d => matchId(d.state_id, state.id)) || db.discoms[0];
    
    // Find matching tariff
    let matchingTariff = db.tariffs.find(t => 
      matchId(t.discom_id, discom.id) &&
      (consumer_category_id ? t.consumer_category_id === consumer_category_id : true) &&
      (voltage_level ? t.voltage_level === voltage_level : true) &&
      t.financial_year.includes(financial_year)
    );

    if (!matchingTariff) {
      matchingTariff = db.tariffs.find(t => matchId(t.discom_id, discom.id) && t.financial_year.includes(financial_year)) || db.tariffs[0];
    }

    const todProfile = db.todProfiles.find(p => matchId(p.discom_id, discom.id)) || db.todProfiles.find(p => matchId(p.state_id, state.id));
    const oaRule = db.openAccessRules.find(r => matchId(r.state_id, state.id));
    const oaCharges = db.oaCharges.filter(c => matchId(c.discom_id, discom.id));
    const lossRules = db.lossRules.filter(l => matchId(l.state_id, state.id));
    const matchingLoss = lossRules.find(l => voltage_level && l.voltage_level.includes(voltage_level)) || lossRules[0];
    const banking = db.bankingRules.find(b => matchId(b.state_id, state.id));
    const captive = db.captiveRules.find(c => matchId(c.state_id, state.id));
    const metering = db.meteringRules.find(m => matchId(m.state_id, state.id));
    const scheduling = db.schedulingRules.find(s => matchId(s.state_id, state.id));
    const dsm = db.dsmRules.find(d => matchId(d.state_id, state.id));
    const documents = db.regulatoryDocuments.filter(doc => matchId(doc.state_id, state.id));

    return {
      query: {
        state_id: state.id,
        state_name: state.name,
        discom_id: discom.id,
        discom_name: discom.short_name,
        consumer_category_id: consumer_category_id || matchingTariff.consumer_category_id,
        voltage_level: voltage_level || matchingTariff.voltage_level,
        connection_type: connection_type || matchingTariff.connection_type,
        financial_year
      },
      state_master: state,
      discom_master: discom,
      applicable_tariff: matchingTariff,
      tod_profile: todProfile,
      open_access_eligibility: oaRule,
      oa_charges_breakdown: oaCharges,
      grid_losses: {
        matching_loss: matchingLoss,
        all_voltage_losses: lossRules
      },
      banking_framework: banking,
      captive_framework: captive,
      metering_requirements: metering,
      scheduling_requirements: scheduling,
      dsm_rules: dsm,
      regulatory_source_documents: documents,
      timestamp: new Date().toISOString(),
      schema_version: '1.0.0'
    };
  },

  // GLOBAL MULTI-DIMENSIONAL SEARCH
  search(query) {
    if (!query || query.trim() === '') return { results: [] };
    const q = query.toLowerCase().trim();
    const tokens = q.split(' ').filter(t => t.length > 0);

    const matches = [];

    // 1. Search states
    db.states.forEach(state => {
      const match = tokens.some(t => 
        state.name.toLowerCase().includes(t) || 
        state.regulator_code.toLowerCase().includes(t) || 
        state.state_code.toLowerCase().includes(t) ||
        state.region.toLowerCase().includes(t)
      );
      if (match) {
        matches.push({
          type: 'State',
          title: `${state.name} (${state.state_code})`,
          subtitle: `Regulator: ${state.regulator_code} | STU: ${state.stu_code} | SLDC: ${state.sldc_code}`,
          url: `/states/${state.id}`,
          state_id: state.id,
          badge: state.status
        });
      }
    });

    // 2. Search DISCOMs
    db.discoms.forEach(discom => {
      const match = tokens.some(t => 
        discom.name.toLowerCase().includes(t) || 
        discom.code.toLowerCase().includes(t) || 
        discom.service_territory.toLowerCase().includes(t) ||
        (discom.ownership_type && discom.ownership_type.toLowerCase().includes(t))
      );
      if (match) {
        matches.push({
          type: 'DISCOM',
          title: `${discom.code} - ${discom.name}`,
          subtitle: `Territory: ${discom.service_territory} | Tariff Order: ${discom.tariff_order_ref}`,
          url: `/discoms/${discom.id}`,
          state_id: discom.state_id,
          discom_id: discom.id,
          badge: discom.status
        });
      }
    });

    // 3. Search Tariffs (Search all tariffs, not pre-sliced)
    db.tariffs.forEach(tariff => {
      const match = tokens.some(t => 
        tariff.tariff_category_name.toLowerCase().includes(t) ||
        tariff.voltage_level.toLowerCase().includes(t) ||
        tariff.state_id.toLowerCase().includes(t) ||
        tariff.discom_id.toLowerCase().includes(t) ||
        (tariff.connection_type && tariff.connection_type.toLowerCase().includes(t))
      );

      if (match) {
        matches.push({
          type: 'Tariff',
          title: `${tariff.tariff_category_name} (${tariff.voltage_level})`,
          subtitle: `Energy: Rs ${tariff.energy_charge}/kVAh | Demand: Rs ${tariff.demand_charge}/kVA/m | FY: ${tariff.financial_year}`,
          url: `/tariffs?state=${tariff.state_id}&discom=${tariff.discom_id}`,
          state_id: tariff.state_id,
          discom_id: tariff.discom_id,
          badge: tariff.verification_status
        });
      }
    });

    // 4. Search Open Access Rules & Charges
    db.openAccessRules.forEach(oa => {
      const match = tokens.some(t => 
        oa.state_id.toLowerCase().includes(t) ||
        (oa.green_energy_oa_framework && oa.green_energy_oa_framework.toLowerCase().includes(t)) ||
        (oa.energy_settlement_framework && oa.energy_settlement_framework.toLowerCase().includes(t)) ||
        'open access'.includes(t) || 'geoa'.includes(t)
      );
      if (match) {
        matches.push({
          type: 'Regulation',
          title: `Open Access Rules — ${oa.state_id.toUpperCase()}`,
          subtitle: `Conventional: ≥ ${oa.oa_threshold_conventional_mw} MW | GEOA: ≥ ${oa.oa_threshold_green_energy_kw} kW`,
          url: `/open-access?state=${oa.state_id}`,
          state_id: oa.state_id,
          badge: oa.verification_status
        });
      }
    });

    db.oaCharges.forEach(ch => {
      const match = tokens.some(t => 
        (ch.oa_type && ch.oa_type.toLowerCase().includes(t)) ||
        (ch.wheeling_charge && 'wheeling'.includes(t)) ||
        (ch.css && 'css cross subsidy'.includes(t)) ||
        (ch.additional_surcharge && 'additional surcharge as'.includes(t))
      );
      if (match) {
        matches.push({
          type: 'Tariff',
          title: `${ch.discom_id.toUpperCase()} — ${ch.oa_type}`,
          subtitle: `Wheeling: Rs ${ch.wheeling_charge}/kWh | CSS: Rs ${ch.css}/kWh | AS: Rs ${ch.additional_surcharge}/kWh`,
          url: `/open-access?state=${ch.state_id}`,
          state_id: ch.state_id,
          discom_id: ch.discom_id,
          badge: ch.verification_status
        });
      }
    });

    // 5. Search Banking Rules
    db.bankingRules.forEach(b => {
      const match = tokens.some(t => 
        b.state_id.toLowerCase().includes(t) ||
        (b.applicable_sources && b.applicable_sources.toLowerCase().includes(t)) ||
        (b.banking_period && b.banking_period.toLowerCase().includes(t)) ||
        'banking'.includes(t) || 'solar'.includes(t) || 'wind'.includes(t)
      );
      if (match) {
        matches.push({
          type: 'Regulation',
          title: `RE Banking Rules — ${b.state_id.toUpperCase()}`,
          subtitle: `Period: ${b.banking_period} | Charge: ${b.banking_charge_pct}% | Sources: ${b.applicable_sources}`,
          url: `/banking?state=${b.state_id}`,
          state_id: b.state_id,
          badge: b.verification_status
        });
      }
    });

    // 6. Search Documents
    db.regulatoryDocuments.forEach(doc => {
      const match = tokens.some(t => 
        doc.title.toLowerCase().includes(t) || 
        doc.summary.toLowerCase().includes(t) || 
        doc.document_number.toLowerCase().includes(t) ||
        doc.document_category.toLowerCase().includes(t) ||
        doc.authority.toLowerCase().includes(t)
      );
      if (match) {
        matches.push({
          type: 'Regulation',
          title: doc.title,
          subtitle: `${doc.document_category} | ${doc.authority} | No: ${doc.document_number}`,
          url: `/regulations?state=${doc.state_id}`,
          state_id: doc.state_id,
          badge: doc.verification_badge
        });
      }
    });

    // Deduplicate and return top 25 results
    const seen = new Set();
    const uniqueMatches = [];
    for (const m of matches) {
      const key = `${m.type}-${m.title}-${m.state_id || ''}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMatches.push(m);
      }
    }

    return {
      query,
      count: uniqueMatches.length,
      results: uniqueMatches.slice(0, 25)
    };
  },

  // COMPARISON ENGINE
  compare(type = 'state', ids = []) {
    if (type === 'state') {
      const stateList = ids.map(id => db.states.find(s => matchId(s.id, id) || matchId(s.state_code, id))).filter(Boolean);
      const comparisonMatrix = stateList.map(state => {
        const discomsInState = db.discoms.filter(d => matchId(d.state_id, state.id));
        const tariffsInState = db.tariffs.filter(t => matchId(t.state_id, state.id) && t.financial_year === 'FY 2025-26' && t.consumer_category_id === 'ht-industrial-cont');
        const avgEnergyCharge = tariffsInState.length ? (tariffsInState.reduce((acc, t) => acc + t.energy_charge, 0) / tariffsInState.length).toFixed(2) : 'N/A';
        const avgDemandCharge = tariffsInState.length ? Math.round(tariffsInState.reduce((acc, t) => acc + t.demand_charge, 0) / tariffsInState.length) : 'N/A';
        const oaCharges = db.oaCharges.filter(c => matchId(c.state_id, state.id));
        const avgWheelingCharge = oaCharges.length ? oaCharges[0].wheeling_charge : 'N/A';
        const avgCSS = oaCharges.length ? oaCharges[0].css : 'N/A';
        const avgAS = oaCharges.length ? oaCharges[0].additional_surcharge : 'N/A';
        const banking = db.bankingRules.find(b => matchId(b.state_id, state.id));
        const captive = db.captiveRules.find(c => matchId(c.state_id, state.id));
        const losses = db.lossRules.filter(l => matchId(l.state_id, state.id) && l.voltage_level.includes('33 kV'));
        const txLoss = losses.length ? losses[0].transmission_loss_pct : '3.20%';
        const whLoss = losses.length ? losses[0].wheeling_loss_pct : '4.50%';

        return {
          state_id: state.id,
          state_name: state.name,
          state_code: state.state_code,
          regulator: state.regulator_code,
          discom_count: discomsInState.length,
          avg_ht_energy_charge_rs_kvah: avgEnergyCharge,
          avg_demand_charge_rs_kva_month: avgDemandCharge,
          wheeling_charge_rs_kwh: avgWheelingCharge,
          wheeling_loss_pct: whLoss,
          transmission_loss_pct: txLoss,
          cross_subsidy_surcharge_rs_kwh: avgCSS,
          additional_surcharge_rs_kwh: avgAS,
          banking_allowed: banking ? banking.banking_allowed : true,
          banking_charge_pct: banking ? banking.banking_charge_pct : 2.0,
          banking_period: banking ? banking.banking_period : 'Monthly',
          captive_css_exemption: captive ? captive.css_treatment : 'Exempt',
          geoa_threshold_kw: 100,
          conventional_oa_threshold_mw: 1.0,
          status: state.status
        };
      });

      return { type: 'state', count: comparisonMatrix.length, matrix: comparisonMatrix };
    } else if (type === 'discom') {
      const discomList = ids.map(id => db.discoms.find(d => matchId(d.id, id) || matchId(d.code, id))).filter(Boolean);
      const matrix = discomList.map(discom => {
        const state = db.states.find(s => matchId(s.id, discom.state_id));
        const htTariff = db.tariffs.find(t => matchId(t.discom_id, discom.id) && t.financial_year === 'FY 2025-26' && t.consumer_category_id === 'ht-industrial-cont') || db.tariffs.find(t => matchId(t.discom_id, discom.id));
        const oaCharge = db.oaCharges.find(c => matchId(c.discom_id, discom.id) && c.oa_type.includes('Third-Party')) || db.oaCharges.find(c => matchId(c.discom_id, discom.id));

        return {
          discom_id: discom.id,
          discom_name: discom.name,
          discom_code: discom.code,
          state_name: state ? state.name : discom.state_id,
          ownership: discom.ownership_type,
          service_territory: discom.service_territory,
          energy_charge_rs_kvah: htTariff ? htTariff.energy_charge : 'N/A',
          demand_charge_rs_kva_m: htTariff ? htTariff.demand_charge : 'N/A',
          wheeling_charge_rs_kwh: oaCharge ? oaCharge.wheeling_charge : 'N/A',
          wheeling_loss_pct: oaCharge ? oaCharge.wheeling_loss_pct : 'N/A',
          css_rs_kwh: oaCharge ? oaCharge.css : 'N/A',
          as_rs_kwh: oaCharge ? oaCharge.additional_surcharge : 'N/A',
          tariff_order_ref: discom.tariff_order_ref,
          status: discom.status
        };
      });

      return { type: 'discom', count: matrix.length, matrix };
    }
  },

  // KPI STATS FOR DASHBOARD
  getStats() {
    const totalStates = db.states.length;
    const totalDiscoms = db.discoms.length;
    const totalTariffPlans = db.tariffs.length;
    const totalDocuments = db.regulatoryDocuments.length;
    const verifiedTariffs = db.tariffs.filter(t => t.verification_status === 'Official Verified').length;
    const pendingTariffs = db.tariffs.filter(t => t.verification_status === 'Pending Verification').length;
    const verifiedPct = Math.round((verifiedTariffs / totalTariffPlans) * 100);

    const recentlyUpdatedStates = db.states.slice(0, 6).map(s => ({
      id: s.id,
      name: s.name,
      code: s.state_code,
      regulator: s.regulator_code,
      discoms: s.discom_count,
      last_updated: s.last_updated,
      status: s.status
    }));

    return {
      states_covered: totalStates,
      discoms_covered: totalDiscoms,
      tariff_schedules: totalTariffPlans,
      active_regulations: totalDocuments,
      verified_data_pct: verifiedPct,
      pending_verification_count: pendingTariffs,
      recently_updated_states: recentlyUpdatedStates,
      system_status: 'Online & API Ready'
    };
  },

  // ADMIN RECORD UPDATE & AUDIT
  updateRecord(entityType, entityId, updatedFields, user = 'Admin') {
    const tableKeyMap = {
      tariff: 'tariffs',
      tariffs: 'tariffs',
      state: 'states',
      states: 'states',
      discom: 'discoms',
      discoms: 'discoms',
      banking: 'bankingRules',
      captive: 'captiveRules',
      metering: 'meteringRules',
      scheduling: 'schedulingRules',
      dsm: 'dsmRules',
      document: 'regulatoryDocuments',
      documents: 'regulatoryDocuments'
    };
    const resolvedKey = tableKeyMap[entityType.toLowerCase()] || entityType;
    const targetTable = db[resolvedKey];
    if (!targetTable || !Array.isArray(targetTable)) {
      throw new Error(`Invalid entity type: ${entityType}`);
    }
    const idx = targetTable.findIndex(item => matchId(item.id, entityId));
    if (idx === -1) {
      throw new Error(`Record with ID ${entityId} not found in ${resolvedKey}`);
    }
    const oldRecord = { ...targetTable[idx] };
    targetTable[idx] = { ...oldRecord, ...updatedFields };

    const auditEntry = {
      id: `audit-${Date.now()}`,
      entity_type: entityType,
      entity_id: entityId,
      action: 'UPDATE',
      user,
      timestamp: new Date().toISOString(),
      details: `Updated fields: ${Object.keys(updatedFields).join(', ')}`,
      old_data: oldRecord,
      new_data: targetTable[idx]
    };
    db.auditLogs.unshift(auditEntry);

    return { success: true, record: targetTable[idx], audit: auditEntry };
  },

  // ==========================================
  // NEWRA ATLAS SSoT ENGINES & DOWNSTREAM APIS
  // ==========================================

  // Engine 4: Consumer Eligibility Checker (GES)
  checkConsumerEligibility({ state_id, discom_id, contract_demand_kva, voltage_code }) {
    const cd = Number(contract_demand_kva) || 1000;
    const cdMw = cd / 1000;
    const state = db.states.find(s => matchId(s.id, state_id) || matchId(s.state_code, state_id)) || db.states[0];
    const discom = db.discoms.find(d => matchId(d.id, discom_id)) || db.discoms.find(d => matchId(d.state_id, state.id)) || db.discoms[0];
    const oaCharge = db.oaCharges.find(o => matchId(o.discom_id, discom.id) && matchId(o.voltage_code, voltage_code)) || db.oaCharges[0];
    const captive = db.captiveRules.find(c => matchId(c.state_id, state.id)) || db.captiveRules[0];

    // Conventional OA: >= 1 MW (1000 kVA)
    const conventionalOaEligible = cd >= 1000;
    // Green Energy OA (GEOA): >= 100 kW (100 kVA)
    const geoaEligible = cd >= 100;
    // Captive / Group Captive eligibility
    const captiveEligible = geoaEligible; // Any consumer eligible for OA can participate in captive

    // Voltage sanity check per state supply code
    let voltageCompliant = true;
    let recommendedVoltage = '11 kV';
    if (cd > 5000) {
      recommendedVoltage = '33 kV or 66 kV';
      if (voltage_code === '11 kV' || voltage_code === '415 V') voltageCompliant = false;
    } else if (cd > 1500) {
      recommendedVoltage = '33 kV';
    } else if (cd >= 100) {
      recommendedVoltage = '11 kV';
    }

    return {
      ges_query: {
        state: state.name,
        discom: discom.name,
        contract_demand_kva: cd,
        contract_demand_mw: cdMw,
        voltage: voltage_code || '33 kV'
      },
      eligibility: {
        conventional_open_access: {
          eligible: conventionalOaEligible,
          threshold: '>= 1,000 kVA (1 MW)',
          status: conventionalOaEligible ? 'QUALIFIED' : 'DISQUALIFIED (Load < 1 MW)',
          css_applicable: true,
          additional_surcharge_applicable: true
        },
        green_energy_open_access: {
          eligible: geoaEligible,
          threshold: '>= 100 kW (100 kVA)',
          status: geoaEligible ? 'QUALIFIED' : 'DISQUALIFIED (Load < 100 kW)',
          capped_css: true,
          priority_scheduling: true
        },
        group_captive: {
          eligible: captiveEligible,
          ownership_rule: '26% Equity Shareholding by Captive Users',
          consumption_rule: '51% Minimum Annual Generation Consumption',
          css_exempt: true,
          as_exempt: true,
          status: captiveEligible ? 'RECOMMENDED (Maximum Commercial Savings)' : 'DISQUALIFIED'
        },
        voltage_code_compliance: {
          compliant: voltageCompliant,
          current_voltage: voltage_code || '33 kV',
          recommended_voltage: recommendedVoltage,
          note: voltageCompliant
            ? 'Supply voltage conforms to SERC Grid Connectivity Code.'
            : `Contract demand of ${cd} kVA requires interconnection at ${recommendedVoltage}.`
        }
      },
      surcharges_preview: {
        wheeling_charge: oaCharge.wheeling_charge,
        transmission_charge_per_mw_day: oaCharge.transmission_charge,
        css_third_party: oaCharge.css,
        as_third_party: oaCharge.additional_surcharge,
        captive_exemption_savings_rs_kwh: Number((oaCharge.css + oaCharge.additional_surcharge).toFixed(2))
      },
      regulatory_citation: captive.governing_regulation || 'Electricity Rules 2005 Rule 3 & MoP GEOA Rules 2022'
    };
  },

  // Engine 5: Generator Eligibility Checker (GEP)
  checkGeneratorEligibility({ state_id, technology, capacity_mw, grid_type }) {
    const cap = Number(capacity_mw) || 5;
    const tech = technology || 'Solar PV';
    const state = db.states.find(s => matchId(s.id, state_id) || matchId(s.state_code, state_id)) || db.states[0];
    const banking = db.bankingRules.find(b => matchId(b.state_id, state.id)) || db.bankingRules[0];
    const isIsts = grid_type === 'ISTS / CTU';

    const techEligibleForBanking = banking.eligible_technologies?.some(t =>
      t.toLowerCase().includes(tech.toLowerCase()) || tech.toLowerCase().includes(t.toLowerCase())
    );

    let recommendedVoltage = '33 kV';
    if (cap > 50) recommendedVoltage = '220 kV or 132 kV';
    else if (cap > 20) recommendedVoltage = '132 kV or 66 kV';
    else if (cap > 5) recommendedVoltage = '33 kV';
    else recommendedVoltage = '11 kV or 33 kV';

    return {
      gep_query: {
        state: state.name,
        technology: tech,
        capacity_mw: cap,
        grid_interconnection: grid_type || 'InSTS / STU'
      },
      banking_rules: {
        banking_permitted: Boolean(techEligibleForBanking),
        banking_period: banking.banking_period,
        in_kind_charge_pct: banking.banking_charge_pct,
        tod_restrictions: banking.tod_restrictions,
        surplus_treatment_rate: banking.surplus_treatment_rate,
        status: techEligibleForBanking ? 'QUALIFIED FOR RE BANKING' : 'BANKING RESTRICTED BY SERC'
      },
      grid_connectivity: {
        evacuation_voltage: recommendedVoltage,
        grid_level: isIsts ? 'Central Transmission Utility (CTU) / PGCIL' : 'State Transmission Utility (STU)',
        ists_waiver: isIsts
          ? 'Eligible for 25-Year ISTS Transmission Charges Waiver if commissioned before June 2025.'
          : 'Intra-state transmission charges applicable as per STU MYT Order.',
        metering_mandate: '0.2s Accuracy Class ABT Compliant SEM Meters with AMR/DLMS Telemetry to SLDC',
        scheduling_timeline: 'Day-Ahead schedule submission to SLDC by 16:00 hrs with 16 intra-day revisions'
      },
      statutory_source: banking.source_order || 'State Renewable Energy & Grid Connectivity Regulations'
    };
  },

  // Engine 3: Connectivity Matrix & Losses
  getConnectivityMatrix(filters = {}) {
    let result = db.lossRules;
    if (filters.state_id) {
      result = result.filter(l => matchId(l.state_id, filters.state_id));
    }
    if (filters.voltage_code) {
      result = result.filter(l => matchId(l.voltage_code, filters.voltage_code));
    }

    return {
      voltage_tiers: db.voltageLevels,
      loss_matrix: result,
      substation_guidelines: [
        { voltage: '11 kV', min_mw: 0.1, max_mw: 3.0, typical_substation: 'DISCOM 33/11 kV Substation' },
        { voltage: '33 kV', min_mw: 2.0, max_mw: 25.0, typical_substation: 'STU / DISCOM 132/33 kV or 220/33 kV Substation' },
        { voltage: '66 kV / 110 kV', min_mw: 15.0, max_mw: 60.0, typical_substation: 'STU Transmission Substation' },
        { voltage: '132 kV', min_mw: 25.0, max_mw: 100.0, typical_substation: 'STU / CTU Grid Substation' },
        { voltage: '220 kV / 400 kV', min_mw: 75.0, max_mw: 500.0, typical_substation: 'STU / PGCIL Pooling Substation' }
      ]
    };
  },

  // Downstream App Contract: NewRa Lens (BillScan & Bill Optimizer)
  getLensAuditRules({ discom_id, category_id, voltage_code }) {
    const tariff = db.tariffs.find(t =>
      matchId(t.discom_id, discom_id) &&
      (matchId(t.consumer_category_id, category_id) || matchId(t.voltage_code, voltage_code))
    ) || db.tariffs[0];

    const tod = db.todProfiles.find(p => matchId(p.discom_id, tariff.discom_id)) || db.todProfiles[0];

    return {
      product_target: 'NewRa Lens (BillScan & Bill Optimizer)',
      tariff_urn: `urn:newra:tariff:${tariff.state_id}:${tariff.discom_id}:${tariff.consumer_category_id}:${tariff.voltage_code}:${tariff.financial_year}`,
      discom_id: tariff.discom_id,
      consumer_category: tariff.tariff_category_name,
      voltage_level: tariff.voltage_code,
      financial_year: tariff.financial_year,
      rates: {
        base_energy_charge: tariff.energy_charge,
        energy_unit: tariff.energy_charge_unit,
        demand_charge: tariff.demand_charge,
        demand_unit: tariff.demand_charge_unit,
        billing_demand_formula: tariff.billing_demand_rule || 'Max(85% of Contract Demand, Actual Max Demand)',
        billing_demand_multiplier: 0.85,
        electricity_duty_pct: tariff.electricity_duty,
        fac_charge_per_kwh: tariff.fac_fppas,
        power_factor_incentive_rule: tariff.power_factor_incentive,
        power_factor_penalty_rule: tariff.power_factor_penalty
      },
      tod_slots: tod.slots,
      audit_verification: {
        status: tariff.verification_status,
        order_reference: tariff.order_reference,
        effective_from: tariff.effective_from,
        effective_to: tariff.effective_to
      }
    };
  },

  // Downstream App Contract: GridFlex (Settlement & Commercial Engine)
  getGridFlexSettlement({ state_id, discom_id, voltage_code }) {
    const state = db.states.find(s => matchId(s.id, state_id) || matchId(s.state_code, state_id)) || db.states[0];
    const discom = db.discoms.find(d => matchId(d.id, discom_id)) || db.discoms[0];
    const oa = db.oaCharges.find(o => matchId(o.discom_id, discom.id) && matchId(o.voltage_code, voltage_code)) || db.oaCharges[0];
    const losses = db.lossRules.find(l => matchId(l.state_id, state.id) && matchId(l.voltage_code, voltage_code)) || db.lossRules[0];
    const banking = db.bankingRules.find(b => matchId(b.state_id, state.id)) || db.bankingRules[0];

    const totalLossPct = losses.total_technical_loss_pct || 4.5;
    const lossMultiplier = Number((1 / (1 - totalLossPct / 100)).toFixed(4));

    return {
      product_target: 'GridFlex (Engineering & Commercial SSoT)',
      state_id: state.id,
      discom_id: discom.id,
      voltage_code: voltage_code || '33 kV',
      landed_cost_elements: {
        wheeling_charge_rs_kwh: oa.wheeling_charge,
        transmission_charge_rs_mw_day: oa.transmission_charge,
        css_rs_kwh: oa.css,
        as_rs_kwh: oa.additional_surcharge,
        captive_css_exempt: true,
        captive_as_exempt: true
      },
      technical_losses: {
        transmission_loss_pct: losses.transmission_loss_pct,
        wheeling_loss_pct: losses.wheeling_loss_pct,
        total_loss_pct: totalLossPct,
        loss_gross_up_multiplier: lossMultiplier
      },
      banking_settlement: {
        in_kind_deduction_pct: banking.banking_charge_pct,
        settlement_cycle: banking.settlement_cycle,
        tod_restrictions: banking.tod_restrictions,
        appc_cashout_rate_rs_kwh: 3.45,
        surplus_treatment: banking.surplus_treatment_rate
      }
    };
  },

  // Downstream App Contract: NewRa VPP (15-min Dispatch & DSM)
  getVppDsmRules({ state_id }) {
    const state = db.states.find(s => matchId(s.id, state_id) || matchId(s.state_code, state_id)) || db.states[0];
    const dsm = db.dsmRules.find(d => matchId(d.state_id, state.id)) || db.dsmRules[0];
    const sched = db.schedulingRules.find(s => matchId(s.state_id, state.id)) || db.schedulingRules[0];

    return {
      product_target: 'NewRa VPP (Dispatch & Deviation SSoT)',
      state_id: state.id,
      sldc_code: state.sldc_code,
      dsm_deviation_bands: {
        permissible_deviation_band_pct: dsm.permissible_deviation_band || '+/- 10%',
        deviation_settlement_mechanism: dsm.settlement_mechanism || 'Frequency-linked DSM rates',
        penalty_rates: dsm.penalty_structure || 'Standard CERC/SERC DSM Surcharge Matrix'
      },
      scheduling_timelines: {
        day_ahead_gate_closure: sched.day_ahead_deadline || '16:00 hrs',
        intra_day_revision_notice_blocks: sched.revision_notice_blocks || 6,
        time_block_duration_minutes: 15,
        blocks_per_day: 96
      }
    };
  },

  // Downstream App Contract: NewRa Ledger (15-min Energy Accounting & Bill Reconciliation)
  getLedgerReconciliation({ state_id, discom_id, billing_month }) {
    const state = db.states.find(s => matchId(s.id, state_id)) || db.states[0];
    const discom = db.discoms.find(d => matchId(d.id, discom_id)) || db.discoms[0];
    const banking = db.bankingRules.find(b => matchId(b.state_id, state.id)) || db.bankingRules[0];
    const tariff = db.tariffs.find(t => matchId(t.discom_id, discom.id)) || db.tariffs[0];

    return {
      product_target: 'NewRa Ledger (Billing Reconciliation SSoT)',
      billing_month: billing_month || '2025-05',
      state: state.name,
      discom: discom.name,
      in_kind_banking_deduction_pct: banking.banking_charge_pct,
      banking_carry_forward: banking.carry_forward_allowed,
      reconciliation_parameters: {
        energy_rate: tariff.energy_charge,
        demand_rate: tariff.demand_charge,
        electricity_duty_pct: tariff.electricity_duty,
        fac_rate: tariff.fac_fppas,
        appc_surplus_cashout_rate: 3.45
      }
    };
  },

  // ==========================================
  // 1. THE GES / GEP REGULATORY PASSPORT GENERATOR
  // ==========================================
  generateRegulatoryPassport({
    ges_id = 'GES-001',
    consumer_name = 'Industrial Consumer',
    state_id = 'maharashtra',
    discom_id = 'msedcl',
    category_id = 'ht-industrial-cont',
    contract_demand_kva = 1500,
    voltage_code = '33 kV',
    technology = 'Solar + Wind Hybrid'
  } = {}) {
    const cd = Number(contract_demand_kva) || 1500;
    const cdMw = Number((cd / 1000).toFixed(3));
    const state = db.states.find(s => matchId(s.id, state_id) || matchId(s.state_code, state_id)) || db.states[0];
    const discom = db.discoms.find(d => matchId(d.id, discom_id)) || db.discoms.find(d => matchId(d.state_id, state.id)) || db.discoms[0];
    const tariff = db.tariffs.find(t => matchId(t.discom_id, discom.id) && (matchId(t.consumer_category_id, category_id) || matchId(t.voltage_code, voltage_code))) || db.tariffs[0];
    const tod = db.todProfiles.find(p => matchId(p.discom_id, discom.id)) || db.todProfiles[0];
    const oa = db.oaCharges.find(o => matchId(o.discom_id, discom.id) && matchId(o.voltage_code, voltage_code)) || db.oaCharges[0];
    const losses = db.lossRules.find(l => matchId(l.state_id, state.id) && matchId(l.voltage_code, voltage_code)) || db.lossRules[0];
    const banking = db.bankingRules.find(b => matchId(b.state_id, state.id)) || db.bankingRules[0];
    const captive = db.captiveRules.find(c => matchId(c.state_id, state.id)) || db.captiveRules[0];
    const metering = db.meteringRules.find(m => matchId(m.state_id, state.id)) || db.meteringRules[0];

    const totalLossPct = losses.total_technical_loss_pct || (losses.transmission_loss_pct + losses.wheeling_loss_pct) || 6.78;
    const lossMultiplier = Number((1 / (1 - totalLossPct / 100)).toFixed(4));
    const captiveSavingsPerUnit = Number((oa.css + oa.additional_surcharge).toFixed(2));

    const fyTag = tariff.financial_year ? tariff.financial_year.replace(/\s+/g, '-').toLowerCase() : 'fy2526';
    const passportUrn = `urn:newra:passport:${normId(ges_id)}:${fyTag}`;

    return {
      passport_urn: passportUrn,
      generated_at: new Date().toISOString(),
      passport_version: '1.0.0-PROD',
      verification_status: tariff.verification_status || 'Official Verified',

      // Entity & Grid Node
      entity: {
        ges_id: ges_id.toUpperCase(),
        consumer_name,
        state: state.name,
        state_code: state.state_code,
        regulator: state.regulator_code,
        sldc: state.sldc_code,
        stu: state.stu_code,
        discom: discom.name,
        discom_code: discom.code,
        contract_demand_kva: cd,
        contract_demand_mw: cdMw,
        voltage_code: voltage_code || '33 kV',
        technology
      },

      // Module 1: Retail Tariff & Surcharges (For NewRa Lens BillScan & Bill Optimizer)
      tariff_and_billing: {
        category_name: tariff.tariff_category_name,
        financial_year: tariff.financial_year,
        base_energy_charge_rs_unit: tariff.energy_charge,
        energy_unit: tariff.energy_charge_unit,
        demand_charge_rs_kva_mo: tariff.demand_charge,
        billing_demand_rule: tariff.billing_demand_rule || 'Max(85% of Contract Demand, Actual Max Demand)',
        billing_demand_threshold_pct: 85,
        electricity_duty_pct: tariff.electricity_duty,
        fac_fppas_rs_kwh: tariff.fac_fppas,
        power_factor_incentive: tariff.power_factor_incentive,
        power_factor_penalty: tariff.power_factor_penalty,
        tod_slots: tod.slots || []
      },

      // Module 2: Open Access & Landed Cost (For GridFlex Commercial & Settlement Engine)
      open_access_and_landed: {
        wheeling_charge_rs_kwh: oa.wheeling_charge,
        transmission_charge_rs_mw_day: oa.transmission_charge,
        cross_subsidy_surcharge_rs_kwh: oa.css,
        additional_surcharge_rs_kwh: oa.additional_surcharge,
        captive_exemption_savings_rs_kwh: captiveSavingsPerUnit,
        conventional_oa_eligible: cd >= 1000,
        geoa_eligible: cd >= 100,
        group_captive_eligible: cd >= 100
      },

      // Module 3: Technical Losses & Gross-up (For GridFlex DFR/EFR & Simulation)
      technical_losses: {
        stu_transmission_loss_pct: losses.transmission_loss_pct,
        discom_wheeling_loss_pct: losses.wheeling_loss_pct,
        total_loss_pct: totalLossPct,
        loss_gross_up_multiplier: lossMultiplier,
        formula: 'Delivered PPA = Base PPA × [1 / (1 - Total Loss %)]'
      },

      // Module 4: RE Banking & Settlement (For NewRa VPP & Ledger)
      banking_and_settlement: {
        banking_period: banking.banking_period,
        in_kind_deduction_pct: banking.banking_charge_pct,
        tod_restrictions: banking.tod_restrictions,
        appc_surplus_cashout_rate_rs_kwh: 3.45,
        settlement_cycle: banking.settlement_cycle
      },

      // Module 5: Guard Statutory Compliance (For NewRa Guard & Signals)
      compliance_mandates: {
        captive_equity_threshold_pct: 26,
        captive_consumption_threshold_pct: 51,
        metering_specification: metering.meter_class || '0.2s ABT Compliant SEM with AMR/DLMS',
        sldc_telemetry: metering.sldc_telemetry || 'Real-time telemetry to SLDC required',
        governing_order: tariff.order_reference || 'SERC Multi-Year Tariff Order'
      }
    };
  },

  // ==========================================
  // 2. NEWRA GUARD COMPLIANCE RULEBOOK ENGINE
  // ==========================================
  getGuardComplianceRules({ state_id = 'maharashtra', discom_id = 'msedcl' } = {}) {
    const state = db.states.find(s => matchId(s.id, state_id) || matchId(s.state_code, state_id)) || db.states[0];
    const discom = db.discoms.find(d => matchId(d.id, discom_id)) || db.discoms[0];
    const captive = db.captiveRules.find(c => matchId(c.state_id, state.id)) || db.captiveRules[0];
    const tariff = db.tariffs.find(t => matchId(t.discom_id, discom.id)) || db.tariffs[0];
    const banking = db.bankingRules.find(b => matchId(b.state_id, state.id)) || db.bankingRules[0];
    const oa = db.oaCharges.find(o => matchId(o.discom_id, discom.id)) || db.oaCharges[0];

    return {
      product_target: 'NewRa Guard (Statutory Compliance & Exception Engine)',
      state: state.name,
      discom: discom.name,
      rules: {
        captive_compliance: {
          title: 'Rule 3 Electricity Rules 2005 (Captive Status)',
          min_equity_shareholding_pct: 26,
          min_annual_consumption_pct: 51,
          audit_frequency: 'Annual (Audited by Chartered Accountant / Statutory Auditor)',
          breach_penalty: 'Retrospective clawback of 100% Cross-Subsidy Surcharge & Additional Surcharge with interest',
          formula: 'Equity % >= 26% AND Proportional Consumption >= 51%'
        },
        contract_demand_overshoot: {
          title: 'Maximum Demand Overshoot Surcharge',
          threshold_pct: 100,
          penalty_multiplier: 1.5,
          formula: 'Actual MD > CD => Demand Charge for Excess kVA at 150% of Normal Rate',
          normal_demand_charge: tariff.demand_charge,
          penalty_demand_charge_rs_kva: Number((tariff.demand_charge * 1.5).toFixed(2))
        },
        power_factor_guard: {
          title: 'Power Factor Statutory Compliance',
          penalty_threshold_pf: 0.90,
          incentive_threshold_pf: 0.95,
          unity_pf_rebate_pct: 3.5,
          surcharge_rate: '1.0% per 0.01 drop below 0.90 down to 0.85; 2.0% per 0.01 drop below 0.85',
          rebate_rate: '0.5% per 0.01 increase above 0.95 up to 1.00 (Max 3.5%)'
        },
        banking_forfeiture_deadline: {
          title: 'RE Banking Annual Settlement & Forfeiture',
          settlement_cycle: banking.settlement_cycle || 'Annual',
          deadline: '31st March (Financial Year End)',
          lapse_condition: 'Unutilized surplus banked energy beyond annual cycle cannot be carried forward to next FY',
          cashout_rate: banking.surplus_treatment_rate || 'Compensated at average pooled power purchase cost (APPC)'
        },
        open_access_thresholds: {
          conventional_oa_min_kva: 1000,
          geoa_min_kw: 100,
          statutory_source: 'MoP Green Energy Open Access Rules 2022'
        }
      }
    };
  },

  // ==========================================
  // 3. THE 6 LIFECYCLE RULE ENGINES
  // ==========================================

  // Lifecycle Stage 6: Billed — Statutory DISCOM Bill Audit Engine
  auditDiscomBill({
    discom_id = 'msedcl',
    category_id = 'ht-industrial-cont',
    contract_demand_kva = 2000,
    recorded_md_kva = 1850,
    billed_units_kwh = 850000,
    pf = 0.92,
    fac_rate,
    billed_amount_inr = 8250000,
    voltage_code = '33 kV'
  } = {}) {
    const discom = db.discoms.find(d => matchId(d.id, discom_id)) || db.discoms[0];
    const tariff = db.tariffs.find(t => matchId(t.discom_id, discom.id) && (matchId(t.consumer_category_id, category_id) || matchId(t.voltage_code, voltage_code))) || db.tariffs[0];
    const tod = db.todProfiles.find(p => matchId(p.discom_id, discom.id)) || db.todProfiles[0];

    const cd = Math.max(1, Number(contract_demand_kva) || 2000);
    const md = Math.max(0, Number(recorded_md_kva) || 1850);
    const units = Math.max(0, Number(billed_units_kwh) || 850000);
    const rawPf = Number(pf);
    const powerFactor = isNaN(rawPf) || rawPf <= 0 ? 0.92 : Math.min(1.0, Math.max(0.50, rawPf));
    const billedTotal = Math.max(0, Number(billed_amount_inr) || 8250000);

    // 1. Statutory Billing Demand Rule:
    // Billing Demand = Max(85% of Contract Demand, Actual Recorded MD, Sanctioned Floor 100 kVA)
    const minSanctionedFloorKva = 100;
    const billingDemandThreshold = cd * 0.85;
    const statutoryBillingDemandKva = Math.max(billingDemandThreshold, md, minSanctionedFloorKva);
    const demandChargeRate = tariff.demand_charge;
    
    // Penal demand charge for overdrawing beyond Contract Demand (MD > CD)
    const hasDemandOverdraw = md > cd;
    const overdrawKva = hasDemandOverdraw ? (md - cd) : 0;
    const standardDemandCharge = Math.round(Math.min(statutoryBillingDemandKva, cd) * demandChargeRate);
    const penalDemandCharge = hasDemandOverdraw ? Math.round(overdrawKva * demandChargeRate * 1.5) : 0;
    const statutoryDemandCharge = standardDemandCharge + penalDemandCharge;

    // 2. Base Energy Charge
    const energyChargeRate = tariff.energy_charge;
    const statutoryEnergyCharge = Math.round(units * energyChargeRate);

    // 3. FAC / FPPAS
    const effectiveFacRate = fac_rate !== undefined && fac_rate !== null ? Number(fac_rate) : tariff.fac_fppas;
    const statutoryFacCharge = Math.round(units * effectiveFacRate);

    // 4. Power Factor Incentive / Penalty (SERC Multi-Tier Grid Code)
    let pfAdjustmentInr = 0;
    let pfStatus = 'Neutral (No Adjustment)';
    if (powerFactor >= 0.95) {
      const unitsAbove = Math.round((powerFactor - 0.95) * 100);
      const rebatePct = Math.min(3.5, unitsAbove * 0.5);
      pfAdjustmentInr = -Math.round(statutoryEnergyCharge * (rebatePct / 100));
      pfStatus = `Incentive: -${rebatePct.toFixed(1)}% Rebate`;
    } else if (powerFactor < 0.90) {
      const unitsBelow = Math.round((0.90 - powerFactor) * 100);
      let penaltyPct = unitsBelow * 1.0;
      if (powerFactor < 0.85) {
        penaltyPct = 5.0 + (Math.round((0.85 - powerFactor) * 100) * 2.0);
      }
      pfAdjustmentInr = Math.round(statutoryEnergyCharge * (penaltyPct / 100));
      pfStatus = `Penalty: +${penaltyPct.toFixed(1)}% Surcharge`;
    }

    // 5. Electricity Duty
    const dutyPct = tariff.electricity_duty;
    const dutyAssessableBase = statutoryEnergyCharge + statutoryDemandCharge + statutoryFacCharge + pfAdjustmentInr;
    const statutoryDuty = Math.round(dutyAssessableBase * (dutyPct / 100));

    // 6. Statutory Total vs DISCOM Billed Total
    const statutoryTotalInr = statutoryEnergyCharge + statutoryDemandCharge + statutoryFacCharge + pfAdjustmentInr + statutoryDuty;
    const discrepancyInr = billedTotal - statutoryTotalInr;
    const discrepancyPct = Number(((discrepancyInr / statutoryTotalInr) * 100).toFixed(2));

    let auditVerdict = 'VERIFIED_ACCURATE';
    if (discrepancyInr > 5000) auditVerdict = 'OVERBILLED_BY_DISCOM';
    else if (discrepancyInr < -5000) auditVerdict = 'UNDERBILLED_BY_DISCOM';

    return {
      product_target: 'NewRa Lens (BillScan) & Symphony',
      discom: discom.name,
      discom_code: discom.code,
      consumer_category: tariff.tariff_category_name,
      financial_year: tariff.financial_year,
      governing_tariff_order: tariff.order_reference,
      bill_parameters: {
        contract_demand_kva: cd,
        recorded_max_demand_kva: md,
        statutory_billing_demand_kva: statutoryBillingDemandKva,
        min_sanctioned_floor_kva: minSanctionedFloorKva,
        has_demand_overdraw: hasDemandOverdraw,
        overdraw_kva: overdrawKva,
        billing_demand_rule: tariff.billing_demand_rule,
        billed_units_kwh: units,
        power_factor: powerFactor
      },
      line_item_audit: [
        {
          item: 'Demand / Fixed Charges',
          statutory_rate: `₹${demandChargeRate}/kVA on ${statutoryBillingDemandKva} kVA (85% rule applied)`,
          statutory_amount_inr: statutoryDemandCharge,
          status: 'STATUTORILY_CORRECT'
        },
        {
          item: 'Base Energy Charges',
          statutory_rate: `₹${energyChargeRate}/${tariff.energy_charge_unit}`,
          statutory_amount_inr: statutoryEnergyCharge,
          status: 'STATUTORILY_CORRECT'
        },
        {
          item: 'Fuel Adjustment (FAC / FPPAS)',
          statutory_rate: `₹${effectiveFacRate}/kWh`,
          statutory_amount_inr: statutoryFacCharge,
          status: 'STATUTORILY_CORRECT'
        },
        {
          item: 'Power Factor Incentive / Penalty',
          statutory_rate: pfStatus,
          statutory_amount_inr: pfAdjustmentInr,
          status: pfAdjustmentInr < 0 ? 'REBATE_CREDIT' : pfAdjustmentInr > 0 ? 'PENALTY_SURCHARGE' : 'NEUTRAL'
        },
        {
          item: 'Electricity Duty & Tax',
          statutory_rate: `${dutyPct}% on energy & demand base`,
          statutory_amount_inr: statutoryDuty,
          status: 'STATUTORILY_CORRECT'
        }
      ],
      audit_summary: {
        discom_billed_total_inr: billedTotal,
        statutory_mandated_total_inr: statutoryTotalInr,
        discrepancy_amount_inr: discrepancyInr,
        discrepancy_pct: discrepancyPct,
        verdict: auditVerdict,
        potential_annual_claim_inr: Math.max(0, discrepancyInr * 12)
      }
    };
  },

  // Lifecycle Stage 2: Contracted — Captive 26/51 Equity Structuring Engine
  structureCaptiveEquity({
    plant_capacity_mw = 10,
    annual_generation_mu,
    captive_users = [
      { name: 'Lead Consumer (Anchor)', equity_share_pct: 18.0, annual_consumption_mu: 12.0 },
      { name: 'Co-Captive User 2', equity_share_pct: 8.0, annual_consumption_mu: 5.3 }
    ]
  } = {}) {
    const mw = Math.max(0.1, Number(plant_capacity_mw) || 10);
    // Standard annual generation: 10 MW Solar ~ 17.5 MU; Hybrid ~ 32 MU
    const generationMu = Math.max(0.1, Number(annual_generation_mu) || Number((mw * 1.75).toFixed(2)));

    // Statutory Rule 3 Mandates (Electricity Rules 2005):
    // 1. Captive users must hold >= 26% proprietary equity shares with voting rights
    // 2. Captive users must collectively consume >= 51% of annual generation
    // 3. Proportionality Rule (Rule 3(1)(a)(i) proviso): For SPVs/Group Captive, captive users must consume
    //    in proportion to their equity ownership within a permissible +/- 10% variation tolerance.
    const minCaptiveConsumptionMu = Number((generationMu * 0.51).toFixed(2));

    const totalCaptiveEquityPct = captive_users.reduce((acc, u) => acc + (Number(u.equity_share_pct) || 0), 0);
    const totalCaptiveConsumptionMu = captive_users.reduce((acc, u) => acc + (Number(u.annual_consumption_mu) || 0), 0);
    const consumptionRatioPct = Number(((totalCaptiveConsumptionMu / generationMu) * 100).toFixed(2));
    
    const isEquityCompliant = totalCaptiveEquityPct >= 26.0;
    const isConsumptionCompliant = totalCaptiveConsumptionMu >= minCaptiveConsumptionMu;

    // Equity allocation & Proportionality Audit:
    let allShareholdersProportional = true;
    const userAllocations = captive_users.map(u => {
      const uMu = Math.max(0, Number(u.annual_consumption_mu) || 0);
      const uEquity = Math.max(0, Number(u.equity_share_pct) || 0);
      
      // Proportions within the captive group
      const equityShareOfCaptiveBlock = totalCaptiveEquityPct > 0 ? (uEquity / totalCaptiveEquityPct) : 0;
      const consumptionShareOfCaptiveBlock = totalCaptiveConsumptionMu > 0 ? (uMu / totalCaptiveConsumptionMu) : 0;

      // Deviation from strict equity proportionality
      // Deviation % = |(Consumption Share - Equity Share) / Equity Share| * 100
      let deviationPct = 0;
      let isProportional = true;
      if (equityShareOfCaptiveBlock > 0) {
        deviationPct = Number((Math.abs(consumptionShareOfCaptiveBlock - equityShareOfCaptiveBlock) / equityShareOfCaptiveBlock * 100).toFixed(2));
        isProportional = deviationPct <= 10.0; // Rule 3(1)(a)(i) allows +/- 10% variation
      } else if (uMu > 0) {
        // Consumer has 0 equity but consumes power -> violation of captive status
        deviationPct = 100.0;
        isProportional = false;
      }

      if (!isProportional) {
        allShareholdersProportional = false;
      }

      return {
        name: u.name,
        equity_share_spv_pct: uEquity,
        equity_share_of_captive_pool_pct: Number((equityShareOfCaptiveBlock * 100).toFixed(2)),
        annual_consumption_mu: uMu,
        consumption_share_of_captive_pct: Number((consumptionShareOfCaptiveBlock * 100).toFixed(2)),
        proportionality_deviation_pct: deviationPct,
        is_proportional_compliant: isProportional,
        compliance_status: isProportional ? 'COMPLIANT_WITHIN_10_PCT' : 'PROPORTIONALITY_VIOLATION'
      };
    });

    const isFullyCompliant = isEquityCompliant && isConsumptionCompliant && allShareholdersProportional && totalCaptiveConsumptionMu > 0;

    let verdictNote = '';
    if (isFullyCompliant) {
      verdictNote = 'Structure satisfies all statutory conditions: >=26% equity holding, >=51% generation consumption, and Rule 3(1) +/-10% individual shareholder proportionality. 100% CSS and Additional Surcharge exemptions protected.';
    } else if (!isEquityCompliant) {
      verdictNote = `Captive equity of ${totalCaptiveEquityPct.toFixed(1)}% falls below statutory 26.0% threshold. Requires additional ${(26.0 - totalCaptiveEquityPct).toFixed(1)}% equity investment.`;
    } else if (!isConsumptionCompliant) {
      verdictNote = `Captive consumption of ${totalCaptiveConsumptionMu.toFixed(2)} MU falls below statutory 51% threshold (${minCaptiveConsumptionMu.toFixed(2)} MU). Add more captive users or increase offtake.`;
    } else if (!allShareholdersProportional) {
      verdictNote = 'Rule 3(1)(a)(i) Proportionality Violation detected: One or more captive users deviate by >10% from their equity proportion in consumption. Non-compliant users risk loss of captive status under Cadbury/DLF Supreme Court doctrine.';
    }

    return {
      product_target: 'NewRa DealDesk (PPA Workspace) & Market',
      governing_statute: 'Electricity Rules 2005 Rule 3 & Supreme Court Cadbury / DLF Judgments',
      plant_parameters: {
        plant_capacity_mw: mw,
        annual_generation_mu: generationMu,
        min_captive_consumption_required_mu: minCaptiveConsumptionMu,
        total_captive_consumption_scheduled_mu: totalCaptiveConsumptionMu,
        consumption_compliance_ratio_pct: consumptionRatioPct,
        is_consumption_compliant: isConsumptionCompliant
      },
      spv_equity_structure: {
        total_captive_equity_holding_pct: totalCaptiveEquityPct,
        statutory_captive_equity_threshold_pct: 26.0,
        is_equity_compliant: isEquityCompliant,
        developer_holding_pct: Math.max(0, Number((100 - totalCaptiveEquityPct).toFixed(2))),
        user_equity_breakdown: userAllocations
      },
      compliance_verdict: {
        status: isFullyCompliant ? 'FULLY_COMPLIANT' : 'NON_COMPLIANT',
        is_equity_compliant: isEquityCompliant,
        is_consumption_compliant: isConsumptionCompliant,
        is_proportionality_compliant: allShareholdersProportional,
        css_exemption_guaranteed: isFullyCompliant,
        additional_surcharge_exemption_guaranteed: isFullyCompliant,
        action_note: verdictNote
      }
    };
  },

  // Lifecycle Stage 4: Scheduled — 96-Block 15-Minute Vector Generator for GridFlex
  generate96BlockDispatchVector({ state_id = 'maharashtra' } = {}) {
    const state = db.states.find(s => matchId(s.id, state_id)) || db.states[0];
    const discom = db.discoms.find(d => matchId(d.state_id, state.id)) || db.discoms[0];
    const tod = db.todProfiles.find(p => matchId(p.discom_id, discom.id)) || db.todProfiles[0];
    const losses = db.lossRules.find(l => matchId(l.state_id, state.id) && matchId(l.voltage_code, '33 kV')) || db.lossRules[0];
    const banking = db.bankingRules.find(b => matchId(b.state_id, state.id)) || db.bankingRules[0];

    const lossMultiplier = Number((1 / (1 - (losses.total_technical_loss_pct || 6.78) / 100)).toFixed(4));

    // Generate 96 blocks (15-min intervals from 00:00 to 23:45)
    const blocks = [];
    for (let i = 0; i < 96; i++) {
      const startMin = i * 15;
      const endMin = startMin + 15;
      const startHour = Math.floor(startMin / 60);
      const startMinute = startMin % 60;
      const endHour = Math.floor(endMin / 60);
      const endMinute = endMin % 60;

      const formatTime = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const timeStartStr = formatTime(startHour, startMinute);
      const timeEndStr = formatTime(endHour, endMinute);

      // Match with active TOD slot
      let rateDelta = 0;
      let slotType = 'normal';
      let bankingDrawalAllowed = true;

      // Slot check based on hour
      if (startHour >= 22 || startHour < 6) {
        // Night off-peak (Rebate)
        rateDelta = -1.50;
        slotType = 'off-peak';
        bankingDrawalAllowed = true;
      } else if (startHour >= 9 && startHour < 12) {
        // Morning Peak
        rateDelta = 0.80;
        slotType = 'peak';
        bankingDrawalAllowed = true;
      } else if (startHour >= 18 && startHour < 22) {
        // Evening Super Peak
        rateDelta = 1.10;
        slotType = 'super-peak';
        // In many states like MH, drawal of banked energy during evening peak is prohibited or requires differential
        bankingDrawalAllowed = false;
      } else {
        rateDelta = 0.00;
        slotType = 'normal';
        bankingDrawalAllowed = true;
      }

      blocks.push({
        block_index: i + 1,
        time_start: timeStartStr,
        time_end: timeEndStr,
        slot_type: slotType,
        tod_rate_delta_rs_kwh: rateDelta,
        banking_drawal_allowed: bankingDrawalAllowed,
        dsm_tolerance_band_pct: 10,
        loss_multiplier: lossMultiplier
      });
    }

    return {
      product_target: 'GridFlex (BESS Engine, Stack Builder) & NewRa VPP',
      state: state.name,
      discom: discom.name,
      time_resolution: '15-Minute Time Blocks',
      total_blocks: 96,
      grid_loss_multiplier: lossMultiplier,
      in_kind_banking_deduction_pct: banking.banking_charge_pct,
      blocks
    };
  },

  // Regulatory Change & Risk Engine: Simulate MYT Order Impact
  simulateRegulatoryChangeImpact({
    state_id = 'maharashtra',
    delta_css = 0.20,
    delta_as = 0.15,
    delta_wheeling = 0.05,
    delta_base_tariff = 0.35
  } = {}) {
    const state = db.states.find(s => matchId(s.id, state_id)) || db.states[0];
    const discom = db.discoms.find(d => matchId(d.state_id, state.id)) || db.discoms[0];
    const tariff = db.tariffs.find(t => matchId(t.discom_id, discom.id)) || db.tariffs[0];
    const oa = db.oaCharges.find(o => matchId(o.discom_id, discom.id)) || db.oaCharges[0];

    // Standard client benchmark: 2.5 MW / 12,000,000 kWh/year (12 MU)
    const annualUnitsKwh = 12000000;

    // 1. Group Captive Impact:
    // Captive is 100% exempt from CSS and AS.
    // Affected ONLY by wheeling charges (+delta_wheeling) and base tariff (+delta_base_tariff)
    const captiveLandedShiftPerKwh = Number(delta_wheeling);
    const captiveClientSavingsShiftPerKwh = Number((delta_base_tariff - delta_wheeling).toFixed(2));
    const captiveAnnualSavingsDeltaInr = Math.round(captiveClientSavingsShiftPerKwh * annualUnitsKwh);

    // 2. Third Party PPA Impact:
    // Fully exposed to CSS (+delta_css), AS (+delta_as), and wheeling (+delta_wheeling)
    const thirdPartyLandedShiftPerKwh = Number((delta_css + delta_as + delta_wheeling).toFixed(2));
    const thirdPartySavingsShiftPerKwh = Number((delta_base_tariff - thirdPartyLandedShiftPerKwh).toFixed(2));
    const thirdPartyAnnualSavingsDeltaInr = Math.round(thirdPartySavingsShiftPerKwh * annualUnitsKwh);

    // 3. Green Energy Open Access (GEOA):
    // Capped CSS (+delta_css), wheeling (+delta_wheeling)
    const geoaLandedShiftPerKwh = Number((delta_css + delta_wheeling).toFixed(2));
    const geoaSavingsShiftPerKwh = Number((delta_base_tariff - geoaLandedShiftPerKwh).toFixed(2));
    const geoaAnnualSavingsDeltaInr = Math.round(geoaSavingsShiftPerKwh * annualUnitsKwh);

    return {
      product_target: 'NewRa Guard, Signals & Symphony',
      state: state.name,
      discom: discom.name,
      simulation_inputs: {
        delta_css_rs_kwh: Number(delta_css),
        delta_as_rs_kwh: Number(delta_as),
        delta_wheeling_rs_kwh: Number(delta_wheeling),
        delta_base_tariff_rs_kwh: Number(delta_base_tariff),
        benchmark_consumer_size: '2.5 MW (12 MU/year)'
      },
      procurement_routes_impact: {
        group_captive: {
          route_name: 'Group Captive (26/51)',
          css_exemption_protection: '100% PROTECTED (₹0 CSS & ₹0 AS Impact)',
          landed_cost_shift_rs_kwh: captiveLandedShiftPerKwh,
          net_savings_shift_rs_kwh: captiveClientSavingsShiftPerKwh,
          annual_portfolio_delta_inr: captiveAnnualSavingsDeltaInr,
          risk_status: 'SAFE_SHIELDED'
        },
        third_party_bilateral: {
          route_name: 'Third-Party Bilateral PPA',
          css_exemption_protection: 'FULLY EXPOSED (Faces CSS + AS Hikes)',
          landed_cost_shift_rs_kwh: thirdPartyLandedShiftPerKwh,
          net_savings_shift_rs_kwh: thirdPartySavingsShiftPerKwh,
          annual_portfolio_delta_inr: thirdPartyAnnualSavingsDeltaInr,
          risk_status: 'HIGH_EROSION_RISK'
        },
        green_energy_open_access: {
          route_name: 'Green Energy Open Access (GEOA)',
          css_exemption_protection: 'PARTIALLY PROTECTED (Capped CSS)',
          landed_cost_shift_rs_kwh: geoaLandedShiftPerKwh,
          net_savings_shift_rs_kwh: geoaSavingsShiftPerKwh,
          annual_portfolio_delta_inr: geoaAnnualSavingsDeltaInr,
          risk_status: 'MODERATE_EXPOSURE'
        }
      },
      strategic_verdict: 'Captive users remain strongly insulated against regulatory tariff hikes. Third-party PPA contracts will experience significant margin compression if SERC approves this order.'
    };
  },

  // Lifecycle Stage 5: Settled — 15-Minute & Monthly Energy Accounting & Loss Waterfall (NewRa Ledger SSoT)
  simulateSettlementWaterfall({
    state_id = 'maharashtra',
    discom_id = 'msedcl',
    voltage_code = '33 kV',
    gross_injection_kwh = 100000,
    consumer_drawal_kwh = 92000,
    procurement_type = 'captive',
    ppa_tariff = 3.80,
    appc_rate = 3.45
  } = {}) {
    const gross = Number(gross_injection_kwh) || 100000;
    const drawal = Number(consumer_drawal_kwh) || 92000;
    const ppa = Number(ppa_tariff) || 3.80;
    const appc = Number(appc_rate) || 3.45;

    const state = db.states.find(s => matchId(s.id, state_id) || matchId(s.state_code, state_id)) || db.states[0];
    const discom = db.discoms.find(d => matchId(d.id, discom_id)) || db.discoms.find(d => matchId(d.state_id, state.id)) || db.discoms[0];
    const losses = db.lossRules.find(l => matchId(l.state_id, state.id) && matchId(l.voltage_code, voltage_code)) || db.lossRules[0];
    const banking = db.bankingRules.find(b => matchId(b.state_id, state.id)) || db.bankingRules[0];
    const tariff = db.tariffs.find(t => matchId(t.discom_id, discom.id) && matchId(t.voltage_code, voltage_code)) || db.tariffs[0];
    const oa = db.oaCharges.find(o => matchId(o.discom_id, discom.id) && matchId(o.voltage_code, voltage_code)) || db.oaCharges[0];

    // 1. Loss Waterfall Calculations
    const stuLossPct = Number(losses.transmission_loss_pct || 3.18);
    const stuLossUnits = Number(((gross * stuLossPct) / 100).toFixed(2));
    const stuNetInjection = Number((gross - stuLossUnits).toFixed(2));

    const wheelingLossPct = Number(losses.wheeling_loss_pct || 3.60);
    const wheelingLossUnits = Number(((stuNetInjection * wheelingLossPct) / 100).toFixed(2));
    const discomPerimeterUnits = Number((stuNetInjection - wheelingLossUnits).toFixed(2));

    const bankingChargePct = Number(banking.banking_charge_pct || 2.0);
    const inKindBankingUnits = Number(((discomPerimeterUnits * bankingChargePct) / 100).toFixed(2));
    const netCreditableUnits = Number((discomPerimeterUnits - inKindBankingUnits).toFixed(2));

    const cumulativeLossPct = Number((((gross - netCreditableUnits) / gross) * 100).toFixed(2));

    // 2. Offtake & Banking Reconciliation
    const isSurplus = netCreditableUnits >= drawal;
    const directOffsetUnits = isSurplus ? drawal : netCreditableUnits;
    const surplusUnits = isSurplus ? Number((netCreditableUnits - drawal).toFixed(2)) : 0;
    const deficitUnits = isSurplus ? 0 : Number((drawal - netCreditableUnits).toFixed(2));
    const cashoutValueInr = Number((surplusUnits * appc).toFixed(2));

    // 3. Commercial & Regulatory Invoicing Waterfall
    const baseEnergyRate = Number(tariff.energy_charge || 7.65);
    const facRate = Number(tariff.fac_fppas || 0.65);
    const dutyPct = Number(tariff.electricity_duty || 9.3);
    const gridEffectiveUnitRate = Number(((baseEnergyRate + facRate) * (1 + dutyPct / 100)).toFixed(2));

    // Open Access Charges
    const rawWheeling = Number(oa.wheeling_charge || 1.15);
    const wheelingChargeRate = rawWheeling > 20 ? 1.15 : rawWheeling;
    const rawTransmission = Number(oa.transmission_charge || 0.42);
    const transmissionChargeRate = rawTransmission > 20 ? 0.42 : rawTransmission;
    const cssRate = procurement_type === 'captive' ? 0 : Number(oa.css || 1.65);
    const asRate = procurement_type === 'captive' ? 0 : Number(oa.additional_surcharge || 1.25);

    const wheelingAmountInr = Number((discomPerimeterUnits * wheelingChargeRate).toFixed(2));
    const transmissionAmountInr = Number((stuNetInjection * transmissionChargeRate).toFixed(2));
    const cssAmountInr = Number((directOffsetUnits * cssRate).toFixed(2));
    const asAmountInr = Number((directOffsetUnits * asRate).toFixed(2));
    const sldcFeeInr = 3500;

    const totalOaChargesInr = Number((wheelingAmountInr + transmissionAmountInr + cssAmountInr + asAmountInr + sldcFeeInr).toFixed(2));

    // PPA Generation Cost to Client
    const ppaGenerationCostInr = Number((gross * ppa).toFixed(2));

    // Utility Top-up / Deficit Bill
    const utilityDeficitBillInr = Number((deficitUnits * gridEffectiveUnitRate).toFixed(2));

    // Total Landed Cost
    const totalLandedCostInr = Number((ppaGenerationCostInr + totalOaChargesInr + utilityDeficitBillInr - cashoutValueInr).toFixed(2));

    // Baseline Utility Cost (if 100% drawn from DISCOM grid)
    const baselineUtilityBillInr = Number((drawal * gridEffectiveUnitRate).toFixed(2));

    // Net Savings
    const netSavingsInr = Number((baselineUtilityBillInr - totalLandedCostInr).toFixed(2));
    const netSavingsPct = baselineUtilityBillInr > 0 ? Number(((netSavingsInr / baselineUtilityBillInr) * 100).toFixed(2)) : 0;
    const effectiveLandedCostPerKwh = drawal > 0 ? Number((totalLandedCostInr / drawal).toFixed(2)) : 0;

    return {
      product_target: 'NewRa Ledger (15-min Energy Accounting & Bill Reconciliation SSoT)',
      state: state.name,
      discom: discom.name,
      voltage_code,
      procurement_type,
      waterfall_physical_units: {
        step_1_gross_injection_kwh: gross,
        step_2_stu_loss_pct: stuLossPct,
        step_2_stu_loss_units_kwh: stuLossUnits,
        step_2_stu_net_injection_kwh: stuNetInjection,
        step_3_wheeling_loss_pct: wheelingLossPct,
        step_3_wheeling_loss_units_kwh: wheelingLossUnits,
        step_3_discom_perimeter_kwh: discomPerimeterUnits,
        step_4_banking_charge_pct: bankingChargePct,
        step_4_inkind_banking_deduction_kwh: inKindBankingUnits,
        step_5_net_creditable_consumer_kwh: netCreditableUnits,
        cumulative_technical_loss_pct: cumulativeLossPct
      },
      reconciliation_balance: {
        consumer_drawal_kwh: drawal,
        direct_offset_kwh: directOffsetUnits,
        surplus_banked_kwh: surplusUnits,
        deficit_utility_kwh: deficitUnits,
        settlement_status: isSurplus ? 'NET_SURPLUS_BANKED' : 'NET_DEFICIT_FROM_GRID',
        banking_settlement_cycle: banking.settlement_cycle,
        banking_carry_forward: banking.carry_forward_allowed,
        appc_surplus_cashout_rate: appc,
        potential_cashout_inr: cashoutValueInr
      },
      tod_slot_settlement: {
        governing_banking_regulation: banking.tod_restrictions || 'Slot-to-slot banking settlement strictly enforced',
        peak_draw_prohibited: state.id === 'maharashtra' || state.id === 'gujarat',
        slots: [
          {
            slot_name: 'Night Off-Peak (22:00 - 06:00)',
            hours: 8,
            solar_generation_kwh: 0,
            consumer_drawal_kwh: Math.round(drawal * 0.25),
            offset_from_solar_kwh: 0,
            banked_draw_allowed: true,
            discom_grid_draw_kwh: Math.round(drawal * 0.25),
            tod_tariff_multiplier: 0.85
          },
          {
            slot_name: 'Morning Normal (06:00 - 10:00)',
            hours: 4,
            solar_generation_kwh: Math.round(netCreditableUnits * 0.15),
            consumer_drawal_kwh: Math.round(drawal * 0.20),
            offset_from_solar_kwh: Math.min(Math.round(netCreditableUnits * 0.15), Math.round(drawal * 0.20)),
            banked_draw_allowed: true,
            discom_grid_draw_kwh: Math.max(0, Math.round(drawal * 0.20) - Math.round(netCreditableUnits * 0.15)),
            tod_tariff_multiplier: 1.00
          },
          {
            slot_name: 'Solar Peak Generation (10:00 - 18:00)',
            hours: 8,
            solar_generation_kwh: Math.round(netCreditableUnits * 0.85),
            consumer_drawal_kwh: Math.round(drawal * 0.35),
            offset_from_solar_kwh: Math.round(drawal * 0.35),
            surplus_banked_kwh: Math.max(0, Math.round(netCreditableUnits * 0.85) - Math.round(drawal * 0.35)),
            banked_draw_allowed: true,
            discom_grid_draw_kwh: 0,
            tod_tariff_multiplier: 1.00
          },
          {
            slot_name: 'Evening Peak (18:00 - 22:00)',
            hours: 4,
            solar_generation_kwh: 0,
            consumer_drawal_kwh: Math.round(drawal * 0.20),
            offset_from_solar_kwh: 0,
            banked_draw_allowed: !(state.id === 'maharashtra' || state.id === 'gujarat'),
            discom_grid_draw_kwh: Math.round(drawal * 0.20),
            tod_tariff_multiplier: 1.20,
            regulatory_note: (state.id === 'maharashtra' || state.id === 'gujarat')
              ? 'MERC/GERC Order: Drawing banked off-peak solar power during evening peak hours is prohibited. Consumer pays full Discom TOD peak rate.'
              : 'Banked power draw permitted with applicable peak TOD surcharge.'
          }
        ]
      },
      commercial_waterfall_inr: {
        ppa_generation_charge_inr: ppaGenerationCostInr,
        open_access_charges: {
          transmission_charge_inr: transmissionAmountInr,
          wheeling_charge_inr: wheelingAmountInr,
          cross_subsidy_surcharge_inr: cssAmountInr,
          additional_surcharge_inr: asAmountInr,
          sldc_fee_inr: sldcFeeInr,
          total_oa_charges_inr: totalOaChargesInr
        },
        utility_deficit_bill_inr: utilityDeficitBillInr,
        surplus_cashout_credit_inr: cashoutValueInr,
        net_landed_cost_inr: totalLandedCostInr,
        baseline_utility_bill_inr: baselineUtilityBillInr,
        net_savings_inr: netSavingsInr,
        net_savings_pct: netSavingsPct,
        effective_cost_per_kwh: effectiveLandedCostPerKwh,
        grid_baseline_rate_per_kwh: gridEffectiveUnitRate
      }
    };
  }
};

module.exports = { db, queryEngine };




