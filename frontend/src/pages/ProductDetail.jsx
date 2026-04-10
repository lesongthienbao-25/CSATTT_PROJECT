import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import StockCheckerModal from '../components/StockCheckerModal';

const ProductDetail = () => {
  const { id } = useParams();
  const productId = parseInt(id);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [showStockChecker, setShowStockChecker] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);

  // Đọc currentUser từ sessionStorage
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  
  // Form states
  const [reviewForm, setReviewForm] = useState({
    author: '',
    content: '',
    rating: 5
  });

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [productId]);

  // ĐÃ TRẢ LẠI CODE LẤY SẢN PHẨM GỐC CỦA NHÓM ÔNG (ĐẢM BẢO KHÔNG BỊ "NOT FOUND")
  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();
      setProduct(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`);
      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.content) return; 

    // Bẫy Stored XSS: Cập nhật lên màn hình ngay lập tức cho mượt
    const newReview = {
      id: Date.now(),
      author: reviewForm.author || "Anonymous",
      rating: reviewForm.rating,
      content: reviewForm.content, 
      created_at: new Date().toISOString()
    };
    
    setReviews([newReview, ...reviews]);

    try {
      // ĐÂY LÀ CHỖ LƯU NHƯ WEB THẬT: Gửi thẳng lên Database của Docker
      await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          author: reviewForm.author || 'Anonymous',
          content: reviewForm.content,
          rating: reviewForm.rating
        })
      });
      // Xóa trống form
      setReviewForm({ author: '', content: '', rating: 5 });
    } catch (error) {
      console.error('Error posting review:', error);
      setReviewForm({ author: '', content: '', rating: 5 });
    }
  };

  const handleDeleteReview = async (reviewId) => {
    setReviews(reviews.filter(r => r.id !== reviewId));
    try {
      await fetch(`/api/products/${productId}/reviews/${reviewId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  const addToCart = () => {
    alert(`Added ${quantity} x ${product.name} to cart`);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (product && product.employees && Array.isArray(product.employees)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link to="/products" className="text-blue-600 hover:text-blue-700 underline mb-4 block">
            ← Back to Products
          </Link>
          
          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 mb-6">
            <h1 className="text-2xl font-bold text-red-700 mb-2">⚠️ IDOR VULNERABILITY DETECTED</h1>
            <p className="text-red-600">Leaked Employee Salary Data - 10 Nhân viên</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Họ và tên</th>
                  <th className="px-4 py-3 text-left">Phòng ban</th>
                  <th className="px-4 py-3 text-left">Chức vụ</th>
                  <th className="px-4 py-3 text-right">Lương</th>
                  <th className="px-4 py-3 text-left">Điện thoại</th>
                  <th className="px-4 py-3 text-left">Ngày sinh</th>
                  <th className="px-4 py-3 text-left">Địa chỉ</th>
                  <th className="px-4 py-3 text-left">Nơi sinh</th>
                </tr>
              </thead>
              <tbody>
                {product.employees.map((emp, idx) => (
                  <tr key={emp.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3 border-b">{emp.id}</td>
                    <td className="px-4 py-3 border-b font-semibold">{emp.full_name}</td>
                    <td className="px-4 py-3 border-b">{emp.department}</td>
                    <td className="px-4 py-3 border-b">{emp.position}</td>
                    <td className="px-4 py-3 border-b text-right font-bold text-red-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(emp.salary)}
                    </td>
                    <td className="px-4 py-3 border-b">{emp.phone}</td>
                    <td className="px-4 py-3 border-b">{emp.birth_date}</td>
                    <td className="px-4 py-3 border-b">{emp.address}</td>
                    <td className="px-4 py-3 border-b">{emp.birthplace}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (!product || product.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Product not found</h1>
          <Link to="/products" className="text-blue-600 hover:text-blue-700 underline">
            Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Breadcrumb - CÓ BẪY REFLECTED XSS Ở ĐÂY */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex gap-2 text-sm items-center">
          <Link to="/" className="text-blue-600 hover:text-blue-700">Home</Link>
          <span className="text-gray-400">/</span>
          <Link to="/products" className="text-blue-600 hover:text-blue-700">Products</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{product.name}</span>
          
          {/* Lỗi Reflected XSS: Lấy chữ từ thanh URL in thẳng ra màn hình */}
          {new URLSearchParams(window.location.search).get('msg') && (
            <span className="ml-2 font-bold text-red-500" 
                  dangerouslySetInnerHTML={{ __html: new URLSearchParams(window.location.search).get('msg') }}>
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-24">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-blue-600 font-semibold">{product.category_name}</p>
              <h1 className="text-3xl font-bold text-gray-800 mt-2">{product.name}</h1>
              
              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-1">
                  <span className="text-2xl">⭐ {product.rating.toFixed(1)}</span>
                  <span className="text-gray-500">({product.rating_count} reviews)</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-4xl font-bold text-blue-900">{formatCurrency(product.price)}</p>
              </div>

              <div className={`mt-4 inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                product.availability_status === 'In Stock' ? 'bg-green-100 text-green-800' :
                product.availability_status === 'Low Stock' ? 'bg-orange-100 text-orange-800' :
                product.availability_status === 'Out of Stock' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {product.availability_status}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="px-6 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={addToCart}
                  disabled={product.availability_status === 'Out of Stock'}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  🛒 Add to Cart
                </button>
                <button
                  onClick={() => setInWishlist(!inWishlist)}
                  className={`px-6 py-3 rounded-lg font-semibold transition ${
                    inWishlist
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {inWishlist ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
                </button>
              </div>

              <button
                onClick={() => setShowStockChecker(true)}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                📊 Check Regional Stock
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Customer Reviews</h2>

          {/* POST REVIEW FORM */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-8 border border-blue-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Share Your Review</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your name (or leave anonymous)"
                value={reviewForm.author}
                onChange={(e) => setReviewForm({...reviewForm, author: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <textarea
                placeholder="Share your experience... (Try: <img src=x onerror=alert('XSS')> for security testing)"
                value={reviewForm.content}
                onChange={(e) => setReviewForm({...reviewForm, content: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 font-mono text-sm"
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
                  <option value={4}>⭐⭐⭐⭐ Good</option>
                  <option value={3}>⭐⭐⭐ Average</option>
                  <option value={2}>⭐⭐ Poor</option>
                  <option value={1}>⭐ Very Poor</option>
                </select>
              </div>

              <button
                onClick={handlePostReview}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Post Review
              </button>

              <p className="text-xs text-blue-700 bg-blue-50 p-3 rounded">
                💡 Note: Reviews are vulnerable to Stored XSS for security testing purposes. Do not post sensitive data.
              </p>
            </div>
          </div>

          {/* REVIEWS LIST - CÓ BẪY STORED XSS Ở ĐÂY */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800">Recent Reviews ({reviews.length})</h3>
            {reviews.length > 0 ? (
              reviews.map(review => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{review.author}</p>
                      <p className="text-sm text-gray-500">Rating: {'⭐'.repeat(review.rating)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</p>
                      {currentUser?.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition font-semibold"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* LỖI STORED XSS TRỰC TIẾP Ở ĐÂY */}
                  <div 
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: review.content }}
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        </div>
      </div>

      {showStockChecker && (
        <StockCheckerModal
          product={product}
          onClose={() => setShowStockChecker(false)}
        />
      )}
    </div>
  );
};

export default ProductDetail;
