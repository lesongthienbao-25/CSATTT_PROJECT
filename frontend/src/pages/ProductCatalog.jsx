import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import QuickViewModal from '../components/QuickViewModal';
import StockCheckerModal from '../components/StockCheckerModal';
import ChatModal from '../components/ChatModal';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  const [currentUser, setCurrentUser] = useState(() => {
  const saved = sessionStorage.getItem('currentUser');
  return saved ? JSON.parse(saved) : null;
}); 
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = sessionStorage.getItem('registeredUsers');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [appliedFilters, setAppliedFilters] = useState({
    category: false,
    price: false,
    search: false
  });
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 150000000]);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [stockCheckerProduct, setStockCheckerProduct] = useState(null);
  
  const [wishlist, setWishlist] = useState([]);
  const [showChatModal, setShowChatModal] = useState(false);

  // DANH SÁCH TÀI KHOẢN GIẢ LẬP
  const validAccounts = [
    { username: 'admin', password: 'Admin@1234', role: 'admin', name: 'Quản trị viên' },
    { username: 'khach1', password: '123456', role: 'customer', name: 'Khách hàng 1' },
    { username: 'khach2', password: '123456', role: 'customer', name: 'Khách hàng 2' },
    { username: 'khach3', password: '123456', role: 'customer', name: 'Khách hàng 3' },
    { username: 'khach4', password: '123456', role: 'customer', name: 'Khách hàng 4' },
    { username: 'khach5', password: '123456', role: 'customer', name: 'Khách VIP' },
  ];

  const handleLogin = (e) => {
  e.preventDefault();
  let user = validAccounts.find(u => u.username === usernameInput && u.password === passwordInput);
  
  // Check registered users if not found in valid accounts
  if (!user) {
    user = registeredUsers.find(u => u.username === usernameInput && u.password === passwordInput);
  }
  
  if (user) {
    setCurrentUser(user);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    setShowLoginModal(false);
    setUsernameInput('');
    setPasswordInput('');
    setLoginError('');
  } else {
    setLoginError('Sai tên đăng nhập hoặc mật khẩu!');
  }
};

 const handleLogout = () => {
  setCurrentUser(null);
  sessionStorage.removeItem('currentUser');
};

  const handleSignup = (e) => {
    e.preventDefault();
    setSignupError('');
    
    if (!signupUsername || !signupPassword) {
      setSignupError('Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }

    if (signupUsername.length < 3) {
      setSignupError('Tên đăng nhập phải có ít nhất 3 ký tự');
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    // Check if username already exists
    const userExists = registeredUsers.some(u => u.username === signupUsername) || 
                       validAccounts.some(u => u.username === signupUsername);
    
    if (userExists) {
      setSignupError('Tên đăng nhập đã tồn tại');
      return;
    }

    // Create new user
    const newUser = {
      username: signupUsername,
      password: signupPassword,
      role: 'customer',
      name: signupUsername
    };

    // Save to registered users list
    const updatedUsers = [...registeredUsers, newUser];
    setRegisteredUsers(updatedUsers);
    sessionStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

    // Auto login
    setCurrentUser(newUser);
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));

    // Close modal and reset
    setShowSignupModal(false);
    setSignupUsername('');
    setSignupPassword('');
  };
  
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);
  
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      const sampleData = [
        { id: 1, name: "Laptop Enterprise v1", price: 24990000, category_name: "Máy tính", description: "Máy tính xách tay tiêu chuẩn", image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500", rating: 4.5, rating_count: 24, availability_status: "Còn hàng" },
        { id: 2, name: "Secure Token Gen2", price: 1200000, category_name: "Thiết bị bảo mật", description: "Thiết bị xác thực 2 lớp", image_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500", rating: 4.8, rating_count: 15, availability_status: "Còn hàng" },
        { id: 3, name: "Logistics Tablet", price: 8500000, category_name: "Máy tính", description: "Máy tính bảng kiểm kho", image_url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500", rating: 4.6, rating_count: 18, availability_status: "Còn hàng" },
        { id: 4, name: "Màn hình cong 34 inch", price: 15000000, category_name: "Màn hình", description: "Màn hình ultrawide", image_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500", rating: 4.7, rating_count: 22, availability_status: "Sắp hết" },
        { id: 5, name: "Bàn phím cơ Silent", price: 2500000, category_name: "Thiết bị ngoại vi", description: "Bàn phím cơ chống ồn", image_url: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500", rating: 4.4, rating_count: 19, availability_status: "Còn hàng" },
        { id: 6, name: "Ghế công thái học", price: 4500000, category_name: "Thiết bị văn phòng", description: "Ghế lưới thoáng khí", image_url: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500", rating: 4.6, rating_count: 20, availability_status: "Còn hàng" },
        { id: 7, name: "Micro họp trực tuyến", price: 3200000, category_name: "Thiết bị ngoại vi", description: "Micro không dây đa hướng", image_url: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500", rating: 4.3, rating_count: 12, availability_status: "Còn hàng" },
        { id: 8, name: "Server Blade System", price: 120000000, category_name: "Phần cứng máy chủ", description: "Hệ thống máy chủ xử lý dữ liệu", image_url: "https://th.bing.com/th/id/OIP.wONyyIPQsX5iI_TKHF_x6wHaGM?w=203&h=180&c=7&r=0&o=7&dpr=1.1&pid=1.7&rm=3", rating: 4.8, rating_count: 8, availability_status: "Sắp hết" },
        { id: 9, name: "Máy quét thẻ nhân viên", price: 800000, category_name: "Thiết bị bảo mật", description: "Thiết bị đọc mã vạch 2D", image_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500", rating: 4.7, rating_count: 16, availability_status: "Còn hàng" },
        { id: 10, name: "Tai nghe chống ồn", price: 1800000, category_name: "Thiết bị ngoại vi", description: "Tai nghe tích hợp mic lọc âm", image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", rating: 4.5, rating_count: 21, availability_status: "Còn hàng" }
      ];
      setProducts(sampleData);
      setFilteredProducts(sampleData);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      const sampleCategories = [
        { id: 1, name: 'Máy tính' },
        { id: 2, name: 'Thiết bị ngoại vi' },
        { id: 3, name: 'Màn hình' },
        { id: 4, name: 'Phần cứng máy chủ' },
        { id: 5, name: 'Thiết bị văn phòng' },
        { id: 6, name: 'Thiết bị bảo mật' }
      ];
      setCategories(sampleCategories);
    }
  };
  
  useEffect(() => {
    // BẪY SQL INJECTION
    if (appliedFilters.search && searchQuery.includes("' UNION SELECT")) {
      setFilteredProducts([
        { 
          id: 999, 
          name: "TÀI KHOẢN: admin | MẬT KHẨU: Admin@1234", 
          price: 0, 
          category_name: "DỮ LIỆU RÒ RỈ", 
          description: "Tài khoản quản trị cấp cao (admin@nextrade.vn)", 
          image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500", 
          rating: 5, 
          rating_count: 999, 
          availability_status: "BỊ HACK" 
        },
        { 
          id: 1000, 
          name: "TÀI KHOẢN: manager_nam | MẬT KHẨU: Nam2025!", 
          price: 0, 
          category_name: "DỮ LIỆU RÒ RỈ", 
          description: "Tài khoản quản lý (nam.nguyen@nextrade.vn)", 
          image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500", 
          rating: 5, 
          rating_count: 999, 
          availability_status: "BỊ HACK" 
        }
      ]);
      return; 
    }

    let results = [...products];
    
    if (appliedFilters.category && selectedCategory) {
      results = results.filter(p => p.category_name === selectedCategory);
    }
    
    if (appliedFilters.price) {
      results = results.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    }
    
    if (appliedFilters.search && searchQuery) {
      results = results.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    switch (sortBy) {
      case 'price_asc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    setFilteredProducts(results);
  }, [products, appliedFilters, selectedCategory, priceRange, searchQuery, sortBy]);
  
  const toggleWishlist = (productId) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
  };
  
  const formatCurrency = (price) => {
    if (price === 0) return "DỮ LIỆU NHẠY CẢM"; 
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };
  
  const getAvailabilityColor = (status) => {
    switch(status) {
      case 'Còn hàng': return 'text-green-600 bg-green-100';
      case 'Sắp hết': return 'text-orange-600 bg-orange-100';
      case 'Hết hàng': return 'text-red-600 bg-red-100';
      case 'Đặt trước': return 'text-blue-600 bg-blue-100';
      case 'BỊ HACK': return 'text-white bg-red-600 animate-pulse'; 
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 relative">
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold mb-2">Danh mục sản phẩm 7CHO COMPANY</h1>
          <p className="text-blue-100">Khám phá các giải pháp công nghệ tối ưu cho doanh nghiệp</p>
        </div>
      </div>

      <div className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition">
              Sản phẩm
            </button>
            
            {currentUser?.role === 'admin' && (
              <>
                <Link to="/it-tools" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">
                  Công cụ IT
                </Link>
                <Link to="/hr" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">
                  Cổng Nhân sự
                </Link>
              </>
            )}
          </div>

          <div>
            {currentUser ? (
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-700">
                  Xin chào, <span className={currentUser.role === 'admin' ? 'text-red-600' : 'text-blue-600'}>{currentUser.name}</span>
                </span>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg font-bold shadow transition-all text-sm"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 rounded-lg font-bold shadow transition-all text-sm"
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={() => setShowSignupModal(true)}
                  className="px-4 py-2 bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 rounded-lg font-bold shadow transition-all text-sm"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-xl shadow-lg p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Bộ lọc</h3>
                <button
                  onClick={() => setAppliedFilters({ category: false, price: false, search: false })}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold text-sm mb-4"
                >
                  Xóa bộ lọc
                </button>
              </div>

              <div className="border-b pb-4">
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appliedFilters.search}
                    onChange={(e) => setAppliedFilters({...appliedFilters, search: e.target.checked})}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="font-semibold text-gray-700">Tìm kiếm theo tên</span>
                </label>
                {appliedFilters.search && (
                  <input
                    type="text"
                    placeholder="Nhập tên sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                )}
              </div>

              <div className="border-b pb-4">
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appliedFilters.category}
                    onChange={(e) => setAppliedFilters({...appliedFilters, category: e.target.checked})}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="font-semibold text-gray-700">Lọc theo danh mục</span>
                </label>
                {appliedFilters.category && (
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                        selectedCategory === null ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      Tất cả danh mục
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                          selectedCategory === cat.name ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={appliedFilters.price}
                    onChange={(e) => setAppliedFilters({...appliedFilters, price: e.target.checked})}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="font-semibold text-gray-700">Lọc theo giá</span>
                </label>
                {appliedFilters.price && (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="150000000"
                      step="1000000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="150000000"
                      step="1000000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{formatCurrency(priceRange[0])}</span>
                      <span>-</span>
                      <span>{formatCurrency(priceRange[1])}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <>
              <div className="flex justify-between items-center mb-6">
               <div className="text-gray-600">
  {appliedFilters.search && searchQuery && (
    <div className="mb-2">
      Kết quả tìm kiếm cho: <span className="font-bold text-red-600" dangerouslySetInnerHTML={{ __html: searchQuery }}></span>
    </div>
  )}
  Đang hiển thị <span className="font-bold text-gray-800">{filteredProducts.length}</span> sản phẩm
</div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá: Thấp đến Cao</option>
                  <option value="price_desc">Giá: Cao đến Thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden group flex flex-col h-full">
                      <div className="relative overflow-hidden bg-gray-200 h-48">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getAvailabilityColor(product.availability_status)}`}>
                          {product.availability_status}
                        </div>
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full transition ${
                            wishlist.includes(product.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-100 shadow'
                          }`}
                        >
                          Yêu thích
                        </button>
                      </div>

                      <div className="p-4 space-y-3 flex-grow flex flex-col">
                        <div>
                          <p className="text-xs text-blue-600 font-semibold uppercase">{product.category_name}</p>
                          <h3 className="font-bold text-gray-800 text-sm line-clamp-2 mt-1">{product.name}</h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{product.description}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold text-yellow-500">{product.rating.toFixed(1)} Điểm</span>
                          <span className="text-xs text-gray-500">({product.rating_count} đánh giá)</span>
                        </div>

                        <div className="text-lg font-bold text-blue-900">{formatCurrency(product.price)}</div>

                        <div className="pt-2 space-y-2 mt-auto">
                          <Link
                            to={`/product/${product.id}`}
                            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-center font-semibold hover:bg-blue-700 transition text-sm"
                          >
                            Xem chi tiết
                          </Link>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setQuickViewProduct(product)}
                              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold text-xs border border-gray-200"
                            >
                              Xem nhanh
                            </button>
                            <button
                              onClick={() => setStockCheckerProduct(product)}
                              className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold text-xs border border-gray-200"
                            >
                              Tồn kho
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <p className="text-lg text-gray-500 font-medium">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
                </div>
              )}
            </>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-96 max-w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Đăng nhập hệ thống</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên đăng nhập</label>
                <input 
                  type="text" 
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="Nhập tài khoản..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu</label>
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="Nhập mật khẩu..."
                  required
                />
              </div>
              {loginError && <p className="text-red-500 text-sm font-semibold text-center">{loginError}</p>}
              <button 
                type="submit" 
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
              >
                Đăng nhập
              </button>
            </form>
            <button 
              onClick={() => setShowLoginModal(false)}
              className="w-full mt-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition font-semibold text-sm"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {showSignupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-96 max-w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Đăng ký tài khoản</h2>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên đăng nhập</label>
                <input 
                  type="text" 
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
                  placeholder="Nhập tên đăng nhập (ít nhất 3 ký tự)..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu</label>
                <input 
                  type="password" 
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
                  placeholder="Nhập mật khẩu (ít nhất 6 ký tự)..."
                  required
                />
              </div>
              {signupError && <p className="text-red-500 text-sm font-semibold text-center">{signupError}</p>}
              <button 
                type="submit" 
                className="w-full py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
              >
                Đăng ký
              </button>
            </form>
            <button 
              onClick={() => {
                setShowSignupModal(false);
                setSignupUsername('');
                setSignupPassword('');
                setSignupError('');
              }}
              className="w-full mt-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition font-semibold text-sm"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {stockCheckerProduct && (
        <StockCheckerModal
          product={stockCheckerProduct}
          onClose={() => setStockCheckerProduct(null)}
        />
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChatModal(!showChatModal)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: showChatModal ? 'calc(420px + 40px)' : '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#001f3f',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
          fontSize: '28px',
          zIndex: 9998,
          transition: 'right 0.3s ease',
        }}
        title="Open Chat Support"
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Modal */}
      <ChatModal isOpen={showChatModal} onClose={() => setShowChatModal(false)} />
    </div>
  );
};

export default ProductCatalog;