import React from 'react';

const CommandsReceived = ({ commands, onAcknowledge, onSimulate }) => {
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const getPriorityColor = (command) => {
    if (command === 'ALARM' || command === 'EMERGENCY') return 'var(--status-error)';
    if (command === 'INSULIN_PUMP' || command === 'VENTILATOR') return 'var(--status-warning)';
    return 'var(--accent-secondary)';
  };

  const unacknowledgedCount = commands.filter(c => !c.acknowledged).length;

  return (
    <div className="commands-panel">
      <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-xs)' }}>Commands Received</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Cloud-to-device messages • {commands.length} total
            {unacknowledgedCount > 0 && (
              <span style={{ marginLeft: 'var(--space-sm)', color: 'var(--status-warning)', fontWeight: '500' }}>
                ({unacknowledgedCount} pending)
              </span>
            )}
          </p>
        </div>
      </div>

      {commands.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <h3 style={{ marginBottom: 'var(--space-sm)', color: 'var(--text-secondary)' }}>No Commands Received</h3>
          <p>Commands from the cloud will appear here when received.</p>
        </div>
      ) : (
        <div className="command-list">
          {commands.map((cmd) => (
            <div key={cmd.id} className={`command-item ${!cmd.acknowledged ? 'new' : ''}`} style={{ borderLeftColor: getPriorityColor(cmd.command) }}>
              <div className="command-header">
                <span className="command-type">{cmd.command}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <span className="command-time">{formatTimestamp(cmd.timestamp)}</span>
                  {!cmd.acknowledged ? (
                    <button className="btn btn-primary" onClick={() => onAcknowledge(cmd.id)} style={{ padding: '4px 12px', fontSize: '0.75rem' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                      ACK
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--status-ready)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                      Acknowledged
                    </span>
                  )}
                </div>
              </div>
              <div className="command-data">{JSON.stringify(cmd.data, null, 2)}</div>
              
              {cmd.command === 'INSULIN_PUMP' && !cmd.acknowledged && (
                <div className="warning-box" style={{ marginTop: 'var(--space-sm)' }}>
                  ⚠ Insulin delivery command - Verify patient ID before acknowledging
                </div>
              )}
              {cmd.command === 'ALARM' && !cmd.acknowledged && (
                <div className="error-box" style={{ marginTop: 'var(--space-sm)', animation: 'badge-pulse 1s ease-in-out infinite' }}>
                  🚨 URGENT: Immediate attention required
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
          Simulate Incoming Command (for testing)
        </h4>
        <div className="flex-gap">
          <button className="btn btn-secondary" onClick={() => onSimulate('INSULIN_PUMP')}>Insulin Pump</button>
          <button className="btn btn-secondary" onClick={() => onSimulate('STRETCHER_MODE')}>Stretcher Mode</button>
          <button className="btn btn-secondary" onClick={() => onSimulate('ALARM')}>Alarm</button>
          <button className="btn btn-secondary" onClick={() => onSimulate('VENTILATOR')}>Ventilator</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: 'var(--space-sm)', color: 'var(--text-secondary)' }}>
          Supported Command Types
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-sm)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div>• INSULIN_PUMP - Insulin delivery</div>
          <div>• STRETCHER_MODE - Bed positioning</div>
          <div>• ALARM - Alert notifications</div>
          <div>• VENTILATOR - Breathing support</div>
          <div>• TEMPERATURE - Climate control</div>
          <div>• MEDICATION - Drug administration</div>
        </div>
      </div>
    </div>
  );
};

export default CommandsReceived;
