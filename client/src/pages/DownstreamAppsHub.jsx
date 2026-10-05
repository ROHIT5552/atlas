import React, { useState, useEffect } from 'react';
import {
  Code2,
  Terminal,
  FileCheck,
  Zap,
  Cpu,
  Layers,
  Sparkles,
  Copy,
  Check,
  Send,
  Eye,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';

export default function DownstreamAppsHub() {
  const [activeApp, setActiveApp] = useState('lens');
  const [copied, setCopied] = useState(false);
  const [liveResponse, setLiveResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const downstreamApps = [
    {
      id: 'lens',
      name: 'NewRa Lens',
      badge: 'Product #2',
      tagline: 'BillScan & Bill Optimizer',
      endpoint: '/api/v1/atlas/lens/bill-audit?discom_id=msedcl',
      description: 'Supplies baseline energy charges, 85% billing demand rules, power factor penalty/rebate slabs, and 24h TOD windows for automated bill verification.',
      fetchFn: () => api.getLensAuditRules({ discom_id: 'msedcl' })
    },
    {
      id: 'gridflex',
      name: 'GridFlex',
      badge: 'Product #3',
      tagline: 'Settlement & Commercial Engine',
      endpoint: '/api/v1/atlas/gridflex/settlement-rules?state_id=maharashtra&discom_id=msedcl',
      description: 'Feeds technical loss gross-up multipliers, RE banking in-kind deduction %, TOD drawal rules, and STU/DISCOM wheeling surcharges into the 15-minute simulation engine.',
      fetchFn: () => api.getGridFlexSettlement({ state_id: 'maharashtra', discom_id: 'msedcl' })
    },
    {
      id: 'connect',
      name: 'NewRa Connect',
      badge: 'Product #8',
      tagline: 'OA Application & SEM Tracker',
      endpoint: '/api/v1/atlas/connect/statutory-checklist?state_id=maharashtra',
      description: 'Provides statutory approval checklists, SLDC telemetry requirements, ABT 0.2s meter specifications, and captive equity compliance rules.',
      fetchFn: () => api.getConnectChecklist({ state_id: 'maharashtra' })
    },
    {
      id: 'vpp',
      name: 'NewRa VPP',
      badge: 'Product #9',
      tagline: 'Dispatch & Deviation Monitor',
      endpoint: '/api/v1/atlas/vpp/dsm-parameters?state_id=maharashtra',
      description: 'Supplies frequency-linked DSM deviation penalty bands, 15-minute block structures, and intra-day schedule revision freeze deadlines.',
      fetchFn: () => api.getVppDsmParameters({ state_id: 'maharashtra' })
    },
    {
      id: 'ledger',
      name: 'NewRa Ledger',
      badge: 'Product #10',
      tagline: '15-min Energy Accounting',
      endpoint: '/api/v1/atlas/ledger/reconciliation-factors?state_id=maharashtra&discom_id=msedcl',
      description: 'Provides exact historical tariff rates, electricity duty %, FAC adjustments, and APPC surplus cashout rates for month-end bill reconciliation.',
      fetchFn: () => api.getLedgerReconciliation({ state_id: 'maharashtra', discom_id: 'msedcl' })
    }
  ];

  const currentApp = downstreamApps.find(a => a.id === activeApp) || downstreamApps[0];

  // Fetch live response when app changes
  useEffect(() => {
    async function fetchPayload() {
      setLoading(true);
      try {
        const data = await currentApp.fetchFn();
        setLiveResponse(data);
      } catch (err) {
        console.error('Failed to fetch downstream payload:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPayload();
  }, [activeApp]);

  const handleCopySnippet = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCodeSnippet = (lang) => {
    if (lang === 'python') {
      return `from sdk.python.newra_atlas_client import NewRaAtlasClient

atlas = NewRaAtlasClient(base_url="http://localhost:8000")

# Pull regulatory rules for ${currentApp.name}
rules = atlas.get_gridflex_settlement(
    state_id="maharashtra",
    discom_id="msedcl",
    voltage_code="33 kV"
)
print("Loss Multiplier:", rules["technical_losses"]["loss_gross_up_multiplier"])`;
    }
    if (lang === 'node') {
      return `const { NewRaAtlasClient } = require('./sdk/node/NewRaAtlasClient');

const atlas = new NewRaAtlasClient({ baseUrl: 'http://localhost:8000' });

async function run() {
  const rules = await atlas.getLensBillAuditRules({
    discomId: 'msedcl',
    categoryId: 'ht-industrial-cont',
    voltageCode: '33 kV'
  });
  console.log("Tariff URN:", rules.tariff_urn);
}
run();`;
    }
    return `curl -s "http://localhost:8000${currentApp.endpoint}"`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#09193C] via-[#0B1B3D] to-[#07122A] border border-[#2D50A1]/40 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#2D50A1]/30 border border-[#28B8B4]/40 text-[#28B8B4]">
            <Code2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#2D50A1]/40 text-[#28B8B4] border border-[#28B8B4]/30 rounded">
                NewRa Core Layer
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">Downstream Apps API Hub & SDKs</h1>
            </div>
            <p className="text-xs text-[#C6CBD9]/80 mt-1">
              Data contracts, live JSON endpoints, and zero-dependency client SDKs connecting Atlas to the other NewRa applications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-mono font-bold bg-[#07122A] border border-[#2D50A1]/50 text-[#7CD9D6] rounded-xl">
            API Version: v1
          </span>
        </div>
      </div>

      {/* Downstream App Switcher Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {downstreamApps.map(appItem => (
          <button
            key={appItem.id}
            onClick={() => setActiveApp(appItem.id)}
            className={`p-3 rounded-xl text-left border transition ${
              activeApp === appItem.id
                ? 'bg-[#09193C] border-[#28B8B4] shadow-lg shadow-[#28B8B4]/10'
                : 'bg-[#07122A] border-[#2D50A1]/30 text-[#C6CBD9] hover:border-[#2D50A1]'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold uppercase text-[#28B8B4]">{appItem.badge}</span>
            </div>
            <h3 className="text-xs font-bold text-white">{appItem.name}</h3>
            <p className="text-[10px] text-[#C6CBD9]/60 truncate mt-0.5">{appItem.tagline}</p>
          </button>
        ))}
      </div>

      {/* Active App Data Contract Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Specification (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#09193C] border border-[#2D50A1]/40 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#28B8B4] bg-[#28B8B4]/15 px-2 py-0.5 rounded border border-[#28B8B4]/30">
                  {currentApp.badge} Contract
                </span>
                <span className="text-xs font-bold text-white">{currentApp.name}</span>
              </div>
              <h2 className="text-base font-bold text-white">{currentApp.tagline}</h2>
              <p className="text-xs text-[#C6CBD9]/80 mt-1 leading-relaxed">
                {currentApp.description}
              </p>
            </div>

            {/* Target Endpoint */}
            <div className="p-3 rounded-xl bg-[#07122A] border border-[#2D50A1]/40 space-y-1">
              <span className="text-[10px] text-[#C6CBD9]/60 uppercase font-mono block">REST Endpoint</span>
              <div className="flex items-center justify-between font-mono text-xs text-[#7CD9D6] break-all">
                <span>{currentApp.endpoint}</span>
              </div>
            </div>

            {/* Code Snippets */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white block">Client SDK Integration (Node.js & Python)</span>
              <div className="relative p-3 rounded-xl bg-[#07122A] border border-[#2D50A1]/40 text-xs font-mono text-[#C6CBD9] overflow-x-auto">
                <pre className="text-[11px] leading-relaxed">{getCodeSnippet('python')}</pre>
                <button
                  onClick={() => handleCopySnippet(getCodeSnippet('python'))}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-[#09193C] border border-[#2D50A1]/40 text-[#28B8B4] hover:text-white transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Live JSON Payload Preview (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-[#09193C] border border-[#2D50A1]/40 space-y-3">
            <div className="flex justify-between items-center border-b border-[#2D50A1]/30 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#28B8B4]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Live JSON Payload Contract</h3>
              </div>
              <span className="text-[10px] font-mono text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> HTTP 200 OK
              </span>
            </div>

            {loading ? (
              <div className="h-96 flex items-center justify-center text-xs text-[#C6CBD9]/60">
                Fetching live contract payload...
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto p-4 rounded-xl bg-[#07122A] border border-[#2D50A1]/30 font-mono text-[11px] text-[#7CD9D6]">
                <pre>{JSON.stringify(liveResponse, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
