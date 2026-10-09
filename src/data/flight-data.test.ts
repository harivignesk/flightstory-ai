import { describe, expect, it } from 'vitest';
import { records, summary, filterRecords, timeline } from './flight-data';
describe('Repository telemetry', () => {
 it('retains every source record', () => expect(summary.total).toBe(5257));
 it('derives critical count from severity rather than fault-family count', () => expect(summary.critical).toBe(617));
 it('filters by node and severity together', () => {
  const result = filterRecords('', 'NODE_C', 'CRITICAL');
  expect(result.length).toBeGreaterThan(0);
  expect(result.every(r => r.node === 'NODE_C' && r.severity === 'CRITICAL')).toBe(true);
 });
 it('searches concrete fault codes', () => {
  const result = filterRecords('6025');
  expect(result.some(r => String(r.fault_code) === '6025')).toBe(true);
 });
 it('includes all records in activity buckets', () => expect(timeline.reduce((sum,b) => sum+b.INFO+b.WARNING+b.CRITICAL,0)).toBe(records.length));
});