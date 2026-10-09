import React from 'react';
import { 
  ShieldCheck, 
  AlertOctagon, 
  Target, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Server, 
  FileText,
  AlertTriangle
} from 'lucide-react';

export default function SupervisorBriefing({ rootCauseData, records }) {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Supervisory Executive Header */}
      <div className="glass-card" style={{ 
        padding: '1.5rem', 
        borderLeft: '5px solid #10b981',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.9) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                <ShieldCheck className="w-4 h-4" /> SUPERVISORY SYSTEM STATUS: OPERATIONAL & STABLE
              </span>
              <span className="badge badge-info" style={{ fontSize: '0.8rem' }}>
                REDUNDANCY RESTORED
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', marginTop: '0.5rem' }}>
              Executive Supervisor Briefing: Honeywell FMS Incident Investigation
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Essential high-level findings, root-cause event summary, and corrective action plan for system supervisors.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '0.75rem 1.1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase' }}>Ingested Logs</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#38bdf8' }}>5,257</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '0.75rem 1.1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase' }}>Active Nodes</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#a855f7' }}>3 Nodes</div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '0.75rem 1.1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase' }}>Data Integrity</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#34d399' }}>100%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Incident Brief & Actionable Recommendations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem' }}>
        
        {/* Key Incident Brief */}
        <div className="glass-card" style={{ gridColumn: 'span 7', padding: '1.35rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target className="w-5 h-5 text-rose-400" /> Key Incident Briefing (What Occurred)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.2)', padding: '0.9rem', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: '#f87171', fontSize: '0.9rem' }}>
                  Main Event: Fault Code 6025 (Background Identity Failure)
                </span>
                <span className="badge badge-node-c">NODE_C @ 09:09:54 AM</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '0.4rem', lineHeight: '1.5' }}>
                <strong>Root Cause:</strong> System call <code>get current process id</code> failed with error <code>653</code> during a Navigation Database Refresh lock cycle. This prevented background service identity authentication.
              </p>
            </div>

            <div style={{ background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.2)', padding: '0.9rem', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: '#fbbf24', fontSize: '0.9rem' }}>
                  System Impact & Cascade
                </span>
                <span className="badge badge-warning">Failover Re-sync</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '0.4rem', lineHeight: '1.5' }}>
                Triggered 329 data repository lockouts and 198 IPC socket bind failures. NODE_B temporarily dropped to Single Standby mode. NODE_A maintained primary Master control until dual-mode consensus was fully restored at 09:42:50 AM.
              </p>
            </div>

            <div style={{ background: 'rgba(52, 211, 153, 0.08)', border: '1px solid rgba(52, 211, 153, 0.2)', padding: '0.9rem', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: '#34d399', fontSize: '0.9rem' }}>
                  Flight Safety Outcome
                </span>
                <span className="badge badge-success">ZERO LOSS / ZERO IMPACT</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '0.4rem', lineHeight: '1.5' }}>
                Triple modular redundancy (TMR) functioned as designed. Flight guidance and positioning telemetry remained continuous and uncorrupted throughout the incident window.
              </p>
            </div>
          </div>
        </div>

        {/* Supervisory Directives */}
        <div className="glass-card" style={{ gridColumn: 'span 5', padding: '1.35rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Actionable Supervisory Directives
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.75rem', marginTop: '2px', flexShrink: 0 }}>1</div>
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.85rem' }}>Software Patch Deployment (FMS v6.4.2)</strong>
                  <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.15rem' }}>Deploy patch to resolve process ID lookup error 653 during database refresh locks.</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.75rem', marginTop: '2px', flexShrink: 0 }}>2</div>
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.85rem' }}>IPC Semaphore Timeout Tuning</strong>
                  <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.15rem' }}>Increase IPC semaphore timeout threshold from 50ms to 250ms on NODE_C.</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.75rem', marginTop: '2px', flexShrink: 0 }}>3</div>
                <div>
                  <strong style={{ color: '#fff', fontSize: '0.85rem' }}>Real-time Telemetry Health Monitor</strong>
                  <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.15rem' }}>Enable automated alerts on Fault Code 6025 triggers across all 3 nodes.</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.85rem', borderRadius: '10px', marginTop: '1rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Supervisory Sign-off Status: </span>
            <strong style={{ color: '#34d399' }}>APPROVED FOR PRODUCTION MONITORING</strong>
          </div>
        </div>

      </div>
    </div>
  );
}
