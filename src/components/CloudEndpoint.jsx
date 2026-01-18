import React, { useState } from 'react';

const CloudEndpoint = ({ endpoint, setEndpoint, cloudStatus, onTest, disabled }) => {
  const [protocol, setProtocol] = useState('mqtt');

  const getStatusInfo = () => {
    switch (cloudStatus) {
      case 'connected': return { class: 'ready', text: 'Connected' };
      case 'testing': return { class: 'warning', text: 'Testing...' };
      case 'error': return { class: 'error', text: 'Error' };
      case 'disconnected': return { class: 'error', text: 'Disconnected' };
      default: return { class: 'untested', text: 'Not Tested' };
    }
  };

  const statusInfo = getStatusInfo();

  const cloudProviders = [
    { name: 'AWS IoT', example: 'xxxxx.iot.region.amazonaws.com' },
    { name: 'Azure IoT', example: 'xxxxx.azure-devices.net' },
    { name: 'Google IoT', example: 'mqtt.googleapis.com' },
    { name: 'Custom', example: 'broker.example.com:8883' }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
          </svg>
          Cloud Endpoint
        </h3>
        <div className={`status-indicator ${statusInfo.class}`}>
          <span className="status-indicator-icon"></span>
          {statusInfo.text}
        </div>
      </div>

      <div className="input-group" style={{ marginBottom: 'var(--space-md)' }}>
        <label className="input-label">Protocol</label>
        <select className="input-field" value={protocol} onChange={(e) => setProtocol(e.target.value)} disabled={disabled}>
          <option value="mqtt">MQTT/MQTTS</option>
          <option value="https">HTTPS REST API</option>
          <option value="websocket">WebSocket</option>
        </select>
      </div>

      <div className="input-group" style={{ marginBottom: 'var(--space-md)' }}>
        <label className="input-label">Endpoint URL</label>
        <input
          type="text"
          className="input-field"
          placeholder="iot-endpoint.cloud-provider.com"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div style={{ marginBottom: 'var(--space-md)' }}>
        <label className="input-label" style={{ marginBottom: 'var(--space-sm)', display: 'block' }}>Quick Select Provider</label>
        <div className="flex-gap">
          {cloudProviders.map((provider) => (
            <button
              key={provider.name}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              onClick={() => setEndpoint(provider.example)}
              disabled={disabled}
            >
              {provider.name}
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn-primary btn-block" onClick={onTest} disabled={disabled || !endpoint}>
        {cloudStatus === 'testing' ? (
          <>
            <svg className="spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Testing Connection...
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <path d="M22 4L12 14.01l-3-3"/>
            </svg>
            Test Endpoint
          </>
        )}
      </button>

      {disabled && (
        <div style={{ marginTop: 'var(--space-sm)', fontSize: '0.75rem', color: 'var(--status-warning)', textAlign: 'center' }}>
          Arduino must be ready before testing cloud connection
        </div>
      )}

      {cloudStatus === 'connected' && (
        <div className="success-box">✓ Cloud endpoint verified and reachable via ESP32</div>
      )}
    </div>
  );
};

export default CloudEndpoint;
