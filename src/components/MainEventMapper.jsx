import React, { useState, useEffect } from 'react';
import { 
  Target, 
  AlertTriangle, 
  ArrowRight, 
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
  ChevronRight,
  GitMerge,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Settings,
  Truck,
  Wrench,
  CheckSquare,
  Boxes
} from 'lucide-react';

export default function MainEventMapper({ rootCauseData, records }) {
  const [activeStation, setActiveStation] = useState(1);
  const [isConveyorRunning, setIsConveyorRunning] = useState(true);

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

  const assemblyStations = [
    {
      id: 1,
      stationCode: 'STATION 01',
      stationName: 'Raw Event Components Intake',
      analogy: 'Raw Component Ingestion (Nav DB Sync)',
      node: 'NODE_C',
      time: '09:00:31 AM',
      status: 'NOMINAL',
      statusColor: '#34d399',
      partDetails: 'Parts Ingested: 104 NavDB Sync Commands',
      description: 'Scheduled Navigation Database sync initiated on auxiliary Line Node C. Process ID 653 allocated.',
      conveyorState: 'Parts moving normally on conveyor belt'
    },
    {
      id: 2,
      stationCode: 'STATION 02',
      stationName: 'Sub-Assembly Error Staging',
      analogy: 'Component Jamming (Telemetry Lockout)',
      node: 'NODE_C',
      time: '09:12:15 AM',
      status: 'JAMMED / WARNING',
      statusColor: '#fbbf24',
      partDetails: 'Sub-Assembly Bottleneck: 329 Buffer Lockouts',
      description: '329 telemetry buffer lockouts preventing queue writes. Assembly queue access blocked.',
      conveyorState: 'Conveyor belt speed reduced due to buffer queue backlog'
    },
    {
      id: 3,
      stationCode: 'STATION 03',
      stationName: 'Main Engine Line Failure',
      analogy: 'Engine Assembly Crash (Fault 6025)',
      node: 'NODE_C',
      time: '09:09:54 AM',
      status: 'CRITICAL CRASH',
      statusColor: '#f87171',
      partDetails: 'Main Fault: OS Error Code 653 (PID Fail)',
      description: 'OS process ID lookup crashed. Identity authentication revoked on primary assembly unit.',
      conveyorState: 'STATION HALTED: Emergency Line Stop triggered on Line C',
      isMainFault: true
    },
    {
      id: 4,
      stationCode: 'STATION 04',
      stationName: 'Quality Control & Failover Rollout',
      analogy: 'Final QC Pass & Master Node Failover',
      node: 'NODE_A',
      time: '09:42:50 AM',
      status: 'RECOVERED / QC PASS',
      statusColor: '#38bdf8',
      partDetails: 'Master Node A Failover Restored (Fault 6035)',
      description: 'Node A master assembly controller re-establishes dual-mode consensus across all nodes.',
      conveyorState: 'Assembly Line Restored: 100% Quality Inspection Passed'
    }
  ];

  // Auto-play assembly line conveyor belt timer
  useEffect(() => {
    if (!isConveyorRunning) return;
    const interval = setInterval(() => {
      setActiveStation(prev => (prev >= 4 ? 1 : prev + 1));
    }, 2500);
    return () => clearInterval(interval);
  }, [isConveyorRunning]);

  const currentStationObj = assemblyStations.find(s => s.id === activeStation) || assemblyStations[0];
  const topFaults = rootCauseData?.fault_frequency_top || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="tiny-badge info" style={{ fontWeight: '800' }}>MANUFACTURING PIPELINE METAPHOR</span>
              <span className="tiny-badge success">4 ASSEMBLY STATIONS</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--card-foreground)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Boxes style={{ color: '#38bdf8' }} size={24} />
              Automotive Assembly Line Incident Propagation Flow
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
              Maps log event propagation as an automotive assembly line conveyor belt tracking raw parts intake to final quality control.
            </p>
          </div>

          {/* Conveyor Line Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={() => setIsConveyorRunning(!isConveyorRunning)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                background: isConveyorRunning ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                color: isConveyorRunning ? '#f87171' : '#38bdf8',
                border: isConveyorRunning ? '1px solid #f87171' : '1px solid #38bdf8',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              {isConveyorRunning ? <Pause size={15} /> : <Play size={15} />}
              {isConveyorRunning ? 'Pause Assembly Line' : 'Start Assembly Line'}
            </button>

            <button
              onClick={() => { setActiveStation(1); setIsConveyorRunning(false); }}
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
              <RotateCcw size={14} /> Reset Conveyor
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE ASSEMBLY STATION SPOTLIGHT MONITOR */}
      <div className="glass-card" style={{ 
        padding: '1.5rem', 
        background: currentStationObj.isMainFault 
          ? 'linear-gradient(135deg, rgba(248, 113, 113, 0.2) 0%, rgba(17, 24, 39, 0.98) 100%)' 
          : 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(17, 24, 39, 0.98) 100%)', 
        border: currentStationObj.isMainFault ? '2px solid #f87171' : '1px solid #38bdf8',
        borderRadius: '12px',
        boxShadow: currentStationObj.isMainFault ? '0 0 30px rgba(248, 113, 113, 0.3)' : '0 0 25px rgba(56, 189, 248, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className="tiny-badge" style={{ background: currentStationObj.statusColor, color: '#fff', fontWeight: '800' }}>
                {currentStationObj.stationCode}: {currentStationObj.status}
              </span>
              <span className="node-tag node_c">{currentStationObj.node}</span>
              <span className="mono" style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: '700' }}>
                <Clock size={13} style={{ display: 'inline', marginRight: '3px' }} /> {currentStationObj.time}
              </span>
            </div>

            <h2 style={{ fontSize: '1.4rem', color: 'var(--card-foreground)', fontWeight: '800', margin: '0.3rem 0' }}>
              {currentStationObj.stationName}
            </h2>

            <div style={{ fontSize: '0.9rem', color: '#cbd5e1', maxWidth: '850px', lineHeight: '1.5', marginTop: '0.35rem' }}>
              <strong>Assembly Metaphor:</strong> {currentStationObj.analogy}
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--muted-foreground)', marginTop: '0.35rem', lineHeight: '1.5' }}>
              {currentStationObj.description}
            </p>

            <div style={{ marginTop: '0.85rem', background: 'var(--secondary)', border: '1px solid var(--border)', padding: '0.65rem 0.9rem', borderRadius: '6px', fontSize: '0.78rem', color: '#38bdf8', fontWeight: '600' }}>
              🚚 Conveyor Belt Track: {currentStationObj.conveyorState}
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border)', padding: '1rem 1.25rem', borderRadius: '8px', minWidth: '220px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>PARTS & LOG INSPECTION</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--card-foreground)', fontWeight: '700', marginTop: '0.3rem' }}>
              {currentStationObj.partDetails}
            </div>
          </div>
        </div>
      </div>

      {/* CAR MANUFACTURING ASSEMBLY LINE PIPELINE CONVEYOR BELT */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AUTOMOTIVE MANUFACTURING ASSEMBLY TRACK
            </div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--card-foreground)', fontWeight: '800', marginTop: '0.15rem' }}>
              Assembly Stations 01 to 04 Pipeline Flow
            </h3>
          </div>
          <span className="tiny-badge success">LINE ACTIVE ({activeStation}/4)</span>
        </div>

        {/* Assembly Line Stations Grid with Connecting Conveyor Track */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', position: 'relative' }}>
          {assemblyStations.map((stn, idx) => {
            const isActive = activeStation === stn.id;
            return (
              <div 
                key={stn.id}
                onClick={() => { setActiveStation(stn.id); setIsConveyorRunning(false); }}
                style={{ 
                  background: isActive 
                    ? stn.isMainFault ? 'rgba(248, 113, 113, 0.18)' : 'rgba(56, 189, 248, 0.18)' 
                    : 'var(--secondary)', 
                  border: isActive 
                    ? stn.isMainFault ? '2px solid #f87171' : '2px solid #38bdf8' 
                    : '1px solid var(--border)', 
                  borderRadius: '10px', 
                  padding: '1.1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? stn.isMainFault ? '0 0 25px rgba(248, 113, 113, 0.35)' : '0 0 25px rgba(56, 189, 248, 0.35)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ 
                    width: '26px', 
                    height: '26px', 
                    borderRadius: '50%', 
                    background: stn.statusColor, 
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '0.75rem'
                  }}>
                    0{stn.id}
                  </span>
                  <span className="mono" style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '700' }}>{stn.time}</span>
                </div>

                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: stn.statusColor, fontWeight: '800' }}>
                  {stn.stationCode}
                </div>

                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--card-foreground)', margin: '0.2rem 0', lineHeight: '1.3' }}>
                  {stn.stationName}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                  {stn.analogy}
                </div>

                <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={`node-tag ${stn.node.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>{stn.node}</span>
                  <ChevronRight size={16} style={{ color: isActive ? '#38bdf8' : 'var(--muted-foreground)' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CASCADING FAULTS METRICS TABLE */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', color: 'var(--card-foreground)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle className="w-4 h-4 text-rose-400" /> Manufacturing Line Fault Frequency Breakdown
        </h4>

        <div className="table-scroll">
          <table className="event-table compact">
            <thead>
              <tr>
                <th>FAULT CODE</th>
                <th>ASSEMBLY COMPONENT DESCRIPTION</th>
                <th>AFFECTED RECORDS</th>
                <th>IMPACT LEVEL</th>
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

