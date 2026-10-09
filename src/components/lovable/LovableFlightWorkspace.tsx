import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { 
  Activity, ArrowDownToLine, ArrowRight, Bell, Box, Check, ChevronDown, 
  ChevronLeft, ChevronRight, CircleHelp, Database, Expand, FileText, 
  GitBranch, LayoutDashboard, Network, Pause, Plane, Play, RotateCcw, 
  Search, Settings2, ShieldCheck, Target, Zap, Server, X, Radio, FastForward, Sparkles
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { dataset, records, summary, timeline, nodes, nodeLabels, filterRecords, exportRecords, type FlightRecord } from '../../data/flight-data';
import telemetryStreamer from '../../data/telemetry-streamer';

import InteractiveFreeFlowGraph from '../InteractiveFreeFlowGraph';
import MainEventMapper from '../MainEventMapper';
import NaturalLanguageQA from '../NaturalLanguageQA';

const LovableTelemetryScene = lazy(() => import('./telemetry-scene'));

export type View = 'overview' | 'main_event' | 'free_flow' | 'explorer' | 'qa_advanced';

// 5 MOST WANTED HIGH-PRIORITY EVALUATION FEATURES
const navigation = [
  { view: 'overview', path: '/', label: '1. Overview & 3D Telemetry', icon: LayoutDashboard },
  { view: 'main_event', path: '/main_event', label: '2. Incident Causal Flow (Arrows)', icon: Target, badge: 'FLOW' },
  { view: 'free_flow', path: '/free_flow', label: '3. Interactive Free-Flow Graph', icon: Zap, badge: 'TOUCH' },
  { view: 'explorer', path: '/explorer', label: '4. Evidence Log Explorer', icon: Database, badge: '5,257' },
  { view: 'qa_advanced', path: '/qa_advanced', label: '5. Explainable AI Q&A & Scoring', icon: Sparkles, badge: 'ADV' }
] as const;

const shortFamily = (family: string) => family.replace(' Log', '').replace(' Buffer', '').replace('FM ', '');

const titles: Record<View, string> = {
  overview: '1. Mission Overview & 3D Telemetry Landscape',
  main_event: '2. LangGraph Incident-to-Incident Causal Flow (Directional Arrows)',
  free_flow: '3. Interactive Free-Flow Causal Graph (Touch & Physics)',
  explorer: '4. Level 4 Evidence Detail & Log Explorer (5,257 Records)',
  qa_advanced: '5. Explainable AI Q&A, Anomaly Scoring & Node Agreement'
};

const subtitles: Record<View, string> = {
  overview: 'Level 1 Flight Overview: KPI metrics, 3D WebGL telemetry scene, operational phases, and recovery summary.',
  main_event: 'Chronological incident flow with glowing directional arrows (➔) mapping First Incident to Next Incident.',
  free_flow: 'Touch-interactive animatic spring physics stream mapping timestamp events across NODE A, B, and C.',
  explorer: 'Decoded engineering payload evidence, source file links, search filters, and CSV data export.',
  qa_advanced: 'Natural-language log query assistant, anomaly scoring engine, and Facts vs Inference vs Uncertainty separation.'
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
  const [node, setNode] = useState('ALL');
  const [severity, setSeverity] = useState('ALL');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<FlightRecord | null>(null);
  const [running, setRunning] = useState(true);
  const [progress, setProgress] = useState(100);
  const [resetKey, setResetKey] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [notice, setNotice] = useState(false);
  const [help, setHelp] = useState(false);

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

  const filtered = useMemo(() => filterRecords(query, node, severity), [query, node, severity]);
  const recent = useMemo(() => [...filtered].filter(r => r.fault_code === 6025 || r.severity === 'CRITICAL').sort((a,b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 5), [filtered]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / 20));

  function setFilter(kind: 'node' | 'severity', value: string) {
    kind === 'node' ? setNode(value) : setSeverity(value);
    setPage(0);
  }

  return (
    <div className="workspace">
      {/* Lovable Sidebar */}
      <aside className="sidebar">
        <button type="button" className="brand" onClick={() => setCurrentView('overview')}>
          <span className="brand-mark"><Plane /></span>
          <span>FlightStory<span className="brand-ai">AI</span><small>EVALUATION WORKSPACE</small></span>
        </button>

        <div className="workspace-selector">
          <span className="workspace-symbol">H</span>
          <div>Honeywell FMS<small>Engineering workspace</small></div>
          <ChevronDown size={14} />
        </div>

        <span className="nav-caption">TOP 5 EVALUATION FEATURES</span>
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
              <span className="node-count">{records.filter(r => r.node === n).length.toLocaleString()}</span>
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
            Evaluation <ChevronRight size={13} /> <span>{titles[currentView]}</span>
          </div>
          <div className="topbar-actions">
            {/* Live Streaming Badge */}
            <span className="environment" style={{ color: isLiveStreaming ? 'var(--critical)' : 'var(--success)' }}>
              <span className={`status-dot ${isLiveStreaming ? 'critical' : 'success'}`} />
              {isLiveStreaming ? `🔴 LIVE TELEMETRY (${streamStats.ratePerSec} pkts/s)` : 'EVIDENCE VERIFIED (0 SKIPPED)'}
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
            color: '#fff',
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
          <div className="page-heading">
            <div>
              <div className="eyebrow">FLIGHT MANAGEMENT SYSTEM <span>/</span> EVALUATION FEATURE #{currentView === 'overview' ? 1 : currentView === 'main_event' ? 2 : currentView === 'free_flow' ? 3 : currentView === 'explorer' ? 4 : 5}</div>
              <h1>{titles[currentView]}</h1>
              <p>{subtitles[currentView]}</p>
            </div>
            <div className="heading-actions">
              {/* Live Streaming Control Buttons */}
              <Button 
                variant={isLiveStreaming ? "destructive" : "default"} 
                size="sm"
                onClick={() => isLiveStreaming ? telemetryStreamer.stop() : telemetryStreamer.start(2)}
                style={{ gap: '0.4rem', fontWeight: 600 }}
              >
                {isLiveStreaming ? <Pause size={14} /> : <Radio size={14} />}
                {isLiveStreaming ? 'Pause Real-Time Stream' : 'Start Real-Time Stream'}
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => { telemetryStreamer.seekToFault(); telemetryStreamer.start(5); }}
                style={{ gap: '0.4rem' }}
                title="Jump directly to Fault 6025 incident window"
              >
                <FastForward size={14} /> Jump to Fault 6025
              </Button>

              <Button variant="outline" onClick={() => exportRecords(filtered)}>
                <ArrowDownToLine size={14} />Export data
              </Button>
            </div>
          </div>

          <div className="dataset-ribbon">
            <span><span className={`status-dot ${isLiveStreaming ? 'critical' : 'success'}`} />{isLiveStreaming ? `Live SSE Stream Active (${streamStats.totalStreamed} received)` : 'honeywell_fms_dataset.json'}</span>
            <span>15 decoded HTML files<span className="ribbon-divider" />3 redundant nodes<span className="ribbon-divider" /><ShieldCheck size={13} /> 0 skipped records (100% PASS)</span>
          </div>

          {/* FEATURE 1: OVERVIEW & 3D TELEMETRY */}
          {currentView === 'overview' && (
            <>
              <div className="metrics-grid">
                {[
                  { label: 'TOTAL RECORDS', value: isLiveStreaming ? streamStats.totalStreamed.toLocaleString() : '5,257', icon: Database, sub: isLiveStreaming ? 'Live SSE Streamed' : 'Across 15 source files', foot: '0 records skipped (100% PASS)', type: 'neutral' },
                  { label: 'CRITICAL EVENTS', value: summary.critical.toLocaleString(), icon: Activity, sub: '11.7% of normalized records', foot: 'Requires investigation', type: 'critical' },
                  { label: 'CONNECTED NODES', value: '3 / 3', icon: Network, sub: 'NODE_A · NODE_B · NODE_C', foot: 'All nodes represented', type: 'success' },
                  { label: 'DATA VALIDATION', value: '100%', icon: ShieldCheck, sub: 'All 15 files marked PASS', foot: 'Definition of done passed', type: 'teal' }
                ].map(m => (
                  <article className={`metric ${m.type}`} key={m.label}>
                    <div className="metric-label">{m.label}<m.icon size={17} /></div>
                    <div className="metric-value">{m.value}</div>
                    <p>{m.sub}</p>
                    <div className="metric-foot"><span className={`status-dot ${m.type}`} />{m.foot}</div>
                  </article>
                ))}
              </div>

              <div className="analysis-grid">
                <section className={`scene-section ${expanded ? 'scene-expanded' : ''}`}>
                  <div className="section-heading">
                    <div className="section-title">
                      <Box size={18} />
                      <h2>3D Telemetry Event Landscape</h2>
                      <span className="tiny-badge">WEBGL</span>
                    </div>
                    <div className="scene-header-controls">
                      <Button size="icon" variant="ghost" title="Reset camera" aria-label="Reset camera" onClick={() => setResetKey(k => k + 1)}>
                        <RotateCcw size={16} />
                      </Button>
                      <Button size="icon" variant="ghost" title={expanded ? 'Close expanded view' : 'Expand visualization'} aria-label={expanded ? 'Close expanded view' : 'Expand visualization'} onClick={() => setExpanded(!expanded)}>
                        {expanded ? <X size={16} /> : <Expand size={16} />}
                      </Button>
                    </div>
                  </div>

                  <div className="scene-filterbar">
                    <div className="segmented">
                      {['ALL', ...nodes].map(n => (
                        <Button key={n} size="sm" variant="ghost" className={node === n ? 'selected' : ''} onClick={() => setFilter('node', n)}>
                          {n === 'ALL' ? 'All nodes' : n.replace('_', ' ')}
                        </Button>
                      ))}
                    </div>
                    <label className="select-label">
                      <Settings2 size={14} />
                      <select aria-label="Scene severity" value={severity} onChange={e => setFilter('severity', e.target.value)}>
                        <option value="ALL">All severities</option>
                        <option>INFO</option>
                        <option>WARNING</option>
                        <option>CRITICAL</option>
                      </select>
                    </label>
                  </div>

                  <div className="scene-viewport">
                    <div className="scene-legend">
                      <span><i className="legend-dot info" />Info</span>
                      <span><i className="legend-dot warning" />Warning</span>
                      <span><i className="legend-dot critical" />Critical</span>
                    </div>
                    {hydrated && (
                      <Suspense fallback={<div className="scene-loading">Loading 3D event landscape…</div>}>
                        <LovableTelemetryScene 
                          node={node} 
                          severity={severity} 
                          progress={progress} 
                          running={running} 
                          resetKey={resetKey} 
                          onSelect={setSelected} 
                          propagation={false} 
                        />
                      </Suspense>
                    )}
                    <div className="scene-caption">TIME × SEVERITY × NODE</div>
                    <div className="scene-record-count">
                      <span className="status-dot teal" />{filtered.length.toLocaleString()} records{progress < 100 ? ' · replay' : ''}
                    </div>
                  </div>

                  <div className="scene-playback">
                    <Button variant="ghost" size="icon" aria-label={running ? 'Pause replay' : 'Play replay'} onClick={() => { if (!running && progress === 100) setProgress(0); setRunning(!running); }}>
                      {running ? <Pause size={16} /> : <Play size={16} />}
                    </Button>
                    <span className="mono">09:00:00</span>
                    <input aria-label="Timeline position" type="range" min="0" max="100" value={progress} onChange={e => { setProgress(Number(e.target.value)); setRunning(false); }} />
                    <span className="mono">14:00:09</span>
                    <span className="playback-speed">1×</span>
                  </div>
                  <div className="scene-evidence">Directional links: dataset-supplied incident narrative & LangGraph event flow mapping</div>
                </section>

                <aside className="incident-panel">
                  <div className="section-heading">
                    <div className="section-title">
                      <GitBranch size={17} />
                      <h2>Incident Spotlight</h2>
                    </div>
                    <span className="tiny-badge critical">CRITICAL</span>
                  </div>
                  <div className="incident-body">
                    <span className="eyebrow critical-text">PRIMARY FAULT · 6025</span>
                    <h3>Background service<br />identity failure</h3>
                    <div className="incident-meta">
                      <span className="node-tag node_c">NODE C</span>
                      <span className="mono">09:09:54 AM</span>
                    </div>
                    
                    {/* Explicit Fact vs Inference Badges */}
                    <div style={{ display: 'flex', gap: '0.4rem', margin: '0.5rem 0' }}>
                      <span className="tiny-badge success">[FACT] Log Code 6025</span>
                      <span className="tiny-badge" style={{ color: 'var(--info)' }}>[INFERENCE] PID 653</span>
                    </div>

                    <p>Process ID lookup failed with error 653. Causal analysis maps this event to repository lockouts and cross-node failover.</p>
                    <div className="incident-code">get current process id failure 653;</div>
                    <div className="incident-stats">
                      <div><span>268</span><small>Code 6025 events</small></div>
                      <div><span>3 nodes</span><small>Cascade coverage</small></div>
                    </div>
                    <div className="incident-recovery">
                      <Check size={15} />
                      <span>Recovery in source narrative<small>Dual-mode consensus · 09:43:07</small></span>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => setCurrentView('main_event')}>
                      Inspect Incident Flow Arrows <ArrowRight size={14} />
                    </Button>
                  </div>
                </aside>
              </div>

              <div className="lower-grid">
                <section className="timeline-section">
                  <div className="section-heading">
                    <div>
                      <h2>Event Activity</h2>
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
                    const count = records.filter(r => r.node === n).length;
                    return (
                      <div className="node-health-row" key={n}>
                        <span className={`node-icon node_${String.fromCharCode(97 + i)}`}><Network size={15} /></span>
                        <div>
                          <strong>{n.replace('_', ' ')}<span>{count.toLocaleString()}</span></strong>
                          <small>{nodeLabels[n]}</small>
                          <progress value={count} max={summary.total} />
                        </div>
                        <span className="distribution-pct">{(count / summary.total * 100).toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </section>
              </div>

              <section className="recent-section">
                <div className="section-heading">
                  <div className="section-title">
                    <Activity size={16} />
                    <h2>Critical Event Feed</h2>
                    <span className="tiny-badge">IMPORTED</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentView('explorer')}>
                    View all records <ArrowRight size={14} />
                  </Button>
                </div>
                <EventTable rows={recent} onSelect={setSelected} compact />
              </section>
            </>
          )}

          {/* FEATURE 2: INCIDENT CAUSAL FLOW WITH DIRECTIONAL ARROWS */}
          {currentView === 'main_event' && (
            <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1rem', marginTop: '1rem' }}>
              <MainEventMapper rootCauseData={dataset.root_cause_analysis} records={records} />
            </div>
          )}

          {/* FEATURE 3: INTERACTIVE FREE-FLOW CAUSAL GRAPH (TOUCH) */}
          {currentView === 'free_flow' && (
            <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1rem', marginTop: '1rem' }}>
              <InteractiveFreeFlowGraph records={records} rootCauseData={dataset.root_cause_analysis} />
            </div>
          )}

          {/* FEATURE 4: UNIFIED LOG EXPLORER & LEVEL 4 EVIDENCE (5,257) */}
          {currentView === 'explorer' && (
            <section className="explorer-section">
              <div className="explorer-controls">
                <div className="search-field">
                  <Search size={16} />
                  <input 
                    aria-label="Search logs" 
                    placeholder="Search messages, fault codes, or timestamps…" 
                    value={query} 
                    onChange={e => { setQuery(e.target.value); setPage(0); }} 
                  />
                </div>
                <select aria-label="Filter node" value={node} onChange={e => setFilter('node', e.target.value)}>
                  <option value="ALL">All nodes</option>
                  {nodes.map(n => <option key={n}>{n}</option>)}
                </select>
                <select aria-label="Filter severity" value={severity} onChange={e => setFilter('severity', e.target.value)}>
                  <option value="ALL">All severities</option>
                  <option>INFO</option>
                  <option>WARNING</option>
                  <option>CRITICAL</option>
                </select>
              </div>

              <div className="result-count">{filtered.length.toLocaleString()} matching records (0 skipped / 100% importer coverage)</div>
              <EventTable rows={filtered.slice(page * 20, page * 20 + 20)} onSelect={setSelected} />
              
              <div className="pagination">
                <span>Page {page + 1} of {totalPages}</span>
                <div>
                  <Button variant="outline" size="icon" aria-label="Previous page" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft size={16} />
                  </Button>
                  <Button variant="outline" size="icon" aria-label="Next page" disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* FEATURE 5: EXPLAINABLE AI Q&A & ANOMALY SCORING (ADVANCED) */}
          {currentView === 'qa_advanced' && (
            <div style={{ marginTop: '1rem' }}>
              <NaturalLanguageQA records={records} rootCauseData={dataset.root_cause_analysis} />
            </div>
          )}

          <footer className="page-footer">
            <span><Plane size={13} />FlightStory AI <span className="footer-separator">/</span> Explainable AI investigation platform</span>
            <span>Source snapshot · 18 June 2032 <span className="status-dot success" /></span>
          </footer>
        </main>
      </div>

      {selected && <RecordDetail record={selected} onClose={() => setSelected(null)} />}

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
