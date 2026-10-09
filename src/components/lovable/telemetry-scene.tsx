import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { records, nodes, startTime, endTime, timeValue, type FlightRecord } from '@/data/flight-data';

type Props = { node: string; severity: string; progress: number; running: boolean; resetKey: number; propagation?: boolean; onSelect: (r: FlightRecord) => void };
const palette = { INFO: '#65c3b0', WARNING: '#efc06a', CRITICAL: '#f17c80', SUCCESS: '#75d9a5' };
function Stream({ from, to, running }: { from: [number, number, number]; to: [number, number, number]; running: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(new THREE.Vector3(...from), new THREE.Vector3((from[0] + to[0]) / 2, 3.5, (from[2] + to[2]) / 2), new THREE.Vector3(...to)), [from, to]);
  useFrame(({ clock }) => { if (mesh.current && running) mesh.current.position.copy(curve.getPoint((clock.elapsedTime * .16) % 1)); });
  return <><Line points={curve.getPoints(50)} color={palette.CRITICAL} lineWidth={1.5} transparent opacity={.75} /><mesh ref={mesh} position={from}><sphereGeometry args={[.075, 12, 12]} /><meshBasicMaterial color={palette.CRITICAL} /></mesh><mesh position={to} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[.12, .3, 8]} /><meshBasicMaterial color={palette.CRITICAL} /></mesh></>;
}
function Content({ node, severity, progress, running, onSelect, propagation }: Props) {
  const filtered = useMemo(() => records.filter(r => (node === 'ALL' || r.node === node) && (severity === 'ALL' || r.severity === severity) && timeValue(r.timestamp) <= startTime + (endTime - startTime) * progress / 100), [node, severity, progress]);
  const geometry = useMemo(() => {
    const pos: number[] = [], colors: number[] = [];
    filtered.forEach(r => {
      const x = (timeValue(r.timestamp) - startTime) / (endTime - startTime) * 14 - 7;
      const y = r.severity === 'CRITICAL' ? 2.2 : r.severity === 'WARNING' ? 1.2 : .25;
      const z = nodes.indexOf(r.node as typeof nodes[number]) * 3 - 3 + ((r.id % 29) / 29 - .5) * 1.6;
      pos.push(x, y + (r.id % 11) * .025, z);
      const c = new THREE.Color(palette[r.severity as keyof typeof palette] ?? palette.INFO); colors.push(c.r, c.g, c.b);
    });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); return g;
  }, [filtered]);
  return <>
    <ambientLight intensity={1.5} />
    {nodes.map((n, i) => <group key={n} position={[0, 0, i * 3 - 3]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[15.5, 2.2]} /><meshBasicMaterial color={palette.INFO} transparent opacity={.035} side={THREE.DoubleSide} /></mesh>
      {[-7, -3.5, 0, 3.5, 7].map(x => <Line key={x} points={[[x, 0, -1.1], [x, 0, 1.1]]} color={palette.INFO} transparent opacity={.17} />)}
      <Line points={[[-7.7, 0, -1.1], [7.7, 0, -1.1], [7.7, 0, 1.1], [-7.7, 0, 1.1], [-7.7, 0, -1.1]]} color={palette.INFO} opacity={.3} transparent />
      <Html position={[-8, .3, 0]} center><span className="scene-node-label">{n.replace('_', ' ')}<small>{i === 0 ? 'PRIMARY' : i === 1 ? 'STANDBY' : 'AUXILIARY'}</small></span></Html>
    </group>)}
    <points geometry={geometry} onClick={e => { e.stopPropagation(); const r = e.index === undefined ? undefined : filtered[e.index]; if (r) onSelect(r); }}><pointsMaterial size={.065} vertexColors transparent opacity={.83} sizeAttenuation /></points>
    <Stream from={[-6.5, 2.2, 3]} to={[-3.5, 2.2, 0]} running={running} /><Stream from={[-6.5, 2.2, 3]} to={[-.8, 2.2, -3]} running={running} />
    <mesh position={[-6.5, 2.2, 3]}><sphereGeometry args={[.13, 20, 20]} /><meshBasicMaterial color={palette.CRITICAL} /></mesh>
    <Html position={[-6.5, 3, 3]} center><div className="scene-fault-label"><span className="status-dot critical" />FAULT 6025<small>09:09:54 · NODE C</small></div></Html>
    {propagation && <Html position={[-.8, 3.1, -3]} center><div className="scene-fault-label recovery">FAILOVER<small>09:41:29 · NODE A</small></div></Html>}
    <Html position={[-6.8, -.6, 4.3]} center><span className="scene-time">09:00</span></Html><Html position={[6.8, -.6, 4.3]} center><span className="scene-time">14:00</span></Html>
    <OrbitControls makeDefault enableDamping minDistance={9} maxDistance={30} maxPolarAngle={Math.PI / 2.15} autoRotate={false} />
  </>;
}
export default function TelemetryScene(props: Props) {
  return <Canvas key={props.resetKey} camera={{ position: [13, 10, 15], fov: 42 }} dpr={[1, 1.8]} gl={{ antialias: true }}><Content {...props} /></Canvas>;
}
