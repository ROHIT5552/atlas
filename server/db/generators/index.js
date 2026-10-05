const fs = require('fs');
const path = require('path');

const { states } = require('./states');
const { discoms } = require('./discoms');
const { consumerCategories, connectionTypes, voltageLevels } = require('./categoriesVoltages');
const { tariffs, todProfiles } = require('./tariffsTod');
const { openAccessRules, oaCharges, lossRules } = require('./openAccessChargesLosses');
const { bankingRules, captiveRules } = require('./bankingCaptive');
const { meteringRules, schedulingRules, dsmRules } = require('./meteringSchedulingDsm');
const { regulatoryDocuments } = require('./documents');

const seedDir = path.join(__dirname, '..', 'seedData');
if (!fs.existsSync(seedDir)) {
  fs.mkdirSync(seedDir, { recursive: true });
}

const datasets = {
  'states.json': states,
  'discoms.json': discoms,
  'consumerCategories.json': consumerCategories,
  'connectionTypes.json': connectionTypes,
  'voltageLevels.json': voltageLevels,
  'tariffs.json': tariffs,
  'todProfiles.json': todProfiles,
  'openAccessRules.json': openAccessRules,
  'oaCharges.json': oaCharges,
  'lossRules.json': lossRules,
  'bankingRules.json': bankingRules,
  'captiveRules.json': captiveRules,
  'meteringRules.json': meteringRules,
  'schedulingRules.json': schedulingRules,
  'dsmRules.json': dsmRules,
  'regulatoryDocuments.json': regulatoryDocuments
};

console.log('--- Generating NewRa Regulatory Library Seed Data ---');

Object.entries(datasets).forEach(([filename, data]) => {
  const filePath = path.join(seedDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✓ Wrote ${filename} (${Array.isArray(data) ? data.length + ' records' : 'Object'})`);
});

console.log('All seed datasets successfully generated!');

