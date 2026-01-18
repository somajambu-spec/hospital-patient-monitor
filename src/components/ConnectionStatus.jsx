import React from 'react';

const ConnectionStatus = ({ portStatus, arduinoStatus, cloudStatus }) => {
  const getNodeStatus = (status, type) => {
    if (type === 'port') {
      return status === 'ready' ? 'ready' : status === 'busy' ? 'error' : status === 'unreachable' ? 'warning' : 'untested';
    }
    if (type === 'arduino') {
      return status === 'ready' ? 'ready' : status === 'not-ready' ? 'warning' : status === 'unreachable' ? 'error' : 'untested';
    }
    if (type === 'cloud') {
      return status === 'connected' ? 'ready' : status === 'error' ? 'error' : status === 'testing' ? 'warning' : 'untested';
    }
    return 'untested';
  };

  const nodes = [
    { id: 'simulator', label: 'Web Simulator', status: 'ready', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
    { id: 'port', label: 'Serial Port', status: getNodeStatus(portStatus, 'port'), icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83"/></svg> },
    { id: 'arduino', label: 'Arduino Mega', status: getNodeStatus(arduinoStatus, 'arduino'), icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 8v8M8 12h8"/></svg> },
    { id: 'esp32', label: 'ESP32 WiFi', status: getNodeStatus(cloudStatus, 'cloud'), icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/><circle cx="12" cy="20" r="1"/></svg> },
    { id: 'cloud', label: 'Cloud IoT', status: getNodeStatus(cloudStatus, 'cloud'), icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg> }
  ];

  const isConnected = (fromIdx, toIdx) => {
    return nodes[fromIdx].status === 'ready' && nodes[toIdx].status === 'ready';
  };

  const allConnected = nodes.every(n => n.status === 'ready');

  return (
    <div className="card" style={{ gridColumn: '1 / -1' }}>
      <div className="card-header">
        <h3 className="card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          Connection Pathway
        </h3>
        <div className={`status-indicator ${allConnected ? 'ready' : 'warning'}`}>
          <span className="status-indicator-icon"></span>
          {allConnected ? 'All Systems Go' : 'Setup Incomplete'}
        </div>
      </div>

      <div className="pathway-nodes">
        {nodes.map((node, index) => (
          <React.Fragment key={node.id}>
            <div className="pathway-node">
              <div className={`pathway-node-icon ${node.status}`}>{node.icon}</div>
              <span className="pathway-node-label">{node.label}</span>
              <div className={`status-indicator ${node.status}`} style={{ fontSize: '0.625rem' }}>
                <span className="status-indicator-icon"></span>
                {node.status === 'ready' ? 'OK' : node.status === 'warning' ? 'WAIT' : node.status === 'error' ? 'ERR' : '—'}
              </div>
            </div>
            {index < nodes.length - 1 && (
              <div className={`pathway-connector ${isConnected(index, index + 1) ? 'active' : ''}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {!allConnected && (
        <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
          <div style={{ fontWeight: '500', marginBottom: 'var(--space-sm)', color: 'var(--status-warning)' }}>⚠ Connection Issues Detected</div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', color: 'var(--text-secondary)' }}>
            {portStatus !== 'ready' && <li>• Serial port not connected - Select and test a USB port</li>}
            {portStatus === 'ready' && arduinoStatus !== 'ready' && <li>• Arduino not ready - Deploy bootstrap code to Arduino</li>}
            {arduinoStatus === 'ready' && cloudStatus !== 'connected' && <li>• Cloud not connected - Configure and test endpoint</li>}
          </ul>
        </div>
      )}

      {allConnected && (
        <div className="success-box">✓ Full communication pathway established. Ready to transmit vitals data!</div>
      )}
    </div>
  );
};

export default ConnectionStatus;
