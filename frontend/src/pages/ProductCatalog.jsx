import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ProductCatalog = () => {
  const [products, setProducts] = useState([
    { id: 1, name: "Laptop Enterprise v1", price: "24.990.000đ", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300", desc: "Máy tính xách tay tiêu chuẩn." },
    { id: 2, name: "Secure Token Gen2", price: "1.200.000đ", img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=300", desc: "Thiết bị xác thực 2 lớp." },
    { id: 3, name: "Logistics Tablet", price: "8.500.000đ", img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300", desc: "Máy tính bảng kiểm kho." },
    { id: 4, name: "Màn hình cong 34 inch", price: "15.000.000đ", img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300", desc: "Màn hình cho phòng vận hành." },
    { id: 5, name: "Bàn phím cơ Silent", price: "2.500.000đ", img: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=300", desc: "Chống ồn văn phòng." },
    { id: 6, name: "Ghế công thái học", price: "4.500.000đ", img: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=300", desc: "Bảo vệ cột sống." },
    { id: 7, name: "Micro họp trực tuyến", price: "3.200.000đ", img: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300", desc: "Dành cho phòng họp." },
    { id: 8, name: "Server Blade System", price: "120.000.000đ", img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc4b?w=300", desc: "Máy chủ xử lý dữ liệu." },
    { id: 9, name: "Máy quét thẻ nhân viên", price: "800.000đ", img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300", desc: "Đọc mã vạch 2D." },
    { id: 10, name: "Tai nghe chống ồn", price: "1.800.000đ", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300", desc: "Dành cho phòng CSKH." }
  ]);
  
  const [search, setSearch] = useState('');

  const handleSearch = () => {
    // Kịch bản SQL Injection: Đẩy thẳng Password ra màn hình
    if (search.includes("' UNION SELECT")) {
      setProducts([
        { 
          id: 999, 
          name: "USER: admin (admin@nextrade.vn)", 
          price: "Pass: Admin@1234", 
          img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500", 
          desc: "Tài khoản quản trị cấp cao" 
        },
        { 
          id: 1000, 
          name: "USER: manager_nam (nam.nguyen@nextrade.vn)", 
          price: "Pass: Nam2025!", 
          img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500", 
          desc: "Tài khoản quản lý" 
        },
        ...products
      ]);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#f0f2f5', fontFamily: 'sans-serif', minHeight: '100vh' }}>
      <h1 style={{ color: '#001f3f', textAlign: 'center' }}>NexTrade - Danh mục Sản phẩm</h1>
      
      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <button style={{ 
          background: '#001f3f', 
          color: 'white', 
          padding: '8px 16px', 
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          📦 Products
        </button>
        <Link 
          to="/it-tools" 
          style={{ 
            display: 'inline-block',
            background: '#e7e7e7', 
            color: '#333', 
            padding: '8px 16px', 
            textDecoration: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🛠️ IT Tools
        </Link>
        <Link 
          to="/hr" 
          style={{ 
            display: 'inline-block',
            background: '#e7e7e7', 
            color: '#333', 
            padding: '8px 16px', 
            textDecoration: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🧑‍💼 HR Portal
        </Link>
      </div>

      {/* Thanh tìm kiếm */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', justifyContent: 'center' }}>
        <input 
          type="text" 
          placeholder="Tìm kiếm sản phẩm (' OR 1=1--)" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '400px', padding: '10px', border: '1px solid #ccc' }}
        />
        <button onClick={handleSearch} style={{ background: '#001f3f', color: 'white', padding: '10px 20px', cursor: 'pointer' }}>
          Tìm kiếm
        </button>
      </div>

      {/* Lưới sản phẩm */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {products.map(p => (
          <div key={p.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            {p.img && <img src={p.img} alt={p.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />}
            <h3 style={{ fontSize: '16px', color: '#333' }}>{p.name}</h3>
            <p style={{ color: 'red', fontWeight: 'bold' }}>{p.price}</p>
            <Link to={`/products/${p.id}`} style={{ display: 'block', textAlign: 'center', background: '#001f3f', color: 'white', padding: '8px', textDecoration: 'none', borderRadius: '4px' }}>
              Xem chi tiết
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCatalog;
