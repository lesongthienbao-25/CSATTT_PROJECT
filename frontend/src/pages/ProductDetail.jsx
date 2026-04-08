import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();
  const productId = parseInt(id);

  // 1. Kho dữ liệu sản phẩm (Đồng bộ với Catalog)
  const productDatabase = [
    { id: 1, name: "Laptop Enterprise v1", price: "24.990.000đ", img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500", desc: "Máy tính xách tay tiêu chuẩn cho nhân viên NexTrade. Tích hợp sẵn VPN nội bộ." },
    { id: 2, name: "Secure Token Gen2", price: "1.200.000đ", img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500", desc: "Thiết bị xác thực 2 lớp dùng để đăng nhập hệ thống nội bộ." },
    { id: 3, name: "Logistics Tablet", price: "8.500.000đ", img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500", desc: "Máy tính bảng kiểm kho chuyên dụng, chống sốc, chống nước." },
    { id: 4, name: "Màn hình cong 34 inch", price: "15.000.000đ", img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500", desc: "Màn hình ultrawide cho phòng vận hành logistics theo dõi bản đồ." },
    { id: 5, name: "Bàn phím cơ Silent", price: "2.500.000đ", img: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500", desc: "Bàn phím cơ chống ồn, phù hợp môi trường văn phòng đông người." },
    { id: 6, name: "Ghế công thái học", price: "4.500.000đ", img: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500", desc: "Ghế lưới thoáng khí, bảo vệ cột sống cho nhân viên ngồi lâu." },
    { id: 7, name: "Micro họp trực tuyến", price: "3.200.000đ", img: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500", desc: "Micro không dây đa hướng dành cho phòng họp công ty." },
    { id: 8, name: "Server Blade System", price: "120.000.000đ", img: "https://th.bing.com/th/id/OIP.wONyyIPQsX5iI_TKHF_x6wHaGM?w=203&h=180&c=7&r=0&o=7&dpr=1.1&pid=1.7&rm=3", desc: "Hệ thống máy chủ xử lý dữ liệu đơn hàng khối lượng lớn." },
    { id: 9, name: "Máy quét thẻ nhân viên", price: "800.000đ", img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500", desc: "Thiết bị đọc mã vạch 2D và thẻ từ RFID." },
    { id: 10, name: "Tai nghe chống ồn", price: "1.800.000đ", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", desc: "Tai nghe tích hợp mic lọc âm, chuyên dụng cho phòng CSKH." }
  ];

  // 2. Kho đánh giá riêng biệt cho từng sản phẩm
  const reviewsDatabase = {
    1: [
      { id: 101, user: "Nguyễn Văn Nam (IT)", content: "Máy chạy bộ Adobe mượt, pin dùng tầm 6 tiếng ổn.", star: 5 },
      { id: 102, user: "Trần Thị Lan (Kế toán)", content: "Bàn phím gõ êm, màn hình hơi ám xanh xíu.", star: 4 },
      { id: 103, user: "Hacker_Lord", content: "Máy này có lỗ hổng <img src=x onerror=alert('Pwned')> nè!", star: 1 },
      { id: 104, user: "Quản lý kho", content: "Hơi nặng khi mang đi công tác.", star: 3 }
    ],
    2: [
      { id: 201, user: "Admin Hệ thống", content: "Xác thực nhanh, chưa thấy lỗi đồng bộ.", star: 5 },
      { id: 202, user: "Lê Minh", content: "Vỏ nhựa hơi mỏng, sợ rơi là vỡ.", star: 3 },
      { id: 203, user: "Bảo mật viên", content: "Dùng cho MFA rất tốt, an tâm hơn hẳn.", star: 5 },
      { id: 204, user: "Nhân viên mới", content: "Nhỏ gọn, dễ cài đặt.", star: 4 }
    ],
    3: [
      { id: 301, user: "Đội Vận chuyển", content: "Quét mã vạch siêu nhạy, rơi từ độ cao 1m vẫn chạy tốt.", star: 5 },
      { id: 302, user: "Huy Logistics", content: "Màn hình sáng, ra nắng vẫn nhìn rõ đơn hàng.", star: 5 },
      { id: 303, user: "Anh tài xế", content: "Cảm ứng đôi khi hơi lag khi dùng găng tay.", star: 3 },
      { id: 304, user: "Sếp Tổng", content: "Đầu tư đáng tiền cho bộ phận kho.", star: 5 }
    ],
    4: [
      { id: 401, user: "Designer NexTrade", content: "Màu chuẩn 99% sRGB, làm đồ họa bao phê.", star: 5 },
      { id: 402, user: "Hoàng IT", content: "Chia đôi màn hình code cực sướng.", star: 5 },
      { id: 403, user: "Trực ca đêm", content: "Có chế độ lọc ánh sáng xanh, không mỏi mắt.", star: 4 },
      { id: 404, user: "Khách tham quan", content: "Nhìn chuyên nghiệp, văn phòng sang hẳn lên.", star: 5 }
    ],
    5: [
        { id: 501, user: "Trung UEH", content: "Phím gõ sướng tay, không gây tiếng ồn cho đồng nghiệp.", star: 5 },
        { id: 502, user: "Thư ký tòa soạn", content: "Cảm giác bấm rất chắc chắn, led đơn giản đẹp.", star: 4 },
        { id: 503, user: "Game thủ nửa mùa", content: "Dùng để gõ báo cáo thì được, chơi game hơi chậm.", star: 3 },
        { id: 504, user: "Kỹ thuật viên", content: "Bền, chống nước nhẹ.", star: 5 }
    ],
    6: [
        { id: 601, user: "Bác sĩ xương khớp", content: "Thiết kế tốt cho cột sống nhân viên văn phòng.", star: 5 },
        { id: 602, user: "Chị Hạnh HR", content: "Ngồi cả ngày không thấy mỏi lưng.", star: 5 },
        { id: 603, user: "Anh béo", content: "Chân đế hơi yếu khi ngả lưng sâu.", star: 3 },
        { id: 604, user: "Nhân viên lâu năm", content: "Ước gì công ty trang bị cho cả phòng sớm hơn.", star: 5 }
    ],
    7: [
        { id: 701, user: "Trưởng phòng họp", content: "Bắt tiếng xa 5m vẫn rõ, lọc nhiễu tốt.", star: 5 },
        { id: 702, user: "Kỹ thuật Zoom", content: "Cắm là chạy, không cần cài driver phức tạp.", star: 5 },
        { id: 703, user: "Thành viên họp", content: "Thỉnh thoảng bị hú nếu để gần loa.", star: 2 },
        { id: 704, user: "Admin", content: "Thiết kế sang trọng cho phòng khách.", star: 4 }
    ],
    8: [
        { id: 801, user: "CTO NexTrade", content: "Hiệu năng vượt trội, xử lý 1 triệu đơn hàng/giây mượt.", star: 5 },
        { id: 802, user: "Data Engineer", content: "Dễ dàng bảo trì và thay thế nóng linh kiện.", star: 5 },
        { id: 803, user: "Anh trực phòng Server", content: "Quạt kêu hơi to, đứng cạnh đau tai.", star: 3 },
        { id: 804, user: "Auditor", content: "Đầy đủ log và tính năng bảo mật.", star: 4 }
    ],
    9: [
        { id: 901, user: "Lễ tân", content: "Nhận diện thẻ nhanh dưới 0.5 giây.", star: 5 },
        { id: 902, user: "Bảo vệ", content: "Máy bền, hoạt động 24/7 không lỗi.", star: 5 },
        { id: 903, user: "Nhân viên quên thẻ", content: "Giá như tích hợp luôn khuôn mặt.", star: 3 },
        { id: 904, user: "IT Support", content: "Kết nối LAN ổn định.", star: 4 }
    ],
    10: [
        { id: 1001, user: "Tư vấn viên", content: "Khử tiếng ồn xung quanh cực tốt khi gọi cho khách.", star: 5 },
        { id: 1002, user: "Học viên", content: "Đeo cả ca 8 tiếng không bị đau tai.", star: 5 },
        { id: 1003, user: "Cộng tác viên", content: "Dây hơi ngắn, bất tiện khi đứng dậy.", star: 3 },
        { id: 1004, user: "Phòng đào tạo", content: "Âm thanh rõ ràng, mic nhạy.", star: 5 }
    ]
  };

  const currentProduct = productDatabase.find(p => p.id === productId);
  
  // State quản lý danh sách đánh giá hiện tại (Lấy từ database theo ID)
  const [reviews, setReviews] = useState([]);
  const [inputName, setInputName] = useState('');
  const [inputContent, setInputContent] = useState('');

  // Tự động cập nhật đánh giá khi ID sản phẩm thay đổi
useEffect(() => {
    // Gọi Endpoint phụ: Lấy danh sách reviews từ Database
    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/products/reviews/${productId}`);
        const data = await response.json();
        setReviews(data); // Backend trả JSON bình thường, Frontend tự dính đòn XSS vì dùng innerHTML
      } catch (error) {
        console.error("Lỗi lấy review:", error);
      }
    };
    fetchReviews();
  }, [productId]);

  const handlePostReview = async () => {
    if (!inputContent) return;
    
    try {
      // Gọi Endpoint 2: Gửi POST kèm nội dung có mã độc
      await fetch('http://localhost:8000/api/products/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          author: inputName || "Ẩn danh",
          content: inputContent, // Chỗ này nhập <script>alert(document.cookie)</script>
          star: 5
        })
      });

      // Gửi thành công thì xóa ô nhập và load lại danh sách để popup tự nổ
      setInputContent('');
      // Gọi lại API lấy review để cập nhật màn hình
      const res = await fetch(`http://localhost:8000/api/products/reviews/${productId}`);
      setReviews(await res.json());
      
    } catch (error) {
      console.error("Lỗi gửi review:", error);
    }
  };

  if (!currentProduct) return <div style={{padding: '50px', textAlign: 'center'}}>Sản phẩm không tồn tại!</div>;

  return (
    <div style={{ background: '#f4f7f9', minHeight: '100vh', padding: '40px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '950px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        
        {/* THÔNG TIN SẢN PHẨM */}
        <div style={{ display: 'flex', gap: '40px', borderBottom: '2px solid #eee', paddingBottom: '30px', marginBottom: '30px' }}>
          <img src={currentProduct.img} style={{ width: '380px', height: '280px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} alt="Detail" />
          <div style={{ flex: 1 }}>
            <h1 style={{ color: '#001f3f', margin: '0 0 15px 0' }}>{currentProduct.name}</h1>
            <p style={{ color: '#d70018', fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>{currentProduct.price}</p>
            <p style={{ color: '#555', lineHeight: '1.7', fontSize: '15px' }}>{currentProduct.desc}</p>
            <div style={{ marginTop: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>
              <p style={{ margin: '5px 0' }}><strong>Mã tài sản:</strong> NX-{currentProduct.id}</p>
              <p style={{ margin: '5px 0' }}><strong>Phòng ban:</strong> Vật tư Logistics</p>
            </div>
          </div>
        </div>

        {/* FORM GỬI ĐÁNH GIÁ (TEST XSS) */}
        <div style={{ background: '#001f3f0d', padding: '25px', borderRadius: '10px', marginBottom: '40px' }}>
          <h3 style={{ color: '#001f3f', marginTop: 0 }}>Gửi phản hồi nội bộ</h3>
          <input 
            type="text" placeholder="Họ tên nhân viên..." 
            value={inputName} onChange={(e) => setInputName(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '12px', border: '1px solid #ccc', borderRadius: '6px' }} 
          />
          <textarea 
            placeholder="Nội dung phản hồi (Dùng để kiểm thử bảo mật)..." 
            value={inputContent} onChange={(e) => setInputContent(e.target.value)}
            style={{ width: '100%', padding: '12px', height: '90px', marginBottom: '12px', border: '1px solid #ccc', borderRadius: '6px' }}
          ></textarea>
          <button 
            onClick={handlePostReview}
            style={{ width: '100%', background: '#001f3f', color: 'white', padding: '14px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          > Gửi Đánh Giá </button>
        </div>

        {/* DANH SÁCH ĐÁNH GIÁ - LỖ HỔNG XSS Ở ĐÂY */}
        <div>
          <h3 style={{ borderLeft: '5px solid #001f3f', paddingLeft: '15px', color: '#001f3f' }}>Phản hồi từ nhân viên ({reviews.length})</h3>
          {reviews.map(r => (
            <div key={r.id} style={{ padding: '20px 0', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '16px' }}>{r.user}</strong>
                <span style={{ color: '#f39c12' }}>{'★'.repeat(r.star || 5)}</span>
              </div>
              {/* VŨ KHÍ XSS: dangerouslySetInnerHTML */}
              <div 
                style={{ marginTop: '10px', color: '#444', lineHeight: '1.5' }} 
                dangerouslySetInnerHTML={{ __html: r.content }} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;