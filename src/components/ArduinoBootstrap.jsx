import React from 'react';

const ArduinoBootstrap = ({ portStatus, arduinoStatus, onDeploy }) => {
  const getStatusInfo = () => {
    switch (arduinoStatus) {
      case 'ready': return { class: 'ready', text: 'Ready' };
      case 'not-ready': return { class: 'warning', text: 'Initializing' };
      case 'unreachable': return { class: 'error', text: 'Unreachable' };
      default: return { class: 'untested', text: 'Disconnected' };
    }
  };

  const statusInfo = getStatusInfo();
  const isDisabled = portStatus !== 'ready';

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M12 8v8M8 12h8"/>
            <circle cx="6" cy="8" r="1" fill="currentColor"/>
            <circle cx="18" cy="8" r="1" fill="currentColor"/>
          </svg>
          Arduino Mega
        </h3>
        <div className={`status-indicator ${statusInfo.class}`}>
          <span className="status-indicator-icon"></span>
          {statusInfo.text}
        </div>
      </div>

      <div style={{ 
        background: 'var(--bg-primary)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-md)',
        marginBottom: 'var(--space-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: arduinoStatus === 'ready' ? 'rgba(0, 212, 170, 0.15)' : 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: arduinoStatus === 'ready' ? 'var(--status-ready)' : 'var(--text-muted)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M12 8v8M8 12h8"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>Arduino Mega 2560</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ATmega2560 Microcontroller</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-sm)', fontSize: '0.75rem' }}>
          <div style={{ color: 'var(--text-muted)' }}>Baud Rate: <span style={{ color: 'var(--text-secondary)' }}>115200</span></div>
          <div style={{ color: 'var(--text-muted)' }}>Protocol: <span style={{ color: 'var(--text-secondary)' }}>JSON/Serial</span></div>
        </div>
      </div>

      <button className="btn btn-primary btn-block" onClick={onDeploy} disabled={isDisabled}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Deploy Bootstrap Code
      </button>

      {isDisabled && (
        <div style={{ marginTop: 'var(--space-sm)', fontSize: '0.75rem', color: 'var(--status-warning)', textAlign: 'center' }}>
          Connect serial port first
        </div>
      )}

      {arduinoStatus === 'ready' && (
        <div className="success-box">✓ Arduino is ready and responding to heartbeat</div>
      )}
    </div>
  );
};

export default ArduinoBootstrap;
