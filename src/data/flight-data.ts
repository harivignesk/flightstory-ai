import source from './honeywell_fms_dataset.json';

export const dataset = source;
export const records = source.records;
export type FlightRecord = (typeof records)[number];
export type NodeId = 'NODE_A' | 'NODE_B' | 'NODE_C';
export const nodes: NodeId[] = ['NODE_A', 'NODE_B', 'NODE_C'];
export const nodeLabels = { NODE_A: 'Primary master', NODE_B: 'Secondary standby', NODE_C: 'Auxiliary spare' };
export const severityOrder = ['INFO', 'WARNING', 'CRITICAL'];
export const timeValue = (timestamp: string) => Date.parse(timestamp.replace(' ', 'T') + 'Z');
export const startTime = Math.min(...records.map(r => timeValue(r.timestamp)));
export const endTime = Math.max(...records.map(r => timeValue(r.timestamp)));
export function filterRecords(query = '', node = 'ALL', severity = 'ALL') {
  const q = query.toLowerCase();
  return records.filter(r => (node === 'ALL' || r.node === node) && (severity === 'ALL' || r.severity === severity) && (!q || `${r.node} ${r.log_family} ${r.message} ${r.fault_code ?? ''} ${r.timestamp}`.toLowerCase().includes(q)));
}
export const summary = {
  total: records.length,
  critical: records.filter(r => r.severity === 'CRITICAL').length,
  warning: records.filter(r => r.severity === 'WARNING').length,
  files: source.quality_stats.total_files,
};
export const timeline = Array.from({ length: 31 }, (_, i) => {
  const a = startTime + i * 600000;
  const bucket = records.filter(r => timeValue(r.timestamp) >= a && timeValue(r.timestamp) < a + 600000);
  return { time: new Date(a).toISOString().slice(11, 16), INFO: bucket.filter(r => r.severity === 'INFO').length, WARNING: bucket.filter(r => r.severity === 'WARNING').length, CRITICAL: bucket.filter(r => r.severity === 'CRITICAL').length };
});
export function exportRecords(rows: FlightRecord[]) {
  const keys = ['id', 'timestamp', 'node', 'severity', 'log_family', 'fault_code', 'message'] as const;
  const csv = [keys.join(','), ...rows.map(r => keys.map(k => `"${String(r[k] ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const link = document.createElement('a'); link.href = url; link.download = 'flightstory-telemetry.csv'; link.click(); URL.revokeObjectURL(url);
}
