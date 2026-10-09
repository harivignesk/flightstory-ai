import React, { useState, useEffect, useRef } from 'react';
import { Plane, Navigation, ShieldAlert, Clock, MapPin, Eye, Zap, Layers, RefreshCw } from 'lucide-react';
import { records as allRecords } from '../data/flight-data';

export default function FlightRouteMap({ onSelectRecord }) {
  const [activeWaypoint, setActiveWaypoint] = useState(2);
  const [isFlying, setIsFlying] = useState(true);
  const [planeProgress, setPlaneProgress] = useState(45);

  const waypoints = [
    { id: 1, code: 'KORD', name: 'Chicago O\'Hare Intl', altitude: '1,200 ft', time: '09:00:00 AM', status: 'Takeoff Complete', lat: '41.9742° N', lon: '87.9073° W', nodeStatus: 'NODE_A Master Nominal' },
    { id: 2, code: 'WAYPT_ALPHA', name: 'Waypoint Alpha (Cruise Climb)', altitude: '24,000 ft', time: '09:05:12 AM', status: 'Climb Phase', lat: '41.4925° N', lon: '84.8210° W', nodeStatus: 'NODE_B Standby Active' },
    { id: 3, code: 'WAYPT_BRAVO', name: 'Waypoint Bravo (CRITICAL FAULT)', altitude: '35,000 ft', time: '09:09:54 AM', status: 'CRITICAL: Fault 6025 Logged', lat: '41.2506° N', lon: '82.1143° W', isFault: true, nodeStatus: 'NODE_C Identity Fail (Error 653)' },
    { id: 4, code: 'WAYPT_CHARLIE', name: 'Waypoint Charlie (Consensus Restored)', altitude: '35,000 ft', time: '09:42:50 AM', status: 'Node A Consensus Ack', lat: '41.1022° N', lon: '78.9100° W', nodeStatus: 'NODE_A Failover Recovery' },
    { id: 5, code: 'KJFK', name: 'New York JFK Intl', altitude: '800 ft', time: '14:00:09 PM', status: 'Landing Approach Complete', lat: '40.6413° N', lon: '73.7781° W', nodeStatus: 'All 3 Nodes Resynced' }
  ];

  // Auto-animate flight position marker along the trajectory
  useEffect(() => {
    if (!isFlying) return;
    const interval = setInterval(() => {
      setPlaneProgress(prev => (prev >= 100 ? 0 : prev + 1));
    }, 150);
    return () => clearInterval(interval);
  }, [isFlying]);

  const activeWpObj = waypoints[activeWaypoint] || waypoints[2];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Banner */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="tiny-badge info" style={{ fontWeight: '800' }}>SPATIAL AVIONICS MAP</span>
              <span className="tiny-badge critical">CRITICAL FAULT PINNED</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--card-foreground)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Navigation style={{ color: '#38bdf8' }} size={24} />
              3D Avionics Flight Route & Spatial Fault Trajectory Map
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
              Maps recorded FMS log events directly onto the flight path trajectory with altitude profile and waypoint fault coordinates.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={() => setIsFlying(!isFlying)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                background: isFlying ? 'rgba(56, 189, 248, 0.15)' : 'var(--secondary)',
                color: isFlying ? '#38bdf8' : 'var(--muted-foreground)',
                border: isFlying ? '1px solid #38bdf8' : '1px solid var(--border)',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <Plane size={15} className={isFlying ? 'animate-pulse' : ''} />
              {isFlying ? 'Pause Plane Motion' : 'Fly Flight Path'}
            </button>
          </div>
        </div>
      </div>

      {/* 3D AVIONICS FLIGHT TRAJECTORY CANVAS CARD */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(7, 11, 20, 0.98) 0%, rgba(17, 24, 39, 0.98) 100%)', 
        border: '2px solid #38bdf8', 
        borderRadius: '12px', 
        padding: '1.5rem',
        boxShadow: '0 0 35px rgba(56, 189, 248, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Avionics Grid Lines */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }} />

        {/* Flight Telemetry HUD Overlay */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontFamily: 'JetBrains Mono', fontWeight: '800' }}>
              FLIGHT NO: HYW-3032
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', fontFamily: 'JetBrains Mono' }}>
              ROUTE: KORD ➔ WAYPT_ALPHA ➔ WAYPT_BRAVO ➔ WAYPT_CHARLIE ➔ KJFK
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', fontFamily: 'JetBrains Mono' }}>
            <span style={{ color: '#34d399', fontWeight: '700' }}>ALTITUDE: 35,000 FT</span>
            <span style={{ color: '#38bdf8', fontWeight: '700' }}>AIRSPEED: 460 KTS</span>
          </div>
        </div>

        {/* Visual Spatial Flight Path Canvas Graphic */}
        <div style={{ position: 'relative', height: '220px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
          
          {/* Curved SVG Flight Path Line */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
            <path 
              d="M 50 180 Q 250 40 480 30 T 900 160" 
              fill="none" 
              stroke="#38bdf8" 
              strokeWidth="3" 
              strokeDasharray="6 4"
            />
            {/* Animated Pulse Beam along flight path */}
            <path 
              d="M 50 180 Q 250 40 480 30 T 900 160" 
              fill="none" 
              stroke="#34d399" 
              strokeWidth="4" 
              strokeDasharray="20 180"
              strokeDashoffset={-planeProgress * 3}
            />
          </svg>

          {/* Animated 3D Airplane Icon moving along progress */}
          <div style={{
            position: 'absolute',
            left: `${planeProgress}%`,
            top: planeProgress < 30 ? `${180 - planeProgress * 4.5}px` : planeProgress < 70 ? '30px' : `${30 + (planeProgress - 70) * 4.3}px`,
            transform: 'translate(-50%, -50%) rotate(12deg)',
            transition: 'all 0.15s linear',
            zIndex: 10
          }}>
            <div style={{
              background: '#38bdf8',
              color: '#070b14',
              padding: '0.45rem',
              borderRadius: '50%',
              boxShadow: '0 0 20px #38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Plane size={20} />
            </div>
          </div>

          {/* Waypoint Markers along the spatial trajectory */}
          {waypoints.map((wp, idx) => {
            const isSelected = activeWaypoint === idx;
            return (
              <div 
                key={wp.id}
                onClick={() => setActiveWaypoint(idx)}
                style={{
                  zIndex: 5,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Marker Pin */}
                <div style={{
                  width: wp.isFault ? '36px' : '28px',
                  height: wp.isFault ? '36px' : '28px',
                  borderRadius: '50%',
                  background: wp.isFault ? '#ef4444' : isSelected ? '#38bdf8' : 'var(--secondary)',
                  border: wp.isFault ? '3px solid #f87171' : isSelected ? '3px solid #38bdf8' : '2px solid var(--border)',
                  color: wp.isFault ? '#fff' : isSelected ? '#070b14' : '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: wp.isFault ? '0 0 25px rgba(239, 68, 68, 0.8)' : isSelected ? '0 0 20px rgba(56, 189, 248, 0.6)' : 'none',
                  fontWeight: '800',
                  fontSize: '0.75rem'
                }}>
                  {wp.isFault ? <ShieldAlert size={18} className="animate-pulse" /> : wp.code.slice(0, 3)}
                </div>

                {/* Waypoint Label Box */}
                <div style={{
                  background: isSelected ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.75)',
                  border: wp.isFault ? '1px solid #f87171' : isSelected ? '1px solid #38bdf8' : '1px solid var(--border)',
                  padding: '0.4rem 0.65rem',
                  borderRadius: '6px',
                  marginTop: '0.5rem',
                  textAlign: 'center',
                  minWidth: '110px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: wp.isFault ? '#f87171' : 'var(--card-foreground)' }}>
                    {wp.code}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>
                    {wp.altitude}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Waypoint Telemetry Spotlight Panel */}
        <div style={{ marginTop: '1.25rem', background: 'rgba(15, 23, 42, 0.9)', border: activeWpObj.isFault ? '2px solid #f87171' : '1px solid #38bdf8', borderRadius: '10px', padding: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="tiny-badge" style={{ background: activeWpObj.isFault ? '#f87171' : '#38bdf8', color: '#fff', fontWeight: '800' }}>
                WAYPOINT SPOTLIGHT: {activeWpObj.code}
              </span>
              <span className="mono" style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '700' }}>
                <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} /> {activeWpObj.time}
              </span>
              <span className="tiny-badge info">{activeWpObj.lat} · {activeWpObj.lon}</span>
            </div>

            <h3 style={{ fontSize: '1.2rem', color: 'var(--card-foreground)', fontWeight: '800', margin: '0.35rem 0' }}>
              {activeWpObj.name} ({activeWpObj.altitude})
            </h3>

            <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)' }}>
              <strong>FMS Operational Status:</strong> {activeWpObj.status} | <strong>Active Redundancy:</strong> {activeWpObj.nodeStatus}
            </p>
          </div>

          {activeWpObj.isFault && (
            <button
              onClick={() => {
                const f = allRecords.find(r => r.fault_code === 6025);
                if (f && onSelectRecord) onSelectRecord(f);
              }}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#fff',
                border: 'none',
                padding: '0.6rem 1.1rem',
                borderRadius: '6px',
                fontWeight: '800',
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Zap size={15} /> Inspect Fault 6025 Payload
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
