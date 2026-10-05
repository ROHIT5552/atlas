import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import GlobalSearchModal from './components/GlobalSearchModal';
import ErrorBoundary from './components/ErrorBoundary';


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




export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [clientFacing, setClientFacing] = useState(false);

  // Selected State / DISCOM query contexts for smooth drilldown
  const [selectedStateId, setSelectedStateId] = useState('maharashtra');
  const [selectedDiscomId, setSelectedDiscomId] = useState('msedcl');
  const [detailStateId, setDetailStateId] = useState(null);
  const [detailDiscomId, setDetailDiscomId] = useState(null);

  // Global keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectSearchResult = (item) => {
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

  const handleOpenStateDetail = (stId) => {
    setDetailStateId(stId);
    setActiveTab('state-detail');
  };

  const handleOpenDiscomDetail = (discId) => {
    setDetailDiscomId(discId);
    setActiveTab('discom-detail');
  };

  const handleQueryState = (stId) => {
    setSelectedStateId(stId);
    setActiveTab('explorer');
  };

  const handleQueryDiscom = (stId, discId) => {
    if (stId) setSelectedStateId(stId);
    if (discId) setSelectedDiscomId(discId);
    setActiveTab('explorer');
  };

  return (
    <div className="min-h-screen bg-[#07122A] text-[#F4F5F7] flex flex-col selection:bg-[#28B8B4]/30 selection:text-[#28B8B4]">
      {/* Top Fixed Header */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clientFacing={clientFacing}
        setClientFacing={setClientFacing}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-full">
        {/* Left Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Page Main Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-57px)]">
          <ErrorBoundary>
            {activeTab === 'dashboard' && (
              <Dashboard
                setActiveTab={setActiveTab}
                clientFacing={clientFacing}
                onSelectState={(stId) => {
                  setSelectedStateId(stId);
                  setActiveTab('explorer');
                }}
                onSelectDiscom={(discId) => {
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
                onSelectDiscom={(discId) => {
                  setSelectedDiscomId(discId);
                  setActiveTab('explorer');
                }}
                onQueryState={handleQueryState}
              />
            )}

            {activeTab === 'discoms' && (
              <DiscomMaster
                onSelectDiscom={(discId) => {
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
                onSelectTariff={(tariff) => {
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

