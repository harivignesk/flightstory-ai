import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Zap, 
  Activity, 
  Filter, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Play, 
  Pause, 
  Target, 
  Layers, 
  MousePointer, 
  Eye,
  Sliders,
  Move
} from 'lucide-react';

export default function InteractiveFreeFlowGraph({ records, rootCauseData }) {
  const canvasRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterNode, setFilterNode] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [isPhysicsActive, setIsPhysicsActive] = useState(true);
  const [particleSpeed, setParticleSpeed] = useState(1.5);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState(null);

  // Extract representative key causal events (e.g. 120 key nodes) for smooth 60fps free-flow physics
  const graphData = useMemo(() => {
    if (!records || !records.length) return { nodes: [], links: [] };

    let filtered = records.filter(r => {
      if (filterNode !== 'ALL' && r.node !== filterNode) return false;
      if (filterSeverity !== 'ALL' && r.severity !== filterSeverity) return false;
      return true;
    });

    // Target key fault codes, state transitions, and operator inputs
    const keyEvents = filtered.filter(r => 
      r.fault_code === 6025 || 
      r.fault_code === 6074 || 
      r.fault_code === 6035 || 
      r.log_family === 'State Transition Buffer Log' || 
      r.log_family === 'FM CI BPQ Log'
    ).slice(0, 100);

    const nodes = keyEvents.map((r, i) => {
      // Set initial positions in a circular layout
      const angle = (i / keyEvents.length) * Math.PI * 2;
      const radius = 220 + (i % 3) * 60;
      
      let color = '#38bdf8'; // NODE_A
      if (r.node === 'NODE_B') color = '#a855f7';
      if (r.node === 'NODE_C') color = '#34d399';
      if (r.fault_code === 6025 || r.severity === 'CRITICAL') color = '#f87171';

      return {
        id: r.id,
        x: Math.cos(angle) * radius + (Math.random() - 0.5) * 40,
        y: Math.sin(angle) * radius + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        radius: r.fault_code === 6025 ? 18 : (r.severity === 'CRITICAL' ? 14 : 10),
        color,
        node: r.node,
        family: r.log_family,
        timestamp: r.timestamp_display,
        severity: r.severity,
        fault_code: r.fault_code,
        message: r.message,
        event_flow: r.event_flow,
        flow_type: r.flow_type
      };
    });

    // Create causal flow links between sequential/concurrent events
    const links = [];
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    for (let i = 0; i < nodes.length - 1; i++) {
      const src = nodes[i];
      const tgt = nodes[i + 1];
      
      // Connect sequential & fault cascade links
      if (src.fault_code === 6025 || src.node === tgt.node || Math.abs(src.id - tgt.id) < 5) {
        links.push({
          source: src,
          target: tgt,
          particles: [
            { offset: Math.random() },
            { offset: Math.random() }
          ]
        });
      }
    }

    return { nodes, links };
  }, [records, filterNode, filterSeverity]);

  // Main Canvas Rendering & Animatic Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const width = canvas.width = canvas.parentElement.clientWidth || 1000;
    const height = canvas.height = 650;
    const centerX = width / 2;
    const centerY = height / 2;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Save Canvas State for Zoom & Pan
      ctx.save();
      ctx.translate(centerX + panOffset.x, centerY + panOffset.y);
      ctx.scale(zoomLevel, zoomLevel);

      const { nodes, links } = graphData;

      // 1. Physics Engine Step (Spring Force Repulsion & Dynamic Flow Movement)
      if (isPhysicsActive) {
        // Repulsion between nodes
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const n1 = nodes[i];
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            if (dist < 180) {
              const force = (180 - dist) / dist * 0.08;
              n1.vx -= dx * force;
              n1.vy -= dy * force;
              n2.vx += dx * force;
              n2.vy += dy * force;
            }
          }
        }

        // Spring Attraction along links
        links.forEach(link => {
          const dx = link.target.x - link.source.x;
          const dy = link.target.y - link.source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 120) * 0.005;

          link.source.vx += dx * force;
          link.source.vy += dy * force;
          link.target.vx -= dx * force;
          link.target.vy -= dy * force;
        });

        // Center Gravity & Position Updates
        nodes.forEach(n => {
          if (n !== draggedNode) {
            n.vx *= 0.88; // Damping
            n.vy *= 0.88;
            n.x += n.vx;
            n.y += n.vy;
            
            // Pull gently toward center
            n.x -= n.x * 0.002;
            n.y -= n.y * 0.002;
          }
        });
      }

      // 2. Draw Connection Links & Animated Flow Particles
      links.forEach(link => {
        const isHighlighted = selectedNode && (selectedNode.id === link.source.id || selectedNode.id === link.target.id);
        
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        ctx.strokeStyle = isHighlighted ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = isHighlighted ? 3 : 1.2;
        ctx.stroke();

        // Animated Particle Pulses along the link
        link.particles.forEach(p => {
          p.offset = (p.offset + 0.006 * particleSpeed) % 1;
          const px = link.source.x + (link.target.x - link.source.x) * p.offset;
          const py = link.source.y + (link.target.y - link.source.y) * p.offset;

          ctx.beginPath();
          ctx.arc(px, py, isHighlighted ? 4.5 : 2.5, 0, Math.PI * 2);
          ctx.fillStyle = link.source.fault_code === 6025 ? '#f87171' : '#00f2fe';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#00f2fe';
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      });

      // 3. Draw Event Nodes
      nodes.forEach(n => {
        const isSelected = selectedNode && selectedNode.id === n.id;
        const isMain = n.fault_code === 6025;

        // Glowing Ring for Main Event or Selected Node
        if (isSelected || isMain) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 8, 0, Math.PI * 2);
          ctx.fillStyle = isMain ? 'rgba(248, 113, 113, 0.25)' : 'rgba(56, 189, 248, 0.25)';
          ctx.fill();
        }

        // Node Circle Mesh
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.shadowBlur = isMain ? 20 : (isSelected ? 15 : 5);
        ctx.shadowColor = n.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Border Ring
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Node ID / Code Text Label
        ctx.fillStyle = '#ffffff';
        ctx.font = isMain ? 'bold 11px Outfit' : '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(isMain ? `MAIN 6025` : `#${n.id}`, n.x, n.y + n.radius + 14);
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [graphData, isPhysicsActive, particleSpeed, zoomLevel, panOffset, selectedNode, draggedNode]);

  // Touch & Mouse Drag Handlers for Free-Flow User Control
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - canvas.width / 2 - panOffset.x) / zoomLevel;
    const clickY = (e.clientY - rect.top - canvas.height / 2 - panOffset.y) / zoomLevel;

    // Check if clicked on a Node
    const clickedNode = graphData.nodes.find(n => {
      const dx = n.x - clickX;
      const dy = n.y - clickY;
      return Math.sqrt(dx * dx + dy * dy) <= n.radius + 6;
    });

    if (clickedNode) {
      setDraggedNode(clickedNode);
      setSelectedNode(clickedNode);
    } else {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (draggedNode) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      draggedNode.x = (e.clientX - rect.left - canvas.width / 2 - panOffset.x) / zoomLevel;
      draggedNode.y = (e.clientY - rect.top - canvas.height / 2 - panOffset.y) / zoomLevel;
      draggedNode.vx = 0;
      draggedNode.vy = 0;
    } else if (isDraggingCanvas) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
    setIsDraggingCanvas(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Interactive Controls Banner */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap className="w-5 h-5 text-cyan-400" /> Free-Flow Animatic Event Causal Graph (LangGraph Powered)
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginTop: '0.2rem' }}>
              <strong>Touch / Drag</strong> any node with your fingers/mouse to reorganize event flows. Tap any event node to trace <em>actually what happened because of that event</em>!
            </p>
          </div>

          {/* Interactive Tools */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))} 
              className="btn-secondary" 
              title="Zoom In"
              style={{ padding: '0.5rem' }}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.4))} 
              className="btn-secondary" 
              title="Zoom Out"
              style={{ padding: '0.5rem' }}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button 
              onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }} 
              className="btn-secondary" 
              title="Reset View"
              style={{ padding: '0.5rem' }}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsPhysicsActive(!isPhysicsActive)} 
              className={`btn-secondary ${isPhysicsActive ? 'active' : ''}`}
              style={{ padding: '0.5rem 0.85rem' }}
            >
              {isPhysicsActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPhysicsActive ? 'Pause Physics' : 'Resume Physics'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas + Floating Interactive Overlay */}
      <div style={{ position: 'relative', width: '100%', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.3)', boxShadow: '0 0 35px rgba(0,0,0,0.8)', background: '#060913' }}>
        
        {/* Interactive Free-Flow Canvas */}
        <canvas 
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ width: '100%', height: '650px', cursor: draggedNode ? 'grabbing' : (isDraggingCanvas ? 'grabbing' : 'grab') }}
        />

        {/* Floating Legend */}
        <div style={{ position: 'absolute', top: '15px', left: '15px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', padding: '0.85rem 1.1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#fff', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Causal Flow Color Guide</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#f87171', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f87171', display: 'inline-block' }}></span> 🔴 MAIN EVENT (Fault Code 6025)
            </span>
            <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }}></span> 🔵 NODE_A Telemetry Flow
            </span>
            <span style={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#a855f7', display: 'inline-block' }}></span> 🟣 NODE_B Telemetry Flow
            </span>
            <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }}></span> 🟢 NODE_C Telemetry Flow
            </span>
          </div>
        </div>

        {/* Floating Causal Inspector HUD Drawer (Shows What Happened Because of this Event) */}
        {selectedNode && (
          <div style={{ 
            position: 'absolute', 
            bottom: '20px', 
            right: '20px', 
            background: 'rgba(15, 23, 42, 0.94)', 
            backdropFilter: 'blur(16px)', 
            padding: '1.25rem', 
            borderRadius: '14px', 
            border: selectedNode.fault_code === 6025 ? '2px solid #f87171' : '1px solid #38bdf8', 
            maxWidth: '420px', 
            width: '100%', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.85)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className={`badge badge-${selectedNode.node.toLowerCase().replace('_', '-')}`}>
                {selectedNode.node}
              </span>
              <span className={`badge badge-${selectedNode.severity.toLowerCase()}`}>
                {selectedNode.severity}
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>
              Timestamp: {selectedNode.timestamp}
            </div>

            <h4 style={{ fontSize: '1rem', color: '#fff', marginTop: '0.4rem', fontWeight: '700' }}>
              {selectedNode.fault_code ? `Fault ${selectedNode.fault_code}: ${selectedNode.message || ''}` : selectedNode.family}
            </h4>

            {/* LangGraph Event Flow Description */}
            <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '0.75rem', borderRadius: '8px', marginTop: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase' }}>
                ⚡ LangGraph Flow & Causal Mapping:
              </div>
              <p style={{ fontSize: '0.8rem', color: '#e5e7eb', marginTop: '0.25rem', lineHeight: '1.4' }}>
                {selectedNode.event_flow || 'Standard telemetry event mapped in LangGraph state flow.'}
              </p>
            </div>

            <button 
              onClick={() => setSelectedNode(null)} 
              className="btn-secondary" 
              style={{ marginTop: '0.85rem', width: '100%', padding: '0.4rem', fontSize: '0.78rem' }}
            >
              Close Event Causal Inspector
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
