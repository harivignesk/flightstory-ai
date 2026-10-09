import React, { useState } from 'react';
import { Network, Server, ShieldCheck, AlertTriangle, Zap, Activity, Cpu } from 'lucide-react';
import { nodes, nodeLabels, records } from '../data/flight-data';

export default function NodeTopologyGraph({ onSelectNode }) {
  const [selectedNode, setSelectedNode] = useState('NODE_C');

  const nodeDetails = {
    NODE_A: {
      role: 'Master Primary Controller',
      ip: '192.168.10.1',
      status: 'NOMINAL DUAL-MODE',
      statusColor: '#34d399',
      recordsCount: records.filter(r => r.node === 'NODE_A').length,
      healthScore: '99.4%',
      primaryTask: 'Master Consensus & Flight Plan Computation'
    },
    NODE_B: {
      role: 'Standby Redundant Controller',
      ip: '192.168.10.2',
      status: 'SINGLE-MODE FALLBACK',
      statusColor: '#fbbf24',
      recordsCount: records.filter(r => r.node === 'NODE_B').length,
      healthScore: '91.8%',
      primaryTask: 'Semaphore Queue & Standby Mirror'
    },
    NODE_C: {
      role: 'Auxiliary Database Processor',
      ip: '192.168.10.3',
      status: 'PRIMARY FAULT SOURCE',
      statusColor: '#f87171',
      recordsCount: records.filter(r => r.node === 'NODE_C').length,
      healthScore: '74.2%',
      primaryTask: 'Nav DB Refresh & Background Identity'
    }
  };

  const activeInfo = nodeDetails[selectedNode] || nodeDetails.NODE_C;

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            FMS TRIPLE REDUNDANCY TOPOLOGY
          </div>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--card-foreground)', fontWeight: '800', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Network size={20} style={{ color: '#38bdf8' }} />
            Visual Multi-Node Network Topology & Signal Beams
          </h3>
        </div>
        <span className="tiny-badge info">3 ACTIVE REDUNDANT NODES</span>
      </div>

      {/* Visual Network Graphic Diagram */}
      <div style={{ background: 'rgba(7, 11, 20, 0.95)', border: '1px solid var(--border)', borderRadius: '10px', padding: '2rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-around', position: 'relative', overflow: 'hidden' }}>
        
        {/* Signal Beam Connection Lines */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <line x1="20%" y1="50%" x2="50%" y2="50%" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="50%" y1="50%" x2="80%" y2="50%" stroke="#f87171" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 20% 50% Q 50% 10% 80% 50%" fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="6 4" />
        </svg>

        {/* NODE A (Master) */}
        <div 
          onClick={() => { setSelectedNode('NODE_A'); if (onSelectNode) onSelectNode('NODE_A'); }}
          style={{
            zIndex: 5,
            cursor: 'pointer',
            background: selectedNode === 'NODE_A' ? 'rgba(56, 189, 248, 0.2)' : 'var(--secondary)',
            border: selectedNode === 'NODE_A' ? '2px solid #38bdf8' : '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.1rem',
            textAlign: 'center',
            minWidth: '180px',
            boxShadow: selectedNode === 'NODE_A' ? '0 0 25px rgba(56, 189, 248, 0.4)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#38bdf8', color: '#070b14', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontWeight: '800' }}>
            <Server size={22} />
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--card-foreground)' }}>NODE A</div>
          <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '700' }}>MASTER PRIMARY</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>1,752 records</div>
        </div>

        {/* NODE B (Standby) */}
        <div 
          onClick={() => { setSelectedNode('NODE_B'); if (onSelectNode) onSelectNode('NODE_B'); }}
          style={{
            zIndex: 5,
            cursor: 'pointer',
            background: selectedNode === 'NODE_B' ? 'rgba(251, 191, 36, 0.2)' : 'var(--secondary)',
            border: selectedNode === 'NODE_B' ? '2px solid #fbbf24' : '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.1rem',
            textAlign: 'center',
            minWidth: '180px',
            boxShadow: selectedNode === 'NODE_B' ? '0 0 25px rgba(251, 191, 36, 0.4)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fbbf24', color: '#070b14', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontWeight: '800' }}>
            <Cpu size={22} />
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--card-foreground)' }}>NODE B</div>
          <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: '700' }}>STANDBY MIRROR</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>1,752 records</div>
        </div>

        {/* NODE C (Auxiliary) */}
        <div 
          onClick={() => { setSelectedNode('NODE_C'); if (onSelectNode) onSelectNode('NODE_C'); }}
          style={{
            zIndex: 5,
            cursor: 'pointer',
            background: selectedNode === 'NODE_C' ? 'rgba(248, 113, 113, 0.2)' : 'var(--secondary)',
            border: selectedNode === 'NODE_C' ? '2px solid #f87171' : '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.1rem',
            textAlign: 'center',
            minWidth: '180px',
            boxShadow: selectedNode === 'NODE_C' ? '0 0 25px rgba(248, 113, 113, 0.4)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f87171', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontWeight: '800' }}>
            <AlertTriangle size={22} className="animate-pulse" />
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--card-foreground)' }}>NODE C</div>
          <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: '800' }}>AUXILIARY (FAULT SOURCE)</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>1,753 records</div>
        </div>

      </div>

      {/* Selected Node Details Box */}
      <div style={{ marginTop: '1rem', background: 'var(--secondary)', border: '1px solid var(--border)', padding: '1rem 1.25rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="tiny-badge" style={{ background: activeInfo.statusColor, color: '#fff', fontWeight: '800' }}>
              {selectedNode}: {activeInfo.status}
            </span>
            <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>IP: {activeInfo.ip}</span>
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--card-foreground)', marginTop: '0.35rem' }}>
            Role: {activeInfo.role}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.15rem' }}>
            Task: {activeInfo.primaryTask}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', textAlign: 'right' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>HEALTH SCORE</div>
            <div style={{ fontSize: '1.25rem', color: activeInfo.statusColor, fontWeight: '800' }}>{activeInfo.healthScore}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>TOTAL RECORDS</div>
            <div style={{ fontSize: '1.25rem', color: 'var(--card-foreground)', fontWeight: '800' }}>{activeInfo.recordsCount}</div>
          </div>
        </div>
      </div>

    </div>
  );
}
