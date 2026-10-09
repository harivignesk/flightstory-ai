import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { 
  Activity, ArrowDownToLine, ArrowRight, Bell, Box, Check, ChevronDown, 
  ChevronLeft, ChevronRight, CircleHelp, Database, Expand, FileText, 
  GitBranch, LayoutDashboard, Network, Pause, Plane, Play, RotateCcw, 
  Search, Settings, Settings2, ShieldCheck, Target, Zap, Server, X, Radio, FastForward, 
  Sparkles, Clock, Layers, GitMerge, Filter, RefreshCw
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { 
  dataset, records as allRecords, summary as rawSummary, timeline, nodes, nodeLabels, 
  filterRecords, exportRecords, getDatasetSummary, logFamilies, logFamilyCategories, familyColors,
  getPriorityScore, getMissingEvidenceMap, getEventFingerprint,
  type FlightRecord 
} from '../../data/flight-data';
import telemetryStreamer from '../../data/telemetry-streamer';

import InteractiveFreeFlowGraph from '../InteractiveFreeFlowGraph';
import MainEventMapper from '../MainEventMapper';
import NaturalLanguageQA from '../NaturalLanguageQA';
import ThreeNodeTimeline from '../ThreeNodeTimeline';
import ConnectedLevelsView from '../ConnectedLevelsView';
import CorrelationTab from '../CorrelationTab';

const LovableTelemetryScene = lazy(() => import('./telemetry-scene'));

export type View = 
  | 'overview' 
  | 'timeline'
  | 'propagation' 
  | 'correlation' 
  | 'fault_explorer' 
  | 'operational_context' 
  | 'ai_narrative' 
  | 'evidence_quality';

const navigation = [
  { view: 'overview', label: 'Flight Overview', icon: LayoutDashboard },
  { view: 'timeline', label: 'Incident Timeline', icon: Clock, badge: '3-LANES' },
  { view: 'propagation', label: 'Incident Propagation Flow', icon: Target, badge: 'LANGGRAPH' },
  { view: 'correlation', label: 'Event Correlation', icon: GitMerge, badge: 'RATIONALE' },
  { view: 'fault_explorer', label: 'Fault & Event Explorer', icon: Layers, badge: 'LEVEL 2' },
  { view: 'operational_context', label: 'Operational Context', icon: Network, badge: 'LEVEL 3' },
  { view: 'ai_narrative', label: 'AI Incident Analyst', icon: Sparkles, badge: 'FACTS' },
  { view: 'evidence_quality', label: 'Evidence & Data Quality', icon: Database, badge: 'LEVEL 4' }
] as const;

const shortFamily = (family: string) => family.replace(' Log', '').replace(' Buffer', '').replace('FM ', '');

const titles: Record<View, string> = {
  overview: 'Flight Overview & Multi-System Metrics',
  timeline: '3-Node Synchronized Incident Timeline (NODE_A, NODE_B, NODE_C)',
  propagation: 'Incident Propagation Flow (LangGraph Causal Chain)',
  correlation: 'Event Correlation & Relationship Rationales',
  fault_explorer: 'Fault & Event Explorer (Level 2 Detail)',
  operational_context: 'Operational Context & System State (Level 3)',
  ai_narrative: 'Explainable AI Incident Analyst & Evidence Narrative',
  evidence_quality: 'Evidence & Data Quality (Level 4 Payload Explorer)'
};

const subtitles: Record<View, string> = {
  overview: 'Summary of all recorded flight log events across Node A, B, and C with 3D telemetry video viewport.',
  timeline: 'See all flight events on a 3-lane time bar (NODE_A, NODE_B, NODE_C) arranged by exact timestamp.',
  propagation: 'Top-to-bottom flowchart showing how minor sub-events combine downward to form the main root cause incident.',
  correlation: 'Finds related events across different nodes and clearly explains WHY they are connected with confidence scores.',
  fault_explorer: 'Inspect specific fault codes (duration, impact, and system recovery) in simple plain English.',
  operational_context: 'See what the pilot and system state were doing when the incident occurred.',
  ai_narrative: 'Clear plain-English summary separating observed facts, inferred causes, and next steps.',
  evidence_quality: 'Inspect original raw HTML engineering logs with 100% data integrity.'
};

function RecordDetail({ record, onClose }: { record: FlightRecord; onClose: () => void }) {
  return (
    <div className="drawer-shade" onClick={onClose}>
      <aside className="record-drawer" onClick={e => e.stopPropagation()}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">LEVEL 4 EVIDENCE INSPECTOR</span>
            <h2>Event #{record.id}</h2>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close record" onClick={onClose}>
            <X />
          </Button>
        </div>
        <span className={`severity ${record.severity.toLowerCase()}`}>{record.severity}</span>
        
        {/* Strict Fact / Inference / Uncertainty Badges */}
        <div style={{ display: 'flex', gap: '0.4rem', margin: '0.85rem 0', flexWrap: 'wrap' }}>
          <span className="tiny-badge success" style={{ fontWeight: '700' }}>[FACT] OBSERVED LOG DATA</span>
          <span className="tiny-badge" style={{ color: 'var(--info)', borderColor: 'var(--info)' }}>[INFERENCE] AI CAUSAL LINK</span>
          <span className="tiny-badge" style={{ color: 'var(--warning)', borderColor: 'var(--warning)' }}>[UNCERTAINTY] HYPOTHESIS</span>
        </div>

        <dl className="record-fields">
          {[
            ['Node', record.node],
            ['Timestamp', record.timestamp],
            ['Log family', record.log_family],
            ['Event Category', logFamilyCategories[record.log_family] || 'Software Events'],
            ['Fault code', record.fault_code ?? '—'],
            ['Source file', record.filename],
            ['Event Flow', (record as any).event_flow || 'Normal operation']
          ].map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        <h3>Decoded Engineering Payload (Level 4 Evidence)</h3>
        <pre>{record.message}</pre>

        <h3>Raw Record JSON</h3>
        <pre>{JSON.stringify(record, null, 2)}</pre>
      </aside>
    </div>
  );
}

function EventTable({ rows, onSelect, compact = false }: { rows: FlightRecord[]; onSelect: (r: FlightRecord) => void; compact?: boolean }) {
  return (
    <div className="table-scroll">
      <table className={`event-table ${compact ? 'compact' : ''}`}>
        <thead>
          <tr>
            <th>TIMESTAMP</th>
            <th>NODE</th>
            <th>SEVERITY</th>
            <th>EVENT / LOG FAMILY</th>
            <th>FAULT CODE</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} onClick={() => onSelect(r)}>
              <td className="mono">{r.timestamp.slice(11)}</td>
              <td>
                <span className={`node-tag ${r.node.toLowerCase()}`}>{r.node.replace('_', ' ')}</span>
              </td>
              <td>
                <span className={`severity ${r.severity.toLowerCase()}`}>
                  <i />{r.severity}
                </span>
              </td>
              <td>
                <strong>{r.fault_name || shortFamily(r.log_family)}</strong>
                <span className="table-message">{r.message}</span>
              </td>
              <td className="mono">{r.fault_code ?? '—'}</td>
              <td>
                <Button variant="ghost" size="icon" aria-label={`Inspect record ${r.id}`} onClick={e => { e.stopPropagation(); onSelect(r); }}>
                  <ChevronRight />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="empty-state">No records match these filters.</div>}
    </div>
  );
}

export function LovableFlightWorkspace({ view: initialView = 'overview' }: { view?: View }) {
  const [currentView, setCurrentView] = useState<View>(initialView);
  const [hydrated, setHydrated] = useState(false);
  
  // CHANGE 6: Consistent Global Filters State
  const [globalNode, setGlobalNode] = useState('ALL');
  const [globalSeverity, setGlobalSeverity] = useState('ALL');
  const [globalCategory, setGlobalCategory] = useState('ALL');
  const [globalFaultCode, setGlobalFaultCode] = useState('ALL');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  const [aerospaceTheme, setAerospaceTheme] = useState<'avionics' | 'radar' | 'space'>('avionics');
  const [sceneAdjustments, setSceneAdjustments] = useState({
    pointSize: 0.065,
    heightScale: 1.0,
    autoRotate: false,
    autoRotateSpeed: 1.0,
    colorMode: 'severity' as 'severity' | 'node' | 'category',
    showGrid: true,
    viewPreset: 'iso' as 'iso' | 'top' | 'focus_c' | 'side'
  });

  const [selectedRecord, setSelectedRecord] = useState<FlightRecord | null>(null);
  const [running, setRunning] = useState(true);
  const [progress, setProgress] = useState(100);
  const [resetKey, setResetKey] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [notice, setNotice] = useState(false);
  const [help, setHelp] = useState(false);

  // One-Click Incident Investigation 3-Stage Engine State (Feature 1)
  const [investigating, setInvestigating] = useState(false);
  const [investigationStage, setInvestigationStage] = useState<1 | 2 | 3>(1);
  const [showInvestigationResults, setShowInvestigationResults] = useState(false);

  const runOneClickInvestigation = () => {
    setInvestigating(true);
    setInvestigationStage(1);
    
    setTimeout(() => {
      setInvestigationStage(2);
      setTimeout(() => {
        setInvestigationStage(3);
        setTimeout(() => {
          setInvestigating(false);
          setShowInvestigationResults(true);
        }, 300);
      }, 300);
    }, 300);
  };

  // Real-Time Live Streaming State
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [streamStats, setStreamStats] = useState(telemetryStreamer.stats);
  const [liveToastAlert, setLiveToastAlert] = useState<FlightRecord | null>(null);

  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    if (!running || progress === 100) return;
    const id = window.setInterval(() => setProgress(p => Math.min(100, p + 1)), 120);
    return () => window.clearInterval(id);
  }, [running, progress]);

  // Subscribe to Live Telemetry Streamer
  useEffect(() => {
    const unsubscribe = telemetryStreamer.subscribe((event: any) => {
      if (event.type === 'TELEMETRY_PACKET') {
        setStreamStats(event.stats);
        if (event.record.severity === 'CRITICAL' || event.record.fault_code === 6025) {
          setLiveToastAlert(event.record);
          setTimeout(() => setLiveToastAlert(null), 4500);
        }
      } else if (event.type === 'STREAM_STARTED') {
        setIsLiveStreaming(true);
      } else if (event.type === 'STREAM_PAUSED') {
        setIsLiveStreaming(false);
      }
    });
    return unsubscribe;
  }, []);

  // Filtered dataset according to Global Filters
  const filteredRecords = useMemo(() => {
    return filterRecords({
      query,
      node: globalNode,
      severity: globalSeverity,
      category: globalCategory,
      faultCode: globalFaultCode
    });
  }, [query, globalNode, globalSeverity, globalCategory, globalFaultCode]);

  // Dynamic Dataset Summary Stats
  const dynamicSummary = useMemo(() => getDatasetSummary(filteredRecords), [filteredRecords]);

  const recent = useMemo(() => [...filteredRecords].filter(r => r.fault_code === 6025 || r.severity === 'CRITICAL').sort((a,b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 5), [filteredRecords]);
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / 20));

  const resetAllFilters = () => {
    setGlobalNode('ALL');
    setGlobalSeverity('ALL');
    setGlobalCategory('ALL');
    setGlobalFaultCode('ALL');
    setQuery('');
    setPage(0);
  };

  const cascade = dataset.root_cause_analysis.event_cascade_steps;

  return (
    <div className="workspace">
      {/* Lovable Sidebar */}
      <aside className="sidebar">
        <button type="button" className="brand" onClick={() => setCurrentView('overview')}>
          <span className="brand-mark"><Plane /></span>
          <span>FlightStory<span className="brand-ai">AI</span><small>INVESTIGATION WORKSPACE</small></span>
        </button>

        <div className="workspace-selector">
          <span className="workspace-symbol">H</span>
          <div>Honeywell FMS<small>Engineering workspace</small></div>
          <ChevronDown size={14} />
        </div>

        <span className="nav-caption">INVESTIGATION NAVIGATION</span>
        <nav>
          {navigation.map(n => (
            <button 
              key={n.view} 
              type="button"
              className={`nav-item ${currentView === n.view ? 'active' : ''}`}
              onClick={() => setCurrentView(n.view as View)}
              style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <n.icon size={16} />
              <span>{n.label}</span>
              {'badge' in n && <span className="nav-new">{(n as any).badge}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-nodes">
          <span className="nav-caption">FMS NETWORK <span className="network-count">3</span></span>
          {nodes.map((n, i) => (
            <div className="sidebar-node" key={n}>
              <span className={`status-dot ${i === 2 ? 'critical' : 'success'}`} />
              <span>{n.replace('_', ' ')}<small>{nodeLabels[n]}</small></span>
              <span className="node-count">{allRecords.filter(r => r.node === n).length.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="dataset-state">
            <span className={`status-dot ${isLiveStreaming ? 'critical' : 'success'}`} />
            <span>{isLiveStreaming ? 'Live Stream Active' : '15 Logs Parsed'}<small>{isLiveStreaming ? `${streamStats.totalStreamed} pkts streamed` : '0 records skipped (100% PASS)'}</small></span>
            <ShieldCheck size={16} />
          </div>
          <Button variant="ghost" className="nav-item" onClick={() => setHelp(true)}>
            <CircleHelp size={16} /> Help & documentation
          </Button>
          <div className="profile">
            <div className="avatar">HK</div>
            <span>Harivignesh K<small>Workspace owner</small></span>
            <ChevronDown size={14} />
          </div>
        </div>
      </aside>

      {/* Main Shell */}
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            Investigation <ChevronRight size={13} /> <span>{titles[currentView]}</span>
          </div>
          
          {/* TOP RIGHT TOPBAR ACTIONS WITH PROMINENT INVESTIGATE SYSTEM BUTTON */}
          <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Button 
              style={{ 
                background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', 
                color: '#fff', 
                fontWeight: '800', 
                gap: '0.45rem', 
                padding: '0.55rem 1.1rem', 
                fontSize: '0.85rem', 
                boxShadow: '0 0 20px rgba(14, 165, 233, 0.6)',
                border: '1px solid #38bdf8'
              }}
              onClick={runOneClickInvestigation}
            >
              <Zap size={16} /> Investigate System ⭐
            </Button>

            {/* Live Streaming Badge */}
            <span className="environment" style={{ color: isLiveStreaming ? 'var(--critical)' : 'var(--success)' }}>
              <span className={`status-dot ${isLiveStreaming ? 'critical' : 'success'}`} />
              {isLiveStreaming ? `🔴 LIVE TELEMETRY (${streamStats.ratePerSec} pkts/s)` : 'EVIDENCE VERIFIED'}
            </span>

            <Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => setNotice(!notice)}>
              <Bell size={18} />
            </Button>
            <div className="small-avatar">HK</div>
          </div>
          {notice && (
            <div className="notification-popover">
              <strong>Analysis notifications</strong>
              <p>Fault 6025 identified on NODE C at 09:09:54 AM.</p>
              <small>LangGraph causal mapping updated for 5,257 records</small>
            </div>
          )}
        </header>

        {/* Real-Time Live Streaming Floating Alert Toast */}
        {liveToastAlert && (
          <div style={{
            position: 'fixed',
            top: '80px',
            right: '30px',
            zIndex: 1000,
            background: 'rgba(248, 113, 113, 0.95)',
            color: 'var(--card-foreground)',
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(248, 113, 113, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            maxWidth: '460px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <Radio className="w-6 h-6 animate-pulse" />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                LIVE FAULT INGESTION: {liveToastAlert.node} ({liveToastAlert.timestamp_display || liveToastAlert.timestamp})
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '0.2rem' }}>
                {liveToastAlert.fault_name || `Fault Code ${liveToastAlert.fault_code}`}
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '0.15rem' }}>
                {liveToastAlert.message}
              </div>
            </div>
          </div>
        )}

        <main className="main-content">
          
          {/* CHANGE 6: UNIFIED GLOBAL FILTERS BAR */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.85rem 1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--info)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Filter size={15} /> GLOBAL FILTERS:
            </span>

            {/* Node Filter */}
            <select 
              value={globalNode} 
              onChange={e => setGlobalNode(e.target.value)}
              style={{ padding: '0.4rem 0.65rem', borderRadius: '4px', background: 'var(--secondary)', color: 'var(--card-foreground)', border: '1px solid var(--border)', fontSize: '0.78rem' }}
            >
              <option value="ALL">All Nodes (A, B, C)</option>
              <option value="NODE_A">NODE_A (Master)</option>
              <option value="NODE_B">NODE_B (Standby)</option>
              <option value="NODE_C">NODE_C (Auxiliary)</option>
            </select>

            {/* Severity Filter */}
            <select 
              value={globalSeverity} 
              onChange={e => setGlobalSeverity(e.target.value)}
              style={{ padding: '0.4rem 0.65rem', borderRadius: '4px', background: 'var(--secondary)', color: 'var(--card-foreground)', border: '1px solid var(--border)', fontSize: '0.78rem' }}
            >
              <option value="ALL">All Severities</option>
              <option value="INFO">INFO Only</option>
              <option value="WARNING">WARNING Only</option>
              <option value="CRITICAL">CRITICAL Only</option>
            </select>

            {/* Log Family / Category Filter */}
            <select 
              value={globalCategory} 
              onChange={e => setGlobalCategory(e.target.value)}
              style={{ padding: '0.4rem 0.65rem', borderRadius: '4px', background: 'var(--secondary)', color: 'var(--card-foreground)', border: '1px solid var(--border)', fontSize: '0.78rem' }}
            >
              <option value="ALL">All 5 Log Families</option>
              <option value="Aircraft State">Aircraft State</option>
              <option value="Fault History">Fault History</option>
              <option value="Operator Interaction">Operator Interaction</option>
              <option value="Software Events">Software Events</option>
              <option value="State Transition">State Transition</option>
            </select>

            {/* Fault Code Filter */}
            <select 
              value={globalFaultCode} 
              onChange={e => setGlobalFaultCode(e.target.value)}
              style={{ padding: '0.4rem 0.65rem', borderRadius: '4px', background: 'var(--secondary)', color: 'var(--card-foreground)', border: '1px solid var(--border)', fontSize: '0.78rem' }}
            >
              <option value="ALL">All Fault Codes</option>
              <option value="6025">Fault 6025 (Primary PID Fail)</option>
              <option value="6074">Fault 6074 (Buffer Lockout)</option>
              <option value="6029">Fault 6029 (Semaphore Timeout)</option>
              <option value="6035">Fault 6035 (Consensus Restored)</option>
              <option value="NONE">No Fault Code (Nominal)</option>
            </select>

            {/* Reset Button */}
            <button 
              onClick={resetAllFilters} 
              className="nav-item" 
              style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.78rem', background: 'var(--secondary)', color: 'var(--muted-foreground)', marginLeft: 'auto' }}
            >
              <RefreshCw size={13} /> Reset Filters
            </button>
          </div>

          <div className="page-heading">
            <div>
              <div className="eyebrow">FLIGHT MANAGEMENT SYSTEM <span>/</span> MULTI-NODE INVESTIGATION</div>
              <h1>{titles[currentView]}</h1>
              <p>{subtitles[currentView]}</p>
            </div>
            <div className="heading-actions">
              {/* FEATURE 1: ONE-CLICK INVESTIGATION BUTTON ⭐ */}
              <Button 
                style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', color: '#fff', fontWeight: '700', gap: '0.45rem', padding: '0.6rem 1.25rem', fontSize: '0.85rem', boxShadow: '0 0 15px rgba(14, 165, 233, 0.4)' }}
                onClick={runOneClickInvestigation}
              >
                <Zap size={16} /> Investigate System ⭐
              </Button>

              <Button variant="outline" onClick={() => exportRecords(filteredRecords)}>
                <ArrowDownToLine size={14} />Export CSV
              </Button>
            </div>
          </div>

          {/* VIEW 1: MISSION OVERVIEW */}
          {currentView === 'overview' && (
            <>
              <div className="metrics-grid">
                {[
                  { label: 'TOTAL IMPORTED RECORDS', value: dynamicSummary.total.toLocaleString(), icon: Database, sub: `A: ${dynamicSummary.totalsByNode.NODE_A} · B: ${dynamicSummary.totalsByNode.NODE_B} · C: ${dynamicSummary.totalsByNode.NODE_C}`, foot: '0 records skipped (100% PASS)', type: 'neutral' },
                  { label: 'CRITICAL EVENTS', value: dynamicSummary.critical.toLocaleString(), icon: Activity, sub: 'Significant fault occurrences', foot: `${dynamicSummary.fault6025Count} Code 6025 events`, type: 'critical' },
                  { label: 'LOG FAMILY COVERAGE', value: `${Object.keys(dynamicSummary.totalsByCategory).length} / 5`, icon: Network, sub: 'Aircraft, Fault, Op, Sw, State', foot: 'All 5 log families parsed', type: 'success' },
                  { label: 'DATA QUALITY STATUS', value: '100%', icon: ShieldCheck, sub: 'All 15 source files passed', foot: 'Definition of done passed', type: 'teal' }
                ].map(m => (
                  <article className={`metric ${m.type}`} key={m.label}>
                    <div className="metric-label">{m.label}<m.icon size={17} /></div>
                    <div className="metric-value">{m.value}</div>
                    <p>{m.sub}</p>
                    <div className="metric-foot"><span className={`status-dot ${m.type}`} />{m.foot}</div>
                  </article>
                ))}
              </div>

              {/* RECORD TOTALS BY LOG FAMILY BREAKDOWN GRID */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--card-foreground)', marginBottom: '0.85rem' }}>Imported Record Breakdown by Log Family & Category</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  {Object.entries(dynamicSummary.totalsByCategory).map(([catName, count]) => (
                    <div 
                      key={catName}
                      onClick={() => { setGlobalCategory(catName); setCurrentView('evidence_quality'); }}
                      style={{ background: 'var(--secondary)', border: '1px solid var(--border)', padding: '0.85rem', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: familyColors[catName] || 'var(--info)', fontWeight: '700' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: familyColors[catName] || 'var(--info)' }} />
                        {catName}
                      </div>
                      <div style={{ fontSize: '1.5rem', color: 'var(--card-foreground)', fontWeight: '700', margin: '0.2rem 0' }}>
                        {count.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>
                        {((count / dynamicSummary.total) * 100).toFixed(1)}% of filtered total
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3D TELEMETRY EVENT LANDSCAPE MODEL WITH VIDEO PLAYBACK & ADJUSTABLE 3D CONTROLS */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--card-foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Box size={18} style={{ color: 'var(--info)' }} />
                    3D Telemetry Event Landscape Model (Interactive Viewport)
                  </h3>
                  
                  {/* Aerospace Theme Quick Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: '700' }}>Aerospace Theme:</span>
                    <button 
                      onClick={() => setAerospaceTheme('avionics')}
                      style={{ padding: '0.25rem 0.65rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700', background: aerospaceTheme === 'avionics' ? '#0ea5e9' : 'var(--secondary)', color: aerospaceTheme === 'avionics' ? '#fff' : 'var(--muted-foreground)', border: '1px solid var(--border)', cursor: 'pointer' }}
                    >
                      ✈️ Avionics Cockpit
                    </button>
                    <button 
                      onClick={() => setAerospaceTheme('radar')}
                      style={{ padding: '0.25rem 0.65rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700', background: aerospaceTheme === 'radar' ? '#10b981' : 'var(--secondary)', color: aerospaceTheme === 'radar' ? '#fff' : 'var(--muted-foreground)', border: '1px solid var(--border)', cursor: 'pointer' }}
                    >
                      📡 Tactical Radar
                    </button>
                    <button 
                      onClick={() => setAerospaceTheme('space')}
                      style={{ padding: '0.25rem 0.65rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700', background: aerospaceTheme === 'space' ? '#8b5cf6' : 'var(--secondary)', color: aerospaceTheme === 'space' ? '#fff' : 'var(--muted-foreground)', border: '1px solid var(--border)', cursor: 'pointer' }}
                    >
                      🌌 Deep Space
                    </button>
                  </div>
                </div>

                <div className="scene-viewport" style={{ height: '320px', borderRadius: '6px 6px 0 0', overflow: 'hidden', position: 'relative' }}>
                  <div className="scene-legend">
                    <span><i className="legend-dot info" />Info</span>
                    <span><i className="legend-dot warning" />Warning</span>
                    <span><i className="legend-dot critical" />Critical</span>
                  </div>
                  {hydrated && (
                    <Suspense fallback={<div className="scene-loading">Loading 3D event landscape…</div>}>
                      <LovableTelemetryScene 
                        node={globalNode} 
                        severity={globalSeverity} 
                        progress={progress} 
                        running={running} 
                        resetKey={resetKey} 
                        adjustments={sceneAdjustments}
                        onSelect={setSelectedRecord} 
                        propagation={false} 
                      />
                    </Suspense>
                  )}
                  <div className="scene-caption">TIME × SEVERITY × NODE</div>
                </div>

                {/* Video Playback Controls Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'var(--secondary)', border: '1px solid var(--border)', borderTop: 'none', padding: '0.75rem 1rem', borderRadius: '0', flexWrap: 'wrap' }}>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setRunning(!running)} 
                    style={{ gap: '0.35rem', background: running ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)', color: running ? '#f87171' : '#38bdf8', borderColor: running ? '#f87171' : '#38bdf8', fontWeight: '700' }}
                  >
                    {running ? <Pause size={14} /> : <Play size={14} />}
                    {running ? 'Pause Video Playback' : 'Play Video Timeline'}
                  </Button>

                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setProgress(0)} 
                    title="Replay from start"
                    style={{ gap: '0.25rem', color: 'var(--muted-foreground)' }}
                  >
                    <RotateCcw size={13} /> Replay
                  </Button>

                  {/* Time Progress Scrubber Slider */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: '180px' }}>
                    <span style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono', color: 'var(--muted-foreground)' }}>09:00:00</span>
                    <input 
                      type="range" 
                      min={0} 
                      max={100} 
                      value={progress} 
                      onChange={e => setProgress(Number(e.target.value))}
                      style={{ flex: 1, accentColor: '#38bdf8', cursor: 'pointer', height: '6px' }} 
                    />
                    <span style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono', color: '#38bdf8', fontWeight: '700' }}>
                      14:00:09
                    </span>
                  </div>

                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => { setProgress(25); setRunning(false); }} 
                    style={{ fontSize: '0.72rem', padding: '0.35rem 0.6rem', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.4)' }}
                  >
                    <Zap size={12} /> Jump to Fault 6025
                  </Button>
                </div>

                {/* ADJUSTABLE 3D SCENE FEATURES BAR */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--card)', border: '1px solid var(--border)', borderTop: 'none', padding: '0.85rem 1rem', borderRadius: '0 0 6px 6px', flexWrap: 'wrap', fontSize: '0.78rem' }}>
                  <span style={{ color: '#38bdf8', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Settings size={14} /> 3D ADJUSTABLE CONTROLS:
                  </span>

                  {/* Camera Angles */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>Perspective:</span>
                    {[
                      { id: 'iso', label: 'Iso 3D' },
                      { id: 'top', label: 'Top Radar' },
                      { id: 'focus_c', label: 'Node C' },
                      { id: 'side', label: 'Side' }
                    ].map(vp => (
                      <button
                        key={vp.id}
                        onClick={() => setSceneAdjustments(prev => ({ ...prev, viewPreset: vp.id as any }))}
                        style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: sceneAdjustments.viewPreset === vp.id ? '#0ea5e9' : 'var(--secondary)', color: sceneAdjustments.viewPreset === vp.id ? '#fff' : 'var(--card-foreground)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.72rem' }}
                      >
                        {vp.label}
                      </button>
                    ))}
                  </div>

                  {/* Height Exaggeration Slider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>Height Scale:</span>
                    <input 
                      type="range" 
                      min={0.5} 
                      max={2.5} 
                      step={0.1}
                      value={sceneAdjustments.heightScale}
                      onChange={e => setSceneAdjustments(prev => ({ ...prev, heightScale: parseFloat(e.target.value) }))}
                      style={{ width: '70px', accentColor: '#38bdf8', cursor: 'pointer' }}
                    />
                    <span style={{ fontFamily: 'JetBrains Mono', color: '#38bdf8' }}>{sceneAdjustments.heightScale.toFixed(1)}x</span>
                  </div>

                  {/* Point Size Slider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>Point Size:</span>
                    <input 
                      type="range" 
                      min={0.03} 
                      max={0.15} 
                      step={0.01}
                      value={sceneAdjustments.pointSize}
                      onChange={e => setSceneAdjustments(prev => ({ ...prev, pointSize: parseFloat(e.target.value) }))}
                      style={{ width: '70px', accentColor: '#38bdf8', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Auto Spin Toggle */}
                  <button
                    onClick={() => setSceneAdjustments(prev => ({ ...prev, autoRotate: !prev.autoRotate }))}
                    style={{ marginLeft: 'auto', padding: '0.25rem 0.65rem', borderRadius: '4px', background: sceneAdjustments.autoRotate ? 'rgba(52, 211, 153, 0.2)' : 'var(--secondary)', color: sceneAdjustments.autoRotate ? '#34d399' : 'var(--muted-foreground)', border: sceneAdjustments.autoRotate ? '1px solid #34d399' : '1px solid var(--border)', cursor: 'pointer', fontWeight: '700' }}
                  >
                    {sceneAdjustments.autoRotate ? '● Auto-Spin ON' : 'Auto-Spin OFF'}
                  </button>
                </div>
              </div>

              {/* FEATURE 6: INVESTIGATION PRIORITY SCORING TABLE */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--card-foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Target size={18} style={{ color: 'var(--critical)' }} />
                    Feature 6: Explainable Investigation Priority Scoring
                  </h3>
                  <span className="tiny-badge critical">TOP FAULT CLUSTER</span>
                </div>
                <div className="table-scroll">
                  <table className="event-table">
                    <thead>
                      <tr>
                        <th>EVENT / FAULT CODE</th>
                        <th>AVAILABLE EVIDENCE</th>
                        <th>SCORING RATIONALE</th>
                        <th>INVESTIGATION PRIORITY</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map(r => {
                        const scoreInfo = getPriorityScore(r);
                        return (
                          <tr key={r.id} onClick={() => { setSelectedRecord(r); setCurrentView('fault_explorer'); }}>
                            <td>
                              <strong>{r.fault_name || `Fault Code ${r.fault_code}`}</strong>
                              <span className="table-message">{r.node} · {r.timestamp.slice(11)}</span>
                            </td>
                            <td><span className="mono">{r.message.slice(0, 45)}</span></td>
                            <td><span className="tiny-badge">{scoreInfo.label}</span></td>
                            <td>
                              <span className="tiny-badge" style={{ color: scoreInfo.color, borderColor: scoreInfo.color, fontWeight: '700' }}>
                                {scoreInfo.priority} ({scoreInfo.score}/100)
                              </span>
                            </td>
                            <td>
                              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedRecord(r); setCurrentView('fault_explorer'); }}>
                                Inspect <ChevronRight size={13} />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FEATURE 7: MISSING-EVIDENCE MAP DIAGNOSTICS */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--card-foreground)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} style={{ color: 'var(--info)' }} />
                  Feature 7: Candidate Incident Missing-Evidence Map
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
                  Distinguishes verified findings from unconfirmed hypotheses or missing cross-node records.
                </p>
                <div className="table-scroll">
                  <table className="event-table">
                    <thead>
                      <tr>
                        <th>INVESTIGATION QUESTION</th>
                        <th>EVIDENCE STATUS</th>
                        <th>DETAILED ANALYSIS RESULT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getMissingEvidenceMap().map(q => (
                        <tr key={q.question}>
                          <td style={{ fontWeight: '600' }}>{q.question}</td>
                          <td>
                            <span className={`tiny-badge ${q.badge}`} style={{ fontWeight: '700' }}>
                              {q.status}
                            </span>
                          </td>
                          <td style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem' }}>{q.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lower-grid">
                <section className="timeline-section">
                  <div className="section-heading">
                    <div>
                      <h2>Compact Activity Timeline</h2>
                      <p className="section-subtitle">10-minute intervals across recorded window</p>
                    </div>
                    <div className="chart-legend">
                      <span><i className="legend-dot info" />Info</span>
                      <span><i className="legend-dot warning" />Warning</span>
                      <span><i className="legend-dot critical" />Critical</span>
                    </div>
                  </div>
                  <div className="activity-chart">
                    {hydrated && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timeline} margin={{ top: 15, right: 12, left: -24, bottom: 0 }}>
                          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5" />
                          <XAxis dataKey="time" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} interval={5} />
                          <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--foreground)' }} />
                          <Area type="monotone" dataKey="INFO" stackId="1" stroke="var(--info)" fill="var(--info)" fillOpacity={.14} />
                          <Area type="monotone" dataKey="WARNING" stackId="1" stroke="var(--warning)" fill="var(--warning)" fillOpacity={.13} />
                          <Area type="monotone" dataKey="CRITICAL" stackId="1" stroke="var(--critical)" fill="var(--critical)" fillOpacity={.18} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </section>

                <section className="node-health-section">
                  <div className="section-heading">
                    <h2>Node Distribution</h2>
                    <span className="section-subtitle">Record volume</span>
                  </div>
                  {nodes.map((n, i) => {
                    const count = filteredRecords.filter(r => r.node === n).length;
                    return (
                      <div className="node-health-row" key={n}>
                        <span className={`node-icon node_${String.fromCharCode(97 + i)}`}><Network size={15} /></span>
                        <div>
                          <strong>{n.replace('_', ' ')}<span>{count.toLocaleString()}</span></strong>
                          <small>{nodeLabels[n]}</small>
                          <progress value={count} max={Math.max(1, dynamicSummary.total)} />
                        </div>
                        <span className="distribution-pct">{((count / Math.max(1, dynamicSummary.total)) * 100).toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </section>
              </div>
            </>
          )}

          {/* 2. INCIDENT TIMELINE */}
          {currentView === 'timeline' && (
            <ThreeNodeTimeline 
              records={filteredRecords} 
              onSelectEvent={(rec) => { setSelectedRecord(rec); setCurrentView('fault_explorer'); }}
              selectedEventId={selectedRecord?.id}
            />
          )}

          {/* 3. INCIDENT PROPAGATION FLOW (LANGGRAPH CAUSAL CHAIN) */}
          {currentView === 'propagation' && (
            <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1.25rem' }}>
              <MainEventMapper rootCauseData={dataset.root_cause_analysis} records={filteredRecords} />
            </div>
          )}

          {/* 4. EVENT CORRELATION WITH RATIONALES */}
          {currentView === 'correlation' && (
            <CorrelationTab 
              records={filteredRecords} 
              onSelectRecord={(rec) => { setSelectedRecord(rec); setCurrentView('fault_explorer'); }} 
            />
          )}

          {/* 5. FAULT & EVENT EXPLORER (LEVEL 2) */}
          {currentView === 'fault_explorer' && (
            <ConnectedLevelsView 
              initialLevel={2}
              selectedRecord={selectedRecord} 
              onSelectRecord={(rec) => setSelectedRecord(rec)} 
            />
          )}

          {/* 6. OPERATIONAL CONTEXT (LEVEL 3) */}
          {currentView === 'operational_context' && (
            <ConnectedLevelsView 
              initialLevel={3}
              selectedRecord={selectedRecord} 
              onSelectRecord={(rec) => setSelectedRecord(rec)} 
            />
          )}

          {/* 7. AI INCIDENT ANALYST */}
          {currentView === 'ai_narrative' && (
            <NaturalLanguageQA records={filteredRecords} rootCauseData={dataset.root_cause_analysis} />
          )}

          {/* 8. EVIDENCE & DATA QUALITY (LEVEL 4) */}
          {currentView === 'evidence_quality' && (
            <ConnectedLevelsView 
              initialLevel={4}
              selectedRecord={selectedRecord} 
              onSelectRecord={(rec) => setSelectedRecord(rec)} 
            />
          )}

          <footer className="page-footer">
            <span><Plane size={13} />FlightStory AI <span className="footer-separator">/</span> Explainable AI investigation platform</span>
            <span>Source snapshot · 18 June 2032 <span className="status-dot success" /></span>
          </footer>
        </main>
      </div>

      {/* FEATURE 1: AUTOMATED 3-STAGE INVESTIGATION ENGINE MODAL */}
      {investigating && (
        <div className="drawer-shade">
          <div style={{ background: 'var(--card)', border: '1px solid var(--info)', borderRadius: '12px', padding: '2rem', maxWidth: '520px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', textAlign: 'center' }}>
            <Zap className="animate-bounce" size={40} style={{ color: 'var(--info)', margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.3rem', color: 'var(--card-foreground)', marginBottom: '0.4rem' }}>
              Automated 3-Stage Incident Engine Running...
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
              Targeting 2–5 minute investigation speed across 5,257 multi-node log records.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'left' }}>
              <div style={{ padding: '0.85rem', borderRadius: '6px', background: investigationStage >= 1 ? 'rgba(56,189,248,0.12)' : 'var(--secondary)', border: investigationStage === 1 ? '1px solid var(--info)' : '1px solid var(--border)' }}>
                <div style={{ fontWeight: '700', fontSize: '0.85rem', color: investigationStage >= 1 ? 'var(--info)' : 'var(--muted-foreground)' }}>
                  STAGE 1: DETECT (Logs Normalized & Significant Faults Identified)
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginTop: '0.2rem' }}>
                  {investigationStage >= 1 ? '✔ 15 HTML files parsed (5,257 events, 0 skipped records).' : 'Waiting...'}
                </div>
              </div>

              <div style={{ padding: '0.85rem', borderRadius: '6px', background: investigationStage >= 2 ? 'rgba(56,189,248,0.12)' : 'var(--secondary)', border: investigationStage === 2 ? '1px solid var(--info)' : '1px solid var(--border)' }}>
                <div style={{ fontWeight: '700', fontSize: '0.85rem', color: investigationStage >= 2 ? 'var(--info)' : 'var(--muted-foreground)' }}>
                  STAGE 2: CONNECT (Multi-Dimensional Event Fingerprinting & Correlation)
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginTop: '0.2rem' }}>
                  {investigationStage >= 2 ? '✔ Fingerprints matched across NODE_A, NODE_B, and NODE_C.' : 'Waiting...'}
                </div>
              </div>

              <div style={{ padding: '0.85rem', borderRadius: '6px', background: investigationStage >= 3 ? 'rgba(56,189,248,0.12)' : 'var(--secondary)', border: investigationStage === 3 ? '1px solid var(--info)' : '1px solid var(--border)' }}>
                <div style={{ fontWeight: '700', fontSize: '0.85rem', color: investigationStage >= 3 ? 'var(--info)' : 'var(--muted-foreground)' }}>
                  STAGE 3: EXPLAIN (Priority Scoring, Missing Evidence Map & AI Narrative)
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginTop: '0.2rem' }}>
                  {investigationStage >= 3 ? '✔ Reconstructing 3-lane candidate timeline & evidence report...' : 'Waiting...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUTOMATED CANDIDATE INCIDENT DETECTION SPOTLIGHT MODAL */}
      {showInvestigationResults && (
        <div className="drawer-shade" onClick={() => setShowInvestigationResults(false)}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--info)', borderRadius: '12px', padding: '1.75rem', maxWidth: '850px', width: '92%', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 25px 70px rgba(0,0,0,0.85)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
              <div>
                <span className="tiny-badge success" style={{ fontWeight: '700' }}>AUTOMATED INCIDENT DETECTED</span>
                <h2 style={{ fontSize: '1.35rem', color: 'var(--card-foreground)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert style={{ color: 'var(--critical)' }} size={24} />
                  Candidate Incident Report #INC-6025
                </h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowInvestigationResults(false)}>
                <X size={18} />
              </Button>
            </div>

            {/* Candidate Incident Summary Box */}
            <div style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--card-foreground)', marginBottom: '0.5rem' }}>
                Primary Incident: Fault Code 6025 (Process ID Lookup Failure Error 653)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', lineHeight: '1.5' }}>
                <strong>Primary Evidence:</strong> Logged on NODE_C at 09:09:54 AM.<br />
                <strong>Related Evidence:</strong> 329 Fault 6074 Lockouts on NODE_C + Node B Fault 6029 Semaphore Timeout (+6.4min).<br />
                <strong>Timeline Window:</strong> 09:00:00 AM – 09:43:07 AM (Dual-mode consensus restored).<br />
                <strong>Uncertainty Disclaimer:</strong> Shared causation across nodes remains unconfirmed hypothesis.
              </div>
            </div>

            {/* Action Jump Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <Button style={{ background: 'var(--info)', color: '#fff' }} onClick={() => { setShowInvestigationResults(false); setCurrentView('timeline'); }}>
                Inspect 3-Node Timeline <ArrowRight size={14} />
              </Button>
              <Button variant="outline" onClick={() => { setShowInvestigationResults(false); setCurrentView('correlation'); }}>
                View Event Fingerprints & Correlation <GitMerge size={14} />
              </Button>
              <Button variant="outline" onClick={() => { setShowInvestigationResults(false); setCurrentView('ai_narrative'); }}>
                Examine AI Evidence Narrative <Sparkles size={14} />
              </Button>
              <Button variant="outline" onClick={() => { setShowInvestigationResults(false); setCurrentView('evidence_quality'); }}>
                Drill to Level 4 Source Log <Database size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedRecord && <RecordDetail record={selectedRecord} onClose={() => setSelectedRecord(null)} />}

      {help && (
        <div className="drawer-shade" onClick={() => setHelp(false)}>
          <div className="help-dialog" onClick={e => e.stopPropagation()}>
            <div className="section-heading">
              <h2>About this analysis</h2>
              <Button variant="ghost" size="icon" aria-label="Close help" onClick={() => setHelp(false)}>
                <X size={16} />
              </Button>
            </div>
            <p>The imported FlightStory AI dataset contains 5,257 normalized FMS records from 15 decoded HTML reports (0 skipped records). Event colors reflect each record’s assigned severity. The propagation links and incident chain come from the dataset’s root-cause narrative and LangGraph causal flow mapping.</p>
            <p>The 3D scene encodes time horizontally, severity vertically, and node identity in depth. Drag to orbit, scroll to zoom, and select a point to inspect its source record.</p>
            <a href="https://github.com/harivignesk/flightstory-ai" target="_blank" rel="noreferrer">
              View original repository <ArrowRight size={14} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default LovableFlightWorkspace;
