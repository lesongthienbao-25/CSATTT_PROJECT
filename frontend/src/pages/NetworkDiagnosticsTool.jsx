import React, { useState } from 'react';
import axios from 'axios';

export default function NetworkDiagnosticsTool() {
  const [target, setTarget] = useState('');
  const [count, setCount] = useState('4');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [command, setCommand] = useState('');

  const handlePing = async () => {
    if (!target.trim()) {
      setError('Target IP or hostname is required');
      return;
    }

    setLoading(true);
    setError('');
    setOutput('');
    setCommand('');

    try {
      const { data } = await axios.post('/api/it/network/ping', {
        target: target.trim(),
      });

      setCommand(data.command || '');
      setOutput(data.output || 'No output returned.');
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || 'Request failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handlePing();
    }
  };

  return (
    <div>
      <h2 style={{ color: '#001f3f', marginBottom: '15px', fontSize: '20px' }}>🌐 Network Diagnostics</h2>
      <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
        Ping hosts and diagnose network connectivity. Test both internal and external services.
      </p>

      {/* Target Input */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>
          Target IP or Hostname
        </label>
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g. 192.168.1.1 or google.com or db or backend"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '13px',
            boxSizing: 'border-box',
            opacity: loading ? 0.6 : 1
          }}
        />
      </div>

      {/* Count Input */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>
          Ping Count
        </label>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          min="1"
          max="20"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '13px',
            boxSizing: 'border-box',
            opacity: loading ? 0.6 : 1
          }}
        />
      </div>

      {/* Ping Button */}
      <button
        onClick={handlePing}
        disabled={!target.trim() || loading}
        style={{
          background: '#001f3f',
          color: 'white',
          padding: '12px 30px',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          opacity: (!target.trim() || loading) ? 0.5 : 1
        }}
      >
        {loading ? 'Executing Ping...' : 'Execute Ping'}
      </button>

      {/* Error Display */}
      {error && (
        <div style={{
          marginTop: '15px',
          padding: '12px',
          background: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Command Display */}
      {command && (
        <div style={{
          marginTop: '15px',
          padding: '12px',
          background: '#1e1e1e',
          color: '#888',
          border: '1px solid #333',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '13px'
        }}>
          $ {command}
        </div>
      )}

      {/* Terminal Output */}
      {output && (
        <div style={{
          marginTop: '15px',
          padding: '15px',
          background: '#0d1117',
          color: '#00ff00',
          border: '1px solid #333',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px',
          minHeight: '200px',
          maxHeight: '400px',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {output}
        </div>
      )}

      {/* Placeholder Message */}
      {!output && !loading && !error && (
        <div style={{
          marginTop: '15px',
          padding: '15px',
          background: '#f0f2f5',
          color: '#666',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px',
          minHeight: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          Awaiting ping result...
        </div>
      )}

      {/* Quick Test Buttons */}
      <div style={{ marginTop: '20px', padding: '15px', background: '#f0f2f5', borderRadius: '4px' }}>
        <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '10px' }}>Quick Tests:</p>
        <button
          onClick={() => setTarget('google.com')}
          style={{
            marginRight: '10px',
            marginBottom: '5px',
            padding: '6px 12px',
            background: '#e7e7e7',
            border: '1px solid #999',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Test: google.com
        </button>
        <button
          onClick={() => setTarget('db')}
          style={{
            marginRight: '10px',
            marginBottom: '5px',
            padding: '6px 12px',
            background: '#e7e7e7',
            border: '1px solid #999',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Test: db (Internal)
        </button>
        <button
          onClick={() => setTarget('backend')}
          style={{
            marginRight: '10px',
            marginBottom: '5px',
            padding: '6px 12px',
            background: '#e7e7e7',
            border: '1px solid #999',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Test: backend (Internal)
        </button>
        <button
          onClick={() => setTarget('127.0.0.1')}
          style={{
            marginRight: '10px',
            marginBottom: '5px',
            padding: '6px 12px',
            background: '#e7e7e7',
            border: '1px solid #999',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Test: Localhost
        </button>
      </div>
    </div>
  );
}
