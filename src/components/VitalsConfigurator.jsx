import React from 'react';

const VitalsConfigurator = ({
  vitalsConfig,
  setVitalsConfig,
  transmissionInterval,
  setTransmissionInterval,
  isTransmitting,
  onStartTransmission,
  onStopTransmission,
  isSystemReady
}) => {
  const updateVital = (key, field, value) => {
    setVitalsConfig(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const toggleVital = (key) => {
    updateVital(key, 'enabled', !vitalsConfig[key].enabled);
  };

  const handleCurrentChange = (key, value) => {
    const config = vitalsConfig[key];
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      updateVital(key, 'current', Math.min(Math.max(numValue, config.min), config.max));
    }
  };

  const randomizeValue = (key) => {
    const config = vitalsConfig[key];
    const range = config.max - config.min;
    const precision = config.unit === '°C' || config.unit === 'L/min' ? 1 : 0;
    updateVital(key, 'current', parseFloat((config.min + Math.random() * range).toFixed(precision)));
  };

  const randomizeAll = () => {
    Object.keys(vitalsConfig).forEach(key => {
      if (vitalsConfig[key].enabled) randomizeValue(key);
    });
  };

  const enabledCount = Object.values(vitalsConfig).filter(v => v.enabled).length;

  return (
    <div className="vitals-configurator">
      <div className="flex-between" style={{ marginBottom: 'var(--space-lg)' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--space-xs)' }}>Vitals Configuration</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Configure simulated patient vital signs • {enabledCount} vitals enabled</p>
        </div>
        <button className="btn btn-secondary" onClick={randomizeAll}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
          </svg>
          Randomize All
        </button>
      </div>

      <div className="vitals-grid">
        {Object.entries(vitalsConfig).map(([key, config]) => (
          <div key={key} className={`vital-card ${config.enabled ? 'enabled' : ''}`}>
            <div className="vital-card-header">
              <span className="vital-name">{config.name}</span>
              <label className="vital-toggle">
                <input type="checkbox" checked={config.enabled} onChange={() => toggleVital(key)} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {config.enabled && (
              <>
                <div className="vital-value">
                  <input
                    type="number"
                    value={config.current}
                    onChange={(e) => handleCurrentChange(key, e.target.value)}
                    style={{
                      background: 'transparent', border: 'none',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '1.75rem', fontWeight: '600',
                      color: 'var(--accent-primary)', width: '100%',
                      textAlign: 'center', outline: 'none'
                    }}
                    step={config.unit === '°C' || config.unit === 'L/min' ? 0.1 : 1}
                  />
                  <span className="unit">{config.unit}</span>
                </div>

                <div className="vital-range">
                  <span>{config.min}</span>
                  <input
                    type="range"
                    className="range-slider"
                    min={config.min}
                    max={config.max}
                    step={config.unit === '°C' || config.unit === 'L/min' ? 0.1 : 1}
                    value={config.current}
                    onChange={(e) => handleCurrentChange(key, e.target.value)}
                  />
                  <span>{config.max}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-md)', gap: 'var(--space-sm)' }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Min</label>
                    <input type="number" className="input-field" value={config.min} onChange={(e) => updateVital(key, 'min', parseFloat(e.target.value))} style={{ fontSize: '0.75rem', padding: '4px 8px' }} />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label">Max</label>
                    <input type="number" className="input-field" value={config.max} onChange={(e) => updateVital(key, 'max', parseFloat(e.target.value))} style={{ fontSize: '0.75rem', padding: '4px 8px' }} />
                  </div>
                  <button className="btn btn-secondary" onClick={() => randomizeValue(key)} style={{ alignSelf: 'flex-end', padding: '6px' }} title="Randomize">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <path d="M23 4v6h-6M1 20v-6h6"/>
                    </svg>
                  </button>
                </div>
              </>
            )}

            {!config.enabled && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-lg)', fontSize: '0.875rem' }}>
                Disabled
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="transmission-controls">
        <div className="interval-control">
          <span className="interval-label">Transmission Interval:</span>
          <input
            type="range"
            className="range-slider"
            min={100}
            max={5000}
            step={100}
            value={transmissionInterval}
            onChange={(e) => setTransmissionInterval(parseInt(e.target.value))}
            disabled={isTransmitting}
            style={{ width: '200px' }}
          />
          <span className="interval-value">{transmissionInterval}ms</span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
          {isTransmitting && (
            <div className="live-indicator">
              <span className="status-dot active"></span>
              TRANSMITTING
            </div>
          )}
          
          {!isTransmitting ? (
            <button className="btn btn-primary btn-lg" onClick={onStartTransmission} disabled={!isSystemReady}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Start Transmission
            </button>
          ) : (
            <button className="btn btn-danger btn-lg" onClick={onStopTransmission}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="6" width="12" height="12"/>
              </svg>
              Stop Transmission
            </button>
          )}
        </div>
      </div>

      {!isSystemReady && (
        <div className="warning-box">⚠ Complete the connection setup before starting transmission</div>
      )}
    </div>
  );
};

export default VitalsConfigurator;
