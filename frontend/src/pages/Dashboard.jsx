import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div style={{ fontFamily: 'Segoe UI', color: '#2c3e50' }}>
      <h2>Chào mừng đến với NexTrade Internal Portal</h2>
      <p>Đây là trang điều khiển chính. Dùng menu bên trái để chuyển đến các bài tập bảo mật HR.</p>
      <ul>
        <li><Link to="/hr">HR Portal (IDOR)</Link></li>
        <li><Link to="/documents">Document Manager (Path Traversal)</Link></li>
        <li><Link to="/upload">Profile Upload (File Upload)</Link></li>
      </ul>
      <div style={{ marginTop: '24px', padding: '16px', background: '#f0f8ff', borderRadius: '8px' }}>
        <h3>Hướng dẫn test nhanh</h3>
        <ol>
          <li>Vào <Link to="/hr">HR Portal</Link>, nhập ID khác và click xem.</li>
          <li>Vào <Link to="/documents">Document Manager</Link>, nhập <code>../../secrets/.env</code>.</li>
          <li>Vào <Link to="/upload">Profile Upload</Link>, upload file <code>evil.php.jpg</code>.</li>
        </ol>
      </div>
    </div>
  );
}
