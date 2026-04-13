import React, { useState } from 'react';
import axios from 'axios';

export default function ReportGeneratorTool() {
  const [template, setTemplate] = useState('Hello {{name}}!');
  const [context, setContext] = useState('{"name": "Admin"}');
  const [rendered, setRendered] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!template.trim()) {
      setError('Template is required');
      return;
    }

    setLoading(true);
    setError('');
    setRendered('');

    let contextObj = {};
    if (context.trim()) {
      try {
        contextObj = JSON.parse(context);
      } catch (err) {
        setError(`Invalid JSON in Context: ${err.message}`);
        setLoading(false);
        return;
      }
    }

    try {
      const { data } = await axios.post('/api/it/reports/generate', {
        template: template.trim(),
        context: contextObj,
      });
      setRendered(data.rendered || '');
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || 'Request failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleGenerate();
    }
  };

  const loadTemplate = (templateName) => {
    const templates = {
      simple: 'Hello {{name}}!',
      invoice: `Invoice for {{customer_name}}
Amount: ${{amount}}
Date: {{date}}
Status: {{status}}`,
      table: `{% for item in items %}• {{item}}
{% endfor %}`,
      conditional: `Welcome {{username}}!
{% if is_admin %}You have admin privileges{% else %}You are a regular user{% endif %}`
    };
    setTemplate(templates[templateName] || '');
  };

  const loadContext = (contextName) => {
    const contexts = {
      simple: '{"name": "NexTrade"}',
      invoice: '{"customer_name": "ACME Corp", "amount": 50000, "date": "2025-04-07", "status": "Paid"}',
      table: '{"items": ["Server", "Database", "Network"]}',
      conditional: '{"username": "Admin", "is_admin": true}'
    };
    setContext(contexts[contextName] || '');
  };

  return (
    <div>
      <h2 style={{ color: '#001f3f', marginBottom: '15px', fontSize: '20px' }}>📊 Report Generator</h2>
      <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
        Generate dynamic reports using Jinja2 template syntax. Perfect for automation scripts and report generation.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Column: Inputs */}
        <div>
          {/* Template Input */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>
              Template (Jinja2)
            </label>
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Hello {{name}}!&#10;{% for item in items %}• {{item}}&#10;{% endfor %}"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace',
                minHeight: '150px',
                boxSizing: 'border-box',
                opacity: loading ? 0.6 : 1
              }}
            />
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
              <button
                onClick={() => loadTemplate('simple')}
                style={{ marginRight: '5px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', background: '#e7e7e7', border: '1px solid #999', borderRadius: '2px' }}
              >
                Simple
              </button>
              <button
                onClick={() => loadTemplate('invoice')}
                style={{ marginRight: '5px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', background: '#e7e7e7', border: '1px solid #999', borderRadius: '2px' }}
              >
                Invoice
              </button>
              <button
                onClick={() => loadTemplate('table')}
                style={{ marginRight: '5px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', background: '#e7e7e7', border: '1px solid #999', borderRadius: '2px' }}
              >
                Loop
              </button>
              <button
                onClick={() => loadTemplate('conditional')}
                style={{ padding: '3px 8px', fontSize: '11px', cursor: 'pointer', background: '#e7e7e7', border: '1px solid #999', borderRadius: '2px' }}
              >
                Conditional
              </button>
            </div>
          </div>

          {/* Context Input */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>
              Context (JSON)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='{"name": "Admin", "items": ["Item1", "Item2"]}'
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace',
                minHeight: '150px',
                boxSizing: 'border-box',
                opacity: loading ? 0.6 : 1
              }}
            />
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#666' }}>
              <button
                onClick={() => loadContext('simple')}
                style={{ marginRight: '5px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', background: '#e7e7e7', border: '1px solid #999', borderRadius: '2px' }}
              >
                Simple
              </button>
              <button
                onClick={() => loadContext('invoice')}
                style={{ marginRight: '5px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', background: '#e7e7e7', border: '1px solid #999', borderRadius: '2px' }}
              >
                Invoice
              </button>
              <button
                onClick={() => loadContext('table')}
                style={{ marginRight: '5px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer', background: '#e7e7e7', border: '1px solid #999', borderRadius: '2px' }}
              >
                Loop
              </button>
              <button
                onClick={() => loadContext('conditional')}
                style={{ padding: '3px 8px', fontSize: '11px', cursor: 'pointer', background: '#e7e7e7', border: '1px solid #999', borderRadius: '2px' }}
              >
                Conditional
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!template.trim() || loading}
            style={{
              width: '100%',
              background: '#001f3f',
              color: 'white',
              padding: '12px',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              opacity: (!template.trim() || loading) ? 0.5 : 1
            }}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        {/* Right Column: Output */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>
            Rendered Output
          </label>

          {error && (
            <div style={{
              padding: '12px',
              background: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              color: '#721c24',
              marginBottom: '10px',
              fontSize: '12px'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          <div style={{
            padding: '12px',
            background: '#1e1e1e',
            color: '#00ff00',
            border: '1px solid #333',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '12px',
            minHeight: '320px',
            maxHeight: '320px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {rendered || (
              <span style={{ color: '#666' }}>Your rendered report will appear here...</span>
            )}
          </div>

          {rendered && (
            <button
              onClick={() => {
                const element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(rendered));
                element.setAttribute('download', 'report.txt');
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              style={{
                marginTop: '10px',
                width: '100%',
                padding: '8px',
                background: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ⬇️ Download Report
            </button>
          )}
        </div>
      </div>

      {/* Reference Section */}
      <div style={{ marginTop: '20px', padding: '15px', background: '#f0f2f5', borderRadius: '4px', fontSize: '12px' }}>
        <strong style={{ color: '#001f3f' }}>Jinja2 Syntax Reference:</strong>
        <p style={{ margin: '8px 0', color: '#666' }}>
          Variables: <code style={{ background: '#ddd', padding: '2px 4px' }}>{'{{name}}'}</code> | 
          Loops: <code style={{ background: '#ddd', padding: '2px 4px' }}>{'{% for item in items %}'}</code> | 
          Conditionals: <code style={{ background: '#ddd', padding: '2px 4px' }}>{'{% if condition %}'}</code>
        </p>
      </div>
    </div>
  );
}
