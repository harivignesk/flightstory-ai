import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, ChevronLeft, ChevronRight, Download, RefreshCw } from 'lucide-react';

export default function ExplorerTab({ records, onSelectRecord }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState('ALL');
  const [selectedFamily, setSelectedFamily] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Filter logic
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Node Filter
      if (selectedNode !== 'ALL' && r.node !== selectedNode) return false;
      
      // Family Filter
      if (selectedFamily !== 'ALL' && r.log_family !== selectedFamily) return false;

      // Severity Filter
      if (selectedSeverity !== 'ALL' && r.severity !== selectedSeverity) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const textToMatch = `${r.node} ${r.log_family} ${r.timestamp_display} ${r.sequence} ${r.fault_code} ${r.fault_name} ${r.message} ${r.filename}`.toLowerCase();
        if (!textToMatch.includes(q)) return false;
      }

      return true;
    });
  }, [records, selectedNode, selectedFamily, selectedSeverity, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Controls Bar */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#9ca3af' }} />
            <input 
              type="text"
              placeholder="Search across all 5,257 records (Fault Code, Message, Sequence)..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="input-field"
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            
            {/* Node Select */}
            <select 
              value={selectedNode}
              onChange={(e) => { setSelectedNode(e.target.value); setCurrentPage(1); }}
              className="input-field"
              style={{ background: '#0f172a' }}
            >
              <option value="ALL">All Nodes (3)</option>
              <option value="NODE_A">NODE_A (2,199)</option>
              <option value="NODE_B">NODE_B (1,177)</option>
              <option value="NODE_C">NODE_C (1,881)</option>
            </select>

            {/* Log Family Select */}
            <select 
              value={selectedFamily}
              onChange={(e) => { setSelectedFamily(e.target.value); setCurrentPage(1); }}
              className="input-field"
              style={{ background: '#0f172a' }}
            >
              <option value="ALL">All Log Families (5)</option>
              <option value="FM CI BPQ Log">FM CI BPQ Log (1,919)</option>
              <option value="Fault Repository Log">Fault Repository Log (1,577)</option>
              <option value="FM LBPQ Log">FM LBPQ Log (1,362)</option>
              <option value="State Transition Buffer Log">State Transition Log (348)</option>
              <option value="Aircraft State Buffer Log">Aircraft State Log (51)</option>
            </select>

            {/* Severity Select */}
            <select 
              value={selectedSeverity}
              onChange={(e) => { setSelectedSeverity(e.target.value); setCurrentPage(1); }}
              className="input-field"
              style={{ background: '#0f172a' }}
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="WARNING">WARNING</option>
              <option value="INFO">INFO</option>
            </select>

            {/* Page Size Select */}
            <select 
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="input-field"
              style={{ background: '#0f172a', width: '90px' }}
            >
              <option value={25}>25 / p</option>
              <option value={50}>50 / p</option>
              <option value={100}>100 / p</option>
              <option value={250}>250 / p</option>
            </select>
          </div>
        </div>

        {/* Filter Stats Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.8rem', color: '#9ca3af', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
          <div>
            Showing <strong>{filteredRecords.length.toLocaleString()}</strong> of <strong>{records.length.toLocaleString()}</strong> records
          </div>
          <div>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card" style={{ padding: '0.5rem' }}>
        <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Node</th>
                <th>Log Family</th>
                <th>Date & Time</th>
                <th>Seq / Serial</th>
                <th>Severity</th>
                <th>Fault / Event Message</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((r) => (
                  <tr key={r.id}>
                    <td className="font-mono" style={{ color: '#6b7280' }}>#{r.id}</td>
                    <td>
                      <span className={`badge badge-${r.node.toLowerCase().replace('_', '-')}`}>
                        {r.node}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                        {r.log_family}
                      </span>
                    </td>
                    <td className="font-mono" style={{ color: '#38bdf8', fontSize: '0.78rem' }}>
                      {r.timestamp_display}
                    </td>
                    <td className="font-mono">{r.sequence || '-'}</td>
                    <td>
                      <span className={`badge badge-${r.severity.toLowerCase()}`}>
                        {r.severity}
                      </span>
                    </td>
                    <td style={{ maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.fault_code && <strong style={{ color: '#f87171', marginRight: '6px' }}>[{r.fault_code}]</strong>}
                      {r.message || r.fault_name || 'Decoded log entry'}
                    </td>
                    <td>
                      <button 
                        onClick={() => onSelectRecord(r)}
                        className="btn-secondary"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" /> Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                    No matching log records found. Try adjusting your search query or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="btn-secondary"
            style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
            Page {currentPage} of {totalPages}
          </span>

          <button 
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="btn-secondary"
            style={{ opacity: currentPage >= totalPages ? 0.5 : 1 }}
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
