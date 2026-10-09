import source from './honeywell_fms_dataset.json';

export const dataset = source;
export const records = source.records;
export type FlightRecord = (typeof records)[number];
export type NodeId = 'NODE_A' | 'NODE_B' | 'NODE_C';
export const nodes: NodeId[] = ['NODE_A', 'NODE_B', 'NODE_C'];
export const nodeLabels = { NODE_A: 'Primary Master', NODE_B: 'Secondary Standby', NODE_C: 'Auxiliary Spare' };
export const severityOrder = ['INFO', 'WARNING', 'CRITICAL'];

// Standard 5 Log Families Mapping
export const logFamilies = [
  'Aircraft State Buffer Log',
  'Fault Repository Log',
  'FM CI BPQ Log',
  'FM LBPQ Log',
  'State Transition Buffer Log'
];

export const logFamilyCategories: Record<string, string> = {
  'Aircraft State Buffer Log': 'Aircraft State',
  'Fault Repository Log': 'Fault History',
  'FM CI BPQ Log': 'Operator Interaction',
  'FM LBPQ Log': 'Software Events',
  'State Transition Buffer Log': 'State Transition'
};

export const familyColors: Record<string, string> = {
  'Aircraft State': '#38bdf8',       // Cyan
  'Fault History': '#f87171',        // Red
  'Operator Interaction': '#fbbf24', // Amber
  'Software Events': '#a855f7',      // Purple
  'State Transition': '#34d399'      // Emerald
};

export const timeValue = (timestamp: string) => Date.parse(timestamp.replace(' ', 'T') + 'Z');
export const startTime = Math.min(...records.map(r => timeValue(r.timestamp)));
export const endTime = Math.max(...records.map(r => timeValue(r.timestamp)));

// Extended Global Filter Function
export function filterRecords(filters: {
  query?: string;
  node?: string;
  severity?: string;
  logFamily?: string;
  category?: string;
  faultCode?: string;
  timeRange?: [number, number];
}) {
  const { query = '', node = 'ALL', severity = 'ALL', logFamily = 'ALL', category = 'ALL', faultCode = 'ALL', timeRange } = filters;
  const q = query.toLowerCase();

  return records.filter(r => {
    if (node !== 'ALL' && r.node !== node) return false;
    if (severity !== 'ALL' && r.severity !== severity) return false;
    if (logFamily !== 'ALL' && r.log_family !== logFamily) return false;
    
    const recCategory = logFamilyCategories[r.log_family] || r.log_family;
    if (category !== 'ALL' && recCategory !== category) return false;

    if (faultCode !== 'ALL') {
      if (faultCode === 'NONE' && r.fault_code !== null) return false;
      if (faultCode !== 'NONE' && String(r.fault_code) !== faultCode) return false;
    }

    if (timeRange) {
      const tv = timeValue(r.timestamp);
      if (tv < timeRange[0] || tv > timeRange[1]) return false;
    }

    if (q) {
      const text = `${r.id} ${r.node} ${r.log_family} ${recCategory} ${r.message} ${r.fault_code ?? ''} ${r.timestamp}`.toLowerCase();
      if (!text.includes(q)) return false;
    }

    return true;
  });
}

// Compute Dynamic Summary Statistics from Active Records
export function getDatasetSummary(filteredRows = records) {
  const totalsByNode: Record<string, number> = { NODE_A: 0, NODE_B: 0, NODE_C: 0 };
  const totalsByFamily: Record<string, number> = {};
  const totalsByCategory: Record<string, number> = {};

  filteredRows.forEach(r => {
    if (totalsByNode[r.node] !== undefined) totalsByNode[r.node]++;
    
    totalsByFamily[r.log_family] = (totalsByFamily[r.log_family] || 0) + 1;
    const cat = logFamilyCategories[r.log_family] || r.log_family;
    totalsByCategory[cat] = (totalsByCategory[cat] || 0) + 1;
  });

  return {
    total: filteredRows.length,
    critical: filteredRows.filter(r => r.severity === 'CRITICAL').length,
    warning: filteredRows.filter(r => r.severity === 'WARNING').length,
    info: filteredRows.filter(r => r.severity === 'INFO').length,
    fault6025Count: filteredRows.filter(r => r.fault_code === 6025).length,
    totalsByNode,
    totalsByFamily,
    totalsByCategory,
    files: source.quality_stats.total_files,
    skippedRecords: source.quality_stats.skipped_records || 0
  };
}

export const summary = getDatasetSummary(records);

export const timeline = Array.from({ length: 31 }, (_, i) => {
  const a = startTime + i * 600000;
  const bucket = records.filter(r => timeValue(r.timestamp) >= a && timeValue(r.timestamp) < a + 600000);
  return { 
    time: new Date(a).toISOString().slice(11, 16), 
    INFO: bucket.filter(r => r.severity === 'INFO').length, 
    WARNING: bucket.filter(r => r.severity === 'WARNING').length, 
    CRITICAL: bucket.filter(r => r.severity === 'CRITICAL').length 
  };
});

export function exportRecords(rows: FlightRecord[]) {
  const keys = ['id', 'timestamp', 'node', 'severity', 'log_family', 'fault_code', 'message'] as const;
  const csv = [keys.join(','), ...rows.map(r => keys.map(k => `"${String(r[k] ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const link = document.createElement('a'); 
  link.href = url; 
  link.download = `honeywell-fms-export-${new Date().toISOString().slice(0, 10)}.csv`; 
  link.click(); 
  URL.revokeObjectURL(url);
}
