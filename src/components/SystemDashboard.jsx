import React from 'react';

const SystemDashboard = ({ portStatus, arduinoStatus, cloudStatus, isTransmitting, vitalsConfig, cloudEndpoint, isSerialSupported }) => {
  const enabledVitals = Object.entries(vitalsConfig).filter(([_, v]) => v.enabled);
  
  const getOverallStatus = () => {
    if (portStatus === 'ready' && arduinoStatus === 'ready' && cloudStatus === 'connected') {
      return { status: 'operational', label: 'All Systems Operational', color: 'var(--status-ready)' };
    }
    if (portStatus === 'ready' && arduinoStatus === 'ready') {
      return { status: 'partial', label: 'Partial Connection', color: 'var(--status-warning)' };
    }
    return { status: 'offline', label: 'System Offline', color: 'var(--status-error)' };
  };

  const systemStatus = getOverallStatus();

  return (
    <div className="dashboard">
      {!isSerialSupported && (
        <div className="error-box" style={{ marginBottom: 'var(--space-lg)' }}>
          ⚠️ Web Serial API is not supported in this browser. Please use <strong>Chrome</strong>, <strong>Edge</strong>, or <strong>Opera</strong> for full functionality.
        </div>
      )}

      <div className="card" style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
          <div style={{
            width: '16px', height: '16px', borderRadius: '50%',
            background: systemStatus.color,
            boxShadow: `0 0 20px ${systemStatus.color}`,
            animation: systemStatus.status === 'operational' ? 'pulse-glow 2s ease-in-out infinite' : 'none'
          }}></div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{systemStatus.label}</h2>
        </div>
        
        {isTransmitting && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-sm)',
            padding: 'var(--space-sm) var(--space-md)',
            background: 'rgba(0, 212, 170, 0.15)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--status-ready)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.875rem'
          }}>
            <span className="status-dot active"></span>
            LIVE DATA TRANSMISSION
          </div>
        )}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <svg className="dashboard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
          </svg>
          <div className="dashboard-value" style={{ color: portStatus === 'ready' ? 'var(--status-ready)' : 'var(--text-muted)' }}>
            {portStatus === 'ready' ? 'CONNECTED' : 'OFFLINE'}
          </div>
          <div className="dashboard-label">Web Simulator</div>
        </div>

        <div className="dashboard-card">
          <svg className="dashboard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 8v8M8 12h8"/>
          </svg>
          <div className="dashboard-value" style={{ color: arduinoStatus === 'ready' ? 'var(--status-ready)' : 'var(--text-muted)' }}>
            {arduinoStatus === 'ready' ? 'READY' : arduinoStatus.toUpperCase().replace('-', ' ')}
          </div>
          <div className="dashboard-label">Arduino Mega</div>
        </div>

        <div className="dashboard-card">
          <svg className="dashboard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
          </svg>
          <div className="dashboard-value" style={{ color: cloudStatus === 'connected' ? 'var(--status-ready)' : 'var(--text-muted)' }}>
            {cloudStatus === 'connected' ? 'ONLINE' : cloudStatus.toUpperCase()}
          </div>
          <div className="dashboard-label">Cloud IoT</div>
        </div>

        <div className="dashboard-card">
          <svg className="dashboard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <div className="dashboard-value">{enabledVitals.length}</div>
          <div className="dashboard-label">Active Vitals</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            Live Vitals Monitor
          </h3>
          {isTransmitting && (
            <div className="live-indicator">
              <span className="status-dot active"></span>
              TRANSMITTING
            </div>
          )}
        </div>
        
        {enabledVitals.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-xl)' }}>
            No vitals enabled. Configure vitals in the Vitals Config tab.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--space-md)' }}>
            {enabledVitals.map(([key, config]) => (
              <div key={key} style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--space-xs)', textTransform: 'uppercase' }}>
                  {config.name}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.5rem', fontWeight: '600', color: isTransmitting ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                  {config.current}
                  <span style={{ fontSize: '0.75rem', marginLeft: '4px', color: 'var(--text-muted)' }}>{config.unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 'var(--space-lg)' }}>
        <div className="card-header">
          <h3 className="card-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>
            Cloud Configuration
          </h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--space-xs)' }}>Endpoint</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.875rem', color: cloudEndpoint ? 'var(--text-primary)' : 'var(--text-muted)', wordBreak: 'break-all' }}>
              {cloudEndpoint || 'Not configured'}
            </div>
          </div>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--space-xs)' }}>Protocol</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.875rem', color: 'var(--text-primary)' }}>MQTT over TLS</div>
          </div>
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--space-xs)' }}>Payload Format</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.875rem', color: 'var(--text-primary)' }}>JSON</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemDashboard;
