import React, { useState, useEffect } from 'react';
import { 
  Target, 
  AlertTriangle, 
  ArrowDown, 
  CheckCircle2, 
  Layers, 
  Activity, 
  ShieldAlert, 
  Lock, 
  RefreshCw,
  Clock,
  Cpu,
  Zap,
  Info,
  ChevronDown,
  GitMerge,
  Play,
  Pause,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function MainEventMapper({ rootCauseData, records }) {
  const [activeStep, setActiveStep] = useState(1);
  const [isPlayingFlow, setIsPlayingFlow] = useState(true);

  const mainEvent = rootCauseData?.main_event || {
    event_id: "MAIN-EVT-6025",
    title: "Background Service Identity Failure",
    fault_code: 6025,
    sub_code: "Thunderbolt fault",
    primary_node: "NODE_C",
    timestamp: "2032-06-18 09:09:54 AM",
    payload: "get current process id failure 653;",
    impact: "Triggers data repository access lockouts and cross-node dual-mode failover re-synchronization.",
    root_cause_summary: "During the initial Navigation Database Refresh Cycle (09:00:31 AM), NODE_C experienced an operating system level process ID lookup failure (error code 653), preventing the background service identity from authenticating access to the shared FMS data repository."
  };

  const inputEvents = [
    {
      id: 'sub-1',
      step: 1,
      time: '09:00:31 AM',
      node: 'NODE_C',
      severity: 'INFO',
      title: 'Nav DB Refresh Triggered',
      description: 'Scheduled Navigation Database sync initiated on auxiliary Node C.',
      causalRole: 'Initial Triggering Action',
      payload: 'NAVDB_REFRESH_START seq=104'
    },
    {
      id: 'sub-2',
      step: 2,
      time: '09:09:54 AM',
      node: 'NODE_C',
      severity: 'CRITICAL',
      title: 'Fault 6025: Process ID Crash',
      description: 'OS process ID lookup failed (Error code 653). Identity revoked.',
      causalRole: 'PRIMARY ROOT CAUSE EVENT',
      payload: 'get current process id failure 653;'
    },
    {
      id: 'sub-3',
      step: 3,
      time: '09:12:15 AM',
      node: 'NODE_C',
      severity: 'WARNING',
      title: 'Fault 6074: Repository Lockouts',
      description: '329 telemetry buffer lockouts preventing queue writes.',
      causalRole: 'Direct Secondary Consequence',
      payload: 'BUF_LOCKOUT count=329 node=NODE_C'
    },
    {
      id: 'sub-4',
      step: 4,
      time: '09:18:40 AM',
      node: 'NODE_B',
      severity: 'CRITICAL',
      title: 'Fault 6029: Single-Mode Drop',
      description: '193 semaphore bus timeouts. Node B drops to single mode.',
      causalRole: 'Cross-Node Cascading Impact',
      payload: 'SEMA_TIMEOUT count=193 node=NODE_B'
    }
  ];

  // Auto-play animatic flow timer
  useEffect(() => {
    if (!isPlayingFlow) return;
    const interval = setInterval(() => {
      setActiveStep(prev => (prev >= 4 ? 1 : prev + 1));
    }, 2200);
    return () => clearInterval(interval);
  }, [isPlayingFlow]);

  const topFaults = rootCauseData?.fault_frequency_top || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="tiny-badge critical" style={{ fontWeight: '700' }}>TOP-TO-BOTTOM PROPAGATION FLOW MAP</span>
              <span className="tiny-badge info">LANGGRAPH METHOD</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--card-foreground)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <GitMerge style={{ color: '#38bdf8' }} size={24} />
              Incident Propagation Map (Recorded Sub-Events ➔ Final Main Event)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
              Top-to-bottom flowchart mapping recorded timestamped events across nodes down to form the final main root cause incident.
            </p>
          </div>

          {/* Animatic Playback Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={() => setIsPlayingFlow(!isPlayingFlow)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                background: isPlayingFlow ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                color: isPlayingFlow ? '#f87171' : '#38bdf8',
                border: isPlayingFlow ? '1px solid #f87171' : '1px solid #38bdf8',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              {isPlayingFlow ? <Pause size={15} /> : <Play size={15} />}
              {isPlayingFlow ? 'Pause Flow' : 'Play Flow'}
            </button>

            <button
              onClick={() => { setActiveStep(1); setIsPlayingFlow(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.55rem 0.85rem',
                borderRadius: '6px',
                background: 'var(--secondary)',
                color: 'var(--muted-foreground)',
                border: '1px solid var(--border)',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* TOP SECTION: RECORDED SUB-EVENTS ACROSS NODES */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '800', letterSpacing: '0.05em' }}>STEP 1: RECORDED SUB-EVENTS (INPUT DATA)</div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--card-foreground)', fontWeight: '700', marginTop: '0.15rem' }}>
              Individual Node Events Leading to the Incident
            </h3>
          </div>
          <span className="tiny-badge info">4 RECORDED SUB-EVENTS</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem' }}>
          {inputEvents.map(evt => {
            const isActive = activeStep === evt.step;
            return (
              <div 
                key={evt.id}
                onClick={() => { setActiveStep(evt.step); setIsPlayingFlow(false); }}
                style={{ 
                  background: isActive ? (evt.severity === 'CRITICAL' ? 'rgba(248, 113, 113, 0.15)' : 'rgba(56, 189, 248, 0.15)') : 'var(--secondary)', 
                  border: isActive ? (evt.severity === 'CRITICAL' ? '2px solid #f87171' : '2px solid #38bdf8') : '1px solid var(--border)', 
                  borderRadius: '8px', 
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? (evt.severity === 'CRITICAL' ? '0 0 20px rgba(248, 113, 113, 0.3)' : '0 0 20px rgba(56, 189, 248, 0.3)') : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span className={`node-tag ${evt.node.toLowerCase()}`}>{evt.node}</span>
                  <span className="mono" style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '700' }}>{evt.time}</span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--card-foreground)', margin: '0.25rem 0' }}>
                  {evt.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', lineHeight: '1.4' }}>
                  {evt.description}
                </div>
                <div style={{ marginTop: '0.65rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border)', fontSize: '0.7rem', color: evt.severity === 'CRITICAL' ? '#f87171' : '#38bdf8', fontWeight: '700' }}>
                  Role: {evt.causalRole}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MIDDLE SECTION: DOWNWARD ANIMATED FLOW ARROWS & LANGGRAPH CONVERGENCE */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0' }}>
        <div style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid #38bdf8', padding: '0.5rem 1.25rem', borderRadius: '20px', fontSize: '0.78rem', color: '#38bdf8', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={14} /> LangGraph Causal Graph Aggregates & Maps Events Downward
        </div>
        
        {/* Animated Pulsing Downward Arrows */}
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', justifyContent: 'center', margin: '0.3rem 0' }}>
          <div className="animate-bounce" style={{ color: '#38bdf8', background: 'var(--secondary)', border: '1px solid #38bdf8', borderRadius: '50%', padding: '0.4rem' }}>
            <ArrowDown size={20} />
          </div>
          <div className="animate-bounce" style={{ color: '#f87171', background: 'var(--secondary)', border: '1px solid #f87171', borderRadius: '50%', padding: '0.4rem' }}>
            <ArrowDown size={24} />
          </div>
          <div className="animate-bounce" style={{ color: '#38bdf8', background: 'var(--secondary)', border: '1px solid #38bdf8', borderRadius: '50%', padding: '0.4rem' }}>
            <ArrowDown size={20} />
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: FINAL MAIN EVENT & RESOLUTION HIGHLIGHT BOX */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(248, 113, 113, 0.18) 0%, rgba(17, 24, 39, 0.98) 100%)', 
        border: '2px solid #f87171', 
        borderRadius: '12px', 
        padding: '1.5rem',
        boxShadow: '0 0 35px rgba(248, 113, 113, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span className="tiny-badge critical" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', fontWeight: '800' }}>
                <Target size={14} style={{ marginRight: '4px' }} /> FINAL MAIN INCIDENT IDENTIFIED
              </span>
              <span className="node-tag node_c">PRIMARY NODE C</span>
              <span className="mono" style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: '700' }}>
                <Clock size={13} style={{ display: 'inline', marginRight: '3px' }} /> 09:09:54 AM – 09:42:50 AM
              </span>
            </div>

            <h2 style={{ fontSize: '1.5rem', color: 'var(--card-foreground)', fontWeight: '800', margin: '0.4rem 0' }}>
              Fault Code {mainEvent.fault_code}: {mainEvent.title}
            </h2>

            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', maxWidth: '850px', lineHeight: '1.6', marginTop: '0.35rem' }}>
              {mainEvent.root_cause_summary}
            </p>

            <div style={{ marginTop: '1rem', background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.4)', borderRadius: '6px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={18} style={{ color: '#34d399', flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: '800', textTransform: 'uppercase' }}>FINAL RESOLUTION OUTCOME</span>
                <div style={{ fontSize: '0.84rem', color: 'var(--card-foreground)', fontWeight: '600' }}>
                  Node A Master Consensus Protocol Restored Dual-Mode Sync across all 3 nodes at 09:42:50 AM (Fault 6035).
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(248, 113, 113, 0.4)', padding: '1rem 1.25rem', borderRadius: '8px', minWidth: '220px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>RAW ENGINEERING PAYLOAD</div>
            <div style={{ fontSize: '0.95rem', color: '#38bdf8', fontFamily: 'JetBrains Mono', fontWeight: '700', marginTop: '0.25rem' }}>
              {mainEvent.payload}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.35rem' }}>
              Impact: Cascaded into 329 lockouts & 193 timeouts.
            </div>
          </div>
        </div>
      </div>

      {/* Cascading Fault Frequencies Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', color: 'var(--card-foreground)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle className="w-4 h-4 text-rose-400" /> Cascading Fault Frequencies Resulting from Main Event
        </h4>

        <div className="table-scroll">
          <table className="event-table compact">
            <thead>
              <tr>
                <th>FAULT CODE</th>
                <th>DESCRIPTION</th>
                <th>RECORDS</th>
                <th>SEVERITY</th>
              </tr>
            </thead>
            <tbody>
              {topFaults.map((f) => (
                <tr key={f.code}>
                  <td className="mono" style={{ color: '#f87171', fontWeight: '800' }}>
                    Code {f.code}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>
                    {f.name}
                  </td>
                  <td className="mono" style={{ color: '#38bdf8', fontWeight: '700' }}>
                    {f.count}
                  </td>
                  <td>
                    <span className={`severity ${f.severity.toLowerCase()}`}>
                      {f.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
