import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Edit3, ShieldAlert, CheckCircle2, History, Save, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function AdminPanel() {
  const [states, setStates] = useState([]);
  const [tariffs, setTariffs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [selectedEntity, setSelectedEntity] = useState('tariff'); // 'tariff' | 'state'
  const [editingId, setEditingId] = useState('');
  const [energyCharge, setEnergyCharge] = useState('');
  const [demandCharge, setDemandCharge] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('Official Verified');
  const [editNotes, setEditNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('editor'); // 'editor' | 'logs'

  useEffect(() => {
    async function loadData() {
      try {
        const [sRes, tRes, aRes] = await Promise.all([
          api.getStates(),
          api.getTariffs({ financial_year: 'FY 2025-26' }),
          api.getAuditLogs()
        ]);
        setStates(sRes.states || []);
        const tList = tRes.tariffs || [];
        setTariffs(tList);
        setAuditLogs(aRes.audit_logs || []);

        if (tList.length > 0) {
          const first = tList[0];
          setEditingId(first.id);
          setEnergyCharge(first.energy_charge);
          setDemandCharge(first.demand_charge);
          setVerificationStatus(first.verification_status);
        }
      } catch (err) {
        console.error('Failed to load admin data:', err);
      }
    }
    loadData();
  }, []);

  const handleSelectTariffToEdit = (tId) => {
    const found = tariffs.find(t => t.id === tId);
    if (found) {
      setEditingId(found.id);
      setEnergyCharge(found.energy_charge);
      setDemandCharge(found.demand_charge);
      setVerificationStatus(found.verification_status);
      setSaveSuccess(false);
      setSaveError(null);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      await api.updateAdminRecord(
        'tariff',
        editingId,
        {
          energy_charge: Number(energyCharge),
          demand_charge: Number(demandCharge),
          verification_status: verificationStatus,
          admin_notes: editNotes
        },
        'Tariff Admin Specialist'
      );
      setSaveSuccess(true);

      // Refresh audit logs
      const aRes = await api.getAuditLogs();
      setAuditLogs(aRes.audit_logs || []);
    } catch (err) {
      console.error('Failed to update record:', err);
      setSaveError(err.message || 'Failed to update record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Governance & Versioning</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Regulatory Administration & Audit Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Update structured tariff parameters, change verification badges (Official, Internally Verified, Estimated, Superseded), and review immutable audit histories.
          </p>
        </div>

        <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveSubTab('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'editor'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Record Editor</span>
          </button>
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'logs'
                ? 'bg-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'editor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Record Selector Column */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Tariff Record to Edit
            </h3>
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {tariffs.slice(0, 30).map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleSelectTariffToEdit(t.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition text-xs space-y-1 ${
                    editingId === t.id
                      ? 'bg-cyan-500/15 border-cyan-500 text-white'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>{t.discom_name}</span>
                    <span className="font-mono text-cyan-400">{t.voltage_level}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{t.tariff_category_name}</div>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="font-mono text-white font-bold">Rs {t.energy_charge}/kVAh</span>
                    <StatusBadge status={t.verification_status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Editor Column */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>Edit Structured Record Parameters</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Record ID: <span className="font-mono text-cyan-400">{editingId}</span>
              </p>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Record updated successfully. Change logged in immutable audit history.</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Error updating record: {saveError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Energy Charge */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Base Energy Charge (Rs/kVAh)</label>
                <input
                  type="number"
                  step="0.01"
                  value={energyCharge}
                  onChange={(e) => setEnergyCharge(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Demand Charge */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Demand Charge (Rs/kVA/month)</label>
                <input
                  type="number"
                  step="1"
                  value={demandCharge}
                  onChange={(e) => setDemandCharge(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Verification Status */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Verification Status Badge</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Official Verified',
                  'Internally Verified',
                  'Pending Verification',
                  'Estimated',
                  'Superseded'
                ].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setVerificationStatus(st)}
                    className={`p-2.5 rounded-lg border text-xs font-semibold transition text-left flex flex-col justify-between ${
                      verificationStatus === st
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{st}</span>
                    <StatusBadge status={st} />
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Rationale / Commission Citation Reference</label>
              <textarea
                rows="3"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Enter order reference number, page citation, or audit rationale..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-cyan-600/20 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Saving...' : 'Commit Regulatory Update'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Audit Trail View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Immutable Change Audit Trail
            </h3>
            <span className="text-xs text-slate-500">Chronological modification logs</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Entity Type</th>
                  <th className="px-4 py-3">Entity ID</th>
                  <th className="px-4 py-3">Field Changes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/50">
                    <td className="px-4 py-3 font-mono text-slate-400">{log.timestamp}</td>
                    <td className="px-4 py-3 font-semibold text-white">{log.user}</td>
                    <td className="px-4 py-3 uppercase text-cyan-400 font-bold">{log.entity_type}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{log.entity_id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-amber-300">
                      {JSON.stringify(log.changes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

