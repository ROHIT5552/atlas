const consumerCategories = [
  {
    id: 'ht-industrial-cont',
    code: 'HT-IND-CONT',
    name: 'HT Industrial (Continuous / 24x7 Process)',
    type: 'Industrial',
    voltage_applicability: ['11 kV', '22 kV', '33 kV', '66 kV', '110 kV', '132 kV', '220 kV'],
    description: 'Continuous chemical, cement, metals, glass, pharma, and automotive manufacturing plants.'
  },
  {
    id: 'ht-industrial-noncont',
    code: 'HT-IND-NONCONT',
    name: 'HT Industrial (General / Non-Continuous Shift)',
    type: 'Industrial',
    voltage_applicability: ['11 kV', '22 kV', '33 kV'],
    description: 'General fabrication, textiles, packaging, plastic molding, and discrete engineering facilities.'
  },
  {
    id: 'ht-commercial',
    code: 'HT-COMM',
    name: 'HT Commercial & Institutional (Malls, IT Parks, Hotels, Hospitals)',
    type: 'Commercial',
    voltage_applicability: ['11 kV', '22 kV', '33 kV'],
    description: 'Commercial towers, shopping complexes, IT/ITeS data campuses, corporate offices, large healthcare.'
  },
  {
    id: 'eht-heavy-industrial',
    code: 'EHT-HEAVY-IND',
    name: 'EHT Heavy Industrial (Steel, Aluminium Smelters, Ferro Alloys)',
    type: 'Industrial',
    voltage_applicability: ['66 kV', '110 kV', '132 kV', '220 kV', '400 kV'],
    description: 'Heavy energy-intensive metallurgical, chlor-alkali, smelters, and large bulk industrial parks.'
  },
  {
    id: 'lt-industrial-md',
    code: 'LT-IND-MD',
    name: 'LT Industrial (Demand Metered >= 20 kW to 100 kW)',
    type: 'Industrial',
    voltage_applicability: ['415 V'],
    description: 'Light engineering, food processing, small machine shops, cold storages.'
  },
  {
    id: 'lt-commercial-md',
    code: 'LT-COMM-MD',
    name: 'LT Commercial (Non-Domestic Demand Metered)',
    type: 'Commercial',
    voltage_applicability: ['230 V', '415 V'],
    description: 'Retail stores, banks, restaurants, commercial establishments, warehouses.'
  },
  {
    id: 'ev-charging-station',
    code: 'EV-CHARGING',
    name: 'Public EV Charging Station (PCS)',
    type: 'EV Charging',
    voltage_applicability: ['415 V', '11 kV', '33 kV'],
    description: 'Dedicated public fast-charging plazas, fleet hubs, and highway battery swapping stations.'
  },
  {
    id: 'railway-traction-bulk',
    code: 'RLY-TRACTION',
    name: 'Railway Traction / Metro Rail Bulk Supply',
    type: 'Bulk / Traction',
    voltage_applicability: ['25 kV', '33 kV', '66 kV', '110 kV', '132 kV', '220 kV'],
    description: 'High-speed rail, Indian Railways traction substations, and Urban Metro rail networks.'
  },
  {
    id: 'public-water-works',
    code: 'PWW-SEWAGE',
    name: 'Public Water Works & Sewage Pumping',
    type: 'Public Services',
    voltage_applicability: ['415 V', '11 kV', '33 kV'],
    description: 'Municipal water supply pumping stations, sewage treatment plants (STPs), and drainage.'
  },
  {
    id: 'agriculture-ht-lift',
    code: 'AGRI-LIFT-IRR',
    name: 'Agriculture & Lift Irrigation Schemes',
    type: 'Agricultural',
    voltage_applicability: ['415 V', '11 kV', '33 kV'],
    description: 'Government and cooperative lift irrigation pumping networks and farm irrigation.'
  }
];

const connectionTypes = [
  { id: 'lt', code: 'LT', name: 'Low Tension (LT)', voltage_range: '< 1 kV (230 V / 415 V)' },
  { id: 'ht', code: 'HT', name: 'High Tension (HT)', voltage_range: '11 kV to 33 kV' },
  { id: 'eht', code: 'EHT', name: 'Extra High Tension (EHT)', voltage_range: '66 kV to 400 kV' },
  { id: 'oa-consumer', code: 'OA-CONS', name: 'Open Access Consumer (Third Party / Exchange)', voltage_range: '11 kV and above' },
  { id: 'geoa-consumer', code: 'GEOA-CONS', name: 'Green Energy Open Access Consumer', voltage_range: '11 kV and above (100 kW+)' },
  { id: 'captive-user', code: 'CAPTIVE', name: 'Captive / Group Captive Consumer', voltage_range: '11 kV and above' }
];

const voltageLevels = [
  { id: '230v', code: '230 V', value_kv: 0.23, tier: 'LT', unit: 'V' },
  { id: '415v', code: '415 V', value_kv: 0.415, tier: 'LT', unit: 'V' },
  { id: '11kv', code: '11 kV', value_kv: 11.0, tier: 'HT', unit: 'kV' },
  { id: '22kv', code: '22 kV', value_kv: 22.0, tier: 'HT', unit: 'kV' },
  { id: '33kv', code: '33 kV', value_kv: 33.0, tier: 'HT', unit: 'kV' },
  { id: '66kv', code: '66 kV', value_kv: 66.0, tier: 'EHT', unit: 'kV' },
  { id: '110kv', code: '110 kV', value_kv: 110.0, tier: 'EHT', unit: 'kV' },
  { id: '132kv', code: '132 kV', value_kv: 132.0, tier: 'EHT', unit: 'kV' },
  { id: '220kv', code: '220 kV', value_kv: 220.0, tier: 'EHT', unit: 'kV' },
  { id: '400kv', code: '400 kV', value_kv: 400.0, tier: 'EHT', unit: 'kV' }
];

module.exports = { consumerCategories, connectionTypes, voltageLevels };

