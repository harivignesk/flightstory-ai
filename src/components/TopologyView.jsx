import React, { useState } from 'react';
import { Server, Activity, ArrowRightLeft, ShieldCheck, Wifi, Cpu, Layers } from 'lucide-react';

export default function TopologyView({ records }) {
  const [activeNode, setActiveNode] = useState('ALL');

  const nodeA = records.filter(r => r.node === 'NODE_A');
  const nodeB = records.filter(r => r.node === 'NODE_B');
  const nodeC = records.filter(r => r.node === 'NODE_C');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Topology Header */}
      <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #a855f7' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server className="w-5 h-5 text-purple-400" /> Honeywell Redundant 3-Node FMS Architecture Topology
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              Real-time state monitoring of triple modular redundant flight management systems: <strong>NODE_A</strong>, <strong>NODE_B</strong>, and <strong>NODE_C</strong>.
            </p>
          </div>
          <div className="badge badge-node-b" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            TRIPLE MODULAR REDUNDANCY (TMR)
          </div>
        </div>
      </div>

      {/* 3 Node Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        
        {/* NODE A */}
        <div className="glass-card glass-card-interactive" style={{ padding: '1.25rem', borderTop: '4px solid #38bdf8' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span className="badge badge-node-a" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
              NODE_A (Master)
            </span>
            <span className="badge badge-success">
              <Wifi className="w-3.5 h-3.5" /> ONLINE
            </span>
          </div>

          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', margin: '0.5rem 0', fontFamily: 'Outfit' }}>
            2,199 Records
          </div>
          <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '1rem' }}>
            41.83% of System Telemetry Load
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: '#9ca3af' }}>Role Position:</span>
              <span style={{ color: '#38bdf8', fontWeight: '600' }}>Captain / Primary Master</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: '#9ca3af' }}>Fault Repository Count:</span>
              <span style={{ color: '#f87171', fontWeight: '600' }}>582 Events</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: '#9ca3af' }}>CI BPQ Operator Events:</span>
              <span style={{ color: '#34d399', fontWeight: '600' }}>851 Events</span>
            </div>
          </div>
        </div>

        {/* NODE B */}
        <div className="glass-card glass-card-interactive" style={{ padding: '1.25rem', borderTop: '4px solid #a855f7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span className="badge badge-node-b" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
              NODE_B (Standby)
            </span>
            <span className="badge badge-success">
              <Wifi className="w-3.5 h-3.5" /> ONLINE
            </span>
          </div>

          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', margin: '0.5rem 0', fontFamily: 'Outfit' }}>
            1,177 Records
          </div>
          <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '1rem' }}>
            22.39% of System Telemetry Load
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: '#9ca3af' }}>Role Position:</span>
              <span style={{ color: '#a855f7', fontWeight: '600' }}>Standby / Backup Master</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: '#9ca3af' }}>Fault Repository Count:</span>
              <span style={{ color: '#f87171', fontWeight: '600' }}>588 Events</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: '#9ca3af' }}>CI BPQ Operator Events:</span>
              <span style={{ color: '#34d399', fontWeight: '600' }}>228 Events</span>
            </div>
          </div>
        </div>

        {/* NODE C */}
        <div className="glass-card glass-card-interactive" style={{ padding: '1.25rem', borderTop: '4px solid #34d399' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span className="badge badge-node-c" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
              NODE_C (Spare)
            </span>
            <span className="badge badge-success">
              <Wifi className="w-3.5 h-3.5" /> ONLINE
            </span>
          </div>

          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', margin: '0.5rem 0', fontFamily: 'Outfit' }}>
            1,881 Records
          </div>
          <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '1rem' }}>
            35.78% of System Telemetry Load
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: '#9ca3af' }}>Role Position:</span>
              <span style={{ color: '#34d399', fontWeight: '600' }}>First Officer / Auxiliary</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: '#9ca3af' }}>Fault Repository Count:</span>
              <span style={{ color: '#f87171', fontWeight: '600' }}>407 Events</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ color: '#9ca3af' }}>CI BPQ Operator Events:</span>
              <span style={{ color: '#34d399', fontWeight: '600' }}>840 Events</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
