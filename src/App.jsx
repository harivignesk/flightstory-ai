import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import KPICards from './components/KPICards';
import InteractiveFreeFlowGraph from './components/InteractiveFreeFlowGraph';
import LovableFlightWorkspace from './components/lovable/LovableFlightWorkspace';
import SupervisorBriefing from './components/SupervisorBriefing';
import LogVisualization3D from './components/LogVisualization3D';
import MainEventMapper from './components/MainEventMapper';
import TopologyView from './components/TopologyView';
import OverviewTab from './components/OverviewTab';
import CorrelationTab from './components/CorrelationTab';
import FaultTab from './components/FaultTab';
import ExplorerTab from './components/ExplorerTab';
import ValidationTab from './components/ValidationTab';
import DetailModal from './components/DetailModal';
import datasetJson from './data/honeywell_fms_dataset.json';

export default function App() {
  const [activeTab, setActiveTab] = useState('free_flow');
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [records, setRecords] = useState([]);
  const [qualityStats, setQualityStats] = useState({});
  const [rootCauseData, setRootCauseData] = useState(null);

  useEffect(() => {
    if (datasetJson) {
      setRecords(datasetJson.records || []);
      setQualityStats(datasetJson.quality_stats || {});
      setRootCauseData(datasetJson.root_cause_analysis || null);
    }
  }, []);

  // CSV Export functionality
  const handleExportCSV = () => {
    if (!records.length) return;
    const headers = ['id', 'node', 'log_family', 'timestamp_display', 'sequence', 'severity', 'fault_code', 'fault_name', 'message', 'event_flow'];
    const rows = records.map(r => [
      r.id,
      `"${r.node}"`,
      `"${r.log_family}"`,
      `"${r.timestamp_display || ''}"`,
      `"${r.sequence || ''}"`,
      `"${r.severity}"`,
      `"${r.fault_code || ''}"`,
      `"${r.fault_name || ''}"`,
      `"${(r.message || '').replace(/"/g, '""')}"`,
      `"${(r.event_flow || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `honeywell_fms_normalized_records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportCSV={handleExportCSV}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
      />

      {/* Main Container */}
      <main className="main-container">
        
        {/* KPI Summary Cards */}
        <KPICards stats={qualityStats} />

        {/* Tab Views */}
        {activeTab === 'free_flow' && (
          <InteractiveFreeFlowGraph records={records} rootCauseData={rootCauseData} />
        )}

        {activeTab === 'lovable_workspace' && (
          <LovableFlightWorkspace />
        )}

        {activeTab === 'supervisor' && (
          <SupervisorBriefing rootCauseData={rootCauseData} records={records} />
        )}

        {activeTab === '3d_view' && (
          <LogVisualization3D records={records} rootCauseData={rootCauseData} />
        )}

        {activeTab === 'main_event' && (
          <MainEventMapper rootCauseData={rootCauseData} records={records} />
        )}

        {activeTab === 'topology' && (
          <TopologyView records={records} />
        )}

        {activeTab === 'overview' && (
          <OverviewTab stats={qualityStats} records={records} />
        )}

        {activeTab === 'correlation' && (
          <CorrelationTab records={records} />
        )}

        {activeTab === 'faults' && (
          <FaultTab records={records} />
        )}

        {activeTab === 'explorer' && (
          <ExplorerTab 
            records={records} 
            onSelectRecord={(r) => setSelectedRecord(r)}
          />
        )}

      </main>

      {/* Detail Modal Inspector */}
      {selectedRecord && (
        <DetailModal 
          record={selectedRecord} 
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}
