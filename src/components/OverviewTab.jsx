import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { Server, Layers, AlertTriangle, Clock } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function OverviewTab({ stats, records }) {
  // Node breakdown doughnut data
  const nodeData = {
    labels: ['NODE_A (2,199)', 'NODE_B (1,177)', 'NODE_C (1,881)'],
    datasets: [
      {
        data: [2199, 1177, 1881],
        backgroundColor: ['#38bdf8', '#a855f7', '#34d399'],
        borderColor: '#0f172a',
        borderWidth: 3,
      }
    ]
  };

  // Family breakdown bar chart data
  const familyData = {
    labels: [
      'FM CI BPQ',
      'Fault Repo',
      'FM LBPQ',
      'State Trans',
      'Aircraft State'
    ],
    datasets: [
      {
        label: 'Record Count',
        data: [1919, 1577, 1362, 348, 51],
        backgroundColor: [
          'rgba(56, 189, 248, 0.8)',
          'rgba(248, 113, 113, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(52, 211, 153, 0.8)'
        ],
        borderRadius: 8
      }
    ]
  };

  // Severity Distribution
  const severityData = {
    labels: ['INFO (Telemetry / BPQ)', 'CRITICAL (Faults / Failures)', 'WARNING (State Changes)'],
    datasets: [
      {
        data: [3281, 1577, 399],
        backgroundColor: ['#60a5fa', '#f87171', '#fbbf24'],
        borderColor: '#0f172a',
        borderWidth: 2
      }
    ]
  };

  // Chart options
  const darkOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: '#9ca3af', font: { family: 'Inter' } }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } }
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem' }}>
      {/* Node Distribution */}
      <div className="glass-card" style={{ gridColumn: 'span 4', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--card-foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server className="w-5 h-5 text-cyan-400" /> Multi-Node Load Distribution
          </h3>
          <span className="badge badge-info">3 Nodes</span>
        </div>
        <div style={{ height: '240px', position: 'relative' }}>
          <Doughnut data={nodeData} options={{ maintainAspectRatio: false, plugins: darkOptions.plugins }} />
        </div>
        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center' }}>
          Node A carries 41.8% of records, Node C 35.8%, Node B 22.4%
        </div>
      </div>

      {/* Log Family Distribution */}
      <div className="glass-card" style={{ gridColumn: 'span 8', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--card-foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers className="w-5 h-5 text-indigo-400" /> Log Records by Family Architecture
          </h3>
          <span className="badge badge-node-a">5 Log Families</span>
        </div>
        <div style={{ height: '240px' }}>
          <Bar data={familyData} options={{ ...darkOptions, maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Severity Split */}
      <div className="glass-card" style={{ gridColumn: 'span 4', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--card-foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle className="w-5 h-5 text-rose-400" /> Event Severity Breakdown
          </h3>
          <span className="badge badge-critical">1,577 Critical</span>
        </div>
        <div style={{ height: '240px', position: 'relative' }}>
          <Doughnut data={severityData} options={{ maintainAspectRatio: false, plugins: darkOptions.plugins }} />
        </div>
      </div>

      {/* System Summary Card */}
      <div className="glass-card" style={{ gridColumn: 'span 8', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--card-foreground)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock className="w-5 h-5 text-emerald-400" /> FMS Execution Timeline Analysis (June 18, 2032)
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: '1.6' }}>
            The analyzed dataset covers flight management computer logs recorded on <strong>June 18, 2032</strong> between 09:00:00 AM and 01:05:18 PM. Cross-node telemetry indicates active Operator Interaction events (CI BPQ), redundant Master/Standby node state negotiations (LBPQ & State Transitions), and recurring background identity service failures (Fault Code 6025).
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1rem', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '10px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Start Timestamp</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>2032-06-18 09:00:00</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>End Timestamp</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#34d399', fontFamily: 'JetBrains Mono' }}>2032-06-18 13:05:18</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>Duration Span</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#a855f7', fontFamily: 'JetBrains Mono' }}>4 Hours 5 Minutes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
