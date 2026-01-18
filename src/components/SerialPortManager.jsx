import React from 'react';

const SerialPortManager = ({ serialPort, portStatus, onRequestPort, onTestPort, onClosePort, isSerialSupported }) => {
  const getStatusInfo = () => {
    switch (portStatus) {
      case 'ready': return { class: 'ready', text: 'Connected' };
      case 'busy': return { class: 'error', text: 'Port Busy' };
      case 'unreachable': return { class: 'warning', text: 'Unreachable' };
      default: return { class: 'untested', text: 'Not Tested' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          Serial Port
        </h3>
        <div className={`status-indicator ${statusInfo.class}`}>
          <span className="status-indicator-icon"></span>
          {statusInfo.text}
        </div>
      </div>

      {!isSerialSupported && (
        <div className="error-box" style={{ marginBottom: 'var(--space-md)' }}>
          ⚠️ Web Serial API not supported. Please use Chrome, Edge, or Opera.
        </div>
      )}

      <div className="input-group" style={{ marginBottom: 'var(--space-md)' }}>
        <label className="input-label">Selected Port</label>
        <div style={{ 
          background: 'var(--bg-primary)', 
          padding: 'var(--space-sm) var(--space-md)',
          borderRadius: 'var(--radius-md)',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.875rem',
          color: serialPort ? 'var(--accent-primary)' : 'var(--text-muted)'
        }}>
          {serialPort ? 'USB Serial Port Connected' : 'No port selected'}
        </div>
      </div>

      <div className="flex-gap">
        {!serialPort ? (
          <button className="btn btn-primary" onClick={onRequestPort} disabled={!isSerialSupported}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v8m-4-4h8"/>
            </svg>
            Select Port
          </button>
        ) : (
          <>
            {portStatus !== 'ready' && (
              <button className="btn btn-primary" onClick={onTestPort}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <path d="M22 4L12 14.01l-3-3"/>
                </svg>
                Test Connection
              </button>
            )}
            <button className="btn btn-danger" onClick={onClosePort}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
              Disconnect
            </button>
          </>
        )}
      </div>

      <div className="info-box">
        <strong>Note:</strong> Web Serial API requires Chrome, Edge, or Opera browser with HTTPS or localhost.
      </div>
    </div>
  );
};

export default SerialPortManager;
