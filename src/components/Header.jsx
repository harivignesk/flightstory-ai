import React from 'react';
import { 
  ShieldCheck, 
  Box, 
  Target, 
  BarChart3, 
  GitCompare, 
  AlertTriangle, 
  Database, 
  CheckCircle2, 
  BrainCircuit, 
  Download,
  Search,
  Server,
  Activity
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, onExportCSV, globalSearch, setGlobalSearch }) {
  const tabs = [
    { id: 'supervisor', label: '🛡️ Supervisor Executive Briefing', icon: ShieldCheck },
    { id: '3d_view', label: '🔮 Interactive 3D Log Space', icon: Box },
    { id: 'main_event', label: '🎯 Main Event Mapper (PS)', icon: Target },
    { id: 'topology', label: '🛰️ 3-Node Topology', icon: Server },
    { id: 'overview', label: '📊 Analytics Overview', icon: BarChart3 },
    { id: 'correlation', label: '🔄 Event Correlation', icon: GitCompare },
    { id: 'faults', label: '⚠️ Fault Repository', icon: AlertTriangle },
    { id: 'explorer', label: '📋 Log Explorer (5,257)', icon: Database },
    { id: 'validation', label: '🛡️ Quality Audit', icon: CheckCircle2 }
  ];

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Logo & Title */}
        <div className="brand-title">
          <div className="brand-logo">
            <Activity className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="brand-text">
            <h1>Honeywell FMS Supervisory Center</h1>
            <p>Multi-Node Log Analytics & 3D WebGL Event Mapper</p>
          </div>
        </div>

        {/* Node Badges & Live Ticker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div className="badge badge-node-a">
            <span className="pulse-dot"></span> NODE A: 2,199
          </div>
          <div className="badge badge-node-b">
            <span className="pulse-dot"></span> NODE B: 1,177
          </div>
          <div className="badge badge-node-c">
            <span className="pulse-dot"></span> NODE C: 1,881
          </div>
          <div className="badge badge-critical font-mono">
            MAIN EVENT: FAULT 6025
          </div>
          <div className="badge badge-success">
            100% VALIDATED (5,257)
          </div>
        </div>

        {/* Global Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Search 5,257 records..." 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.2rem', width: '210px' }}
            />
          </div>

          <button onClick={onExportCSV} className="btn-primary">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="header-container" style={{ marginTop: '0.85rem' }}>
        <div className="nav-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
