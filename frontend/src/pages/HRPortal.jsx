import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Upload } from 'lucide-react';

export default function HRPortal() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Lấy danh sách nhân viên khi load trang
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/hr/employees');
        if (!response.ok) throw new Error('Failed to fetch employees');
        const data = await response.json();
        setEmployees(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Xem hồ sơ theo ID — VULNERABLE ENDPOINT (IDOR)
  const handleViewProfile = async () => {
    if (!selectedId) {
      setFetchError('Vui lòng nhập ID nhân viên');
      return;
    }

    setFetchError(null);
    setSelectedEmployee(null);

    try {
      const response = await fetch(`/api/hr/employee?id=${selectedId}`);
      if (!response.ok) throw new Error('Nhân viên không tìm thấy');
      const data = await response.json();
      setSelectedEmployee(data);
    } catch (err) {
      setFetchError(err.message);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#f0f2f5', fontFamily: 'sans-serif', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <Link to="/products" style={{ color: '#001f3f', textDecoration: 'none', fontSize: '14px' }}>
          ← Back to Products
        </Link>
        <h1 style={{ color: '#001f3f', marginTop: '10px', marginBottom: '5px' }}>HR Portal — Quản Lý Nhân Sự</h1>
        <p style={{ color: '#666', fontSize: '14px' }}>Xem hồ sơ nhân viên, quản lý tài liệu, cập nhật thông tin</p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
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
          <Users size={16} />
          HR Portal
        </div>
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
        
        {/* Section 1: Xem Hồ Sơ Theo ID */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ color: '#001f3f', fontSize: '18px', marginBottom: '15px', borderBottom: '2px solid #001f3f', paddingBottom: '10px' }}>
            🔍 Xem Hồ Sơ Nhân Viên Theo ID
          </h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              type="number"
              placeholder="Nhập ID nhân viên (ví dụ: 1, 2, 3...)"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 15px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <button
              onClick={handleViewProfile}
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
              Xem Hồ Sơ
            </button>
          </div>

          {fetchError && (
            <div style={{ padding: '10px 15px', background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '4px', marginBottom: '15px' }}>
              ⚠️ {fetchError}
            </div>
          )}

          {selectedEmployee && (
            <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '15px', background: '#f9f9f9' }}>
              <h3 style={{ color: '#001f3f', marginBottom: '10px' }}>Thông Tin Hồ Sơ</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px', fontWeight: '600', color: '#555' }}>ID:</td>
                    <td style={{ padding: '8px' }}>{selectedEmployee.id}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px', fontWeight: '600', color: '#555' }}>Tên Đầy Đủ:</td>
                    <td style={{ padding: '8px' }}>{selectedEmployee.full_name}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px', fontWeight: '600', color: '#555' }}>Phòng Ban:</td>
                    <td style={{ padding: '8px' }}>{selectedEmployee.department}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px', fontWeight: '600', color: '#555' }}>Chức Vụ:</td>
                    <td style={{ padding: '8px' }}>{selectedEmployee.position}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee', background: '#fff3cd' }}>
                    <td style={{ padding: '8px', fontWeight: '600', color: '#856404' }}>💰 Lương (tháng):</td>
                    <td style={{ padding: '8px', fontWeight: 'bold', color: '#d39e00' }}>
                      {selectedEmployee.salary ? `${selectedEmployee.salary.toLocaleString('vi-VN')} VNĐ` : 'N/A'}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px', fontWeight: '600', color: '#555' }}>Điện Thoại:</td>
                    <td style={{ padding: '8px' }}>{selectedEmployee.phone || 'N/A'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px', fontWeight: '600', color: '#555' }}>Địa Chỉ:</td>
                    <td style={{ padding: '8px' }}>{selectedEmployee.address || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', fontWeight: '600', color: '#555' }}>Ngày Vào Làm:</td>
                    <td style={{ padding: '8px' }}>{selectedEmployee.joined_date || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ marginTop: '15px', padding: '10px', background: '#e7f3ff', border: '1px solid #b3d9ff', borderRadius: '4px', fontSize: '12px', color: '#0056b3' }}>
                💡 <strong>Hint:</strong> Thử nhập ID khác nhau (1, 2, 3...) để xem lương của các nhân viên khác mà không cần xác thực quyền!
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Danh Sách Nhân Viên (Read-Only) */}
        <div>
          <h2 style={{ color: '#001f3f', fontSize: '18px', marginBottom: '15px', borderBottom: '2px solid #001f3f', paddingBottom: '10px' }}>
            📋 Danh Sách Nhân Viên
          </h2>

          {loading && <p style={{ color: '#666' }}>⏳ Đang tải danh sách...</p>}
          {error && <p style={{ color: 'red' }}>❌ Lỗi: {error}</p>}

          {!loading && !error && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ccc' }}>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#333' }}>ID</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Tên</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Phòng Ban</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Chức Vụ</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Ngày Vào Làm</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, idx) => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid #eee', background: idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                      <td style={{ padding: '10px' }}>{emp.id}</td>
                      <td style={{ padding: '10px' }}>{emp.full_name}</td>
                      <td style={{ padding: '10px' }}>{emp.department}</td>
                      <td style={{ padding: '10px' }}>{emp.position}</td>
                      <td style={{ padding: '10px' }}>{emp.joined_date || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Security Warning */}
      <div style={{ marginTop: '30px', padding: '15px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', color: '#856404', fontSize: '13px' }}>
        <strong>⚠️ IDOR Vulnerability Demo</strong>
        <p style={{ margin: '5px 0 0 0' }}>
          Tính năng "Xem Hồ Sơ Theo ID" không kiểm tra xem người dùng hiện tại có được phép xem ID đó không. Bạn có thể xem lương của bất kỳ nhân viên nào chỉ bằng cách nhập ID của họ!
        </p>
      </div>
    </div>
  );
}
