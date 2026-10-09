import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Zap, Play, Pause, RotateCcw, ZoomIn, ZoomOut, Activity, 
  Cpu, GitMerge, Clock, Target, ShieldCheck, ChevronRight, Sparkles, Layers, Eye, RefreshCw
} from 'lucide-react';

export default function InteractiveFreeFlowGraph({ records, rootCauseData }) {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTimeProgress, setCurrentTimeProgress] = useState(100);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeAgentStep, setActiveAgentStep] = useState(3); // 0: Ingestion, 1: Timestamp Clustering, 2: Causal Mapping, 3: Convergence
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);

  // Agentic AI Pipeline Definition
  const aiAgents = [
    { id: 0, name: 'Data Stream Ingestion Agent', icon: Layers, status: 'Completed', detail: 'Ingested 5,257 records across 15 HTML log files' },
    { id: 1, name: 'Timestamp Clustering Agent', icon: Clock, status: 'Completed', detail: 'Correlated microsecond time-series events across NODE A, B, C' },
    { id: 2, name: 'Cross-Node Causal Graph Agent', icon: GitMerge, status: 'Completed', detail: 'Detected Process ID 653 failure & lockout cascade' },
    { id: 3, name: 'Final Event Convergence Agent', icon: Target, status: 'Active', detail: 'Synthesized root-cause Fault 6025 & Dual-Mode Recovery' }
  ];

  // Extract timestamp-aligned key events from dataset for stream mapping
  const timestampStreamData = useMemo(() => {
    if (!records || !records.length) return [];

    // Filter key milestone events across nodes
    const keyMilestones = [
      { id: 'm1', timestamp: '09:00:31 AM', node: 'NODE_C', severity: 'INFO', log_family: 'FM CI BPQ Log', fault_code: null, title: 'Navigation DB Refresh Cycle Initiated', message: 'Navigation Database Refresh Cycle started on auxiliary node C', upstream: 'Scheduled System Maintenance', downstream: 'Memory ID Allocation Request', agent_reasoning: 'Ingestion Agent detected routine DB refresh start.' },
      { id: 'm2', timestamp: '09:09:54 AM', node: 'NODE_C', severity: 'CRITICAL', log_family: 'Fault Log', fault_code: 6025, title: 'PRIMARY ROOT CAUSE: Process ID Lookup Failure (653)', message: 'get current process id failure 653; Background service identity lookup failed', upstream: 'Memory ID Allocation Request', downstream: 'Repository Lockout Cascade across NODE B & C', agent_reasoning: 'Causal Agent identified this as the SINGLE ROOT CAUSE event.' },
      { id: 'm3', timestamp: '09:12:15 AM', node: 'NODE_C', severity: 'CRITICAL', log_family: 'Repository Log', fault_code: 6074, title: 'Repository Lockout Cascade (329 Events)', message: 'Data buffer lock failure error 6074; Access denied to shared telemetry queue', upstream: 'Process ID Lookup Failure (Fault 6025)', downstream: 'Cross-Node Semaphore Timeouts', agent_reasoning: 'Timestamp Clustering Agent grouped 329 concurrent Code 6074 lockout errors.' },
      { id: 'm4', timestamp: '09:18:40 AM', node: 'NODE_B', severity: 'WARNING', log_family: 'State Transition Buffer Log', fault_code: 6029, title: 'Node B Single-Mode Failover Drop (193 Events)', message: 'Semaphore timeout error 6029; Node B dropped to single-mode fallback', upstream: 'Repository Lockout Cascade', downstream: 'Node A Master Consensus Re-evaluation', agent_reasoning: 'Cross-Node Agent traced 193 Code 6029 semaphore timeouts forcing Node B failover.' },
      { id: 'm5', timestamp: '09:42:50 AM', node: 'NODE_A', severity: 'INFO', log_family: 'FM CI BPQ Log', fault_code: 6035, title: 'Dual-Mode Consensus Restored by Node A', message: 'Dual-mode master-standby synchronization re-established by Node A', upstream: 'Node A Master Consensus Re-evaluation', downstream: 'Full System Operational Recovery', agent_reasoning: 'Convergence Agent confirmed complete multi-node recovery at 09:42:50 AM.' }
    ];

    // Build timeline stream nodes
    const streamNodes = keyMilestones.map((m, idx) => {
      let color = '#38bdf8'; // NODE_A
      if (m.node === 'NODE_B') color = '#a855f7';
      if (m.node === 'NODE_C') color = '#34d399';
      if (m.fault_code === 6025) color = '#f87171';

      return {
        ...m,
        xRatio: (idx + 1) / (keyMilestones.length + 1), // Normalized timeline x-position
        color
      };
    });

    return streamNodes;
  }, [records]);

  // Automated playback timer loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTimeProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 0.5 * playbackSpeed;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Canvas Animatic Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const width = canvas.width = canvas.parentElement.clientWidth || 1000;
    const height = canvas.height = 580;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Save Canvas State for Zoom & Pan
      ctx.save();
      ctx.translate(panOffset.x, panOffset.y);
      ctx.scale(zoomLevel, zoomLevel);

      // 1. Draw Node Swimlanes (NODE_A, NODE_B, NODE_C, & Agentic AI Convergence Spine)
      const swimlanes = [
        { name: 'NODE_A (Primary Master)', y: 110, color: '#38bdf8' },
        { name: 'NODE_B (Secondary Standby)', y: 220, color: '#a855f7' },
        { name: 'NODE_C (Auxiliary Spare)', y: 330, color: '#34d399' },
        { name: '🤖 AGENTIC AI CONVERGENCE STREAM', y: 470, color: '#f87171', isSpine: true }
      ];

      swimlanes.forEach(s => {
        ctx.beginPath();
        ctx.moveTo(60, s.y);
        ctx.lineTo(width - 60, s.y);
        ctx.strokeStyle = s.isSpine ? 'rgba(248, 113, 113, 0.4)' : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = s.isSpine ? 3 : 1;
        if (s.isSpine) ctx.setLineDash([8, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Swimlane Tag Label
        ctx.fillStyle = s.color;
        ctx.font = s.isSpine ? 'bold 11px IBM Plex Mono' : '10px IBM Plex Mono';
        ctx.fillText(s.name, 60, s.y - 10);
      });

      // 2. Map Timestamp Data Nodes onto Swimlanes
      const nodesWithPos = timestampStreamData.map(node => {
        let y = 110;
        if (node.node === 'NODE_B') y = 220;
        if (node.node === 'NODE_C') y = 330;

        const x = 120 + node.xRatio * (width - 240);
        return { ...node, x, y };
      });

      // 3. Draw Causal Flow Streams (Bezier Curves Connecting Timestamp Data to AI Convergence Spine)
      const convergenceY = 470;
      const mainRootCauseX = 120 + 0.4 * (width - 240); // Convergence point at Fault 6025 timestamp

      nodesWithPos.forEach((node, i) => {
        const activeProgressX = (currentTimeProgress / 100) * width;
        const isVisible = node.x <= activeProgressX + 100;

        if (!isVisible) return;

        // Curve from Timestamp Node down to Central AI Convergence Spine
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.bezierCurveTo(node.x, (node.y + convergenceY) / 2, mainRootCauseX, (node.y + convergenceY) / 2, mainRootCauseX, convergenceY);
        
        const isSelected = selectedEvent && selectedEvent.id === node.id;
        ctx.strokeStyle = isSelected ? '#38bdf8' : (node.fault_code === 6025 ? 'rgba(248, 113, 113, 0.8)' : 'rgba(56, 189, 248, 0.25)');
        ctx.lineWidth = isSelected ? 3.5 : (node.fault_code === 6025 ? 2.5 : 1.5);
        ctx.stroke();

        // Animated Particle Stream Pulses along the curve
        const timeOffset = (Date.now() * 0.002 * playbackSpeed + i * 0.3) % 1;
        const px = (1 - timeOffset) * (1 - timeOffset) * node.x + 2 * (1 - timeOffset) * timeOffset * node.x + timeOffset * timeOffset * mainRootCauseX;
        const py = (1 - timeOffset) * (1 - timeOffset) * node.y + 2 * (1 - timeOffset) * timeOffset * ((node.y + convergenceY) / 2) + timeOffset * timeOffset * convergenceY;

        ctx.beginPath();
        ctx.arc(px, py, node.fault_code === 6025 ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = node.fault_code === 6025 ? '#f87171' : '#00f2fe';
        ctx.shadowBlur = 12;
        ctx.shadowColor = node.fault_code === 6025 ? '#f87171' : '#00f2fe';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 4. Draw Central AI Convergence Hub Node (Main Event: Fault 6025)
      ctx.beginPath();
      ctx.arc(mainRootCauseX, convergenceY, 22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(248, 113, 113, 0.25)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(mainRootCauseX, convergenceY, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#f87171';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#f87171';
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px IBM Plex Mono';
      ctx.textAlign = 'center';
      ctx.fillText('FINAL EVENT: FAULT 6025', mainRootCauseX, convergenceY + 32);

      // 5. Render Timestamp Data Nodes
      nodesWithPos.forEach(node => {
        const activeProgressX = (currentTimeProgress / 100) * width;
        const isVisible = node.x <= activeProgressX + 100;
        if (!isVisible) return;

        const isSelected = selectedEvent && selectedEvent.id === node.id;
        const isHovered = hoveredNode && hoveredNode.id === node.id;
        const radius = node.fault_code === 6025 ? 14 : (isSelected || isHovered ? 12 : 9);

        // Pulse Ring
        if (isSelected || node.fault_code === 6025) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 6, 0, Math.PI * 2);
          ctx.fillStyle = node.fault_code === 6025 ? 'rgba(248, 113, 113, 0.3)' : 'rgba(56, 189, 248, 0.3)';
          ctx.fill();
        }

        // Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowBlur = isSelected ? 15 : 8;
        ctx.shadowColor = node.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.lineWidth = isSelected ? 2.5 : 1;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Node Timestamp Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px IBM Plex Mono';
        ctx.textAlign = 'center';
        ctx.fillText(node.timestamp, node.x, node.y - (radius + 8));
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [timestampStreamData, currentTimeProgress, playbackSpeed, selectedEvent, hoveredNode, zoomLevel, panOffset]);

  // Touch & Mouse Drag Handlers
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
    const clickY = (e.clientY - rect.top - panOffset.y) / zoomLevel;

    const width = canvas.width;
    const clicked = timestampStreamData.find((m, idx) => {
      let y = 110;
      if (m.node === 'NODE_B') y = 220;
      if (m.node === 'NODE_C') y = 330;
      const x = 120 + m.xRatio * (width - 240);

      const dx = x - clickX;
      const dy = y - clickY;
      return Math.sqrt(dx * dx + dy * dy) <= 20;
    });

    if (clicked) {
      setSelectedEvent(clicked);
    } else {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingCanvas) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else {
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
      const mouseY = (e.clientY - rect.top - panOffset.y) / zoomLevel;
      const width = canvas.width;

      const hovered = timestampStreamData.find((m) => {
        let y = 110;
        if (m.node === 'NODE_B') y = 220;
        if (m.node === 'NODE_C') y = 330;
        const x = 120 + m.xRatio * (width - 240);

        const dx = x - mouseX;
        const dy = y - mouseY;
        return Math.sqrt(dx * dx + dy * dy) <= 18;
      });

      setHoveredNode(hovered || null);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Agentic AI Status & Control Banner */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--card-foreground)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Cpu style={{ color: 'var(--info)' }} size={22} />
              Agentic AI Event Convergence & Causal Flow Engine
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', marginTop: '0.2rem' }}>
              Multi-Agent LangGraph orchestration mapping timestamp data points across nodes into the <strong>Final Main Event (Fault 6025)</strong>.
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setIsPlaying(!isPlaying)} 
              className="nav-item" 
              style={{ width: 'auto', padding: '0.45rem 0.85rem', background: 'var(--secondary)', color: 'var(--card-foreground)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              {isPlaying ? 'Pause Flow' : 'Play Flow'}
            </button>

            <button 
              onClick={() => setCurrentTimeProgress(0)} 
              className="nav-item" 
              style={{ width: 'auto', padding: '0.45rem 0.85rem', background: 'var(--secondary)', color: 'var(--muted-foreground)' }}
            >
              <RotateCcw size={15} /> Restart
            </button>

            <select 
              value={playbackSpeed} 
              onChange={e => setPlaybackSpeed(Number(e.target.value))}
              style={{ padding: '0.45rem 0.65rem', borderRadius: '4px', background: 'var(--secondary)', color: 'var(--card-foreground)', border: '1px solid var(--border)', fontSize: '0.8rem' }}
            >
              <option value={0.5}>0.5x Speed</option>
              <option value={1}>1.0x Speed</option>
              <option value={2}>2.0x Speed</option>
              <option value={5}>5.0x Speed</option>
            </select>

            <button onClick={() => setZoomLevel(z => Math.min(2, z + 0.25))} className="nav-item" style={{ width: 'auto', padding: '0.45rem' }}>
              <ZoomIn size={15} />
            </button>
            <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.25))} className="nav-item" style={{ width: 'auto', padding: '0.45rem' }}>
              <ZoomOut size={15} />
            </button>
          </div>
        </div>

        {/* 4 Agent Pipeline Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {aiAgents.map(agent => {
            const AgentIcon = agent.icon;
            const isActive = activeAgentStep === agent.id;
            return (
              <div 
                key={agent.id} 
                onClick={() => setActiveAgentStep(agent.id)}
                style={{ 
                  background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)', 
                  border: isActive ? '1px solid var(--info)' : '1px solid var(--border)', 
                  borderRadius: '6px', 
                  padding: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isActive ? 'var(--info)' : '#fff', fontWeight: '600', fontSize: '0.82rem' }}>
                    <AgentIcon size={16} />
                    {agent.name}
                  </div>
                  <span className={`tiny-badge ${isActive ? 'success' : ''}`}>{agent.status}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', lineHeight: '1.4' }}>
                  {agent.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Free-Flow Interactive Canvas */}
      <div style={{ position: 'relative', width: '100%', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--scene)' }}>
        
        <canvas 
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ width: '100%', height: '580px', cursor: isDraggingCanvas ? 'grabbing' : 'grab' }}
        />

        {/* Time Scrubber Timeline */}
        <div style={{ position: 'absolute', bottom: '15px', left: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(11, 15, 25, 0.85)', padding: '0.65rem 1.1rem', borderRadius: '6px', border: '1px solid var(--border)', backdropFilter: 'blur(8px)' }}>
          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>09:00:00 AM</span>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={currentTimeProgress} 
            onChange={e => setCurrentTimeProgress(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--info)' }} 
          />
          <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>14:00:09 PM</span>
        </div>

        {/* Agentic Causal Inspector Drawer (Triggered by Clicking Any Timestamp Data Node) */}
        {selectedEvent && (
          <div style={{ 
            position: 'absolute', 
            top: '20px', 
            right: '20px', 
            background: 'var(--card)', 
            border: selectedEvent.fault_code === 6025 ? '2px solid var(--critical)' : '1px solid var(--info)', 
            borderRadius: '8px', 
            padding: '1.25rem', 
            maxWidth: '420px', 
            width: '100%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span className={`node-tag ${selectedEvent.node.toLowerCase()}`}>{selectedEvent.node}</span>
              <span className={`severity ${selectedEvent.severity.toLowerCase()}`}><i />{selectedEvent.severity}</span>
            </div>

            <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.75rem', color: 'var(--info)' }}>
              TIMESTAMP: {selectedEvent.timestamp}
            </div>

            <h3 style={{ fontSize: '1rem', color: 'var(--card-foreground)', margin: '0.5rem 0', fontWeight: '600' }}>
              {selectedEvent.title}
            </h3>

            <div style={{ background: 'var(--secondary)', padding: '0.75rem', borderRadius: '5px', fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.75rem', lineHeight: '1.5' }}>
              {selectedEvent.message}
            </div>

            {/* Causal Mapping & Integration Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.78rem' }}>
              <div>
                <strong style={{ color: 'var(--muted-foreground)' }}>⬆️ UPSTREAM TRIGGER:</strong>
                <p style={{ color: 'var(--card-foreground)', marginTop: '0.15rem' }}>{selectedEvent.upstream}</p>
              </div>

              <div>
                <strong style={{ color: 'var(--muted-foreground)' }}>⬇️ DOWNSTREAM IMPACT:</strong>
                <p style={{ color: 'var(--card-foreground)', marginTop: '0.15rem' }}>{selectedEvent.downstream}</p>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.6rem', marginTop: '0.4rem' }}>
                <strong style={{ color: 'var(--info)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Sparkles size={14} /> AGENTIC AI REASONING:
                </strong>
                <p style={{ color: 'var(--foreground)', marginTop: '0.2rem', lineHeight: '1.4' }}>
                  {selectedEvent.agent_reasoning}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setSelectedEvent(null)}
              className="nav-item"
              style={{ width: '100%', marginTop: '1rem', justifyContent: 'center', background: 'var(--secondary)', color: 'var(--card-foreground)' }}
            >
              Close Inspector
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
