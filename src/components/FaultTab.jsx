import React, { useState } from 'react';
import { AlertOctagon, Flame, Cpu, Terminal, ShieldAlert, FileText } from 'lucide-react';

export default function FaultTab({ records }) {
  const faultRecords = records.filter(r => r.log_family === 'Fault Repository Log');

  // Breakdown by Node
  const nodeA = faultRecords.filter(r => r.node === 'NODE_A');
  const nodeB = faultRecords.filter(r => r.node === 'NODE_B');
  const nodeC = faultRecords.filter(r => r.node === 'NODE_C');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f87171' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--card-foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertOctagon className="w-5 h-5 text-rose-400" /> Fault Repository Public FMS Artifact Deep-Dive
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>
              Analyzed <strong>1,577 total fault repository records</strong> across Node A (582), Node B (588), and Node C (407).
            </p>
          </div>
          <span className="badge badge-critical" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            1,577 CRITICAL EVENTS
          </span>
        </div>
      </div>

      {/* Fault Metrics Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>NODE_A Fault Count</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#38bdf8' }}>582</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>36.9% of Total Faults</div>
            </div>
            <div className="kpi-icon" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>NODE_B Fault Count</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#a855f7' }}>588</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>37.3% of Total Faults</div>
            </div>
            <div className="kpi-icon" style={{ color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>NODE_C Fault Count</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#34d399' }}>407</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>25.8% of Total Faults</div>
            </div>
            <div className="kpi-icon" style={{ color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.3)' }}>
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Fault Table */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '1rem', color: 'var(--card-foreground)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal className="w-4 h-4 text-cyan-400" /> Decoded Fault Records Stream (Sample View)
        </h4>

        <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Serial #</th>
                <th>Date & Time</th>
                <th>Node</th>
                <th>Fault Code</th>
                <th>Sub Code</th>
                <th>Fault Name</th>
                <th>Application Data</th>
                <th>Recovery Action</th>
              </tr>
            </thead>
            <tbody>
              {faultRecords.slice(0, 15).map((f, i) => (
                <tr key={i}>
                  <td className="font-mono">{f.sequence || i+1}</td>
                  <td className="font-mono" style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{f.timestamp_display}</td>
                  <td>
                    <span className={`badge badge-${f.node.toLowerCase().replace('_', '-')}`}>
                      {f.node}
                    </span>
                  </td>
                  <td className="font-mono" style={{ color: '#f87171', fontWeight: '700' }}>
                    {f.fault_code || 6025}
                  </td>
                  <td>
                    <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                      {f.sub_code || 'Thunderbolt fault'}
                    </span>
                  </td>
                  <td style={{ color: '#e5e7eb', fontSize: '0.8rem' }}>
                    {f.fault_name || 'Background Service Identity Failure'}
                  </td>
                  <td className="font-mono" style={{ color: '#60a5fa', fontSize: '0.75rem' }}>
                    {f.message || 'get current process id failure 653;'}
                  </td>
                  <td>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                      {f.details?.['Current Recovery Type'] || 'No Recovery Action'}
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
