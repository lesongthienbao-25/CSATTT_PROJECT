import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProductCatalog = () => {
    const [products, setProducts] = useState([
    { id: 1, name: "Laptop Acer Nitro 5", price: "24.990.000đ", description: "Máy cực xịn cho dân ATTT UEH." },
    { id: 2, name: "iPhone 15 Pro Max", price: "34.990.000đ", description: "Hàng chính hãng test XSS." },
    { id: 3, name: "Bàn phím cơ AKKO", price: "1.500.000đ", description: "Switch gõ cực mượt." }
  ]);
    const [search, setSearch] = useState('');

    const fetchProducts = async (query = '') => {
        // Gọi API search có chứa lỗ hổng SQL Injection [cite: 214, 233]
        const res = await fetch(`http://localhost:8000/api/products/search?q=${query}`);
        const data = await res.json();
        setProducts(data);
    };

    

    return (
       
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Danh mục sản phẩm</h1>
            <div className="flex gap-2 mb-6">
                <input 
                    type="text" 
                    className="border p-2 w-full text-black" 
                    placeholder="Tìm kiếm sản phẩm..." 
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button 
                    className="bg-blue-500 text-white px-4 py-2"
                    onClick={() => fetchProducts(search)}
                > Tìm kiếm </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded shadow-lg bg-white">
            <h2 className="text-xl font-bold text-black">{product.name}</h2>
            <p className="text-blue-600 font-semibold">{product.price}</p>
            <p className="text-gray-500 text-sm mb-4">{product.description}</p>
            <Link 
              to={`/products/${product.id}`} 
              className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Xem chi tiết
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCatalog;