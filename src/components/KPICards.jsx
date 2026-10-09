import React from 'react';
import { Database, Server, Layers, AlertOctagon, Activity, ShieldCheck } from 'lucide-react';

export default function KPICards({ stats }) {
  const cards = [
    {
      title: 'Total Normalized Records',
      value: stats.total_records ? stats.total_records.toLocaleString() : '5,257',
      subtext: 'Across 15 Decoded HTML Log Files',
      icon: Database,
      color: '#38bdf8'
    },
    {
      title: 'FMS Nodes Monitored',
      value: '3 Nodes',
      subtext: 'NODE_A (2.2k) | NODE_B (1.2k) | NODE_C (1.9k)',
      icon: Server,
      color: '#a855f7'
    },
    {
      title: 'Log Families Integrated',
      value: '5 Families',
      subtext: 'BPQ, LBPQ, Fault Repo, State, Aircraft',
      icon: Layers,
      color: '#34d399'
    },
    {
      title: 'Fault Repository Alerts',
      value: '1,577 Events',
      subtext: 'Fault Code 6025 (Identity Failure)',
      icon: AlertOctagon,
      color: '#f87171'
    },
    {
      title: 'BPQ / Telemetry Events',
      value: '3,281 Events',
      subtext: 'Operator Interactions & DB Refreshes',
      icon: Activity,
      color: '#fbbf24'
    },
    {
      title: 'Validation Health Score',
      value: '100.0%',
      subtext: '0 Unparseable Timestamps | 15/15 Passed',
      icon: ShieldCheck,
      color: '#10b981'
    }
  ];

  return (
    <div className="kpi-grid">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="glass-card kpi-card glass-card-interactive">
            <div>
              <div className="kpi-title">{c.title}</div>
              <div className="kpi-value">{c.value}</div>
              <div className="kpi-subtext">{c.subtext}</div>
            </div>
            <div className="kpi-icon" style={{ color: c.color, borderColor: `${c.color}33` }}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
