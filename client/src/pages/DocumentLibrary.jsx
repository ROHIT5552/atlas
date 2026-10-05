import React, { useState, useEffect } from 'react';
import { FileText, Search, ExternalLink, Filter, Calendar, Building2, Download } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function DocumentLibrary() {
  const [documents, setDocuments] = useState([]);
  const [states, setStates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = [
    'All',
    'Tariff Order',
    'Open Access Regulations',
    'Green Energy Open Access',
    'DSM Regulations',
    'Banking Regulations',
    'Captive Verification Order'
  ];

  useEffect(() => {
    async function loadMeta() {
      try {
        const sRes = await api.getStates();
        setStates(sRes.states || []);
      } catch (err) {
        console.error('Failed to load states:', err);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    async function loadDocs() {
      try {
        setLoading(true);
        const res = await api.getDocuments({
          search: searchTerm,
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          state_id: selectedState === 'All' ? undefined : selectedState
        });
        setDocuments(res.documents || []);
      } catch (err) {
        console.error('Failed to load documents:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDocs();
  }, [searchTerm, selectedCategory, selectedState]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Statutory Source Documents</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Regulatory Orders & Citations Repository
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official Commission Gazette notifications, MYT tariff orders, Open Access regulations, and court judgements supporting all structured database records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 font-bold">
            {documents.length} Documents Cataloged
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order title, number, or authority (e.g. MERC, GERC, Case No. 226)..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* State Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">State:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="All">All States</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading statutory documents...</div>
      ) : (
        <div className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-5 flex flex-wrap items-start justify-between gap-4 hover:bg-slate-900/50 transition"
            >
              <div className="space-y-2 flex-1 min-w-[300px]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 uppercase border border-cyan-800/40">
                    {doc.document_category}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 capitalize">
                    {doc.state_id}
                  </span>
                  <StatusBadge status={doc.verification_badge} />
                </div>

                <h3 className="text-sm font-bold text-white">{doc.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">{doc.summary}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1 font-mono">
                  <span>Authority: <strong className="text-slate-300">{doc.authority}</strong></span>
                  <span>Document Ref: <strong className="text-slate-300">{doc.document_number}</strong></span>
                  <span>Effective Date: <strong className="text-emerald-400">{doc.effective_date}</strong></span>
                  <span>Published: {doc.publication_date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-2">
                <a
                  href={doc.download_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Commission Source Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

