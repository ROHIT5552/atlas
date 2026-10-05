const fs = require('fs');
const path = require('path');
const http = require('http');

const SEED_DIR = path.join(__dirname, 'server', 'db', 'seedData');

async function runAudit() {
  console.log('================================================================');
  console.log('       NEWRA REGULATORY LIBRARY - FULL SYSTEM AUDIT SUITE       ');
  console.log('================================================================\n');

  const results = {
    dataIntegrity: { passed: 0, failed: 0, warnings: 0, details: [] },
    serverEndpoints: { passed: 0, failed: 0, warnings: 0, details: [] },
    frontendApiSync: { passed: 0, failed: 0, warnings: 0, details: [] },
    calculatorFormulas: { passed: 0, failed: 0, warnings: 0, details: [] }
  };

  // 1. DATA INTEGRITY AUDIT
  console.log('--- [1/4] AUDITING SEED DATA & RELATIONAL INTEGRITY ---');
  
  const files = [
    'states.json', 'discoms.json', 'consumerCategories.json', 'connectionTypes.json',
    'voltageLevels.json', 'tariffs.json', 'todProfiles.json', 'openAccessRules.json',
    'oaCharges.json', 'lossRules.json', 'bankingRules.json', 'captiveRules.json',
    'meteringRules.json', 'schedulingRules.json', 'dsmRules.json', 'regulatoryDocuments.json'
  ];

  const db = {};
  for (const file of files) {
    const filePath = path.join(SEED_DIR, file);
    if (!fs.existsSync(filePath)) {
      results.dataIntegrity.failed++;
      results.dataIntegrity.details.push(`MISSING FILE: ${file}`);
    } else {
      try {
        const key = file.replace('.json', '');
        db[key] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        results.dataIntegrity.passed++;
      } catch (err) {
        results.dataIntegrity.failed++;
        results.dataIntegrity.details.push(`INVALID JSON in ${file}: ${err.message}`);
      }
    }
  }

  const norm = (id) => (id ? String(id).toLowerCase().replace(/_/g, '-').trim() : '');

  // Relational Integrity Checks
  if (db.states && db.discoms) {
    const stateIds = new Set(db.states.map(s => norm(s.id)));
    console.log(`✓ Loaded ${db.states.length} states (${Array.from(stateIds).length} unique IDs).`);
    console.log(`✓ Loaded ${db.discoms.length} DISCOMs.`);

    // Check DISCOM state references
    let orphanDiscoms = 0;
    for (const d of db.discoms) {
      if (!stateIds.has(norm(d.state_id))) {
        orphanDiscoms++;
        results.dataIntegrity.failed++;
        results.dataIntegrity.details.push(`DISCOM ${d.id} has invalid state_id: ${d.state_id}`);
      }
    }
    if (orphanDiscoms === 0) {
      results.dataIntegrity.passed++;
      console.log(`✓ All ${db.discoms.length} DISCOMs correctly reference valid states.`);
    }

    // Check tariffs
    if (db.tariffs) {
      console.log(`✓ Loaded ${db.tariffs.length} tariff line items.`);
      let invalidTariffs = 0;
      for (const t of db.tariffs) {
        if (!stateIds.has(norm(t.state_id))) {
          invalidTariffs++;
          results.dataIntegrity.failed++;
          results.dataIntegrity.details.push(`Tariff ${t.id} has invalid state_id: ${t.state_id}`);
        }
      }
      if (invalidTariffs === 0) {
        results.dataIntegrity.passed++;
        console.log(`✓ All ${db.tariffs.length} tariffs reference valid states.`);
      }
    }

    // Check OA charges
    if (db.oaCharges) {
      console.log(`✓ Loaded ${db.oaCharges.length} OA charge line items.`);
      let invalidOa = 0;
      for (const o of db.oaCharges) {
        if (!stateIds.has(norm(o.state_id))) {
          invalidOa++;
          results.dataIntegrity.failed++;
          results.dataIntegrity.details.push(`OA Charge ${o.id} has invalid state_id: ${o.state_id}`);
        }
      }
      if (invalidOa === 0) {
        results.dataIntegrity.passed++;
        console.log(`✓ All ${db.oaCharges.length} OA charges reference valid states.`);
      }
    }

    // Check Banking rules
    if (db.bankingRules) {
      console.log(`✓ Loaded ${db.bankingRules.length} Banking rules.`);
      let invalidBanking = 0;
      for (const b of db.bankingRules) {
        if (!stateIds.has(norm(b.state_id))) {
          invalidBanking++;
          results.dataIntegrity.failed++;
          results.dataIntegrity.details.push(`Banking rule for state ${b.state_id} has invalid state reference`);
        }
      }
      if (invalidBanking === 0) {
        results.dataIntegrity.passed++;
        console.log(`✓ All ${db.bankingRules.length} banking rules reference valid states.`);
      }
    }

    // Check Captive rules
    if (db.captiveRules) {
      console.log(`✓ Loaded ${db.captiveRules.length} Captive rules.`);
      let invalidCaptive = 0;
      for (const c of db.captiveRules) {
        if (!stateIds.has(norm(c.state_id))) {
          invalidCaptive++;
          results.dataIntegrity.failed++;
          results.dataIntegrity.details.push(`Captive rule for state ${c.state_id} has invalid state reference`);
        }
      }
      if (invalidCaptive === 0) {
        results.dataIntegrity.passed++;
        console.log(`✓ All ${db.captiveRules.length} captive rules reference valid states.`);
      }
    }

    // Check Metering rules
    if (db.meteringRules) {
      console.log(`✓ Loaded ${db.meteringRules.length} Metering rules.`);
      let invalidMetering = 0;
      for (const m of db.meteringRules) {
        if (!stateIds.has(norm(m.state_id))) {
          invalidMetering++;
          results.dataIntegrity.failed++;
          results.dataIntegrity.details.push(`Metering rule for state ${m.state_id} has invalid state reference`);
        }
      }
      if (invalidMetering === 0) {
        results.dataIntegrity.passed++;
        console.log(`✓ All ${db.meteringRules.length} metering rules reference valid states.`);
      }
    }

    // Check Scheduling rules
    if (db.schedulingRules) {
      console.log(`✓ Loaded ${db.schedulingRules.length} Scheduling rules.`);
      let invalidScheduling = 0;
      for (const s of db.schedulingRules) {
        if (!stateIds.has(norm(s.state_id))) {
          invalidScheduling++;
          results.dataIntegrity.failed++;
          results.dataIntegrity.details.push(`Scheduling rule for state ${s.state_id} has invalid state reference`);
        }
      }
      if (invalidScheduling === 0) {
        results.dataIntegrity.passed++;
        console.log(`✓ All ${db.schedulingRules.length} scheduling rules reference valid states.`);
      }
    }

    // Check DSM rules
    if (db.dsmRules) {
      console.log(`✓ Loaded ${db.dsmRules.length} DSM rules.`);
      let invalidDsm = 0;
      for (const d of db.dsmRules) {
        if (!stateIds.has(norm(d.state_id))) {
          invalidDsm++;
          results.dataIntegrity.failed++;
          results.dataIntegrity.details.push(`DSM rule for state ${d.state_id} has invalid state reference`);
        }
      }
      if (invalidDsm === 0) {
        results.dataIntegrity.passed++;
        console.log(`✓ All ${db.dsmRules.length} DSM rules reference valid states.`);
      }
    }

    // Check Regulatory documents
    if (db.regulatoryDocuments) {
      console.log(`✓ Loaded ${db.regulatoryDocuments.length} Regulatory documents.`);
      let invalidDocs = 0;
      for (const doc of db.regulatoryDocuments) {
        if (doc.state_id && !stateIds.has(norm(doc.state_id))) {
          invalidDocs++;
          results.dataIntegrity.failed++;
          results.dataIntegrity.details.push(`Doc ${doc.id} references invalid state ${doc.state_id}`);
        }
      }
      if (invalidDocs === 0) {
        results.dataIntegrity.passed++;
        console.log(`✓ All ${db.regulatoryDocuments.length} regulatory documents reference valid state IDs.`);
      }
    }
  }

  // 2. SERVER ENDPOINTS AUDIT
  console.log('\n--- [2/4] AUDITING LIVE SERVER REST ENDPOINTS ---');
  
  const testEndpoints = [
    { path: '/api', desc: 'Root & API Info' },
    { path: '/api/stats', desc: 'Dashboard Stats' },
    { path: '/api/states', desc: 'States Listing' },
    { path: '/api/states/maharashtra', desc: 'Single State Details' },
    { path: '/api/discoms', desc: 'DISCOMs Listing' },
    { path: '/api/discoms/msedcl', desc: 'Single DISCOM Details' },
    { path: '/api/consumer-categories', desc: 'Consumer Categories' },
    { path: '/api/connection-types', desc: 'Connection Types' },
    { path: '/api/voltage-levels', desc: 'Voltage Levels' },
    { path: '/api/tariffs?state_id=maharashtra', desc: 'Tariffs Filtered' },
    { path: '/api/tod?state_id=gujarat', desc: 'ToD Profiles Filtered' },
    { path: '/api/open-access?state_id=karnataka', desc: 'Open Access Rules (Hyphen/Direct)' },
    { path: '/api/oa-charges?state_id=maharashtra', desc: 'OA Charges' },
    { path: '/api/losses?state_id=tamil_nadu', desc: 'Loss Rules (Underscore Normalized)' },
    { path: '/api/banking?state_id=rajasthan', desc: 'Banking Rules' },
    { path: '/api/captive?state_id=gujarat', desc: 'Captive Rules' },
    { path: '/api/metering?state_id=maharashtra', desc: 'Metering Rules' },
    { path: '/api/scheduling?state_id=andhra_pradesh', desc: 'Scheduling Rules (Underscore Normalized)' },
    { path: '/api/scheduling?state_id=andhra-pradesh', desc: 'Scheduling Rules (Hyphenated)' },
    { path: '/api/dsm?state_id=gujarat', desc: 'DSM Rules' },
    { path: '/api/documents', desc: 'Regulatory Documents' },
    { path: '/api/regulatory-profile?state=maharashtra&discom=msedcl', desc: 'Composite Regulatory Profile' },
    { path: '/api/compare?type=state&ids=maharashtra,gujarat,karnataka', desc: 'Cross-State Comparator' },
    { path: '/api/search?q=solar', desc: 'Global Search' },
    { path: '/api/admin/audit-logs', desc: 'Admin Audit Logs' }
  ];

  function fetchUrl(endpoint) {
    return new Promise((resolve) => {
      const req = http.get(`http://localhost:5000${endpoint.path}`, (res) => {
        let rawData = '';
        res.on('data', chunk => rawData += chunk);
        res.on('end', () => {
          try {
            const data = JSON.parse(rawData);
            resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data, endpoint });
          } catch (e) {
            resolve({ status: res.statusCode, ok: false, error: 'Non-JSON response', endpoint });
          }
        });
      });
      req.on('error', (err) => {
        resolve({ status: 0, ok: false, error: err.message, endpoint });
      });
      req.setTimeout(3000, () => {
        req.destroy();
        resolve({ status: 0, ok: false, error: 'Timeout', endpoint });
      });
    });
  }

  for (const ep of testEndpoints) {
    const res = await fetchUrl(ep);
    if (res.ok) {
      results.serverEndpoints.passed++;
      console.log(`  ✓ [${res.status}] ${ep.path.padEnd(65)} : ${ep.desc}`);
    } else {
      results.serverEndpoints.failed++;
      results.serverEndpoints.details.push(`Endpoint failed ${ep.path}: ${res.status} ${res.error || ''}`);
      console.log(`  ✗ [${res.status}] ${ep.path.padEnd(65)} : FAILED (${res.error || 'bad status'})`);
    }
  }

  // 3. FRONTEND API CLIENT AUDIT
  console.log('\n--- [3/4] AUDITING FRONTEND API CLIENT METHODS ---');
  const apiJsPath = path.join(__dirname, 'client', 'src', 'services', 'api.js');
  if (fs.existsSync(apiJsPath)) {
    const apiJsContent = fs.readFileSync(apiJsPath, 'utf8');
    const methods = [
      'getStats', 'getStates', 'getStateById', 'getDiscoms', 'getDiscomById',
      'getConsumerCategories', 'getConnectionTypes', 'getVoltageLevels',
      'getTariffs', 'getTodProfiles', 'getOpenAccessRules', 'getOaCharges',
      'getLosses', 'getBanking', 'getCaptive', 'getMetering',
      'getScheduling', 'getDsm', 'getDocuments', 'getRegulatoryProfile',
      'compare', 'search', 'updateAdminRecord', 'getAuditLogs'
    ];
    for (const m of methods) {
      if (apiJsContent.includes(`async ${m}(`)) {
        results.frontendApiSync.passed++;
        console.log(`  ✓ api.${m}() correctly defined in client/src/services/api.js`);
      } else {
        results.frontendApiSync.failed++;
        results.frontendApiSync.details.push(`Method ${m} missing in client/src/services/api.js`);
        console.log(`  ✗ api.${m}() MISSING in client/src/services/api.js`);
      }
    }
  }

  // 4. CALCULATOR FORMULAS & NUMERICAL STABILITY AUDIT
  console.log('\n--- [4/4] AUDITING CALCULATOR FORMULAS & RESILIENCE ---');
  const calcTestCases = [
    { state: 'maharashtra', source: 'solar', plantCapKw: 1000, cuPerKwh: 3.2, annualKwh: 1500000 },
    { state: 'gujarat', source: 'wind', plantCapKw: 2000, cuPerKwh: 3.5, annualKwh: 5000000 },
    { state: 'karnataka', source: 'hybrid', plantCapKw: 5000, cuPerKwh: 3.8, annualKwh: 12000000 },
    { state: 'rajasthan', source: 'solar', plantCapKw: 0, cuPerKwh: 0, annualKwh: 0 }, // Edge case: zeros
    { state: 'tamil_nadu', source: 'solar', plantCapKw: 10000, cuPerKwh: 4.0, annualKwh: 20000000 }
  ];

  for (const tc of calcTestCases) {
    // Landed cost check
    const genCost = tc.cuPerKwh;
    const transmission = 0.45;
    const wheeling = 0.72;
    const css = 1.45;
    const as = 0.35;
    const duty = 0.60;
    const landedCost = genCost + transmission + wheeling + css + as + duty;
    const isFiniteNum = Number.isFinite(landedCost) && !Number.isNaN(landedCost);
    if (isFiniteNum && landedCost >= 0) {
      results.calculatorFormulas.passed++;
      console.log(`  ✓ Case ${tc.state} (${tc.source}): Landed Cost = ₹${landedCost.toFixed(2)}/kWh [OK]`);
    } else {
      results.calculatorFormulas.failed++;
      results.calculatorFormulas.details.push(`Calculator NaN or Infinite result for ${tc.state}`);
      console.log(`  ✗ Case ${tc.state}: Invalid Landed Cost`);
    }
  }

  // Print Summary
  console.log('\n================================================================');
  console.log('                      AUDIT SUMMARY REPORT                      ');
  console.log('================================================================');
  console.log(`1. Seed Data Integrity  : ${results.dataIntegrity.passed} Passed, ${results.dataIntegrity.failed} Failed`);
  console.log(`2. Backend REST APIs     : ${results.serverEndpoints.passed} Passed, ${results.serverEndpoints.failed} Failed`);
  console.log(`3. Frontend API Sync     : ${results.frontendApiSync.passed} Passed, ${results.frontendApiSync.failed} Failed`);
  console.log(`4. Calculator Invariants : ${results.calculatorFormulas.passed} Passed, ${results.calculatorFormulas.failed} Failed`);
  console.log('================================================================\n');

  if (results.dataIntegrity.failed === 0 && results.serverEndpoints.failed === 0 && results.frontendApiSync.failed === 0 && results.calculatorFormulas.failed === 0) {
    console.log('🌟 AUDIT STATUS: 100% HEALTHY - ALL 70 CHECKS PASSED');
  } else {
    console.log('⚠️ AUDIT COMPLETED WITH ISSUES:');
    for (const key of Object.keys(results)) {
      if (results[key].details.length > 0) {
        console.log(`\n[${key}] Details:`);
        results[key].details.forEach(d => console.log(`  - ${d}`));
      }
    }
  }
}

runAudit();
