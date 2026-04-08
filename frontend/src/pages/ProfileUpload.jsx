import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, Users } from 'lucide-react';

export default function ProfileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [fileName, setFileName] = useState('');

  // Xử lý chọn file
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setUploadError(null);
      setUploadSuccess(null);
    }
  };

  // Upload file — VULNERABLE ENDPOINT (FILE UPLOAD)
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Vui lòng chọn file để upload');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadedFileUrl(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/hr/profile/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      setUploadSuccess(`File ${data.filename} uploaded successfully!`);
      setUploadedFileUrl(data.url);
      setSelectedFile(null);
      setFileName('');
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setUploadError(`Upload Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#f0f2f5', fontFamily: 'sans-serif', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <Link to="/products" style={{ color: '#001f3f', textDecoration: 'none', fontSize: '14px' }}>
          ← Back to Products
        </Link>
        <h1 style={{ color: '#001f3f', marginTop: '10px', marginBottom: '5px' }}>Profile Upload — Cập Nhật Ảnh Đại Diện</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>Upload ảnh đại diện hồ sơ nhân viên (JPG, PNG, GIF)</p>
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
        <Link
          to="/hr/documents"
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
          <FileText size={16} />
          Document Manager
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
          <Upload size={16} />
          Profile Upload
        </div>
      </div>

      {/* Main Content */}
      <div style={{ background: 'white', borderRadius: '8px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxWidth: '600px' }}>
        
        <h2 style={{ color: '#001f3f', fontSize: '18px', marginBottom: '20px', borderBottom: '2px solid #001f3f', paddingBottom: '10px' }}>
          📸 Upload Ảnh Đại Diện
        </h2>

        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
          Chọn ảnh đại diện của bạn để cập nhật hồ sơ. Hỗ trợ các định dạng: <strong>JPG, PNG, GIF</strong>
        </p>

        {/* File Input */}
        <div style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '30px',
          textAlign: 'center',
          background: '#f9f9f9',
          marginBottom: '20px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = '#001f3f';
          e.currentTarget.style.background = '#f0f5ff';
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.borderColor = '#ccc';
          e.currentTarget.style.background = '#f9f9f9';
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = '#ccc';
          e.currentTarget.style.background = '#f9f9f9';
          if (e.dataTransfer.files?.length > 0) {
            setSelectedFile(e.dataTransfer.files[0]);
            setFileName(e.dataTransfer.files[0].name);
          }
        }}
        onClick={() => document.querySelector('input[type="file"]')?.click()}
        >
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.gif"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📁</div>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: '0 0 8px 0' }}>
            Nhấp để chọn hoặc kéo file vào đây
          </p>
          <p style={{ fontSize: '13px', color: '#999', margin: '0' }}>
            Hỗ trợ: JPG, PNG, GIF (tối đa 50 MB)
          </p>
        </div>

        {/* File Name Display */}
        {fileName && (
          <div style={{
            padding: '12px 15px',
            background: '#e7f3ff',
            border: '1px solid #b3d9ff',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#0056b3',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <strong>📄 File Selected:</strong> <code style={{ fontFamily: 'monospace', background: '#fff', padding: '2px 6px', borderRadius: '3px' }}>{fileName}</code>
            </div>
            <button
              onClick={() => {
                setSelectedFile(null);
                setFileName('');
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0056b3',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              ✕ Clear
            </button>
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <div style={{
            padding: '12px 15px',
            background: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px',
          }}>
            ❌ {uploadError}
          </div>
        )}

        {/* Success Message */}
        {uploadSuccess && (
          <div style={{
            padding: '12px 15px',
            background: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px',
          }}>
            ✅ {uploadSuccess}
          </div>
        )}

        {/* Uploaded File Display */}
        {uploadedFileUrl && (
          <div style={{
            padding: '15px',
            background: '#f9f9f9',
            border: '1px solid #ddd',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            <p style={{ color: '#666', fontSize: '13px', margin: '0 0 10px 0', fontWeight: '600' }}>
              📍 File Location on Server:
            </p>
            <code style={{
              display: 'block',
              background: '#f0f0f0',
              padding: '10px',
              borderRadius: '3px',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#333',
              wordBreak: 'break-all',
              marginBottom: '10px',
            }}>
              {uploadedFileUrl}
            </code>
            <a
              href={uploadedFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                background: '#001f3f',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              🔗 View File
            </a>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          style={{
            width: '100%',
            padding: '12px',
            background: selectedFile && !uploading ? '#001f3f' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: selectedFile && !uploading ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
          }}
        >
          {uploading ? '⏳ Uploading...' : '📤 Upload Profile Picture'}
        </button>
      </div>

      {/* Additional Info Section */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{ color: '#001f3f', fontSize: '16px', marginBottom: '15px' }}>ℹ️ Thông Tin Upload</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <p style={{ color: '#555', fontSize: '14px', margin: '0 0 8px 0' }}>
            <strong>✅ Định dạng được hỗ trợ:</strong>
          </p>
          <ul style={{ margin: '0', paddingLeft: '20px', color: '#666', fontSize: '13px' }}>
            <li>JPG / JPEG</li>
            <li>PNG</li>
            <li>GIF</li>
          </ul>
        </div>

        <div style={{
          padding: '12px 15px',
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#856404',
          lineHeight: '1.6',
        }}>
          <strong>⚠️ File Upload Vulnerability Demo</strong>
          <p style={{ margin: '8px 0 0 0' }}>
            Endpoint này chỉ kiểm tra phần đuôi tên file, không kiểm tra nội dung thực. 
            Bạn có thể upload tên file <code style={{ fontFamily: 'monospace', background: '#fff8dc', padding: '2px 4px', borderRadius: '2px' }}>shell.php.jpg</code> 
            và nó sẽ được lưu với tên đó trên server!
          </p>
        </div>
      </div>

      {/* Security Warning */}
      <div style={{ marginTop: '30px', padding: '15px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', color: '#856404', fontSize: '13px' }}>
        <strong>⚠️ Insecure File Upload Vulnerability Demo</strong>
        <p style={{ margin: '5px 0 0 0', lineHeight: '1.6' }}>
          Hệ thống này chỉ kiểm tra phần mở rộng tên file (.jpg, .png, .gif) nhưng <strong>không kiểm tra nội dung thực tế</strong> của file. 
          Bạn có thể:
          <br />
          1. Rename một file PHP thành <code style={{ fontFamily: 'monospace', background: '#fff8dc', padding: '2px 4px', borderRadius: '2px' }}>malicious.php.jpg</code>
          <br />
          2. Upload file đó
          <br />
          3. Truy cập file được upload để thực thi mã arbitrary
        </p>
      </div>
    </div>
  );
}
