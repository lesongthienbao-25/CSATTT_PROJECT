import React, { useState } from 'react';
import { MessageCircle, X, Upload } from 'lucide-react';

export default function ChatModal({ isOpen, onClose }) {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [file, setFile] = useState(null);
  const [uploadResponse, setUploadResponse] = useState('');
  const [activeTab, setActiveTab] = useState('chat');

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

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '420px',
      height: '600px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 5px 40px rgba(0,0,0,0.16)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9999,
      fontFamily: 'sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#001f3f',
        color: 'white',
        borderRadius: '12px 12px 0 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageCircle size={20} />
          <span style={{ fontWeight: '600' }}>Customer Support</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '20px',
          }}
        >
          ✕
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f5f5f5',
      }}>
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            background: activeTab === 'chat' ? 'white' : 'transparent',
            borderBottom: activeTab === 'chat' ? '2px solid #001f3f' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'chat' ? '600' : '400',
          }}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            background: activeTab === 'upload' ? 'white' : 'transparent',
            borderBottom: activeTab === 'upload' ? '2px solid #001f3f' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'upload' ? '600' : '400',
          }}
        >
          Upload
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {activeTab === 'chat' && (
          <>
            <div style={{ fontSize: '12px', color: '#666' }}>
              💡 Tip: Try typing <code>../info/.employee</code> to test path traversal
            </div>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontFamily: 'sans-serif',
                boxSizing: 'border-box',
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                background: '#001f3f',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Send
            </button>
            {response && (
              <div style={{
                padding: '10px',
                background: '#f0f0f0',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#333',
                maxHeight: '250px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
              }}>
                <strong>Response:</strong>
                <pre style={{ margin: '5px 0 0 0', fontSize: '11px' }}>{response}</pre>
              </div>
            )}
          </>
        )}

        {activeTab === 'upload' && (
          <>
            <div style={{ fontSize: '12px', color: '#666' }}>
              💡 Tip: Try uploading a .php.jpg file to test extension bypass
            </div>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
              }}
            />
            <button
              onClick={uploadFile}
              style={{
                background: '#001f3f',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Upload
            </button>
            {uploadResponse && (
              <div style={{
                padding: '10px',
                background: '#f0f0f0',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#333',
              }}>
                <strong>Result:</strong> {uploadResponse}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}