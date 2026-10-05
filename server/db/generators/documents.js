const { states } = require('./states');

const regulatoryDocuments = [];
let docIdCounter = 1;

states.forEach(state => {
  const docTemplates = [
    {
      title: `${state.regulator_code} Multi-Year Tariff Order FY 2025-26`,
      category: 'Tariff Order',
      doc_no: `${state.regulator_code}/TO/2024/01`,
      pub_date: '2024-12-15',
      eff_date: '2025-04-01',
      size_mb: 4.8,
      summary: `Comprehensive Multi-Year Retail Tariff Order for state distribution licensees covering FY 2025-26 tariff schedules, demand charges, TOD slots, and Cross Subsidy Surcharges.`
    },
    {
      title: `${state.regulator_code} Green Energy Open Access (GEOA) Regulations`,
      category: 'Green Energy OA Regulation',
      doc_no: `${state.regulator_code}/GEOA/REG-2023`,
      pub_date: '2023-08-20',
      eff_date: '2023-09-01',
      size_mb: 1.9,
      summary: `State framework aligned with Ministry of Power GEOA Rules allowing 100 kW minimum demand, uniform charges, and single-window approval registry.`
    },
    {
      title: `${state.regulator_code} Intra-State Open Access & Grid Connectivity Regulations`,
      category: 'Open Access Regulation',
      doc_no: `${state.regulator_code}/OA/2024`,
      pub_date: '2024-03-10',
      eff_date: '2024-04-01',
      size_mb: 2.6,
      summary: `Detailed terms and conditions for grant of Short-Term, Medium-Term, and Long-Term Open Access on transmission and distribution systems.`
    },
    {
      title: `${state.regulator_code} Renewable Energy Banking Framework Guidelines`,
      category: 'Banking Regulation',
      doc_no: `${state.regulator_code}/RE-BANK/2024`,
      pub_date: '2024-05-18',
      eff_date: '2024-06-01',
      size_mb: 1.4,
      summary: `Governing rules for energy banking, banking charges, TOD cross-settlement restrictions, and end-of-year surplus compensation.`
    },
    {
      title: `${state.regulator_code} Deviation Settlement Mechanism & Scheduling Code`,
      category: 'DSM Regulation',
      doc_no: `${state.regulator_code}/DSM/2024/04`,
      pub_date: '2024-01-25',
      eff_date: '2024-04-01',
      size_mb: 3.1,
      summary: `Operational regulations governing 15-minute time block scheduling, RE forecasting, error tolerance bands (±10%), and state deviation pool settlement.`
    },
    {
      title: `${state.stu_code} Grid Connectivity & Transmission Procedures`,
      category: 'STU Procedure',
      doc_no: `${state.stu_code}/PROC/CONN/2024`,
      pub_date: '2024-06-30',
      eff_date: '2024-07-15',
      size_mb: 2.2,
      summary: `Technical specifications for substation bay allocation, dedicated feeder construction, telemetry SCADA integration, and check metering.`
    },
    {
      title: `${state.sldc_code} Real-time Open Access Scheduling Manual`,
      category: 'SLDC Procedure',
      doc_no: `${state.sldc_code}/SCH/OA/2024`,
      pub_date: '2024-02-14',
      eff_date: '2024-03-01',
      size_mb: 1.8,
      summary: `Operating procedure for QCA registration, day-ahead schedule submissions, 16 revision windows, and real-time curtailment priority.`
    }
  ];

  docTemplates.forEach(item => {
    regulatoryDocuments.push({
      id: `doc-${state.id}-${docIdCounter++}`,
      title: item.title,
      state_id: state.id,
      authority: item.category.includes('STU') ? state.stu_name : item.category.includes('SLDC') ? state.sldc_name : state.regulator_name,
      document_category: item.category,
      document_number: item.doc_no,
      publication_date: item.pub_date,
      effective_date: item.eff_date,
      expiry_date: '2027-03-31',
      file_size_mb: item.size_mb,
      download_url: `${state.regulator_website}/documents/${item.doc_no.replace(/\//g, '_')}.pdf`,
      summary: item.summary,
      status: 'Active',
      verification_badge: 'Official Verified'
    });
  });
});

module.exports = { regulatoryDocuments };

