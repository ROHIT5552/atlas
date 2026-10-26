import React, { useState } from 'react';
import { Terminal, Copy, Check, Play, Layers, Code2, Sparkles, Send, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

export default function ApiDocs() {
  const [state, setState] = useState('maharashtra');
  const [discom, setDiscom] = useState('msedcl');
  const [category, setCategory] = useState('ht-industrial-cont');
  const [voltage, setVoltage] = useState('33 kV');
  const [fy, setFy] = useState('FY 2025-26');

  const [responseJson, setResponseJson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [activeCodeLang, setActiveCodeLang] = useState('curl'); // 'curl' | 'js' | 'python'

  const getApiUrl = () => {
    return `/api/regulatory-profile?state=${state}&discom=${discom}&consumer_category=${category}&voltage=${encodeURIComponent(voltage)}&fy=${encodeURIComponent(fy)}`;
  };

  const getFullUrl = () => {
    return `${window.location.origin}${getApiUrl()}`;
  };

  const handleExecuteRequest = async () => {
    try {
      setLoading(true);
      const data = await api.getRegulatoryProfile({
        state,
        discom,
        consumer_category: category,
        voltage,
        fy
      });
      setResponseJson(data);
    } catch (err) {
      console.error('API execution error:', err);
      setResponseJson({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const getSnippet = () => {
    const full = getFullUrl();
    if (activeCodeLang === 'curl') {
      return `curl -X GET "${full}" \\
  -H "Accept: application/json" \\
  -H "X-NewRa-Client: GridFlex-Orchestrator"`;
    } else if (activeCodeLang === 'js') {
      return `// Fetch full 12-dimensional regulatory profile
const response = await fetch('${full}');
const profile = await response.json();

console.log('Energy Tariff:', profile.applicable_tariff.energy_charge);
console.log('CSS:', profile.oa_charges_breakdown[0].css);
console.log('Grid Loss:', profile.grid_losses.matching_loss.total_technical_loss_pct);`;
    } else {
      return `import requests

url = "${full}"
headers = {"Accept": "application/json", "X-NewRa-Client": "Bill-Scanner"}

response = requests.get(url, headers=headers)
profile = response.json()

print(f"Energy Charge: ₹ {profile['applicable_tariff']['energy_charge']}/kVAh")
print(f"Wheeling Charge: ₹ {profile['oa_charges_breakdown'][0]['wheeling_charge']}/kWh")`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getSnippet());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            <span>Integration Interface</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            NewRa Regulatory Profile API Reference
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            High-performance JSON API endpoint designed for direct programmatic integration with <strong>GridFlex</strong> and NewRa's <strong>Bill Scanner</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-xs font-mono text-emerald-400 font-bold">
            REST v1.0 • Ready for Production
          </span>
        </div>
      </div>

      {/* Endpoint Spec Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-mono font-extrabold text-xs">
            GET
          </span>
          <span className="font-mono text-sm font-bold text-white">/api/regulatory-profile</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Accepts a 5-tuple coordinate (State, DISCOM, Consumer Category, Interconnection Voltage, and Financial Year) and resolves the complete statutory regulatory profile including retail tariffs, TOD steps, Open Access surcharges, technical grid losses, banking rules, captive ownership rules, and legal citations.
        </p>

        {/* Query Parameter Documentation */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Query Parameters
          </h4>
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-2.5">Parameter</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Required</th>
                  <th className="px-4 py-2.5">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="px-4 py-2 font-mono text-cyan-400 font-bold">state</td>
                  <td className="px-4 py-2 font-mono text-slate-400">string</td>
                  <td className="px-4 py-2 text-emerald-400 font-semibold">Yes</td>
                  <td className="px-4 py-2 text-slate-300">State identifier slug (e.g. `maharashtra`, `gujarat`, `rajasthan`)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-cyan-400 font-bold">discom</td>
                  <td className="px-4 py-2 font-mono text-slate-400">string</td>
                  <td className="px-4 py-2 text-emerald-400 font-semibold">Yes</td>
                  <td className="px-4 py-2 text-slate-300">DISCOM licensee ID (e.g. `msedcl`, `dgvcl`, `jvvnl`, `bescom`)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-cyan-400 font-bold">consumer_category</td>
                  <td className="px-4 py-2 font-mono text-slate-400">string</td>
                  <td className="px-4 py-2 text-slate-500">Optional</td>
                  <td className="px-4 py-2 text-slate-300">Consumer category ID (defaults to `ht-industrial-cont`)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-cyan-400 font-bold">voltage</td>
                  <td className="px-4 py-2 font-mono text-slate-400">string</td>
                  <td className="px-4 py-2 text-slate-500">Optional</td>
                  <td className="px-4 py-2 text-slate-300">Interconnection voltage (e.g. `11 kV`, `33 kV`, `66 kV`, `132 kV`)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-mono text-cyan-400 font-bold">fy</td>
                  <td className="px-4 py-2 font-mono text-slate-400">string</td>
                  <td className="px-4 py-2 text-slate-500">Optional</td>
                  <td className="px-4 py-2 text-slate-300">Tariff financial year version (defaults to `FY 2025-26`)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Live Interactive Sandbox */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Interactive Test Sandbox & Code Generator
            </h3>
          </div>

          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
            {['curl', 'js', 'python'].map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveCodeLang(lang)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase transition ${
                  activeCodeLang === lang
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Live Parameters Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">state</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">discom</label>
            <input
              type="text"
              value={discom}
              onChange={(e) => setDiscom(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">consumer_category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">voltage</label>
            <input
              type="text"
              value={voltage}
              onChange={(e) => setVoltage(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">fy</label>
            <input
              type="text"
              value={fy}
              onChange={(e) => setFy(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono"
            />
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs overflow-x-auto text-slate-300">
          <button
            onClick={handleCopyCode}
            className="absolute right-3 top-3 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 hover:text-white transition flex items-center gap-1"
          >
            {copiedCurl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedCurl ? 'Copied' : 'Copy'}</span>
          </button>
          <pre>{getSnippet()}</pre>
        </div>

        {/* Send Button */}
        <div>
          <button
            onClick={handleExecuteRequest}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Executing Query...' : 'Execute Live API Request'}</span>
          </button>
        </div>

        {/* Live Response Output Window */}
        {responseJson && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider">Live Response (200 OK)</span>
              <span className="font-mono text-emerald-400">application/json</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-h-96 overflow-y-auto font-mono text-xs text-emerald-300">
              <pre>{JSON.stringify(responseJson, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

