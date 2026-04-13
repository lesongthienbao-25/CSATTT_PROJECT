import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, Upload, Users } from 'lucide-react';

export default function DocumentManager() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customFilename, setCustomFilename] = useState('');
  const [downloadError, setDownloadError] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(null);

  // Lấy danh sách tài liệu từ API
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('/api/hr/documents');
        if (!response.ok) throw new Error('Failed to fetch documents');
        const data = await response.json();
        setDocuments(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Tải xuống tài liệu — VULNERABLE ENDPOINT (PATH TRAVERSAL)
  const handleDownload = async (filename) => {
    setDownloadError(null);
    setDownloadSuccess(null);

    try {
      const response = await fetch(`/api/hr/documents/download?filename=${encodeURIComponent(filename)}`);
      
      if (!response.ok) {
        throw new Error('Tệp không tìm thấy');
      }

      // Tạo blob URL để tải file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      setDownloadSuccess(`Tải xuống ${filename} thành công!`);
    } catch (err) {
      setDownloadError(`Lỗi: ${err.message}`);
    }
  };

  // Tải xuống file tùy chỉ (Path Traversal exploit)
  const handleCustomDownload = () => {
    if (!customFilename) {
      setDownloadError('Vui lòng nhập tên file');
      return;
    }
    handleDownload(customFilename);
  };

  return (
    <div style={{ padding: '20px', background: '#f0f2f5', fontFamily: 'sans-serif', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <Link to="/products" style={{ color: '#001f3f', textDecoration: 'none', fontSize: '14px' }}>
          ← Back to Products
        </Link>
        <h1 style={{ color: '#001f3f', marginTop: '10px', marginBottom: '5px' }}>Document Manager — Quản Lý Tài Liệu</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>Tải xuống và quản lý tài liệu nội bộ NexTrade</p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <Link
          to="/hr"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#e7e7e7',
            color: '#001f3f',
            padding: '10px 18px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          <Users size={16} />
          HR Portal
        </Link>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#001f3f',
            color: 'white',
            padding: '10px 18px',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          <FileText size={16} />
          Document Manager
        </div>
        <Link
          to="/hr/profile-upload"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#e7e7e7',
            color: '#001f3f',
            padding: '10px 18px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          <Upload size={16} />
          Profile Upload
        </Link>
      </div>

      {/* Main Content */}
      <div style={{ background: 'white', borderRadius: '8px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        
        {/* Section 1: Tài Liệu Danh Sách */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#001f3f', fontSize: '18px', marginBottom: '15px', borderBottom: '2px solid #001f3f', paddingBottom: '10px' }}>
            📚 Tài Liệu Nội Bộ
          </h2>

          {loading && <p style={{ color: '#666' }}>⏳ Đang tải danh sách...</p>}
          {error && <p style={{ color: 'red' }}>❌ Lỗi: {error}</p>}

          {!loading && !error && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ccc' }}>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Tên Tài Liệu</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Tên File</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Phòng Ban</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Mức Truy Cập</th>
                    <th style={{ padding: '10px', textAlign: 'center', fontWeight: '600', color: '#333' }}>Tác Vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee', background: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                      <td style={{ padding: '10px' }}>{doc.name}</td>
                      <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '12px', color: '#666' }}>
                        {doc.filename}
                      </td>
                      <td style={{ padding: '10px' }}>{doc.department}</td>
                      <td style={{ padding: '10px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            background: doc.access_level === 'public' ? '#d4edda' : '#cfe2ff',
                            color: doc.access_level === 'public' ? '#155724' : '#084298',
                            borderRadius: '3px',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          {doc.access_level}
                        </span>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDownload(doc.filename)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: '#001f3f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          <Download size={14} />
                          Tải
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: Tải Xuống File Tùy Chỉ (Path Traversal Exploit) */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#001f3f', fontSize: '18px', marginBottom: '15px', borderBottom: '2px solid #001f3f', paddingBottom: '10px' }}>
            🔧 Tải Xuống File Tùy Chỉ
          </h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
            Nhập tên file bất kỳ để tải xuống (bao gồm cả đường dẫn):
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Ví dụ: policy.pdf hoặc ../secrets/.env"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 15px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace',
              }}
            />
            <button
              onClick={handleCustomDownload}
              style={{
                padding: '10px 20px',
                background: '#001f3f',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Tải Xuống
            </button>
          </div>

          {downloadError && (
            <div style={{
              padding: '10px 15px',
              background: '#f8d7da',
              color: '#721c24',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              marginBottom: '15px',
              fontSize: '14px',
            }}>
              ❌ {downloadError}
            </div>
          )}

          {downloadSuccess && (
            <div style={{
              padding: '10px 15px',
              background: '#d4edda',
              color: '#155724',
              border: '1px solid #c3e6cb',
              borderRadius: '4px',
              marginBottom: '15px',
              fontSize: '14px',
            }}>
              ✅ {downloadSuccess}
            </div>
          )}

          <div style={{
            padding: '12px 15px',
            background: '#e7f3ff',
            border: '1px solid #b3d9ff',
            borderRadius: '4px',
            fontSize: '13px',
            color: '#0056b3',
            lineHeight: '1.6',
          }}>
            <strong>💡 Path Traversal Hint:</strong>
            <p style={{ margin: '8px 0 0 0' }}>
              Hệ thống không lọc ký tự <code style={{ fontFamily: 'monospace', background: '#f0f0f0', padding: '2px 4px', borderRadius: '2px' }}>../</code> trong tên file. <br />
              Thử nhập <code style={{ fontFamily: 'monospace', background: '#f0f0f0', padding: '2px 4px', borderRadius: '2px' }}>../secrets/.env</code> để lấy file credentials!
            </p>
          </div>
        </div>
      </div>

      {/* Security Warning */}
      <div style={{ marginTop: '30px', padding: '15px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', color: '#856404', fontSize: '13px' }}>
        <strong>⚠️ Path Traversal Vulnerability Demo</strong>
        <p style={{ margin: '5px 0 0 0' }}>
          Endpoint tải file không kiểm tra hoặc xác thực tên file. Bạn có thể sử dụng <code style={{ fontFamily: 'monospace', background: '#fff8dc', padding: '2px 4px', borderRadius: '2px' }}>../</code> để truy cập các file bên ngoài thư mục được phép!
        </p>
      </div>
    </div>
  );
}
