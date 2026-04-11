import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Upload, Shield } from 'lucide-react';

export default function ChatSupport() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [file, setFile] = useState(null);
  const [uploadResponse, setUploadResponse] = useState('');
  const [idorResponse, setIdorResponse] = useState('');

  const sendMessage = async () => {
    try {
      const res = await fetch('/api/it/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      setResponse('Error: ' + error.message);
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/it/chat/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setUploadResponse(data.message + ' - ' + data.filename);
    } catch (error) {
      setUploadResponse('Error: ' + error.message);
    }
  };

  const testIdor = async () => {
    try {
      const res = await fetch('/api/hr/employee?id=7');
      const data = await res.json();
      setIdorResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setIdorResponse('Error: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#f0f2f5', fontFamily: 'sans-serif', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <Link to="/products" style={{ color: '#001f3f', textDecoration: 'none', fontSize: '14px' }}>
          ← Back to Products
        </Link>
        <h1 style={{ color: '#001f3f', marginTop: '10px', marginBottom: '5px' }}>Chat Support</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>Support chat with vulnerability testing tools</p>
      </div>

      {/* Chat Section */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ color: '#001f3f', marginBottom: '10px' }}>Chat with Support</h2>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message (try ../info/.employee for path traversal)"
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        <button
          onClick={sendMessage}
          style={{
            background: '#001f3f',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Send Message
        </button>
        {response && (
          <div style={{ marginTop: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
            <strong>Response:</strong>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{response}</pre>
          </div>
        )}
      </div>

      {/* File Upload Section */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ color: '#001f3f', marginBottom: '10px' }}>File Upload (Vulnerable)</h2>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginBottom: '10px' }}
          />
        </div>
        <button
          onClick={uploadFile}
          style={{
            background: '#001f3f',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Upload File
        </button>
        {uploadResponse && (
          <div style={{ marginTop: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
            <strong>Upload Response:</strong> {uploadResponse}
          </div>
        )}
      </div>

      {/* IDOR Test Section */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ color: '#001f3f', marginBottom: '10px' }}>IDOR Test (View Employee Salary)</h2>
        <button
          onClick={testIdor}
          style={{
            background: '#001f3f',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Test IDOR (Get Employee ID 7 Salary)
        </button>
        {idorResponse && (
          <div style={{ marginTop: '10px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
            <strong>Employee Data:</strong>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{idorResponse}</pre>
          </div>
        )}
      </div>
    </div>
  );
}