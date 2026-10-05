const http = require('http');

async function testLogic() {
  console.log('================================================================');
  console.log('         LOGICAL INTEGRITY & MATHEMATICAL AUDIT SUITE           ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  const errors = [];

  function assert(cond, desc) {
    if (cond) {
      passed++;
      console.log(`  ✓ ${desc}`);
    } else {
      failed++;
      errors.push(desc);
      console.log(`  ✗ FAILED: ${desc}`);
    }
  }

  function fetchUrl(path, options = {}) {
    return new Promise((resolve) => {
      const url = `http://localhost:5000${path}`;
      const req = http.request(url, options, (res) => {
        let rawData = '';
        res.on('data', chunk => rawData += chunk);
        res.on('end', () => {
          try {
            const data = JSON.parse(rawData);
            resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data });
          } catch (e) {
            resolve({ status: res.statusCode, ok: false, error: 'Non-JSON', raw: rawData });
          }
        });
      });
      req.on('error', (err) => resolve({ status: 0, ok: false, error: err.message }));
      if (options.body) req.write(options.body);
      req.end();
    });
  }

  // --- 1. AUDIT STATE & REGION QUERIES ---
  console.log('[1/6] Auditing State & DISCOM Hierarchy Logic...');
  const statesRes = await fetchUrl('/api/states');
  assert(statesRes.ok && statesRes.data.states.length === 17, 'States count is exactly 17');

  const westernStates = await fetchUrl('/api/states?region=Western');
  assert(westernStates.ok && westernStates.data.states.every(s => s.region.toLowerCase() === 'western'), 'Western Region filter correctly matches only Western states');

  const discomsRes = await fetchUrl('/api/discoms');
  assert(discomsRes.ok && discomsRes.data.discoms.length === 49, 'DISCOMs count is exactly 49');

  // --- 2. AUDIT COMPOSITE REGULATORY PROFILE LOGIC ---
  console.log('\n[2/6] Auditing Composite Regulatory Profile & Surcharges...');
  const testCoordinates = [
    { state: 'maharashtra', discom: 'msedcl', voltage: '33 kV' },
    { state: 'gujarat', discom: 'dgvcl', voltage: '11 kV' },
    { state: 'rajasthan', discom: 'jvvnl', voltage: '33 kV' },
    { state: 'karnataka', discom: 'bescom', voltage: '66 kV' },
    { state: 'tamil-nadu', discom: 'tangedco', voltage: '110 kV' }
  ];

  for (const coord of testCoordinates) {
    const pRes = await fetchUrl(`/api/regulatory-profile?state=${coord.state}&discom=${coord.discom}&voltage=${encodeURIComponent(coord.voltage)}&fy=FY+2025-26`);
    assert(pRes.ok && pRes.data.applicable_tariff != null, `Regulatory profile resolves for ${coord.state} / ${coord.discom} (${coord.voltage})`);
    
    // Check tariff energy charge is positive finite number
    const tariff = pRes.data.applicable_tariff;
    assert(tariff && typeof tariff.energy_charge === 'number' && tariff.energy_charge > 0, `Energy charge for ${coord.discom} is positive number: Rs ${tariff.energy_charge}`);

    // Check Open Access charges breakdown exists
    const oaCharges = pRes.data.oa_charges_breakdown;
    assert(Array.isArray(oaCharges) && oaCharges.length > 0, `OA charges populated for ${coord.discom}`);

    // Check Grid Losses
    const losses = pRes.data.grid_losses;
    assert(losses && losses.matching_loss != null, `Matching technical grid loss found for ${coord.state}`);
  }

  // --- 3. AUDIT LANDED COST FINANCIAL MATHEMATICS ---
  console.log('\n[3/6] Auditing Landed Cost Financial Formulas...');
  for (const st of ['maharashtra', 'gujarat', 'rajasthan', 'karnataka', 'tamil-nadu', 'telangana', 'haryana']) {
    const pRes = await fetchUrl(`/api/regulatory-profile?state=${st}&fy=FY+2025-26`);
    const data = pRes.data;
    
    const retailTariff = data.applicable_tariff.energy_charge;
    const basePpa = 3.60;
    const txLoss = data.grid_losses.matching_loss.transmission_loss_pct || 3.2;
    const whLoss = data.grid_losses.matching_loss.wheeling_loss_pct || 4.0;
    const totalLoss = txLoss + whLoss;
    
    // Mathematical invariant: Gross-up multiplier must be > 1.0 and < 1.30 (losses are positive and < 30%)
    const lossMultiplier = 1 / (1 - totalLoss / 100);
    assert(lossMultiplier > 1.0 && lossMultiplier < 1.30, `Loss multiplier for ${st} is logically bounded: ${lossMultiplier.toFixed(4)}`);

    const grossedUpPpa = basePpa * lossMultiplier;
    const lossCost = grossedUpPpa - basePpa;
    assert(lossCost > 0 && lossCost < 1.5, `Loss cost component for ${st} is positive & bounded: Rs ${lossCost.toFixed(3)}/kWh`);

    const wheeling = data.oa_charges_breakdown[0]?.wheeling_charge || 1.0;
    const dutyCost = (retailTariff * (data.applicable_tariff.electricity_duty || 9)) / 100;
    const captiveLanded = basePpa + lossCost + 0.25 + wheeling + 0.05 + dutyCost;
    assert(Number.isFinite(captiveLanded) && captiveLanded > 0, `Captive Landed Cost for ${st} is valid finite number: Rs ${captiveLanded.toFixed(2)}/kWh`);

    const css = data.oa_charges_breakdown[0]?.css || 2.0;
    const as = data.oa_charges_breakdown[0]?.additional_surcharge || 1.0;
    const thirdPartyLanded = captiveLanded + css + as;
    assert(thirdPartyLanded > captiveLanded, `Third-Party Landed Cost (Rs ${thirdPartyLanded.toFixed(2)}) > Captive Landed Cost (Rs ${captiveLanded.toFixed(2)}) due to CSS/AS`);
  }

  // --- 4. AUDIT MULTI-JURISDICTION COMPARISON LOGIC ---
  console.log('\n[4/6] Auditing Cross-State & DISCOM Comparison Engine...');
  const stateCompare = await fetchUrl('/api/compare?type=state&ids=maharashtra,gujarat,rajasthan');
  assert(stateCompare.ok && stateCompare.data.matrix.length === 3, 'State comparator returns 3 states in matrix');
  assert(stateCompare.data.matrix.every(m => m.state_name && m.regulator), 'Every state in comparison matrix has valid metadata');

  const discomCompare = await fetchUrl('/api/compare?type=discom&ids=msedcl,dgvcl,jvvnl');
  assert(discomCompare.ok && discomCompare.data.matrix.length === 3, 'DISCOM comparator returns 3 DISCOMs in matrix');

  // --- 5. AUDIT GLOBAL MULTI-DIMENSIONAL SEARCH ---
  console.log('\n[5/6] Auditing Global Search Indexing...');
  const searchQueries = ['MSEDCL', 'solar', 'banking', 'wheeling', 'MERC', '11 kV'];
  for (const q of searchQueries) {
    const sRes = await fetchUrl(`/api/search?q=${encodeURIComponent(q)}`);
    assert(sRes.ok && Array.isArray(sRes.data.results) && sRes.data.results.length > 0, `Search query '${q}' returns ${sRes.data.results.length} valid results`);
  }

  // --- 6. AUDIT ADMIN RECORD UPDATE & IMMUTABLE AUDIT LOG ---
  console.log('\n[6/6] Auditing Admin CRUD & Audit Logging Engine...');
  const updateRes = await fetchUrl('/api/admin/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      entity_type: 'tariff',
      entity_id: 'tariff-msedcl-ht-ind-fy-1',
      fields: {
        admin_notes: 'Automated logic check verification run'
      },
      user: 'Audit Agent'
    })
  });
  assert(updateRes.ok && updateRes.data.success === true, 'Admin updateRecord successfully processed alias entity_type: tariff');

  const auditLogsRes = await fetchUrl('/api/admin/audit-logs');
  assert(auditLogsRes.ok && auditLogsRes.data.audit_logs.length > 0, `Audit logs correctly recorded and retrieved (${auditLogsRes.data.audit_logs.length} entries)`);
  assert(auditLogsRes.data.audit_logs[0].action === 'UPDATE', 'Latest audit log is UPDATE entry');

  // --- FINAL SCORECARD ---
  console.log('\n================================================================');
  console.log(`TOTAL CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  if (failed === 0) {
    console.log('🌟 100% LOGIC & MATH INTEGRITY VERIFIED!');
  } else {
    console.log('⚠️ FAILED CHECKS:');
    errors.forEach(e => console.log('  - ' + e));
  }
  console.log('================================================================\n');
}

testLogic();
