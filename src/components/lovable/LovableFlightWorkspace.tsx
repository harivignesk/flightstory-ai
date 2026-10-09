import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { 
  Activity, ArrowDownToLine, ArrowRight, Bell, Box, Check, ChevronDown, 
  ChevronLeft, ChevronRight, CircleHelp, Database, Expand, FileText, 
  GitBranch, LayoutDashboard, Network, Pause, Plane, Play, RotateCcw, 
  Search, Settings2, ShieldCheck, Target, Zap, Server, X 
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { dataset, records, summary, timeline, nodes, nodeLabels, filterRecords, exportRecords, type FlightRecord } from '../../data/flight-data';

import InteractiveFreeFlowGraph from '../InteractiveFreeFlowGraph';
import SupervisorBriefing from '../SupervisorBriefing';
import MainEventMapper from '../MainEventMapper';
import TopologyView from '../TopologyView';

const LovableTelemetryScene = lazy(() => import('./telemetry-scene'));

export type View = 'overview' | 'propagation' | 'free_flow' | 'supervisor' | 'main_event' | 'explorer' | 'quality' | 'topology';

const navigation = [
  { view: 'overview', path: '/', label: 'Overview', icon: LayoutDashboard },
  { view: 'propagation', path: '/propagation', label: 'Propagation map', icon: GitBranch, badge: '3D' },
  { view: 'free_flow', path: '/free_flow', label: 'Free-flow graph', icon: Zap, badge: 'TOUCH' },
  { view: 'supervisor', path: '/supervisor', label: 'Supervisor briefing', icon: ShieldCheck },
  { view: 'main_event', path: '/main_event', label: 'Main event mapper', icon: Target, badge: 'PS' },
  { view: 'explorer', path: '/explorer', label: 'Log explorer', icon: Database },
  { view: 'quality', path: '/quality', label: 'Data validation', icon: ShieldCheck },
  { view: 'topology', path: '/topology', label: 'Node topology', icon: Server }
] as const;

const shortFamily = (family: string) => family.replace(' Log', '').replace(' Buffer', '').replace('FM ', '');

const titles: Record<View, string> = {
  overview: 'Mission overview',
  propagation: 'Fault propagation (3D)',
  free_flow: 'Free-flow animatic touch visualizer',
  supervisor: 'Supervisor executive briefing',
  main_event: 'Main event causal mapper (PS Fault 6025)',
  explorer: 'Unified log explorer',
  quality: 'Data validation & coverage',
  topology: '3-Node FMS redundancy topology'
};

const subtitles: Record<View, string> = {
  overview: 'One flight. Three nodes. The complete story.',
  propagation: 'Trace the incident across time, severity, and redundant FMS nodes in 3D.',
  free_flow: 'Touch-interactive spring physics graph with animatic particle flow streams.',
  supervisor: 'High-level executive overview designed for supervising engineers.',
  main_event: 'LangGraph multi-node causal dependency graph for root-cause fault code 6025.',
  explorer: 'The complete normalized telemetry record across all 15 source files.',
  quality: 'Source integrity and normalized record coverage verification report.',
  topology: 'Dual-mode master-standby-auxiliary redundant state matrix.'
};

function RecordDetail({ record, onClose }: { record: FlightRecord; onClose: () => void }) {
  return (
    <div className="drawer-shade" onClick={onClose}>
      <aside className="record-drawer" onClick={e => e.stopPropagation()}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">RECORD INSPECTOR</span>
            <h2>Event #{record.id}</h2>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close record" onClick={onClose}>
            <X />
          </Button>
        </div>
        <span className={`severity ${record.severity.toLowerCase()}`}>{record.severity}</span>
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
        <h3>Decoded message</h3>
        <pre>{record.message}</pre>
        <h3>Raw record JSON</h3>
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

  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    if (!running || progress === 100) return;
    const id = window.setInterval(() => setProgress(p => Math.min(100, p + 1)), 120);
    return () => window.clearInterval(id);
  }, [running, progress]);

  const filtered = useMemo(() => filterRecords(query, node, severity), [query, node, severity]);
  const recent = useMemo(() => [...filtered].filter(r => r.fault_code === 6025 || r.severity === 'CRITICAL').sort((a,b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 5), [filtered]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / 20));

  function setFilter(kind: 'node' | 'severity', value: string) {
    kind === 'node' ? setNode(value) : setSeverity(value);
    setPage(0);
  }

  const cascade = dataset.root_cause_analysis.event_cascade_steps;

  return (
    <div className="workspace">
      {/* Lovable Sidebar */}
      <aside className="sidebar">
        <button type="button" className="brand" onClick={() => setCurrentView('overview')}>
          <span className="brand-mark"><Plane /></span>
          <span>FlightStory<span className="brand-ai">AI</span><small>FLIGHT INTELLIGENCE</small></span>
        </button>

        <div className="workspace-selector">
          <span className="workspace-symbol">H</span>
          <div>Honeywell FMS<small>Engineering workspace</small></div>
          <ChevronDown size={14} />
        </div>

        <span className="nav-caption">WORKSPACE</span>
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
            <span className="status-dot success" />
            <span>Dataset connected<small>15 files · 5,257 records</small></span>
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
            Workspace <ChevronRight size={13} /> <span>{titles[currentView]}</span>
          </div>
          <div className="topbar-actions">
            <span className="environment">
              <span className="status-dot success" /> LOVABLE LIVE ENVIRONMENT
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

        <main className="main-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">FLIGHT MANAGEMENT SYSTEM <span>/</span> MULTI-NODE ANALYTICS</div>
              <h1>{titles[currentView]}</h1>
              <p>{subtitles[currentView]}</p>
            </div>
            <div className="heading-actions">
              <span className="date-chip">
                <FileText size={14} />18 Jun 2032 <span className="mono">09:00–14:00</span>
              </span>
              <Button variant="outline" onClick={() => exportRecords(filtered)}>
                <ArrowDownToLine size={14} />Export data
              </Button>
            </div>
          </div>

          <div className="dataset-ribbon">
            <span><span className="status-dot success" />honeywell_fms_dataset.json</span>
            <span>15 decoded HTML files<span className="ribbon-divider" />3 redundant nodes<span className="ribbon-divider" /><ShieldCheck size={13} /> Imported & LangGraph verified</span>
          </div>

          {/* VIEW: OVERVIEW or PROPAGATION */}
          {(currentView === 'overview' || currentView === 'propagation') && (
            <>
              <div className="metrics-grid">
                {[
                  { label: 'TOTAL RECORDS', value: '5,257', icon: Database, sub: 'Across all three FMS nodes', foot: '15 source files', type: 'neutral' },
                  { label: 'CRITICAL EVENTS', value: summary.critical.toLocaleString(), icon: Activity, sub: '11.7% of normalized records', foot: 'Requires investigation', type: 'critical' },
                  { label: 'CONNECTED NODES', value: '3 / 3', icon: Network, sub: 'Primary · standby · auxiliary', foot: 'All nodes represented', type: 'success' },
                  { label: 'DATA VALIDATION', value: '100%', icon: ShieldCheck, sub: 'All 15 files marked PASS', foot: 'Source quality report', type: 'teal' }
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
                      <h2>{currentView === 'propagation' ? '3D propagation map' : '3D event landscape'}</h2>
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
                          propagation={currentView === 'propagation'} 
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
                      <h2>Incident spotlight</h2>
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
                    <Button variant="outline" className="w-full" onClick={() => setCurrentView(currentView === 'overview' ? 'propagation' : 'main_event')}>
                      {currentView === 'overview' ? 'Explore propagation' : 'Inspect main event flow'} <ArrowRight size={14} />
                    </Button>
                  </div>
                </aside>
              </div>

              {currentView === 'propagation' ? (
                <section className="cascade-section">
                  <div className="section-heading">
                    <div>
                      <h2>Incident chain</h2>
                      <p className="section-subtitle">Five stages from root-cause analysis</p>
                    </div>
                    <span className="tiny-badge">CAUSAL FLOW</span>
                  </div>
                  <div className="cascade-flow">
                    {cascade.map((s, i) => (
                      <article className={`cascade-stage stage-${i}`} key={s.step}>
                        <div className="cascade-step">0{s.step}{i < 4 && <ArrowRight size={15} />}</div>
                        <span className="mono">{s.time}</span>
                        <h3>{s.phase}</h3>
                        <p>{s.description}</p>
                        <div className="cascade-node-list">
                          {s.nodes.map(n => (
                            <span className={`node-tag ${n.toLowerCase()}`} key={n}>{n.replace('_', ' ')}</span>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ) : (
                <div className="lower-grid">
                  <section className="timeline-section">
                    <div className="section-heading">
                      <div>
                        <h2>Event activity</h2>
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
                      <h2>Node distribution</h2>
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
              )}

              {currentView === 'overview' && (
                <section className="recent-section">
                  <div className="section-heading">
                    <div className="section-title">
                      <Activity size={16} />
                      <h2>Critical event feed</h2>
                      <span className="tiny-badge">IMPORTED</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentView('explorer')}>
                      View all records <ArrowRight size={14} />
                    </Button>
                  </div>
                  <EventTable rows={recent} onSelect={setSelected} compact />
                </section>
              )}
            </>
          )}

          {/* VIEW: FREE-FLOW GRAPH (TOUCH / ANIMATIC) */}
          {currentView === 'free_flow' && (
            <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1rem', marginTop: '1rem' }}>
              <InteractiveFreeFlowGraph records={records} rootCauseData={dataset.root_cause_analysis} />
            </div>
          )}

          {/* VIEW: SUPERVISOR BRIEFING */}
          {currentView === 'supervisor' && (
            <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1rem', marginTop: '1rem' }}>
              <SupervisorBriefing rootCauseData={dataset.root_cause_analysis} records={records} />
            </div>
          )}

          {/* VIEW: MAIN EVENT MAPPER */}
          {currentView === 'main_event' && (
            <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1rem', marginTop: '1rem' }}>
              <MainEventMapper rootCauseData={dataset.root_cause_analysis} records={records} />
            </div>
          )}

          {/* VIEW: TOPOLOGY */}
          {currentView === 'topology' && (
            <div style={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '1rem', marginTop: '1rem' }}>
              <TopologyView records={records} />
            </div>
          )}

          {/* VIEW: UNIFIED LOG EXPLORER */}
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

              <div className="result-count">{filtered.length.toLocaleString()} matching records</div>
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

          {/* VIEW: DATA VALIDATION */}
          {currentView === 'quality' && (
            <section className="quality-section">
              <div className="quality-summary">
                <ShieldCheck size={28} />
                <div>
                  <h2>15 of 15 source files passed</h2>
                  <p>Validation status supplied with repository dataset & verified by LangGraph node cluster.</p>
                </div>
                <span className="tiny-badge success">100% COVERAGE</span>
              </div>
              <div className="table-scroll">
                <table className="event-table">
                  <thead>
                    <tr>
                      <th>SOURCE FILE</th>
                      <th>NODE</th>
                      <th>FAMILY</th>
                      <th>RECORDS</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataset.quality_stats.file_details.map(f => (
                      <tr key={f.filename}>
                        <td className="source-filename">{f.filename}</td>
                        <td><span className={`node-tag ${f.node.toLowerCase()}`}>{f.node.replace('_', ' ')}</span></td>
                        <td>{shortFamily(f.family)}</td>
                        <td className="mono">{f.records_count}</td>
                        <td><span className="severity success"><Check size={12} />{f.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <footer className="page-footer">
            <span><Plane size={13} />FlightStory AI <span className="footer-separator">/</span> Honeywell FMS analytics</span>
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
            <p>The imported FlightStory AI dataset contains 5,257 normalized FMS records from 15 decoded HTML reports. Event colors reflect each record’s assigned severity. The propagation links and incident chain come from the dataset’s root-cause narrative and LangGraph causal flow mapping.</p>
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
