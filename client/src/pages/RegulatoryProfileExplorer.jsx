import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MapPin,
  Building2,
  Receipt,
  Clock,
  Unlock,
  PiggyBank,
  Factory,
  Gauge,
  CalendarClock,
  FileText,
  Download,
  Share2,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Layers,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import TodTimeline from '../components/TodTimeline';
import ExecutiveDossierModal from '../components/ExecutiveDossierModal';

export default function RegulatoryProfileExplorer({ preselectedState, preselectedDiscom }) {
  // Cascading Selector States
  const [states, setStates] = useState([]);
  const [discoms, setDiscoms] = useState([]);
  const [consumerCategories, setConsumerCategories] = useState([]);
  const [voltageLevels, setVoltageLevels] = useState([]);

  const [selectedState, setSelectedState] = useState(preselectedState || 'maharashtra');
  const [selectedDiscom, setSelectedDiscom] = useState(preselectedDiscom || 'msedcl');
  const [selectedCategory, setSelectedCategory] = useState('ht-industrial-cont');
  const [selectedVoltage, setSelectedVoltage] = useState('33 kV');
  const [selectedFy, setSelectedFy] = useState('FY 2025-26');

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('tariff');
  const [copiedApi, setCopiedApi] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);


  // Sync with incoming props from parent
  useEffect(() => {
    if (preselectedState) setSelectedState(preselectedState);
  }, [preselectedState]);

  useEffect(() => {
    if (preselectedDiscom) setSelectedDiscom(preselectedDiscom);
  }, [preselectedDiscom]);

  // Load initial dropdown metadata
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [statesRes, catRes, voltRes] = await Promise.all([
          api.getStates(),
          api.getConsumerCategories(),
          api.getVoltageLevels()
        ]);
        setStates(statesRes.states || []);
        setConsumerCategories(catRes.categories || []);
        setVoltageLevels(voltRes.voltage_levels || []);
      } catch (err) {
        console.error('Failed to load metadata:', err);
      }
    }
    loadMetadata();
  }, []);

  // Update DISCOMs when State changes
  useEffect(() => {
    async function loadDiscomsForState() {
      if (!selectedState) return;
      try {
        const res = await api.getDiscoms({ state_id: selectedState });
        const list = res.discoms || [];
        setDiscoms(list);
        if (list.length > 0) {
          // If current discom is not in list, pick first
          if (!list.some(d => d.id === selectedDiscom)) {
            setSelectedDiscom(list[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load discoms for state:', err);
      }
    }
    loadDiscomsForState();
  }, [selectedState]);

  // Fetch Full Regulatory Profile on Filter change
  useEffect(() => {
    async function fetchProfile() {
      if (!selectedState || !selectedDiscom) return;
      try {
        setLoading(true);
        const data = await api.getRegulatoryProfile({
          state: selectedState,
          discom: selectedDiscom,
          consumer_category: selectedCategory,
          voltage: selectedVoltage,
          fy: selectedFy
        });
        setProfile(data);
      } catch (err) {
        console.error('Failed to fetch regulatory profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [selectedState, selectedDiscom, selectedCategory, selectedVoltage, selectedFy]);

  const handleCopyApiUrl = () => {
    const url = `${window.location.origin}/api/regulatory-profile?state=${selectedState}&discom=${selectedDiscom}&consumer_category=${selectedCategory}&voltage=${encodeURIComponent(selectedVoltage)}&fy=${encodeURIComponent(selectedFy)}`;
    navigator.clipboard.writeText(url);
    setCopiedApi(true);
    setTimeout(() => setCopiedApi(false), 2000);
  };

  const handleExportJSON = () => {
    if (!profile) return;
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newra-regulatory-profile-${selectedState}-${selectedDiscom}-${selectedFy.replace(/[^a-zA-Z0-9]/g, '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabOptions = [
    { id: 'tariff', label: '1. Applicable Tariff', icon: Receipt },
    { id: 'tod', label: '2. TOD Schedule', icon: Clock },
    { id: 'demand-pf', label: '3. Demand & PF Rules', icon: Gauge },
    { id: 'open-access', label: '4. Open Access & GEOA', icon: Unlock },
    { id: 'charges-losses', label: '5. Grid Charges & Losses', icon: Layers },
    { id: 'banking', label: '6. Banking Framework', icon: PiggyBank },
    { id: 'captive', label: '7. Captive Rules (26/51%)', icon: Factory },
    { id: 'metering', label: '8. Metering & Telemetry', icon: Gauge },
    { id: 'scheduling-dsm', label: '9. Scheduling & DSM', icon: CalendarClock },
    { id: 'regulations', label: '10. Source Regulations', icon: FileText }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Primary Query Workflow</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
            Complete Electricity Regulatory Profile
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Select a State, DISCOM, Consumer Category, Voltage, and Financial Year to view every applicable retail tariff, TOD curve, Open Access charge, loss, banking rule, and statutory requirement in one unified profile.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDossierOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            <span>Due Diligence Dossier</span>
          </button>
          <button
            onClick={handleCopyApiUrl}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            {copiedApi ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedApi ? 'API Link Copied!' : 'Copy API'}</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-sm shadow-teal-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Cascading Filter Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            Interactive Cascading Selector
          </span>
          <span className="text-xs text-slate-400 font-mono">
            State â†’ DISCOM â†’ Category â†’ Voltage â†’ FY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. State Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-teal-400" />
              <span>1. State</span>
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 text-xs font-semibold focus:border-teal-400 focus:outline-none cursor-pointer"
            >
              {states.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.state_code})
                </option>
              ))}
            </select>
          </div>

          {/* 2. DISCOM Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-sky-400" />
              <span>2. DISCOM</span>
            </label>
            <select
              value={selectedDiscom}
              onChange={(e) => setSelectedDiscom(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 text-xs font-semibold focus:border-teal-400 focus:outline-none cursor-pointer"
            >
              {discoms.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.short_name || d.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Consumer Category */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <Receipt className="w-3 h-3 text-amber-400" />
              <span>3. Category</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 text-xs font-semibold focus:border-teal-400 focus:outline-none cursor-pointer"
            >
              {consumerCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Voltage Level */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <Layers className="w-3 h-3 text-indigo-400" />
              <span>4. Voltage</span>
            </label>
            <select
              value={selectedVoltage}
              onChange={(e) => setSelectedVoltage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 text-xs font-semibold focus:border-teal-400 focus:outline-none cursor-pointer"
            >
              {voltageLevels.map((v) => (
                <option key={v.id} value={v.code}>
                  {v.code} ({v.tier})
                </option>
              ))}
            </select>
          </div>

          {/* 5. Financial Year / Version */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <CalendarClock className="w-3 h-3 text-teal-400" />
              <span>5. Financial Year</span>
            </label>
            <select
              value={selectedFy}
              onChange={(e) => setSelectedFy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 text-xs font-semibold focus:border-teal-400 focus:outline-none cursor-pointer"
            >
              <option value="FY 2025-26">FY 2025-26 (Current Active)</option>
              <option value="FY 2024-25">FY 2024-25 (Historical)</option>
              <option value="FY 2026-27">FY 2026-27 (Draft Order)</option>
            </select>
          </div>
        </div>
      </div>

      {loading || !profile ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-300">Retrieving full multi-dimensional regulatory profile...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top KPI Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Energy Charge */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm hover:border-slate-700 transition">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Base Energy Charge</span>
                <StatusBadge status={profile.applicable_tariff?.verification_status} />
              </div>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-teal-400 font-mono">
                  Rs {profile.applicable_tariff?.energy_charge || 'N/A'}
                </span>
                <span className="text-xs text-slate-400">/{profile.applicable_tariff?.energy_charge_unit || 'kVAh'}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                Duty: {profile.applicable_tariff?.electricity_duty}% | FAC: Rs {profile.applicable_tariff?.fac_fppas}
              </p>
            </div>

            {/* Demand Charge */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm hover:border-slate-700 transition">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Demand / Fixed Charge
              </div>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-100 font-mono">
                  Rs {profile.applicable_tariff?.demand_charge || 'N/A'}
                </span>
                <span className="text-xs text-slate-400">/{profile.applicable_tariff?.demand_charge_unit || 'kVA/mo'}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Billing Demand: 85% Contract Demand
              </p>
            </div>

            {/* Cross Subsidy Surcharge (CSS) */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm hover:border-slate-700 transition">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Cross Subsidy Surcharge</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold">OA Surcharge</span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-amber-400 font-mono">
                  Rs {profile.oa_charges_breakdown?.[0]?.css || 'N/A'}
                </span>
                <span className="text-xs text-slate-400">/kWh</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Captive Route: <strong className="text-emerald-400">100% Exempted</strong>
              </p>
            </div>

            {/* Total Technical Loss (Matching Voltage) */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm hover:border-slate-700 transition">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Grid Loss ({selectedVoltage})
              </div>
              <div className="mt-1.5 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-sky-400 font-mono">
                  {profile.grid_losses?.matching_loss?.total_technical_loss_pct || '4.50'}%
                </span>
                <span className="text-xs text-slate-400">In-Kind Deduction</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Tx: {profile.grid_losses?.matching_loss?.transmission_loss_pct}% | Wh: {profile.grid_losses?.matching_loss?.wheeling_loss_pct}%
              </p>
            </div>
          </div>

          {/* Navigation Sub-Tabs Bar */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-800/80 scrollbar-none">
            {tabOptions.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-800 text-teal-300 shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5">
            {/* 1. APPLICABLE TARIFF */}
            {activeSubTab === 'tariff' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Retail Supply Tariff Schedule</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {profile.applicable_tariff?.tariff_category_name} for {profile.applicable_tariff?.voltage_level} connection under {profile.discom_master?.name}
                    </p>
                  </div>
                  <StatusBadge status={profile.applicable_tariff?.verification_status} showWarningBanner={true} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="text-xs text-slate-400 font-semibold uppercase">Energy Charge</div>
                    <div className="text-xl font-mono font-extrabold text-cyan-400">
                      Rs {profile.applicable_tariff?.energy_charge} / {profile.applicable_tariff?.energy_charge_unit}
                    </div>
                    <p className="text-xs text-slate-500">
                      Standard base variable rate per unit drawn.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="text-xs text-slate-400 font-semibold uppercase">Demand Charge</div>
                    <div className="text-xl font-mono font-extrabold text-white">
                      Rs {profile.applicable_tariff?.demand_charge} / {profile.applicable_tariff?.demand_charge_unit}
                    </div>
                    <p className="text-xs text-slate-500">
                      Fixed monthly charge on billing demand.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="text-xs text-slate-400 font-semibold uppercase">Fuel & Taxes (FAC + ED)</div>
                    <div className="text-xl font-mono font-extrabold text-amber-400">
                      {profile.applicable_tariff?.electricity_duty}% + Rs {profile.applicable_tariff?.fac_fppas}/u
                    </div>
                    <p className="text-xs text-slate-500">
                      Electricity Duty ({profile.applicable_tariff?.electricity_duty}%) plus FPPAS/FAC.
                    </p>
                  </div>
                </div>

                {/* Source Verification Box */}
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Regulatory Order Citation</span>
                  </div>
                  <p className="text-slate-400">
                    Order Ref: <span className="text-slate-200 font-medium">{profile.applicable_tariff?.source_document}</span> | Location: <span className="text-slate-300">{profile.applicable_tariff?.source_page}</span>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Effective Validity: {profile.applicable_tariff?.effective_from} to {profile.applicable_tariff?.effective_until} ({profile.applicable_tariff?.financial_year})
                  </p>
                </div>
              </div>
            )}

            {/* 2. TOD SCHEDULE */}
            {activeSubTab === 'tod' && (
              <div>
                <TodTimeline
                  todProfile={profile.tod_profile}
                  baseEnergyRate={profile.applicable_tariff?.energy_charge}
                />
              </div>
            )}

            {/* 3. DEMAND & POWER FACTOR RULES */}
            {activeSubTab === 'demand-pf' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Demand & Power Factor Rules</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Billing demand calculation guidelines, low PF surcharges, and high PF incentives.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* PF Incentive */}
                  <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>Power Factor Incentive (&gt; 0.95)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {profile.applicable_tariff?.power_factor_incentive || '0.5% rebate on energy bill for every 0.01 PF increase above 0.95 up to unity (1.00 max 3.5% rebate).'}
                    </p>
                  </div>

                  {/* PF Penalty */}
                  <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-3">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                      <TrendingDown className="w-4 h-4" />
                      <span>Power Factor Penalty (&lt; 0.90)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {profile.applicable_tariff?.power_factor_penalty || '1.0% surcharge on monthly bill for every 0.01 PF drop below 0.90 down to 0.85; 2.0% for every 0.01 below 0.85.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <h4 className="font-bold text-white">Billing Demand Methodology</h4>
                  <p className="text-slate-400">
                    The monthly billing demand shall be the highest of:
                  </p>
                  <ul className="list-disc list-inside text-slate-300 space-y-1 ml-2 font-mono text-[11px]">
                    <li>Actual Maximum Demand recorded during the billing month (kVA)</li>
                    <li>85% of the Contracted Demand (kVA)</li>
                    <li>Minimum threshold capacity prescribed in DISCOM tariff schedule (e.g. 50 kVA or 100 kVA)</li>
                  </ul>
                </div>
              </div>
            )}

            {/* 4. OPEN ACCESS & GEOA */}
            {activeSubTab === 'open-access' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Open Access Eligibility & GEOA Framework</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Eligibility thresholds, durations, nodal agencies, and approval timelines.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs font-semibold text-slate-400 uppercase">Conventional OA Threshold</div>
                    <div className="text-2xl font-bold font-mono text-cyan-400">
                      {profile.open_access_eligibility?.oa_threshold_conventional_mw || 1.0} MW
                    </div>
                    <p className="text-xs text-slate-500">Minimum connected contract demand.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/40 space-y-2">
                    <div className="text-xs font-semibold text-emerald-400 uppercase">Green Energy OA (GEOA)</div>
                    <div className="text-2xl font-bold font-mono text-emerald-400">
                      {profile.open_access_eligibility?.oa_threshold_green_energy_kw || 100} kW
                    </div>
                    <p className="text-xs text-slate-500">No limit for captive renewable power.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs font-semibold text-slate-400 uppercase">Approval Turnaround</div>
                    <div className="text-2xl font-bold font-mono text-white">
                      {profile.open_access_eligibility?.approval_turnaround_days || 15} Days
                    </div>
                    <p className="text-xs text-slate-500">Single window clearance portal.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
                  <h4 className="font-bold text-slate-200">Open Access Categories & Nodal Agencies</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="font-semibold text-cyan-400">Short-Term OA (STOA):</span>
                      <p className="text-slate-400 mt-1">Duration: Up to 1 Month | Nodal Agency: {profile.open_access_eligibility?.nodal_agency_st || 'SLDC'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="font-semibold text-indigo-400">Medium & Long-Term (MTOA/LTOA):</span>
                      <p className="text-slate-400 mt-1">Duration: 3 Mos to 25 Yrs | Nodal Agency: {profile.open_access_eligibility?.nodal_agency_lt_mt || 'STU'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. GRID CHARGES & LOSSES */}
            {activeSubTab === 'charges-losses' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Open Access Charges & Technical Loss Matrix</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Itemized wheeling charges, transmission charges, surcharges, and voltage losses for FY 2025-26.
                  </p>
                </div>

                {/* Charges Table */}
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">OA Route</th>
                        <th className="px-4 py-3">Wheeling</th>
                        <th className="px-4 py-3">Transmission</th>
                        <th className="px-4 py-3">CSS (Rs/kWh)</th>
                        <th className="px-4 py-3">AS (Rs/kWh)</th>
                        <th className="px-4 py-3">Total Landed Surcharges</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
                      {profile.oa_charges_breakdown?.map((charge, cIdx) => {
                        const totalSurcharges = Number((charge.css + charge.additional_surcharge).toFixed(2));
                        return (
                          <tr key={cIdx} className="hover:bg-slate-900/50">
                            <td className="px-4 py-3 font-semibold text-white">{charge.oa_type}</td>
                            <td className="px-4 py-3 font-mono">Rs {charge.wheeling_charge} / kWh</td>
                            <td className="px-4 py-3 font-mono">Rs {charge.transmission_charge} / MW/day</td>
                            <td className="px-4 py-3 font-mono text-amber-400">Rs {charge.css}</td>
                            <td className="px-4 py-3 font-mono text-purple-400">Rs {charge.additional_surcharge}</td>
                            <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                              Rs {totalSurcharges} / kWh
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Technical Losses by Voltage */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    State Technical Losses by Voltage Tier
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {profile.grid_losses?.all_voltage_losses?.map((loss, lIdx) => (
                      <div key={lIdx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1">
                        <div className="text-[11px] font-bold text-white">{loss.voltage_level}</div>
                        <div className="text-base font-extrabold font-mono text-emerald-400">
                          {loss.total_technical_loss_pct}%
                        </div>
                        <div className="text-[9px] text-slate-500">
                          Tx: {loss.transmission_loss_pct}% | Wh: {loss.wheeling_loss_pct}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 6. BANKING FRAMEWORK */}
            {activeSubTab === 'banking' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Renewable Energy Banking Rules</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Banking cycles, charges, TOD withdrawal rules, and surplus compensation mechanism.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-cyan-200 leading-relaxed">
                  {profile.banking_framework?.plain_language_summary}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">Banking Period</span>
                    <h4 className="text-sm font-bold text-white">{profile.banking_framework?.banking_period}</h4>
                    <p className="text-slate-400">{profile.banking_framework?.settlement_cycle}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">Banking Charge</span>
                    <h4 className="text-sm font-bold font-mono text-cyan-400">{profile.banking_framework?.banking_charge_pct}% of energy</h4>
                    <p className="text-slate-400">{profile.banking_framework?.banking_charge_description}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">Surplus Settlement Rate</span>
                    <h4 className="text-sm font-bold text-emerald-400">{profile.banking_framework?.surplus_treatment_rate}</h4>
                    <p className="text-slate-400">Compensated by DISCOM at end of year.</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <h4 className="font-bold text-white">Time-of-Day (TOD) Banking Conditions</h4>
                  <p className="text-slate-300 leading-relaxed">{profile.banking_framework?.tod_restrictions}</p>
                  <p className="text-slate-400 text-[11px]">{profile.banking_framework?.cross_tod_adjustment}</p>
                </div>
              </div>
            )}

            {/* 7. CAPTIVE / GROUP CAPTIVE */}
            {activeSubTab === 'captive' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Captive & Group Captive Compliance Framework</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Statutory 26% equity ownership, 51% proportional consumption, and complete CSS/AS exemption criteria.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                    <div className="text-xs font-bold text-emerald-400 uppercase">26% Equity Rule</div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {profile.captive_framework?.ownership_requirement}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-2">
                    <div className="text-xs font-bold text-cyan-400 uppercase">51% Consumption Rule</div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {profile.captive_framework?.consumption_requirement}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-3">
                  <h4 className="font-bold text-white">Group Captive Proportionality & Verification</h4>
                  <p className="text-slate-300 leading-relaxed">
                    {profile.captive_framework?.group_captive_proportionality}
                  </p>

                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Mandatory Verification Documents
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                      {profile.captive_framework?.required_documents?.map((doc, dIdx) => (
                        <div key={dIdx} className="flex items-center gap-2 p-2 rounded bg-slate-900/60">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 8. METERING & TELEMETRY */}
            {activeSubTab === 'metering' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Metering, SEM & Telemetry Requirements</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ABT compliance, meter accuracy classes, AMR protocols, and SLDC SCADA integration.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">Meter Class</span>
                    <h4 className="text-sm font-bold text-cyan-400">{profile.metering_requirements?.meter_type}</h4>
                    <p className="text-slate-400">{profile.metering_requirements?.accuracy_class}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">AMR & Telemetry</span>
                    <h4 className="text-sm font-bold text-emerald-400">Mandatory 4G / VPN</h4>
                    <p className="text-slate-400">{profile.metering_requirements?.communication_protocol}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">Testing Frequency</span>
                    <h4 className="text-sm font-bold text-white">Annual Calibration</h4>
                    <p className="text-slate-400">NABL Accredited Lab Testing</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <h4 className="font-bold text-white">Main, Check & Standby Metering Configuration</h4>
                  <p className="text-slate-300"><span className="text-cyan-400 font-semibold">Main Meter:</span> {profile.metering_requirements?.main_meter_spec}</p>
                  <p className="text-slate-300"><span className="text-indigo-400 font-semibold">Check Meter:</span> {profile.metering_requirements?.check_meter_spec}</p>
                  <p className="text-slate-400 text-[11px]"><span className="text-slate-300 font-semibold">SLDC Requirement:</span> {profile.metering_requirements?.sldc_integration_req}</p>
                </div>
              </div>
            )}

            {/* 9. SCHEDULING & DSM */}
            {activeSubTab === 'scheduling-dsm' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Forecasting, Scheduling & Deviation Settlement (DSM)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    15-minute time block scheduling, revision slots, and deviation penalty framework.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">Time Block</span>
                    <h4 className="text-xl font-bold font-mono text-cyan-400">{profile.scheduling_requirements?.time_block_duration_minutes} Mins</h4>
                    <p className="text-slate-400">15-minute block dispatch</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">Max Daily Revisions</span>
                    <h4 className="text-xl font-bold font-mono text-white">{profile.scheduling_requirements?.max_revisions_per_day} Slots</h4>
                    <p className="text-slate-400">4th time-block gate closure</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-500 font-semibold uppercase text-[10px]">RE Error Tolerance</span>
                    <h4 className="text-xl font-bold font-mono text-emerald-400">Â±10%</h4>
                    <p className="text-slate-400">No penalty within Â±10% AvC</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <h4 className="font-bold text-white">Commercial DSM Penalty Structure</h4>
                  <p className="text-slate-300 leading-relaxed">{profile.dsm_rules?.penalty_rate_structure}</p>
                  <p className="text-slate-400 text-[11px]">{profile.dsm_rules?.consumer_deviation_charges}</p>
                </div>
              </div>
            )}

            {/* 10. SOURCE REGULATIONS */}
            {activeSubTab === 'regulations' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Statutory Regulatory Orders & Citations</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official orders and documents published by {profile.state_master?.regulator_code} governing this profile.
                  </p>
                </div>

                <div className="space-y-3">
                  {profile.regulatory_source_documents?.map((doc, dIdx) => (
                    <div
                      key={dIdx}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4 hover:border-slate-700 transition"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-400">
                            {doc.document_category}
                          </span>
                          <h4 className="text-sm font-bold text-white truncate">{doc.title}</h4>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2">{doc.summary}</p>
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                          <span>Authority: {doc.authority}</span>
                          <span>Doc No: {doc.document_number}</span>
                          <span>Effective: {doc.effective_date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={doc.verification_badge} />
                        <a
                          href={doc.download_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="Open Document Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Executive Due Diligence Dossier Modal */}
      <ExecutiveDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        profile={profile}
      />
    </div>
  );
}


