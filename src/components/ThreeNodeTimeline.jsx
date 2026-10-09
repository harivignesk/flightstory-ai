import React, { useState, useMemo } from 'react';
import { 
  Clock, ZoomIn, ZoomOut, RotateCcw, Filter, AlertTriangle, 
  Info, ChevronRight, Layers, Eye, ShieldCheck, CheckCircle2, ChevronDown
} from 'lucide-react';
import { 
  records as allRecords, 
  nodes, 
  logFamilyCategories, 
  familyColors, 
  timeValue, 
  startTime, 
  endTime
} from '../data/flight-data';

export default function ThreeNodeTimeline({ records = allRecords, onSelectEvent, selectedEventId }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [timeRange, setTimeRange] = useState([startTime, endTime]);
  const [selectedFamily, setSelectedFamily] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [hoveredRecord, setHoveredRecord] = useState(null);
  const [expandedClusterTime, setExpandedClusterTime] = useState(null);

  // Categories list
  const categories = ['Aircraft State', 'Fault History', 'Operator Interaction', 'Software Events', 'State Transition'];

  // Filter records by active timeline controls
  const filteredTimelineRecords = useMemo(() => {
    return records.filter(r => {
      const tv = timeValue(r.timestamp);
      if (tv < timeRange[0] || tv > timeRange[1]) return false;
      if (selectedSeverity !== 'ALL' && r.severity !== selectedSeverity) return false;

      const cat = logFamilyCategories[r.log_family] || r.log_family;
      if (selectedFamily !== 'ALL' && cat !== selectedFamily) return false;

      return true;
    });
  }, [records, timeRange, selectedSeverity, selectedFamily]);

  // Group records by Node and Timestamp bucket for clustering / overlapping timestamps
  const nodeLanes = useMemo(() => {
    const lanes = {
      NODE_A: [],
      NODE_B: [],
      NODE_C: []
    };

    const buckets = {
      NODE_A: {},
      NODE_B: {},
      NODE_C: {}
    };

    filteredTimelineRecords.forEach(r => {
      const displayTime = r.timestamp_display || r.timestamp.slice(11, 19);
      // Group events sharing the same 5-second window
      const tv = timeValue(r.timestamp);
      const bucketKey = `${Math.floor(tv / 5000) * 5000}_${displayTime}`;

      if (!buckets[r.node]) buckets[r.node] = {};
      if (!buckets[r.node][bucketKey]) buckets[r.node][bucketKey] = [];
      buckets[r.node][bucketKey].push(r);
    });

    nodes.forEach(nodeId => {
      lanes[nodeId] = Object.entries(buckets[nodeId] || {}).map(([key, itemRecords]) => {
        const displayTime = key.split('_')[1];
        return {
          timeBucket: key,
          displayTime,
          records: itemRecords
        };
      }).sort((a, b) => a.timeBucket.localeCompare(b.timeBucket));
    });

    return lanes;
  }, [filteredTimelineRecords]);

  // Timeline time range calculations
  const duration = timeRange[1] - timeRange[0] || 1;

  const getXRatio = (timestampStr) => {
    const tv = timeValue(timestampStr);
    return Math.max(0, Math.min(1, (tv - timeRange[0]) / duration));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Controls & Legend Banner */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--card-foreground)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Clock style={{ color: 'var(--info)' }} size={22} />
              Three-Node Synchronized Incident Timeline
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', marginTop: '0.2rem' }}>
              Multi-node event sequence across <strong>NODE_A</strong>, <strong>NODE_B</strong>, and <strong>NODE_C</strong> mapped across 5 log families.
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setZoomLevel(z => Math.min(2.5, z + 0.25))} 
              className="nav-item" 
              style={{ width: 'auto', padding: '0.45rem' }} 
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
            <button 
              onClick={() => setZoomLevel(z => Math.max(0.6, z - 0.25))} 
              className="nav-item" 
              style={{ width: 'auto', padding: '0.45rem' }} 
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            <button 
              onClick={() => { setZoomLevel(1); setTimeRange([startTime, endTime]); setSelectedFamily('ALL'); setSelectedSeverity('ALL'); }} 
              className="nav-item" 
              style={{ width: 'auto', padding: '0.45rem 0.85rem' }}
            >
              <RotateCcw size={15} /> Reset View
            </button>

            {/* Severity Filter */}
            <select 
              value={selectedSeverity} 
              onChange={e => setSelectedSeverity(e.target.value)}
              style={{ padding: '0.45rem 0.65rem', borderRadius: '4px', background: 'var(--secondary)', color: 'var(--card-foreground)', border: '1px solid var(--border)', fontSize: '0.8rem' }}
            >
              <option value="ALL">All Severities</option>
              <option value="INFO">INFO Only</option>
              <option value="WARNING">WARNING Only</option>
              <option value="CRITICAL">CRITICAL Only</option>
            </select>

            {/* Log Family Filter */}
            <select 
              value={selectedFamily} 
              onChange={e => setSelectedFamily(e.target.value)}
              style={{ padding: '0.45rem 0.65rem', borderRadius: '4px', background: 'var(--secondary)', color: 'var(--card-foreground)', border: '1px solid var(--border)', fontSize: '0.8rem' }}
            >
              <option value="ALL">All 5 Log Families</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 5 Log Family Color Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '0.85rem', fontSize: '0.78rem' }}>
          <span style={{ color: 'var(--muted-foreground)', fontWeight: '600' }}>Log Family Legend:</span>
          {categories.map(cat => (
            <span 
              key={cat} 
              onClick={() => setSelectedFamily(selectedFamily === cat ? 'ALL' : cat)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                cursor: 'pointer',
                opacity: selectedFamily === 'ALL' || selectedFamily === cat ? 1 : 0.4,
                fontWeight: selectedFamily === cat ? '700' : '400'
              }}
            >
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: familyColors[cat] || '#38bdf8' }} />
              {cat}
            </span>
          ))}
          <span style={{ marginLeft: 'auto', color: 'var(--muted-foreground)', fontFamily: 'IBM Plex Mono', fontSize: '0.75rem' }}>
            Showing {filteredTimelineRecords.length.toLocaleString()} of {records.length.toLocaleString()} events
          </span>
        </div>
      </div>

      {/* Clock Synchronization Disclaimer (Requirement J) */}
      <div style={{ background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.3)', borderRadius: '6px', padding: '0.65rem 1rem', fontSize: '0.78rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <AlertTriangle size={16} style={{ flexShrink: 0 }} />
        <span>
          <strong>Hardware Clock Disclaimer:</strong> Node clocks operate across independent hardware clock domains. Microsecond timestamp alignment reflects recorded event sequence; cross-node temporal proximity indicates potential temporal association, not absolute proof of causation.
        </span>
      </div>

      {/* Timeline Viewport Container */}
      <div style={{ background: 'var(--scene)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem', overflowX: 'auto', position: 'relative' }}>
        
        {/* Horizontal Time Axis Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '140px', paddingRight: '20px', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', fontFamily: 'IBM Plex Mono', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
          <span>09:00:00 AM</span>
          <span>10:00:00 AM</span>
          <span>11:00:00 AM</span>
          <span>12:00:00 PM</span>
          <span>13:00:00 PM</span>
          <span>14:00:09 PM</span>
        </div>

        {/* 3 Horizontal Swimlanes (NODE_A, NODE_B, NODE_C) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
          {nodes.map(nodeId => {
            const laneBuckets = nodeLanes[nodeId] || [];

            return (
              <div key={nodeId} style={{ display: 'flex', alignItems: 'center', minHeight: '90px', borderBottom: '1px dashed var(--border)', paddingBottom: '1rem', position: 'relative' }}>
                
                {/* Swimlane Node Label */}
                <div style={{ width: '130px', flexShrink: 0, paddingRight: '1rem' }}>
                  <span className={`node-tag ${nodeId.toLowerCase()}`} style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                    {nodeId}
                  </span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                    {nodeId === 'NODE_A' ? 'Primary Master' : nodeId === 'NODE_B' ? 'Secondary Standby' : 'Auxiliary Spare'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--muted-foreground)', fontFamily: 'IBM Plex Mono', marginTop: '0.15rem' }}>
                    {laneBuckets.reduce((acc, b) => acc + b.records.length, 0)} events
                  </div>
                </div>

                {/* Swimlane Event Stream Track */}
                <div style={{ flex: 1, height: '60px', position: 'relative', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                  
                  {laneBuckets.map(bucket => {
                    const firstRec = bucket.records[0];
                    const xRatio = getXRatio(firstRec.timestamp);
                    const leftPct = `${xRatio * 100}%`;
                    const hasCluster = bucket.records.length > 1;
                    const isMainFault = bucket.records.some(r => r.fault_code === 6025);
                    const isSelected = bucket.records.some(r => r.id === selectedEventId);

                    const cat = logFamilyCategories[firstRec.log_family] || firstRec.log_family;
                    const markerColor = isMainFault ? '#f87171' : (familyColors[cat] || '#38bdf8');

                    return (
                      <div
                        key={bucket.timeBucket}
                        onClick={() => {
                          if (hasCluster) {
                            setExpandedClusterTime(expandedClusterTime === bucket.timeBucket ? null : bucket.timeBucket);
                          } else {
                            onSelectEvent(firstRec);
                          }
                        }}
                        onMouseEnter={() => setHoveredRecord(firstRec)}
                        onMouseLeave={() => setHoveredRecord(null)}
                        style={{
                          position: 'absolute',
                          left: leftPct,
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          cursor: 'pointer',
                          zIndex: isMainFault || isSelected ? 5 : 2
                        }}
                      >
                        {/* Event Marker */}
                        <div style={{
                          width: hasCluster ? '22px' : '14px',
                          height: hasCluster ? '22px' : '14px',
                          borderRadius: '50%',
                          background: markerColor,
                          border: isSelected ? '3px solid #ffffff' : '1.5px solid #ffffff',
                          boxShadow: isMainFault ? '0 0 15px #f87171' : (isSelected ? '0 0 12px #38bdf8' : 'none'),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--card-foreground)',
                          fontSize: '0.65rem',
                          fontWeight: '800'
                        }}>
                          {hasCluster ? bucket.records.length : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hover Tooltip (Requirement E) */}
        {hoveredRecord && (
          <div style={{
            position: 'fixed',
            bottom: '25px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: 'var(--card)',
            border: '1px solid var(--info)',
            padding: '0.85rem 1.1rem',
            borderRadius: '6px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.9)',
            fontSize: '0.8rem',
            color: 'var(--card-foreground)',
            pointerEvents: 'none',
            maxWidth: '520px',
            width: '100%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span className={`node-tag ${hoveredRecord.node.toLowerCase()}`}>{hoveredRecord.node}</span>
              <span className="font-mono" style={{ color: 'var(--info)', fontSize: '0.75rem' }}>
                {hoveredRecord.timestamp_display || hoveredRecord.timestamp}
              </span>
              <span className={`severity ${hoveredRecord.severity.toLowerCase()}`}>
                <i />{hoveredRecord.severity}
              </span>
            </div>

            <div style={{ fontWeight: '700', fontSize: '0.9rem', margin: '0.2rem 0' }}>
              {hoveredRecord.fault_name || hoveredRecord.log_family}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', display: 'flex', gap: '0.8rem' }}>
              <span>Category: <strong>{logFamilyCategories[hoveredRecord.log_family] || 'Software'}</strong></span>
              {hoveredRecord.fault_code && <span>Fault Code: <strong>{hoveredRecord.fault_code}</strong></span>}
            </div>

            <div style={{ fontSize: '0.78rem', color: '#e5e7eb', marginTop: '0.35rem', fontStyle: 'italic' }}>
              "{hoveredRecord.message}"
            </div>
          </div>
        )}

      </div>

      {/* Cluster Expander Drawer for Overlapping Timestamps (Requirement H) */}
      {expandedClusterTime && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--info)', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--card-foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={16} style={{ color: 'var(--info)' }} />
              Cluster Expansion: Preserved Simultaneous Events
            </h4>
            <button onClick={() => setExpandedClusterTime(null)} className="nav-item" style={{ width: 'auto', padding: '0.25rem 0.65rem' }}>
              Close Cluster
            </button>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginBottom: '0.75rem' }}>
            No events were silently discarded. Below are all underlying records sharing this timestamp window:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
            {records.filter(r => `${Math.floor(timeValue(r.timestamp) / 5000) * 5000}_${r.timestamp_display || r.timestamp.slice(11, 19)}` === expandedClusterTime).map(rec => (
              <div 
                key={rec.id} 
                onClick={() => onSelectEvent(rec)}
                style={{ background: 'var(--secondary)', padding: '0.65rem 0.85rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div>
                  <span className={`node-tag ${rec.node.toLowerCase()}`} style={{ marginRight: '0.5rem' }}>{rec.node}</span>
                  <span style={{ fontWeight: '600', color: 'var(--card-foreground)', fontSize: '0.8rem' }}>Event #{rec.id}: {rec.fault_name || rec.log_family}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{rec.message}</div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--info)' }} />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
