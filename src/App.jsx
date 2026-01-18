import React, { useState, useEffect, useRef } from 'react';
import SerialPortManager from './components/SerialPortManager';
import VitalsConfigurator from './components/VitalsConfigurator';
import ConnectionStatus from './components/ConnectionStatus';
import CloudEndpoint from './components/CloudEndpoint';
import CommandsReceived from './components/CommandsReceived';
import SystemDashboard from './components/SystemDashboard';
import ArduinoBootstrap from './components/ArduinoBootstrap';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [serialPort, setSerialPort] = useState(null);
  const [portStatus, setPortStatus] = useState('untested');
  const [arduinoStatus, setArduinoStatus] = useState('disconnected');
  const [cloudStatus, setCloudStatus] = useState('untested');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [cloudEndpoint, setCloudEndpoint] = useState('');
  const [receivedCommands, setReceivedCommands] = useState([]);
  const [vitalsConfig, setVitalsConfig] = useState({
    temperature: { enabled: true, min: 36.0, max: 38.5, current: 37.0, unit: '°C', name: 'Temperature' },
    heartRate: { enabled: true, min: 60, max: 100, current: 72, unit: 'bpm', name: 'Heart Rate' },
    bloodPressureSystolic: { enabled: true, min: 90, max: 140, current: 120, unit: 'mmHg', name: 'BP Systolic' },
    bloodPressureDiastolic: { enabled: true, min: 60, max: 90, current: 80, unit: 'mmHg', name: 'BP Diastolic' },
    respiratoryRate: { enabled: true, min: 12, max: 20, current: 16, unit: 'br/min', name: 'Respiratory Rate' },
    spO2: { enabled: true, min: 95, max: 100, current: 98, unit: '%', name: 'SpO2' },
    etCO2: { enabled: false, min: 35, max: 45, current: 40, unit: 'mmHg', name: 'End-Tidal CO2' },
    cardiacOutput: { enabled: false, min: 4.0, max: 8.0, current: 5.5, unit: 'L/min', name: 'Cardiac Output' },
    glucose: { enabled: false, min: 70, max: 140, current: 100, unit: 'mg/dL', name: 'Blood Glucose' },
  });
  const [transmissionInterval, setTransmissionInterval] = useState(1000);
  
  const writerRef = useRef(null);
  const readerRef = useRef(null);
  const transmissionRef = useRef(null);
  const heartbeatRef = useRef(null);

  // Check for Web Serial API support
  const isSerialSupported = 'serial' in navigator;

  const requestPort = async () => {
    if (!isSerialSupported) {
      alert('Web Serial API is not supported in this browser. Please use Chrome, Edge, or Opera.');
      return null;
    }
    try {
      const port = await navigator.serial.requestPort();
      setSerialPort(port);
      return port;
    } catch (error) {
      console.error('Error requesting port:', error);
      return null;
    }
  };

  const testPort = async () => {
    if (!serialPort) {
      setPortStatus('untested');
      return;
    }
    try {
      await serialPort.open({ baudRate: 115200 });
      setPortStatus('ready');
      
      const writer = serialPort.writable.getWriter();
      const reader = serialPort.readable.getReader();
      writerRef.current = writer;
      readerRef.current = reader;
      
      startReading();
    } catch (error) {
      if (error.name === 'InvalidStateError') {
        setPortStatus('busy');
      } else {
        setPortStatus('unreachable');
      }
      console.error('Port test error:', error);
    }
  };

  const closePort = async () => {
    try {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      if (transmissionRef.current) {
        clearInterval(transmissionRef.current);
        transmissionRef.current = null;
      }
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current.releaseLock();
      }
      if (writerRef.current) {
        writerRef.current.releaseLock();
      }
      if (serialPort) {
        await serialPort.close();
      }
      setPortStatus('untested');
      setArduinoStatus('disconnected');
      setSerialPort(null);
      writerRef.current = null;
      readerRef.current = null;
    } catch (error) {
      console.error('Error closing port:', error);
    }
  };

  const startReading = async () => {
    const reader = readerRef.current;
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const message = JSON.parse(line.trim());
              handleArduinoMessage(message);
            } catch (e) {
              console.log('Non-JSON message:', line);
            }
          }
        }
      }
    } catch (error) {
      console.error('Reading error:', error);
    }
  };

  const handleArduinoMessage = (message) => {
    switch (message.type) {
      case 'READY':
        setArduinoStatus('ready');
        break;
      case 'NOT_READY':
        setArduinoStatus('not-ready');
        break;
      case 'HEARTBEAT':
        setArduinoStatus('ready');
        break;
      case 'CLOUD_STATUS':
        setCloudStatus(message.status);
        break;
      case 'COMMAND':
        setReceivedCommands(prev => [{
          id: Date.now(),
          timestamp: new Date().toISOString(),
          command: message.command,
          data: message.data,
          acknowledged: false
        }, ...prev].slice(0, 100));
        break;
      case 'ERROR':
        console.error('Arduino error:', message.error);
        break;
      default:
        console.log('Unknown message type:', message);
    }
  };

  const sendToArduino = async (data) => {
    if (!writerRef.current) return false;
    try {
      const encoder = new TextEncoder();
      const message = JSON.stringify(data) + '\n';
      await writerRef.current.write(encoder.encode(message));
      return true;
    } catch (error) {
      console.error('Send error:', error);
      return false;
    }
  };

  const deployBootstrap = async () => {
    const bootstrapConfig = {
      type: 'BOOTSTRAP',
      cloudEndpoint: cloudEndpoint,
      timestamp: Date.now()
    };
    const success = await sendToArduino(bootstrapConfig);
    if (success) {
      setArduinoStatus('not-ready');
    }
  };

  const testCloudEndpoint = async () => {
    const testMessage = {
      type: 'TEST_CLOUD',
      endpoint: cloudEndpoint
    };
    await sendToArduino(testMessage);
    setCloudStatus('testing');
  };

  const startTransmission = () => {
    if (transmissionRef.current) return;
    
    setIsTransmitting(true);
    transmissionRef.current = setInterval(() => {
      const vitalsData = {
        type: 'VITALS',
        timestamp: Date.now(),
        data: {}
      };
      
      Object.entries(vitalsConfig).forEach(([key, config]) => {
        if (config.enabled) {
          vitalsData.data[key] = {
            value: config.current,
            unit: config.unit,
            min: config.min,
            max: config.max
          };
        }
      });
      
      sendToArduino(vitalsData);
    }, transmissionInterval);
  };

  const stopTransmission = () => {
    if (transmissionRef.current) {
      clearInterval(transmissionRef.current);
      transmissionRef.current = null;
    }
    setIsTransmitting(false);
    sendToArduino({ type: 'STOP_TRANSMISSION' });
  };

  // Heartbeat validation every 500ms
  useEffect(() => {
    if (portStatus === 'ready' && arduinoStatus !== 'disconnected') {
      heartbeatRef.current = setInterval(async () => {
        const success = await sendToArduino({ type: 'HEARTBEAT' });
        if (!success) {
          setArduinoStatus('unreachable');
        }
      }, 500);
    }
    
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [portStatus, arduinoStatus]);

  useEffect(() => {
    return () => {
      if (transmissionRef.current) {
        clearInterval(transmissionRef.current);
      }
      closePort();
    };
  }, []);

  const acknowledgeCommand = (commandId) => {
    setReceivedCommands(prev => 
      prev.map(cmd => 
        cmd.id === commandId ? { ...cmd, acknowledged: true } : cmd
      )
    );
    sendToArduino({ type: 'ACK', commandId });
  };

  const simulateCommand = (type) => {
    const commandData = {
      INSULIN_PUMP: { action: 'deliver', units: 5.0, patientId: 'P12345' },
      STRETCHER_MODE: { position: 'elevated', angle: 30 },
      ALARM: { level: 'critical', message: 'Immediate attention required' },
      VENTILATOR: { mode: 'assist', rate: 14, volume: 500 }
    };
    
    setReceivedCommands(prev => [{
      id: Date.now(),
      timestamp: new Date().toISOString(),
      command: type,
      data: commandData[type] || {},
      acknowledged: false
    }, ...prev].slice(0, 100));
  };

  const isSystemReady = portStatus === 'ready' && arduinoStatus === 'ready' && cloudStatus === 'connected';

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg viewBox="0 0 40 40" fill="none">
                <rect x="2" y="2" width="36" height="36" rx="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M20 8v24M8 20h24" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="20" cy="20" r="6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="logo-text">
              <h1>MedSim Pro</h1>
              <span className="subtitle">Patient Monitoring Simulator</span>
            </div>
          </div>
          <div className="system-status-indicator">
            <span className={`status-dot ${isSystemReady ? 'active' : 'inactive'}`}></span>
            <span className="status-text">{isSystemReady ? 'System Ready' : 'Setup Required'}</span>
          </div>
        </div>
      </header>

      <nav className="tab-navigation">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
          { id: 'connection', label: 'Connection', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> },
          { id: 'vitals', label: 'Vitals Config', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
          { id: 'commands', label: 'Commands', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>, badge: receivedCommands.filter(c => !c.acknowledged).length }
        ].map(tab => (
          <button 
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
            {tab.badge > 0 && <span className="notification-badge">{tab.badge}</span>}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <SystemDashboard
            portStatus={portStatus}
            arduinoStatus={arduinoStatus}
            cloudStatus={cloudStatus}
            isTransmitting={isTransmitting}
            vitalsConfig={vitalsConfig}
            cloudEndpoint={cloudEndpoint}
            isSerialSupported={isSerialSupported}
          />
        )}

        {activeTab === 'connection' && (
          <div className="connection-panel">
            <div className="panel-grid">
              <SerialPortManager
                serialPort={serialPort}
                portStatus={portStatus}
                onRequestPort={requestPort}
                onTestPort={testPort}
                onClosePort={closePort}
                isSerialSupported={isSerialSupported}
              />
              
              <ArduinoBootstrap
                portStatus={portStatus}
                arduinoStatus={arduinoStatus}
                onDeploy={deployBootstrap}
              />
              
              <CloudEndpoint
                endpoint={cloudEndpoint}
                setEndpoint={setCloudEndpoint}
                cloudStatus={cloudStatus}
                onTest={testCloudEndpoint}
                disabled={arduinoStatus !== 'ready'}
              />
              
              <ConnectionStatus
                portStatus={portStatus}
                arduinoStatus={arduinoStatus}
                cloudStatus={cloudStatus}
              />
            </div>
          </div>
        )}

        {activeTab === 'vitals' && (
          <VitalsConfigurator
            vitalsConfig={vitalsConfig}
            setVitalsConfig={setVitalsConfig}
            transmissionInterval={transmissionInterval}
            setTransmissionInterval={setTransmissionInterval}
            isTransmitting={isTransmitting}
            onStartTransmission={startTransmission}
            onStopTransmission={stopTransmission}
            isSystemReady={isSystemReady}
          />
        )}

        {activeTab === 'commands' && (
          <CommandsReceived
            commands={receivedCommands}
            onAcknowledge={acknowledgeCommand}
            onSimulate={simulateCommand}
          />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <span>MedSim Pro v1.0</span>
          <span className="separator">|</span>
          <span>Hospital Patient Monitoring Simulator</span>
          <span className="separator">|</span>
          <span className={`connection-info ${isSystemReady ? 'ready' : ''}`}>
            {isTransmitting ? `Transmitting @ ${transmissionInterval}ms` : 'Idle'}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
