import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Box, 
  Layers, 
  RotateCw, 
  Eye, 
  Activity, 
  Target, 
  ShieldAlert, 
  Info,
  Maximize2
} from 'lucide-react';

export default function LogVisualization3D({ records, rootCauseData }) {
  const containerRef = useRef(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterNode, setFilterNode] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [autoRotate, setAutoRotate] = useState(true);

  // Sample data points for 3D performance (e.g. 350 representative points)
  const sampledRecords = useMemo(() => {
    if (!records || !records.length) return [];
    
    // Filter by node & severity
    let filtered = records.filter(r => {
      if (filterNode !== 'ALL' && r.node !== filterNode) return false;
      if (filterSeverity !== 'ALL' && r.severity !== filterSeverity) return false;
      return true;
    });

    // Pick top 300 records plus all critical fault code 6025 records
    const criticals = filtered.filter(r => r.fault_code === 6025);
    const others = filtered.filter(r => r.fault_code !== 6025).slice(0, 250);
    return [...criticals, ...others];
  }, [records, filterNode, filterSeverity]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const height = 550;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.015);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(25, 20, 35);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // Clear previous canvas
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00f2fe, 2, 100);
    pointLight1.position.set(10, 20, 15);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xf87171, 2, 100);
    pointLight2.position.set(-15, -10, -15);
    scene.add(pointLight2);

    // 3D Grid Planes for Node planes
    const gridHelper = new THREE.GridHelper(50, 20, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = -4;
    scene.add(gridHelper);

    // 3D Ambient Particles
    const particleCount = 400;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      particlePositions[i] = (Math.random() - 0.5) * 80;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.25,
      transparent: true,
      opacity: 0.4
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Map 3D Event Nodes (Spheres)
    // X axis: Time index (-20 to +20)
    // Y axis: Severity (-3 = INFO, 1 = WARNING, 5 = CRITICAL)
    // Z axis: Node Plane (-8 = NODE_A, 0 = NODE_B, +8 = NODE_C)

    const spheresGroup = new THREE.Group();
    const interactiveMeshes = [];

    const minId = 1;
    const maxId = records.length || 5257;

    sampledRecords.forEach((r, idx) => {
      // Map X position based on ID / index
      const normId = (r.id - minId) / (maxId - minId || 1);
      const xPos = (normId - 0.5) * 36;

      // Map Y position based on Severity
      let yPos = -2;
      let size = 0.4;
      let colorHex = 0x60a5fa; // Default INFO

      if (r.node === 'NODE_A') colorHex = 0x38bdf8;
      if (r.node === 'NODE_B') colorHex = 0xa855f7;
      if (r.node === 'NODE_C') colorHex = 0x34d399;

      if (r.severity === 'WARNING') {
        yPos = 1;
        size = 0.55;
      } else if (r.severity === 'CRITICAL' || r.fault_code === 6025) {
        yPos = 4.5;
        size = 0.85;
        colorHex = 0xf87171; // Glowing Red
      }

      // Map Z position based on Node
      let zPos = 0;
      if (r.node === 'NODE_A') zPos = -8;
      if (r.node === 'NODE_B') zPos = 0;
      if (r.node === 'NODE_C') zPos = 8;

      // Create Sphere Mesh
      const geometry = new THREE.SphereGeometry(size, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: r.fault_code === 6025 ? 0.8 : 0.2,
        roughness: 0.3,
        metalness: 0.8
      });

      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(xPos, yPos, zPos);
      sphere.userData = r;

      spheresGroup.add(sphere);
      interactiveMeshes.push(sphere);
    });

    scene.add(spheresGroup);

    // Add 3D Cascade Rays connecting Main Event (Fault 6025 on NODE_C) to NODE_A & NODE_B
    const lineMat = new THREE.LineDashedMaterial({
      color: 0xf87171,
      dashSize: 1,
      gapSize: 0.5,
      linewidth: 2
    });

    const linePoints = [
      new THREE.Vector3(-12, 4.5, 8),  // Main Event on NODE_C
      new THREE.Vector3(-5, 4.5, 0),   // Cascade to NODE_B
      new THREE.Vector3(2, 4.5, -8)    // Cascade to NODE_A
    ];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const cascadeLine = new THREE.Line(lineGeo, lineMat);
    cascadeLine.computeLineDistances();
    scene.add(cascadeLine);

    // Raycasting for click selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const clickedData = intersects[0].object.userData;
        setSelectedEvent(clickedData);
      }
    };

    const canvasElem = renderer.domElement;
    canvasElem.addEventListener('click', handleCanvasClick);

    // Orbit Animation Loop
    let angle = 0;
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (autoRotate) {
        angle += 0.003;
        camera.position.x = Math.sin(angle) * 35;
        camera.position.z = Math.cos(angle) * 35;
        camera.lookAt(0, 0, 0);
      }

      particleSystem.rotation.y += 0.0005;
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      canvasElem.removeEventListener('click', handleCanvasClick);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [sampledRecords, autoRotate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Controls Bar */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--card-foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Box className="w-5 h-5 text-cyan-400" /> Interactive 3D Log Event Mapping Space
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginTop: '0.2rem' }}>
              Spatial axes: <strong>X = Timeline (09:00 - 13:05)</strong> | <strong>Y = Event Severity</strong> | <strong>Z = FMS Node Plane (A, B, C)</strong>. Click any 3D node sphere to inspect!
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* Filter Node */}
            <select 
              value={filterNode} 
              onChange={(e) => setFilterNode(e.target.value)}
              className="input-field"
              style={{ background: '#0f172a' }}
            >
              <option value="ALL">All 3D Node Planes</option>
              <option value="NODE_A">NODE_A Plane (Front)</option>
              <option value="NODE_B">NODE_B Plane (Center)</option>
              <option value="NODE_C">NODE_C Plane (Back)</option>
            </select>

            {/* Filter Severity */}
            <select 
              value={filterSeverity} 
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="input-field"
              style={{ background: '#0f172a' }}
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL (Red 3D Spheres)</option>
              <option value="WARNING">WARNING (Mid Level)</option>
              <option value="INFO">INFO (Lower Level)</option>
            </select>

            {/* Auto Rotate Toggle */}
            <button 
              onClick={() => setAutoRotate(!autoRotate)} 
              className={`btn-secondary ${autoRotate ? 'active' : ''}`}
              style={{ padding: '0.5rem 0.85rem' }}
            >
              <RotateCw className="w-4 h-4" /> {autoRotate ? 'Pause 3D Orbit' : 'Rotate 3D Scene'}
            </button>
          </div>
        </div>
      </div>

      {/* 3D WebGL Canvas Container + Floating HUD overlay */}
      <div style={{ position: 'relative', width: '100%', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.2)', boxShadow: '0 0 35px rgba(0,0,0,0.7)' }}>
        
        {/* WebGL Mount point */}
        <div ref={containerRef} style={{ width: '100%', height: '550px', background: '#060913' }} />

        {/* 3D Legend overlay */}
        <div style={{ position: 'absolute', top: '15px', left: '15px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--card-foreground)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>3D Node Plane Legend</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }}></span> NODE_A (Front Z-Plane)
            </span>
            <span style={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#a855f7', display: 'inline-block' }}></span> NODE_B (Center Z-Plane)
            </span>
            <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }}></span> NODE_C (Back Z-Plane)
            </span>
            <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f87171', display: 'inline-block' }}></span> MAIN EVENT (Fault 6025)
            </span>
          </div>
        </div>

        {/* Floating HUD Tooltip when 3D Sphere is clicked */}
        {selectedEvent && (
          <div style={{ position: 'absolute', bottom: '20px', right: '20px', background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(16px)', padding: '1.25rem', borderRadius: '12px', border: '1px solid #38bdf8', maxWidth: '380px', width: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span className={`badge badge-${selectedEvent.node.toLowerCase().replace('_', '-')}`}>
                {selectedEvent.node}
              </span>
              <span className={`badge badge-${selectedEvent.severity.toLowerCase()}`}>
                {selectedEvent.severity}
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>
              {selectedEvent.timestamp_display}
            </div>

            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--card-foreground)', marginTop: '0.35rem' }}>
              {selectedEvent.fault_code ? `Fault Code ${selectedEvent.fault_code}: ${selectedEvent.fault_name || ''}` : selectedEvent.log_family}
            </div>

            <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.35rem', lineHeight: '1.4' }}>
              {selectedEvent.message || 'Decoded event details'}
            </p>

            <button 
              onClick={() => setSelectedEvent(null)}
              className="btn-secondary" 
              style={{ marginTop: '0.75rem', width: '100%', padding: '0.35rem', fontSize: '0.75rem' }}
            >
              Close 3D HUD Tooltip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
