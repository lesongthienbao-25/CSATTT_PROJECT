import { NavLink } from 'react-router-dom';

const linkStyle = {
  display: 'block',
  padding: '12px 18px',
  margin: '8px 0',
  borderRadius: '8px',
  textDecoration: 'none',
  color: '#2c3e50',
};

const activeStyle = {
  backgroundColor: '#3498db',
  color: 'white',
};

export default function Sidebar() {
  return (
    <div style={{ width: '220px', background: '#ffffff', borderRight: '1px solid #e0e0e0', padding: '24px' }}>
      <h2 style={{ margin: 0, color: '#2c3e50' }}>NexTrade Portal</h2>
      <p style={{ color: '#7f8c8d', marginTop: '10px' }}>Thử nghiệm HR & document</p>
      <nav style={{ marginTop: '24px' }}>
        <NavLink to="/" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
          Dashboard
        </NavLink>
        <NavLink to="/hr" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
          HR Portal
        </NavLink>
        <NavLink to="/documents" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
          Document Manager
        </NavLink>
        <NavLink to="/upload" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
          Profile Upload
        </NavLink>
        <NavLink to="/login" style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}>
          Login
        </NavLink>
      </nav>
    </div>
  );
}
