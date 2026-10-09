import React, { useState } from 'react';
import { 
  GitMerge, AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2, 
  HelpCircle, Clock, Link2, Copy, FileQuestion, Layers, Search
} from 'lucide-react';
import { records as allRecords } from '../data/flight-data';

export default function CorrelationTab({ records = allRecords, onSelectRecord }) {
  const [selectedRelation, setSelectedRelation] = useState(null);
  const [filterRationale, setFilterRationale] = useState('ALL');

  // Defined Correlation Relationships with Explicit Rationales
  const relationships = [
    {
      id: 'rel-1',
      sourceId: 102,
      targetId: 103,
      sourceNode: 'NODE_C',
      targetNode: 'NODE_C',
      sourceEvent: 'Fault 6025: Process ID Lookup Failure',
      targetEvent: 'Fault 6074: Repository Access Lockout (329 events)',
      rationaleType: 'Contextual Association',
      rationaleDetail: 'Documented field error code 653 directly precedes data buffer lockout handles.',
      certainty: 'HIGH (Documented Handle Sequence)',
      timeDelta: '+2.1s'
    },
    {
      id: 'rel-2',
      sourceId: 103,
      targetId: 184,
      sourceNode: 'NODE_C',
      targetNode: 'NODE_B',
      sourceEvent: 'Fault 6074: Repository Access Lockout',
      targetEvent: 'Fault 6029: Node B Semaphore Timeout (193 events)',
      rationaleType: 'Temporal & Cross-Node Association',
      rationaleDetail: 'Events occurred within a 6-minute window across inter-node bus; Node B dropped to single-mode fallback.',
      certainty: 'MEDIUM (Cross-Node Bus Timeout)',
      timeDelta: '+6.4min'
    },
    {
      id: 'rel-3',
      sourceId: 210,
      targetId: 211,
      sourceNode: 'NODE_B',
      targetNode: 'NODE_B',
      sourceEvent: 'FM CI BPQ Log Entry #210',
      targetEvent: 'FM CI BPQ Log Entry #211',
      rationaleType: 'Possible Duplicate',
      rationaleDetail: 'Records have identical payload structures and sub-millisecond timestamps requiring engineering review.',
      certainty: 'REVIEW REQUIRED',
      timeDelta: '+0.002s'
    },
    {
      id: 'rel-4',
      sourceId: 305,
      targetId: null,
      sourceNode: 'NODE_A',
      targetNode: 'UNMATCHED',
      sourceEvent: 'Aircraft State Buffer Log Entry #305',
      targetEvent: 'No Cross-Node Match Found',
      rationaleType: 'No Match Found',
      rationaleDetail: 'No matching record found on Node B or C using current rule-based association window.',
      certainty: 'UNMATCHED (Not Proof of Absence)',
      timeDelta: 'N/A'
    },
    {
      id: 'rel-5',
      sourceId: 412,
      targetId: 415,
      sourceNode: 'NODE_A',
      targetNode: 'NODE_B',
      sourceEvent: 'Fault 6035: Dual-Mode Consensus Restored',
      targetEvent: 'State Transition Buffer Log #415',
      rationaleType: 'Contextual Association',
      rationaleDetail: 'Node A master resynchronization payload matches Node B state transition ack.',
      certainty: 'HIGH (Master Protocol Ack)',
      timeDelta: '+1.2s'
    }
  ];

  const filteredRelations = relationships.filter(r => {
    if (filterRationale !== 'ALL' && r.rationaleType !== filterRationale) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Banner */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--card-foreground)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <GitMerge style={{ color: 'var(--info)' }} size={22} />
              Cross-Node Event Correlation & Relationship Rationale
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', marginTop: '0.2rem' }}>
              Cross-node associations evaluated with explicit rationale types (Temporal, Contextual, Possible Duplicate, No Match Found).
            </p>
          </div>

          <select 
            value={filterRationale}
            onChange={e => setFilterRationale(e.target.value)}
            style={{ padding: '0.45rem 0.75rem', borderRadius: '4px', background: 'var(--secondary)', color: 'var(--card-foreground)', border: '1px solid var(--border)', fontSize: '0.8rem' }}
          >
            <option value="ALL">All Rationale Types</option>
            <option value="Contextual Association">Contextual Association</option>
            <option value="Temporal & Cross-Node Association">Temporal Association</option>
            <option value="Possible Duplicate">Possible Duplicate</option>
            <option value="No Match Found">No Match Found</option>
          </select>
        </div>
      </div>

      {/* Strict Causation & Proximity Disclaimers (Requirement 4) */}
      <div style={{ background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: '6px', padding: '0.85rem 1.1rem', fontSize: '0.78rem', color: 'var(--critical)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <AlertTriangle size={16} /> CRITICAL CORRELATION PRINCIPLES & PROXIMITY DISCLAIMERS:
        </div>
        <ul style={{ paddingLeft: '1.2rem', margin: '0.2rem 0', color: 'var(--foreground)', lineHeight: '1.5' }}>
          <li><strong>Temporal Proximity != Proof of Causation:</strong> Events occurring within a close time window are correlated by temporal association, not proven causation.</li>
          <li><strong>No Automatic Incident Confirmation:</strong> Two events occurring simultaneously do not automatically confirm a causal incident.</li>
          <li><strong>Unmatched Events Preserved:</strong> A missing cross-node match is handled honestly and displayed as "No Match Found"—it does NOT prove an event did not occur.</li>
        </ul>
      </div>

      {/* Feature 2: Multi-Dimensional Event Fingerprinting Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--card-foreground)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} style={{ color: 'var(--info)' }} />
          Feature 2: Multi-Dimensional Event Fingerprinting Comparison
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
          Instead of comparing identical fault codes, correlation uses multi-field event fingerprints (Node ID, Code, Category, Timestamp, Sequence, Context State).
        </p>
        <div className="table-scroll">
          <table className="event-table">
            <thead>
              <tr>
                <th>FMS NODE</th>
                <th>FINGERPRINT ID</th>
                <th>EVENT / FAULT CODE</th>
                <th>PARSED TIMESTAMP</th>
                <th>CORRELATION RESULT & RATIONALE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="node-tag node_a">NODE_A</span></td>
                <td className="mono">FP-NODE_A-6025-102</td>
                <td><strong>Fault 6025 (Primary PID Failure)</strong></td>
                <td className="mono">09:37:22.014</td>
                <td><span className="tiny-badge success">PRIMARY EVIDENCE</span> Documented Error 653</td>
              </tr>
              <tr>
                <td><span className="node-tag node_b">NODE_B</span></td>
                <td className="mono">FP-NODE_B-6029-184</td>
                <td><strong>Fault 6029 (Node B Semaphore Timeout)</strong></td>
                <td className="mono">09:37:24.120</td>
                <td><span className="tiny-badge warning">POTENTIALLY RELATED</span> Differing code (+2.1s window)</td>
              </tr>
              <tr>
                <td><span className="node-tag node_c">NODE_C</span></td>
                <td className="mono">FP-NODE_C-NONE-—</td>
                <td><strong>No Matching Record Logged</strong></td>
                <td className="mono">—</td>
                <td><span className="tiny-badge">NO MATCH FOUND</span> Preserved (Not proof of absence)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Relationships Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {filteredRelations.map(rel => {
          const isSelected = selectedRelation?.id === rel.id;
          const borderStyle = rel.rationaleType.includes('Contextual') 
            ? '2px solid var(--info)' 
            : rel.rationaleType.includes('Temporal') 
            ? '2px dashed var(--warning)' 
            : rel.rationaleType.includes('Duplicate') 
            ? '2px dotted #a855f7' 
            : '2px dashed var(--border)';

          return (
            <div 
              key={rel.id}
              onClick={() => setSelectedRelation(rel)}
              style={{ 
                background: 'var(--card)', 
                border: isSelected ? '2px solid #38bdf8' : borderStyle, 
                borderRadius: '8px', 
                padding: '1.1rem', 
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span className="tiny-badge" style={{ color: rel.rationaleType === 'Possible Duplicate' ? '#a855f7' : rel.rationaleType === 'No Match Found' ? 'var(--muted-foreground)' : rel.rationaleType.includes('Temporal') ? 'var(--warning)' : 'var(--info)' }}>
                  {rel.rationaleType}
                </span>
                <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>
                  {rel.timeDelta}
                </span>
              </div>

              {/* Source ➔ Target Nodes */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className={`node-tag ${rel.sourceNode.toLowerCase()}`}>{rel.sourceNode}</span>
                <ArrowRight size={14} style={{ color: 'var(--muted-foreground)' }} />
                <span className={`node-tag ${rel.targetNode.toLowerCase()}`}>{rel.targetNode}</span>
              </div>

              <div style={{ fontWeight: '700', color: 'var(--card-foreground)', fontSize: '0.85rem' }}>{rel.sourceEvent}</div>
              {rel.targetEvent !== 'No Cross-Node Match Found' && (
                <div style={{ fontSize: '0.8rem', color: 'var(--info)', marginTop: '0.2rem' }}>➔ {rel.targetEvent}</div>
              )}

              {/* Rationale Detail */}
              <div style={{ background: 'var(--secondary)', padding: '0.65rem 0.85rem', borderRadius: '4px', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--muted-foreground)', lineHeight: '1.4' }}>
                <strong style={{ color: 'var(--card-foreground)' }}>Rationale:</strong> {rel.rationaleDetail}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
