import React, { useState } from 'react';
import axios from 'axios';

export default function WebhookTesterTool() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTest = async () => {
    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const { data } = await axios.post('/api/it/webhook-tester', {
        url: url.trim(),
        method: method.toUpperCase(),
        body: body.trim(),
      });
      setResponse(data);
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || 'Request failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleTest();
    }
  };

  return (
    <div>
      <h2 style={{ color: '#001f3f', marginBottom: '15px', fontSize: '20px' }}>🔗 Webhook Tester</h2>
      <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
        Test webhook endpoints and HTTP requests. Simulate GET/POST requests to any URL.
      </p>

      {/* URL Input */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>
          Target URL
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="https://example.com/api/webhook or http://internal-service:8000/api"
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

      {/* Method Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>
            HTTP Method
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '13px',
              opacity: loading ? 0.6 : 1
            }}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>
      </div>

      {/* Request Body */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>
          Request Body (Optional - for POST)
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder='{"key": "value"}'
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            minHeight: '100px',
            boxSizing: 'border-box',
            opacity: loading ? 0.6 : 1
          }}
        />
      </div>

      {/* Send Button */}
      <button
        onClick={handleTest}
        disabled={!url.trim() || loading}
        style={{
          background: '#001f3f',
          color: 'white',
          padding: '12px 30px',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          opacity: (!url.trim() || loading) ? 0.5 : 1
        }}
      >
        {loading ? 'Testing...' : 'Send Request'}
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

      {/* Response Display */}
      {response && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: '#001f3f', marginBottom: '10px' }}>Response</h3>

          {/* Status Code */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>
              Status Code
            </label>
            <div style={{
              padding: '10px',
              background: response.status_code >= 200 && response.status_code < 300 ? '#d4edda' : '#f8d7da',
              border: `1px solid ${response.status_code >= 200 && response.status_code < 300 ? '#c3e6cb' : '#f5c6cb'}`,
              borderRadius: '4px',
              color: response.status_code >= 200 && response.status_code < 300 ? '#155724' : '#721c24',
              fontFamily: 'monospace',
              fontWeight: 'bold'
            }}>
              {response.status_code}
            </div>
          </div>

          {/* Headers */}
          {response.headers && Object.keys(response.headers).length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>
                Response Headers
              </label>
              <div style={{
                padding: '10px',
                background: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '4px',
                maxHeight: '150px',
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '11px'
              }}>
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: '5px' }}>
                    <strong>{key}:</strong> {String(value).substring(0, 100)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Response Body */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>
              Response Body
            </label>
            <div style={{
              padding: '12px',
              background: '#1e1e1e',
              color: '#00ff00',
              border: '1px solid #333',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              maxHeight: '300px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {response.body}
            </div>
          </div>
        </div>
      )}

      {/* Quick Test Links */}
      <div style={{ marginTop: '20px', padding: '15px', background: '#f0f2f5', borderRadius: '4px' }}>
        <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', marginBottom: '10px' }}>Quick Tests:</p>
        <button
          onClick={() => setUrl('http://localhost:8000/api/health')}
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
          Test: Local API
        </button>
        <button
          onClick={() => setUrl('http://db:5432')}
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
          Test: Internal DB
        </button>
      </div>
    </div>
  );
}
