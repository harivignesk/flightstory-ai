import React from 'react';
import { BrainCircuit, CheckCircle2, AlertOctagon, Zap, Lightbulb, FileText } from 'lucide-react';

export default function AIDiagnosisTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #818cf8' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BrainCircuit className="w-5 h-5 text-indigo-400" /> Executive Diagnostic Summary & Root Cause Analysis
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              Synthesized from the <strong>ChatGPT Shared Chat ("Simplify Log Analysis Plan")</strong> for Honeywell Hackathon FMS Log Analysis.
            </p>
          </div>
          <span className="badge badge-info" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            PROJECT PLAN STAGE 1 - 4
          </span>
        </div>
      </div>

      {/* 4 Stages Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
        
        {/* Stage 1 */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>1</div>
            <h4 style={{ fontSize: '0.95rem', color: '#fff' }}>Stage 1: Multi-Node Ingestion & Normalization</h4>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: '1.5' }}>
            Successfully parsed all 15 HTML log files across Node A (5 files), Node B (5 files), and Node C (5 files). Extracted 5,257 total records covering 5 log families (FM CI BPQ, Fault Repository, FM LBPQ, State Transition Buffer, Aircraft State Buffer).
          </p>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-success">5,257 Records</span>
            <span className="badge badge-info">15/15 Files</span>
          </div>
        </div>

        {/* Stage 2 */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>2</div>
            <h4 style={{ fontSize: '0.95rem', color: '#fff' }}>Stage 2: Validation & File Quality Audit</h4>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: '1.5' }}>
            Verified complete normalization with 0 unparseable timestamps. Record count distribution verified: Node A = 2,199, Node B = 1,177, Node C = 1,881. Clean timestamp format standardization achieved across all files.
          </p>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-success">0 Timestamp Errors</span>
            <span className="badge badge-node-a">Validation 100%</span>
          </div>
        </div>

        {/* Stage 3 */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(248, 113, 113, 0.2)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>3</div>
            <h4 style={{ fontSize: '0.95rem', color: '#fff' }}>Stage 3: Cross-Node Fault & Failover Root Cause</h4>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: '1.5' }}>
            Identified primary anomaly: <strong>Fault Code 6025 (Background Service Identity Failure)</strong>. Subcode "Thunderbolt fault" occurs during Navigation Database Refresh Cycles, triggering Master/Standby re-synchronization across nodes without losing flight stability.
          </p>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-critical">Fault 6025</span>
            <span className="badge badge-warning">Context ID 6</span>
          </div>
        </div>

        {/* Stage 4 */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>4</div>
            <h4 style={{ fontSize: '0.95rem', color: '#fff' }}>Stage 4: Executive Recommendations</h4>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: '1.5' }}>
            1. Patch process ID acquisition mechanism in public FMS artifact service layer.<br/>
            2. Optimize Navigation Database Refresh memory allocation to prevent subcode Thunderbolt time-outs.<br/>
            3. Deploy real-time telemetry correlation filters for early failover detection.
          </p>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-node-b">Mitigation Ready</span>
            <span className="badge badge-info">Hackathon Complete</span>
          </div>
        </div>

      </div>
    </div>
  );
}
