import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import GlobalSearchModal from './components/GlobalSearchModal';
import ErrorBoundary from './components/ErrorBoundary';
import { TabId, SearchResultItem } from './types';

// Pages
import Dashboard from './pages/Dashboard';
import RegulatoryProfileExplorer from './pages/RegulatoryProfileExplorer';
import StateMaster from './pages/StateMaster';
import StateDetail from './pages/StateDetail';
import DiscomMaster from './pages/DiscomMaster';
import DiscomDetail from './pages/DiscomDetail';
import TariffMaster from './pages/TariffMaster';
import TodVisualizer from './pages/TodVisualizer';
import OpenAccessExplorer from './pages/OpenAccessExplorer';
import BankingExplorer from './pages/BankingExplorer';
import CaptiveExplorer from './pages/CaptiveExplorer';
import MeteringExplorer from './pages/MeteringExplorer';
import SchedulingDsmExplorer from './pages/SchedulingDsmExplorer';
import DocumentLibrary from './pages/DocumentLibrary';
import Comparator from './pages/Comparator';
import AdminPanel from './pages/AdminPanel';
import ApiDocs from './pages/ApiDocs';
import LandedCostCalculator from './pages/LandedCostCalculator';
import ConsumerEligibilityChecker from './pages/ConsumerEligibilityChecker';
import GeneratorEligibilityChecker from './pages/GeneratorEligibilityChecker';
import ConnectivityMatrix from './pages/ConnectivityMatrix';
import DownstreamAppsHub from './pages/DownstreamAppsHub';
import RegulatoryPassportGenerator from './pages/RegulatoryPassportGenerator';
import GuardComplianceRulebook from './pages/GuardComplianceRulebook';
import BillAuditEngine from './pages/BillAuditEngine';
import CaptiveStructuringEngine from './pages/CaptiveStructuringEngine';
import SettlementWaterfallEngine from './pages/SettlementWaterfallEngine';
import RegulatoryChangePropagator from './pages/RegulatoryChangePropagator';

const VALID_TABS: readonly TabId[] = [
  'dashboard',
  'explorer',
  'passport',
  'consumer-eligibility',
  'generator-eligibility',
  'captive-structuring',
  'connectivity',
  'tod',
  'settlement-waterfall',
  'bill-audit',
  'downstream-hub',
  'guard-rules',
  'change-propagator',
  'landed-cost',
  'tariffs',
  'open-access',
  'banking',
  'captive',
  'metering',
  'scheduling',
  'states',
  'state-detail',
  'discoms',
  'discom-detail',
  'regulations',
  'compare',
  'admin',
  'api-docs'
] as const;

function getInitialTab(): TabId {
  try {
    // 1. Check window.location.hash (e.g. #/landed-cost or #landed-cost)
    const rawHash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
    if (rawHash && (VALID_TABS as readonly string[]).includes(rawHash)) {
      return rawHash as TabId;
    }
    // 2. Check localStorage
    const saved = localStorage.getItem('atlas_active_tab');
    if (saved && (VALID_TABS as readonly string[]).includes(saved)) {
      return saved as TabId;
    }
  } catch (err) {
    console.warn('Failed to parse initial tab:', err);
  }
  return 'dashboard';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [clientFacing, setClientFacing] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Selected State / DISCOM query contexts for smooth drilldown with localStorage persistence
  const [selectedStateId, setSelectedStateId] = useState<string>(() => {
    return localStorage.getItem('atlas_selected_state_id') || 'maharashtra';
  });
  const [selectedDiscomId, setSelectedDiscomId] = useState<string>(() => {
    return localStorage.getItem('atlas_selected_discom_id') || 'msedcl';
  });
  const [detailStateId, setDetailStateId] = useState<string | null>(() => {
    return localStorage.getItem('atlas_detail_state_id') || null;
  });
  const [detailDiscomId, setDetailDiscomId] = useState<string | null>(() => {
    return localStorage.getItem('atlas_detail_discom_id') || null;
  });

  // Synchronize activeTab to URL hash and localStorage so refresh stays on current menu
  useEffect(() => {
    try {
      localStorage.setItem('atlas_active_tab', activeTab);
      const currentHash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
      if (currentHash !== activeTab) {
        window.history.replaceState(null, '', `#/${activeTab}`);
      }
    } catch (err) {
      console.warn('Failed to persist active tab:', err);
    }
  }, [activeTab]);

  // Listen to browser Back / Forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0];
      if (hash && (VALID_TABS as readonly string[]).includes(hash)) {
        setActiveTab(hash as TabId);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Persist State and DISCOM contexts
  useEffect(() => {
    if (selectedStateId) localStorage.setItem('atlas_selected_state_id', selectedStateId);
  }, [selectedStateId]);
  useEffect(() => {
    if (selectedDiscomId) localStorage.setItem('atlas_selected_discom_id', selectedDiscomId);
  }, [selectedDiscomId]);
  useEffect(() => {
    if (detailStateId) localStorage.setItem('atlas_detail_state_id', detailStateId);
    else localStorage.removeItem('atlas_detail_state_id');
  }, [detailStateId]);
  useEffect(() => {
    if (detailDiscomId) localStorage.setItem('atlas_detail_discom_id', detailDiscomId);
    else localStorage.removeItem('atlas_detail_discom_id');
  }, [detailDiscomId]);

  // Global keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectSearchResult = (item: SearchResultItem) => {
    if (item.type === 'State') {
      setSelectedStateId(item.id);
      setActiveTab('explorer');
    } else if (item.type === 'DISCOM') {
      setSelectedDiscomId(item.id);
      setActiveTab('explorer');
    } else if (item.type === 'Tariff') {
      setActiveTab('tariffs');
    } else if (item.type === 'Regulation') {
      setActiveTab('regulations');
    } else {
      setActiveTab('explorer');
    }
  };

  const handleOpenStateDetail = (stId: string) => {
    setDetailStateId(stId);
    setActiveTab('state-detail');
  };

  const handleOpenDiscomDetail = (discId: string) => {
    setDetailDiscomId(discId);
    setActiveTab('discom-detail');
  };

  const handleQueryState = (stId: string) => {
    setSelectedStateId(stId);
    setActiveTab('explorer');
  };

  const handleQueryDiscom = (stId?: string, discId?: string) => {
    if (stId) setSelectedStateId(stId);
    if (discId) setSelectedDiscomId(discId);
    setActiveTab('explorer');
  };

  return (
    <div className="vesper-app flex h-screen flex-col overflow-hidden text-[var(--text)] selection:bg-[var(--violet)]/30 selection:text-[var(--lilac)] bg-[var(--bg)]">
      {/* Top Fixed Header */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clientFacing={clientFacing}
        setClientFacing={setClientFacing}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Layout Body */}
      <div className="vesper-app-body relative flex min-h-0 flex-1 overflow-hidden">
        {/* Left Sidebar (Desktop docked + Mobile slide-over drawer) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Page Main Content */}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 xl:p-8">
          <ErrorBoundary>
            {activeTab === 'dashboard' && (
              <Dashboard
                setActiveTab={setActiveTab}
                clientFacing={clientFacing}
                onSelectState={(stId: string) => {
                  setSelectedStateId(stId);
                  setActiveTab('explorer');
                }}
                onSelectDiscom={(discId: string) => {
                  setSelectedDiscomId(discId);
                  setActiveTab('explorer');
                }}
              />
            )}

            {activeTab === 'explorer' && (
              <RegulatoryProfileExplorer
                preselectedState={selectedStateId}
                preselectedDiscom={selectedDiscomId}
                clientFacing={clientFacing}
              />
            )}

            {activeTab === 'landed-cost' && <LandedCostCalculator />}

            {activeTab === 'consumer-eligibility' && (
              <ConsumerEligibilityChecker onSendToGridflex={() => setActiveTab('landed-cost')} />
            )}

            {activeTab === 'generator-eligibility' && <GeneratorEligibilityChecker />}

            {activeTab === 'connectivity' && <ConnectivityMatrix />}

            {activeTab === 'downstream-hub' && <DownstreamAppsHub />}

            {activeTab === 'passport' && <RegulatoryPassportGenerator />}

            {activeTab === 'guard-rules' && <GuardComplianceRulebook />}

            {activeTab === 'bill-audit' && <BillAuditEngine />}

            {activeTab === 'captive-structuring' && <CaptiveStructuringEngine />}

            {activeTab === 'settlement-waterfall' && <SettlementWaterfallEngine />}

            {activeTab === 'change-propagator' && <RegulatoryChangePropagator />}

            {activeTab === 'states' && (
              <StateMaster
                onSelectState={handleQueryState}
                onOpenDetail={handleOpenStateDetail}
              />
            )}

            {activeTab === 'state-detail' && (
              <StateDetail
                stateId={detailStateId || selectedStateId}
                onBack={() => setActiveTab('states')}
                onSelectDiscom={(discId: string) => {
                  setSelectedDiscomId(discId);
                  setActiveTab('explorer');
                }}
                onQueryState={handleQueryState}
              />
            )}

            {activeTab === 'discoms' && (
              <DiscomMaster
                onSelectDiscom={(discId: string) => {
                  setSelectedDiscomId(discId);
                  setActiveTab('explorer');
                }}
                onOpenDetail={handleOpenDiscomDetail}
              />
            )}

            {activeTab === 'discom-detail' && (
              <DiscomDetail
                discomId={detailDiscomId || selectedDiscomId}
                onBack={() => setActiveTab('discoms')}
                onQueryProfile={handleQueryDiscom}
              />
            )}

            {activeTab === 'tariffs' && (
              <TariffMaster
                onSelectTariff={(tariff: any) => {
                  setSelectedStateId(tariff.state_id);
                  setSelectedDiscomId(tariff.discom_id);
                  setActiveTab('explorer');
                }}
              />
            )}

            {activeTab === 'tod' && <TodVisualizer />}

            {activeTab === 'open-access' && <OpenAccessExplorer />}

            {activeTab === 'banking' && <BankingExplorer />}

            {activeTab === 'captive' && <CaptiveExplorer />}

            {activeTab === 'metering' && <MeteringExplorer />}

            {activeTab === 'scheduling' && <SchedulingDsmExplorer />}

            {activeTab === 'regulations' && <DocumentLibrary />}

            {activeTab === 'compare' && <Comparator />}

            {activeTab === 'admin' && <AdminPanel />}

            {activeTab === 'api-docs' && <ApiDocs />}
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Search Dialog Modal (Ctrl + K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />
    </div>
  );
}
