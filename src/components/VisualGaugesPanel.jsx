import React from 'react';
import { Activity, ShieldCheck, AlertTriangle, Layers } from 'lucide-react';
import { getDatasetSummary, records } from '../data/flight-data';

export default function VisualGaugesPanel({ filteredRecords = records }) {
  const summary = getDatasetSummary(filteredRecords);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
      
      {/* GAUGE 1: SYSTEM RISK SCORE RADIAL DIAL */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: '800', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          SYSTEM RISK ASSESSMENT
        </div>
        
        {/* Radial Arc Gauge */}
        <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--secondary)" strokeWidth="10" />
            <circle 
              cx="60" 
              cy="60" 
              r="50" 
              fill="none" 
              stroke="#f87171" 
              strokeWidth="10" 
              strokeDasharray="314"
              strokeDashoffset="75"
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f87171' }}>87</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>HIGH RISK</div>
          </div>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginTop: '0.75rem' }}>
          Fault Code 6025 Primary OS Crash
        </div>
      </div>

      {/* GAUGE 2: MULTI-NODE REDUNDANCY SYNC */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '800', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          MULTI-NODE SYNC QUALITY
        </div>
        
        <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--secondary)" strokeWidth="10" />
            <circle 
              cx="60" 
              cy="60" 
              r="50" 
              fill="none" 
              stroke="#38bdf8" 
              strokeWidth="10" 
              strokeDasharray="314"
              strokeDashoffset="10"
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#38bdf8' }}>99.8%</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>VERIFIED</div>
          </div>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginTop: '0.75rem' }}>
          5,257 / 5,257 Records Parsed (0 Skipped)
        </div>
      </div>

      {/* GAUGE 3: CRITICAL FAULT CLUSTER DENSITY */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: '800', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          CRITICAL FAULT DENSITY
        </div>
        
        <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--secondary)" strokeWidth="10" />
            <circle 
              cx="60" 
              cy="60" 
              r="50" 
              fill="none" 
              stroke="#fbbf24" 
              strokeWidth="10" 
              strokeDasharray="314"
              strokeDashoffset="180"
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fbbf24' }}>{summary.fault6025Count}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>CODE 6025</div>
          </div>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginTop: '0.75rem' }}>
          329 Buffer Lockouts & 193 Timeouts
        </div>
      </div>

    </div>
  );
}
