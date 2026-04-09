import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import QuickViewModal from '../components/QuickViewModal';
import StockCheckerModal from '../components/StockCheckerModal';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
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
  
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);
  
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/products');
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      const sampleData = [
        { id: 1, name: "Laptop Enterprise v1", price: 24990000, category_name: "Máy tính", description: "Máy tính xách tay tiêu chuẩn", image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500", rating: 4.5, rating_count: 24, availability_status: "In Stock" },
        { id: 2, name: "Secure Token Gen2", price: 1200000, category_name: "Thiết bị bảo mật", description: "Thiết bị xác thực 2 lớp", image_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500", rating: 4.8, rating_count: 15, availability_status: "In Stock" },
        { id: 3, name: "Logistics Tablet", price: 8500000, category_name: "Máy tính", description: "Máy tính bảng kiểm kho", image_url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500", rating: 4.6, rating_count: 18, availability_status: "In Stock" },
        { id: 4, name: "Màn hình cong 34 inch", price: 15000000, category_name: "Màn hình", description: "Màn hình ultrawide", image_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500", rating: 4.7, rating_count: 22, availability_status: "Low Stock" },
        { id: 5, name: "Bàn phím cơ Silent", price: 2500000, category_name: "Thiết bị ngoại vi", description: "Bàn phím cơ chống ồn", image_url: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500", rating: 4.4, rating_count: 19, availability_status: "In Stock" },
        { id: 6, name: "Ghế công thái học", price: 4500000, category_name: "Thiết bị văn phòng", description: "Ghế lưới thoáng khí", image_url: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500", rating: 4.6, rating_count: 20, availability_status: "In Stock" },
        { id: 7, name: "Micro họp trực tuyến", price: 3200000, category_name: "Thiết bị ngoại vi", description: "Micro không dây đa hướng", image_url: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500", rating: 4.3, rating_count: 12, availability_status: "In Stock" },
        { id: 8, name: "Server Blade System", price: 120000000, category_name: "Phần cứng máy chủ", description: "Hệ thống máy chủ xử lý dữ liệu", image_url: "https://th.bing.com/th/id/OIP.wONyyIPQsX5iI_TKHF_x6wHaGM?w=203&h=180&c=7&r=0&o=7&dpr=1.1&pid=1.7&rm=3", rating: 4.8, rating_count: 8, availability_status: "Low Stock" },
        { id: 9, name: "Máy quét thẻ nhân viên", price: 800000, category_name: "Thiết bị bảo mật", description: "Thiết bị đọc mã vạch 2D", image_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500", rating: 4.7, rating_count: 16, availability_status: "In Stock" },
        { id: 10, name: "Tai nghe chống ồn", price: 1800000, category_name: "Thiết bị ngoại vi", description: "Tai nghe tích hợp mic lọc âm", image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", rating: 4.5, rating_count: 21, availability_status: "In Stock" }
      ];
      setProducts(sampleData);
      setFilteredProducts(sampleData);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      const sampleCategories = [
        { id: 1, name: 'Máy tính', icon: '💻' },
        { id: 2, name: 'Thiết bị ngoại vi', icon: '🖱️' },
        { id: 3, name: 'Màn hình', icon: '🖥️' },
        { id: 4, name: 'Phần cứng máy chủ', icon: '🔒' },
        { id: 5, name: 'Thiết bị văn phòng', icon: '🪑' },
        { id: 6, name: 'Thiết bị bảo mật', icon: '🔐' }
      ];
      setCategories(sampleCategories);
    }
  };
  
  useEffect(() => {
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
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };
  
  const getAvailabilityColor = (status) => {
    switch(status) {
      case 'In Stock': return 'text-green-600 bg-green-100';
      case 'Low Stock': return 'text-orange-600 bg-orange-100';
      case 'Out of Stock': return 'text-red-600 bg-red-100';
      case 'Pre-order': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold mb-2">📦 NexTrade Product Catalog</h1>
          <p className="text-blue-100">Discover enterprise solutions for your business</p>
        </div>
      </div>

      <div className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex gap-4 flex-wrap">
          <button className="px-4 py-2 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition">
            📦 Products
          </button>
          <Link to="/it-tools" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">
            🛠️ IT Tools
          </Link>
          <Link to="/hr" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition">
            🧑‍💼 HR Portal
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-xl shadow-lg p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">🔍 Filters</h3>
                <button
                  onClick={() => setAppliedFilters({ category: false, price: false, search: false })}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold text-sm mb-4"
                >
                  Reset All
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
                  <span className="font-semibold text-gray-700">Search by Name</span>
                </label>
                {appliedFilters.search && (
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <span className="font-semibold text-gray-700">Filter by Category</span>
                </label>
                {appliedFilters.category && (
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                        selectedCategory === null ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                          selectedCategory === cat.name ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {cat.icon} {cat.name}
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
                  <span className="font-semibold text-gray-700">Filter by Price</span>
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
                  Showing <span className="font-bold text-gray-800">{filteredProducts.length}</span> products
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
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
                          className={`absolute top-3 left-3 p-2 rounded-full transition ${
                            wishlist.includes(product.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          ❤️
                        </button>
                      </div>

                      <div className="p-4 space-y-3 flex-grow flex flex-col">
                        <div>
                          <p className="text-xs text-blue-600 font-semibold">{product.category_name}</p>
                          <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{product.name}</h3>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-sm">⭐ {product.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({product.rating_count} reviews)</span>
                        </div>

                        <div className="text-lg font-bold text-blue-900">{formatCurrency(product.price)}</div>

                        <div className="pt-2 space-y-2 mt-auto">
                          <Link
                            to={`/product/${product.id}`}
                            className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-center font-semibold hover:bg-blue-700 transition"
                          >
                            View Details
                          </Link>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setQuickViewProduct(product)}
                              className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold text-sm"
                            >
                              👁️ Quick View
                            </button>
                            <button
                              onClick={() => setStockCheckerProduct(product)}
                              className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-semibold text-sm"
                            >
                              📊 Check Stock
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <p className="text-xl text-gray-500">No products found matching your filters.</p>
                </div>
              )}
            </>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default ProductCatalog;
