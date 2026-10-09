import React from 'react';
import { X, Copy, Check, FileText, Server, Calendar } from 'lucide-react';

export default function DetailModal({ record, onClose }) {
  const [copied, setCopied] = React.useState(false);

  if (!record) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`badge badge-${record.node.toLowerCase().replace('_', '-')}`}>
                {record.node}
              </span>
              <span className="badge badge-info">{record.log_family}</span>
              <span className="badge badge-critical">#{record.id}</span>
            </div>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginTop: '0.4rem' }}>
              Log Record Inspection Drawer
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleCopy} className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}>
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied JSON' : 'Copy JSON'}
            </button>
            <button onClick={onClose} className="btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: '1rem', background: 'rgba(15, 23, 42, 0.8)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Decoded Message Payload</div>
            <div style={{ fontSize: '0.95rem', color: '#38bdf8', fontWeight: '600', marginTop: '0.25rem', fontFamily: 'JetBrains Mono' }}>
              {record.message || 'N/A'}
            </div>
          </div>

          {/* Fields Table */}
          <table className="custom-table" style={{ fontSize: '0.8rem' }}>
            <thead>
              <tr>
                <th style={{ width: '220px' }}>Field Key</th>
                <th>Decoded Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ color: '#9ca3af', fontWeight: '600' }}>Timestamp Display</td>
                <td className="font-mono" style={{ color: '#38bdf8' }}>{record.timestamp_display || '-'}</td>
              </tr>
              <tr>
                <td style={{ color: '#9ca3af', fontWeight: '600' }}>Sequence / Serial Number</td>
                <td className="font-mono">{record.sequence || '-'}</td>
              </tr>
              <tr>
                <td style={{ color: '#9ca3af', fontWeight: '600' }}>Fault Code</td>
                <td className="font-mono" style={{ color: '#f87171' }}>{record.fault_code || 'None'}</td>
              </tr>
              <tr>
                <td style={{ color: '#9ca3af', fontWeight: '600' }}>Fault Name</td>
                <td>{record.fault_name || 'None'}</td>
              </tr>
              <tr>
                <td style={{ color: '#9ca3af', fontWeight: '600' }}>Subcode</td>
                <td>{record.sub_code || 'None'}</td>
              </tr>
              <tr>
                <td style={{ color: '#9ca3af', fontWeight: '600' }}>Source HTML File</td>
                <td className="font-mono" style={{ fontSize: '0.75rem', color: '#a855f7' }}>{record.filename}</td>
              </tr>
              {record.details && Object.entries(record.details).map(([k, v], idx) => (
                <tr key={idx}>
                  <td style={{ color: '#9ca3af' }}>{k}</td>
                  <td className="font-mono" style={{ wordBreak: 'break-all', fontSize: '0.75rem' }}>{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
